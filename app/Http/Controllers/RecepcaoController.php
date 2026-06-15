<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Recepcao;
use App\Models\Entrevista;
use Carbon\Carbon;

class RecepcaoController extends Controller
{
    /**
     * Página principal da recepção.
     * Exibe registros do dia atual com totais para KPIs.
     * Também lista entrevistas presenciais agendadas para a data filtrada.
     * Usuários com role 'recepcao' são redirecionados aqui no login.
     */
    public function index(Request $request)
    {
        $hoje = Carbon::today();

        $query = Recepcao::with('registradoPor')
            ->orderBy('horario_entrada', 'desc');

        // Filtro por data (padrão: hoje)
        $dataFiltro = $request->input('data', $hoje->toDateString());
        $query->whereDate('horario_entrada', $dataFiltro);

        // Filtro por busca (nome ou assunto)
        if ($busca = $request->input('busca')) {
            $query->where(function ($q) use ($busca) {
                $q->where('nome', 'like', "%{$busca}%")
                  ->orWhere('assunto', 'like', "%{$busca}%")
                  ->orWhere('departamento_responsavel', 'like', "%{$busca}%");
            });
        }

        // Filtro por status (presentes / saiu)
        if ($status = $request->input('status')) {
            if ($status === 'presente') {
                $query->whereNull('horario_saida');
            } elseif ($status === 'saiu') {
                $query->whereNotNull('horario_saida');
            }
        }

        $registros = $query->paginate(20)->withQueryString();

        // KPIs do dia atual
        $totalHoje = Recepcao::whereDate('horario_entrada', $hoje)->count();
        $presentesAgora = Recepcao::whereDate('horario_entrada', $hoje)
            ->whereNull('horario_saida')
            ->count();
        $jaSairam = Recepcao::whereDate('horario_entrada', $hoje)
            ->whereNotNull('horario_saida')
            ->count();
        $totalMes = Recepcao::whereMonth('horario_entrada', $hoje->month)
            ->whereYear('horario_entrada', $hoje->year)
            ->count();

        // Entrevistas presenciais agendadas para a data filtrada
        $entrevistasPresenciais = Entrevista::with([
                'candidatoVaga.candidato:id,nome,telefone',
                'candidatoVaga.vaga:id,titulo',
                'user:id,nome',
            ])
            ->where('tipo', 'Presencial')
            ->whereDate('data_hora', $dataFiltro)
            ->orderBy('data_hora', 'asc')
            ->get()
            ->map(function ($e) {
                return [
                    'id'                => $e->id,
                    'data_hora'         => $e->data_hora,
                    'candidato_nome'    => $e->candidatoVaga?->candidato?->nome ?? '—',
                    'candidato_telefone'=> $e->candidatoVaga?->candidato?->telefone ?? '',
                    'vaga_titulo'       => $e->candidatoVaga?->vaga?->titulo ?? '—',
                    'entrevistador'     => $e->user?->nome ?? '—',
                    'status'            => $e->candidatoVaga?->status ?? '—',
                ];
            });

        return Inertia::render('Recepcao/Index', [
            'registros'               => $registros,
            'filtros'                 => [
                'data'   => $dataFiltro,
                'busca'  => $busca ?? '',
                'status' => $status ?? '',
            ],
            'metricas'                => [
                'total_hoje'      => $totalHoje,
                'presentes_agora' => $presentesAgora,
                'ja_sairam'       => $jaSairam,
                'total_mes'       => $totalMes,
            ],
            'entrevistas_presenciais' => $entrevistasPresenciais,
            'horario_servidor'        => Carbon::now()->toIso8601String(),
        ]);
    }

