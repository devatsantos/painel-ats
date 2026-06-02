<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Reprovado extends Model
{
    protected $fillable = [
        'formulario_id',
        'candidato_id',
        'reprovado_ate'
    ];

    public function formulario()
    {
        return $this->belongsTo(Formulario::class);

    }

    public function candidato()
    {
        return $this->belongsTo(Candidatos::class, 'candidato_id');
    }

}
