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
        Schema::create('candidatos', function (Blueprint $table){ 
            $table->id();
            $table->string('nome');
            $table->string('cpf')->unique();
            $table->string('nivel_escolaridade')->nullable();
            $table->string('formacao')->nullable();
            $table->string('email')->nullable();
            $table->string('telefone');
            $table->string('path_curriculo')->nullable();
            $table->string('cep')->nullable();
            $table->string('logradouro')->nullable();
            $table->string('regiao');
            $table->boolean('banco_de_talentos')->default(false);
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('candidatos');
    }
};
