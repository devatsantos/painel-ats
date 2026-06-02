<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Vagas extends Model
{
    use SoftDeletes;
    protected $fillable = [
        'titulo',
        'horario',
        'local',
        'descricao',
        'requisitos',
        'salario',
        'va',
        'vr',
        'vt',
        'escala',
        'status_efetivacao',
        'ativo',
        'pcd',
        'formulario_id'
    ];

    public function formulario()
    {
        return $this->belongsTo(Formulario::class);
    }
}
