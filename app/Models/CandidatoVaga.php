<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CandidatoVaga extends Model
{
    protected $table = 'candidato_vaga';

    protected $fillable = [
        'candidato_id',
        'vaga_id',
        'status'
    ];

    public function candidato()
    {
        return $this->belongsTo(Candidatos::class, 'candidato_id');
    }

    public function vaga()
    {
        return $this->belongsTo(Vagas::class, 'vaga_id');
    }

    public function entrevista()
    {
        return $this->hasOne(Entrevista::class, 'candidato_vaga_id');
    }
}
