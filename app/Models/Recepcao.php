<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Recepcao extends Model
{
    protected $table = 'recepcao';

    protected $fillable = [
        'nome',
        'assunto',
        'posto_cargo_empresa',
        'departamento_responsavel',
        'contato',
        'horario_entrada',
        'horario_saida',
        'retorno',
        'indicacao',
        'user_id',
    ];

    protected $casts = [
        'horario_entrada' => 'datetime',
        'horario_saida'   => 'datetime',
    ];

    /**
     * Usuário do painel que registrou a visita.
     */
    public function registradoPor()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
