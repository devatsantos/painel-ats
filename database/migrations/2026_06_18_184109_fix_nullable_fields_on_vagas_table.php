<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Torna va, vr e vt nullable.
     * Esses campos eram NOT NULL no schema original mas o controller
     * já os valida como nullable, causando erro 500 ao salvar sem eles.
     */
    public function up(): void
    {
        Schema::table('vagas', function (Blueprint $table) {
            $table->string('va', 100)->nullable()->change();
            $table->string('vr', 100)->nullable()->change();
            $table->string('vt', 100)->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('vagas', function (Blueprint $table) {
            $table->string('va', 100)->nullable(false)->default('')->change();
            $table->string('vr', 100)->nullable(false)->default('')->change();
            $table->string('vt', 100)->nullable(false)->default('')->change();
        });
    }
};
