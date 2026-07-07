<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Carbon\Carbon;
use App\Models\Candidatos;
use App\Models\Vagas;
use App\Models\CandidatoVaga;
use App\Models\Entrevista;
use App\Services\AgendaService;

class TalentosController extends Controller
{
    public function index(Request $request) {
        $banco = $request->input('banco', 'true');

        $query = Candidatos::with(['vagas']);

        if ($banco === 'true') {
            $query->where('banco_de_talentos', true);
        }

        if ($request->filled('busca')) {
            $busca = $request->input('busca');
            $query->where(function($q) use ($busca) {
                $q->where('nome', 'like', "%{$busca}%")
                  ->orWhere('nivel_escolaridade', 'like', "%{$busca}%")
                  ->orWhere('telefone', 'like', "%{$busca}%")
                  ->orWhere('email', 'like', "%{$busca}%")
                  ->orWhere('cpf', 'like', "%{$busca}%");
            });
        }

        if ($request->filled('regiao')) {
            $query->where('regiao', $request->input('regiao'));
        }

        if ($request->filled('escolaridade')) {
            $query->where('nivel_escolaridade', $request->input('escolaridade'));
        }

        if ($request->filled('vaga_id')) {
            $query->whereHas('vagas', function ($q) use ($request) {
                $q->where('vagas.id', $request->input('vaga_id'));
            });
        }

        if ($request->filled('status')) {
            $status = $request->input('status');
            $query->whereHas('vagas', function ($q) use ($status) {
                $q->where('candidato_vaga.status', $status);
            });
        }

        $talentos = $query->orderBy('created_at', 'desc')
            ->paginate(20)
            ->withQueryString();

        $regioes = Candidatos::whereNotNull('regiao')
            ->where('regiao', '!=', '')
            ->distinct()
            ->orderBy('regiao')
            ->pluck('regiao');

        $vagas = Vagas::orderBy('titulo')->get(['id', 'titulo']);

        $totalCandidatos = Candidatos::count();
        $totalBancoTalentos = Candidatos::where('banco_de_talentos', true)->count();
        $totalComEntrevista = Candidatos::whereHas('vagas')->count();
        
        return Inertia::render('Candidatos/Index', [
            'talentos'         => $talentos,
            'vagas'            => $vagas,
            'totalCandidatos'  => $totalCandidatos,
            'totalBancoTalentos' => $totalBancoTalentos,
            'totalComEntrevista' => $totalComEntrevista,
            'regioes'          => $regioes,
            'filtros'          => $request->only(['busca', 'regiao', 'escolaridade', 'vaga_id', 'status', 'banco']),
        ]);
    }

    public function store(Request $request) {
        $validated = $request->validate([
            'nome'               => 'required|string|max:255',
            'cpf'                => 'required|string|max:20|unique:candidatos,cpf',
            'email'              => 'required|email|max:255',
            'telefone'           => 'required|string|max:20',
            'nivel_escolaridade' => 'required|string|max:255',
            'cep'                => 'required|string|max:20',
            'logradouro'         => 'required|string|max:255',
            'regiao'             => 'required|string|max:255',
            'data_nascimento'    => 'nullable|date',
            'curriculo'          => 'nullable|file|mimes:pdf,doc,docx|mimetypes:application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document|max:10240',
        ]);
        $path = null;
        if ($request->hasFile('curriculo')) {
            $path = $request->file('curriculo')->store('curriculos', 'public');
        }

        Candidatos::create([
            'nome'               => $validated['nome'],
            'cpf'                => $validated['cpf'],
            'email'              => $validated['email'],
            'telefone'           => $validated['telefone'],
            'nivel_escolaridade' => $validated['nivel_escolaridade'],
            'cep'                => $validated['cep'],
            'logradouro'         => $validated['logradouro'],
            'regiao'             => $validated['regiao'],
            'data_nascimento'    => $validated['data_nascimento'] ?? null,
            'path_curriculo'     => $path,
            'banco_de_talentos'  => true,
        ]);

        return redirect()->route('Candidatos');
    }

    public function update(Request $request, Candidatos $candidato) {
        $validated = $request->validate([
            'nome'               => 'required|string|max:255',
            'cpf'                => 'required|string|max:20|unique:candidatos,cpf,' . $candidato->id,
            'email'              => 'required|email|max:255',
            'telefone'           => 'required|string|max:20',
            'nivel_escolaridade' => 'required|string|max:255',
            'cep'                => 'required|string|max:20',
            'logradouro'         => 'required|string|max:255',
            'regiao'             => 'required|string|max:255',
            'data_nascimento'    => 'nullable|date',
            'curriculo'          => 'nullable|file|mimes:pdf,doc,docx|mimetypes:application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document|max:10240',
        ]);

        if ($request->hasFile('curriculo')) {
            if ($candidato->path_curriculo) {
                Storage::disk('private')->delete($candidato->path_curriculo);
            }
            $validated['path_curriculo'] = $request->file('curriculo')->store('curriculos', 'private');
        }

        unset($validated['curriculo']);
        $candidato->update($validated);

        return redirect()->route('Candidatos')->with('success', 'Candidato atualizado com sucesso.');
    }

