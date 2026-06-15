<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Candidatos;
use App\Models\Vagas;
use App\Models\Formulario;
use App\Models\RespostaCandidato;
use App\Models\CandidatoVaga;
use App\Models\Reprovado;
use App\Models\Alternativa;
use App\Models\Entrevista;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use App\Jobs\EnviarWhatsAppJob;
use App\Services\AgendaService;
use App\Services\VideoConferenciaService;
use App\Services\WhatsAppService;
use App\Models\MensagemWhatsApp;
use Carbon\Carbon;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Mail;

class CandidatosController extends Controller
{
    /**
     * Campos do candidato expostos ao frontend para pré-preenchimento do formulário.
     */
    private const CAMPOS_PUBLICOS = [
        'nome', 'cpf', 'email', 'telefone', 'cep',
        'logradouro', 'regiao', 'nivel_escolaridade', 'data_nascimento',
    ];

    public function candidatura() {
        $vagas = Vagas::where('ativo', true)->where('interna', false)->orderBy('created_at', 'desc')->get();
        return Inertia::render('Candidatura/Index', ['vagas' => $vagas]);
    }

    public function verificarCpf(Request $request) {
        $request->validate([
            'cpf' => 'required|string|max:20',
            'vaga_id' => 'required|exists:vagas,id'
        ]);

        $candidato = Candidatos::where('cpf', $request->cpf)->first();
        
        if ($candidato) {
            $vaga = Vagas::find($request->vaga_id);

            // Bloqueia se já tiver candidatura ativa em outra vaga
            $vagaAtiva = CandidatoVaga::where('candidato_id', $candidato->id)
                ->whereNotIn('status', ['contratado', 'reprovado', 'recusou_vaga', 'sem_vaga', 'nao_compareceu', 'desclassificado'])
                ->where('vaga_id', '!=', $request->vaga_id)
                ->with('vaga:id,titulo')
                ->first();

            if ($vagaAtiva) {
                return response()->json([
                    'bloqueado'  => true,
                    'mensagem'   => 'Você já possui uma candidatura ativa para a vaga "' . $vagaAtiva->vaga->titulo . '". Conclua ou aguarde o processo atual antes de se candidatar a outra vaga.',
                ]);
            }

            $reprovado = Reprovado::where('candidato_id', $candidato->id)
                ->where('formulario_id', $vaga->formulario_id)
                ->where('reprovado_ate', '>', now())
                ->first();

            if ($reprovado) {
                return response()->json([
                    'reprovado' => true, 
                    'mensagem' => 'Você não pode se candidatar a esta vaga no momento. Tente novamente após ' . Carbon::parse($reprovado->reprovado_ate)->format('d/m/Y')
                ]);
            }

            // Verifica status do candidato nesta vaga
            $candidatoVaga = CandidatoVaga::where('candidato_id', $candidato->id)
                ->where('vaga_id', $request->vaga_id)
                ->first();

            if ($candidatoVaga) {
                // Já tem entrevista agendada
                $jaAgendado = Entrevista::where('candidato_vaga_id', $candidatoVaga->id)->exists();
                if ($jaAgendado) {
                    return response()->json([
                        'existe'      => true,
                        'ja_agendado' => true,
                    ]);
                }

                // Aprovado no quiz mas ainda não agendou
                if ($candidatoVaga->status === 'selecionado') {
                    if ($candidatoVaga->updated_at && $candidatoVaga->updated_at->isBefore(now()->subDays(config('candidatura.selecao_expira_dias')))) {
                        // Reseta a candidatura
                        RespostaCandidato::where('candidato_id', $candidato->id)
                            ->where('vaga_id', $request->vaga_id)
                            ->delete();
                        $candidatoVaga->delete();
                        $candidatoVaga = null;
                    }
                }
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

                $jaAprovado = false;
                $jaAgendado = false;

                if ($candidatoVaga) {
                    $jaAgendado = Entrevista::where('candidato_vaga_id', $candidatoVaga->id)->exists();
                    if (!$jaAgendado && $candidatoVaga->status === 'selecionado') {
                        $jaAprovado = true;
                    }
                }

                return response()->json([
                    'existe'       => true,
                    'token_valido' => true,
                    'candidato'    => $candidato->only(self::CAMPOS_PUBLICOS),
                    'ja_aprovado'  => $jaAprovado,
                    'ja_agendado'  => $jaAgendado,
                ]);
            }
        }

        return response()->json([
            'existe'    => (bool) $candidato,
            'candidato' => $candidato ? $candidato->only(array_diff(self::CAMPOS_PUBLICOS, ['cpf'])) : null,
        ]);
    }

