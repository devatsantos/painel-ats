<?php

namespace Tests\Feature;

use App\Models\Candidatos;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Inertia\Testing\AssertableInertia as Assert;

class CandidatosTest extends TestCase
{
    use RefreshDatabase;

    public function test_visitante_nao_autenticado_eh_redirecionado_para_login(): void
    {
        $response = $this->get('/candidatos');
        $response->assertRedirect('/login');
    }

    public function test_usuario_autenticado_pode_acessar_candidatos(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/candidatos');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Candidatos/Index', false)
        );
    }

    public function test_redirecionamento_permanente_de_talentos_para_candidatos(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/talentos');

        $response->assertStatus(301);
        $response->assertRedirect('/candidatos');
    }

    public function test_redirecionamento_permanente_de_base_de_dados_para_candidatos(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/base-de-dados');

        $response->assertStatus(301);
        $response->assertRedirect('/candidatos');
    }

    public function test_usuario_pode_alternar_banco_de_talentos_do_candidato(): void
    {
        $user = User::factory()->create();
        $candidato = Candidatos::create([
            'nome' => 'Candidato Teste',
            'cpf' => '12345678901',
            'email' => 'candidato@teste.com',
            'telefone' => '(11) 99999-9999',
            'nivel_escolaridade' => 'graduacao',
            'cep' => '01001-000',
            'logradouro' => 'Praça da Sé',
            'regiao' => 'Centro',
            'banco_de_talentos' => true,
        ]);

        $this->assertTrue($candidato->banco_de_talentos);

        // Remove do banco
        $response = $this->actingAs($user)->put("/candidatos/{$candidato->id}/banco-de-talentos");

        $response->assertStatus(302); // Redirect back
        $candidato->refresh();
        $this->assertFalse($candidato->banco_de_talentos);

        // Adiciona novamente ao banco
        $response = $this->actingAs($user)->put("/candidatos/{$candidato->id}/banco-de-talentos");

        $response->assertStatus(302);
        $candidato->refresh();
        $this->assertTrue($candidato->banco_de_talentos);
    }
}
