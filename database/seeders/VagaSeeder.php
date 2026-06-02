<?php

namespace Database\Seeders;

use App\Models\Formulario;
use App\Models\Vagas;
use Illuminate\Database\Seeder;

class VagaSeeder extends Seeder
{
    public function run(): void
    {
        $formularios = Formulario::pluck('id', 'titulo_formulario');

        $vagas = [
            [
                'titulo' => 'Desenvolvedor Front-end Júnior',
                'horario' => '09:00 - 18:00',
                'local' => 'Remoto',
                'descricao' => 'Atuação em interfaces React com foco em usabilidade e manutenção.',
                'requisitos' => 'React, Tailwind e consumo de APIs.',
                'salario' => '4000.00',
                'va' => '500.00',
                'vr' => '650.00',
                'vt' => '0.00',
                'escala' => '5x2',
                'status_efetivacao' => 'CLT',
                'ativo' => true,
                'pcd' => false,
                'formulario' => 'Avaliação Front-end',
            ],
            [
                'titulo' => 'Auxiliar Administrativo',
                'horario' => '08:00 - 17:00',
                'local' => 'São Paulo, SP',
                'descricao' => 'Suporte às rotinas administrativas e organização documental.',
                'requisitos' => 'Excel intermediário e boa comunicação.',
                'salario' => '2500.00',
                'va' => '400.00',
                'vr' => '600.00',
                'vt' => '220.00',
                'escala' => '5x2',
                'status_efetivacao' => 'CLT',
                'ativo' => true,
                'pcd' => false,
                'formulario' => 'Triagem Inicial - Administrativo',
            ],
            [
                'titulo' => 'Desenvolvedor Back-end PHP',
                'horario' => '09:00 - 18:00',
                'local' => 'Híbrido - Barueri, SP',
                'descricao' => 'Desenvolvimento e manutenção de APIs Laravel e integrações.',
                'requisitos' => 'PHP, Laravel, MySQL e testes básicos.',
                'salario' => '5200.00',
                'va' => '550.00',
                'vr' => '700.00',
                'vt' => '180.00',
                'escala' => '5x2',
                'status_efetivacao' => 'CLT',
                'ativo' => true,
                'pcd' => true,
                'formulario' => 'Triagem Back-end PHP',
            ],
            [
                'titulo' => 'Analista de Atendimento',
                'horario' => '12:00 - 20:20',
                'local' => 'Campinas, SP',
                'descricao' => 'Atendimento multicanal com foco em qualidade e resolução.',
                'requisitos' => 'Experiência com SAC e registro de chamados.',
                'salario' => '2300.00',
                'va' => '350.00',
                'vr' => '550.00',
                'vt' => '200.00',
                'escala' => '6x1',
                'status_efetivacao' => 'CLT',
                'ativo' => true,
                'pcd' => false,
                'formulario' => 'Atendimento ao Cliente',
            ],
            [
                'titulo' => 'Assistente de Logística',
                'horario' => '06:00 - 15:48',
                'local' => 'Guarulhos, SP',
                'descricao' => 'Separação, conferência e controle de movimentações no estoque.',
                'requisitos' => 'Vivência com estoque e rotinas operacionais.',
                'salario' => '2200.00',
                'va' => '300.00',
                'vr' => '500.00',
                'vt' => '180.00',
                'escala' => '5x2',
                'status_efetivacao' => 'CLT',
                'ativo' => true,
                'pcd' => false,
                'formulario' => 'Operação Logística',
            ],
            [
                'titulo' => 'Analista de Recursos Humanos',
                'horario' => '08:30 - 17:30',
                'local' => 'São Paulo, SP',
                'descricao' => 'Condução de recrutamento, seleção e apoio a processos de pessoas.',
                'requisitos' => 'Experiência em triagem e entrevistas.',
                'salario' => '4200.00',
                'va' => '450.00',
                'vr' => '650.00',
                'vt' => '220.00',
                'escala' => '5x2',
                'status_efetivacao' => 'CLT',
                'ativo' => true,
                'pcd' => true,
                'formulario' => 'Analista de RH',
            ],
            [
                'titulo' => 'Analista de Suporte N1',
                'horario' => '14:00 - 22:00',
                'local' => 'Remoto',
                'descricao' => 'Atendimento técnico inicial e registro de incidentes.',
                'requisitos' => 'Noções de redes, sistemas operacionais e atendimento.',
                'salario' => '2800.00',
                'va' => '420.00',
                'vr' => '580.00',
                'vt' => '0.00',
                'escala' => '6x1',
                'status_efetivacao' => 'CLT',
                'ativo' => true,
                'pcd' => false,
                'formulario' => 'Suporte Técnico',
            ],
            [
                'titulo' => 'Assistente Financeiro',
                'horario' => '08:00 - 17:00',
                'local' => 'Osasco, SP',
                'descricao' => 'Apoio nas rotinas de contas a pagar, receber e conciliação.',
                'requisitos' => 'Conhecimento básico em finanças e planilhas.',
                'salario' => '2900.00',
                'va' => '380.00',
                'vr' => '620.00',
                'vt' => '190.00',
                'escala' => '5x2',
                'status_efetivacao' => 'CLT',
                'ativo' => true,
                'pcd' => false,
                'formulario' => 'Financeiro Júnior',
            ],
            [
                'titulo' => 'Assistente de Marketing',
                'horario' => '09:00 - 18:00',
                'local' => 'Híbrido - São Paulo, SP',
                'descricao' => 'Apoio em campanhas, conteúdo e análise inicial de métricas.',
                'requisitos' => 'Noções de mídia paga e marketing de conteúdo.',
                'salario' => '3000.00',
                'va' => '420.00',
                'vr' => '600.00',
                'vt' => '200.00',
                'escala' => '5x2',
                'status_efetivacao' => 'CLT',
                'ativo' => true,
                'pcd' => false,
                'formulario' => 'Marketing Digital',
            ],
            [
                'titulo' => 'Assistente Comercial',
                'horario' => '09:00 - 18:00',
                'local' => 'Belo Horizonte, MG',
                'descricao' => 'Apoio ao time comercial no relacionamento com leads e propostas.',
                'requisitos' => 'Organização, CRM e comunicação consultiva.',
                'salario' => '2700.00',
                'va' => '360.00',
                'vr' => '580.00',
                'vt' => '210.00',
                'escala' => '5x2',
                'status_efetivacao' => 'CLT',
                'ativo' => true,
                'pcd' => true,
                'formulario' => 'Assistente Comercial',
            ],
        ];

        foreach ($vagas as $dadosVaga) {
            $tituloFormulario = $dadosVaga['formulario'];
            unset($dadosVaga['formulario']);

            $formularioId = $formularios[$tituloFormulario] ?? null;

            if (!$formularioId) {
                continue;
            }

            Vagas::updateOrCreate(
                ['titulo' => $dadosVaga['titulo']],
                [...$dadosVaga, 'formulario_id' => $formularioId]
            );
        }
    }
}
