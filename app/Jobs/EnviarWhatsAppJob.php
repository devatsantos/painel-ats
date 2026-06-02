<?php

namespace App\Jobs;

use App\Services\WhatsAppService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class EnviarWhatsAppJob implements ShouldQueue
{
    use Queueable, InteractsWithQueue, SerializesModels;

    public int $tries = 3;
    public int $backoff = 60;

    public function __construct(
        private readonly string $numero,
        private readonly string $mensagem,
    ) {}

    public function handle(WhatsAppService $whatsAppService): void
    {
        $whatsAppService->enviarMensagem($this->numero, $this->mensagem);
    }

    public function failed(\Throwable $exception): void
    {
        Log::error('EnviarWhatsAppJob falhou após todas as tentativas.', [
            'numero' => substr($this->numero, 0, 6) . str_repeat('*', max(0, strlen($this->numero) - 6)),
            'erro'   => $exception->getMessage(),
        ]);
    }
}
