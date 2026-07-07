<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Inertia\Testing\AssertableInertia as Assert;
use App\Models\User;
use App\Models\Vagas;
use App\Models\Formulario;

class VagasTest extends TestCase
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

    private function dadosVaga(array $overrides = []): array
    {
        return array_merge([
            'titulo'            => 'Desenvolvedor PHP',
            'horario'           => '08:00 - 17:00',
            'local'             => 'Santos',
            'area'              => 'TI',
            'descricao'         => 'Vaga para desenvolvedor PHP Laravel',
            'requisitos'        => 'PHP, Laravel, React',
            'salario'           => '5000.00',
            'va'                => '500.00',
            'vr'                => '500.00',
            'vt'                => '200.00',
            'escala'            => '5x2',
            'status_efetivacao' => 'CLT',
            'ativo'             => true,
            'pcd'               => false,
        ], $overrides);
    }

    // ── Acesso ──

    public function test_usuario_autenticado_acessa_listagem_vagas(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/vagas');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Vagas/Index', false)
            ->has('vagas')
            ->has('formularios')
            ->has('recrutadores')
        );
    }

    public function test_visitante_nao_autenticado_nao_acessa_vagas(): void
    {
        $response = $this->get('/vagas');
        $response->assertRedirect('/login');
    }

    // ── Criar Vaga ──

    public function test_admin_pode_criar_vaga(): void
    {
        $admin = $this->criarAdmin();

        $response = $this->actingAs($admin)->post('/vagas', $this->dadosVaga());

        $response->assertRedirect('/vagas');
        $this->assertDatabaseHas('vagas', ['titulo' => 'Desenvolvedor PHP']);
    }

    public function test_coordenador_pode_criar_vaga(): void
    {
        $coordenador = User::factory()->create(['role' => 'coordenador']);

        $response = $this->actingAs($coordenador)->post('/vagas', $this->dadosVaga([
            'titulo' => 'Auxiliar Administrativo'
        ]));

        $response->assertRedirect('/vagas');
        $this->assertDatabaseHas('vagas', ['titulo' => 'Auxiliar Administrativo']);
    }

    public function test_recrutador_nao_pode_criar_vaga(): void
    {
        $recrutador = $this->criarRecrutador();

        $response = $this->actingAs($recrutador)->post('/vagas', $this->dadosVaga());

        $response->assertStatus(403);
    }

    public function test_validacao_exige_campos_obrigatorios(): void
    {
        $admin = $this->criarAdmin();

        $response = $this->actingAs($admin)->postJson('/vagas', []);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors([
            'titulo', 'horario', 'local', 'descricao',
            'requisitos', 'salario', 'escala', 'status_efetivacao'
        ]);
    }

    // ── Editar Vaga ──

    public function test_admin_pode_editar_vaga(): void
    {
        $admin = $this->criarAdmin();
        $vaga = Vagas::create($this->dadosVaga());

        $response = $this->actingAs($admin)->put("/vagas/{$vaga->id}", $this->dadosVaga([
            'titulo' => 'Desenvolvedor PHP Sênior',
        ]));

        $response->assertRedirect('/vagas');
        $response->assertSessionHas('success', 'Vaga atualizada com sucesso.');
        $this->assertDatabaseHas('vagas', ['id' => $vaga->id, 'titulo' => 'Desenvolvedor PHP Sênior']);
    }

    public function test_recrutador_nao_pode_editar_vaga(): void
    {
        $recrutador = $this->criarRecrutador();
        $vaga = Vagas::create($this->dadosVaga());

        $response = $this->actingAs($recrutador)->put("/vagas/{$vaga->id}", $this->dadosVaga([
            'titulo' => 'Hackeado',
        ]));

        $response->assertStatus(403);
        $this->assertDatabaseMissing('vagas', ['titulo' => 'Hackeado']);
    }

    // ── Deletar Vaga ──

    public function test_admin_pode_deletar_vaga(): void
    {
        $admin = $this->criarAdmin();
        $vaga = Vagas::create($this->dadosVaga());

        $response = $this->actingAs($admin)->delete("/vagas/{$vaga->id}");

        $response->assertRedirect('/vagas');
        $response->assertSessionHas('success', 'Vaga deletada com sucesso.');
        // SoftDeletes: o registro ainda existe mas com deleted_at preenchido
        $this->assertSoftDeleted('vagas', ['id' => $vaga->id]);
    }

    public function test_recrutador_nao_pode_deletar_vaga(): void
    {
        $recrutador = $this->criarRecrutador();
        $vaga = Vagas::create($this->dadosVaga());

        $response = $this->actingAs($recrutador)->delete("/vagas/{$vaga->id}");

        $response->assertStatus(403);
    }

    // ── Campos opcionais ──

    public function test_campos_opcionais_vazios_sao_convertidos_para_null(): void
    {
        $admin = $this->criarAdmin();

        $response = $this->actingAs($admin)->post('/vagas', $this->dadosVaga([
            'va'   => '',
            'vr'   => '',
            'vt'   => '',
            'area' => '',
        ]));

        $response->assertRedirect('/vagas');
        $vaga = Vagas::latest()->first();
        $this->assertNull($vaga->va);
        $this->assertNull($vaga->vr);
        $this->assertNull($vaga->vt);
        $this->assertNull($vaga->area);
    }

    // ── Vaga com formulário e recrutador ──

    public function test_criar_vaga_com_formulario_e_recrutador(): void
    {
        $admin = $this->criarAdmin();
        $recrutador = $this->criarRecrutador();
        $formulario = Formulario::create([
            'titulo_formulario' => 'Quiz Operacional',
            'descricao'         => 'Desc',
            'requisitos'        => 'Nenhum',
            'posto'             => 'Operacional',
            'threshold'         => 70,
        ]);

        $response = $this->actingAs($admin)->post('/vagas', $this->dadosVaga([
            'formulario_id' => $formulario->id,
            'user_id'       => $recrutador->id,
        ]));

        $response->assertRedirect('/vagas');
        $this->assertDatabaseHas('vagas', [
            'formulario_id' => $formulario->id,
            'user_id'       => $recrutador->id,
        ]);
    }
}
