<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Inertia\Testing\AssertableInertia as Assert;
use App\Models\User;
use App\Models\Candidatos;
use App\Models\Formulario;
use App\Models\Reprovado;

class ReprovadosTest extends TestCase
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

    private function criarFormulario(string $titulo = 'Formulário Padrão'): Formulario
    {
        return Formulario::create([
            'titulo_formulario' => $titulo,
            'descricao'         => 'Descrição do formulário',
            'requisitos'        => 'Nenhum',
            'posto'             => 'Operacional',
            'threshold'         => 70,
        ]);
    }

    private function criarCandidatoComReprovacao(?string $reprovadoAte = null, ?Formulario $formulario = null): array
    {
        $candidato = Candidatos::create([
            'nome'               => 'Candidato Reprovado',
            'cpf'                => fake()->unique()->numerify('###.###.###-##'),
            'email'              => fake()->unique()->safeEmail(),
            'telefone'           => '13999999999',
            'nivel_escolaridade' => 'graduacao',
            'cep'                => '01001-000',
            'logradouro'         => 'Praça da Sé',
            'regiao'             => 'Centro',
        ]);

        $formulario = $formulario ?? $this->criarFormulario();

        $reprovado = Reprovado::create([
            'candidato_id'  => $candidato->id,
            'formulario_id' => $formulario->id,
            'reprovado_ate' => $reprovadoAte ?? now()->addDays(30),
        ]);

        return [$candidato, $formulario, $reprovado];
    }

    // ── Acesso e Listagem ──

    public function test_admin_pode_acessar_listagem_reprovados(): void
    {
        $admin = $this->criarAdmin();
        [$candidato, $formulario, $reprovado] = $this->criarCandidatoComReprovacao();

        $response = $this->actingAs($admin)->get('/reprovados');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Reprovados/Index', false)
            ->has('reprovados')
            ->has('formularios')
            ->has('totalAtivos')
            ->has('totalExpirados')
        );
    }

    public function test_visitante_nao_autenticado_nao_acessa_reprovados(): void
    {
        $response = $this->get('/reprovados');
        $response->assertRedirect('/login');
    }

    // ── Filtros ──

    public function test_filtro_por_formulario_funciona(): void
    {
        $admin = $this->criarAdmin();
        $form1 = $this->criarFormulario('Quiz Operacional');
        $form2 = $this->criarFormulario('Quiz Administrativo');

        $this->criarCandidatoComReprovacao(null, $form1);
        $this->criarCandidatoComReprovacao(null, $form2);

        $response = $this->actingAs($admin)->get("/reprovados?formulario_id={$form1->id}");

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->where('filtros.formulario_id', (string) $form1->id)
        );
    }

    public function test_filtro_por_busca_textual_funciona(): void
    {
        $admin = $this->criarAdmin();
        $candidato = Candidatos::create([
            'nome'               => 'Maria da Silva',
            'cpf'                => '111.222.333-44',
            'email'              => 'maria@teste.com',
            'telefone'           => '13999999999',
            'nivel_escolaridade' => 'graduacao',
            'cep'                => '01001-000',
            'logradouro'         => 'Praça da Sé',
            'regiao'             => 'Centro',
        ]);
        $formulario = $this->criarFormulario('Quiz');
        Reprovado::create([
            'candidato_id'  => $candidato->id,
            'formulario_id' => $formulario->id,
            'reprovado_ate' => now()->addDays(30),
        ]);

        $response = $this->actingAs($admin)->get('/reprovados?busca=Maria');
        $response->assertStatus(200);
    }

    public function test_filtro_ativos_mostra_apenas_bloqueios_vigentes(): void
    {
        $admin = $this->criarAdmin();

        $this->criarCandidatoComReprovacao(now()->addDays(30)->toDateTimeString());
        $this->criarCandidatoComReprovacao(now()->subDays(5)->toDateTimeString());

        $response = $this->actingAs($admin)->get('/reprovados?ativos=true');
        $response->assertStatus(200);
    }

    // ── Exclusão ──

    public function test_admin_pode_excluir_reprovacao(): void
    {
        $admin = $this->criarAdmin();
        [$candidato, $formulario, $reprovado] = $this->criarCandidatoComReprovacao();

        $response = $this->actingAs($admin)->delete("/reprovados/{$reprovado->id}");

        $response->assertRedirect('/reprovados');
        $response->assertSessionHas('success', 'Registro de reprovação removido com sucesso.');
        $this->assertDatabaseMissing('reprovados', ['id' => $reprovado->id]);
    }

    public function test_nao_admin_nao_pode_excluir_reprovacao(): void
    {
        $recrutador = $this->criarRecrutador();
        [$candidato, $formulario, $reprovado] = $this->criarCandidatoComReprovacao();

        $response = $this->actingAs($recrutador)->delete("/reprovados/{$reprovado->id}");

        $response->assertStatus(403);
        $this->assertDatabaseHas('reprovados', ['id' => $reprovado->id]);
    }

    // ── Contadores ──

    public function test_contadores_ativos_e_expirados_estao_corretos(): void
    {
        $admin = $this->criarAdmin();

        $this->criarCandidatoComReprovacao(now()->addDays(30)->toDateTimeString());
        $this->criarCandidatoComReprovacao(now()->addDays(10)->toDateTimeString());
        $this->criarCandidatoComReprovacao(now()->subDays(5)->toDateTimeString());

        $response = $this->actingAs($admin)->get('/reprovados');

        $response->assertInertia(fn (Assert $page) => $page
            ->where('totalAtivos', 2)
            ->where('totalExpirados', 1)
        );
    }
}
