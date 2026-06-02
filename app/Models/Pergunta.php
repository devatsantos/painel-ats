<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pergunta extends Model
{
    protected $fillable = [
        'enunciado',
        'formulario_id'
    ];

    public function formulario()
    {
        return $this->belongsTo(Formulario::class);
    }

    public function alternativas()
    {
        return $this->hasMany(Alternativa::class);
    }
}
