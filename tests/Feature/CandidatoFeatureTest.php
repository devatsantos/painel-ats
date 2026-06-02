<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Inertia\Testing\AssertableInertia as Assert;

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
}
