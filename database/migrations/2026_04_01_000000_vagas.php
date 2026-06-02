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
       Schema::create('vagas', function (Blueprint $table) {
           $table->id();
           $table->string('titulo');
           $table->string('horario');
           $table->string('local');
           $table->string('descricao', 2000);
           $table->string('requisitos', 2000);
           $table->string('salario');
           $table->string('va');
           $table->string('vr');
           $table->string('vt');
           $table->string('escala');
           $table->string('status_efetivacao');
           $table->boolean('ativo')->default(true);
           $table->boolean('pcd')->default(false);
           $table->foreignId('formulario_id')->nullable()->constrained('formularios')->onDelete('set null');
           $table->softDeletes();
           $table->timestamps();


       });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vagas');
    }
};
