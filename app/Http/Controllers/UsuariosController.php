<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use App\Models\User;

class UsuariosController extends Controller
{
    public function index() {
        abort_unless(auth()->user()->role === 'admin', 403);
        $usuarios = User::orderBy('nome')->paginate(20);
        return Inertia::render('Usuarios/Index', ['usuarios' => $usuarios]);
    }
    public function store(Request $request) {
        abort_unless(auth()->user()->role === 'admin', 403);
        $validated = $request->validate([
            'nome' => 'required|string|max:255',
            'cpf' => 'required|string|max:14|unique:users,cpf',
            'password' => 'required|string|min:8',
            'role' => 'nullable|string|in:admin,recrutador,coordenador,recepcao'
        ]);

        User::create([
            'nome' => $validated['nome'],
            'cpf' => $validated['cpf'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'] ?? null,
        ]);

        return redirect()->route('Usuarios');
    }
    public function delete(User $usuario) {
        abort_unless(auth()->user()->role === 'admin', 403);
        $usuario->delete();
        return redirect()->route('Usuarios')->with('success', 'Usuário deletado com sucesso.');
    }
    public function update(Request $request, User $usuario) {
        abort_unless(auth()->user()->role === 'admin', 403);
        $validated = $request->validate([
            'nome' => 'required|string|max:255',
            'cpf' => 'required|string|max:14|unique:users,cpf,' . $usuario->id,
            'password' => 'nullable|string|min:8',
            'role' => 'nullable|string|in:admin,recrutador,coordenador,recepcao'
        ]);

        $usuario->update([
            'nome' => $validated['nome'],
            'cpf' => $validated['cpf'],
            'password' => $validated['password'] ? Hash::make($validated['password']) : $usuario->password,
            'role' => $validated['role'] ?? $usuario->role,
        ]);

        return redirect()->route('Usuarios')->with('success', 'Usuário atualizado com sucesso.');
}
}
