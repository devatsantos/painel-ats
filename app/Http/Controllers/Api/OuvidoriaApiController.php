<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ouvidoria;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class OuvidoriaApiController extends Controller
{
    /**
     * Store a new Ouvidoria report in the database and send an email to marketing@atsantos.com.br.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nome' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'telefone' => 'nullable|string|max:20',
            'tipo' => 'required|string|max:100',
            'mensagem' => 'required|string',
            'foto' => 'nullable|file|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'anonimo' => 'nullable',
        ]);

        $anonimo = filter_var($request->input('anonimo'), FILTER_VALIDATE_BOOLEAN);

        $nome = $anonimo ? null : ($validated['nome'] ?? null);
        $email = $anonimo ? null : ($validated['email'] ?? null);
        $telefone = $anonimo ? null : ($validated['telefone'] ?? null);

        // Prepara a descrição (situação) combinando o tipo e a mensagem
        $tipo = $validated['tipo'];
        $mensagem = $validated['mensagem'];
        $situacao = "[Tipo: {$tipo}] {$mensagem}";

        $fotoPath = null;
        $fotoAbsPath = null;
        if ($request->hasFile('foto')) {
            $path = $request->file('foto')->store('ouvidorias', 'private');
            $fotoPath = 'ouvidorias/' . basename($path);
            $fotoAbsPath = Storage::disk('private')->path($path);
        }

        // Salva no banco de dados
        $ouvidoria = Ouvidoria::create([
            'nome' => $nome,
            'email' => $email,
            'telefone' => $telefone,
            'situacao' => $situacao,
            'foto' => $fotoPath,
        ]);

        // Prepara o corpo do e-mail
        $emailBody = "Novo Relato da Ouvidoria Recebido (TESTE):\n\n";
        $emailBody .= "Tipo de Manifestação: " . $tipo . "\n";
        $emailBody .= "Identificação: " . ($anonimo ? "Anônimo" : "Identificado") . "\n";
        
        if (!$anonimo) {
            $emailBody .= "Nome: " . ($nome ?? "Não informado") . "\n";
            $emailBody .= "Email: " . ($email ?? "Não informado") . "\n";
            $emailBody .= "Telefone: " . ($telefone ?? "Não informado") . "\n";
        }
        
        $emailBody .= "\nRelato Detalhado:\n" . $mensagem . "\n\n";
        
        if ($fotoPath) {
            $emailBody .= "Anexo de Evidência: " . asset($fotoPath) . "\n";
        }

        try {
            Mail::raw($emailBody, function ($message) use ($tipo, $fotoAbsPath) {
                $message->to('marketing@atsantos.com.br')
                    ->subject("TESTE - Relato Ouvidoria: " . $tipo);
                if ($fotoAbsPath && file_exists($fotoAbsPath)) {
                    $message->attach($fotoAbsPath);
                }
            });
        } catch (\Exception $e) {
            Log::error('Erro ao enviar e-mail de Ouvidoria (API).', [
                'ouvidoria_id' => $ouvidoria->id,
                'erro' => $e->getMessage(),
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Manifestação enviada com sucesso.',
            'ouvidoria' => $ouvidoria
        ], 200);
    }
}
