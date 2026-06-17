<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\CandidatoVaga;
use App\Models\CandidatoVagaHistorico;
use App\Models\Entrevista;
use App\Models\MetaRecrutador;
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

    /**
     * Dashboard 1: Funil de Recrutamento
     */
    public function funil()
    {
        $totalCandidaturas = CandidatoVaga::count();
        $totalTriados = CandidatoVaga::whereIn('status', ['selecionado', 'marcada', 'contratado'])->count();
        $totalEntrevistados = Entrevista::distinct('candidato_vaga_id')->count('candidato_vaga_id');
        $totalContratados = CandidatoVaga::where('status', 'contratado')->count();
        $totalAprovados = $totalContratados
            + CandidatoVaga::where('status', 'selecionado')->whereHas('entrevista')->count();

        $funilEtapas = [
            ['etapa' => 'Candidaturas',  'total' => $totalCandidaturas],
            ['etapa' => 'Triados',       'total' => $totalTriados],
            ['etapa' => 'Entrevistados', 'total' => $totalEntrevistados],
            ['etapa' => 'Aprovados',     'total' => $totalAprovados],
            ['etapa' => 'Contratados',   'total' => $totalContratados],
        ];

        $conversoes = [];
        for ($i = 1; $i < count($funilEtapas); $i++) {
            $anterior = $funilEtapas[$i - 1]['total'];
            $atual = $funilEtapas[$i]['total'];
            $conversoes[] = [
                'de'   => $funilEtapas[$i - 1]['etapa'],
                'para' => $funilEtapas[$i]['etapa'],
                'taxa' => $anterior > 0 ? round(($atual / $anterior) * 100, 1) : 0,
            ];
        }

        $conversaoGeral = $totalCandidaturas > 0
            ? round(($totalContratados / $totalCandidaturas) * 100, 1)
            : 0;

        $tendenciaMensal = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $nomeMes = ucfirst(rtrim($date->translatedFormat('M'), '.'));

            $tendenciaMensal[] = [
                'mes'          => $nomeMes,
                'candidaturas' => CandidatoVaga::whereMonth('created_at', $date->month)->whereYear('created_at', $date->year)->count(),
                'entrevistas'  => Entrevista::whereMonth('data_hora', $date->month)->whereYear('data_hora', $date->year)->count(),
                'contratados'  => CandidatoVaga::where('status', 'contratado')->whereMonth('updated_at', $date->month)->whereYear('updated_at', $date->year)->count(),
            ];
        }

        $funilPorVaga = DB::table('vagas')
            ->leftJoin('candidato_vaga', 'vagas.id', '=', 'candidato_vaga.vaga_id')
            ->leftJoin('entrevistas', 'candidato_vaga.id', '=', 'entrevistas.candidato_vaga_id')
            ->whereNull('vagas.deleted_at')
            ->where('vagas.ativo', true)
            ->select(
                'vagas.titulo',
                DB::raw('COUNT(DISTINCT candidato_vaga.id) as candidaturas'),
                DB::raw("COUNT(DISTINCT CASE WHEN candidato_vaga.status IN ('selecionado','marcada','contratado') THEN candidato_vaga.id END) as triados"),
                DB::raw('COUNT(DISTINCT entrevistas.candidato_vaga_id) as entrevistados'),
                DB::raw("COUNT(DISTINCT CASE WHEN candidato_vaga.status = 'contratado' THEN candidato_vaga.id END) as contratados")
            )
            ->groupBy('vagas.id', 'vagas.titulo')
            ->orderBy('candidaturas', 'desc')
            ->limit(10)
            ->get()
            ->map(fn($v) => [
                'titulo'        => $v->titulo,
                'candidaturas'  => (int) $v->candidaturas,
                'triados'       => (int) $v->triados,
                'entrevistados' => (int) $v->entrevistados,
                'contratados'   => (int) $v->contratados,
                'taxa'          => $v->candidaturas > 0 ? round(($v->contratados / $v->candidaturas) * 100, 1) : 0,
            ])
            ->toArray();

        return Inertia::render('Relatorios/Funil', [
            'funil_etapas'     => $funilEtapas,
            'conversoes'       => $conversoes,
            'conversao_geral'  => $conversaoGeral,
            'tendencia_mensal' => $tendenciaMensal,
            'funil_por_vaga'   => $funilPorVaga,
        ]);
    }

    /**
     * Dashboard 2: Time-to-Hire
     */
    public function timeToHire()
    {
        $tempoMedioGeral = CandidatoVaga::where('status', 'contratado')
            ->selectRaw('AVG(DATEDIFF(updated_at, created_at)) as avg_days')
            ->value('avg_days');
        $tempoMedioGeral = $tempoMedioGeral !== null ? round($tempoMedioGeral, 1) : 0;

        // Tempo por etapa (usando histórico)
        $tempoPorEtapa = [];
        $etapasTransicao = [
            ['de' => null,          'para' => 'selecionado', 'label' => 'Triagem'],
            ['de' => 'selecionado', 'para' => 'marcada',     'label' => 'Agendamento'],
            ['de' => 'marcada',     'para' => 'contratado',  'label' => 'Entrevista → Resultado'],
        ];

        foreach ($etapasTransicao as $etapa) {
            $query = DB::table('candidato_vaga_historico')
                ->where('status_novo', $etapa['para']);
            if ($etapa['de'] !== null) {
                $query->where('status_anterior', $etapa['de']);
            }

            // Buscar pares de transições para calcular duração média entre elas
            $avgDias = $query->join('candidato_vaga', 'candidato_vaga_historico.candidato_vaga_id', '=', 'candidato_vaga.id')
                ->selectRaw('AVG(DATEDIFF(candidato_vaga_historico.created_at, candidato_vaga.created_at)) as avg_days')
                ->value('avg_days');

            $tempoPorEtapa[] = [
                'etapa' => $etapa['label'],
                'dias'  => $avgDias !== null ? round($avgDias, 1) : 0,
            ];
        }

        // Vagas com SLA
        $vagasComSla = DB::table('vagas')
            ->leftJoin('candidato_vaga', function ($join) {
                $join->on('vagas.id', '=', 'candidato_vaga.vaga_id')
                     ->where('candidato_vaga.status', '=', 'contratado');
            })
            ->whereNull('vagas.deleted_at')
            ->whereNotNull('vagas.sla_dias')
            ->select(
                'vagas.id', 'vagas.titulo', 'vagas.sla_dias', 'vagas.ativo',
                'vagas.created_at as vaga_criada',
                DB::raw('MIN(candidato_vaga.updated_at) as primeira_contratacao'),
                DB::raw("CASE WHEN MIN(candidato_vaga.updated_at) IS NOT NULL THEN DATEDIFF(MIN(candidato_vaga.updated_at), vagas.created_at) ELSE DATEDIFF(NOW(), vagas.created_at) END as dias_reais")
            )
            ->groupBy('vagas.id', 'vagas.titulo', 'vagas.sla_dias', 'vagas.ativo', 'vagas.created_at')
            ->orderBy('dias_reais', 'desc')
            ->get()
            ->map(fn($v) => [
                'titulo'     => $v->titulo,
                'sla_dias'   => (int) $v->sla_dias,
                'dias_reais' => (int) $v->dias_reais,
                'ativo'      => (bool) $v->ativo,
                'preenchida' => $v->primeira_contratacao !== null,
                'dentro_sla' => (int) $v->dias_reais <= (int) $v->sla_dias,
            ])
            ->toArray();

        $dentraSla = collect($vagasComSla)->where('dentro_sla', true)->count();
        $foraSla = collect($vagasComSla)->where('dentro_sla', false)->count();
        $totalComSla = $dentraSla + $foraSla;
        $pctDentroSla = $totalComSla > 0 ? round(($dentraSla / $totalComSla) * 100, 1) : 0;

        // Comparativo por recrutador
        $porRecrutador = DB::table('vagas')
            ->join('users', 'vagas.user_id', '=', 'users.id')
            ->join('candidato_vaga', function ($join) {
                $join->on('vagas.id', '=', 'candidato_vaga.vaga_id')
                     ->where('candidato_vaga.status', '=', 'contratado');
            })
            ->whereNull('vagas.deleted_at')
            ->select(
                'users.nome',
                DB::raw('ROUND(AVG(DATEDIFF(candidato_vaga.updated_at, candidato_vaga.created_at)), 1) as tempo_medio'),
                DB::raw('COUNT(candidato_vaga.id) as total_contratacoes')
            )
            ->groupBy('users.id', 'users.nome')
            ->orderBy('tempo_medio', 'asc')
            ->get()
            ->map(fn($r) => ['nome' => $r->nome, 'tempo_medio' => (float) $r->tempo_medio, 'total_contratacoes' => (int) $r->total_contratacoes])
            ->toArray();

        // Comparativo por área
        $porArea = DB::table('vagas')
            ->join('candidato_vaga', function ($join) {
                $join->on('vagas.id', '=', 'candidato_vaga.vaga_id')
                     ->where('candidato_vaga.status', '=', 'contratado');
            })
            ->whereNull('vagas.deleted_at')
            ->whereNotNull('vagas.area')->where('vagas.area', '<>', '')
            ->select(
                'vagas.area',
                DB::raw('ROUND(AVG(DATEDIFF(candidato_vaga.updated_at, candidato_vaga.created_at)), 1) as tempo_medio'),
                DB::raw('COUNT(candidato_vaga.id) as total_contratacoes')
            )
            ->groupBy('vagas.area')
            ->orderBy('tempo_medio', 'asc')
            ->get()
            ->map(fn($r) => ['area' => $r->area, 'tempo_medio' => (float) $r->tempo_medio, 'total_contratacoes' => (int) $r->total_contratacoes])
            ->toArray();

        // Tendência mensal
        $tendenciaTempo = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $nomeMes = ucfirst(rtrim($date->translatedFormat('M'), '.'));
            $avg = CandidatoVaga::where('status', 'contratado')
                ->whereMonth('updated_at', $date->month)->whereYear('updated_at', $date->year)
                ->selectRaw('AVG(DATEDIFF(updated_at, created_at)) as avg_days')->value('avg_days');
            $tendenciaTempo[] = ['mes' => $nomeMes, 'dias' => $avg !== null ? round($avg, 1) : 0];
        }

        $etapaMaisLenta = collect($tempoPorEtapa)->sortByDesc('dias')->first();

        return Inertia::render('Relatorios/TimeToHire', [
            'tempo_medio_geral' => $tempoMedioGeral,
            'tempo_por_etapa'   => $tempoPorEtapa,
            'vagas_sla'         => $vagasComSla,
            'sla_resumo'        => ['dentro' => $dentraSla, 'fora' => $foraSla, 'pct_dentro' => $pctDentroSla],
            'por_recrutador'    => $porRecrutador,
            'por_area'          => $porArea,
            'tendencia_tempo'   => $tendenciaTempo,
            'etapa_mais_lenta'  => $etapaMaisLenta,
        ]);
    }

    /**
     * Dashboard 3: Volume de Vagas e Candidatos
     */
    public function volume()
    {
        $vagasAbertas = Vagas::where('ativo', true)->count();
        $candidatosAtivos = CandidatoVaga::whereIn('status', ['marcada', 'selecionado'])->count();
        $ratioMedio = $vagasAbertas > 0 ? round($candidatosAtivos / $vagasAbertas, 1) : 0;

        $vagasPorArea = DB::table('vagas')->whereNull('deleted_at')->where('ativo', true)
            ->whereNotNull('area')->where('area', '<>', '')
            ->select('area', DB::raw('COUNT(*) as total'), DB::raw('SUM(quantidade_vagas) as posicoes'))
            ->groupBy('area')->orderBy('total', 'desc')
            ->get()->map(fn($v) => ['label' => $v->area, 'total' => (int) $v->total, 'posicoes' => (int) $v->posicoes])->toArray();

        $vagasPorCidade = DB::table('vagas')->whereNull('deleted_at')->where('ativo', true)
            ->select('local', DB::raw('COUNT(*) as total'))
            ->groupBy('local')->orderBy('total', 'desc')->limit(10)
            ->get()->map(fn($v) => ['label' => $v->local, 'total' => (int) $v->total])->toArray();

        $vagasAtivas = DB::table('vagas')
            ->leftJoin('candidato_vaga', function ($join) {
                $join->on('vagas.id', '=', 'candidato_vaga.vaga_id')
                     ->whereIn('candidato_vaga.status', ['marcada', 'selecionado']);
            })
            ->leftJoin('users', 'vagas.user_id', '=', 'users.id')
            ->whereNull('vagas.deleted_at')->where('vagas.ativo', true)
            ->select(
                'vagas.id', 'vagas.titulo', 'vagas.local', 'vagas.area', 'vagas.quantidade_vagas',
                'users.nome as recrutador',
                DB::raw('COUNT(candidato_vaga.id) as candidatos_ativos'),
                DB::raw('DATEDIFF(NOW(), vagas.created_at) as dias_aberta')
            )
            ->groupBy('vagas.id', 'vagas.titulo', 'vagas.local', 'vagas.area', 'vagas.quantidade_vagas', 'users.nome', 'vagas.created_at')
            ->orderBy('candidatos_ativos', 'asc')
            ->get()
            ->map(fn($v) => [
                'id' => $v->id, 'titulo' => $v->titulo, 'local' => $v->local,
                'area' => $v->area ?? 'Sem área', 'quantidade_vagas' => (int) $v->quantidade_vagas,
                'recrutador' => $v->recrutador ?? 'Sem recrutador',
                'candidatos_ativos' => (int) $v->candidatos_ativos,
                'dias_aberta' => (int) $v->dias_aberta,
                'critica' => (int) $v->candidatos_ativos < (int) $v->quantidade_vagas,
            ])->toArray();

        $vagasCriticas = collect($vagasAtivas)->where('critica', true)->count();

        $candidatosPorVaga = DB::table('vagas')
            ->leftJoin('candidato_vaga', 'vagas.id', '=', 'candidato_vaga.vaga_id')
            ->whereNull('vagas.deleted_at')->where('vagas.ativo', true)
            ->select('vagas.titulo', DB::raw('COUNT(candidato_vaga.id) as total_candidatos'))
            ->groupBy('vagas.id', 'vagas.titulo')->orderBy('total_candidatos', 'desc')->limit(15)
            ->get()->map(fn($v) => ['titulo' => $v->titulo, 'total' => (int) $v->total_candidatos])->toArray();

        return Inertia::render('Relatorios/Volume', [
            'kpis' => ['vagas_abertas' => $vagasAbertas, 'candidatos_ativos' => $candidatosAtivos, 'ratio_medio' => $ratioMedio, 'vagas_criticas' => $vagasCriticas],
            'vagas_por_area'      => $vagasPorArea,
            'vagas_por_cidade'    => $vagasPorCidade,
            'vagas_ativas'        => $vagasAtivas,
            'candidatos_por_vaga' => $candidatosPorVaga,
        ]);
    }

    /**
     * Dashboard 4: Performance de Recrutadores
     */
    public function performance()
    {
        $mesAtual = now()->month;
        $anoAtual = now()->year;

        $recrutadores = DB::table('users')
            ->leftJoin('entrevistas', 'users.id', '=', 'entrevistas.user_id')
            ->leftJoin('candidato_vaga', 'entrevistas.candidato_vaga_id', '=', 'candidato_vaga.id')
            ->whereIn('users.role', ['recrutador', 'coordenador', 'admin'])
            ->select(
                'users.id', 'users.nome', 'users.role',
                DB::raw('COUNT(DISTINCT entrevistas.id) as total_entrevistas'),
                DB::raw("COUNT(DISTINCT CASE WHEN MONTH(entrevistas.data_hora) = {$mesAtual} AND YEAR(entrevistas.data_hora) = {$anoAtual} THEN entrevistas.id END) as entrevistas_mes"),
                DB::raw("COUNT(DISTINCT CASE WHEN candidato_vaga.status = 'contratado' THEN candidato_vaga.id END) as contratacoes"),
                DB::raw("COUNT(DISTINCT CASE WHEN candidato_vaga.status = 'contratado' AND MONTH(candidato_vaga.updated_at) = {$mesAtual} AND YEAR(candidato_vaga.updated_at) = {$anoAtual} THEN candidato_vaga.id END) as contratacoes_mes"),
                DB::raw("AVG(CASE WHEN candidato_vaga.status = 'contratado' THEN DATEDIFF(candidato_vaga.updated_at, candidato_vaga.created_at) END) as tempo_medio_dias")
            )
            ->groupBy('users.id', 'users.nome', 'users.role')
            ->orderBy('contratacoes', 'desc')
            ->get()->toArray();

        $vagasFechadas = DB::table('vagas')
            ->join('candidato_vaga', function ($join) {
                $join->on('vagas.id', '=', 'candidato_vaga.vaga_id')->where('candidato_vaga.status', '=', 'contratado');
            })
            ->whereNull('vagas.deleted_at')
            ->select('vagas.user_id', DB::raw('COUNT(DISTINCT vagas.id) as vagas_fechadas'))
            ->groupBy('vagas.user_id')->pluck('vagas_fechadas', 'user_id')->toArray();

        $metas = MetaRecrutador::where('mes', $mesAtual)->where('ano', $anoAtual)->pluck('meta_contratacoes', 'user_id')->toArray();
        $metasEntrevistas = MetaRecrutador::where('mes', $mesAtual)->where('ano', $anoAtual)->pluck('meta_entrevistas', 'user_id')->toArray();

        $ranking = collect($recrutadores)->map(function ($r) use ($vagasFechadas, $metas, $metasEntrevistas) {
            $metaC = $metas[$r->id] ?? 0;
            $metaE = $metasEntrevistas[$r->id] ?? 0;
            return [
                'id' => $r->id, 'nome' => $r->nome, 'role' => $r->role,
                'total_entrevistas' => (int) $r->total_entrevistas,
                'entrevistas_mes' => (int) $r->entrevistas_mes,
                'contratacoes' => (int) $r->contratacoes,
                'contratacoes_mes' => (int) $r->contratacoes_mes,
                'vagas_fechadas' => $vagasFechadas[$r->id] ?? 0,
                'tempo_medio_dias' => $r->tempo_medio_dias !== null ? round($r->tempo_medio_dias) : null,
                'taxa_conversao' => (int) $r->total_entrevistas > 0 ? round(((int) $r->contratacoes / (int) $r->total_entrevistas) * 100, 1) : 0,
                'meta_contratacoes' => $metaC,
                'meta_entrevistas' => $metaE,
                'pct_meta_contratacoes' => $metaC > 0 ? round(((int) $r->contratacoes_mes / $metaC) * 100, 1) : null,
                'pct_meta_entrevistas' => $metaE > 0 ? round(((int) $r->entrevistas_mes / $metaE) * 100, 1) : null,
            ];
        })->toArray();

        $totalRecrutadores = count($ranking);
        $totalContratacoesMes = array_sum(array_column($ranking, 'contratacoes_mes'));
        $melhorConversao = $totalRecrutadores > 0 ? max(array_column($ranking, 'taxa_conversao')) : 0;
        $comMeta = collect($ranking)->whereNotNull('pct_meta_contratacoes');
        $mediaMetaAtingida = $comMeta->isNotEmpty() ? round($comMeta->avg('pct_meta_contratacoes'), 1) : null;

        return Inertia::render('Relatorios/Performance', [
            'ranking' => $ranking,
            'resumo'  => [
                'total_recrutadores'     => $totalRecrutadores,
                'total_contratacoes_mes' => $totalContratacoesMes,
                'melhor_conversao'       => $melhorConversao,
                'media_meta_atingida'    => $mediaMetaAtingida,
            ],
        ]);
    }
}
