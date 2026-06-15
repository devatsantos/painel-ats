<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\File;

class LogsController extends Controller
{
    public function index(Request $request)
    {
        abort_unless(auth()->user()->role === 'admin', 403);

        $logPath = storage_path('logs/laravel.log');
        
        if (!File::exists($logPath)) {
            return Inertia::render('Logs/Index', [
                'logs' => [],
                'fileSize' => '0 B',
                'filters' => [
                    'level' => '',
                    'search' => '',
                ]
            ]);
        }

        // Get file size
        $sizeBytes = File::size($logPath);
        $fileSize = $this->formatSize($sizeBytes);

        // Read last 2MB to prevent memory exhaustion if log file is massive
        $maxReadSize = 2 * 1024 * 1024; // 2MB
        if ($sizeBytes > $maxReadSize) {
            $handle = fopen($logPath, 'r');
            fseek($handle, -$maxReadSize, SEEK_END);
            $content = fread($handle, $maxReadSize);
            fclose($handle);
            // discard the first line since it might be incomplete
            $firstNewline = strpos($content, "\n");
            if ($firstNewline !== false) {
                $content = substr($content, $firstNewline + 1);
            }
        } else {
            $content = File::get($logPath);
        }

        $lines = explode("\n", $content);
        $entries = [];
        $currentEntry = null;

        // Format: [YYYY-MM-DD HH:MM:SS] ENV.LEVEL: MESSAGE
        $pattern = '/^\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\] (\w+)\.(\w+): (.*)/';

        foreach ($lines as $line) {
            $line = rtrim($line);
            if (preg_match($pattern, $line, $matches)) {
                if ($currentEntry) {
                    $entries[] = $currentEntry;
                }
                $currentEntry = [
                    'date' => $matches[1],
                    'env' => $matches[2],
                    'level' => $matches[3],
                    'message' => $matches[4],
                    'stack' => '',
                ];
            } else {
                if ($currentEntry) {
                    $currentEntry['stack'] .= $line . "\n";
                }
            }
        }
        if ($currentEntry) {
            $entries[] = $currentEntry;
        }

        // We want the most recent logs first
        $entries = array_reverse($entries);

        // Filter by level if provided
        $filterLevel = $request->input('level');
        if ($filterLevel) {
            $entries = array_filter($entries, function ($entry) use ($filterLevel) {
                return strtolower($entry['level']) === strtolower($filterLevel);
            });
        }

        // Filter by search query if provided
        $search = $request->input('search');
        if ($search) {
            $entries = array_filter($entries, function ($entry) use ($search) {
                return stripos($entry['message'], $search) !== false || stripos($entry['stack'], $search) !== false;
            });
        }

        // Paginate/limit payload to 150 entries to keep Inertia fast
        $entries = array_slice($entries, 0, 150);

        return Inertia::render('Logs/Index', [
            'logs' => array_values($entries),
            'fileSize' => $fileSize,
            'filters' => [
                'level' => $filterLevel ?? '',
                'search' => $search ?? '',
            ]
        ]);
    }

    public function clear()
    {
        abort_unless(auth()->user()->role === 'admin', 403);
        
        $logPath = storage_path('logs/laravel.log');
        if (File::exists($logPath)) {
            File::put($logPath, '');
        }

        return redirect()->back()->with('success', 'Arquivo de logs limpo com sucesso.');
    }

    private function formatSize($bytes)
    {
        if ($bytes >= 1073741824) {
            return number_format($bytes / 1073741824, 2) . ' GB';
        } elseif ($bytes >= 1048576) {
            return number_format($bytes / 1048576, 2) . ' MB';
        } elseif ($bytes >= 1024) {
            return number_format($bytes / 1024, 2) . ' KB';
        } elseif ($bytes > 1) {
            return $bytes . ' bytes';
        } elseif ($bytes == 1) {
            return '1 byte';
        } else {
            return '0 bytes';
        }
    }

