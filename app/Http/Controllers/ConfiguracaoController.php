<?php

namespace App\Http\Controllers;

use App\Models\Configuracao;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ConfiguracaoController extends Controller
{
    /**
     * Exibe a tela de configurações gerais (prazos e durações).
     */
    public function index()
    {
        abort_if(auth()->user()->role !== 'admin', 403, 'Apenas administradores podem acessar as configurações gerais.');

        $configs = Configuracao::pluck('valor', 'chave')->all();

        // Mapeia e garante que venham como inteiros na resposta
        $prazos = [
            'otp_expira_minutos'         => (int) ($configs['candidatura.otp_expira_minutos'] ?? 15),
            'token_expira_dias'          => (int) ($configs['candidatura.token_expira_dias'] ?? 14),
            'selecao_expira_dias'        => (int) ($configs['candidatura.selecao_expira_dias'] ?? 7),
            'quarentena_reprovacao_dias' => (int) ($configs['candidatura.quarentena_reprovacao_dias'] ?? 30),
            'entrevista_duracao_minutos' => (int) ($configs['candidatura.entrevista_duracao_minutos'] ?? 30),
        ];

        return Inertia::render('Configuracoes/Gerais', [
            'prazos' => $prazos,
        ]);
    }

    /**
     * Atualiza as configurações de prazos e durações.
     */
    public function update(Request $request)
    {
        abort_if(auth()->user()->role !== 'admin', 403, 'Apenas administradores podem atualizar as configurações gerais.');

        $data = $request->validate([
            'otp_expira_minutos'         => 'required|integer|min:1|max:1440',
            'token_expira_dias'          => 'required|integer|min:1|max:365',
            'selecao_expira_dias'        => 'required|integer|min:1|max:90',
            'quarentena_reprovacao_dias' => 'required|integer|min:0|max:365',
            'entrevista_duracao_minutos' => 'required|integer|min:5|max:180',
        ]);

        foreach ($data as $chave => $valor) {
            Configuracao::updateOrCreate(
                ['chave' => "candidatura.{$chave}"],
                ['valor' => (string) $valor]
            );
        }

        // Limpa o cache de configuração para garantir que novos valores sejam aplicados
        try {
            \Illuminate\Support\Facades\Artisan::call('config:clear');
        } catch (\Exception $e) {
            // Silencia caso ocorra algum erro de permissão no ambiente
        }

        return redirect()->back()->with('success', 'Configurações de prazos e durações atualizadas com sucesso.');
    }
}
