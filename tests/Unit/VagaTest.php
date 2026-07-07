<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;

class VagaTest extends TestCase
{
    /**
     * Testes unitários de Vagas foram movidos para tests/Feature/VagasTest.php
     * que testa o CRUD completo com permissões e validações.
     */
    public function test_feature_tests_existem(): void
    {
        $this->assertFileExists(__DIR__ . '/../Feature/VagasTest.php');
    }
}
