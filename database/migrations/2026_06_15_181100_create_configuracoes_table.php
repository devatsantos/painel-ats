<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('configuracoes', function (Blueprint $table) {
            $table->id();
            $table->string('chave')->unique();
            $table->text('valor')->nullable();
            $table->timestamps();
        });

        // Insere as configurações padrão
        DB::table('configuracoes')->insert([
            [
                'chave' => 'candidatura.otp_expira_minutos',
                'valor' => '15',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'chave' => 'candidatura.token_expira_dias',
                'valor' => '14',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'chave' => 'candidatura.selecao_expira_dias',
                'valor' => '7',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'chave' => 'candidatura.quarentena_reprovacao_dias',
                'valor' => '30',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'chave' => 'candidatura.entrevista_duracao_minutos',
                'valor' => '30',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('configuracoes');
    }
};
