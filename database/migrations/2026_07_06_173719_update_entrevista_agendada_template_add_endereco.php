<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Conteúdo anterior do template (para rollback).
     */
    private string $conteudoAnterior = "Olá {nome}! 🎉\n\nSua entrevista para a vaga *{vaga}* foi confirmada!\n\n📅 Data: {data}\n⏰ Horário: {horario}\n📍 Tipo: {tipo}\n{link_meet}\nQualquer dúvida, entre em contato conosco. Boa sorte!";

    /**
     * Novo conteúdo com suporte ao endereço quando a entrevista for presencial.
     */
    private string $conteudoNovo = "Olá {nome}! 🎉\n\nSua entrevista para a vaga *{vaga}* foi confirmada!\n\n📅 Data: {data}\n⏰ Horário: {horario}\n📍 Tipo: {tipo}\n{endereco}{link_meet}\nQualquer dúvida, entre em contato conosco. Boa sorte!";

    public function up(): void
    {
        DB::table('mensagens_whatsapp')
            ->where('chave', 'entrevista_agendada')
            ->update([
                'conteudo'              => $this->conteudoNovo,
                'variaveis_disponiveis' => json_encode(['nome', 'vaga', 'data', 'horario', 'tipo', 'endereco', 'link_meet']),
                'descricao'             => 'Enviada automaticamente quando o candidato agenda uma entrevista. Quando presencial, inclui o endereço da empresa.',
                'updated_at'            => now(),
            ]);
    }

    public function down(): void
    {
        DB::table('mensagens_whatsapp')
            ->where('chave', 'entrevista_agendada')
            ->update([
                'conteudo'              => $this->conteudoAnterior,
                'variaveis_disponiveis' => json_encode(['nome', 'vaga', 'data', 'horario', 'tipo', 'link_meet']),
                'descricao'             => 'Enviada automaticamente quando o candidato agenda uma entrevista.',
                'updated_at'            => now(),
            ]);
    }
};
