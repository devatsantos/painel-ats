<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Formulario extends Model
{
    use SoftDeletes;
    protected $fillable = [
        'titulo_formulario',
        'descricao',
        'requisitos',
        'posto',
        'threshold',
    ];

    public function perguntas()
    {
        return $this->hasMany(Pergunta::class);
    }
}
