<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use App\Models\Entrevista;
use App\Jobs\EnviarWhatsAppJob;
use App\Services\PortalAtSantosService;
use App\Models\MensagemWhatsApp;

class EntrevistasController extends Controller
{
    public function index(Request $request)
    {
        $query = Entrevista::with(['candidatoVaga.candidato', 'candidatoVaga.vaga', 'user']);

        // Filtro por Vaga
        if ($request->filled('vaga_id')) {
            $query->whereHas('candidatoVaga', function ($q) use ($request) {
                $q->where('vaga_id', $request->vaga_id);
            });
        }

        // Filtro por Status
        if ($request->filled('status')) {
            $query->whereHas('candidatoVaga', function ($q) use ($request) {
                $q->where('status', $request->status);
            });
        }

        // Filtro por Busca Textual (Nome/CPF)
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('candidatoVaga.candidato', function ($q) use ($search) {
                $q->where(function ($sub) use ($search) {
                    $sub->where('nome', 'like', "%{$search}%")
                        ->orWhere('cpf', 'like', "%{$search}%");
                });
            });
        }

        // Filtro por Aba (tab)
        $tab = $request->input('tab', 'hoje');
        $todayStart = now()->startOfDay();
        $todayEnd = now()->endOfDay();

        if ($tab === 'hoje') {
            // Hoje ou anteriores marcadas/selecionadas (pendentes)
            $query->where(function ($q) use ($todayStart, $todayEnd) {
                $q->whereBetween('data_hora', [$todayStart, $todayEnd])
                  ->orWhere(function ($sub) use ($todayStart) {
                      $sub->where('data_hora', '<', $todayStart)
                          ->whereHas('candidatoVaga', function ($cv) {
                              $cv->whereIn('status', ['marcada', 'selecionado']);
                          });
                  });
            });
        } elseif ($tab === 'proximas') {
            // Futuras (amanhã em diante) e ainda marcadas/selecionadas
            $query->where('data_hora', '>', $todayEnd)
                  ->whereHas('candidatoVaga', function ($cv) {
                      $cv->whereIn('status', ['marcada', 'selecionado']);
                  });
        } elseif ($tab === 'concluidas') {
            // Candidaturas com resultados definidos (não marcadas/selecionadas)
            $query->whereHas('candidatoVaga', function ($cv) {
                $cv->whereNotIn('status', ['marcada', 'selecionado']);
            });
        }

        $candidatos = $query->latest('data_hora')
            ->paginate(20)
            ->withQueryString()
            ->through(function ($entrevista) {
                $candidato = $entrevista->candidatoVaga->candidato;

                return [
                    'id'                 => $candidato->id ?? 0,
                    'entrevista_id'      => $entrevista->id,
                    'nome'               => $candidato->nome ?? 'Candidato Excluído',
                    'email'              => $candidato->email ?? '',
                    'telefone'           => $candidato->telefone ?? '',
                    'cpf'                => $candidato->cpf ?? '',
                    'regiao'             => $candidato->regiao ?? '',
                    'nivel_escolaridade' => $candidato->nivel_escolaridade ?? '',
                    'path_curriculo'     => $candidato->path_curriculo ?? null,
                    'cep'                => $candidato->cep ?? '',
                    'logradouro'         => $candidato->logradouro ?? '',
                    'status'             => $entrevista->candidatoVaga->status ?? '',
                    'observacao'         => $entrevista->observacao,
                    'data_hora'          => $entrevista->data_hora,
                    'tipo_entrevista'    => $entrevista->tipo,
                    'entrevistador_nome' => $entrevista->user?->nome,
                    'vaga_titulo'        => $entrevista->candidatoVaga->vaga->titulo ?? 'Vaga',
                ];
            });

        $vagas = \App\Models\Vagas::orderBy('titulo')->get(['id', 'titulo']);

