<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('orcamentos', function (Blueprint $table) {
            $table->id();
            $table->string('nome_representante');
            $table->string('email');
            $table->string('telefone');
            $table->string('cidade');
            $table->string('estado');
            $table->string('empresa');
            $table->string('iniciativa');
            $table->string('servicos');
            $table->string('anexo_referencia')->nullable();
            $table->string('descricao', 2000);
            $table->enum('status', ['enviado', 'falhou']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orcamentos');
    }
};
