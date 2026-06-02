<?php

namespace Database\Factories;

use App\Models\Orcamento;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Orcamento>
 */
class OrcamentoFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nome_representante' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'telefone' => fake()->phoneNumber(),
            'cidade' => fake()->city(),
            'estado' => fake()->stateAbbr(),
            'empresa' => fake()->company(),
            'iniciativa' => fake()->sentence(3),
            'servicos' => fake()->randomElement(['Desenvolvimento', 'Design', 'Consultoria', 'Marketing Digital', 'Sistema Web']),
            'anexo_referencia' => null,
            'descricao' => fake()->paragraph(),
            'created_at' => fake()->dateTimeBetween('-1 year', 'now'),
            'updated_at' => fake()->dateTimeBetween('-1 year', 'now'),
        ];
    }
}
