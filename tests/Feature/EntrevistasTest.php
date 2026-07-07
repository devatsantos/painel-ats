<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Inertia\Testing\AssertableInertia as Assert;
use App\Models\User;
use App\Models\Candidatos;
use App\Models\Vagas;
use App\Models\CandidatoVaga;
use App\Models\Entrevista;

class EntrevistasTest extends TestCase
{
    use RefreshDatabase;

    private function criarAdmin(): User
    {
        return User::factory()->create(['role' => 'admin']);
    }

    private function criarRecrutador(): User
    {
        return User::factory()->create(['role' => 'recrutador']);
    }

    private function criarEntrevistaCompleta(?User $entrevistador = null, string $status = 'marcada'): array
    {
        $user = $entrevistador ?? User::factory()->create();

        $candidato = Candidatos::create([
            'nome'               => 'Candidato Entrevista',
            'cpf'                => fake()->unique()->numerify('###.###.###-##'),
            'email'              => fake()->unique()->safeEmail(),
            'telefone'           => '13999999999',
            'nivel_escolaridade' => 'graduacao',
            'cep'                => '01001-000',
            'logradouro'         => 'Praça da Sé',
            'regiao'             => 'Centro',
        ]);

        $vaga = Vagas::create([
            'titulo'            => 'Vaga Teste',
            'horario'           => '08:00 - 17:00',
            'local'             => 'Santos',
            'descricao'         => 'Descrição',
            'requisitos'        => 'Nenhum',
            'salario'           => '2000.00',
            'escala'            => '5x2',
            'status_efetivacao' => 'CLT',
            'ativo'             => true,
        ]);

        $cv = CandidatoVaga::create([
            'candidato_id' => $candidato->id,
            'vaga_id'      => $vaga->id,
            'status'       => $status,
        ]);

        $entrevista = Entrevista::create([
            'candidato_vaga_id' => $cv->id,
            'data_hora'         => now()->addDay(),
            'tipo'              => 'presencial',
            'user_id'           => $entrevistador?->id,
        ]);

        return [$candidato, $vaga, $cv, $entrevista, $user];
    }

    // ── Acesso e Listagem ──

