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
            $table->string('origem')->default('manual')->after('motivo'); // 'manual' | 'feriado'
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bloqueio_agendas', function (Blueprint $table) {
            $table->dropColumn('origem');
        });
    }
};