    public function delete(Candidatos $candidato) {
        if ($candidato->vagas()->exists()) {
            $candidato->update(['banco_de_talentos' => false]);
            $msg = 'Candidato removido do banco de talentos (mantido no histórico por possuir vagas vinculadas).';
        } else {
            if ($candidato->path_curriculo) {
                Storage::disk('private')->delete($candidato->path_curriculo);
            }
            $candidato->delete();
            $msg = 'Candidato excluído permanentemente.';
        }
        return redirect()->route('Candidatos')->with('success', $msg);
    }

    public function adicionarAoBanco(Candidatos $candidato) {
        $candidato->update(['banco_de_talentos' => !$candidato->banco_de_talentos]);
        $msg = $candidato->banco_de_talentos ? 'Candidato adicionado ao banco de talentos.' : 'Candidato removido do banco de talentos.';
        return back()->with('success', $msg);
    }

    public function exportar(Request $request)
    {
        $banco = $request->input('banco', 'true');
        $query = Candidatos::query();

        if ($banco === 'true') {
            $query->where('banco_de_talentos', true);
        }

        if ($request->filled('busca')) {
            $busca = $request->input('busca');
            $query->where(function($q) use ($busca) {
                $q->where('nome', 'like', "%{$busca}%")
                  ->orWhere('nivel_escolaridade', 'like', "%{$busca}%")
                  ->orWhere('telefone', 'like', "%{$busca}%")
                  ->orWhere('email', 'like', "%{$busca}%")
                  ->orWhere('cpf', 'like', "%{$busca}%");
            });
        }

        if ($request->filled('regiao')) {
            $query->where('regiao', $request->input('regiao'));
        }

        if ($request->filled('escolaridade')) {
            $query->where('nivel_escolaridade', $request->input('escolaridade'));
        }

        if ($request->filled('vaga_id')) {
            $query->whereHas('vagas', function ($q) use ($request) {
                $q->where('vagas.id', $request->input('vaga_id'));
            });
        }

        if ($request->filled('status')) {
            $status = $request->input('status');
            $query->whereHas('vagas', function ($q) use ($status) {
                $q->where('candidato_vaga.status', $status);
            });
        }

        $talentos = $query->orderBy('nome')->get();

        $filename = 'banco_talentos_' . now()->format('Y-m-d_H-i') . '.csv';

        return response()->streamDownload(function () use ($talentos) {
            $handle = fopen('php://output', 'w');
            // BOM for Excel UTF-8 compatibility
            fprintf($handle, chr(0xEF).chr(0xBB).chr(0xBF));

            fputcsv($handle, ['Nome', 'CPF', 'E-mail', 'Telefone', 'Escolaridade', 'CEP', 'Logradouro', 'Região', 'Data Nascimento', 'Cadastrado em'], ';');

            foreach ($talentos as $t) {
                fputcsv($handle, [
                    $t->nome,
                    $t->cpf,
                    $t->email,
                    $t->telefone,
                    $t->nivel_escolaridade,
                    $t->cep,
                    $t->logradouro,
                    $t->regiao,
                    $t->data_nascimento?->format('d/m/Y') ?? '',
                    $t->created_at?->format('d/m/Y H:i') ?? '',
                ], ';');
            }

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    public function slotsDisponiveis(Request $request)
    {
        $request->validate(['data' => 'required|date_format:Y-m-d|after_or_equal:today']);
        $agenda = new AgendaService();
        return response()->json(['slots' => $agenda->slotsDisponiveis($request->data)]);
    }

    public function agendarEntrevista(Request $request, Candidatos $candidato)
    {
        $validated = $request->validate([
            'vaga_id'   => 'required|exists:vagas,id',
            'data_hora' => 'required|date|after:now',
            'tipo'      => 'required|in:Presencial,Online',
        ]);

        $dataHora = Carbon::parse($validated['data_hora']);
        $agenda   = new AgendaService();

        if (!$agenda->validarSlot($dataHora)) {
            $settings = $agenda->getSettings();
            $horaInicio = Carbon::parse($settings->hora_inicio)->format('H\h');
            $horaFim = Carbon::parse($settings->hora_fim)->format('H\h');
            $intervalo = $settings->intervalo_minutos;
            return back()->withErrors([
                'data_hora' => "Horário indisponível. Escolha um slot válido de segunda a sexta, das {$horaInicio} às {$horaFim} (intervalo de {$intervalo} min)."
            ]);
        }

        $candidatoVaga = CandidatoVaga::firstOrCreate(
            ['candidato_id' => $candidato->id, 'vaga_id' => $validated['vaga_id']],
            ['status' => 'selecionado']
        );

        if ($candidatoVaga->entrevista) {
            return back()->withErrors(['vaga_id' => 'Este candidato já possui uma entrevista para esta vaga.']);
        }

        $linkMeet = null;

        $candidatoVaga->update(['status' => 'marcada']);

        $vaga = Vagas::find($validated['vaga_id']);

        Entrevista::create([
            'candidato_vaga_id' => $candidatoVaga->id,
            'data_hora'         => $dataHora,
            'tipo'              => $validated['tipo'],
            'user_id'           => $vaga->user_id,
        ]);

        return redirect()->route('Candidatos')->with('success', 'Entrevista agendada com sucesso.');
    }
}