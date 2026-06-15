<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Service para integração com o Portal AT&Santos (Next.js).
 * Envia dados de colaboradores contratados para cadastro automático no portal.
 */
class PortalAtSantosService
{
    protected string $baseUrl;
    protected string $apiKey;

    public function __construct()
    {
        $this->baseUrl = rtrim(config('services.portal_atsantos.url', ''), '/');
        $this->apiKey  = config('services.portal_atsantos.api_key', '');
    }

    /**
     * Verifica se a integração está configurada.
     */
    public function isConfigured(): bool
    {
        return !empty($this->baseUrl) && !empty($this->apiKey);
    }

    /**
     * Cadastra ou atualiza um colaborador no Portal AT&Santos.
     *
     * @param array $data Dados do colaborador: name, cpf, phone, email
     * @return array{success: bool, action?: string, collaborator?: array, message?: string}
     */
    public function syncColaborador(array $data): array
    {
        if (!$this->isConfigured()) {
            Log::warning('[PortalAtSantos] Integração não configurada. Defina PORTAL_ATSANTOS_URL e PORTAL_ATSANTOS_API_KEY no .env');
            return [
                'success' => false,
                'message' => 'Integração com o portal não configurada.',
            ];
        }

        try {
            $response = Http::withHeaders([
                'x-api-key' => $this->apiKey,
            ])
            ->timeout(15)
            ->post("{$this->baseUrl}/api/integration/collaborator", [
                'name'  => $data['name'],
                'cpf'   => $data['cpf'],
                'phone' => $data['phone'] ?? null,
                'email' => $data['email'] ?? null,
            ]);

            if ($response->successful()) {
                $body = $response->json();
                Log::info('[PortalAtSantos] Colaborador sincronizado com sucesso.', [
                    'action' => $body['action'] ?? 'unknown',
                    'cpf'    => substr($data['cpf'], 0, 3) . '***',
                ]);
                return $body;
            }

            $errorBody = $response->json();
            Log::error('[PortalAtSantos] Erro ao sincronizar colaborador.', [
                'status'  => $response->status(),
                'message' => $errorBody['message'] ?? 'Erro desconhecido',
                'cpf'     => substr($data['cpf'], 0, 3) . '***',
            ]);

            return [
                'success' => false,
                'message' => $errorBody['message'] ?? 'Erro ao comunicar com o portal.',
            ];
        } catch (\Exception $e) {
            Log::error('[PortalAtSantos] Exceção ao sincronizar colaborador.', [
                'error' => $e->getMessage(),
                'cpf'   => substr($data['cpf'], 0, 3) . '***',
            ]);

            return [
                'success' => false,
                'message' => 'Erro de conexão com o portal: ' . $e->getMessage(),
            ];
        }
    }
}
