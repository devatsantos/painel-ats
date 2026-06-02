<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BloqueioAgenda extends Model
{
    protected $fillable = [
        'data',
        'dia_todo',
        'hora_inicio',
        'hora_fim',
        'motivo',
        'origem',
    ];

    protected $casts = [
        'dia_todo' => 'boolean',
    ];
}
