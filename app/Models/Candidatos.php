<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Laravel\Sanctum\HasApiTokens;

class Candidatos extends Authenticatable
{
    use SoftDeletes, HasApiTokens;

    protected $table = 'candidatos';

    protected $fillable = [
        'nome',
        'data_nascimento',
        'cpf',
        'nivel_escolaridade',
        'email',
        'telefone',
        'path_curriculo',
        'cep',
        'logradouro',
        'regiao',
        'como_conheceu',
        'especialidade',
        'banco_de_talentos',
        'whatsapp_codigo',
        'whatsapp_codigo_expira_em',
        'candidato_token',
        'candidato_token_expira_em',
    ];

    protected $casts = [
        'banco_de_talentos'          => 'boolean',
        'data_nascimento'            => 'date',
        'whatsapp_codigo_expira_em'  => 'datetime',
        'candidato_token_expira_em'  => 'datetime',
    ];

    protected $hidden = [
        'whatsapp_codigo',
        'whatsapp_codigo_expira_em',
        'candidato_token',
        'candidato_token_expira_em',
    ];

    public function vagas()
    {
        return $this->belongsToMany(Vagas::class, 'candidato_vaga', 'candidato_id', 'vaga_id')
                    ->withPivot('status')
                    ->withTimestamps();
    }

}
