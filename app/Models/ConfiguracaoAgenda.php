<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ConfiguracaoAgenda extends Model
{
    protected $table = 'configuracao_agenda';

    protected $fillable = [
        'hora_inicio',
        'hora_fim',
        'intervalo_minutos',
    ];
}
