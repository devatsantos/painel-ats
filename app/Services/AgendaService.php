<?php

namespace App\Services;

use App\Models\BloqueioAgenda;
use App\Models\Entrevista;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AgendaService
{
    /**
     * Retorna a configuração ativa da agenda ou um fallback padrão seguro.
     */
    public function getSettings()
    {
        static $settings = null;
        if ($settings === null) {
            try {
                $settings = \App\Models\ConfiguracaoAgenda::first();
            } catch (\Throwable $e) {
                Log::warning('AgendaService: Erro ao obter configurações do banco, utilizando fallbacks.', ['erro' => $e->getMessage()]);
            }

            if (!$settings) {
                $settings = new \App\Models\ConfiguracaoAgenda([
                    'hora_inicio'       => '08:00',
                    'hora_fim'          => '10:00',
                    'intervalo_minutos' => 15,
                ]);
            }
        }
        return $settings;
    }

    /**
     * Retorna os slots disponíveis para uma data no formato 'H:i'.
     * Retorna array vazio se a data for inválida (fds, feriado, fora de range).
     */
    public function slotsDisponiveis(string $data): array
    {
        $carbon = Carbon::createFromFormat('Y-m-d', $data)->startOfDay();

        if (!$this->diaValido($carbon)) {
            return [];
        }

        $todosSlots   = $this->gerarSlots($carbon);
        $ocupados     = $this->slotsOcupados($carbon);
        $bloqueados   = $this->slotsBloqueados($carbon);

        return array_values(
            array_filter($todosSlots, fn($slot) =>
                !in_array($slot, $ocupados) && !in_array($slot, $bloqueados)
            )
        );
    }

    /**
     * Valiga se um Carbon datetime está em um slot disponível.
     */
    public function validarSlot(Carbon $dataHora): bool
    {
        $data = $dataHora->format('Y-m-d');
        $hora = $dataHora->format('H:i');

        $disponiveis = $this->slotsDisponiveis($data);

        return in_array($hora, $disponiveis);
    }

    /**
     * Verifica se o dia é útil (seg–sex, sem feriado).
     */
    public function diaValido(Carbon $carbon): bool
    {
        // Fim de semana
        if ($carbon->isWeekend()) {
            return false;
        }

        // Feriado
        if ($this->eFeriado($carbon->format('Y-m-d'))) {
            return false;
        }

        return true;
    }

    // -------------------------------------------------------------------------
    // Privados
    // -------------------------------------------------------------------------

    /**
     * Gera todos os slots do dia no formato 'H:i'.
     */
    private function gerarSlots(Carbon $base): array
    {
        $settings = $this->getSettings();
        $slots   = [];
        $current = $base->copy()->setTimeFromTimeString($settings->hora_inicio);
        $fim     = $base->copy()->setTimeFromTimeString($settings->hora_fim);

        while ($current->lt($fim)) {
            $slots[] = $current->format('H:i');
            $current->addMinutes($settings->intervalo_minutos);
        }

        return $slots;
    }

    /**
     * Retorna os horários ('H:i') já com entrevista agendada naquele dia.
     */
    private function slotsOcupados(Carbon $base): array
    {
        return Entrevista::whereDate('data_hora', $base->format('Y-m-d'))
            ->get()
            ->map(fn($e) => Carbon::parse($e->data_hora)->format('H:i'))
            ->toArray();
    }

    /**
     * Retorna todos os horários ('H:i') cobertos por bloqueios naquele dia.
     * Se algum bloqueio for dia_todo, retorna todos os slots do dia.
     */
    private function slotsBloqueados(Carbon $base): array
    {
        $settings = $this->getSettings();
        $bloqueios = BloqueioAgenda::where('data', $base->format('Y-m-d'))->get();

        // Qualquer bloqueio de dia inteiro bloqueia tudo
        if ($bloqueios->where('dia_todo', true)->isNotEmpty()) {
            return $this->gerarSlots($base);
        }

        $bloqueados = [];

        foreach ($bloqueios as $bloqueio) {
            if (!$bloqueio->hora_inicio || !$bloqueio->hora_fim) {
                continue;
            }

            $inicio  = Carbon::createFromFormat('H:i:s', $bloqueio->hora_inicio);
            $fimBlq  = Carbon::createFromFormat('H:i:s', $bloqueio->hora_fim);
            $current = $inicio->copy();

            while ($current->lt($fimBlq)) {
                $bloqueados[] = $current->format('H:i');
                $current->addMinutes($settings->intervalo_minutos);
            }
        }

        return array_unique($bloqueados);
    }

    /**
     * Verifica se a data é feriado nacional (consulta bloqueio_agendas; importa da BrasilAPI se necessário).
     */
    private function eFeriado(string $data): bool
    {
        $ano = substr($data, 0, 4);
        $this->garantirFeriadosImportados($ano);

        // Feriados são salvos como bloqueios dia_todo com origem 'feriado'
        return BloqueioAgenda::where('data', $data)
            ->where('origem', 'feriado')
            ->exists();
    }

    /**
     * Importa feriados do ano para bloqueio_agendas (só chama a API se o ano ainda não estiver salvo).
     */
    private function garantirFeriadosImportados(string $ano): void
    {
        if (BloqueioAgenda::where('origem', 'feriado')->whereYear('data', $ano)->exists()) {
            return;
        }

        $apiKey = config('services.feriados_api.key');
        $uf     = strtoupper(config('services.feriados_api.uf', 'SP'));

        if (empty($apiKey)) {
            Log::warning('AgendaService: FERIADOS_API_KEY não configurada. Feriados estaduais não serão importados.');
            return;
        }

        try {
            $response = Http::timeout(5)
                ->withToken($apiKey)
                ->get("https://feriadosapi.com/api/v1/feriados/estado/{$uf}", ['ano' => $ano]);

            if ($response->failed()) {
                Log::warning("AgendaService: FeriadosAPI retornou {$response->status()} ao buscar feriados de {$uf}/{$ano}.");
                return;
            }

            $feriados = $response->json('feriados', []);

            if (empty($feriados)) {
                Log::warning("AgendaService: FeriadosAPI retornou lista vazia para {$uf}/{$ano}.");
                return;
            }

            // A API retorna datas em DD/MM/YYYY — converter para Y-m-d
            $registros = collect($feriados)
                ->map(fn($f) => [
                    'data'       => Carbon::createFromFormat('d/m/Y', $f['data'])->format('Y-m-d'),
                    'dia_todo'   => true,
                    'hora_inicio'=> null,
                    'hora_fim'   => null,
                    'motivo'     => $f['nome'],
                    'origem'     => 'feriado',
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
                ->toArray();

            BloqueioAgenda::insertOrIgnore($registros);
        } catch (\Throwable $e) {
            Log::warning('AgendaService: exceção ao importar feriados via FeriadosAPI.', ['erro' => $e->getMessage()]);
        }
    }
}
