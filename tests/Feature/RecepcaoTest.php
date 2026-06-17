<?php

namespace Tests\Feature;

use App\Models\Candidatos;
use App\Models\CandidatoVaga;
use App\Models\Entrevista;
use App\Models\Recepcao;
use App\Models\User;
use App\Models\Vagas;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RecepcaoTest extends TestCase
{
    use RefreshDatabase;

    public function test_usuario_autenticado_pode_acessar_autocomplete_recepcao(): void
    {
        $user = User::factory()->create();

        // Cria registros no histórico de recepção
        Recepcao::create([
            'nome' => 'Jose da Silva',
            'assunto' => 'Reunião',
            'posto_cargo_empresa' => 'Diretor',
            'departamento_responsavel' => 'Marketing',
            'contato' => '11999999999',
            'horario_entrada' => now(),
            'user_id' => $user->id,
        ]);

        $response = $this->actingAs($user)->getJson('/recepcao/autocomplete?q=Jose');

        $response->assertStatus(200);
        $response->assertJsonFragment(['nome' => 'Jose da Silva']);
    }

    public function test_usuario_autenticado_pode_exportar_csv_recepcao(): void
    {
        $user = User::factory()->create();
        $hoje = Carbon::today()->toDateString();

        $response = $this->actingAs($user)->get("/recepcao/exportar?data={$hoje}");

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
        $response->assertHeader('Content-Disposition', 'attachment; filename=recepcao_' . $hoje . '.csv');
    }

    public function test_marcar_chegada_de_entrevista_cria_registro_de_visitante(): void
    {
        $user = User::factory()->create(['role' => 'admin']);
        $candidato = Candidatos::create([
            'nome' => 'Marcos de Souza',
            'cpf' => '98765432100',
            'email' => 'marcos@teste.com',
            'telefone' => '11988887777',
            'nivel_escolaridade' => 'medio',
            'cep' => '01001-000',
            'logradouro' => 'Praça da Sé',
            'regiao' => 'Centro',
        ]);

        $vaga = Vagas::create([
            'titulo' => 'Desenvolvedor PHP',
            'horario' => '09:00 - 18:00',
            'local' => 'Remoto',
            'descricao' => 'Desenvolvedor PHP Laravel',
            'requisitos' => 'Laravel, PHP, React',
            'salario' => '5000.00',
            'va' => '500.00',
            'vr' => '500.00',
            'vt' => '200.00',
            'escala' => '5x2',
            'status_efetivacao' => 'CLT',
            'ativo' => true,
            'pcd' => false,
            'user_id' => $user->id,
        ]);

        $candidatoVaga = CandidatoVaga::create([
            'candidato_id' => $candidato->id,
            'vaga_id' => $vaga->id,
            'status' => 'marcada',
        ]);

        $entrevista = Entrevista::create([
            'candidato_vaga_id' => $candidatoVaga->id,
            'data_hora' => now()->addDay(),
            'tipo' => 'Presencial',
            'user_id' => $user->id,
        ]);

        $this->assertDatabaseMissing('recepcao', [
            'nome' => 'Marcos de Souza',
        ]);

        $response = $this->actingAs($user)->post("/recepcao/entrevistas/{$entrevista->id}/chegada");

        $response->assertRedirect('/recepcao');
        $response->assertSessionHas('success', 'Chegada do candidato registrada.');

        $this->assertDatabaseHas('recepcao', [
            'nome' => 'Marcos de Souza',
            'assunto' => 'Entrevista - Desenvolvedor PHP',
            'departamento_responsavel' => 'RH',
            'contato' => '11988887777',
            'indicacao' => 'Entrevista agendada',
        ]);
    }
}
