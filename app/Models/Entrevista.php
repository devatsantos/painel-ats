<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Entrevista extends Model
{
    use HasFactory;

    protected $fillable = [
        'candidato_vaga_id',
        'data_hora',
        'tipo',
        'link_meet',
        'user_id',
        'observacao',
    ];


    public function candidatoVaga()
    {
        return $this->belongsTo(CandidatoVaga::class, 'candidato_vaga_id');
    }


    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
