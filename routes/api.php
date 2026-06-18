<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\VagasApiController;
use App\Http\Controllers\Api\CandidaturaApiController;
use App\Http\Controllers\Api\PortalApiController;
use App\Http\Controllers\Api\OrcamentoApiController;
use App\Http\Controllers\Api\OuvidoriaApiController;
use App\Http\Controllers\Api\RequisicaoDadosApiController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Rotas Públicas - Vagas
Route::get('/vagas', [VagasApiController::class, 'index']);
Route::get('/vagas/{vaga}', [VagasApiController::class, 'show']);

// Rota Pública - Orçamento
Route::post('/orcamento', [OrcamentoApiController::class, 'store']);

// Rota Pública - Ouvidoria
Route::post('/ouvidoria', [OuvidoriaApiController::class, 'store']);

// Rota Pública - Requisição de Titular de Dados (LGPD)
Route::post('/requisicao-dados', [RequisicaoDadosApiController::class, 'store']);

// Rota Pública - Banco de Talentos (Trabalhe Conosco)
Route::post('/banco-de-talentos', [CandidaturaApiController::class, 'storeBancoTalentos']);

// Rotas Públicas - Candidatura (Processo de Autenticação / Início de Cadastro)
Route::get('/candidatura/slots-disponiveis', [CandidaturaApiController::class, 'slotsDisponiveis']);
Route::post('/candidatura/verificar-cpf', [CandidaturaApiController::class, 'verificarCpf'])
    ->middleware('throttle:verificar-cpf');
Route::post('/candidatura/enviar-codigo', [CandidaturaApiController::class, 'enviarCodigoWhatsApp'])
    ->middleware('throttle:enviar-codigo-whatsapp');
Route::post('/candidatura/enviar-codigo-email', [CandidaturaApiController::class, 'enviarCodigoEmail'])
    ->middleware('throttle:enviar-codigo-whatsapp');
Route::post('/candidatura/verificar-codigo', [CandidaturaApiController::class, 'verificarCodigo'])
    ->middleware('throttle:verificar-codigo-whatsapp');
Route::post('/candidatura/verificar-nascimento', [CandidaturaApiController::class, 'verificarNascimento'])
    ->middleware('throttle:verificar-nascimento');

// Rota de Envio de Cadastro de Candidato (cria candidato se novo ou exige Sanctum no middleware se existente)
Route::post('/candidatura', [CandidaturaApiController::class, 'store']);

// Rotas Protegidas - Candidatos (Autenticados via Sanctum Bearer Token)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/candidatura/salvar-respostas', [CandidaturaApiController::class, 'salvarRespostas']);
    Route::post('/candidatura/agendar-entrevista', [CandidaturaApiController::class, 'agendarEntrevista']);

    // Portal do Candidato
    Route::get('/portal/dashboard', [PortalApiController::class, 'dashboard']);
    Route::get('/portal/perfil', [PortalApiController::class, 'perfil']);
    Route::put('/portal/perfil', [PortalApiController::class, 'atualizarPerfil']);
    Route::post('/portal/banco-de-talentos', [PortalApiController::class, 'toggleBancoTalentos']);
    Route::post('/portal/logout', [PortalApiController::class, 'logout']);
});
