<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Inertia\Testing\AssertableInertia as Assert;
use App\Models\Candidatos;
use App\Models\Vagas;
use App\Models\CandidatoVaga;
use App\Models\Entrevista;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

class CandidatoFeatureTest extends TestCase
{
    use RefreshDatabase;

    public function test_pagina_candidatura_carrega_com_sucesso(): void
    {
        $response = $this->get('/candidatura');

        $response->assertStatus(200);
        
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Candidatura/Index', false)
        );
    }

    public function test_validacao_de_cpf_exige_vaga_id(): void
    {
        $response = $this->postJson('/candidatura/verificar-cpf', [
            'cpf' => '123.456.789-00'
        ]);

        $response->assertStatus(422);

        $response->assertJsonValidationErrors(['vaga_id']);
    }

    public function test_candidatura_marcada_sem_entrevista_nao_bloqueia_outra_vaga(): void
    {
        $vagaA = Vagas::create([
            'titulo' => 'Vaga A',
            'horario' => '08:00 - 17:00',
            'local' => 'Santos',
            'area' => 'Operacional',
            'descricao' => 'Descrição Vaga A',
            'requisitos' => 'Nenhum',
            'salario' => 1500.00,
            'va' => 300,
            'vr' => 400,
            'vt' => true,
            'escala' => '5x2',
            'status_efetivacao' => 'efetivo',
            'ativo' => true
        ]);

        $vagaB = Vagas::create([
            'titulo' => 'Vaga B',
            'horario' => '08:00 - 17:00',
            'local' => 'Santos',
            'area' => 'Operacional',
            'descricao' => 'Descrição Vaga B',
            'requisitos' => 'Nenhum',
            'salario' => 1500.00,
            'va' => 300,
            'vr' => 400,
            'vt' => true,
            'escala' => '5x2',
            'status_efetivacao' => 'efetivo',
            'ativo' => true
        ]);

        $candidato = Candidatos::create([
            'nome' => 'Candidato Teste',
            'cpf' => '123.456.789-01',
            'email' => 'candidato@teste.com',
            'telefone' => '13999999999',
            'nivel_escolaridade' => 'graduacao',
            'cep' => '01001-000',
            'logradouro' => 'Praça da Sé',
            'regiao' => 'Centro',
        ]);

        // Cria candidatura marcada na Vaga A (Inscrito inicial)
        CandidatoVaga::create([
            'candidato_id' => $candidato->id,
            'vaga_id' => $vagaA->id,
            'status' => 'marcada'
        ]);

        // 1. Verifica CPF para a Vaga B (Web) -> Deve retornar que existe, mas NÃO bloqueado
        $responseWeb = $this->postJson('/candidatura/verificar-cpf', [
            'cpf' => '123.456.789-01',
            'vaga_id' => $vagaB->id
        ]);
        $responseWeb->assertStatus(200);
        $responseWeb->assertJsonFragment(['existe' => true]);
        $responseWeb->assertJsonMissing(['bloqueado' => true]);

        // 2. Verifica CPF para a Vaga B (API) -> Deve retornar status exists, mas NÃO status blocked
        $responseApi = $this->postJson('/api/candidatura/verificar-cpf', [
            'cpf' => '123.456.789-01',
            'vaga_id' => $vagaB->id
        ]);
        $responseApi->assertStatus(200);
        $responseApi->assertJsonFragment(['status' => 'exists']);
    }

    public function test_candidatura_marcada_com_entrevista_bloqueia_outra_vaga(): void
    {
        $vagaA = Vagas::create([
            'titulo' => 'Vaga A',
            'horario' => '08:00 - 17:00',
            'local' => 'Santos',
            'area' => 'Operacional',
            'descricao' => 'Descrição Vaga A',
            'requisitos' => 'Nenhum',
            'salario' => 1500.00,
            'va' => 300,
            'vr' => 400,
            'vt' => true,
            'escala' => '5x2',
            'status_efetivacao' => 'efetivo',
            'ativo' => true
        ]);

        $vagaB = Vagas::create([
            'titulo' => 'Vaga B',
            'horario' => '08:00 - 17:00',
            'local' => 'Santos',
            'area' => 'Operacional',
            'descricao' => 'Descrição Vaga B',
            'requisitos' => 'Nenhum',
            'salario' => 1500.00,
            'va' => 300,
            'vr' => 400,
            'vt' => true,
            'escala' => '5x2',
            'status_efetivacao' => 'efetivo',
            'ativo' => true
        ]);

        $candidato = Candidatos::create([
            'nome' => 'Candidato Teste 2',
            'cpf' => '987.654.321-00',
            'email' => 'candidato2@teste.com',
            'telefone' => '13988888888',
            'nivel_escolaridade' => 'graduacao',
            'cep' => '01001-000',
            'logradouro' => 'Praça da Sé',
            'regiao' => 'Centro',
        ]);

        $user = User::factory()->create();

        // Cria candidatura marcada na Vaga A
        $cv = CandidatoVaga::create([
            'candidato_id' => $candidato->id,
            'vaga_id' => $vagaA->id,
            'status' => 'marcada'
        ]);

        // Cria entrevista vinculada (Candidatura Ativa Real)
        Entrevista::create([
            'candidato_vaga_id' => $cv->id,
            'data_hora' => now()->addDays(2),
            'tipo' => 'presencial',
            'user_id' => $user->id
        ]);

        // 1. Verifica CPF para a Vaga B (Web) -> Deve retornar bloqueado
        $responseWeb = $this->postJson('/candidatura/verificar-cpf', [
            'cpf' => '987.654.321-00',
            'vaga_id' => $vagaB->id
        ]);
        $responseWeb->assertStatus(200);
        $responseWeb->assertJsonFragment(['bloqueado' => true]);

        // 2. Verifica CPF para a Vaga B (API) -> Deve retornar status blocked
        $responseApi = $this->postJson('/api/candidatura/verificar-cpf', [
            'cpf' => '987.654.321-00',
            'vaga_id' => $vagaB->id
        ]);
        $responseApi->assertStatus(200);
        $responseApi->assertJsonFragment(['status' => 'blocked']);
    }

    public function test_candidatura_selecionada_bloqueia_outra_vaga(): void
    {
        $vagaA = Vagas::create([
            'titulo' => 'Vaga A',
            'horario' => '08:00 - 17:00',
            'local' => 'Santos',
            'area' => 'Operacional',
            'descricao' => 'Descrição Vaga A',
            'requisitos' => 'Nenhum',
            'salario' => 1500.00,
            'va' => 300,
            'vr' => 400,
            'vt' => true,
            'escala' => '5x2',
            'status_efetivacao' => 'efetivo',
            'ativo' => true
        ]);

        $vagaB = Vagas::create([
            'titulo' => 'Vaga B',
            'horario' => '08:00 - 17:00',
            'local' => 'Santos',
            'area' => 'Operacional',
            'descricao' => 'Descrição Vaga B',
            'requisitos' => 'Nenhum',
            'salario' => 1500.00,
            'va' => 300,
            'vr' => 400,
            'vt' => true,
            'escala' => '5x2',
            'status_efetivacao' => 'efetivo',
            'ativo' => true
        ]);

        $candidato = Candidatos::create([
            'nome' => 'Candidato Teste 3',
            'cpf' => '111.222.333-44',
            'email' => 'candidato3@teste.com',
            'telefone' => '13977777777',
            'nivel_escolaridade' => 'graduacao',
            'cep' => '01001-000',
            'logradouro' => 'Praça da Sé',
            'regiao' => 'Centro',
        ]);

        // Cria candidatura com status 'selecionado' (passou no quiz)
        CandidatoVaga::create([
            'candidato_id' => $candidato->id,
            'vaga_id' => $vagaA->id,
            'status' => 'selecionado'
        ]);

        // 1. Verifica CPF para a Vaga B (Web) -> Deve retornar bloqueado
        $responseWeb = $this->postJson('/candidatura/verificar-cpf', [
            'cpf' => '111.222.333-44',
            'vaga_id' => $vagaB->id
        ]);
        $responseWeb->assertStatus(200);
        $responseWeb->assertJsonFragment(['bloqueado' => true]);

        // 2. Verifica CPF para a Vaga B (API) -> Deve retornar status blocked
        $responseApi = $this->postJson('/api/candidatura/verificar-cpf', [
            'cpf' => '111.222.333-44',
            'vaga_id' => $vagaB->id
        ]);
        $responseApi->assertStatus(200);
        $responseApi->assertJsonFragment(['status' => 'blocked']);
    }

    public function test_nova_inscricao_substitui_inscricao_marcada_anterior_web(): void
    {
        $vagaA = Vagas::create([
            'titulo' => 'Vaga A',
            'horario' => '08:00 - 17:00',
            'local' => 'Santos',
            'area' => 'Operacional',
            'descricao' => 'Descrição Vaga A',
            'requisitos' => 'Nenhum',
            'salario' => 1500.00,
            'va' => 300,
            'vr' => 400,
            'vt' => true,
            'escala' => '5x2',
            'status_efetivacao' => 'efetivo',
            'ativo' => true
        ]);

        $vagaB = Vagas::create([
            'titulo' => 'Vaga B',
            'horario' => '08:00 - 17:00',
            'local' => 'Santos',
            'area' => 'Operacional',
            'descricao' => 'Descrição Vaga B',
            'requisitos' => 'Nenhum',
            'salario' => 1500.00,
            'va' => 300,
            'vr' => 400,
            'vt' => true,
            'escala' => '5x2',
            'status_efetivacao' => 'efetivo',
            'ativo' => true
        ]);

        $candidato = Candidatos::create([
            'nome' => 'Candidato Sub Web',
            'cpf' => '444.555.666-77',
            'email' => 'subweb@teste.com',
            'telefone' => '13955555555',
            'nivel_escolaridade' => 'graduacao',
            'cep' => '01001-000',
            'logradouro' => 'Praça da Sé',
            'regiao' => 'Centro',
        ]);

        // Cria candidatura marcada na Vaga A
        CandidatoVaga::create([
            'candidato_id' => $candidato->id,
            'vaga_id' => $vagaA->id,
            'status' => 'marcada'
        ]);

        // Simula cadastro/inscrição na Vaga B via Web
        $dados = [
            'nome' => 'Candidato Sub Web',
            'cpf' => '444.555.666-77',
            'email' => 'subweb@teste.com',
            'telefone' => '13955555555',
            'nivel_escolaridade' => 'graduacao',
            'cep' => '01001-000',
            'logradouro' => 'Praça da Sé',
            'regiao' => 'Centro',
            'como_conheceu' => 'outro',
            'vaga_id' => $vagaB->id
        ];

        // Autentica o candidato para a rota Web
        $response = $this->actingAs($candidato, 'candidato')->post('/candidatura', $dados);
        $response->assertStatus(302); // Redireciona com sucesso

        // Verifica que a candidatura antiga (Vaga A) foi removida
        $this->assertDatabaseMissing('candidato_vaga', [
            'candidato_id' => $candidato->id,
            'vaga_id' => $vagaA->id
        ]);

        // Verifica que a nova candidatura (Vaga B) existe no banco com status 'marcada'
        $this->assertDatabaseHas('candidato_vaga', [
            'candidato_id' => $candidato->id,
            'vaga_id' => $vagaB->id,
            'status' => 'marcada'
        ]);
    }

    public function test_nova_inscricao_substitui_inscricao_marcada_anterior_api(): void
    {
        $vagaA = Vagas::create([
            'titulo' => 'Vaga A',
            'horario' => '08:00 - 17:00',
            'local' => 'Santos',
            'area' => 'Operacional',
            'descricao' => 'Descrição Vaga A',
            'requisitos' => 'Nenhum',
            'salario' => 1500.00,
            'va' => 300,
            'vr' => 400,
            'vt' => true,
            'escala' => '5x2',
            'status_efetivacao' => 'efetivo',
            'ativo' => true
        ]);

        $vagaB = Vagas::create([
            'titulo' => 'Vaga B',
            'horario' => '08:00 - 17:00',
            'local' => 'Santos',
            'area' => 'Operacional',
            'descricao' => 'Descrição Vaga B',
            'requisitos' => 'Nenhum',
            'salario' => 1500.00,
            'va' => 300,
            'vr' => 400,
            'vt' => true,
            'escala' => '5x2',
            'status_efetivacao' => 'efetivo',
            'ativo' => true
        ]);

        $candidato = Candidatos::create([
            'nome' => 'Candidato Sub API',
            'cpf' => '555.666.777-88',
            'email' => 'subapi@teste.com',
            'telefone' => '13944444444',
            'nivel_escolaridade' => 'graduacao',
            'cep' => '01001-000',
            'logradouro' => 'Praça da Sé',
            'regiao' => 'Centro',
        ]);

        // Cria candidatura marcada na Vaga A
        CandidatoVaga::create([
            'candidato_id' => $candidato->id,
            'vaga_id' => $vagaA->id,
            'status' => 'marcada'
        ]);

        // Simula cadastro/inscrição na Vaga B via API
        $dados = [
            'nome' => 'Candidato Sub API',
            'cpf' => '555.666.777-88',
            'email' => 'subapi@teste.com',
            'telefone' => '13944444444',
            'nivel_escolaridade' => 'graduacao',
            'cep' => '01001-000',
            'logradouro' => 'Praça da Sé',
            'regiao' => 'Centro',
            'como_conheceu' => 'outro',
            'vaga_id' => $vagaB->id
        ];

        // Autentica o candidato via Sanctum para a rota API
        Sanctum::actingAs($candidato);

        $response = $this->postJson('/api/candidatura', $dados);
        $response->assertStatus(200);

        // Verifica que a candidatura antiga (Vaga A) foi removida
        $this->assertDatabaseMissing('candidato_vaga', [
            'candidato_id' => $candidato->id,
            'vaga_id' => $vagaA->id
        ]);

        // Verifica que a nova candidatura (Vaga B) existe no banco com status 'marcada'
        $this->assertDatabaseHas('candidato_vaga', [
            'candidato_id' => $candidato->id,
            'vaga_id' => $vagaB->id,
            'status' => 'marcada'
        ]);
    }

    public function test_rotas_de_verificar_nascimento_foram_removidas(): void
    {
        // 1. Web candidatura/verificar-nascimento
        $responseWebCand = $this->postJson('/candidatura/verificar-nascimento', [
            'cpf' => '123.456.789-01',
            'data_nascimento' => '1990-01-01'
        ]);
        $responseWebCand->assertStatus(404);

        // 2. Web portal/verificar-nascimento
        $responseWebPortal = $this->postJson('/portal/verificar-nascimento', [
            'cpf' => '123.456.789-01',
            'data_nascimento' => '1990-01-01'
        ]);
        $responseWebPortal->assertStatus(404);

        // 3. API api/candidatura/verificar-nascimento
        $responseApi = $this->postJson('/api/candidatura/verificar-nascimento', [
            'cpf' => '123.456.789-01',
            'data_nascimento' => '1990-01-01'
        ]);
        $responseApi->assertStatus(404);
    }

    // ── Cenários de re-candidatura na MESMA vaga ──

    public function test_candidato_reprovado_na_mesma_vaga_nao_pode_se_recandidatar_web(): void
    {
        $vaga = Vagas::create([
            'titulo' => 'Vaga Bloqueio', 'horario' => '08:00 - 17:00',
            'local' => 'Santos', 'area' => 'Operacional',
            'descricao' => 'Desc', 'requisitos' => 'Nenhum',
            'salario' => 1500, 'escala' => '5x2',
            'status_efetivacao' => 'efetivo', 'ativo' => true,
        ]);

        $candidato = Candidatos::create([
            'nome' => 'Reprovado Mesma Vaga', 'cpf' => '100.200.300-40',
            'email' => 'reprovado@teste.com', 'telefone' => '13911111111',
            'nivel_escolaridade' => 'graduacao', 'cep' => '01001-000',
            'logradouro' => 'Praça da Sé', 'regiao' => 'Centro',
        ]);

        CandidatoVaga::create([
            'candidato_id' => $candidato->id,
            'vaga_id' => $vaga->id,
            'status' => 'reprovado',
        ]);

        // Verifica via verificar-cpf que o candidato é reconhecido
        $response = $this->postJson('/candidatura/verificar-cpf', [
            'cpf' => '100.200.300-40',
            'vaga_id' => $vaga->id,
        ]);
        $response->assertStatus(200);
        $response->assertJsonFragment(['existe' => true]);
    }

    public function test_candidato_reprovado_na_mesma_vaga_nao_pode_se_recandidatar_api(): void
    {
        $vaga = Vagas::create([
            'titulo' => 'Vaga Bloqueio API', 'horario' => '08:00 - 17:00',
            'local' => 'Santos', 'area' => 'Operacional',
            'descricao' => 'Desc', 'requisitos' => 'Nenhum',
            'salario' => 1500, 'escala' => '5x2',
            'status_efetivacao' => 'efetivo', 'ativo' => true,
        ]);

        $candidato = Candidatos::create([
            'nome' => 'Reprovado API', 'cpf' => '200.300.400-50',
            'email' => 'reprovadoapi@teste.com', 'telefone' => '13922222222',
            'nivel_escolaridade' => 'graduacao', 'cep' => '01001-000',
            'logradouro' => 'Praça da Sé', 'regiao' => 'Centro',
        ]);

        CandidatoVaga::create([
            'candidato_id' => $candidato->id,
            'vaga_id' => $vaga->id,
            'status' => 'reprovado',
        ]);

        Sanctum::actingAs($candidato);

        $response = $this->postJson('/api/candidatura', [
            'nome' => 'Reprovado API', 'cpf' => '200.300.400-50',
            'email' => 'reprovadoapi@teste.com', 'telefone' => '13922222222',
            'nivel_escolaridade' => 'graduacao', 'cep' => '01001-000',
            'logradouro' => 'Praça da Sé', 'regiao' => 'Centro',
            'como_conheceu' => 'outro', 'vaga_id' => $vaga->id,
        ]);

        $response->assertStatus(422);
        $response->assertJsonFragment(['error' => 'processo_encerrado']);
    }

    public function test_candidato_que_desistiu_na_mesma_vaga_nao_pode_se_recandidatar(): void
    {
        $vaga = Vagas::create([
            'titulo' => 'Vaga Desistencia', 'horario' => '08:00 - 17:00',
            'local' => 'Santos', 'area' => 'Operacional',
            'descricao' => 'Desc', 'requisitos' => 'Nenhum',
            'salario' => 1500, 'escala' => '5x2',
            'status_efetivacao' => 'efetivo', 'ativo' => true,
        ]);

        $candidato = Candidatos::create([
            'nome' => 'Desistente', 'cpf' => '300.400.500-60',
            'email' => 'desistente@teste.com', 'telefone' => '13933333333',
            'nivel_escolaridade' => 'graduacao', 'cep' => '01001-000',
            'logradouro' => 'Praça da Sé', 'regiao' => 'Centro',
        ]);

        CandidatoVaga::create([
            'candidato_id' => $candidato->id,
            'vaga_id' => $vaga->id,
            'status' => 'desistiu',
        ]);

        Sanctum::actingAs($candidato);

        $response = $this->postJson('/api/candidatura', [
            'nome' => 'Desistente', 'cpf' => '300.400.500-60',
            'email' => 'desistente@teste.com', 'telefone' => '13933333333',
            'nivel_escolaridade' => 'graduacao', 'cep' => '01001-000',
            'logradouro' => 'Praça da Sé', 'regiao' => 'Centro',
            'como_conheceu' => 'outro', 'vaga_id' => $vaga->id,
        ]);

        $response->assertStatus(422);
        $response->assertJsonFragment(['error' => 'processo_encerrado']);
    }

    public function test_candidato_nao_compareceu_na_mesma_vaga_nao_pode_se_recandidatar(): void
    {
        $vaga = Vagas::create([
            'titulo' => 'Vaga Falta', 'horario' => '08:00 - 17:00',
            'local' => 'Santos', 'area' => 'Operacional',
            'descricao' => 'Desc', 'requisitos' => 'Nenhum',
            'salario' => 1500, 'escala' => '5x2',
            'status_efetivacao' => 'efetivo', 'ativo' => true,
        ]);

        $candidato = Candidatos::create([
            'nome' => 'Faltante', 'cpf' => '400.500.600-70',
            'email' => 'faltante@teste.com', 'telefone' => '13944444444',
            'nivel_escolaridade' => 'graduacao', 'cep' => '01001-000',
            'logradouro' => 'Praça da Sé', 'regiao' => 'Centro',
        ]);

        CandidatoVaga::create([
            'candidato_id' => $candidato->id,
            'vaga_id' => $vaga->id,
            'status' => 'nao_compareceu',
        ]);

        Sanctum::actingAs($candidato);

        $response = $this->postJson('/api/candidatura', [
            'nome' => 'Faltante', 'cpf' => '400.500.600-70',
            'email' => 'faltante@teste.com', 'telefone' => '13944444444',
            'nivel_escolaridade' => 'graduacao', 'cep' => '01001-000',
            'logradouro' => 'Praça da Sé', 'regiao' => 'Centro',
            'como_conheceu' => 'outro', 'vaga_id' => $vaga->id,
        ]);

        $response->assertStatus(422);
        $response->assertJsonFragment(['error' => 'processo_encerrado']);
    }

    // ── Status "desistiu" em OUTRA vaga deve PERMITIR candidatura ──

    public function test_candidato_que_desistiu_em_outra_vaga_pode_se_candidatar(): void
    {
        $vagaA = Vagas::create([
            'titulo' => 'Vaga A Desistiu', 'horario' => '08:00 - 17:00',
            'local' => 'Santos', 'area' => 'Operacional',
            'descricao' => 'Desc', 'requisitos' => 'Nenhum',
            'salario' => 1500, 'escala' => '5x2',
            'status_efetivacao' => 'efetivo', 'ativo' => true,
        ]);

        $vagaB = Vagas::create([
            'titulo' => 'Vaga B Nova', 'horario' => '08:00 - 17:00',
            'local' => 'Santos', 'area' => 'Operacional',
            'descricao' => 'Desc', 'requisitos' => 'Nenhum',
            'salario' => 1500, 'escala' => '5x2',
            'status_efetivacao' => 'efetivo', 'ativo' => true,
        ]);

        $candidato = Candidatos::create([
            'nome' => 'Desistente Outra', 'cpf' => '500.600.700-80',
            'email' => 'desistoutra@teste.com', 'telefone' => '13955555555',
            'nivel_escolaridade' => 'graduacao', 'cep' => '01001-000',
            'logradouro' => 'Praça da Sé', 'regiao' => 'Centro',
        ]);

        // Desistiu na Vaga A
        CandidatoVaga::create([
            'candidato_id' => $candidato->id,
            'vaga_id' => $vagaA->id,
            'status' => 'desistiu',
        ]);

        // Verifica CPF para Vaga B (Web) -> NÃO deve estar bloqueado
        $responseWeb = $this->postJson('/candidatura/verificar-cpf', [
            'cpf' => '500.600.700-80',
            'vaga_id' => $vagaB->id,
        ]);
        $responseWeb->assertStatus(200);
        $responseWeb->assertJsonMissing(['bloqueado' => true]);

        // Verifica CPF para Vaga B (API) -> NÃO deve estar blocked
        $responseApi = $this->postJson('/api/candidatura/verificar-cpf', [
            'cpf' => '500.600.700-80',
            'vaga_id' => $vagaB->id,
        ]);
        $responseApi->assertStatus(200);
        $responseApi->assertJsonMissing(['status' => 'blocked']);
    }
}


