<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use App\Models\Ouvidoria;

class OuvidoriaController extends Controller
{
    /**
     * Exibe a listagem de relatos da Ouvidoria (Apenas Admin).
     */
    public function index()
    {
        abort_unless(auth()->user()->role === 'admin', 403);

        $ouvidorias = Ouvidoria::orderBy('created_at', 'desc')->paginate(20);

        return Inertia::render('Ouvidoria/Index', [
            'ouvidorias' => $ouvidorias,
        ]);
    }

    /**
     * Exibe o formulário público de Ouvidoria.
     */
    public function create()
    {
        return Inertia::render('Ouvidoria/Create');
    }

    /**
     * Salva o relato da Ouvidoria no banco de dados.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nome'     => 'nullable|string|max:255',
            'email'    => 'nullable|email|max:255',
            'telefone' => 'nullable|string|max:20',
            'situacao' => 'required|string',
            'foto'     => 'nullable|file|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
        ]);

        $path = null;
        if ($request->hasFile('foto')) {
            $uploadedFile = $request->file('foto')->store('ouvidorias', 'public');
            $path = '/storage/' . $uploadedFile;
        }

        Ouvidoria::create([
            'nome'     => $validated['nome'],
            'email'    => $validated['email'],
            'telefone' => $validated['telefone'],
            'situacao' => $validated['situacao'],
            'foto'     => $path,
        ]);

        return redirect()->back()->with('success', 'Seu relato foi enviado com sucesso! Agradecemos o contato.');
    }

    /**
     * Exclui um relato da Ouvidoria (Apenas Admin).
     */
    public function delete(Ouvidoria $ouvidoria)
    {
        abort_unless(auth()->user()->role === 'admin', 403);

        if ($ouvidoria->foto) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $ouvidoria->foto));
        }

        $ouvidoria->delete();

        return redirect()->back()->with('success', 'Relato removido com sucesso.');
    }
}
