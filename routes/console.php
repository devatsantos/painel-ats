<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Importa feriados nacionais todo dia 1º de janeiro às 00:05
Schedule::command('app:importar-feriados')->yearlyOn(1, 1, '00:05');

// Limpa candidaturas "selecionadas" que não foram agendadas em 7 dias
Schedule::call(function () {
    $expirados = \App\Models\CandidatoVaga::where('status', 'selecionado')
        ->where('updated_at', '<', now()->subDays(7))
        ->get();

    foreach ($expirados as $ev) {
        \App\Models\RespostaCandidato::where('candidato_id', $ev->candidato_id)
            ->where('vaga_id', $ev->vaga_id)
            ->delete();
        $ev->delete();
    }
})->daily();
