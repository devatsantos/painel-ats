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
                'data'  => $dataFiltro,
                'busca' => $busca ?? '',
            ],
            'metricas'                => [
                'total_hoje'      => $totalHoje,
                'presentes_agora' => $presentesAgora,
                'ja_sairam'       => $jaSairam,
                'total_mes'       => $totalMes,
            ],
            'entrevistas_presenciais' => $entrevistasPresenciais,
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
}
