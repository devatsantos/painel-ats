<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ArquivosController extends Controller
{
    /**
     * Tipos de arquivo permitidos e seus discos/subpastas correspondentes.
     * Cada entrada define: disco de armazenamento e guard de autenticação exigido.
     */
    private const TIPOS = [
        'curriculos'  => ['disco' => 'private', 'guard' => 'web,candidato'],
        'orcamentos'  => ['disco' => 'private', 'guard' => 'web'],
        'ouvidorias'  => ['disco' => 'private', 'guard' => 'web'],
    ];

    /**
     * Serve um arquivo protegido após verificar a autenticação.
     *
     * GET /arquivos/{tipo}/{filename}
     */
    public function serve(string $tipo, string $filename): StreamedResponse
    {
        // 1. Valida o tipo para evitar path traversal
        if (!array_key_exists($tipo, self::TIPOS)) {
            abort(404);
        }

        $config = self::TIPOS[$tipo];
        $guards = explode(',', $config['guard']);

        // 2. Verifica se o usuário está autenticado em algum dos guards permitidos
        $autenticado = false;
        foreach ($guards as $guard) {
            if (auth()->guard(trim($guard))->check()) {
                $autenticado = true;
                break;
            }
        }

        if (!$autenticado) {
            abort(403, 'Acesso não autorizado.');
        }

        // 3. Sanitiza o nome do arquivo — impede path traversal (../../)
        $filename = basename($filename);
        $path     = "{$tipo}/{$filename}";

        if (!Storage::disk('private')->exists($path)) {
            abort(404, 'Arquivo não encontrado.');
        }

        // 4. Detecta o MIME type e entrega o arquivo via stream
        $mimeType = Storage::disk('private')->mimeType($path);

        return Storage::disk('private')->response($path, $filename, [
            'Content-Type'        => $mimeType,
            'Content-Disposition' => 'inline; filename="' . $filename . '"',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }
}