    /**
     * Registra uma nova entrada na recepção.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nome'                     => 'required|string|max:255',
            'assunto'                  => 'required|string|max:255',
            'posto_cargo_empresa'      => 'nullable|string|max:255',
            'departamento_responsavel' => 'required|string|max:255',
            'contato'                  => 'nullable|string|max:255',
            'horario_entrada'          => 'required|date',
            'retorno'                  => 'nullable|string|max:1000',
            'indicacao'                => 'nullable|string|max:255',
        ]);

        $validated['user_id'] = auth()->id();

        Recepcao::create($validated);

        return redirect()->route('Recepcao')->with('success', 'Visitante registrado com sucesso.');
    }

    /**
     * Atualiza um registro da recepção (ex: editar dados ou marcar saída).
     */
    public function update(Request $request, Recepcao $recepcao)
    {
        $validated = $request->validate([
            'nome'                     => 'required|string|max:255',
            'assunto'                  => 'required|string|max:255',
            'posto_cargo_empresa'      => 'nullable|string|max:255',
            'departamento_responsavel' => 'required|string|max:255',
            'contato'                  => 'nullable|string|max:255',
            'horario_entrada'          => 'required|date',
            'horario_saida'            => 'nullable|date',
            'retorno'                  => 'nullable|string|max:1000',
            'indicacao'                => 'nullable|string|max:255',
        ]);

        $recepcao->update($validated);

        return redirect()->route('Recepcao')->with('success', 'Registro atualizado com sucesso.');
    }

    /**
     * Registra a saída do visitante (ação rápida).
     */
    public function registrarSaida(Recepcao $recepcao)
    {
        $recepcao->update([
            'horario_saida' => Carbon::now(),
        ]);

        return redirect()->route('Recepcao')->with('success', 'Saída registrada com sucesso.');
    }

    /**
     * Remove um registro da recepção.
     */
    public function delete(Recepcao $recepcao)
    {
        $recepcao->delete();

        return redirect()->route('Recepcao')->with('success', 'Registro excluído com sucesso.');
    }

    /**
     * Autocomplete de visitantes com base no histórico.
     */
    public function autocomplete(Request $request)
    {
        $termo = $request->input('q', '');
        if (strlen($termo) < 2) {
            return response()->json([]);
        }

        $visitantes = Recepcao::where('nome', 'like', "%{$termo}%")
            ->select('nome', 'contato', 'posto_cargo_empresa', 'departamento_responsavel')
            ->orderBy('created_at', 'desc')
            ->groupBy('nome', 'contato', 'posto_cargo_empresa', 'departamento_responsavel')
            ->limit(5)
            ->get();

        return response()->json($visitantes);
    }

    /**
     * Exporta registros do dia filtrado para CSV.
     */
    public function exportar(Request $request)
    {
        $dataFiltro = $request->input('data', Carbon::today()->toDateString());

        $registros = Recepcao::whereDate('horario_entrada', $dataFiltro)
            ->orderBy('horario_entrada', 'asc')
            ->get();

        $filename = 'recepcao_' . $dataFiltro . '.csv';

        return response()->streamDownload(function () use ($registros) {
            $handle = fopen('php://output', 'w');
            fprintf($handle, chr(0xEF).chr(0xBB).chr(0xBF));

            fputcsv($handle, ['Nome', 'Assunto', 'Cargo/Empresa', 'Departamento', 'Contato', 'Entrada', 'Saída', 'Indicação', 'Retorno'], ';');

            foreach ($registros as $r) {
                fputcsv($handle, [
                    $r->nome,
                    $r->assunto,
                    $r->posto_cargo_empresa,
                    $r->departamento_responsavel,
                    $r->contato,
                    $r->horario_entrada ? Carbon::parse($r->horario_entrada)->format('d/m/Y H:i') : '',
                    $r->horario_saida ? Carbon::parse($r->horario_saida)->format('d/m/Y H:i') : '',
                    $r->indicacao,
                    $r->retorno,
                ], ';');
            }

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    /**
     * Marca que o candidato chegou para a entrevista presencial.
     */
    public function marcarChegada(Request $request, Entrevista $entrevista)
    {
        // Cria registro de visitante automático
        $candidato = $entrevista->candidatoVaga?->candidato;
        $vaga = $entrevista->candidatoVaga?->vaga;

        if ($candidato) {
            Recepcao::create([
                'nome'                     => $candidato->nome,
                'assunto'                  => 'Entrevista - ' . ($vaga->titulo ?? 'Vaga'),
                'departamento_responsavel' => 'RH',
                'contato'                  => $candidato->telefone,
                'horario_entrada'          => Carbon::now(),
                'indicacao'                => 'Entrevista agendada',
                'user_id'                  => auth()->id(),
            ]);
        }

        return redirect()->route('Recepcao')->with('success', 'Chegada do candidato registrada.');
    }
}
