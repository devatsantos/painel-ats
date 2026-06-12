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
Route::post('/candidatura/verificar-nascimento', [App\Http\Controllers\CandidatosController::class, 'verificarNascimento'])
    ->middleware('throttle:verificar-nascimento');
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
Route::post('/portal/verificar-nascimento', [App\Http\Controllers\PortalCandidatoController::class, 'verificarNascimento'])
    ->middleware('throttle:verificar-nascimento');

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
    Route::put('/entrevistas/{entrevista}/adiar', [App\Http\Controllers\EntrevistasController::class, 'adiar'])->name('Entrevistas.adiar');
    Route::get('/dashboard', [\App\Http\Controllers\DashboardController::class, 'index'])->name('Dashboard');
    Route::get('/vagas', [App\Http\Controllers\VagasController::class, 'index'])->name('Vagas');
    Route::post('/vagas', [App\Http\Controllers\VagasController::class, 'store'])->name('Vagas.store');
    Route::delete('/vagas/{vaga}', [App\Http\Controllers\VagasController::class, 'delete'])->name('Vagas.delete');
    Route::put('/vagas/{vaga}', [App\Http\Controllers\VagasController::class, 'update'])->name('Vagas.update');
    Route::get('/usuarios', [App\Http\Controllers\UsuariosController::class, 'index'])->name('Usuarios');
    Route::put('/usuarios/{usuario}', [App\Http\Controllers\UsuariosController::class, 'update'])->name('Usuarios.update');
    Route::delete('/usuarios/{usuario}', [App\Http\Controllers\UsuariosController::class, 'delete'])->name('Usuarios.delete');
    Route::get('talentos', [App\Http\Controllers\TalentosController::class, 'index'])->name('Talentos');
    Route::get('talentos/slots', [App\Http\Controllers\TalentosController::class, 'slotsDisponiveis'])->name('Talentos.slots');
    Route::post('talentos', [App\Http\Controllers\TalentosController::class, 'store'])->name('Talentos.store');
    Route::put('talentos/{candidato}', [App\Http\Controllers\TalentosController::class, 'update'])->name('Talentos.update');
    Route::delete('talentos/{candidato}', [App\Http\Controllers\TalentosController::class, 'delete'])->name('Talentos.delete');
    Route::put('candidatos/{candidato}/banco-de-talentos', [App\Http\Controllers\TalentosController::class, 'adicionarAoBanco'])->name('Talentos.adicionar');
    Route::post('talentos/{candidato}/agendar', [App\Http\Controllers\TalentosController::class, 'agendarEntrevista'])->name('Talentos.agendar');
    Route::post('/usuarios', [App\Http\Controllers\UsuariosController::class, 'store'])->name('Usuarios.store');
    Route::get('/orcamentos', [App\Http\Controllers\OrcamentosController::class, 'index'])->name('Orcamentos');
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
    Route::get('/relatorios/recrutadores', [App\Http\Controllers\RelatoriosController::class, 'recrutadores'])->name('Relatorios.recrutadores');
    Route::get('/base-de-dados', [App\Http\Controllers\BaseDeDadosController::class, 'index'])->name('BaseDeDados');

    // Recepção — Mini-sistema de controle de visitantes
    Route::get('/recepcao', [App\Http\Controllers\RecepcaoController::class, 'index'])->name('Recepcao');
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
    }
);