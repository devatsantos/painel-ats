<?php

namespace App\Http\Controllers;
use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Models\Formulario;
use App\Models\Pergunta;
use App\Models\Alternativa;

class FormulariosController extends Controller
{
    public function index()
    {
        $formularios = Formulario::withCount('perguntas')->get();
        return Inertia::render('Formularios/Index', [
            'formulariosCadastrados' => $formularios
        ]);
    }

    /**
     * Regras de validação compartilhadas entre store e update.
     */
    private function rules(): array
    {
        return [
            'titulo_formulario' => 'required|string|max:255',
            'descricao' => 'required|string|max:2000',
            'requisitos' => 'required|string|max:2000',
            'posto' => 'required|string|max:255',
            'threshold' => 'required|integer|min:1',
            'perguntas' => 'required|array',
            'perguntas.*.enunciado' => 'required|string|max:2000',
            'perguntas.*.alternativas' => 'required|array',
            'perguntas.*.alternativas.*.texto' => 'required|string|max:2000',
            'perguntas.*.alternativas.*.correta' => 'required|boolean',
        ];
    }

    /**
     * Cria as perguntas e alternativas vinculadas ao formulário.
     */
    private function sincronizarPerguntas(Formulario $formulario, array $perguntas): void
    {
        foreach ($perguntas as $perguntaData) {
            $pergunta = Pergunta::create([
                'enunciado' => $perguntaData['enunciado'],
                'formulario_id' => $formulario->id,
            ]);

            foreach ($perguntaData['alternativas'] as $alternativaData) {
                Alternativa::create([
                    'texto' => $alternativaData['texto'],
                    'correta' => $alternativaData['correta'],
                    'pergunta_id' => $pergunta->id,
                ]);
            }
        }
    }

    public function store(Request $request)
    {
        $validated = $request->validate($this->rules());

        $formulario = Formulario::create([
            'titulo_formulario' => $validated['titulo_formulario'],
            'descricao' => $validated['descricao'],
            'requisitos' => $validated['requisitos'],
            'posto' => $validated['posto'],
            'threshold' => $validated['threshold'],
        ]);

        $this->sincronizarPerguntas($formulario, $validated['perguntas']);

        return redirect()->route('Formularios');
    }
    public function edit(Formulario $formulario)
    {
        $formulario->load('perguntas.alternativas');
        return Inertia::render('Formularios/Edit', [
            'formulario' => $formulario
        ]);
    }

    public function update(Request $request, Formulario $formulario)
    {
        $validated = $request->validate($this->rules());

        $formulario->update([
            'titulo_formulario' => $validated['titulo_formulario'],
            'descricao' => $validated['descricao'],
            'requisitos' => $validated['requisitos'],
            'posto' => $validated['posto'],
            'threshold' => $validated['threshold'],
        ]);

        // Deleta perguntas existentes (alternativas são removidas em cascata pelo banco — onDelete('cascade'))
        $formulario->perguntas()->delete();

        $this->sincronizarPerguntas($formulario, $validated['perguntas']);

        return redirect()->route('Formularios');
    }

    public function delete(Formulario $formulario)
    {
        $formulario->delete();
        return redirect()->route('Formularios');
    }
}
