<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Vagas;
use App\Models\Formulario;
use App\Models\User;

class VagasController extends Controller
{
    public function index() {
        $vagas = Vagas::with('recrutador:id,nome')
            ->orderBy('created_at', 'desc')
            ->paginate(20);
        $formularios = Formulario::all();
        $recrutadores = User::select('id', 'nome')->orderBy('nome')->get();
        return Inertia::render('Vagas/Index', [
            'vagas' => $vagas,
            'formularios' => $formularios,
            'recrutadores' => $recrutadores,
        ]);
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
            'permite_online'    => 'boolean',
            'interna'           => 'boolean',
            'area'              => 'nullable|string|max:100',
            'sla_dias'          => 'nullable|integer|min:1',
            'quantidade_vagas'  => 'nullable|integer|min:1',
            'user_id'           => 'nullable|exists:users,id',
            'formulario_id'     => 'required|exists:formularios,id',
        ];
    }

    public function store(Request $request) {
        abort_unless(in_array(auth()->user()->role, ['admin', 'coordenador']), 403, 'Apenas administradores e coordenadores podem criar vagas.');

        $validated = $request->validate($this->rules());

        Vagas::create($validated);

        return redirect()->route('Vagas');
    }
    public function delete(Vagas $vaga) {
        abort_unless(in_array(auth()->user()->role, ['admin', 'coordenador']), 403, 'Apenas administradores e coordenadores podem excluir vagas.');

        $vaga->delete();
        return redirect()->route('Vagas')->with('success', 'Vaga deletada com sucesso.');
    }
    public function update(Request $request, Vagas $vaga) {
        abort_unless(in_array(auth()->user()->role, ['admin', 'coordenador']), 403, 'Apenas administradores e coordenadores podem editar vagas.');

        $validated = $request->validate($this->rules());

        $vaga->update($validated);

        return redirect()->route('Vagas')->with('success', 'Vaga atualizada com sucesso.');
    }
}
