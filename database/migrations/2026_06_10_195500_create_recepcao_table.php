<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tabela do mini-sistema de Recepção.
     * Registra visitantes/prestadores que comparecem à empresa.
     */
    public function up(): void
    {
        Schema::create('recepcao', function (Blueprint $table) {
            $table->id();
            $table->string('nome');                           // Nome do visitante
            $table->string('assunto');                        // Motivo da visita
            $table->string('posto_cargo_empresa')->nullable(); // Posto, cargo ou empresa do visitante
            $table->string('departamento_responsavel');       // Departamento que vai receber
            $table->string('contato')->nullable();            // Telefone ou outro contato do visitante
            $table->dateTime('horario_entrada');              // Horário de entrada
            $table->dateTime('horario_saida')->nullable();    // Horário de saída (preenchido depois)
            $table->text('retorno')->nullable();              // Observação sobre retorno
            $table->string('indicacao')->nullable();          // Quem indicou / encaminhou

            // Usuário do painel que registrou a visita (consome tabela users existente)
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('recepcao');
    }
};