    public function perguntas($vagaId) {
        $vaga = Vagas::findOrFail($vagaId);
        $formulario = Formulario::with('perguntas.alternativas')->find($vaga->formulario_id);
        return response()->json(['formulario' => $formulario]);
    }

    public function enviarCodigoWhatsApp(Request $request)
    {
        $request->validate([
            'cpf'     => 'required|string',
            'vaga_id' => 'required|exists:vagas,id',
        ]);

        $candidato = Candidatos::where('cpf', $request->cpf)->first();

        if (!$candidato) {
            return response()->json(['error' => 'Candidato não encontrado.'], 404);
        }

        $codigo = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        $candidato->update([
            'whatsapp_codigo'          => $codigo,
            'whatsapp_codigo_expira_em' => now()->addMinutes(config('candidatura.otp_expira_minutos')),
        ]);

        $vaga = Vagas::find($request->vaga_id);
        $nomeVaga = $vaga?->titulo ?? 'vaga';

        $whatsapp = new WhatsAppService();
        $whatsapp->enviarMensagem(
            $candidato->telefone,
            MensagemWhatsApp::renderizar('otp_candidatura', [
                'nome'   => $candidato->nome,
                'vaga'   => $nomeVaga,
                'codigo' => $codigo,
            ])
        );

        $tel = $candidato->telefone;
        $telefoneMascarado = substr($tel, 0, 4) . str_repeat('*', max(0, strlen($tel) - 6)) . substr($tel, -2);

        return response()->json([
            'success'           => true,
            'telefone_mascarado' => $telefoneMascarado,
        ]);
    }

