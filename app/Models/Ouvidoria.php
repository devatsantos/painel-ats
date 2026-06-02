<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ouvidoria extends Model
{
    protected $table = 'ouvidorias';

    protected $fillable = [
        'nome',
        'email',
        'telefone',
        'situacao',
        'foto',
    ];
}
