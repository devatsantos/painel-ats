<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->trustProxies(at: '*');

        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
        ]);

        $middleware->redirectGuestsTo(function ($request) {
            // Rotas do portal (/portal/*) usam o guard candidato — redireciona para login do portal
            if ($request->is('portal/*')) {
                return '/portal';
            }
            return '/login';
        });
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
