# Painel RH — Regras

## 0. Comunicação
- Antes de modificar: descrever o que e por quê
- Lógica nova: explicar o raciocínio, trade-offs, o que pode quebrar e limitações conhecidas
- Bugs: descrever causa raiz, não apenas a correção
- Padrões do framework (Jobs, Events, etc.): explicar o que resolve naquele contexto
- Nunca responder apenas "Feito." ou "Código atualizado."

## 1. Stack
- Backend: Laravel (PHP) | Frontend: React + Inertia.js (`.jsx` em `resources/js/Paginas/`)
- Estilização: TailwindCSS — proibido CSS inline ou libs de UI externas sem aprovação
- Fonte global: Google Sans Flex (`resources/css/app.css` → `--font-sans`; importada em `app.blade.php`)
- Banco: MySQL via Eloquent ORM — SQL bruto proibido salvo performance justificada
- WhatsApp: Evolution API via `App\Services\WhatsAppService` — toda notificação passa por aqui
- Jobs assíncronos: `App\Jobs\` — operações externas (ex: WhatsApp) nunca síncronas no request

## 2. Estrutura
- Controllers: `app/Http/Controllers/` — 1 por módulo
- Models: `app/Models/` — 1 por model
- Services: `app/Services/` — integrações externas; nunca no controller
- Jobs: `app/Jobs/` — processos assíncronos
- Migrations: `database/migrations/` — sempre com `down()` implementado
- Páginas: `resources/js/Paginas/{Modulo}/Index.jsx` (lista) | `Edit.jsx` (edição)
- Componentes reutilizáveis: `resources/js/Paginas/Componentes/`
  - `Index.jsx` — Sidebar de navegação
  - `Paginacao.jsx` — controles de paginação Inertia
  - `FlashMessages.jsx` — banner success/error (lê `flash` do usePage internamente)
  - `WhatsAppLink.jsx` — botão wa.me com SVG; aceita prop `telefone` (string bruta)
- Utilitários JS: `resources/js/utils/`
  - `cep.js` — helper `consultarCep(cep)` centralizado; lê URL base de `appConfig.viacep_url` (Inertia shared)
- `getIniciais(nome)` — função local nos módulos que precisam de avatar; usar `nome.trim().split(/\s+/)` (não `split(' ')`)
- Logos: armazenados localmente em `public/images/logo.png` e `public/images/logo-white.png` — nunca usar URLs externas (Vercel Blob, etc.)
- Console Commands: `app/Console/Commands/ImportarFeriados.php` — importa feriados da BrasilAPI
- Lógica de negócio nunca em `routes/web.php`

## 3. Autenticação e Guards
Dois guards separados — nunca misturar:

| Guard | Model | Uso |
|---|---|---|
| `web` | `User` | Painel interno (RH/admin) — autentica por CPF+senha |
| `candidato` | `Candidatos` | Fluxo público de candidatura — ativado **somente** após verificação OTP WhatsApp / E-mail ou aprovação prévia no quiz |

- Rotas internas: `middleware('auth')` | Candidatura autenticada: `middleware('auth:candidato')`
- **`Auth::guard('candidato')->login()` só pode ocorrer em dois lugares:**
  1. `verificarCodigo()` / `verificarCodigoWhatsApp()` — após código OTP (WhatsApp ou E-mail) validado
  2. `verificarCpf()` — **exclusivamente** no branch `ja_aprovado` (candidato aprovado no quiz, indo direto ao agendamento)
  - ⚠️ Nunca chamar `login()` em `verificarCpf()` antes do OTP: permite bypass do 2FA por CPF alheio
- Rate limiting de login: 5 tentativas/60s por CPF+IP — nunca remover
- Controle de acesso interno por `role` (campo `string` na tabela `users`): `admin` | `recrutador` | `coordenador` | `recepcao`
- Permissão de Vagas: Apenas roles `admin` e `coordenador` podem criar, editar, excluir ou alterar o status ativo de vagas (`VagasController::store/update/delete`).
- Vagas Internas: Vagas marcadas como `interna` (booleano) são privadas e ocultadas do portal de candidatura pública (`CandidatosController::candidatura()`). São identificáveis no painel administrativo pelo badge "🔒 Vaga Interna".
- Guard de admin: `abort_unless(auth()->user()->role === 'admin', 403)` — nunca usar `is_admin`
- `role` compartilhado via `HandleInertiaRequests` como `auth.user.role`

## 4. Rotas
- Todas em `routes/web.php` | `api.php` reservado para Sanctum futuro
- Nomenclatura: `Modulo`, `Modulo.store`, `Modulo.update`, `Modulo.delete`, `Modulo.edit`
- HTTP: `GET` lista/edição | `POST` criação | `PUT` atualização | `DELETE` exclusão
- Proibido verbos na URL (`/vagas/criar` → usar `POST /vagas`)

## 5. Controllers
- Métodos: `index`, `store`, `update`, `delete`, `edit`
- Validação obrigatória em todo `store`/`update` via `$request->validate()`
- Validação idêntica entre `store`/`update` → extrair para método privado `rules(): array`
- Lógica repetida de persistência (ex: criar perguntas+alternativas) → método privado dedicado
- Listas de campos expostos ao frontend → constante de classe (ex: `CandidatosController::CAMPOS_PUBLICOS`)
- Com route-model binding tipado (`Vagas $vaga`) não checar `if (!$model)` — o 404 é automático
- `Inertia::render()` sempre com caminho completo `Modulo/Index` (nunca só `Modulo`)
- Retorno: `Inertia::render()` para páginas | `redirect()->route()` após mutações | `response()->json()` para API
- Lógica complexa → extrair para `Service`
- Proibido `User::first()` como entrevistador — usar usuário autenticado ou seleção explícita

## 6. Models e Banco
- `$fillable` obrigatório em todo model — proibido `$guarded = []`
- Relacionamentos definidos no model, não no controller
- Soft deletes em dados críticos: candidatos, vagas, formulários
- `nullable` no banco = `nullable()` na migration + `'nullable'` na validação
- **Status de `candidato_vaga.status`:** `marcada` | `selecionado` | `contratado` | `reprovado` | `recusou_vaga` | `sem_vaga` | `nao_compareceu`

## 7. Fluxo do Candidato
Sequência obrigatória — candidato não pode pular etapas:
```
1. GET  /candidatura                     → vagas ativas
2. POST /candidatura/verificar-cpf       → valida CPF, checa bloqueio/reprovação/vaga ativa
   ├─ CPF novo                           → etapa 'formulario' (sem auth ainda)
   ├─ CPF existente + ja_agendado        → alerta, fluxo encerrado
   ├─ CPF existente + ja_aprovado        → login guard candidato + etapa 'entrevista' (pula quiz)
   └─ CPF existente (padrão)             → etapa 'verificacao' (WhatsApp / E-mail OTP, sem login ainda)
