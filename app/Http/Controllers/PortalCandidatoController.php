<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Candidatos;
use App\Models\CandidatoVaga;
use App\Models\Entrevista;
use App\Models\Vagas;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Carbon\Carbon;
use App\Services\WhatsAppService;
use App\Jobs\EnviarWhatsAppJob;
use App\Models\MensagemWhatsApp;
use Illuminate\Support\Facades\Mail;

class PortalCandidatoController extends Controller
{
    /**
     * Campos do candidato que podem ser atualizados pelo próprio candidato.
     */
    private const CAMPOS_EDITAVEIS = [
        'nome', 'email', 'telefone', 'cep',
        'logradouro', 'regiao', 'nivel_escolaridade', 'data_nascimento', 'como_conheceu',
        'especialidade',
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

        // Token de 14 dias válido — pula verificação por WhatsApp
        $token = $request->input('token');
        if (
            $token &&
            $candidato->candidato_token &&
            hash_equals($candidato->candidato_token, hash('sha256', $token)) &&
            $candidato->candidato_token_expira_em &&
            now()->isBefore($candidato->candidato_token_expira_em)
        ) {
            Auth::guard('candidato')->login($candidato);
            request()->session()->regenerate();
            return response()->json([
                'existe'       => true,
                'token_valido' => true,
            ]);
        }

        // Candidato existe — precisa de OTP (telefone mascarado)
        $tel = $candidato->telefone ?? '';
        $telefoneMascarado = substr($tel, 0, 4) . str_repeat('*', max(0, strlen($tel) - 6)) . substr($tel, -2);
        return response()->json([
            'existe'    => true,
            'candidato' => [
                'telefone_mascarado' => $telefoneMascarado,
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
            'whatsapp_codigo_expira_em' => now()->addMinutes(config('candidatura.otp_expira_minutos')),
        ]);

        if (!$candidato->telefone) {
            return response()->json(['error' => 'Candidato não possui telefone cadastrado.'], 422);
        }

        EnviarWhatsAppJob::dispatch(
            $candidato->telefone,
            MensagemWhatsApp::renderizar('otp_portal', [
                'nome'   => $candidato->nome,
                'codigo' => $codigo,
            ])
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
        request()->session()->regenerate();

        return response()->json(['success' => true]);
    }

    public function enviarCodigoEmail(Request $request)
    {
        $request->validate([
            'cpf' => 'required|string',
        ]);

        $candidato = Candidatos::where('cpf', $request->cpf)->first();

        if (!$candidato) {
            return response()->json(['error' => 'Candidato não encontrado.'], 404);
        }

        if (empty($candidato->email)) {
            return response()->json(['error' => 'Candidato não possui e-mail cadastrado.'], 422);
        }

        $codigo = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        $candidato->update([
            'whatsapp_codigo'           => $codigo,
            'whatsapp_codigo_expira_em' => now()->addMinutes(config('candidatura.otp_expira_minutos')),
        ]);

        try {
            Mail::raw(
                MensagemWhatsApp::renderizar('otp_email', [
                    'nome'   => $candidato->nome,
                    'codigo' => $codigo,
                ]),
                function ($message) use ($candidato) {
                    $message->to($candidato->email)
                        ->subject("Código de Acesso - Portal do Candidato");
                }
            );
        } catch (\Exception $e) {
            Log::error('Erro ao enviar e-mail OTP para o portal.', [
                'candidato_id' => $candidato->id,
                'erro' => $e->getMessage(),
            ]);
        }

        $email = $candidato->email;
        $parts = explode('@', $email);
        if (count($parts) === 2) {
            $name = $parts[0];
            $domain = $parts[1];
            $len = strlen($name);
            if ($len > 2) {
                $maskedName = substr($name, 0, 1) . str_repeat('*', $len - 2) . substr($name, -1);
            } else {
                $maskedName = str_repeat('*', $len);
            }
            $emailMascarado = $maskedName . '@' . $domain;
        } else {
            $emailMascarado = '***@***.***';
        }

        return response()->json([
            'success'         => true,
            'email_mascarado' => $emailMascarado,
        ]);
    }

    /**
     * Gera token de 14 dias para o candidato autenticado no portal.
     * Armazena apenas o hash SHA-256 do token no banco — o token original é retornado ao cliente.
     */
    public function gerarToken()
    {
        $candidato = Auth::guard('candidato')->user();
        if (!$candidato) {
            return response()->json(['error' => 'Não autenticado.'], 401);
        }

        $token = Str::random(64);
        $candidato->update([
            'candidato_token'           => hash('sha256', $token),
            'candidato_token_expira_em' => now()->addDays(config('candidatura.token_expira_dias')),
        ]);

        return response()->json(['token' => $token]);
    }

    /**
     * Dashboard do portal — lista candidaturas do candidato autenticado.
     */
    public function index()
    {
        $candidato = Auth::guard('candidato')->user();

        // Limpa candidaturas "selecionado" que expiraram (mais de 7 dias)
        $expiradas = CandidatoVaga::where('candidato_id', $candidato->id)
            ->where('status', 'selecionado')
            ->where('updated_at', '<', now()->subDays(config('candidatura.selecao_expira_dias')))
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
            ];
        }

        return Inertia::render('Portal/Index', [
            'candidato'         => [
                'nome'              => $candidato->nome,
                'email'             => $candidato->email,
                'banco_de_talentos' => (bool) $candidato->banco_de_talentos,
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

        if ($candidatoVaga->status === 'selecionado' && $candidatoVaga->updated_at && $candidatoVaga->updated_at->isBefore(now()->subDays(config('candidatura.selecao_expira_dias')))) {
            \App\Models\RespostaCandidato::where('candidato_id', $candidato->id)
                ->where('vaga_id', $vagaId)
                ->delete();
            $candidatoVaga->delete();
            return redirect()->route('Portal')->with('error', 'O prazo de 7 dias para agendamento da sua entrevista expirou. Você precisará se candidatar novamente.');
        }

        $vaga = $candidatoVaga->vaga;

        $entrevista = null;
        if ($candidatoVaga->entrevista) {
            $e = $candidatoVaga->entrevista;
            $entrevista = [
                'data_hora'     => Carbon::parse($e->data_hora)->setTimezone('America/Sao_Paulo')->format('d/m/Y \à\s H:i'),
                'data_relativa' => Carbon::parse($e->data_hora)->diffForHumans(),
                'tipo'          => $e->tipo,
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
                'como_conheceu'      => $candidato->como_conheceu,
                'especialidade'      => $candidato->especialidade,
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
            'como_conheceu'      => 'nullable|string|max:255',
            'especialidade'      => 'nullable|string|max:255',
            'path_curriculo'     => 'nullable|file|mimes:pdf,doc,docx|mimetypes:application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document|max:10240',
        ]);

        if ($request->hasFile('path_curriculo')) {
            // Deleta currículo anterior se existir
            if ($candidato->path_curriculo) {
                Storage::disk('private')->delete($candidato->path_curriculo);
            }
            $validated['path_curriculo'] = $request->file('path_curriculo')->store('curriculos', 'private');
        } else {
            unset($validated['path_curriculo']);
        }

        $candidato->update($validated);

        return redirect()->route('Portal.perfil')->with('success', 'Perfil atualizado com sucesso!');
    }

    /**
     * Logout dedicado para o guard candidato.
     * Invalida sessão, token persistente e limpa dados de autenticação.
     */
    public function logout(Request $request)
    {
        $candidato = Auth::guard('candidato')->user();

        // Invalida o token persistente no banco
        if ($candidato) {
            $candidato->update([
                'candidato_token'           => null,
                'candidato_token_expira_em' => null,
            ]);
        }

        Auth::guard('candidato')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('Portal.login');
    }



    /**
     * Adiciona ou remove o candidato autenticado do Banco de Talentos.
     */
    public function toggleBancoTalentos(Request $request)
    {
        $candidato = Auth::guard('candidato')->user();
        if (!$candidato) {
            return redirect()->route('Portal.login');
        }

        $candidato->update([
            'banco_de_talentos' => !$candidato->banco_de_talentos
        ]);

        $status = $candidato->banco_de_talentos ? 'incluído no' : 'removido do';
        return redirect()->back()->with('success', "Você foi {$status} Banco de Talentos com sucesso!");
    }
}
