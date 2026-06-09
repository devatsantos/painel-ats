<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use App\Models\Entrevista;
use App\Models\Vagas;
use App\Models\Candidatos;
use App\Models\CandidatoVaga;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index() {
        $totalEntrevistasMes = Entrevista::whereMonth('data_hora', now()->month)
            ->whereYear('data_hora', now()->year)
            ->count();

        $totalEntrevistasMesAnterior = Entrevista::whereMonth('data_hora', now()->subMonth()->month)
            ->whereYear('data_hora', now()->subMonth()->year)
            ->count();

        if ($totalEntrevistasMesAnterior > 0) {
            $variacaoEntrevistas = round((($totalEntrevistasMes - $totalEntrevistasMesAnterior) / $totalEntrevistasMesAnterior) * 100);
        } else {
            $variacaoEntrevistas = null;
        }

        $totalVagas = Vagas::where('ativo', true)->count();

        $candidatosPorStatus = CandidatoVaga::select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->get()
            ->pluck('total', 'status');

        $aguardandoEntrevista = CandidatoVaga::where('status', 'selecionado')
            ->with(['candidato', 'vaga', 'entrevista.user'])
            ->orderBy('updated_at', 'asc')
            ->get()
            ->map(fn($cv) => [
                'candidato'         => $cv->candidato?->nome,
                'telefone'          => $cv->candidato?->telefone,
                'email'             => $cv->candidato?->email,
                'vaga'              => $cv->vaga?->titulo,
                'data_hora'         => $cv->entrevista?->data_hora
                    ? Carbon::parse($cv->entrevista->data_hora)->format('d/m/Y \à\s H:i')
                    : null,
                'entrevistador_nome' => $cv->entrevista?->user?->nome,
                'esperando'         => $cv->updated_at?->diffForHumans(),
            ]);

        $proximasEntrevistas = Entrevista::with(['candidatoVaga.candidato', 'candidatoVaga.vaga', 'user'])
            ->where('data_hora', '>=', now())
            ->orderBy('data_hora', 'asc')
            ->limit(3)
            ->get()
            ->map(fn($e) => [
                'candidato'     => $e->candidatoVaga?->candidato?->nome,
                'vaga'          => $e->candidatoVaga?->vaga?->titulo,
                'data_hora'     => $e->data_hora ? Carbon::parse($e->data_hora)->format('d/m/Y H:i') : null,
                'data_relativa' => $e->data_hora ? Carbon::parse($e->data_hora)->diffForHumans() : null,
                'tipo'          => $e->tipo,
                'entrevistador' => $e->user?->nome,
            ]);

        $vagasDestaque = DB::table('vagas')
            ->leftJoin('candidato_vaga', 'vagas.id', '=', 'candidato_vaga.vaga_id')
            ->where('vagas.ativo', true)
            ->whereNull('vagas.deleted_at')
            ->select(
                'vagas.id',
                'vagas.titulo',
                DB::raw('COUNT(candidato_vaga.id) as total'),
                DB::raw("SUM(CASE WHEN candidato_vaga.status IN ('marcada','selecionado') THEN 1 ELSE 0 END) as em_processo"),
                DB::raw("SUM(CASE WHEN candidato_vaga.status = 'contratado' THEN 1 ELSE 0 END) as contratados")
            )
            ->groupBy('vagas.id', 'vagas.titulo')
            ->orderBy('total', 'desc')
            ->limit(5)
            ->get()
            ->map(fn($v) => [
                'titulo'      => $v->titulo,
                'total'       => (int) $v->total,
                'em_processo' => (int) $v->em_processo,
                'contratados' => (int) $v->contratados,
            ]);

        $statusLabels = [
            'selecionado'    => 'Selecionado',
            'contratado'     => 'Contratado',
            'reprovado'      => 'Reprovado',
            'recusou_vaga'   => 'Recusou a Vaga',
            'sem_vaga'       => 'Sem Vaga',
            'nao_compareceu' => 'Não Compareceu',
            'desclassificado'=> 'Desclassificado',
        ];

        $vagasRecentes = Vagas::latest()->limit(5)->get()->map(fn($v) => [
            'tipo'      => 'vaga_criada',
            'descricao' => "A vaga de \"{$v->titulo}\" foi aberta pela equipe de RH.",
            'data_raw'  => $v->created_at,
        ]);

        $candidaturasRecentes = CandidatoVaga::with(['candidato', 'vaga'])
            ->latest()
            ->limit(5)
            ->get()
            ->filter(fn($cv) => $cv->candidato && $cv->vaga)
            ->map(fn($cv) => [
                'tipo'      => 'candidatura',
                'descricao' => "O candidato {$cv->candidato->nome} se candidatou para a vaga \"{$cv->vaga->titulo}\".",
                'data_raw'  => $cv->created_at,
            ]);

        $triagensAprovadas = CandidatoVaga::with(['candidato', 'vaga'])
            ->where('status', 'selecionado')
            ->orderBy('updated_at', 'desc')
            ->limit(5)
            ->get()
            ->filter(fn($cv) => $cv->candidato && $cv->vaga)
            ->map(fn($cv) => [
                'tipo'      => 'triagem_aprovado',
                'descricao' => "O candidato {$cv->candidato->nome} foi aprovado na triagem para a vaga \"{$cv->vaga->titulo}\" e aguarda agendamento.",
                'data_raw'  => $cv->updated_at,
            ]);

        $resultadosRecentes = CandidatoVaga::with(['candidato', 'vaga'])
            ->whereIn('status', ['contratado', 'reprovado', 'recusou_vaga', 'sem_vaga', 'nao_compareceu', 'desclassificado'])
            ->orderBy('updated_at', 'desc')
            ->limit(5)
            ->get()
            ->filter(fn($cv) => $cv->candidato && $cv->vaga)
            ->map(fn($cv) => [
                'tipo'      => 'resultado',
                'descricao' => "O status do candidato {$cv->candidato->nome} para a vaga \"{$cv->vaga->titulo}\" foi alterado para " . ($statusLabels[$cv->status] ?? $cv->status) . ".",
                'data_raw'  => $cv->updated_at,
            ]);

        $talentosRecentes = Candidatos::where('banco_de_talentos', true)
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn($c) => [
                'tipo'      => 'novo_talento',
                'descricao' => "O perfil de {$c->nome} foi registrado no Banco de Talentos.",
                'data_raw'  => $c->created_at,
            ]);

        $entrevistasAgendadas = Entrevista::with(['candidatoVaga.candidato', 'candidatoVaga.vaga'])
            ->latest()
            ->limit(5)
            ->get()
            ->filter(fn($e) => $e->candidatoVaga?->candidato && $e->candidatoVaga?->vaga)
            ->map(fn($e) => [
                'tipo'      => 'entrevista_agendada',
                'descricao' => "Uma entrevista ({$e->tipo}) foi agendada para o candidato {$e->candidatoVaga->candidato->nome} na vaga de \"{$e->candidatoVaga->vaga->titulo}\".",
                'data_raw'  => $e->created_at,
            ]);

        $entrevistasAssumidas = Entrevista::with(['candidatoVaga.candidato', 'candidatoVaga.vaga', 'user'])
            ->whereNotNull('user_id')
            ->orderBy('updated_at', 'desc')
            ->limit(5)
            ->get()
            ->filter(fn($e) => $e->candidatoVaga?->candidato && $e->candidatoVaga?->vaga && $e->user)
            ->map(fn($e) => [
                'tipo'      => 'entrevista_assumida',
                'descricao' => "O recrutador {$e->user->nome} assumiu a entrevista do candidato {$e->candidatoVaga->candidato->nome} para a vaga \"{$e->candidatoVaga->vaga->titulo}\".",
                'data_raw'  => $e->updated_at,
            ]);

        $bloqueiosRecentes = \App\Models\BloqueioAgenda::latest()
            ->limit(5)
            ->get()
            ->map(fn($b) => [
                'tipo'      => 'agenda_bloqueada',
                'descricao' => $b->dia_todo 
                    ? "A agenda para o dia " . Carbon::parse($b->data)->format('d/m/Y') . " foi bloqueada: \"{$b->motivo}\"."
                    : "O horário das " . Carbon::parse($b->hora_inicio)->format('H:i') . " às " . Carbon::parse($b->hora_fim)->format('H:i') . " no dia " . Carbon::parse($b->data)->format('d/m/Y') . " foi bloqueado: \"{$b->motivo}\".",
                'data_raw'  => $b->created_at,
            ]);

        $atividadesRecentes = collect()
            ->concat($vagasRecentes)
            ->concat($candidaturasRecentes)
            ->concat($triagensAprovadas)
            ->concat($resultadosRecentes)
            ->concat($talentosRecentes)
            ->concat($entrevistasAgendadas)
            ->concat($entrevistasAssumidas)
            ->concat($bloqueiosRecentes)
            ->sortByDesc('data_raw')
            ->take(10)
            ->map(fn($act) => [
                'tipo'      => $act['tipo'],
                'descricao' => $act['descricao'],
                'data'      => Carbon::parse($act['data_raw'])->diffForHumans(),
            ])
            ->values();

        return Inertia::render('Dashboard/Index', [
            'totalEntrevistasMes'      => $totalEntrevistasMes,
            'variacaoEntrevistas'      => $variacaoEntrevistas,
            'totalVagas'               => $totalVagas,
            'candidatosPorStatus'      => $candidatosPorStatus,
            'aguardandoEntrevista'     => $aguardandoEntrevista,
            'proximasEntrevistas'      => $proximasEntrevistas,
            'vagasDestaque'            => $vagasDestaque,
            'atividadesRecentes'       => $atividadesRecentes,
        ]);
    }
}