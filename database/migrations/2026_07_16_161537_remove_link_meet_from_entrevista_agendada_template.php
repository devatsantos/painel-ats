<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $template = DB::table('mensagens_whatsapp')
            ->where('chave', 'entrevista_agendada')
            ->first();

        if ($template) {
            // Remove {link_meet} do conteúdo
            $conteudo = str_replace('{link_meet}', '', $template->conteudo);
            // Limpa linhas em branco duplicadas
            $conteudo = preg_replace('/\n{3,}/', "\n\n", $conteudo);

            $variaveis = json_decode($template->variaveis_disponiveis, true) ?: [];
            $variaveis = array_values(array_filter($variaveis, fn($v) => $v !== 'link_meet'));

            DB::table('mensagens_whatsapp')
                ->where('chave', 'entrevista_agendada')
                ->update([
                    'conteudo'              => $conteudo,
                    'variaveis_disponiveis' => json_encode($variaveis),
                    'updated_at'            => now(),
                ]);
        }
    }

    public function down(): void
    {
        DB::table('mensagens_whatsapp')
            ->where('chave', 'entrevista_agendada')
            ->update([
                'conteudo'              => "Olá {nome}! 🎉\n\nSua entrevista para a vaga *{vaga}* foi confirmada!\n\n📅 Data: {data}\n⏰ Horário: {horario}\n📍 Tipo: {tipo}\n{endereco}{link_meet}\nQualquer dúvida, entre em contato conosco. Boa sorte!",
                'variaveis_disponiveis' => json_encode(['nome', 'vaga', 'data', 'horario', 'tipo', 'endereco', 'link_meet']),
                'updated_at'            => now(),
            ]);
    }
};
