<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Orcamento;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class OrcamentoApiController extends Controller
{
    /**
     * Store a newly created budget request (orcamento) in the database
     * and send an email to marketing@atsantos.com.br.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nome_representante' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'telefone' => 'required|string|max:20',
            'cidade' => 'required|string|max:255',
            'estado' => 'required|string|max:255',
            'empresa' => 'required|string|max:255',
            'iniciativa' => 'required|string|max:255',
            'servicos' => 'required|string|max:255',
            'anexo_referencia' => 'nullable|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:4096',
            'descricao' => 'required|string|max:2000',
        ]);

        $anexoPath = null;
        if ($request->hasFile('anexo_referencia')) {
            $path = $request->file('anexo_referencia')->store('orcamentos', 'private');
            $validated['anexo_referencia'] = 'orcamentos/' . basename($path);
            $anexoPath = Storage::disk('private')->path($path);
        }

        // Prepara o corpo do email
        $body = "Nova solicitação de orçamento recebida (TESTE):\n\n";
        $body .= "Nome do Representante: " . $validated['nome_representante'] . "\n";
        $body .= "Email: " . $validated['email'] . "\n";
        $body .= "Telefone: " . $validated['telefone'] . "\n";
        $body .= "Cidade/Estado: " . $validated['cidade'] . " - " . $validated['estado'] . "\n";
        $body .= "Empresa/Instituição: " . $validated['empresa'] . "\n";
        $body .= "Iniciativa: " . $validated['iniciativa'] . "\n";
        $body .= "Serviço Desejado: " . $validated['servicos'] . "\n\n";
        $body .= "Descrição da Demanda:\n" . $validated['descricao'] . "\n\n";
        if (isset($validated['anexo_referencia'])) {
            $body .= "Anexo de referência: " . asset($validated['anexo_referencia']) . "\n";
        }

        $status = 'enviado';

        try {
            Mail::raw($body, function ($message) use ($validated, $anexoPath) {
                $message->to('marketing@atsantos.com.br')
                    ->subject("TESTE - Solicitação de Orçamento - " . $validated['empresa']);
                if ($anexoPath && file_exists($anexoPath)) {
                    $message->attach($anexoPath);
                }
            });
        } catch (\Exception $e) {
            Log::error('Erro ao enviar e-mail de orçamento (API).', [
                'empresa' => $validated['empresa'],
                'erro' => $e->getMessage(),
            ]);
            $status = 'falhou';
        }

        $validated['status'] = $status;

        $orcamento = Orcamento::create($validated);

        return response()->json([
            'success' => true,
            'message' => $status === 'enviado' 
                ? 'Orçamento solicitado com sucesso e e-mail enviado.' 
                : 'Orçamento salvo, mas houve uma falha no envio do e-mail comercial.',
            'orcamento' => $orcamento
        ], 200);
    }
}
