<?php

namespace Database\Seeders;

use App\Models\BloqueioAgenda;
use Illuminate\Database\Seeder;

class BloqueioAgendaSeeder extends Seeder
{
    public function run(): void
    {
        $bloqueios = [
            ['data' => now()->copy()->addWeekdays(1)->toDateString(), 'hora_inicio' => '08:00:00', 'hora_fim' => '09:00:00', 'motivo' => 'Reuniao de alinhamento semanal'],
            ['data' => now()->copy()->addWeekdays(2)->toDateString(), 'hora_inicio' => '12:00:00', 'hora_fim' => '13:00:00', 'motivo' => 'Horario de almoco estendido'],
            ['data' => now()->copy()->addWeekdays(3)->toDateString(), 'hora_inicio' => '09:30:00', 'hora_fim' => '10:30:00', 'motivo' => 'Treinamento interno do time'],
            ['data' => now()->copy()->addWeekdays(4)->toDateString(), 'hora_inicio' => '15:00:00', 'hora_fim' => '16:00:00', 'motivo' => 'Auditoria de processos'],
            ['data' => now()->copy()->addWeekdays(5)->toDateString(), 'hora_inicio' => '11:00:00', 'hora_fim' => '12:00:00', 'motivo' => 'Apresentacao de indicadores'],
            ['data' => now()->copy()->addWeekdays(6)->toDateString(), 'hora_inicio' => '14:00:00', 'hora_fim' => '15:30:00', 'motivo' => 'Capacitacao de entrevistadores'],
            ['data' => now()->copy()->addWeekdays(7)->toDateString(), 'hora_inicio' => '10:00:00', 'hora_fim' => '11:00:00', 'motivo' => 'Revisao de agenda operacional'],
            ['data' => now()->copy()->addWeekdays(8)->toDateString(), 'hora_inicio' => '16:00:00', 'hora_fim' => '17:00:00', 'motivo' => 'Comite de aprovacao de vagas'],
            ['data' => now()->copy()->addWeekdays(9)->toDateString(), 'hora_inicio' => '13:00:00', 'hora_fim' => '14:00:00', 'motivo' => 'Atualizacao de politicas internas'],
            ['data' => now()->copy()->addWeekdays(10)->toDateString(), 'hora_inicio' => '09:00:00', 'hora_fim' => '10:00:00', 'motivo' => 'Planejamento mensal de recrutamento'],
        ];

        foreach ($bloqueios as $bloqueio) {
            BloqueioAgenda::updateOrCreate(
                [
                    'data' => $bloqueio['data'],
                    'hora_inicio' => $bloqueio['hora_inicio'],
                    'motivo' => $bloqueio['motivo'],
                ],
                [...$bloqueio, 'dia_todo' => false, 'origem' => 'manual']
            );
        }
    }
}