3. POST /candidatura/enviar-codigo       → gera código OTP (6 dígitos, expira 15min), envia WhatsApp
   POST /candidatura/enviar-codigo-email → gera código OTP (6 dígitos, expira 15min), envia e-mail
4. POST /candidatura/verificar-codigo    → valida OTP (WhatsApp ou E-mail) → login guard candidato + etapa 'formulario'
5. POST /candidatura                     → store: cadastro/atualização + vínculo à vaga (status: marcada) + login guard candidato
6. GET  /candidatura/perguntas/{vaga}    → formulário com perguntas/alternativas [auth:candidato]
7. POST /candidatura/salvar-respostas    → corrige quiz → aprovado (selecionado) ou bloqueado 30 dias [auth:candidato]
8. POST /candidatura/agendar-entrevista  → cria entrevista + dispara EnviarWhatsAppJob [auth:candidato]
```
- Threshold: **por formulário**, armazenado em `formularios.threshold` (inteiro, min 1) — imutável via request; lido em `CandidatosController@salvarRespostas` como `$vaga->formulario->threshold`
- Bloqueio: **30 dias** por `formulario_id` — verificado em `verificarCpf`, não só no frontend
- Respostas: `updateOrCreate` em `resposta_candidatos`
- Campos OTP no model `Candidatos`: `whatsapp_codigo` (varchar 10, nullable) | `whatsapp_codigo_expira_em` (timestamp, nullable) — **reutilizados para ambos os canais de envio (WhatsApp e E-mail)**

### Rate Limiting WhatsApp e E-mail (definido em `AppServiceProvider::boot()`)
| Limiter | Limite | Chave |
|---|---|---|
| `enviar-codigo-whatsapp` | 1 envio / 5 min | CPF + IP |
| `verificar-codigo-whatsapp` | 15 tentativas / 2 min | CPF + IP |
- Aplicado como `->middleware('throttle:enviar-codigo-whatsapp')` nas rotas de envio (tanto WhatsApp quanto E-mail)
- Resposta 429: `{ "error": "mensagem amigável" }` — frontend exibe na tela de verificação

## 8. Inertia — Dados Compartilhados
- Dados globais: editar `HandleInertiaRequests::share()` — nunca props manuais por controller
- Compartilhado atualmente:
  - `flash.error`, `flash.success`
  - `auth.user` (`id`, `nome`, `role`) — guard `web`
  - `auth.candidato` (`id`, `nome`) — guard `candidato`
  - `appConfig.viacep_url` — URL base do ViaCEP (via `config('services.viacep.url')`)
  - `appConfig.logo_url` — URL local do logo colorido (`asset('images/logo.png')`)
  - `appConfig.logo_white_url` — URL local do logo branco (`asset('images/logo-white.png')`)
- Flash: `redirect()->with('success'/'error', '...')`

## 9. Uploads
- Disco: `Storage::disk('public')` — nunca salvar direto em `public/`
- Paths: `curriculos/` (candidatos) | `orcamentos/` (orçamentos)
- Extensões: `pdf`, `doc`, `docx` | Tamanho: 10MB currículos, 2MB demais
- Ao deletar registro: deletar arquivo do storage junto

## 10. Módulos

| Módulo | Controller | Models | Rota |
|---|---|---|---|
| Auth | `AuthController` | `User` | `/login` |
| Dashboard | `DashboardController` | `Entrevista`, `Vagas`, `CandidatoVaga` | `/dashboard` |
| Vagas | `VagasController` | `Vagas`, `Formulario` | `/vagas` — CRUD restrito a `admin`/`coordenador` |
| Formulários | `FormulariosController` | `Formulario`, `Pergunta`, `Alternativa` | `/formularios` |
| Candidatura | `CandidatosController` | `Candidatos`, `CandidatoVaga`, `RespostaCandidato`, `Reprovado` | `/candidatura` |
| Entrevistas | `EntrevistasController` | `Entrevista`, `CandidatoVaga`, `User`, `MensagemWhatsApp` | `/entrevistas` |
| Usuários | `UsuariosController` | `User` | `/usuarios` |
| Candidatos | `TalentosController` | `Candidatos`, `CandidatoVaga`, `Entrevista`, `Vagas` | `/candidatos` |
| Orçamentos | `OrcamentosController` | `Orcamento` | `/orcamentos` |
| Agenda | `AgendaController` | `BloqueioAgenda`, `ConfiguracaoAgenda` | `/agenda` |
| Reprovados | `ReprovadosController` | `Reprovado`, `Formulario` | `/reprovados` ⚠️ pendente |
| Relatórios | `RelatoriosController` | — (dados estáticos por ora) | `/relatorios` |
| Portal Candidato | `PortalCandidatoController` | `Candidatos`, `CandidatoVaga`, `Entrevista`, `Vagas` | `/portal` |
| Recepção | `RecepcaoController` | `Recepcao`, `User` | `/recepcao` — página exclusiva para role `recepcao` |
| Ouvidoria | `OuvidoriaController` | `Ouvidoria` | `/ouvidoria` (admin) · `/ouvidoria/nova` (pública) |
| Logs | `LogsController` | — | `/logs` — admin; status WhatsApp e Portal |
| Mensagens WhatsApp | `MensagensWhatsAppController` | `MensagemWhatsApp` | `/configuracoes/mensagens-whatsapp` — admin |
| Configurações Gerais | `ConfiguracaoController` | `Configuracao` | `/configuracoes/gerais` — admin |

## 11. Pendentes
- `ReprovadosController`: listagem de reprovados com filtro por formulário/data + página JSX
- `OrcamentosController`: implementar `update`

## 12. Nomenclatura
- Controllers: `PascalCaseController` | Models: `PascalCase` | Tabelas: `snake_case_plural`
- Rotas nomeadas: `Modulo.acao` | Componentes React: `PascalCase`
- Props Inertia: `camelCase` no JS, `snake_case` no PHP

## 13. Variáveis de Ambiente
```
DB_CONNECTION / DB_HOST / DB_PORT / DB_DATABASE / DB_USERNAME / DB_PASSWORD
EVOLUTION_API_URL / EVOLUTION_API_KEY / EVOLUTION_INSTANCE
FERIADOS_API_KEY / FERIADOS_API_UF / FERIADOS_API_URL
VIACEP_URL / BRASILAPI_URL
PORTAL_ATSANTOS_URL / PORTAL_ATSANTOS_API_KEY
MAIL_MAILER / MAIL_HOST / MAIL_PORT / MAIL_USERNAME / MAIL_PASSWORD / MAIL_ENCRYPTION / MAIL_FROM_ADDRESS / MAIL_FROM_NAME
FILESYSTEM_DISK=public
APP_ENV=production (prod) | APP_DEBUG=false (prod)
```
- URLs de APIs externas centralizadas em `config/services.php` (nunca hardcoded nos controllers/services)
- Services mapeados: `evolution`, `feriados_api`, `brasilapi`, `viacep`, `portal_atsantos`

## 14. Segurança (OWASP Top 10)
- **A01 Broken Access Control:** verificar propriedade do recurso além do `findOrFail`; guards não se cruzam; `Auth::guard('candidato')->login()` só após OTP validado ou branch `ja_aprovado`
- **A02 Crypto:** senhas via `Hash::make()` (bcrypt) exclusivamente; CPF mascarado (`***.456.789-**`); OTP 6 dígitos com `random_int()` (criptograficamente seguro); não logar dados sensíveis; HTTPS para Evolution API
- **A03 Injection:** Eloquent ORM sempre; proibido `dangerouslySetInnerHTML`; `$fillable` obrigatório
- **A04 Insecure Design:** fluxo do candidato sem pulo de etapas; threshold e bloqueio imutáveis via request; OTP expira conforme `config('candidatura.otp_expira_minutos')` e é invalidado após uso
- **A05 Misconfiguration:** `APP_DEBUG=false` em produção; `.env` no gitignore; `storage/` não acessível publicamente
- **A06 Outdated Components:** `composer audit` + `npm audit` regulares
- **A07 Auth Failures:** rate limiting 5/60s no login + rate limiting no envio/verificação de OTP (seção 7); `session()->regenerate()` no login; `session()->invalidate()` no logout
- **A08 Integrity:** proibido `eval()`, `exec()`, `shell_exec()`; uploads validados por extensão **e** MIME type
- **A09 Logging:** erros externos via `Log::error()`; sem stack trace para o usuário final em produção
- **A10 SSRF:** URLs de APIs externas (Evolution, ViaCEP, BrasilAPI, FeriadosAPI) só via `config/services.php` + `.env`; nunca fetch para URL fornecida pelo usuário

### LGPD
- Ao deletar candidato: remover respostas, vínculos, arquivos no storage
- Não compartilhar dados entre vagas sem consentimento
- Retenção: candidatos não aprovados há +1 ano elegíveis para exclusão

## 15. Proibido
- `->get()` / `->all()` sem paginação em tabelas que crescem (candidatos, entrevistas, orçamentos)
- Lógica síncrona e blocante no request (uploads pesados, chamadas externas) — usar Jobs
- `dd()`, `dump()`, `var_dump()` em produção
- SQL bruto sem binding | `User::first()` como entrevistador
- Segundo controller para o mesmo módulo | Migrations sem `down()`
- Commits com `.env` ou credenciais
- corromper arquivos e mudar encoding, APENAS UTF-8

## 16. Configurações Dinâmicas (Prazos e Durações)
- Os prazos e durações (OTP, token, seleção, quarentena, entrevista) são armazenados no banco de dados (tabela `configuracoes`).
- Carregados dinamicamente em `AppServiceProvider::boot` sobrescrevendo as chaves `config('candidatura.*')`.
- Tela para edição: `/configuracoes/gerais` (restrito para `admin`).
- Controllers e Services continuam lendo via `config('candidatura.otp_expira_minutos')`, etc. — sem acoplamento ao banco.

## 17. Mensagens WhatsApp e E-mail
- Templates de mensagens personalizáveis armazenados na tabela `mensagens_whatsapp` (model `MensagemWhatsApp`).
- Tela para edição: `/configuracoes/mensagens-whatsapp` (restrito para `admin`).
- Leitura nos controllers via `MensagemWhatsApp::where('chave', '...')` — nunca hardcoded.
- Variáveis dinâmicas nos templates: `{nome}`, `{vaga}`, `{codigo}`, `{data}`, `{horario}`, etc.
- Chaves existentes: `otp_candidatura`, `otp_portal`, `entrevista_agendada`, `entrevista_adiada`, `otp_email`.

## 18. Services
| Service | Responsabilidade |
|---|---|
| `WhatsAppService` | Envio de mensagens via Evolution API |
| `AgendaService` | Cálculo de slots e importação de feriados (FeriadosAPI) |
| `PortalAtSantosService` | Integração com Portal AT Santos externo |