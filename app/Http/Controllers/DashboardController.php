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

        $totalCandidatos = Candidatos::count();

        $totalContratados = CandidatoVaga::where('status', 'contratado')->count();

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

        $atividadesRecentes = Entrevista::with(['candidatoVaga.candidato', 'candidatoVaga.vaga'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(fn($e) => [
                'candidato' => $e->candidatoVaga?->candidato?->nome,
                'vaga'      => $e->candidatoVaga?->vaga?->titulo,
                'data'      => $e->created_at?->diffForHumans(),
            ]);

        return Inertia::render('Dashboard/Index', [
            'totalEntrevistasMes'      => $totalEntrevistasMes,
            'variacaoEntrevistas'      => $variacaoEntrevistas,
            'totalVagas'               => $totalVagas,
            'totalCandidatos'          => $totalCandidatos,
            'totalContratados'         => $totalContratados,
            'candidatosPorStatus'      => $candidatosPorStatus,
            'aguardandoEntrevista'     => $aguardandoEntrevista,
            'proximasEntrevistas'      => $proximasEntrevistas,
            'vagasDestaque'            => $vagasDestaque,
            'atividadesRecentes'       => $atividadesRecentes,
        ]);
    }
}