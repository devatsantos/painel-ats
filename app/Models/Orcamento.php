<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Orcamento extends Model
{
    use HasFactory;

    protected $fillable = [
        'nome_representante',
        'email',
        'telefone',
        'cidade',
        'estado',
        'empresa',
        'iniciativa',
        'servicos',
        'anexo_referencia',
        'descricao',
        'status'
    ];
}
