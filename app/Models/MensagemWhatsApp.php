<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MensagemWhatsApp extends Model
{
    protected $table = 'mensagens_whatsapp';

    protected $fillable = [
        'chave',
        'titulo',
        'conteudo',
        'canal',
        'variaveis_disponiveis',
        'descricao',
    ];

    protected $casts = [
        'variaveis_disponiveis' => 'array',
    ];

    /**
     * Busca o template pelo chave e substitui as variáveis.
     *
     * @param string $chave   Ex: 'otp_candidatura'
     * @param array  $dados   Ex: ['nome' => 'João', 'codigo' => '123456']
     * @return string          Mensagem final com as variáveis substituídas
     */
    public static function renderizar(string $chave, array $dados = []): string
    {
        $template = static::where('chave', $chave)->first();

        if (!$template) {
            // Fallback: retorna dados serializados para evitar falha silenciosa
            return "Template '{$chave}' não encontrado. Dados: " . json_encode($dados);
        }

        $mensagem = $template->conteudo;

        foreach ($dados as $variavel => $valor) {
            $mensagem = str_replace("{{$variavel}}", $valor ?? '', $mensagem);
        }

        // Remove placeholders não preenchidos
        $mensagem = preg_replace('/\{[a-z_]+\}/', '', $mensagem);

        // Limpa linhas em branco duplicadas resultantes da remoção
        $mensagem = preg_replace('/\n{3,}/', "\n\n", $mensagem);

        return trim($mensagem);
    }
}
