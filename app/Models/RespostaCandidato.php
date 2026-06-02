<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RespostaCandidato extends Model
{
    protected $fillable = [
        'candidato_id',
        'vaga_id',
        'pergunta_id',
        'alternativa_id'
    ];
}
