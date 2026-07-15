<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class RequisicaoDadosApiController extends Controller
{
    /**
     * Registra uma requisição de titular de dados (LGPD) e envia e-mail à ouvidoria.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nome'            => 'required|string|max:255',
            'data_nascimento' => 'required|string|max:20',
            'cpf'             => 'required|string|max:20',
            'telefone'        => 'required|string|max:20',
            'tipo_requisicao' => 'required|string|max:100',
            'mensagem'        => 'required|string|max:3000',
        ]);

        $body  = "Nova Requisição de Titular de Dados (LGPD):\n\n";
        $body .= "Tipo de Requisição: " . $validated['tipo_requisicao'] . "\n\n";
        $body .= "--- Identificação do Titular ---\n";
        $body .= "Nome: "              . $validated['nome']            . "\n";
        $body .= "Data de Nascimento: " . $validated['data_nascimento'] . "\n";
        $body .= "CPF: "               . $validated['cpf']             . "\n";
        $body .= "Telefone: "          . $validated['telefone']        . "\n\n";
        $body .= "--- Detalhes da Solicitação ---\n";
        $body .= $validated['mensagem'] . "\n";

        try {
            Mail::raw($body, function ($message) use ($validated) {
                $message->to('ouvidoria@atsantos.com.br')
                    ->subject("Requisição LGPD: " . $validated['tipo_requisicao'] . " — " . $validated['nome']);
            });
            Log::info('[LGPD] E-mail enviado com sucesso.', ['cpf' => substr($validated['cpf'], 0, 7) . '***', 'tipo' => $validated['tipo_requisicao']]);
        } catch (\Exception $e) {
            Log::error('[LGPD] Erro ao enviar e-mail de requisição de dados.', [
                'cpf'  => substr($validated['cpf'], 0, 7) . '***',
                'erro' => $e->getMessage(),
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Erro ao encaminhar requisição. Tente novamente ou entre em contato por email.',
            ], 500);
        }

        return response()->json([
            'success' => true,
            'message' => 'Requisição registrada e encaminhada ao DPO com sucesso.',
        ], 200);
    }
}
