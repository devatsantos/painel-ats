<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Vagas;
use App\Models\Formulario;
use Illuminate\Http\Request;

class VagasApiController extends Controller
{
    /**
     * Lista todas as vagas públicas e ativas.
     */
    public function index()
    {
        $vagas = Vagas::where('ativo', true)
            ->where('interna', false)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['vagas' => $vagas]);
    }

    /**
     * Exibe os detalhes de uma vaga pública com seu questionário de triagem ocultando as respostas corretas.
     */
    public function show($id)
    {
        $vaga = Vagas::where('ativo', true)
            ->where('interna', false)
            ->findOrFail($id);

        $formulario = null;
        if ($vaga->formulario_id) {
            $formulario = Formulario::with('perguntas.alternativas')->find($vaga->formulario_id);
            if ($formulario) {
                // Remove a flag 'correta' das alternativas para evitar trapaças do lado do cliente
                $formulario->perguntas->each(function ($pergunta) {
                    $pergunta->alternativas->each(function ($alternativa) {
                        $alternativa->makeHidden('correta');
                    });
                });
            }
        }

        return response()->json([
            'vaga' => $vaga,
            'formulario' => $formulario,
        ]);
    }
}
