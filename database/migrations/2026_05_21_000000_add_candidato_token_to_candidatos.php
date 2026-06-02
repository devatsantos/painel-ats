<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('candidatos', function (Blueprint $table) {
            $table->string('candidato_token', 64)->nullable()->after('whatsapp_codigo_expira_em');
            $table->timestamp('candidato_token_expira_em')->nullable()->after('candidato_token');
        });
    }

    public function down(): void
    {
        Schema::table('candidatos', function (Blueprint $table) {
            $table->dropColumn(['candidato_token', 'candidato_token_expira_em']);
        });
    }
};
