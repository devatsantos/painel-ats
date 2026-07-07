<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Candidatos;
use App\Models\CandidatoVaga;
use App\Models\Entrevista;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class PortalApiController extends Controller
{
    private const CAMPOS_EDITAVEIS = [
        'nome', 'email', 'telefone', 'cep',
        'logradouro', 'regiao', 'nivel_escolaridade', 'data_nascimento', 'como_conheceu',
        'especialidade',
    ];

    /**
     * Dashboard do portal via API — lista candidaturas do candidato autenticado.
     */
    public function dashboard()
    {
        $candidato = auth()->user();
        if (!$candidato || !($candidato instanceof Candidatos)) {
            return response()->json(['error' => 'Não autorizado.'], 401);
        }

        // Limpa candidaturas "selecionado" que expiraram (mais de 7 dias)
        $expiradas = CandidatoVaga::where('candidato_id', $candidato->id)
            ->where('status', 'selecionado')
            ->where('updated_at', '<', now()->subDays(config('candidatura.selecao_expira_dias', 7)))
            ->get();

        foreach ($expiradas as $ev) {
            \App\Models\RespostaCandidato::where('candidato_id', $candidato->id)
                ->where('vaga_id', $ev->vaga_id)
                ->delete();
            $ev->delete();
        }

        $candidaturas = CandidatoVaga::where('candidato_id', $candidato->id)
            ->with(['vaga:id,titulo,local,horario,salario', 'entrevista'])
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($cv) {
                $entrevista = $cv->entrevista;
                return [
                    'id' => $cv->id,
                    'vaga_id' => $cv->vaga_id,
                    'titulo' => $cv->vaga->titulo ?? '—',
                    'local' => $cv->vaga->local ?? '—',
                    'horario' => $cv->vaga->horario ?? '—',
                    'salario' => $cv->vaga->salario ?? '—',
                    'status' => $cv->status,
                    'data_candidatura' => $cv->created_at?->format('d/m/Y'),
                    'entrevista' => $entrevista ? [
                        'data_hora' => Carbon::parse($entrevista->data_hora)->setTimezone('America/Sao_Paulo')->format('d/m/Y \à\s H:i'),
                        'tipo' => $entrevista->tipo,
                    ] : null,
                ];
            });

        // Próxima entrevista futura
        $proximaEntrevista = Entrevista::whereHas('candidatoVaga', function ($q) use ($candidato) {
            $q->where('candidato_id', $candidato->id);
        })
            ->where('data_hora', '>', now())
            ->orderBy('data_hora')
            ->with('candidatoVaga.vaga:id,titulo')
            ->first();

        $proxima = null;
        if ($proximaEntrevista) {
            $proxima = [
                'vaga' => $proximaEntrevista->candidatoVaga->vaga->titulo ?? '—',
                'data_hora' => Carbon::parse($proximaEntrevista->data_hora)->setTimezone('America/Sao_Paulo')->format('d/m/Y \à\s H:i'),
                'tipo' => $proximaEntrevista->tipo,
            ];
        }

        return response()->json([
            'candidato' => [
                'nome' => $candidato->nome,
                'email' => $candidato->email,
                'banco_de_talentos' => (bool) $candidato->banco_de_talentos,
            ],
            'candidaturas' => $candidaturas,
            'proximaEntrevista' => $proxima,
            'totalCandidaturas' => $candidaturas->count(),
        ]);
    }

    /**
     * Retorna o perfil completo do candidato autenticado.
     */
    public function perfil()
    {
        $candidato = auth()->user();
        if (!$candidato || !($candidato instanceof Candidatos)) {
            return response()->json(['error' => 'Não autorizado.'], 401);
        }

        return response()->json([
            'candidato' => [
                'nome' => $candidato->nome,
                'cpf' => $candidato->cpf,
                'email' => $candidato->email,
                'telefone' => $candidato->telefone,
                'cep' => $candidato->cep,
                'logradouro' => $candidato->logradouro,
                'regiao' => $candidato->regiao,
                'nivel_escolaridade' => $candidato->nivel_escolaridade,
                'data_nascimento' => $candidato->data_nascimento?->format('Y-m-d'),
                'como_conheceu' => $candidato->como_conheceu,
                'especialidade' => $candidato->especialidade,
                'banco_de_talentos' => (bool) $candidato->banco_de_talentos,
                'curriculo_url' => $candidato->path_curriculo
                    ? route('arquivos.serve', [
                        'tipo'     => 'curriculos',
                        'filename' => basename($candidato->path_curriculo),
                      ])
                    : null,
            ],
        ]);
    }

    /**
     * Atualiza dados pessoais do candidato autenticado.
     */
    public function atualizarPerfil(Request $request)
    {
        $candidato = auth()->user();
        if (!$candidato || !($candidato instanceof Candidatos)) {
            return response()->json(['error' => 'Não autorizado.'], 401);
        }

        $validator = Validator::make($request->all(), [
            'nome' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'telefone' => 'required|string|max:20',
            'cep' => 'required|string|max:20',
            'logradouro' => 'required|string|max:255',
            'regiao' => 'required|string|max:255',
            'nivel_escolaridade' => 'required|string|max:255',
            'data_nascimento' => 'nullable|date',
            'como_conheceu' => 'nullable|string|max:255',
            'especialidade' => 'nullable|string|max:255',
            'path_curriculo' => 'nullable|file|mimes:pdf,doc,docx|mimetypes:application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document|max:10240',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => 'Dados inválidos', 'details' => $validator->errors()], 422);
        }

        $validated = $validator->validated();

        if ($request->hasFile('path_curriculo')) {
            if ($candidato->path_curriculo) {
                Storage::disk('private')->delete($candidato->path_curriculo);
            }
            $validated['path_curriculo'] = $request->file('path_curriculo')->store('curriculos', 'private');
        } else {
            unset($validated['path_curriculo']);
        }

        $candidato->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Perfil atualizado com sucesso!',
            'candidato' => $candidato->only(self::CAMPOS_EDITAVEIS),
        ]);
    }

    /**
     * Upload de currículo via POST dedicado (evita limitação PHP com PUT multipart).
     *
     * Proteção contra race condition:
     * 1. Upload do arquivo novo ANTES do lock (falha aqui não afeta o estado do DB).
     * 2. lockForUpdate() serializa requests concorrentes da mesma linha.
     * 3. Deleção do arquivo antigo só após commit — preserva currículo se o update falhar.
     */
    public function uploadCurriculo(Request $request)
    {
        $candidato = auth()->user();
        if (!$candidato || !($candidato instanceof Candidatos)) {
            return response()->json(['error' => 'Não autorizado.'], 401);
        }

        $validator = Validator::make($request->all(), [
            'curriculo' => 'required|file|mimes:pdf,doc,docx|mimetypes:application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document|max:10240',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => 'Arquivo inválido. Use PDF, DOC ou DOCX com até 10MB.'], 422);
        }

        // 1. Faz upload do novo arquivo antes de qualquer lock.
        //    Se falhar aqui, o DB não é alterado e nenhum arquivo é perdido.
        $newPath = $request->file('curriculo')->store('curriculos', 'private');

        $oldPath = null;

        try {
            DB::transaction(function () use ($candidato, $newPath, &$oldPath) {
                // 2. Bloqueia a linha para serializar requisições concorrentes.
                $fresh = Candidatos::lockForUpdate()->findOrFail($candidato->id);
                $oldPath = $fresh->path_curriculo;

                // 3. Atualiza o DB atomicamente.
                $fresh->update(['path_curriculo' => $newPath]);
            });
        } catch (\Throwable $e) {
            // DB falhou — remove o novo arquivo para não deixar órfão no disco.
            Storage::disk('private')->delete($newPath);
            Log::error('[uploadCurriculo] Falha ao atualizar DB.', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Erro ao salvar currículo. Tente novamente.'], 500);
        }

        // 4. Deleta o arquivo antigo só após commit bem-sucedido.
        if ($oldPath) {
            Storage::disk('private')->delete($oldPath);
        }

        return response()->json([
            'success' => true,
            'message' => 'Currículo atualizado com sucesso!',
            'curriculo_url' => route('arquivos.serve', [
                'tipo'     => 'curriculos',
                'filename' => basename($newPath),
            ]),
        ]);
    }

    /**
     * Adiciona ou remove o candidato autenticado do Banco de Talentos.
     */
    public function toggleBancoTalentos()
    {
        $candidato = auth()->user();
        if (!$candidato || !($candidato instanceof Candidatos)) {
            return response()->json(['error' => 'Não autorizado.'], 401);
        }

        $candidato->update([
            'banco_de_talentos' => !$candidato->banco_de_talentos
        ]);

        $status = $candidato->banco_de_talentos ? 'incluído no' : 'removido do';

        return response()->json([
            'success' => true,
            'banco_de_talentos' => (bool) $candidato->banco_de_talentos,
            'message' => "Você foi {$status} Banco de Talentos com sucesso!",
        ]);
    }

    /**
     * Candidato desiste da entrevista agendada.
     * Define o status como 'desistiu' e cancela a entrevista.
     */
    public function desistirEntrevista(Request $request)
    {
        $candidato = auth()->user();
        if (!$candidato || !($candidato instanceof Candidatos)) {
            return response()->json(['error' => 'Não autorizado.'], 401);
        }

        $validator = Validator::make($request->all(), [
            'vaga_id' => 'required|integer|exists:vagas,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => 'Dados inválidos.'], 422);
        }

        $candidatoVaga = CandidatoVaga::where('candidato_id', $candidato->id)
            ->where('vaga_id', $request->vaga_id)
            ->first();

        if (!$candidatoVaga) {
            return response()->json(['error' => 'Candidatura não encontrada.'], 404);
        }

        // Impede desistência se já tem um status final
        $statusFinais = ['contratado', 'reprovado', 'recusou_vaga', 'sem_vaga', 'nao_compareceu', 'desclassificado', 'desistiu'];
        if (in_array($candidatoVaga->status, $statusFinais)) {
            return response()->json(['error' => 'Candidatura já encerrada. Não é possível desistir.'], 422);
        }

        DB::transaction(function () use ($candidatoVaga) {
            // Cancela a entrevista agendada (se existir)
            Entrevista::where('candidato_vaga_id', $candidatoVaga->id)->delete();

            // Define o status como desistiu
            $candidatoVaga->update(['status' => 'desistiu']);
        });

        return response()->json([
            'success'  => true,
            'message'  => 'Desistência registrada com sucesso.',
            'status'   => 'desistiu',
        ]);
    }

    /**
     * Revoga o token atual (Logout).
     */
    public function logout(Request $request)
    {
        $candidato = auth()->user();
        if ($candidato) {
            // Revoga o token que está sendo usado para esta requisição
            $request->user()->currentAccessToken()->delete();
        }

        return response()->json([
            'success' => true,
            'message' => 'Logout efetuado com sucesso (token revogado).'
        ]);
    }
}