        return Inertia::render('Entrevistas/Index', [
            'candidatos' => $candidatos,
            'vagas'      => $vagas,
            'filters'    => [
                'search'  => $request->input('search', ''),
                'status'  => $request->input('status', ''),
                'vaga_id' => $request->input('vaga_id', ''),
                'tab'     => $tab,
            ],
        ]);
    }

    public function pegarEntrevista(Entrevista $entrevista)
    {
        if ($entrevista->user_id !== null) {
            return redirect()->route('Entrevistas')->with('error', 'Esta entrevista já foi atribuída a outro entrevistador.');
        }

        $entrevista->update(['user_id' => Auth::id()]);

        return redirect()->route('Entrevistas')->with('success', 'Entrevista atribuída a você com sucesso.');
    }

    public function desatribuirEntrevista(Entrevista $entrevista)
    {
        $user = Auth::user();
        if ($entrevista->user_id !== $user->id && !in_array($user->role, ['admin', 'coordenador'])) {
            return redirect()->route('Entrevistas')->with('error', 'Você não tem permissão para remover este entrevistador.');
        }

        $entrevista->update(['user_id' => null]);

        return redirect()->route('Entrevistas')->with('success', 'Entrevistador desatribuído com sucesso.');
    }

    public function atualizarStatus(Request $request, Entrevista $entrevista)
    {
        $validated = $request->validate([
            'status'     => 'required|string|in:contratado,reprovado,recusou_vaga,sem_vaga,nao_compareceu,desclassificado',
            'observacao' => 'nullable|string|max:1000',
        ]);

        $entrevista->candidatoVaga->update(['status' => $validated['status']]);
        $entrevista->update(['observacao' => $validated['observacao'] ?? null]);

        // Se contratado, sincroniza com o Portal AT&Santos
        if ($validated['status'] === 'contratado') {
            $this->syncComPortal($entrevista);
        }

        return redirect()->route('Entrevistas')->with('success', 'Resultado registrado com sucesso.');
    }

    public function adiar(Request $request, Entrevista $entrevista)
    {
        $validated = $request->validate([
            'justificativa' => 'nullable|string|max:1000',
        ]);

        $candidatoVaga = $entrevista->candidatoVaga;
        $candidato = $candidatoVaga->candidato;
        $vaga = $candidatoVaga->vaga;

        // Atualiza status da candidatura de volta para 'selecionado'
        $candidatoVaga->update(['status' => 'selecionado']);

        // Exclui a entrevista antiga
        $entrevista->delete();

        // Envia mensagem via WhatsApp
        if ($candidato && $candidato->telefone) {
            $justificativa = !empty($validated['justificativa']) 
                ? "\n\nMotivo informado pelo recrutador: " . $validated['justificativa'] 
                : "";

            $mensagem = MensagemWhatsApp::renderizar('entrevista_adiada', [
                'nome'          => $candidato->nome,
                'vaga'          => $vaga->titulo,
                'justificativa' => $justificativa,
                'url_portal'    => config('app.url') . '/portal',
            ]);

            EnviarWhatsAppJob::dispatch($candidato->telefone, $mensagem);
        } else {
            Log::warning('Adiar entrevista: candidato sem telefone ou não encontrado.', [
                'candidato_vaga_id' => $candidatoVaga->id
            ]);
        }

        return redirect()->route('Entrevistas')->with('success', 'Entrevista adiada com sucesso. O candidato foi notificado por WhatsApp.');
    }

    /**
     * Sincroniza o candidato contratado com o Portal AT&Santos.
     * Fire-and-forget: NUNCA impede a contratação, independente do que ocorra.
     */
    private function syncComPortal(Entrevista $entrevista): void
    {
        // Desabilita sincronização se PORTAL_SYNC_ENABLED=false no .env
        if (!config('services.portal_atsantos.sync_enabled', true)) {
            Log::info('[Portal Sync] Sincronização desabilitada via PORTAL_SYNC_ENABLED.');
            return;
        }

        try {
            $candidato = $entrevista->candidatoVaga->candidato;

            if (!$candidato) {
                Log::warning('[Portal Sync] Candidato não encontrado para sincronização.', [
                    'entrevista_id' => $entrevista->id,
                ]);
                return;
            }

            $portal = new PortalAtSantosService();

            if (!$portal->isConfigured()) {
                return;
            }

            $result = $portal->syncColaborador([
                'name'  => $candidato->nome,
                'cpf'   => $candidato->cpf,
                'phone' => $candidato->telefone,
                'email' => $candidato->email,
            ]);

            if (!($result['success'] ?? false)) {
                Log::warning('[Portal Sync] Falha ao sincronizar colaborador.', [
                    'cpf'     => substr($candidato->cpf, 0, 3) . '***',
                    'message' => $result['message'] ?? 'Erro desconhecido',
                ]);
            }
        } catch (\Throwable $e) {
            // NUNCA impedir a contratação por qualquer falha na integração
            Log::error('[Portal Sync] Exceção ao sincronizar com portal.', [
                'error' => $e->getMessage(),
            ]);
        }
    }
}
