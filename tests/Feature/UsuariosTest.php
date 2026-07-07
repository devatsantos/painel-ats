<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Inertia\Testing\AssertableInertia as Assert;
use App\Models\User;

class UsuariosTest extends TestCase
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

    // ── Acesso ──

    public function test_admin_pode_acessar_listagem_usuarios(): void
    {
        $admin = $this->criarAdmin();

        $response = $this->actingAs($admin)->get('/usuarios');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Usuarios/Index', false)
            ->has('usuarios')
        );
    }

    public function test_nao_admin_nao_acessa_usuarios(): void
    {
        $recrutador = $this->criarRecrutador();

        $response = $this->actingAs($recrutador)->get('/usuarios');

        $response->assertStatus(403);
    }

    public function test_visitante_nao_autenticado_nao_acessa_usuarios(): void
    {
        $response = $this->get('/usuarios');
        $response->assertRedirect('/login');
    }

    // ── Criar ──

    public function test_admin_pode_criar_usuario(): void
    {
        $admin = $this->criarAdmin();

        $response = $this->actingAs($admin)->post('/usuarios', [
            'nome'     => 'Novo Usuário',
            'cpf'      => '123.456.789-00',
            'password' => 'senhaSegura123',
            'role'     => 'recrutador',
        ]);

        $response->assertRedirect('/usuarios');
        $this->assertDatabaseHas('users', [
            'nome' => 'Novo Usuário',
            'cpf'  => '123.456.789-00',
            'role' => 'recrutador',
        ]);
    }

    public function test_nao_admin_nao_pode_criar_usuario(): void
    {
        $recrutador = $this->criarRecrutador();

        $response = $this->actingAs($recrutador)->post('/usuarios', [
            'nome'     => 'Tentativa',
            'cpf'      => '111.222.333-44',
            'password' => 'senhaSegura123',
            'role'     => 'admin',
        ]);

        $response->assertStatus(403);
        $this->assertDatabaseMissing('users', ['nome' => 'Tentativa']);
    }

    public function test_validacao_exige_campos_obrigatorios(): void
    {
        $admin = $this->criarAdmin();

        $response = $this->actingAs($admin)->postJson('/usuarios', []);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['nome', 'cpf', 'password']);
    }

    public function test_cpf_duplicado_eh_rejeitado(): void
    {
        $admin = $this->criarAdmin();
        User::factory()->create(['cpf' => '123.456.789-00']);

        $response = $this->actingAs($admin)->postJson('/usuarios', [
            'nome'     => 'Outro Usuário',
            'cpf'      => '123.456.789-00',
            'password' => 'senhaSegura123',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['cpf']);
    }

    public function test_senha_curta_eh_rejeitada(): void
    {
        $admin = $this->criarAdmin();

        $response = $this->actingAs($admin)->postJson('/usuarios', [
            'nome'     => 'Teste',
            'cpf'      => '999.888.777-66',
            'password' => '123', // menos de 8 caracteres
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['password']);
    }

    public function test_role_invalida_eh_rejeitada(): void
    {
        $admin = $this->criarAdmin();

        $response = $this->actingAs($admin)->postJson('/usuarios', [
            'nome'     => 'Teste',
            'cpf'      => '999.888.777-66',
            'password' => 'senhaSegura123',
            'role'     => 'super_admin', // role inexistente
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['role']);
    }

    // ── Editar ──

    public function test_admin_pode_editar_usuario(): void
    {
        $admin = $this->criarAdmin();
        $usuario = User::factory()->create([
            'nome' => 'Antigo Nome',
            'role' => 'recrutador',
        ]);

        $response = $this->actingAs($admin)->put("/usuarios/{$usuario->id}", [
            'nome'     => 'Novo Nome',
            'cpf'      => $usuario->cpf,
            'password' => 'novaSenha123',
            'role'     => 'coordenador',
        ]);

        $response->assertRedirect('/usuarios');
        $response->assertSessionHas('success', 'Usuário atualizado com sucesso.');
        $this->assertDatabaseHas('users', [
            'id'   => $usuario->id,
            'nome' => 'Novo Nome',
            'role' => 'coordenador',
        ]);
    }

    public function test_editar_sem_senha_mantem_senha_atual(): void
    {
        $admin = $this->criarAdmin();
        $usuario = User::factory()->create(['password' => bcrypt('senhaOriginal')]);
        $senhaAnterior = $usuario->password;

        $response = $this->actingAs($admin)->put("/usuarios/{$usuario->id}", [
            'nome'     => $usuario->nome,
            'cpf'      => $usuario->cpf,
            'password' => null,
        ]);

        $response->assertRedirect('/usuarios');
        $usuario->refresh();
        $this->assertEquals($senhaAnterior, $usuario->password);
    }

    public function test_nao_admin_nao_pode_editar_usuario(): void
    {
        $recrutador = $this->criarRecrutador();
        $usuario = User::factory()->create();

        $response = $this->actingAs($recrutador)->put("/usuarios/{$usuario->id}", [
            'nome' => 'Hackeado',
            'cpf'  => $usuario->cpf,
        ]);

        $response->assertStatus(403);
        $this->assertDatabaseMissing('users', ['nome' => 'Hackeado']);
    }

    // ── Deletar ──

    public function test_admin_pode_deletar_usuario(): void
    {
        $admin = $this->criarAdmin();
        $usuario = User::factory()->create();

        $response = $this->actingAs($admin)->delete("/usuarios/{$usuario->id}");

        $response->assertRedirect('/usuarios');
        $response->assertSessionHas('success', 'Usuário deletado com sucesso.');
        $this->assertDatabaseMissing('users', ['id' => $usuario->id]);
    }

    public function test_nao_admin_nao_pode_deletar_usuario(): void
    {
        $recrutador = $this->criarRecrutador();
        $usuario = User::factory()->create();

        $response = $this->actingAs($recrutador)->delete("/usuarios/{$usuario->id}");

        $response->assertStatus(403);
        $this->assertDatabaseHas('users', ['id' => $usuario->id]);
    }
}
