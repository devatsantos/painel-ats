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

    /**
     * Regras de validação compartilhadas entre store e update.
     */
    private function rules(): array
    {
        return [
            'nome_representante' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'telefone' => 'required|string|max:20',
            'cidade' => 'required|string|max:255',
            'estado' => 'required|string|max:255',
            'empresa' => 'required|string|max:255',
            'iniciativa' => 'required|string|max:255',
            'servicos' => 'required|string|max:255',
            'anexo_referencia' => 'nullable|file|mimes:pdf,doc,docx|mimetypes:application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document|max:2048',
            'descricao' => 'nullable|string',
            'status' => 'nullable|string|in:pendente,em_analise,aprovado,recusado',
        ];
    }

    public function store(Request $request) {
        abort_unless(auth()->user()->role === 'admin', 403);
        $validated = $request->validate($this->rules());

        if ($request->hasFile('anexo_referencia')) {
            $path = $request->file('anexo_referencia')->store('orcamentos', 'private');
            $validated['anexo_referencia'] = 'orcamentos/' . basename($path);
        }

        Orcamento::create($validated);

        return redirect()->route('Orcamentos')->with('success', 'Orçamento cadastrado com sucesso.');
    }

    public function update(Request $request, Orcamento $orcamento)
    {
        abort_unless(auth()->user()->role === 'admin', 403);

        $validated = $request->validate($this->rules());

        if ($request->hasFile('anexo_referencia')) {
            $this->deletarAnexo($orcamento->anexo_referencia);
            $path = $request->file('anexo_referencia')->store('orcamentos', 'private');
            $validated['anexo_referencia'] = 'orcamentos/' . basename($path);
        } else {
            unset($validated['anexo_referencia']);
        }

        $orcamento->update($validated);

        return redirect()->route('Orcamentos')->with('success', 'Orçamento atualizado com sucesso.');
    }

    public function delete(Orcamento $orcamento)
    {
        abort_unless(auth()->user()->role === 'admin', 403);
        $this->deletarAnexo($orcamento->anexo_referencia);
        $orcamento->delete();

        return redirect()->route('Orcamentos')->with('success', 'Orçamento removido com sucesso.');
    }

    /**
     * Remove o arquivo de anexo do disco, se existir.
     */
    private function deletarAnexo(?string $path): void
    {
        if ($path) {
            Storage::disk('private')->delete($path);
        }
    }
}
