<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Candidatos;
use App\Models\CandidatoVaga;
use App\Models\Entrevista;
use App\Models\Vagas;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Carbon\Carbon;
use App\Services\WhatsAppService;

class PortalCandidatoController extends Controller
{
    /**
     * Campos do candidato que podem ser atualizados pelo próprio candidato.
     */
    private const CAMPOS_EDITAVEIS = [
        'nome', 'email', 'telefone', 'cep',
        'logradouro', 'regiao', 'nivel_escolaridade', 'data_nascimento',
    ];

    /**
     * Tela de login do portal do candidato.
     * Se já autenticado pelo guard candidato, redireciona para o dashboard.
     */
    public function login()
    {
        if (Auth::guard('candidato')->check()) {
            return redirect()->route('Portal');
        }

        return Inertia::render('Portal/Login');
    }

    /**
     * Verifica CPF para login no portal.
     * Diferente do fluxo de candidatura, não exige vaga_id.
     * Auth::guard('candidato')->login() só ocorre com token válido.
     */
    public function verificarCpf(Request $request)
    {
        $request->validate([
            'cpf' => 'required|string|max:20',
        ]);

        $candidato = Candidatos::where('cpf', $request->cpf)->first();

        if (!$candidato) {
            return response()->json([
                'existe' => false,
                'candidato' => null,
            ]);
        }

        // Token de 7 dias válido — pula verificação por WhatsApp
        $token = $request->input('token');
        if (
            $token &&
            $candidato->candidato_token &&
            hash_equals($candidato->candidato_token, $token) &&
            $candidato->candidato_token_expira_em &&
            now()->isBefore($candidato->candidato_token_expira_em)
        ) {
            Auth::guard('candidato')->login($candidato);
            return response()->json([
                'existe'       => true,
                'token_valido' => true,
            ]);
        }

        // Candidato existe — precisa de OTP
        $tel = $candidato->telefone ?? '';
        $digits = preg_replace('/\D/', '', $tel);
        return response()->json([
            'existe'    => true,
            'candidato' => [
                'telefone' => $candidato->telefone,
            ],
        ]);
    }

    /**
     * Envia código OTP via WhatsApp para o portal.
     * Não exige vaga_id.
     */
    public function enviarCodigo(Request $request)
    {
        $request->validate([
            'cpf' => 'required|string',
        ]);

        $candidato = Candidatos::where('cpf', $request->cpf)->first();

        if (!$candidato) {
            return response()->json(['error' => 'Candidato não encontrado.'], 404);
        }

        $codigo = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        $candidato->update([
            'whatsapp_codigo'           => $codigo,
            'whatsapp_codigo_expira_em' => now()->addMinutes(15),
        ]);

        $whatsapp = new WhatsAppService();
        $whatsapp->enviarMensagem(
            $candidato->telefone,
            "Olá, {$candidato->nome}! 👋\n\nSeu código de acesso ao Portal do Candidato é:\n\n*{$codigo}*\n\nEste código expira em *15 minutos*. Não compartilhe com ninguém."
        );

        $tel = $candidato->telefone;
        $telefoneMascarado = substr($tel, 0, 4) . str_repeat('*', max(0, strlen($tel) - 6)) . substr($tel, -2);

        return response()->json([
            'success'            => true,
            'telefone_mascarado' => $telefoneMascarado,
        ]);
    }

    /**
     * Verifica código OTP para login no portal.
     * Auth::guard('candidato')->login() ocorre após OTP validado.
     */
    public function verificarCodigo(Request $request)
    {
        $request->validate([
            'cpf'    => 'required|string',
            'codigo' => 'required|string|min:6|max:6',
        ]);

        $candidato = Candidatos::where('cpf', $request->cpf)->first();

        if (!$candidato) {
            return response()->json(['error' => 'Candidato não encontrado.'], 404);
        }

        if (!$candidato->whatsapp_codigo || !$candidato->whatsapp_codigo_expira_em) {
            return response()->json(['error' => 'Nenhum código ativo. Solicite um novo código.'], 422);
        }

        if (now()->isAfter($candidato->whatsapp_codigo_expira_em)) {
            $candidato->update(['whatsapp_codigo' => null, 'whatsapp_codigo_expira_em' => null]);
            return response()->json(['error' => 'Código expirado. Solicite um novo código.'], 422);
        }

        if ($candidato->whatsapp_codigo !== $request->codigo) {
            return response()->json(['error' => 'Código incorreto. Verifique e tente novamente.'], 422);
        }

        $candidato->update(['whatsapp_codigo' => null, 'whatsapp_codigo_expira_em' => null]);
        Auth::guard('candidato')->login($candidato);

        return response()->json(['success' => true]);
    }

    /**
     * Gera token de 7 dias para o candidato autenticado no portal.
     */
    public function gerarToken()
    {
        $candidato = Auth::guard('candidato')->user();
        if (!$candidato) {
            return response()->json(['error' => 'Não autenticado.'], 401);
        }

        $token = Str::random(64);
        $candidato->update([
            'candidato_token'           => $token,
            'candidato_token_expira_em' => now()->addDays(7),
        ]);

        return response()->json(['token' => $token]);
    }

