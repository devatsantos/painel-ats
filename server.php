<?php

/**
 * Laravel - PHP Built-in Server Router
 *
 * Este arquivo é usado pelo PHP built-in server (php artisan serve)
 * para redirecionar todas as requisições para o index.php do Laravel.
 */

$uri = urldecode(
    parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '/'
);

// Serve arquivos estáticos que existem no diretório public/
if ($uri !== '/' && file_exists(__DIR__.'/public'.$uri)) {
    return false;
}

// Redireciona tudo para o front controller do Laravel
$_SERVER['SCRIPT_NAME'] = '/index.php';
$_SERVER['SCRIPT_FILENAME'] = __DIR__.'/public/index.php';

require_once __DIR__.'/public/index.php';
