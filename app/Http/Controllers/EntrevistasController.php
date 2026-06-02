<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\Entrevista;

class EntrevistasController extends Controller
{
    public function index()
    {
        $candidatos = Entrevista::with(['candidatoVaga.candidato', 'candidatoVaga.vaga', 'user'])
            ->latest()
            ->paginate(20)
            ->through(function ($entrevista) {
            $candidato = $entrevista->candidatoVaga->candidato;

            return [
                'id'                 => $candidato->id,
                'entrevista_id'      => $entrevista->id,
                'nome'               => $candidato->nome,
                'email'              => $candidato->email,
                'telefone'           => $candidato->telefone,
                'cpf'                => $candidato->cpf,
                'regiao'             => $candidato->regiao,
                'nivel_escolaridade' => $candidato->nivel_escolaridade,
                'path_curriculo'     => $candidato->path_curriculo,
                'cep'                => $candidato->cep,
                'logradouro'         => $candidato->logradouro,
                'status'             => $entrevista->candidatoVaga->status,
                'observacao'         => $entrevista->observacao,
                'data_hora'          => $entrevista->data_hora,
                'tipo_entrevista'    => $entrevista->tipo,
                'link_meet'          => $entrevista->link_meet,
                'entrevistador_nome' => $entrevista->user?->nome,
                'vaga_titulo'        => $entrevista->candidatoVaga->vaga->titulo ?? 'Vaga',
            ];
        });

        return Inertia::render('Entrevistas/Index', [
            'candidatos' => $candidatos,
        ]);
    }

    public function pegarEntrevista(Entrevista $entrevista)
    {
        if ($entrevista->user_id !== null) {
            return redirect()->route('Entrevistas')->with('error', 'Esta entrevista já foi atribuída a outro entrevistador.');
        }

        $entrevista->update(['user_id' => Auth::id()]);

        return redirect()->route('Entrevistas')->with('success', 'Entrevista atribuída a você com sucesso.');
    }

    public function atualizarStatus(Request $request, Entrevista $entrevista)
    {
        $validated = $request->validate([
            'status'     => 'required|string|in:contratado,reprovado,recusou_vaga,sem_vaga,nao_compareceu',
            'observacao' => 'nullable|string|max:1000',
        ]);

        $entrevista->candidatoVaga->update(['status' => $validated['status']]);
        $entrevista->update(['observacao' => $validated['observacao'] ?? null]);

        return redirect()->route('Entrevistas')->with('success', 'Resultado registrado com sucesso.');
    }
}
