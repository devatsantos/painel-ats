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
        Schema::create('metas_recrutadores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->unsignedTinyInteger('mes');
            $table->unsignedSmallInteger('ano');
            $table->unsignedInteger('meta_contratacoes')->default(0);
            $table->unsignedInteger('meta_entrevistas')->default(0);
            $table->timestamps();

            $table->unique(['user_id', 'mes', 'ano']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('metas_recrutadores');
    }
};