    /**
     * Verifica o status da conexão com a Evolution API (WhatsApp).
     */
    public function whatsappStatus()
    {
        abort_unless(auth()->user()->role === 'admin', 403);

        $apiUrl   = rtrim(config('services.evolution.url', ''), '/');
        $apiKey   = config('services.evolution.key');
        $instance = config('services.evolution.instance');

        if (!$apiUrl || !$apiKey || !$instance) {
            return response()->json([
                'connected' => false,
                'state'     => 'not_configured',
                'message'   => 'Variáveis de ambiente da Evolution API não configuradas.',
            ]);
        }

        try {
            $response = \Illuminate\Support\Facades\Http::withHeaders([
                'apikey' => $apiKey,
            ])->timeout(10)->get("{$apiUrl}/instance/connectionState/{$instance}");

            $data  = $response->json();
            $state = $data['instance']['state'] ?? ($data['state'] ?? 'unknown');

            return response()->json([
                'connected' => $state === 'open',
                'state'     => $state,
                'instance'  => $instance,
                'message'   => $state === 'open'
                    ? 'WhatsApp conectado e funcionando.'
                    : "Estado da conexão: {$state}",
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'connected' => false,
                'state'     => 'error',
                'message'   => 'Erro ao conectar com a Evolution API: ' . $e->getMessage(),
            ]);
        }
    }

    /**
     * Envia uma mensagem de teste via WhatsApp.
     */
    public function whatsappTestar(Request $request)
    {
        abort_unless(auth()->user()->role === 'admin', 403);

        $request->validate([
            'numero'   => 'required|string|min:10',
            'mensagem' => 'required|string|max:1000',
        ]);

        try {
            $service  = new \App\Services\WhatsAppService();
            $response = $service->enviarMensagem($request->numero, $request->mensagem);

            return response()->json([
                'success'  => true,
                'message'  => 'Mensagem de teste enviada com sucesso!',
                'response' => $response,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao enviar mensagem: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Verifica o status da conexão com o Portal AT&Santos.
     */
    public function portalStatus()
    {
        abort_unless(auth()->user()->role === 'admin', 403);

        $service = new \App\Services\PortalAtSantosService();

        if (!$service->isConfigured()) {
            return response()->json([
                'connected' => false,
                'state'     => 'not_configured',
                'message'   => 'Variáveis PORTAL_ATSANTOS_URL e PORTAL_ATSANTOS_API_KEY não configuradas no .env.',
            ]);
        }

        $baseUrl = rtrim(config('services.portal_atsantos.url', ''), '/');
        $apiKey  = config('services.portal_atsantos.api_key', '');

        try {
            $response = \Illuminate\Support\Facades\Http::withHeaders([
                'x-api-key' => $apiKey,
            ])->timeout(10)->get("{$baseUrl}/api/health");

            if ($response->successful()) {
                $data = $response->json();
                return response()->json([
                    'connected' => true,
                    'state'     => 'online',
                    'url'       => $baseUrl,
                    'message'   => $data['message'] ?? 'Portal conectado e funcionando.',
                ]);
            }

            return response()->json([
                'connected' => false,
                'state'     => 'error',
                'url'       => $baseUrl,
                'message'   => "Portal respondeu com status {$response->status()}.",
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'connected' => false,
                'state'     => 'offline',
                'url'       => $baseUrl,
                'message'   => 'Não foi possível conectar ao Portal: ' . $e->getMessage(),
            ]);
        }
    }

    /**
     * Envia um colaborador de teste para o Portal AT&Santos.
     */
    public function portalTestar(Request $request)
    {
        abort_unless(auth()->user()->role === 'admin', 403);

        $request->validate([
            'nome'  => 'required|string|max:255',
            'cpf'   => 'required|string|min:11',
            'email' => 'nullable|email|max:255',
            'telefone' => 'nullable|string|max:20',
        ]);

        $service = new \App\Services\PortalAtSantosService();
        $result  = $service->syncColaborador([
            'name'  => $request->nome,
            'cpf'   => $request->cpf,
            'phone' => $request->telefone,
            'email' => $request->email,
        ]);

        return response()->json($result, $result['success'] ?? false ? 200 : 500);
    }
}
