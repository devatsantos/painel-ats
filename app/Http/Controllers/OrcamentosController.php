<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use App\Models\Orcamento;
class OrcamentosController extends Controller
{
    public function index() {
        abort_unless(auth()->user()->role === 'admin', 403);
        $orcamentos = Orcamento::orderBy('created_at', 'desc')->paginate(20);
        return Inertia::render('Orcamentos/Index', ['orcamentos' => $orcamentos]);
    }
    public function store(Request $request) {
        $validated = $request->validate([
            'nome_representante' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'telefone' => 'required|string|max:20',
            'cidade' => 'required|string|max:255',
            'estado' => 'required|string|max:255',
            'empresa' => 'required|string|max:255',
            'iniciativa' => 'required|string|max:255',
            'servicos' => 'required|string|max:255',
            'anexo_referencia' => 'nullable|file|mimes:pdf,doc,docx|mimetypes:application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document|max:2048',
            'descricao' => 'nullable|string'
        ]);

        if ($request->hasFile('anexo_referencia')) {
            $path = $request->file('anexo_referencia')->store('orcamentos', 'public');
            $validated['anexo_referencia'] = '/storage/' . $path;
        }

        Orcamento::create($validated);

        return redirect()->route('Orcamentos');
    }

    public function delete(Orcamento $orcamento)
    {
        abort_unless(auth()->user()->role === 'admin', 403);
        if ($orcamento->anexo_referencia) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $orcamento->anexo_referencia));
        }
        $orcamento->delete();

        return redirect()->route('Orcamentos')->with('success', 'Orçamento removido com sucesso.');
    }
}
