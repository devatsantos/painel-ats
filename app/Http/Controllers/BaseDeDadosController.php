<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Candidatos;
use App\Models\Vagas;

class BaseDeDadosController extends Controller
{
    public function index(Request $request)
    {
        $query = Candidatos::with(['vagas']);

        // Busca por nome, CPF ou e-mail
        if ($request->filled('busca')) {
            $busca = $request->input('busca');
            $query->where(function ($q) use ($busca) {
                $q->where('nome', 'like', "%{$busca}%")
                  ->orWhere('cpf', 'like', "%{$busca}%")
                  ->orWhere('email', 'like', "%{$busca}%")
                  ->orWhere('telefone', 'like', "%{$busca}%");
            });
        }

        // Filtro por região
        if ($request->filled('regiao')) {
            $query->where('regiao', $request->input('regiao'));
        }

        // Filtro por escolaridade
        if ($request->filled('escolaridade')) {
            $query->where('nivel_escolaridade', $request->input('escolaridade'));
        }

        // Filtro por status (via candidato_vaga)
        if ($request->filled('status')) {
            $status = $request->input('status');
            $query->whereHas('vagas', function ($q) use ($status) {
                $q->where('candidato_vaga.status', $status);
            });
        }

        // Filtro por vaga
        if ($request->filled('vaga_id')) {
            $query->whereHas('vagas', function ($q) use ($request) {
                $q->where('vagas.id', $request->input('vaga_id'));
            });
        }

        $candidatos = $query->orderBy('created_at', 'desc')->paginate(20)->withQueryString();

        $regioes = Candidatos::whereNotNull('regiao')
            ->where('regiao', '!=', '')
            ->distinct()
            ->orderBy('regiao')
            ->pluck('regiao');

        $vagas = Vagas::orderBy('titulo')->get(['id', 'titulo']);

        $totalCandidatos = Candidatos::count();
        $totalBancoTalentos = Candidatos::where('banco_de_talentos', true)->count();

        return Inertia::render('BaseDeDados/Index', [
            'candidatos'       => $candidatos,
            'regioes'          => $regioes,
            'vagas'            => $vagas,
            'totalCandidatos'  => $totalCandidatos,
            'totalBancoTalentos' => $totalBancoTalentos,
            'filtros'          => $request->only(['busca', 'regiao', 'escolaridade', 'status', 'vaga_id']),
        ]);
    }
}