    public function test_usuario_autenticado_acessa_entrevistas(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/entrevistas');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Entrevistas/Index', false)
            ->has('candidatos')
            ->has('vagas')
            ->has('filters')
        );
    }

    public function test_visitante_nao_autenticado_nao_acessa_entrevistas(): void
    {
        $response = $this->get('/entrevistas');
        $response->assertRedirect('/login');
    }

    // ── Filtros ──

    public function test_filtro_por_aba_hoje_funciona(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/entrevistas?tab=hoje');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->where('filters.tab', 'hoje')
        );
    }

    public function test_filtro_por_aba_proximas_funciona(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/entrevistas?tab=proximas');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->where('filters.tab', 'proximas')
        );
    }

    public function test_filtro_por_aba_concluidas_funciona(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/entrevistas?tab=concluidas');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->where('filters.tab', 'concluidas')
        );
    }

    public function test_filtro_por_busca_textual_funciona(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/entrevistas?search=João');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->where('filters.search', 'João')
        );
    }

    // ── Pegar Entrevista (PUT) ──

    public function test_recrutador_pode_pegar_entrevista_sem_entrevistador(): void
    {
        $recrutador = $this->criarRecrutador();
        [$candidato, $vaga, $cv, $entrevista] = $this->criarEntrevistaCompleta(null);

        $response = $this->actingAs($recrutador)->put("/entrevistas/{$entrevista->id}/pegar");

        $response->assertRedirect('/entrevistas');
        $response->assertSessionHas('success', 'Entrevista atribuída a você com sucesso.');
        $this->assertDatabaseHas('entrevistas', [
            'id'      => $entrevista->id,
            'user_id' => $recrutador->id,
        ]);
    }

    public function test_nao_pode_pegar_entrevista_ja_atribuida(): void
    {
        $recrutador1 = $this->criarRecrutador();
        $recrutador2 = $this->criarRecrutador();
        [$candidato, $vaga, $cv, $entrevista] = $this->criarEntrevistaCompleta($recrutador1);

        $response = $this->actingAs($recrutador2)->put("/entrevistas/{$entrevista->id}/pegar");

        $response->assertRedirect('/entrevistas');
        $response->assertSessionHas('error', 'Esta entrevista já foi atribuída a outro entrevistador.');
        $this->assertDatabaseHas('entrevistas', [
            'id'      => $entrevista->id,
            'user_id' => $recrutador1->id,
        ]);
    }

    // ── Desatribuir Entrevista (PUT) ──

    public function test_recrutador_pode_desatribuir_propria_entrevista(): void
    {
        $recrutador = $this->criarRecrutador();
        [$candidato, $vaga, $cv, $entrevista] = $this->criarEntrevistaCompleta($recrutador);

        $response = $this->actingAs($recrutador)->put("/entrevistas/{$entrevista->id}/desatribuir");

        $response->assertRedirect('/entrevistas');
        $response->assertSessionHas('success');
        $this->assertDatabaseHas('entrevistas', [
            'id'      => $entrevista->id,
            'user_id' => null,
        ]);
    }

    public function test_recrutador_nao_pode_desatribuir_entrevista_de_outro(): void
    {
        $recrutador1 = $this->criarRecrutador();
        $recrutador2 = $this->criarRecrutador();
        [$candidato, $vaga, $cv, $entrevista] = $this->criarEntrevistaCompleta($recrutador1);

        $response = $this->actingAs($recrutador2)->put("/entrevistas/{$entrevista->id}/desatribuir");

        $response->assertRedirect('/entrevistas');
        $response->assertSessionHas('error');
        $this->assertDatabaseHas('entrevistas', [
            'id'      => $entrevista->id,
            'user_id' => $recrutador1->id,
        ]);
    }

    public function test_admin_pode_desatribuir_entrevista_de_qualquer_um(): void
    {
        $admin = $this->criarAdmin();
        $recrutador = $this->criarRecrutador();
        [$candidato, $vaga, $cv, $entrevista] = $this->criarEntrevistaCompleta($recrutador);

        $response = $this->actingAs($admin)->put("/entrevistas/{$entrevista->id}/desatribuir");

        $response->assertRedirect('/entrevistas');
        $response->assertSessionHas('success');
        $this->assertDatabaseHas('entrevistas', [
            'id'      => $entrevista->id,
            'user_id' => null,
        ]);
    }

    // ── Atualizar Status / Resultado (PUT) ──

    public function test_pode_marcar_candidato_como_contratado(): void
    {
        $user = User::factory()->create();
        [$candidato, $vaga, $cv, $entrevista] = $this->criarEntrevistaCompleta($user);

        $response = $this->actingAs($user)->put("/entrevistas/{$entrevista->id}/status", [
            'status'     => 'contratado',
            'observacao' => 'Excelente desempenho',
        ]);

        $response->assertRedirect('/entrevistas');
        $response->assertSessionHas('success', 'Resultado registrado com sucesso.');
        $this->assertDatabaseHas('candidato_vaga', [
            'id'     => $cv->id,
            'status' => 'contratado',
        ]);
        $this->assertDatabaseHas('entrevistas', [
            'id'         => $entrevista->id,
            'observacao' => 'Excelente desempenho',
        ]);
    }

    public function test_pode_marcar_candidato_como_reprovado(): void
    {
        $user = User::factory()->create();
        [$candidato, $vaga, $cv, $entrevista] = $this->criarEntrevistaCompleta($user);

        $response = $this->actingAs($user)->put("/entrevistas/{$entrevista->id}/status", [
            'status' => 'reprovado',
        ]);

        $response->assertRedirect('/entrevistas');
        $this->assertDatabaseHas('candidato_vaga', [
            'id'     => $cv->id,
            'status' => 'reprovado',
        ]);
    }

    public function test_pode_marcar_candidato_como_nao_compareceu(): void
    {
        $user = User::factory()->create();
        [$candidato, $vaga, $cv, $entrevista] = $this->criarEntrevistaCompleta($user);

        $response = $this->actingAs($user)->put("/entrevistas/{$entrevista->id}/status", [
            'status' => 'nao_compareceu',
        ]);

        $response->assertRedirect('/entrevistas');
        $this->assertDatabaseHas('candidato_vaga', [
            'id'     => $cv->id,
            'status' => 'nao_compareceu',
        ]);
    }

    public function test_status_invalido_eh_rejeitado(): void
    {
        $user = User::factory()->create();
        [$candidato, $vaga, $cv, $entrevista] = $this->criarEntrevistaCompleta($user);

        $response = $this->actingAs($user)->putJson("/entrevistas/{$entrevista->id}/status", [
            'status' => 'status_inexistente',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['status']);
    }

    // ── Historico de Status ──

    public function test_mudanca_de_status_cria_historico(): void
    {
        $user = User::factory()->create();
        [$candidato, $vaga, $cv, $entrevista] = $this->criarEntrevistaCompleta($user);

        $this->actingAs($user)->put("/entrevistas/{$entrevista->id}/status", [
            'status' => 'contratado',
        ]);

        $this->assertDatabaseHas('candidato_vaga_historico', [
            'candidato_vaga_id' => $cv->id,
            'status_anterior'   => 'marcada',
            'status_novo'       => 'contratado',
        ]);
    }

    // ── Adiar (PUT) ──

    public function test_pode_adiar_entrevista(): void
    {
        $user = User::factory()->create();
        [$candidato, $vaga, $cv, $entrevista] = $this->criarEntrevistaCompleta($user);

        $response = $this->actingAs($user)->put("/entrevistas/{$entrevista->id}/adiar", [
            'justificativa' => 'Candidato pediu reagendamento',
        ]);

        $response->assertRedirect('/entrevistas');
        $response->assertSessionHas('success');

        // Entrevista antiga foi removida
        $this->assertDatabaseMissing('entrevistas', ['id' => $entrevista->id]);

        // Status volta para 'selecionado'
        $this->assertDatabaseHas('candidato_vaga', [
            'id'     => $cv->id,
            'status' => 'selecionado',
        ]);
    }
}
