<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MetaRecrutador extends Model
{
    protected $table = 'metas_recrutadores';

    protected $fillable = [
        'user_id',
        'mes',
        'ano',
        'meta_contratacoes',
        'meta_entrevistas',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
