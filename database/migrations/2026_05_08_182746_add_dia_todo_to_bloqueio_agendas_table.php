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
        Schema::table('bloqueio_agendas', function (Blueprint $table) {
            $table->boolean('dia_todo')->default(false)->after('data');
            $table->time('hora_inicio')->nullable()->change();
            $table->time('hora_fim')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bloqueio_agendas', function (Blueprint $table) {
            $table->dropColumn('dia_todo');
            $table->time('hora_inicio')->nullable(false)->change();
            $table->time('hora_fim')->nullable(false)->change();
        });
    }
};
