<?php

namespace App\Console\Commands;

use App\Models\BloqueioAgenda;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class ImportarFeriados extends Command
{
    protected $signature = 'app:importar-feriados {ano? : Ano a importar (padrão: ano corrente e próximo)}';

    protected $description = 'Importa feriados nacionais da BrasilAPI para bloqueio_agendas';

    public function handle(): int
    {
        $anoParam = $this->argument('ano');

        $anos = $anoParam
            ? [(string) $anoParam]
            : [(string) now()->year, (string) now()->addYear()->year];

        foreach ($anos as $ano) {
            if (BloqueioAgenda::where('origem', 'feriado')->whereYear('data', $ano)->exists()) {
                $this->line("Feriados de {$ano} já importados. Pulando.");
                continue;
            }

            $this->info("Importando feriados de {$ano}...");

            $response = Http::timeout(10)->get("https://brasilapi.com.br/api/feriados/v1/{$ano}");

            if ($response->failed()) {
                $this->error("Falha ao buscar feriados de {$ano}: HTTP {$response->status()}");
                return self::FAILURE;
            }

            $registros = collect($response->json())
                ->map(fn($f) => [
                    'data'        => $f['date'],
                    'dia_todo'    => true,
                    'hora_inicio' => null,
                    'hora_fim'    => null,
                    'motivo'      => $f['name'],
                    'origem'      => 'feriado',
                    'created_at'  => now(),
                    'updated_at'  => now(),
                ])
                ->toArray();

            BloqueioAgenda::insertOrIgnore($registros);

            $this->info(count($registros) . " feriados importados para {$ano}.");
        }

        return self::SUCCESS;
    }
}