    /**
     * Dashboard do portal — lista candidaturas do candidato autenticado.
     */
    public function index()
    {
        $candidato = Auth::guard('candidato')->user();

        $candidaturas = CandidatoVaga::where('candidato_id', $candidato->id)
            ->with(['vaga:id,titulo,local,horario,salario', 'entrevista'])
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($cv) {
                $entrevista = $cv->entrevista;
                return [
                    'id'              => $cv->id,
                    'vaga_id'         => $cv->vaga_id,
                    'titulo'          => $cv->vaga->titulo ?? '—',
                    'local'           => $cv->vaga->local ?? '—',
                    'horario'         => $cv->vaga->horario ?? '—',
                    'salario'         => $cv->vaga->salario ?? '—',
                    'status'          => $cv->status,
                    'data_candidatura' => $cv->created_at?->format('d/m/Y'),
                    'entrevista'      => $entrevista ? [
                        'data_hora'  => Carbon::parse($entrevista->data_hora)->setTimezone('America/Sao_Paulo')->format('d/m/Y \à\s H:i'),
                        'tipo'       => $entrevista->tipo,
                        'link_meet'  => $entrevista->link_meet,
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
                'vaga'      => $proximaEntrevista->candidatoVaga->vaga->titulo ?? '—',
                'data_hora' => Carbon::parse($proximaEntrevista->data_hora)->setTimezone('America/Sao_Paulo')->format('d/m/Y \à\s H:i'),
                'tipo'      => $proximaEntrevista->tipo,
                'link_meet' => $proximaEntrevista->link_meet,
            ];
        }

        return Inertia::render('Portal/Index', [
            'candidato'         => [
                'nome'  => $candidato->nome,
                'email' => $candidato->email,
            ],
            'candidaturas'      => $candidaturas,
            'proximaEntrevista' => $proxima,
            'totalCandidaturas' => $candidaturas->count(),
        ]);
    }

    /**
     * Detalhe de uma candidatura específica do candidato autenticado.
     */
    public function show($vagaId)
    {
        $candidato = Auth::guard('candidato')->user();

        $candidatoVaga = CandidatoVaga::where('candidato_id', $candidato->id)
            ->where('vaga_id', $vagaId)
            ->with(['vaga', 'entrevista.user:id,nome'])
            ->firstOrFail();

        $vaga = $candidatoVaga->vaga;

        $entrevista = null;
        if ($candidatoVaga->entrevista) {
            $e = $candidatoVaga->entrevista;
            $entrevista = [
                'data_hora'     => Carbon::parse($e->data_hora)->setTimezone('America/Sao_Paulo')->format('d/m/Y \à\s H:i'),
                'data_relativa' => Carbon::parse($e->data_hora)->diffForHumans(),
                'tipo'          => $e->tipo,
                'link_meet'     => $e->link_meet,
                'entrevistador' => $e->user->nome ?? null,
                'observacao'    => $e->observacao,
            ];
        }

        return Inertia::render('Portal/Candidatura', [
            'vaga' => [
                'id'        => $vaga->id,
                'titulo'    => $vaga->titulo,
                'local'     => $vaga->local,
                'horario'   => $vaga->horario,
                'escala'    => $vaga->escala,
                'salario'   => $vaga->salario,
                'descricao' => $vaga->descricao,
                'va'        => $vaga->va,
                'vr'        => $vaga->vr,
                'vt'        => $vaga->vt,
                'pcd'       => $vaga->pcd,
            ],
            'status'     => $candidatoVaga->status,
            'entrevista' => $entrevista,
            'dataCandidatura' => $candidatoVaga->created_at?->format('d/m/Y'),
        ]);
    }

    /**
     * Tela de edição de perfil — retorna dados atuais do candidato.
     */
    public function perfil()
    {
        $candidato = Auth::guard('candidato')->user();

        return Inertia::render('Portal/Perfil', [
            'candidato' => [
                'nome'               => $candidato->nome,
                'cpf'                => $candidato->cpf,
                'email'              => $candidato->email,
                'telefone'           => $candidato->telefone,
                'cep'                => $candidato->cep,
                'logradouro'         => $candidato->logradouro,
                'regiao'             => $candidato->regiao,
                'nivel_escolaridade' => $candidato->nivel_escolaridade,
                'data_nascimento'    => $candidato->data_nascimento?->format('Y-m-d'),
            ],
        ]);
    }

    /**
     * Atualiza dados pessoais do candidato autenticado.
     * O candidato só pode atualizar seus próprios dados — scoped pelo guard.
     */
    public function atualizarPerfil(Request $request)
    {
        $candidato = Auth::guard('candidato')->user();

        $validated = $request->validate([
            'nome'               => 'required|string|max:255',
            'email'              => 'required|email|max:255',
            'telefone'           => 'required|string|max:20',
            'cep'                => 'required|string|max:20',
            'logradouro'         => 'required|string|max:255',
            'regiao'             => 'required|string|max:255',
            'nivel_escolaridade' => 'required|string|max:255',
            'data_nascimento'    => 'nullable|date',
            'path_curriculo'     => 'nullable|file|mimes:pdf,doc,docx|mimetypes:application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document|max:10240',
        ]);

        if ($request->hasFile('path_curriculo')) {
            // Deleta currículo anterior se existir
            if ($candidato->path_curriculo) {
                Storage::disk('public')->delete($candidato->path_curriculo);
            }
            $validated['path_curriculo'] = $request->file('path_curriculo')->store('curriculos', 'public');
        } else {
            unset($validated['path_curriculo']);
        }

        $candidato->update($validated);

        return redirect()->route('Portal.perfil')->with('success', 'Perfil atualizado com sucesso!');
    }
}
