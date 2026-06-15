<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mensagens_whatsapp', function (Blueprint $table) {
            $table->id();
            $table->string('chave')->unique()->comment('Identificador único do template (ex: otp_candidatura)');
            $table->string('titulo')->comment('Nome amigável para exibição');
            $table->text('conteudo')->comment('Corpo da mensagem com placeholders {nome}, {vaga}, etc.');
            $table->string('canal')->default('whatsapp')->comment('whatsapp ou email');
            $table->json('variaveis_disponiveis')->nullable()->comment('Lista de variáveis que podem ser usadas');
            $table->text('descricao')->nullable()->comment('Explicação de quando essa mensagem é enviada');
            $table->timestamps();
        });

        // Seed com as mensagens padrão atuais
        DB::table('mensagens_whatsapp')->insert([
            [
                'chave'     => 'otp_candidatura',
                'titulo'    => 'Código OTP — Candidatura',
                'conteudo'  => "Olá, {nome}! 👋\n\nSeu código de verificação para continuar a candidatura à vaga *{vaga}* é:\n\n*{codigo}*\n\nEste código expira em *15 minutos*. Não compartilhe com ninguém.",
                'canal'     => 'whatsapp',
                'variaveis_disponiveis' => json_encode(['nome', 'vaga', 'codigo']),
                'descricao' => 'Enviada quando o candidato solicita verificação via WhatsApp durante a candidatura.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'chave'     => 'otp_portal',
                'titulo'    => 'Código OTP — Portal do Candidato',
                'conteudo'  => "Olá, {nome}! 👋\n\nSeu código de acesso ao portal do candidato é:\n\n*{codigo}*\n\nEste código expira em *15 minutos*. Não compartilhe com ninguém.",
                'canal'     => 'whatsapp',
                'variaveis_disponiveis' => json_encode(['nome', 'codigo']),
                'descricao' => 'Enviada quando o candidato solicita verificação via WhatsApp no portal do candidato.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'chave'     => 'entrevista_agendada',
                'titulo'    => 'Entrevista Agendada',
                'conteudo'  => "Olá {nome}! 🎉\n\nSua entrevista para a vaga *{vaga}* foi confirmada!\n\n📅 Data: {data}\n⏰ Horário: {horario}\n📍 Tipo: {tipo}\n{link_meet}\nQualquer dúvida, entre em contato conosco. Boa sorte!",
                'canal'     => 'whatsapp',
                'variaveis_disponiveis' => json_encode(['nome', 'vaga', 'data', 'horario', 'tipo', 'link_meet']),
                'descricao' => 'Enviada automaticamente quando o candidato agenda uma entrevista.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'chave'     => 'entrevista_adiada',
                'titulo'    => 'Entrevista Adiada/Reagendada',
                'conteudo'  => "Olá, {nome}! 🗓️\n\nSeu agendamento de entrevista para a vaga *{vaga}* precisou ser adiado/reagendado.{justificativa}\n\nPor favor, acesse o portal do candidato para selecionar uma nova data e horário:\n🔗 {url_portal}",
                'canal'     => 'whatsapp',
                'variaveis_disponiveis' => json_encode(['nome', 'vaga', 'justificativa', 'url_portal']),
                'descricao' => 'Enviada quando o recrutador adia/reagenda uma entrevista.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'chave'     => 'otp_email',
                'titulo'    => 'Código OTP — E-mail',
                'conteudo'  => "Olá, {nome}! 👋\n\nSeu código de acesso ao processo seletivo é:\n\n{codigo}\n\nEste código expira em 15 minutos. Não compartilhe com ninguém.",
                'canal'     => 'email',
                'variaveis_disponiveis' => json_encode(['nome', 'codigo']),
                'descricao' => 'Enviada por e-mail quando o candidato escolhe verificação por e-mail.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('mensagens_whatsapp');
    }
};
