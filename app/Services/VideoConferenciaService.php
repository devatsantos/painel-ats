<?php

namespace App\Services;

use Carbon\Carbon;

class VideoConferenciaService
{
    /**
     * Gera um link Jitsi Meet único para a entrevista.
     */
    public function criarEvento(string $titulo, Carbon $inicio, Carbon $fim): ?string
    {
        $slug = 'PainelRH-' . bin2hex(random_bytes(8));

        return 'https://meet.jit.si/' . $slug;
    }
}
