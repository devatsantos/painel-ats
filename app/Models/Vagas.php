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
        'permite_online',
        'user_id',
        'formulario_id'
    ];

    public function formulario()
    {
        return $this->belongsTo(Formulario::class);
    }

    public function recrutador()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
