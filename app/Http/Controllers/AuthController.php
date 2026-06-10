<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function index() {
        return Inertia::render('Login/Index');
    }
    public function login(Request $request) {
       $credenciais = $request->validate([
            'cpf' => 'required|string',
            'password' => 'required|string'
        ]);
        $chaveBloqueio = Str::lower($request->input('cpf')) . '|' . $request->ip();
        if (RateLimiter::tooManyAttempts($chaveBloqueio, 5)) {
            $segundosRestantes = RateLimiter::availableIn($chaveBloqueio);
            return back()->withErrors([
                'cpf' => "Muitas tentativas de login. Tente novamente em $segundosRestantes segundos."
            ]);
        }
        if (auth()->attempt($credenciais)) {
            $request->session()->regenerate();
            RateLimiter::clear($chaveBloqueio);

            // Usuários da recepção são redirecionados para a tela exclusiva
            if (auth()->user()->role === 'recepcao') {
                return redirect()->route('Recepcao');
            }

            return redirect()->intended('/');
        }

        RateLimiter::hit($chaveBloqueio, 60);

        return back()->withErrors([
            'cpf' => 'As credenciais fornecidas não são válidas.',
        ]);
    }
    public function logout(Request $request) {
        auth()->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect('/login');
    }

}
