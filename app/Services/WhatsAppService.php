<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class WhatsAppService
{
    protected $apiUrl;
    protected $apiKey;
    protected $instance;

    public function __construct()
    {
        $this->apiUrl   = rtrim(config('services.evolution.url', ''), '/');
        $this->apiKey   = config('services.evolution.key');
        $this->instance = config('services.evolution.instance');
    }

    public function enviarMensagem($numero, $mensagem)
    {
        $numeroLimpo = preg_replace('/\D/', '', $numero);
        
        if (strlen($numeroLimpo) === 10 || strlen($numeroLimpo) === 11) {
            $numeroLimpo = '55' . $numeroLimpo;
        }
        
        $response = Http::withHeaders([
            'apikey' => $this->apiKey,
            'Content-Type' => 'application/json',
        ])->post("{$this->apiUrl}/message/sendText/{$this->instance}", [
            'number' => $numeroLimpo,
            'options' => [
                'delay' => 1200,
                'presence' => 'composing',
            ],
            'text' => $mensagem
        ]);

        return $response->json();
    }
} 