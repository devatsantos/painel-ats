<?php

namespace App\Providers;

use Carbon\Carbon;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Carbon::setLocale('pt_BR');

        if (config('app.env') === 'production') {
            URL::forceScheme('https');
        }

        // Carrega configurações gerais do banco de dados e sobrescreve o config
        try {
            if (\Illuminate\Support\Facades\Schema::hasTable('configuracoes')) {
                $configs = \App\Models\Configuracao::pluck('valor', 'chave')->all();
                foreach ($configs as $chave => $valor) {
                    config([$chave => $valor]);
                }
            }
        } catch (\Exception $e) {
            // Silencioso para evitar quebrar comandos de console (como migrations) antes de configurar o banco
        }

        // 1 envio a cada 5 minutos por CPF + IP
        RateLimiter::for('enviar-codigo-whatsapp', function (Request $request) {
            $key = ($request->input('cpf') ?? 'anonimo') . '|' . $request->ip();
            return Limit::perMinutes(5, 1)->by($key)
                ->response(fn () => response()->json([
                    'error' => 'Aguarde 5 minutos antes de solicitar um novo código.',
                ], 429));
        });

        // 15 tentativas a cada 2 minutos por CPF + IP
        RateLimiter::for('verificar-codigo-whatsapp', function (Request $request) {
            $key = ($request->input('cpf') ?? 'anonimo') . '|' . $request->ip();
            return Limit::perMinutes(2, 15)->by($key)
                ->response(fn () => response()->json([
                    'error' => 'Muitas tentativas. Aguarde 2 minutos e tente novamente.',
                ], 429));
        });

        // 10 consultas a cada 5 minutos por IP (anti-enumeração de CPF)
        RateLimiter::for('verificar-cpf', function (Request $request) {
            return Limit::perMinutes(5, 10)->by($request->ip())
                ->response(fn () => response()->json([
                    'message' => 'Muitas tentativas. Aguarde alguns minutos e tente novamente.',
                ], 429));
        });

        // 3 tentativas a cada 5 minutos por CPF + IP (verificação de data de nascimento)
        RateLimiter::for('verificar-nascimento', function (Request $request) {
            $key = ($request->input('cpf') ?? 'anonimo') . '|' . $request->ip();
            return Limit::perMinutes(5, 3)->by($key)
                ->response(fn () => response()->json([
                    'error' => 'Muitas tentativas. Aguarde 5 minutos e tente novamente.',
                ], 429));
        });
    }
}
