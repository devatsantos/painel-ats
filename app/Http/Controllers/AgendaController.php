<?php

namespace App\Http\Controllers;

use App\Models\BloqueioAgenda;
use App\Services\AgendaService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AgendaController extends Controller
{
    public function index()
    {
        $bloqueios = BloqueioAgenda::orderBy('data')
            ->orderBy('hora_inicio')
            ->get();

        $configuracao = \App\Models\ConfiguracaoAgenda::first();
        if (!$configuracao) {
            $configuracao = new \App\Models\ConfiguracaoAgenda([
                'hora_inicio'       => '08:00',
                'hora_fim'          => '10:00',
                'intervalo_minutos' => 15,
            ]);
        }

        return Inertia::render('Agenda/Index', [
            'bloqueios'    => $bloqueios,
            'configuracao' => $configuracao,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'data'        => 'required|date_format:Y-m-d|after_or_equal:today',
            'dia_todo'    => 'boolean',
            'hora_inicio' => 'nullable|date_format:H:i|required_if:dia_todo,false',
            'hora_fim'    => 'nullable|date_format:H:i|after:hora_inicio|required_if:dia_todo,false',
            'motivo'      => 'required|string|max:255',
        ]);

        if (!empty($data['dia_todo'])) {
            $data['hora_inicio'] = null;
            $data['hora_fim']    = null;
        }

        BloqueioAgenda::create($data);

        return redirect()->route('Agenda')->with('success', 'Bloqueio cadastrado com sucesso.');
    }

    public function update(Request $request, BloqueioAgenda $bloqueio)
    {
        $data = $request->validate([
            'data'        => 'required|date_format:Y-m-d',
            'dia_todo'    => 'boolean',
            'hora_inicio' => 'nullable|date_format:H:i|required_if:dia_todo,false',
            'hora_fim'    => 'nullable|date_format:H:i|after:hora_inicio|required_if:dia_todo,false',
            'motivo'      => 'required|string|max:255',
        ]);

        if (!empty($data['dia_todo'])) {
            $data['hora_inicio'] = null;
            $data['hora_fim']    = null;
        }

        abort_if($bloqueio->origem === 'feriado', 403);

        $bloqueio->update($data);

        return redirect()->route('Agenda')->with('success', 'Bloqueio atualizado.');
    }

    public function delete(BloqueioAgenda $bloqueio)
    {
        abort_if($bloqueio->origem === 'feriado', 403);

        $bloqueio->delete();

        return redirect()->route('Agenda')->with('success', 'Bloqueio removido.');
    }

    public function atualizarConfiguracao(Request $request)
    {
        abort_if(auth()->user()->role !== 'admin', 403, 'Apenas administradores podem alterar as configurações da agenda.');

        $data = $request->validate([
            'hora_inicio'       => 'required|date_format:H:i',
            'hora_fim'          => 'required|date_format:H:i|after:hora_inicio',
            'intervalo_minutos' => 'required|integer|min:5|max:120',
        ]);

        $config = \App\Models\ConfiguracaoAgenda::first();
        if ($config) {
            $config->update($data);
        } else {
            \App\Models\ConfiguracaoAgenda::create($data);
        }

        return redirect()->route('Agenda')->with('success', 'Configuração da agenda atualizada com sucesso.');
    }
}
