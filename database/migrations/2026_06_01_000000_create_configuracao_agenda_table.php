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
        Schema::create('configuracao_agenda', function (Blueprint $table) {
            $table->id();
            $table->time('hora_inicio');
            $table->time('hora_fim');
            $table->integer('intervalo_minutos');
            $table->timestamps();
        });

        // Semeia o registro padrão (08:00 às 10:00 com 15 minutos de intervalo)
        DB::table('configuracao_agenda')->insert([
            'hora_inicio'       => '08:00',
            'hora_fim'          => '10:00',
            'intervalo_minutos' => 15,
            'created_at'        => now(),
            'updated_at'        => now(),
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('configuracao_agenda');
    }
};
