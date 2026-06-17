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
        Schema::table('vagas', function (Blueprint $table) {
            $table->string('area')->nullable()->after('local');
            $table->unsignedSmallInteger('sla_dias')->nullable()->after('ativo');
            $table->unsignedSmallInteger('quantidade_vagas')->default(1)->after('sla_dias');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vagas', function (Blueprint $table) {
            $table->dropColumn(['area', 'sla_dias', 'quantidade_vagas']);
        });
    }
};
