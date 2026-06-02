<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Importa feriados nacionais todo dia 1º de janeiro às 00:05
Schedule::command('app:importar-feriados')->yearlyOn(1, 1, '00:05');
