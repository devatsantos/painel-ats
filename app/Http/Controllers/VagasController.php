<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Vagas;
use App\Models\Formulario;

class VagasController extends Controller
{
    public function index() {
        $vagas = Vagas::orderBy('created_at', 'desc')->paginate(20);
        $formularios = Formulario::all();
        return Inertia::render('Vagas/Index', ['vagas' => $vagas, 'formularios' => $formularios]);
    }

    /**
     * Regras de validação compartilhadas entre store e update.
     */
    private function rules(): array
    {
        return [
            'titulo'            => 'required|string|max:255',
            'horario'           => 'required|string|max:100',
            'local'             => 'required|string|max:255',
            'descricao'         => 'required|string|max:2000',
            'requisitos'        => 'required|string|max:2000',
            'salario'           => 'required|string|max:100',
            'va'                => 'nullable|string|max:100',
            'vr'                => 'nullable|string|max:100',
            'vt'                => 'nullable|string|max:100',
            'escala'            => 'required|string|max:50',
            'status_efetivacao' => 'required|string|max:50',
            'ativo'             => 'boolean',
            'pcd'               => 'boolean',
            'formulario_id'     => 'required|exists:formularios,id',
        ];
    }

    public function store(Request $request) {
        $validated = $request->validate($this->rules());

        Vagas::create($validated);

        return redirect()->route('Vagas');
    }
    public function delete(Vagas $vaga) {
        $vaga->delete();
        return redirect()->route('Vagas')->with('success', 'Vaga deletada com sucesso.');
    }
    public function update(Request $request, Vagas $vaga) {
        $validated = $request->validate($this->rules());

        $vaga->update($validated);

        return redirect()->route('Vagas')->with('success', 'Vaga atualizada com sucesso.');
    }
}
