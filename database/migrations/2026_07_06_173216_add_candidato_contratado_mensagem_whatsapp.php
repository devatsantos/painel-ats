<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Evita duplicata caso a migration seja re-executada
        $existe = DB::table('mensagens_whatsapp')
            ->where('chave', 'candidato_contratado')
            ->exists();

        if ($existe) {
            return;
        }

        DB::table('mensagens_whatsapp')->insert([
            'chave'                  => 'candidato_contratado',
            'titulo'                 => 'Candidato Contratado',
            'conteudo'               => "Parabéns, {nome}! 🎉\n\nTemos uma ótima notícia: você foi *selecionado(a)* para a vaga de *{vaga}* na AT & Santos!\n\nNossa equipe entrará em contato em breve com as próximas orientações sobre a sua admissão.\n\nBem-vindo(a) à família AT & Santos! 💼",
            'canal'                  => 'whatsapp',
            'variaveis_disponiveis'  => json_encode(['nome', 'vaga']),
            'descricao'              => 'Enviada automaticamente quando o recrutador marca o candidato como contratado.',
            'created_at'             => now(),
            'updated_at'             => now(),
        ]);
    }

    public function down(): void
    {
        DB::table('mensagens_whatsapp')
            ->where('chave', 'candidato_contratado')
            ->delete();
    }
};
