<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Reprovado;
use App\Models\Formulario;

class ReprovadosController extends Controller
{
    public function index(Request $request)
    {
        $query = Reprovado::with(['candidato:id,nome,cpf,email,telefone', 'formulario:id,titulo_formulario']);

        // Filtro por formulário
        if ($request->filled('formulario_id')) {
            $query->where('formulario_id', $request->formulario_id);
        }

        // Filtro por data (de/até)
        if ($request->filled('data_de')) {
            $query->whereDate('created_at', '>=', $request->data_de);
        }
        if ($request->filled('data_ate')) {
            $query->whereDate('created_at', '<=', $request->data_ate);
        }

        // Filtro por busca textual (nome ou CPF do candidato)
        if ($request->filled('busca')) {
            $busca = $request->busca;
            $query->whereHas('candidato', function ($q) use ($busca) {
                $q->where('nome', 'like', "%{$busca}%")
                  ->orWhere('cpf', 'like', "%{$busca}%");
            });
        }

        // Filtro: apenas bloqueios ativos (reprovado_ate >= hoje)
        if ($request->input('ativos') === 'true') {
            $query->where('reprovado_ate', '>=', now());
        }

        $reprovados = $query->orderBy('created_at', 'desc')
            ->paginate(20)
            ->withQueryString();

        $formularios = Formulario::orderBy('titulo_formulario')->get(['id', 'titulo_formulario']);

        $totalAtivos = Reprovado::where('reprovado_ate', '>=', now())->count();
        $totalExpirados = Reprovado::where('reprovado_ate', '<', now())->count();

        return Inertia::render('Reprovados/Index', [
            'reprovados'   => $reprovados,
            'formularios'  => $formularios,
            'totalAtivos'  => $totalAtivos,
            'totalExpirados' => $totalExpirados,
            'filtros'      => $request->only(['formulario_id', 'data_de', 'data_ate', 'busca', 'ativos']),
        ]);
    }

    public function delete(Reprovado $reprovado)
    {
        abort_unless(auth()->user()->role === 'admin', 403);
        $reprovado->delete();
        return redirect()->route('Reprovados')->with('success', 'Registro de reprovação removido com sucesso.');
    }
}
