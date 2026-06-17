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
        Schema::create('candidato_vaga_historico', function (Blueprint $table) {
            $table->id();
            $table->foreignId('candidato_vaga_id')->constrained('candidato_vaga')->onDelete('cascade');
            $table->string('status_anterior')->nullable();
            $table->string('status_novo');
            $table->timestamp('created_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('candidato_vaga_historico');
    }
};