    public function verificarCodigoWhatsApp(Request $request)
    {
        $request->validate([
            'cpf'     => 'required|string',
            'codigo'  => 'required|string|min:6|max:6',
            'vaga_id' => 'nullable|exists:vagas,id',
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

        $jaAprovado = false;
        $jaAgendado = false;

        if ($request->vaga_id) {
            $candidatoVaga = CandidatoVaga::where('candidato_id', $candidato->id)
                ->where('vaga_id', $request->vaga_id)
                ->first();

            if ($candidatoVaga) {
                $jaAgendado = Entrevista::where('candidato_vaga_id', $candidatoVaga->id)->exists();
                if (!$jaAgendado && $candidatoVaga->status === 'selecionado') {
                    $jaAprovado = true;
                }
            }
        }

        return response()->json([
            'success'     => true,
            'candidato'   => $candidato->only(self::CAMPOS_PUBLICOS),
            'ja_aprovado' => $jaAprovado,
            'ja_agendado' => $jaAgendado,
        ]);
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
                        ->subject("Código de Acesso - Processo Seletivo");
                }
            );
        } catch (\Exception $e) {
            Log::error('Erro ao enviar e-mail OTP para candidatura.', [
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

    public function gerarToken(Request $request)
    {
        $candidato = Auth::guard('candidato')->user();
        if (!$candidato) {
            return response()->json(['error' => 'Não autenticado.'], 401);
        }

        $token = Str::random(64);
        $candidato->update([
            'candidato_token'          => hash('sha256', $token),
            'candidato_token_expira_em' => now()->addDays(config('candidatura.token_expira_dias')),
        ]);

        return response()->json(['token' => $token]);
    }

    public function verificarNascimento(Request $request)
    {
        $request->validate([
            'cpf'             => 'required|string',
            'data_nascimento' => 'required|date_format:Y-m-d',
            'vaga_id'         => 'nullable|exists:vagas,id',
        ]);

        $candidato = Candidatos::where('cpf', $request->cpf)->first();

        if (!$candidato) {
            return response()->json(['error' => 'Candidato não encontrado.'], 404);
        }

        if (!$candidato->data_nascimento) {
            return response()->json(['error' => 'Não há data de nascimento cadastrada para este CPF. Escolha outra forma de verificação.'], 422);
        }

        $dataBD        = Carbon::parse($candidato->data_nascimento)->format('Y-m-d');
        $dataFornecida = Carbon::parse($request->data_nascimento)->format('Y-m-d');

        if (!hash_equals($dataBD, $dataFornecida)) {
            Log::warning('Candidatura: tentativa de verificação por nascimento falhou.', [
                'cpf_hash' => md5($request->cpf),
                'ip'       => $request->ip(),
            ]);
            return response()->json(['error' => 'Data de nascimento incorreta. Tente novamente.'], 422);
        }

        Log::info('Candidatura: login via verificação por nascimento.', [
            'candidato_id' => $candidato->id,
            'ip'           => $request->ip(),
        ]);

        Auth::guard('candidato')->login($candidato);
        request()->session()->regenerate();

        $jaAprovado = false;
        $jaAgendado = false;

        if ($request->vaga_id) {
            $candidatoVaga = CandidatoVaga::where('candidato_id', $candidato->id)
                ->where('vaga_id', $request->vaga_id)
                ->first();

            if ($candidatoVaga) {
                $jaAgendado = Entrevista::where('candidato_vaga_id', $candidatoVaga->id)->exists();
                if (!$jaAgendado && $candidatoVaga->status === 'selecionado') {
                    $jaAprovado = true;
                }
            }
        }

        return response()->json([
            'success'     => true,
            'candidato'   => $candidato->only(self::CAMPOS_PUBLICOS),
            'ja_aprovado' => $jaAprovado,
            'ja_agendado' => $jaAgendado,
        ]);
    }

    public function store(Request $request) {
        $validated = $request->validate([
            'nome' => 'required|string|max:255',
            'cpf' => 'required|string|max:20',
            'email' => 'required|email',
            'telefone' => 'required|string|max:20',
            'path_curriculo' => 'nullable|file|mimes:pdf,doc,docx|mimetypes:application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document|max:10240',
            'cep' => 'required|string|max:20',
            'logradouro' => 'required|string|max:255',
            'nivel_escolaridade' => 'required|string|max:255',
            'regiao' => 'required|string|max:255',
            'data_nascimento' => 'nullable|date',
            'vaga_id' => 'required|exists:vagas,id',
        ]);

        // Se o candidato já existe, exige autenticação (OTP) para evitar bypass
        $candidatoExistente = Candidatos::where('cpf', $validated['cpf'])->first();
        if ($candidatoExistente && !Auth::guard('candidato')->check()) {
            return redirect()->back()->withErrors([
                'cpf' => 'Sessão expirada. Por favor, verifique seu CPF novamente.',
            ]);
        }

        try {
            if ($request->hasFile('path_curriculo')) {
                $path = $request->file('path_curriculo')->store('curriculos', 'public');
                $validated['path_curriculo'] = $path;
            } else {
                unset($validated['path_curriculo']);
            }

            $vagaId = $validated['vaga_id'];
            unset($validated['vaga_id']);

            $candidato = Candidatos::updateOrCreate(
                ['cpf' => $validated['cpf']], 
                $validated
            );

            // Bloqueia candidatura se já houver processo ativo em outra vaga
            $vagaAtiva = CandidatoVaga::where('candidato_id', $candidato->id)
                ->whereNotIn('status', ['contratado', 'reprovado', 'recusou_vaga', 'sem_vaga', 'nao_compareceu', 'desclassificado'])
                ->where('vaga_id', '!=', $vagaId)
                ->with('vaga:id,titulo')
                ->first();

            if ($vagaAtiva) {
                return redirect()->back()->withErrors([
                    'vaga_id' => 'Você já possui uma candidatura ativa para a vaga "' . $vagaAtiva->vaga->titulo . '". Conclua ou aguarde o processo atual.',
                ]);
            }

            $candidato->vagas()->syncWithoutDetaching([
                $vagaId => ['status' => 'marcada']
            ]);
            
            Auth::guard('candidato')->login($candidato);
            request()->session()->regenerate();
            
            return redirect()->back()->with('success', 'Candidato cadastrado/atualizado com sucesso!')->with('candidato_id', $candidato->id);
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => 'Erro interno ao salvar candidato: ' . $e->getMessage()]);
        }
    }

    public function delete($id) {
        $candidato = Candidatos::find($id);
        
        if (!$candidato) {
            return response()->json(['error' => 'Candidato não encontrado'], 404);
        }
        
        if ($candidato->path_curriculo) {
            Storage::disk('public')->delete($candidato->path_curriculo);
        }
        
        $candidato->delete();
        
        return response()->json(['message' => 'Candidato deletado com sucesso']);
    }


    public function salvarRespostas(Request $request) {
        $request->validate([
            'vaga_id' => 'required|exists:vagas,id',
            'respostas' => 'required|array'
        ]);

        $candidato = Auth::guard('candidato')->user();
        if (!$candidato) {
            return response()->json(['message' => 'Sessão expirada. Volte e faça a validação do CPF novamente.'], 401);
        }

        $vaga = Vagas::with('formulario.perguntas')->find($request->vaga_id);

        // Vaga sem formulário associado — candidato é automaticamente selecionado
        if (!$vaga->formulario_id || !$vaga->formulario) {
            CandidatoVaga::updateOrCreate(
                ['candidato_id' => $candidato->id, 'vaga_id' => $request->vaga_id],
                ['status' => 'selecionado']
            );
            return response()->json([
                'message' => 'Candidato selecionado automaticamente.',
                'acertos' => 0,
                'total'   => 0,
                'aprovado' => true,
            ]);
        }

        $perguntasValidasIds = $vaga->formulario->perguntas->pluck('id')->toArray();

        $acertos = 0;

        foreach($request->respostas as $perguntaId => $alternativaId) {
            if (!in_array($perguntaId, $perguntasValidasIds)) {
                continue;
            }

            RespostaCandidato::updateOrCreate(
                [
                    'candidato_id' => $candidato->id,
                    'vaga_id' => $request->vaga_id,
                    'pergunta_id' => $perguntaId
                ],
                [
                    'alternativa_id' => $alternativaId
                ]
            );

            $alternativa = Alternativa::where('id', $alternativaId)
                ->where('pergunta_id', $perguntaId)
                ->first();

            if ($alternativa && $alternativa->correta) {
                $acertos++;
            }
        }
        $threshold = $vaga->formulario->threshold;

        if ($acertos >= $threshold) {
            CandidatoVaga::updateOrCreate(
                [
                    'candidato_id' => $candidato->id,
                    'vaga_id' => $request->vaga_id
                ],
                [
                    'status' => 'selecionado'
                ]
            );
            return response()->json([
                'message' => 'Respostas salvas com sucesso. O candidato foi aprovado para a próxima etapa!',
                'acertos' => $acertos,
                'total' => count($request->respostas),
                'aprovado' => true
            ]);
        } else {
            Reprovado::updateOrCreate(
                [
                    'candidato_id' => $candidato->id,
                    'formulario_id' => $vaga->formulario_id
                ],
                [
                    'reprovado_ate' => now()->addDays(config('candidatura.quarentena_reprovacao_dias'))
                ]
            );
            return response()->json([
                'message' => 'Candidato reprovado. Ele poderá tentar novamente após 30 dias.',
                'acertos' => $acertos,
                'total' => count($request->respostas),
                'aprovado' => false
            ]);
        }
    }

    public function slotsDisponiveis(Request $request)
    {
        $request->validate([
            'data' => 'required|date_format:Y-m-d|after_or_equal:today',
        ]);

        $agenda = new AgendaService();
        $slots  = $agenda->slotsDisponiveis($request->data);

        return response()->json(['slots' => $slots]);
    }

    public function agendarEntrevista(Request $request) {
        try {
            $request->validate([
                'vaga_id'  => 'required|exists:vagas,id',
                'data_hora' => 'required|date|after:now',
                'tipo'      => 'required|string|in:Presencial,Online',
            ]);

            $candidato = Auth::guard('candidato')->user();
            if (!$candidato) {
                return response()->json(['error' => 'Candidato não autenticado.'], 401);
            }
            $candidatoVaga = CandidatoVaga::where('candidato_id', $candidato->id)
                ->where('vaga_id', $request->vaga_id)
                ->first();

            if (!$candidatoVaga) {
                return response()->json(['error' => 'Candidato não vinculado a esta vaga.'], 400);
            }

            // Bloqueia entrevista online se a vaga não permitir
            $vaga = Vagas::find($request->vaga_id);
            if ($request->tipo === 'Online' && !$vaga->permite_online) {
                return response()->json(['error' => 'Esta vaga não permite entrevista online.'], 422);
            }

            // Validação de slot (backend)
            $dataHora = Carbon::parse($request->data_hora);
            $agenda   = new AgendaService();

            if (!$agenda->validarSlot($dataHora)) {
                $settings = $agenda->getSettings();
                $horaInicio = Carbon::parse($settings->hora_inicio)->format('H\h');
                $horaFim = Carbon::parse($settings->hora_fim)->format('H\h');
                $intervalo = $settings->intervalo_minutos;
                return response()->json([
                    'error' => "Horário indisponível. Escolha um slot válido de segunda a sexta, das {$horaInicio} às {$horaFim}, a cada {$intervalo} minutos, em dia útil não feriado.",
                ], 422);
            }

            // Gerar link do Meet (apenas para entrevistas Online)
            $linkMeet = null;
            if ($request->tipo === 'Online') {
                try {
                    $titulo   = "Entrevista — {$candidato->nome} | {$vaga->titulo}";
                    $meet     = new VideoConferenciaService();
                    $linkMeet = $meet->criarEvento($titulo, $dataHora, $dataHora->copy()->addMinutes(config('candidatura.entrevista_duracao_minutos')));
                } catch (\Throwable $e) {
                    // Falha no Meet não impede o agendamento
                    Log::warning('VideoConferenciaService falhou.', ['erro' => $e->getMessage()]);
                }
            }

            $candidatoVaga->update(['status' => 'marcada']);

            $entrevista = Entrevista::create([
                'candidato_vaga_id' => $candidatoVaga->id,
                'data_hora'         => $dataHora,
                'tipo'              => $request->tipo,
                'link_meet'         => $linkMeet,
                'user_id'           => $vaga->user_id,
            ]);

            // WhatsApp
            $vaga          = $vaga ?? Vagas::find($request->vaga_id);
            $dataHoraBR    = $dataHora->copy()->setTimezone('America/Sao_Paulo');
            $dataFormatada = $dataHoraBR->format('d/m/Y');
            $horaFormatada = $dataHoraBR->format('H:i');

            $mensagem = MensagemWhatsApp::renderizar('entrevista_agendada', [
                'nome'      => $candidato->nome,
                'vaga'      => $vaga->titulo,
                'data'      => $dataFormatada,
                'horario'   => $horaFormatada,
                'tipo'      => $request->tipo,
                'link_meet' => $linkMeet ? "💻 Link Meet: {$linkMeet}\n" : '',
            ]);

            if ($candidato->telefone) {
                EnviarWhatsAppJob::dispatch($candidato->telefone, $mensagem);
            } else {
                Log::warning('agendarEntrevista: candidato sem telefone.', ['candidato_id' => $candidato->id]);
            }

            return response()->json(['message' => 'Entrevista agendada com sucesso!']);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'error'   => 'Erro de validação',
                'message' => collect($e->errors())->flatten()->first(),
            ], 422);
        } catch (\Illuminate\Database\UniqueConstraintViolationException $e) {
            return response()->json([
                'error'   => 'Horário indisponível',
                'message' => 'Este horário acabou de ser reservado por outro candidato. Por favor, escolha outro slot.',
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'error'   => 'Erro interno',
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
