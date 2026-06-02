<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\RateLimiter;
use Tests\TestCase;
use Inertia\Testing\AssertableInertia as Assert;

class AuthTest extends TestCase
{
    use RefreshDatabase; 

    public function test_tela_de_login_pode_ser_renderizada()
    {
        $response = $this->get('/login');

        $response->assertStatus(200);
        
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Login', false)
        );
    }

    public function test_usuario_consegue_logar_com_credenciais_corretas()
    {
        $user = User::factory()->create([
            'cpf' => '12345678900',
            'password' => bcrypt('senhaSegura123'),
        ]);

        $response = $this->post('/login', [
            'cpf' => '12345678900',
            'password' => 'senhaSegura123',
        ]);

        $this->assertAuthenticatedAs($user);
        
        $response->assertRedirect('/');
    }

    public function test_usuario_nao_consegue_logar_com_senha_incorreta()
    {
        $user = User::factory()->create([
            'cpf' => '12345678900',
            'password' => bcrypt('senhaSegura123'),
        ]);

        $response = $this->post('/login', [
            'cpf' => '12345678900',
            'password' => 'senhaErrada123',
        ]);

        $this->assertGuest();
        
        $response->assertSessionHasErrors([
            'cpf' => 'As credenciais fornecidas não são válidas.'
        ]);
    }

    public function test_bloqueia_acesso_apos_cinco_tentativas_falhas()
    {
        $cpfTeste = '99988877766';

        for ($i = 0; $i < 5; $i++) {
            $this->post('/login', [
                'cpf' => $cpfTeste,
                'password' => 'senhaInvalida'
            ]);
        }

        $response = $this->post('/login', [
            'cpf' => $cpfTeste,
            'password' => 'senhaInvalida'
        ]);

        $this->assertGuest();
        
        $response->assertSessionHasErrors('cpf');
        $this->assertStringContainsString(
            'Muitas tentativas de login', 
            session('errors')->get('cpf')[0]
        );
    }

    public function test_usuario_consegue_fazer_logout()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $response = $this->post('/logout');

        $this->assertGuest();
        $response->assertRedirect('/login');
    }
}