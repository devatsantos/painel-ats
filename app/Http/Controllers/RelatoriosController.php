<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\CandidatoVaga;
use App\Models\Entrevista;
use App\Models\Vagas;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class RelatoriosController extends Controller
{
    public function index()
    {
        // 1. Métricas Gerais
        $totalCandidaturas = CandidatoVaga::count();

        // Quem fez mais contratações no mês (Recrutador Destaque)
        $destaqueRecrutadorRaw = DB::table('entrevistas')
            ->join('candidato_vaga', 'entrevistas.candidato_vaga_id', '=', 'candidato_vaga.id')
            ->join('users', 'entrevistas.user_id', '=', 'users.id')
            ->where('candidato_vaga.status', 'contratado')
            ->whereMonth('candidato_vaga.updated_at', now()->month)
            ->whereYear('candidato_vaga.updated_at', now()->year)
            ->select('users.nome', DB::raw('COUNT(candidato_vaga.id) as total'))
            ->groupBy('users.id', 'users.nome')
            ->orderBy('total', 'desc')
            ->first();

        $recrutadorDestaqueNome = $destaqueRecrutadorRaw ? $destaqueRecrutadorRaw->nome : 'Nenhum recrutador';
        $recrutadorDestaqueTotal = $destaqueRecrutadorRaw ? (int) $destaqueRecrutadorRaw->total : 0;

        // Tempo médio de contratação (DATEDIFF de updated_at e created_at para status 'contratado')
        $tempoMedioContratacao = CandidatoVaga::where('status', 'contratado')
            ->selectRaw('AVG(DATEDIFF(updated_at, created_at)) as avg_days')
            ->value('avg_days');
        $tempoMedioDias = $tempoMedioContratacao !== null ? round($tempoMedioContratacao) : 12;

        // Vagas preenchidas (vagas com pelo menos um contratado)
        $vagasPreenchidas = CandidatoVaga::where('status', 'contratado')
            ->distinct('vaga_id')
            ->count('vaga_id');

        // 2. Candidatos por Status
        $statuses = [
            'contratado'     => 'Contratados',
            'selecionado'    => 'Selecionados',
            'reprovado'      => 'Reprovados',
            'recusou_vaga'   => 'Recusaram vaga',
            'sem_vaga'       => 'Sem vaga',
            'nao_compareceu' => 'Não compareceu',
            'desclassificado'=> 'Desclassificados',
        ];

        $candidatosPorStatusRaw = CandidatoVaga::select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->pluck('total', 'status')
            ->toArray();

        $candidatosPorStatus = [];
        foreach ($statuses as $status => $label) {
            $candidatosPorStatus[] = [
                'status' => $status,
                'label'  => $label,
                'total'  => $candidatosPorStatusRaw[$status] ?? 0,
            ];
        }

        // 3. Vagas em Destaque (limite de 6)
        $vagasDestaque = DB::table('vagas')
            ->leftJoin('candidato_vaga', 'vagas.id', '=', 'candidato_vaga.vaga_id')
            ->whereNull('vagas.deleted_at')
            ->select(
                'vagas.titulo',
                'vagas.ativo',
                DB::raw('COUNT(candidato_vaga.id) as candidaturas'),
                DB::raw("SUM(CASE WHEN candidato_vaga.status = 'contratado' THEN 1 ELSE 0 END) as contratacoes")
            )
            ->groupBy('vagas.id', 'vagas.titulo', 'vagas.ativo')
            ->orderBy('candidaturas', 'desc')
            ->limit(6)
            ->get()
            ->map(fn($v) => [
                'titulo'       => $v->titulo,
                'candidaturas' => (int) $v->candidaturas,
                'contratacoes' => (int) $v->contratacoes,
                'ativo'        => (bool) $v->ativo,
            ])
            ->toArray();

        // 4. Entrevistas por Mês (últimos 6 meses)
        $entrevistasPorMes = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $nomeMes = $date->translatedFormat('M'); // "Jan", "Fev", "Mar", etc.
            $nomeMes = ucfirst(rtrim($nomeMes, '.'));

            $total = Entrevista::whereMonth('data_hora', $date->month)
                ->whereYear('data_hora', $date->year)
                ->count();

            $entrevistasPorMes[] = [
                'mes'   => $nomeMes,
                'total' => $total,
            ];
        }

        $bancoTalentosTotal = \App\Models\Candidatos::where('banco_de_talentos', true)->count();

        $funil = [
            'candidaturas' => $totalCandidaturas,
            'entrevistas'  => \App\Models\Entrevista::count(),
            'contratados'  => \App\Models\CandidatoVaga::where('status', 'contratado')->count(),
        ];

        $escolaridades = DB::table('candidatos')
            ->select('nivel_escolaridade', DB::raw('count(*) as total'))
            ->whereNotNull('nivel_escolaridade')
            ->where('nivel_escolaridade', '<>', '')
            ->groupBy('nivel_escolaridade')
            ->orderBy('total', 'desc')
            ->get()
            ->map(fn($e) => [
                'label' => $e->nivel_escolaridade,
                'total' => (int) $e->total,
            ])
            ->toArray();

        $regioes = DB::table('candidatos')
            ->select('regiao', DB::raw('count(*) as total'))
            ->whereNotNull('regiao')
            ->where('regiao', '<>', '')
            ->groupBy('regiao')
            ->orderBy('total', 'desc')
            ->limit(5)
            ->get()
            ->map(fn($r) => [
                'label' => $r->regiao,
                'total' => (int) $r->total,
            ])
            ->toArray();

        $entrevistasTipo = [
            'online'     => \App\Models\Entrevista::where('tipo', 'Online')->count(),
            'presencial' => \App\Models\Entrevista::where('tipo', 'Presencial')->count(),
        ];

        return Inertia::render('Relatorios/Index', [
            'metricas' => [
                'total_candidaturas'        => $totalCandidaturas,
                'recrutador_destaque_nome'  => $recrutadorDestaqueNome,
                'recrutador_destaque_total' => $recrutadorDestaqueTotal,
                'tempo_medio_dias'          => $tempoMedioDias,
                'vagas_preenchidas'         => $vagasPreenchidas,
                'banco_talentos_total'      => $bancoTalentosTotal,
            ],
            'candidatos_por_status' => $candidatosPorStatus,
            'vagas_destaque'        => $vagasDestaque,
            'entrevistas_por_mes'   => $entrevistasPorMes,
            'funil'                 => $funil,
            'escolaridades'         => $escolaridades,
            'regioes'               => $regioes,
            'entrevistas_tipo'      => $entrevistasTipo,
        ]);
    }
}
