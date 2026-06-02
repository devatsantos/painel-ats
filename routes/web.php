<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;

Route::get('/', function () {
    if(Auth::check()){
        return redirect()->route('Dashboard');
    } else {
        return redirect()->route('login');
    }
});

Route::get('/candidatura', [App\Http\Controllers\CandidatosController::class, 'candidatura'])->name('Candidatura');
Route::post('/candidatura', [App\Http\Controllers\CandidatosController::class, 'store']);
Route::post('/candidatura/verificar-cpf', [App\Http\Controllers\CandidatosController::class, 'verificarCpf'])
    ->middleware('throttle:verificar-cpf');
Route::post('/candidatura/enviar-codigo', [App\Http\Controllers\CandidatosController::class, 'enviarCodigoWhatsApp'])
    ->middleware('throttle:enviar-codigo-whatsapp');
Route::post('/candidatura/verificar-codigo', [App\Http\Controllers\CandidatosController::class, 'verificarCodigoWhatsApp'])
    ->middleware('throttle:verificar-codigo-whatsapp');
Route::post('/candidatura/verificar-nascimento', [App\Http\Controllers\CandidatosController::class, 'verificarNascimento'])
    ->middleware('throttle:verificar-nascimento');

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

Route::middleware('auth')->group(function () {
    Route::get('/entrevistas', [App\Http\Controllers\EntrevistasController::class, 'index'])->name('Entrevistas');
    Route::put('/entrevistas/{entrevista}/status', [App\Http\Controllers\EntrevistasController::class, 'atualizarStatus'])->name('Entrevistas.status');
    Route::put('/entrevistas/{entrevista}/pegar', [App\Http\Controllers\EntrevistasController::class, 'pegarEntrevista'])->name('Entrevistas.pegar');
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
    }
);