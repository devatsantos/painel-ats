<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Candidatos;
use App\Models\Vagas;
use App\Models\Formulario;
use App\Models\RespostaCandidato;
use App\Models\CandidatoVaga;
use App\Models\Reprovado;
use App\Models\Alternativa;
use App\Models\Entrevista;
use App\Services\AgendaService;
use App\Services\WhatsAppService;
use App\Jobs\EnviarWhatsAppJob;
use App\Models\MensagemWhatsApp;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class CandidaturaApiController extends Controller
{
    private const CAMPOS_PUBLICOS = [
        'nome', 'cpf', 'email', 'telefone', 'cep',
        'logradouro', 'regiao', 'como_conheceu', 'especialidade', 'nivel_escolaridade', 'data_nascimento',
    ];

    /**
     * Valida o CPF e retorna o status do candidato (novo, existente ou bloqueado).
     */
    public function verificarCpf(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'cpf' => 'required|string|max:20',
            'vaga_id' => 'nullable|exists:vagas,id'
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => 'Dados inválidos', 'details' => $validator->errors()], 422);
        }

        $cpf = $this->formatarCpf($request->cpf);
        $candidato = Candidatos::where('cpf', $cpf)->first();
        
        if ($candidato) {
            $candidatoVaga = null;

            if ($request->vaga_id) {
                $vaga = Vagas::find($request->vaga_id);

                // Bloqueia se já tiver candidatura ativa em outra vaga (com exceção de candidaturas 'marcada' sem entrevista agendada)
                $vagaAtiva = CandidatoVaga::where('candidato_id', $candidato->id)
                    ->whereNotIn('status', ['contratado', 'reprovado', 'recusou_vaga', 'sem_vaga', 'nao_compareceu', 'desclassificado', 'desistiu'])
                    ->where('vaga_id', '!=', $request->vaga_id)
                    ->where(function ($query) {
                        $query->where('status', '!=', 'marcada')
                              ->orWhere(function ($q) {
                                  $q->where('status', 'marcada')
                                    ->has('entrevista');
                              });
                    })
                    ->with('vaga:id,titulo')
                    ->first();

                if ($vagaAtiva) {
                    return response()->json([
                        'status' => 'blocked',
                        'mensagem' => 'Você já possui uma candidatura ativa para a vaga "' . $vagaAtiva->vaga->titulo . '". Conclua ou aguarde o processo atual antes de se candidatar a outra vaga.',
                    ]);
                }

                // Verifica se está na quarentena de reprovação
                $reprovado = Reprovado::where('candidato_id', $candidato->id)
                    ->where('formulario_id', $vaga->formulario_id)
                    ->where('reprovado_ate', '>', now())
                    ->first();

                if ($reprovado) {
                    return response()->json([
                        'status' => 'blocked',
                        'mensagem' => 'Você não pode se candidatar a esta vaga no momento. Tente novamente após ' . Carbon::parse($reprovado->reprovado_ate)->format('d/m/Y')
                    ]);
                }

                // Verifica status do candidato nesta vaga
                $candidatoVaga = CandidatoVaga::where('candidato_id', $candidato->id)
                    ->where('vaga_id', $request->vaga_id)
                    ->first();

                if ($candidatoVaga) {
                    if (in_array($candidatoVaga->status, ['reprovado', 'recusou_vaga', 'sem_vaga', 'nao_compareceu', 'desclassificado', 'desistiu'])) {
                        $motivo = 'não obteve aprovação';
                        if ($candidatoVaga->status === 'desistiu' || $candidatoVaga->status === 'recusou_vaga') {
                            $motivo = 'desistiu do processo';
                        } elseif ($candidatoVaga->status === 'nao_compareceu') {
                            $motivo = 'não compareceu à entrevista';
                        }
                        return response()->json([
                            'status' => 'blocked',
                            'mensagem' => 'Você já participou do processo seletivo para esta vaga anteriormente e ' . $motivo . '. Não é possível se candidatar novamente para a mesma oportunidade.',
                        ]);
                    }

                    $jaAgendado = Entrevista::where('candidato_vaga_id', $candidatoVaga->id)->exists();
                    if ($jaAgendado) {
                        return response()->json([
                            'status' => 'exists',
                            'ja_agendado' => true,
                            'mensagem' => 'Você já possui uma entrevista agendada para esta vaga.',
                        ]);
                    }

                    // Aprovado no quiz mas ainda não agendou
                    if ($candidatoVaga->status === 'selecionado') {
                        if ($candidatoVaga->updated_at && $candidatoVaga->updated_at->isBefore(now()->subDays(config('candidatura.selecao_expira_dias')))) {
                            // Reseta a candidatura expirada
                            RespostaCandidato::where('candidato_id', $candidato->id)
                                ->where('vaga_id', $request->vaga_id)
                                ->delete();
                            $candidatoVaga->delete();
                            $candidatoVaga = null;
                        }
                    }
                }
            }

            // Se o candidato já possui login feito (autenticado via Sanctum), ou se forneceu um token de link direto
            $userToken = auth('sanctum')->user();
            $token = $request->input('token');

            $isAuthenticated = false;
            if ($userToken && $userToken->id === $candidato->id) {
                $isAuthenticated = true;
            } elseif (
                $token &&
                $candidato->candidato_token &&
                hash_equals($candidato->candidato_token, hash('sha256', $token)) &&
                $candidato->candidato_token_expira_em &&
                now()->isBefore($candidato->candidato_token_expira_em)
            ) {
                $isAuthenticated = true;
            }

            if ($isAuthenticated) {
                // Gera ou reutiliza o token Sanctum para a sessão da API
                $sanctumToken = $userToken ? $request->bearerToken() : $candidato->createToken('candidato-token')->plainTextToken;

                $jaAprovado = false;
                $jaAgendado = false;

                if ($candidatoVaga) {
                    $jaAgendado = Entrevista::where('candidato_vaga_id', $candidatoVaga->id)->exists();
                    if (!$jaAgendado && $candidatoVaga->status === 'selecionado') {
                        $jaAprovado = true;
                    }
                }

                return response()->json([
                    'status' => 'authenticated',
                    'token' => $sanctumToken,
                    'candidato' => $candidato->only(self::CAMPOS_PUBLICOS),
                    'ja_aprovado' => $jaAprovado,
                    'ja_agendado' => $jaAgendado,
                ]);
            }

            // Mascaramento de dados de contato para segurança
            $tel = $candidato->telefone;
            $telefoneMascarado = substr($tel, 0, 4) . str_repeat('*', max(0, strlen($tel) - 6)) . substr($tel, -2);
            
            $email = $candidato->email;
            $parts = explode('@', $email);
            $emailMascarado = '***@***.***';
            if (count($parts) === 2) {
                $name = $parts[0];
                $domain = $parts[1];
                $len = strlen($name);
                $maskedName = $len > 2 ? substr($name, 0, 1) . str_repeat('*', $len - 2) . substr($name, -1) : str_repeat('*', $len);
                $emailMascarado = $maskedName . '@' . $domain;
            }

            return response()->json([
                'status' => 'exists',
                'telefone_mascarado' => $telefoneMascarado,
                'email_mascarado' => $emailMascarado,
                'candidato' => $candidato->only(array_diff(self::CAMPOS_PUBLICOS, ['cpf'])),
            ]);
        }

        return response()->json([
            'status' => 'new'
        ]);
    }

    /**
     * Envia código OTP via WhatsApp.
     */
    public function enviarCodigoWhatsApp(Request $request)
    {
        $request->validate([
            'cpf' => 'required|string',
            'vaga_id' => 'nullable|exists:vagas,id',
        ]);

        $cpf = $this->formatarCpf($request->cpf);
        $candidato = Candidatos::where('cpf', $cpf)->first();

        if (!$candidato) {
            return response()->json(['error' => 'Candidato não encontrado.'], 404);
        }

        $codigo = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        $candidato->update([
            'whatsapp_codigo' => $codigo,
            'whatsapp_codigo_expira_em' => now()->addMinutes(config('candidatura.otp_expira_minutos', 15)),
        ]);

        $vaga = $request->vaga_id ? Vagas::find($request->vaga_id) : null;
        $nomeVaga = $vaga?->titulo;

        try {
            $whatsapp = new WhatsAppService();
            
            $mensagem = $nomeVaga 
                ? MensagemWhatsApp::renderizar('otp_candidatura', [
                    'nome' => $candidato->nome,
                    'vaga' => $nomeVaga,
                    'codigo' => $codigo,
                ])
                : "Olá " . $candidato->nome . ", seu código de acesso ao Portal do Candidato é: " . $codigo . ". Validade de 15 minutos.";

            $whatsapp->enviarMensagem(
                $candidato->telefone,
                $mensagem
            );
        } catch (\Exception $e) {
            Log::error('Erro ao enviar OTP por WhatsApp via API.', ['erro' => $e->getMessage()]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Código de verificação enviado para o seu WhatsApp.',
        ]);
    }

    /**
     * Envia código OTP via E-mail.
     */
    public function enviarCodigoEmail(Request $request)
    {
        $request->validate([
            'cpf' => 'required|string',
        ]);

        $cpf = $this->formatarCpf($request->cpf);
        $candidato = Candidatos::where('cpf', $cpf)->first();

        if (!$candidato) {
            return response()->json(['error' => 'Candidato não encontrado.'], 404);
        }

        if (empty($candidato->email)) {
            return response()->json(['error' => 'Candidato não possui e-mail cadastrado.'], 422);
        }

        $codigo = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        $candidato->update([
            'whatsapp_codigo' => $codigo,
            'whatsapp_codigo_expira_em' => now()->addMinutes(config('candidatura.otp_expira_minutos', 15)),
        ]);

        try {
            Mail::raw(
                MensagemWhatsApp::renderizar('otp_email', [
                    'nome' => $candidato->nome,
                    'codigo' => $codigo,
                ]),
                function ($message) use ($candidato) {
                    $message->to($candidato->email)
                        ->subject("Código de Acesso - Processo Seletivo");
                }
            );
        } catch (\Exception $e) {
            Log::error('Erro ao enviar e-mail OTP para candidatura via API.', [
                'candidato_id' => $candidato->id,
                'erro' => $e->getMessage(),
            ]);
            return response()->json(['error' => 'Falha ao enviar e-mail. Tente novamente.'], 500);
        }

        return response()->json([
            'success' => true,
            'message' => 'Código de verificação enviado para o seu e-mail.',
        ]);
    }

    /**
     * Verifica o código OTP e retorna o token Sanctum.
     */
    public function verificarCodigo(Request $request)
    {
        $request->validate([
            'cpf' => 'required|string',
            'codigo' => 'required|string|min:6|max:6',
            'vaga_id' => 'nullable|exists:vagas,id',
        ]);

        $cpf = $this->formatarCpf($request->cpf);
        $candidato = Candidatos::where('cpf', $cpf)->first();

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
        
        // Gera Token Sanctum
        $token = $candidato->createToken('candidato-token')->plainTextToken;

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
            'success' => true,
            'token' => $token,
            'candidato' => $candidato->only(self::CAMPOS_PUBLICOS),
            'ja_aprovado' => $jaAprovado,
            'ja_agendado' => $jaAgendado,
        ]);
    }



    /**
     * Cadastra/atualiza candidatura (cria candidato se for novo, exige Sanctum se já existir).
     */
    public function store(Request $request)
    {
        $rules = [
            'nome' => 'required|string|max:255',
            'cpf' => 'required|string|max:20',
            'email' => 'required|email',
            'telefone' => 'required|string|max:20',
            'path_curriculo' => 'nullable|file|mimes:pdf,doc,docx|mimetypes:application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document|max:10240',
            'cep' => 'required|string|max:20',
            'logradouro' => 'required|string|max:255',
            'nivel_escolaridade' => 'required|string|max:255',
            'regiao' => 'required|string|max:255',
            'como_conheceu' => 'nullable|string|max:255',
            'especialidade' => 'nullable|string|max:255',
            'data_nascimento' => 'nullable|date',
            'vaga_id' => 'required|exists:vagas,id',
        ];

        $validator = Validator::make($request->all(), $rules);
        if ($validator->fails()) {
            return response()->json(['error' => 'Dados inválidos', 'details' => $validator->errors()], 422);
        }

        $validated = $validator->validated();
        $validated['cpf'] = $this->formatarCpf($validated['cpf']);

        $candidatoExistente = Candidatos::where('cpf', $validated['cpf'])->first();

        // Se candidato já existe, ele DEVE estar autenticado via token Sanctum
        if ($candidatoExistente) {
            $userToken = auth('sanctum')->user();
            if (!$userToken || $userToken->id !== $candidatoExistente->id) {
                return response()->json(['error' => 'Acesso não autorizado. OTP necessário.'], 401);
            }
            $candidato = $candidatoExistente;
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

            if ($candidatoExistente) {
                $candidato->update($validated);
            } else {
                $candidato = Candidatos::create($validated);
            }

            // Bloqueia se já participou e falhou/desistiu nesta vaga específica
            $candidatoVagaExistente = CandidatoVaga::where('candidato_id', $candidato->id)
                ->where('vaga_id', $vagaId)
                ->first();

            if ($candidatoVagaExistente && in_array($candidatoVagaExistente->status, ['reprovado', 'recusou_vaga', 'sem_vaga', 'nao_compareceu', 'desclassificado', 'desistiu'])) {
                $motivo = 'não obteve aprovação';
                if ($candidatoVagaExistente->status === 'desistiu' || $candidatoVagaExistente->status === 'recusou_vaga') {
                    $motivo = 'desistiu do processo';
                } elseif ($candidatoVagaExistente->status === 'nao_compareceu') {
                    $motivo = 'não compareceu à entrevista';
                }
                return response()->json([
                    'error' => 'processo_encerrado',
                    'message' => 'Você já participou do processo seletivo para esta vaga anteriormente e ' . $motivo . '. Não é possível se candidatar novamente para a mesma oportunidade.',
                ], 422);
            }

            // Bloqueia se já houver processo ativo em outra vaga (com exceção de candidaturas 'marcada' sem entrevista agendada)
            $vagaAtiva = CandidatoVaga::where('candidato_id', $candidato->id)
                ->whereNotIn('status', ['contratado', 'reprovado', 'recusou_vaga', 'sem_vaga', 'nao_compareceu', 'desclassificado', 'desistiu'])
                ->where('vaga_id', '!=', $vagaId)
                ->where(function ($query) {
                    $query->where('status', '!=', 'marcada')
                          ->orWhere(function ($q) {
                              $q->where('status', 'marcada')
                                ->has('entrevista');
                          });
                })
                ->with('vaga:id,titulo')
                ->first();

            if ($vagaAtiva) {
                return response()->json([
                    'error' => 'Candidatura ativa',
                    'message' => 'Você já possui uma candidatura ativa para a vaga "' . $vagaAtiva->vaga->titulo . '".',
                ], 422);
            }

            // Remove candidaturas pendentes ('marcada') anteriores para manter apenas a nova inscrição ativa
            $candidaturasAntigas = CandidatoVaga::where('candidato_id', $candidato->id)
                ->where('vaga_id', '!=', $vagaId)
                ->where('status', 'marcada')
                ->get();

            foreach ($candidaturasAntigas as $ca) {
                RespostaCandidato::where('candidato_id', $candidato->id)
                    ->where('vaga_id', $ca->vaga_id)
                    ->delete();
                $ca->delete();
            }

            // Vincula candidato à vaga
            $candidato->vagas()->syncWithoutDetaching([
                $vagaId => ['status' => 'marcada']
            ]);

            // Cria token Sanctum se for novo candidato
            $token = $candidatoExistente ? null : $candidato->createToken('candidato-token')->plainTextToken;
            
            $vaga = Vagas::find($vagaId);
            $requiresQuiz = !empty($vaga->formulario_id);

            return response()->json([
                'success' => true,
                'token' => $token, // Apenas novo candidato recebe o token na resposta
                'candidato' => $candidato->only(self::CAMPOS_PUBLICOS),
                'requires_quiz' => $requiresQuiz,
            ]);
        } catch (\Exception $e) {
            Log::error('Erro ao salvar candidatura via API.', ['erro' => $e->getMessage()]);
            return response()->json(['error' => 'Erro interno ao salvar candidatura.'], 500);
        }
    }

    /**
     * Retorna os horários livres.
     */
    public function slotsDisponiveis(Request $request)
    {
        $request->validate([
            'data' => 'required|date_format:Y-m-d|after_or_equal:today',
        ]);

        $agenda = new AgendaService();
        $slots = $agenda->slotsDisponiveis($request->data);

        return response()->json(['slots' => $slots]);
    }

    /**
     * Salva as respostas do questionário e calcula a aprovação.
     */
    public function salvarRespostas(Request $request)
    {
        $request->validate([
            'vaga_id' => 'required|exists:vagas,id',
            'respostas' => 'required|array'
        ]);

        $candidato = auth()->user();
        if (!$candidato || !($candidato instanceof Candidatos)) {
            return response()->json(['error' => 'Não autorizado.'], 401);
        }

        $vaga = Vagas::with('formulario.perguntas')->find($request->vaga_id);

        if (!$vaga->formulario_id || !$vaga->formulario) {
            CandidatoVaga::updateOrCreate(
                ['candidato_id' => $candidato->id, 'vaga_id' => $request->vaga_id],
                ['status' => 'selecionado']
            );
            return response()->json([
                'success' => true,
                'aprovado' => true,
                'message' => 'Candidato selecionado automaticamente (sem questionário).',
            ]);
        }

        $perguntasValidasIds = $vaga->formulario->perguntas->pluck('id')->toArray();
        $acertos = 0;

        foreach ($request->respostas as $perguntaId => $alternativaId) {
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
                ['candidato_id' => $candidato->id, 'vaga_id' => $request->vaga_id],
                ['status' => 'selecionado']
            );
            return response()->json([
                'success' => true,
                'aprovado' => true,
                'acertos' => $acertos,
                'threshold' => $threshold,
                'message' => 'Parabéns, você foi aprovado para agendar a entrevista!',
            ]);
        } else {
            Reprovado::updateOrCreate(
                ['candidato_id' => $candidato->id, 'formulario_id' => $vaga->formulario_id],
                ['reprovado_ate' => now()->addDays(config('candidatura.quarentena_reprovacao_dias', 30))]
            );
            CandidatoVaga::updateOrCreate(
                ['candidato_id' => $candidato->id, 'vaga_id' => $request->vaga_id],
                ['status' => 'reprovado']
            );
            return response()->json([
                'success' => true,
                'aprovado' => false,
                'acertos' => $acertos,
                'threshold' => $threshold,
                'message' => 'Você não atingiu a pontuação mínima necessária.',
            ]);
        }
    }

    /**
     * Agenda a entrevista.
     */
    public function agendarEntrevista(Request $request)
    {
        try {
            $request->validate([
                'vaga_id' => 'required|exists:vagas,id',
                'data_hora' => 'required|date|after:now',
                'tipo' => 'required|string|in:Presencial,Online',
            ]);

            $candidato = auth()->user();
            if (!$candidato || !($candidato instanceof Candidatos)) {
                return response()->json(['error' => 'Não autorizado.'], 401);
            }

            $candidatoVaga = CandidatoVaga::where('candidato_id', $candidato->id)
                ->where('vaga_id', $request->vaga_id)
                ->first();

            if (!$candidatoVaga) {
                return response()->json(['error' => 'Candidato não vinculado a esta vaga.'], 400);
            }

            $vaga = Vagas::find($request->vaga_id);
            if ($request->tipo === 'Online' && !$vaga->permite_online) {
                return response()->json(['error' => 'Esta vaga não permite entrevista online.'], 422);
            }

            $dataHora = Carbon::parse($request->data_hora);
            $agenda = new AgendaService();

            if (!$agenda->validarSlot($dataHora)) {
                return response()->json(['error' => 'Horário indisponível ou fora dos critérios de agenda.'], 422);
            }

            $linkMeet = null;

            $candidatoVaga->update(['status' => 'marcada']);

            Entrevista::create([
                'candidato_vaga_id' => $candidatoVaga->id,
                'data_hora' => $dataHora,
                'tipo' => $request->tipo,
                'user_id' => $vaga->user_id,
            ]);

            $dataHoraBR = $dataHora->copy()->setTimezone('America/Sao_Paulo');
            $dataFormatada = $dataHoraBR->format('d/m/Y');
            $horaFormatada = $dataHoraBR->format('H:i');

            $mensagem = MensagemWhatsApp::renderizar('entrevista_agendada', [
                'nome'     => $candidato->nome,
                'vaga'     => $vaga->titulo,
                'data'     => $dataFormatada,
                'horario'  => $horaFormatada,
                'tipo'     => $request->tipo,
                'endereco' => $request->tipo === 'presencial'
                    ? "\n📌 Endereço: " . config('app.empresa_endereco', 'Alameda Santos, 647 — 15° Andar, São Paulo, SP')
                    : '',
            ]);


            if ($candidato->telefone) {
                EnviarWhatsAppJob::dispatch($candidato->telefone, $mensagem);
            }

            return response()->json(['success' => true, 'message' => 'Entrevista agendada com sucesso!']);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['error' => 'Erro de validação', 'message' => collect($e->errors())->flatten()->first()], 422);
        } catch (\Illuminate\Database\UniqueConstraintViolationException $e) {
            return response()->json(['error' => 'Horário indisponível', 'message' => 'Este horário acabou de ser reservado por outro candidato.'], 422);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Erro interno', 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Cadastra um candidato diretamente no Banco de Talentos.
     */
    public function storeBancoTalentos(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nome' => 'required|string|max:255',
            'cpf' => 'required|string|max:20',
            'email' => 'required|email|max:255',
            'telefone' => 'required|string|max:20',
            'cep' => 'required|string|max:20',
            'logradouro' => 'required|string|max:255',
            'regiao' => 'required|string|max:255',
            'nivel_escolaridade' => 'required|string|max:255',
            'como_conheceu' => 'required|string|max:255',
            'especialidade' => 'required|string|max:255',
            'data_nascimento' => 'required|date',
            'curriculo' => 'required|file|mimes:pdf,doc,docx|mimetypes:application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document|max:10240',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => 'Dados inválidos', 'message' => collect($validator->errors())->flatten()->first(), 'details' => $validator->errors()], 422);
        }

        $validated = $validator->validated();
        $validated['cpf'] = $this->formatarCpf($validated['cpf']);

        $candidatoExistente = Candidatos::where('cpf', $validated['cpf'])->first();
        if ($candidatoExistente) {
            return response()->json([
                'error' => 'Candidato existente',
                'message' => 'CPF já cadastrado. Por favor, acesse o Portal do Candidato para atualizar seu perfil ou candidatar-se a vagas.'
            ], 422);
        }

        $path = null;
        if ($request->hasFile('curriculo')) {
            $path = $request->file('curriculo')->store('curriculos', 'public');
        }

        $candidato = Candidatos::create([
            'nome' => $validated['nome'],
            'cpf' => $validated['cpf'],
            'email' => $validated['email'],
            'telefone' => $validated['telefone'],
            'cep' => $validated['cep'],
            'logradouro' => $validated['logradouro'],
            'regiao' => $validated['regiao'],
            'nivel_escolaridade' => $validated['nivel_escolaridade'],
            'como_conheceu' => $validated['como_conheceu'],
            'especialidade' => $validated['especialidade'],
            'data_nascimento' => $validated['data_nascimento'],
            'path_curriculo' => $path,
            'banco_de_talentos' => true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Perfil cadastrado com sucesso no Banco de Talentos!',
            'candidato' => $candidato
        ], 200);
    }

    /**
     * Standardizes CPF formatting to xxx.xxx.xxx-xx
     */
    private function formatarCpf($cpf)
    {
        $cpfClean = preg_replace('/\D/', '', $cpf);
        if (strlen($cpfClean) === 11) {
            return vsprintf('%s%s%s.%s%s%s.%s%s%s-%s%s', str_split($cpfClean));
        }
        return $cpf;
    }
}
