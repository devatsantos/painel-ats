<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;

Route::get('/', function () {
    if(Auth::check()){
        if(Auth::user()->role === 'recepcao'){
            return redirect()->route('Recepcao');
        }
        return redirect()->route('Dashboard');
    } else {
        return redirect()->route('login');
    }
});

Route::get('/candidatura', [App\Http\Controllers\CandidatosController::class, 'candidatura'])->name('Candidatura');
Route::post('/candidatura/verificar-cpf', [App\Http\Controllers\CandidatosController::class, 'verificarCpf'])
    ->middleware('throttle:verificar-cpf');
Route::post('/candidatura/enviar-codigo', [App\Http\Controllers\CandidatosController::class, 'enviarCodigoWhatsApp'])
    ->middleware('throttle:enviar-codigo-whatsapp');
Route::post('/candidatura/enviar-codigo-email', [App\Http\Controllers\CandidatosController::class, 'enviarCodigoEmail'])
    ->middleware('throttle:enviar-codigo-whatsapp');
Route::post('/candidatura/verificar-codigo', [App\Http\Controllers\CandidatosController::class, 'verificarCodigoWhatsApp'])
    ->middleware('throttle:verificar-codigo-whatsapp');
Route::post('/candidatura', [App\Http\Controllers\CandidatosController::class, 'store']);

Route::middleware('auth:candidato')->group(function () {
    Route::get('/candidatura/perguntas/{vaga}', [App\Http\Controllers\CandidatosController::class, 'perguntas']);
    Route::post('/candidatura/salvar-respostas', [App\Http\Controllers\CandidatosController::class, 'salvarRespostas']);
    Route::get('/candidatura/slots-disponiveis', [App\Http\Controllers\CandidatosController::class, 'slotsDisponiveis']);
    Route::post('/candidatura/agendar-entrevista', [App\Http\Controllers\CandidatosController::class, 'agendarEntrevista']);
    Route::post('/candidatura/token', [App\Http\Controllers\CandidatosController::class, 'gerarToken']);
});

Route::get('/login', [App\Http\Controllers\AuthController::class, 'index'])->name('login');
Route::post('/login', [App\Http\Controllers\AuthController::class, 'login']);
Route::post('/logout', [App\Http\Controllers\AuthController::class, 'logout'])->name('logout');

// Rota protegida para servir arquivos privados (currículos, orçamentos, ouvidorias)
// Acessível a qualquer usuário autenticado (staff ou candidato)
Route::get('/arquivos/{tipo}/{filename}', [App\Http\Controllers\ArquivosController::class, 'serve'])
    ->name('arquivos.serve')
    ->where('filename', '.+');


// Portal do Candidato — Login (rota pública)
Route::get('/portal', [App\Http\Controllers\PortalCandidatoController::class, 'login'])->name('Portal.login');
Route::post('/portal/verificar-cpf', [App\Http\Controllers\PortalCandidatoController::class, 'verificarCpf'])
    ->middleware('throttle:verificar-cpf');
Route::post('/portal/enviar-codigo', [App\Http\Controllers\PortalCandidatoController::class, 'enviarCodigo'])
    ->middleware('throttle:enviar-codigo-whatsapp');
Route::post('/portal/enviar-codigo-email', [App\Http\Controllers\PortalCandidatoController::class, 'enviarCodigoEmail'])
    ->middleware('throttle:enviar-codigo-whatsapp');
Route::post('/portal/verificar-codigo', [App\Http\Controllers\PortalCandidatoController::class, 'verificarCodigo'])
    ->middleware('throttle:verificar-codigo-whatsapp');


// Portal do Candidato — Rotas protegidas
Route::middleware('auth:candidato')->prefix('portal')->group(function () {
    Route::get('/dashboard', [App\Http\Controllers\PortalCandidatoController::class, 'index'])->name('Portal');
    Route::get('/candidatura/{vaga}', [App\Http\Controllers\PortalCandidatoController::class, 'show'])->name('Portal.candidatura');
    Route::get('/perfil', [App\Http\Controllers\PortalCandidatoController::class, 'perfil'])->name('Portal.perfil');
    Route::put('/perfil', [App\Http\Controllers\PortalCandidatoController::class, 'atualizarPerfil'])->name('Portal.perfil.update');
    Route::post('/token', [App\Http\Controllers\PortalCandidatoController::class, 'gerarToken'])->name('Portal.token');
    Route::post('/banco-de-talentos', [App\Http\Controllers\PortalCandidatoController::class, 'toggleBancoTalentos'])->name('Portal.banco-talentos');
    Route::post('/logout', [App\Http\Controllers\PortalCandidatoController::class, 'logout'])->name('Portal.logout');
});

// Ouvidoria - Rotas Públicas
Route::get('/ouvidoria/nova', [App\Http\Controllers\OuvidoriaController::class, 'create'])->name('Ouvidoria.nova');
Route::post('/ouvidoria', [App\Http\Controllers\OuvidoriaController::class, 'store'])->name('Ouvidoria.store');

