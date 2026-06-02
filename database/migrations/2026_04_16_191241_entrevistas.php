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
        Schema::create('entrevistas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('candidato_vaga_id')->constrained('candidato_vaga')->onDelete('cascade');
            $table->dateTime('data_hora')->unique();
            $table->string('tipo');
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->text('link_meet')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('entrevistas');
    }
};
