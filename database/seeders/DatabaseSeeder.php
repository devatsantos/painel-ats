<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            OrcamentoSeeder::class,
            FormularioSeeder::class,
            VagaSeeder::class,
            CandidatoSeeder::class,
            TalentoSeeder::class,
            BloqueioAgendaSeeder::class,
        ]);
    }
}
