<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('candidatos', function (Blueprint $table) {
            $table->string('whatsapp_codigo', 10)->nullable()->after('banco_de_talentos');
            $table->timestamp('whatsapp_codigo_expira_em')->nullable()->after('whatsapp_codigo');
        });
    }

    public function down(): void
    {
        Schema::table('candidatos', function (Blueprint $table) {
            $table->dropColumn(['whatsapp_codigo', 'whatsapp_codigo_expira_em']);
        });
    }
};
