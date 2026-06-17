<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CandidatoVagaHistorico extends Model
{
    public $timestamps = false;

    protected $table = 'candidato_vaga_historico';

    protected $fillable = [
        'candidato_vaga_id',
        'status_anterior',
        'status_novo',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    public function candidatoVaga()
    {
        return $this->belongsTo(CandidatoVaga::class, 'candidato_vaga_id');
    }
}