Route::middleware('auth')->group(function () {
    Route::get('/entrevistas', [App\Http\Controllers\EntrevistasController::class, 'index'])->name('Entrevistas');
    Route::put('/entrevistas/{entrevista}/status', [App\Http\Controllers\EntrevistasController::class, 'atualizarStatus'])->name('Entrevistas.status');
    Route::put('/entrevistas/{entrevista}/pegar', [App\Http\Controllers\EntrevistasController::class, 'pegarEntrevista'])->name('Entrevistas.pegar');
    Route::put('/entrevistas/{entrevista}/desatribuir', [App\Http\Controllers\EntrevistasController::class, 'desatribuirEntrevista'])->name('Entrevistas.desatribuir');
    Route::put('/entrevistas/{entrevista}/adiar', [App\Http\Controllers\EntrevistasController::class, 'adiar'])->name('Entrevistas.adiar');
    Route::get('/dashboard', [\App\Http\Controllers\DashboardController::class, 'index'])->name('Dashboard');
    Route::get('/vagas', [App\Http\Controllers\VagasController::class, 'index'])->name('Vagas');
    Route::post('/vagas', [App\Http\Controllers\VagasController::class, 'store'])->name('Vagas.store');
    Route::delete('/vagas/{vaga}', [App\Http\Controllers\VagasController::class, 'delete'])->name('Vagas.delete');
    Route::put('/vagas/{vaga}', [App\Http\Controllers\VagasController::class, 'update'])->name('Vagas.update');
    Route::get('/usuarios', [App\Http\Controllers\UsuariosController::class, 'index'])->name('Usuarios');
    Route::put('/usuarios/{usuario}', [App\Http\Controllers\UsuariosController::class, 'update'])->name('Usuarios.update');
    Route::delete('/usuarios/{usuario}', [App\Http\Controllers\UsuariosController::class, 'delete'])->name('Usuarios.delete');
    Route::get('/candidatos', [App\Http\Controllers\TalentosController::class, 'index'])->name('Candidatos');
    Route::get('/candidatos/slots', [App\Http\Controllers\TalentosController::class, 'slotsDisponiveis'])->name('Candidatos.slots');
    Route::get('/candidatos/exportar', [App\Http\Controllers\TalentosController::class, 'exportar'])->name('Candidatos.exportar');
    Route::post('/candidatos', [App\Http\Controllers\TalentosController::class, 'store'])->name('Candidatos.store');
    Route::put('/candidatos/{candidato}', [App\Http\Controllers\TalentosController::class, 'update'])->name('Candidatos.update');
    Route::delete('/candidatos/{candidato}', [App\Http\Controllers\TalentosController::class, 'delete'])->name('Candidatos.delete');
    Route::put('/candidatos/{candidato}/banco-de-talentos', [App\Http\Controllers\TalentosController::class, 'adicionarAoBanco'])->name('Candidatos.adicionar');
    Route::post('/candidatos/{candidato}/agendar', [App\Http\Controllers\TalentosController::class, 'agendarEntrevista'])->name('Candidatos.agendar');
    Route::redirect('/talentos', '/candidatos', 301);
    Route::redirect('/base-de-dados', '/candidatos', 301);
    Route::post('/usuarios', [App\Http\Controllers\UsuariosController::class, 'store'])->name('Usuarios.store');
    Route::get('/orcamentos', [App\Http\Controllers\OrcamentosController::class, 'index'])->name('Orcamentos');
    Route::post('/orcamentos', [App\Http\Controllers\OrcamentosController::class, 'store'])->name('Orcamentos.store');
    Route::put('/orcamentos/{orcamento}', [App\Http\Controllers\OrcamentosController::class, 'update'])->name('Orcamentos.update');
    Route::delete('/orcamentos/{orcamento}', [App\Http\Controllers\OrcamentosController::class, 'delete'])->name('Orcamentos.delete');
    Route::get('/formularios', [App\Http\Controllers\FormulariosController::class, 'index'])->name('Formularios');
    Route::post('/formularios', [App\Http\Controllers\FormulariosController::class, 'store'])->name('Formularios.store');
    Route::get('/formularios/{formulario}/edit', [App\Http\Controllers\FormulariosController::class, 'edit'])->name('Formularios.edit');
    Route::put('/formularios/{formulario}', [App\Http\Controllers\FormulariosController::class, 'update'])->name('Formularios.update');
    Route::delete('/formularios/{formulario}', [App\Http\Controllers\FormulariosController::class, 'delete'])->name('Formularios.delete');
    Route::get('/agenda', [App\Http\Controllers\AgendaController::class, 'index'])->name('Agenda');
    Route::post('/agenda', [App\Http\Controllers\AgendaController::class, 'store'])->name('Agenda.store');
    Route::put('/agenda/configuracao', [App\Http\Controllers\AgendaController::class, 'atualizarConfiguracao'])->name('Agenda.configuracao');
    Route::put('/agenda/{bloqueio}', [App\Http\Controllers\AgendaController::class, 'update'])->name('Agenda.update');
    Route::delete('/agenda/{bloqueio}', [App\Http\Controllers\AgendaController::class, 'delete'])->name('Agenda.delete');
    Route::get('/relatorios', [App\Http\Controllers\RelatoriosController::class, 'index'])->name('Relatorios');
    Route::get('/relatorios/funil', [App\Http\Controllers\RelatoriosController::class, 'funil'])->name('Relatorios.funil');
    Route::get('/relatorios/time-to-hire', [App\Http\Controllers\RelatoriosController::class, 'timeToHire'])->name('Relatorios.timeToHire');
    Route::get('/relatorios/volume', [App\Http\Controllers\RelatoriosController::class, 'volume'])->name('Relatorios.volume');
    Route::get('/relatorios/performance', [App\Http\Controllers\RelatoriosController::class, 'performance'])->name('Relatorios.performance');

    // Reprovados — Listagem de candidatos bloqueados por quiz
    Route::get('/reprovados', [App\Http\Controllers\ReprovadosController::class, 'index'])->name('Reprovados');
    Route::delete('/reprovados/{reprovado}', [App\Http\Controllers\ReprovadosController::class, 'delete'])->name('Reprovados.delete');

    // Recepção — Mini-sistema de controle de visitantes
    Route::get('/recepcao', [App\Http\Controllers\RecepcaoController::class, 'index'])->name('Recepcao');
    Route::get('/recepcao/autocomplete', [App\Http\Controllers\RecepcaoController::class, 'autocomplete'])->name('Recepcao.autocomplete');
    Route::get('/recepcao/exportar', [App\Http\Controllers\RecepcaoController::class, 'exportar'])->name('Recepcao.exportar');
    Route::post('/recepcao/entrevistas/{entrevista}/chegada', [App\Http\Controllers\RecepcaoController::class, 'marcarChegada'])->name('Recepcao.chegada');
    Route::post('/recepcao', [App\Http\Controllers\RecepcaoController::class, 'store'])->name('Recepcao.store');
    Route::put('/recepcao/{recepcao}', [App\Http\Controllers\RecepcaoController::class, 'update'])->name('Recepcao.update');
    Route::put('/recepcao/{recepcao}/saida', [App\Http\Controllers\RecepcaoController::class, 'registrarSaida'])->name('Recepcao.saida');
    Route::delete('/recepcao/{recepcao}', [App\Http\Controllers\RecepcaoController::class, 'delete'])->name('Recepcao.delete');

    // Ouvidoria - Rotas Administrativas
    Route::get('/ouvidoria', [App\Http\Controllers\OuvidoriaController::class, 'index'])->name('Ouvidoria');
    Route::delete('/ouvidoria/{ouvidoria}', [App\Http\Controllers\OuvidoriaController::class, 'delete'])->name('Ouvidoria.delete');

    // Logs de Erro
    Route::get('/logs', [App\Http\Controllers\LogsController::class, 'index'])->name('Logs');
    Route::delete('/logs', [App\Http\Controllers\LogsController::class, 'clear'])->name('Logs.clear');
    Route::get('/logs/whatsapp-status', [App\Http\Controllers\LogsController::class, 'whatsappStatus'])->name('Logs.whatsapp.status');
    Route::post('/logs/whatsapp-testar', [App\Http\Controllers\LogsController::class, 'whatsappTestar'])->name('Logs.whatsapp.testar');
    Route::get('/logs/portal-status', [App\Http\Controllers\LogsController::class, 'portalStatus'])->name('Logs.portal.status');
    Route::post('/logs/portal-testar', [App\Http\Controllers\LogsController::class, 'portalTestar'])->name('Logs.portal.testar');
    Route::get('/logs/email-status', [App\Http\Controllers\LogsController::class, 'emailStatus'])->name('Logs.email.status');
    Route::post('/logs/email-testar', [App\Http\Controllers\LogsController::class, 'emailTestar'])->name('Logs.email.testar');

    // Mensagens WhatsApp — Templates personalizáveis
    Route::get('/configuracoes/mensagens-whatsapp', [App\Http\Controllers\MensagensWhatsAppController::class, 'index'])->name('MensagensWhatsApp');
    Route::put('/configuracoes/mensagens-whatsapp/{mensagem}', [App\Http\Controllers\MensagensWhatsAppController::class, 'update'])->name('MensagensWhatsApp.update');
    Route::post('/configuracoes/mensagens-whatsapp/{mensagem}/resetar', [App\Http\Controllers\MensagensWhatsAppController::class, 'resetar'])->name('MensagensWhatsApp.resetar');
    Route::post('/configuracoes/mensagens-whatsapp/preview', [App\Http\Controllers\MensagensWhatsAppController::class, 'preview'])->name('MensagensWhatsApp.preview');

    // Configurações Gerais — Prazos e durações
    Route::get('/configuracoes/gerais', [App\Http\Controllers\ConfiguracaoController::class, 'index'])->name('Configuracoes.gerais');
    Route::put('/configuracoes/gerais', [App\Http\Controllers\ConfiguracaoController::class, 'update'])->name('Configuracoes.gerais.update');
    }
);