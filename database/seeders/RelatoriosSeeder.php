<?php

namespace Database\Seeders;

use App\Models\CandidatoVaga;
use App\Models\CandidatoVagaHistorico;
use App\Models\Candidatos;
use App\Models\Entrevista;
use App\Models\MetaRecrutador;
use App\Models\User;
use App\Models\Vagas;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Seeder para popular dados realistas no pipeline de recrutamento,
 * alimentando os 4 dashboards de relatórios.
 *
 * ⚠️ Rode DEPOIS dos seeders base (UserSeeder, FormularioSeeder, VagaSeeder, CandidatoSeeder).
 *    php artisan db:seed --class=RelatoriosSeeder
 */
class RelatoriosSeeder extends Seeder
{
    public function run(): void
    {
        // ──────────────────────────────────────────────
        // 1. Atualizar vagas existentes com area, sla e quantidade
        // ──────────────────────────────────────────────
        $areasMap = [
            'Desenvolvedor'    => ['area' => 'Tecnologia',   'sla_dias' => 30, 'quantidade_vagas' => 2],
            'Analista de Suporte' => ['area' => 'Tecnologia', 'sla_dias' => 25, 'quantidade_vagas' => 3],
            'Auxiliar Administrativo' => ['area' => 'Administrativo', 'sla_dias' => 20, 'quantidade_vagas' => 2],
            'Analista de Atendimento' => ['area' => 'Atendimento', 'sla_dias' => 15, 'quantidade_vagas' => 4],
            'Assistente de Logística' => ['area' => 'Logística', 'sla_dias' => 20, 'quantidade_vagas' => 3],
            'Analista de Recursos'    => ['area' => 'RH', 'sla_dias' => 25, 'quantidade_vagas' => 1],
            'Assistente Financeiro'   => ['area' => 'Financeiro', 'sla_dias' => 25, 'quantidade_vagas' => 1],
            'Assistente de Marketing' => ['area' => 'Marketing', 'sla_dias' => 30, 'quantidade_vagas' => 1],
            'Assistente Comercial'    => ['area' => 'Comercial', 'sla_dias' => 20, 'quantidade_vagas' => 2],
        ];

        $vagas = Vagas::all();
        foreach ($vagas as $vaga) {
            foreach ($areasMap as $prefix => $dados) {
                if (str_starts_with($vaga->titulo, $prefix)) {
                    $vaga->update($dados);
                    break;
                }
            }
            // Fallback: se nenhum prefix bateu
            if (!$vaga->area) {
                $vaga->update([
                    'area' => 'Geral',
                    'sla_dias' => 30,
                    'quantidade_vagas' => 1,
                ]);
            }
        }

        // Atribuir recrutadores às vagas que não têm
        $recrutadores = User::whereIn('role', ['recrutador', 'coordenador'])->pluck('id')->toArray();
        if (count($recrutadores) > 0) {
            foreach (Vagas::whereNull('user_id')->get() as $vaga) {
                $vaga->update(['user_id' => $recrutadores[array_rand($recrutadores)]]);
            }
        }

        // ──────────────────────────────────────────────
        // 2. Criar candidatos extras se necessário (mínimo 80)
        // ──────────────────────────────────────────────
        $candidatosExistentes = Candidatos::count();
        $nomes = [
            'Ana Silva', 'Bruno Santos', 'Camila Oliveira', 'Daniel Costa', 'Eduarda Lima',
            'Felipe Souza', 'Gabriela Ferreira', 'Hugo Pereira', 'Isabela Rodrigues', 'João Almeida',
            'Karla Mendes', 'Leonardo Ribeiro', 'Mariana Barbosa', 'Nicolas Carvalho', 'Olívia Nascimento',
            'Paulo Araújo', 'Quezia Moreira', 'Rafael Gonçalves', 'Sofia Martins', 'Tiago Lopes',
            'Úrsula Teixeira', 'Victor Duarte', 'Wanda Ramos', 'Xavier Dias', 'Yasmin Castro',
            'Zélia Pinto', 'Amanda Nogueira', 'Bernardo Farias', 'Cecília Cardoso', 'Davi Correia',
            'Elisa Monteiro', 'Fábio Rezende', 'Giovana Campos', 'Henrique Vieira', 'Iris Cunha',
            'Juliana Matos', 'Kleber Andrade', 'Luana Rocha', 'Matheus Borges', 'Natália Freitas',
            'Otávio Magalhães', 'Priscila Leite', 'Renato Moura', 'Simone Siqueira', 'Tomás Barros',
            'Valéria Pires', 'Wesley Machado', 'Ximena Fonseca', 'Yago Amorim', 'Zilda Sampaio',
            'Alice Melo', 'Breno Pacheco', 'Clara Bittencourt', 'Douglas Tavares', 'Eva Paiva',
            'Fernando Assis', 'Graziela Franco', 'Heitor Guimarães', 'Ingrid Cavalcanti', 'Jonas Brandão',
        ];

        $regioes = ['Zona Sul', 'Zona Norte', 'Zona Leste', 'Zona Oeste', 'Centro', 'ABC', 'Guarulhos', 'Osasco'];
        $escolaridades = ['Ensino Médio', 'Ensino Superior Incompleto', 'Ensino Superior', 'Pós-graduação', 'Técnico'];

        $candidatosParaCriar = max(0, 80 - $candidatosExistentes);
        for ($i = 0; $i < $candidatosParaCriar; $i++) {
            $cpfNum = str_pad($candidatosExistentes + $i + 100, 11, '0', STR_PAD_LEFT);
            $cpf = substr($cpfNum, 0, 3) . '.' . substr($cpfNum, 3, 3) . '.' . substr($cpfNum, 6, 3) . '-' . substr($cpfNum, 9, 2);

            Candidatos::create([
                'nome'               => $nomes[$i % count($nomes)] . ' ' . ($i + 1),
                'cpf'                => $cpf,
                'data_nascimento'    => Carbon::now()->subYears(rand(20, 45))->subDays(rand(0, 365)),
                'email'              => 'candidato' . ($candidatosExistentes + $i + 1) . '@exemplo.com',
                'telefone'           => '(11) 9' . rand(1000, 9999) . '-' . rand(1000, 9999),
                'nivel_escolaridade' => $escolaridades[array_rand($escolaridades)],
                'regiao'             => $regioes[array_rand($regioes)],
                'banco_de_talentos'  => rand(0, 100) < 25,
            ]);
        }

        // ──────────────────────────────────────────────
        // 3. Criar candidato_vaga com pipeline realista
        // ──────────────────────────────────────────────
        $allCandidatos = Candidatos::pluck('id')->toArray();
        $allVagas = Vagas::pluck('id')->toArray();
        $allRecrutadores = User::whereIn('role', ['recrutador', 'coordenador', 'admin'])->pluck('id')->toArray();

        if (empty($allCandidatos) || empty($allVagas) || empty($allRecrutadores)) {
            $this->command->warn('Dados base insuficientes. Rode UserSeeder, VagaSeeder e CandidatoSeeder primeiro.');
            return;
        }

        // Status possíveis com pesos (mais candidatos ficam nos primeiros estágios)
        $statusDistribuicao = [
            'marcada'         => 25,  // 25% ficaram só com candidatura
            'selecionado'     => 20,  // 20% foram triados mas ainda no pipeline
            'contratado'      => 18,  // 18% contratados (boa taxa para dashboards)
            'reprovado'       => 15,  // 15% reprovados
            'nao_compareceu'  => 8,   // 8% não compareceram
            'recusou_vaga'    => 7,   // 7% recusaram
            'desclassificado' => 5,   // 5% desclassificados
            'sem_vaga'        => 2,   // 2% sem vaga
        ];

        // Criar array ponderado
        $statusPool = [];
        foreach ($statusDistribuicao as $status => $peso) {
            for ($i = 0; $i < $peso; $i++) {
                $statusPool[] = $status;
            }
        }

        // Desabilitar observer para não gerar histórico duplicado (vamos gerar manualmente)
        CandidatoVaga::withoutEvents(function () use ($allCandidatos, $allVagas, $allRecrutadores, $statusPool) {
            $candidatoIndex = 0;
            $totalCandidatos = count($allCandidatos);

            foreach ($allVagas as $vagaId) {
                // Cada vaga recebe entre 5 e 15 candidatos
                $qtdCandidatos = rand(5, 15);

                for ($i = 0; $i < $qtdCandidatos; $i++) {
                    $candidatoId = $allCandidatos[$candidatoIndex % $totalCandidatos];
                    $candidatoIndex++;

                    // Verificar se já existe esta combinação
                    $exists = CandidatoVaga::where('candidato_id', $candidatoId)
                        ->where('vaga_id', $vagaId)
                        ->exists();
                    if ($exists) continue;

                    $status = $statusPool[array_rand($statusPool)];

                    // Datas realistas: candidatura entre 1-6 meses atrás
                    $mesesAtras = rand(0, 5);
                    $diasNoMes = rand(0, 28);
                    $createdAt = Carbon::now()->subMonths($mesesAtras)->subDays($diasNoMes);

                    // Updated_at: alguns dias depois da criação (simula tempo de processamento)
                    $diasProcessamento = match ($status) {
                        'marcada'     => rand(0, 3),
                        'selecionado' => rand(3, 10),
                        'contratado'  => rand(10, 35),
                        'reprovado'   => rand(5, 20),
                        default       => rand(2, 15),
                    };
                    $updatedAt = (clone $createdAt)->addDays($diasProcessamento);

                    // Não ultrapassar a data atual
                    if ($updatedAt->isAfter(now())) {
                        $updatedAt = now();
                    }

                    $cv = CandidatoVaga::create([
                        'candidato_id' => $candidatoId,
                        'vaga_id'      => $vagaId,
                        'status'       => $status,
                    ]);

                    // Atualizar timestamps manualmente
                    DB::table('candidato_vaga')
                        ->where('id', $cv->id)
                        ->update([
                            'created_at' => $createdAt,
                            'updated_at' => $updatedAt,
                        ]);

                    // ──────────────────────────────────────────────
                    // 4. Criar entrevistas para quem avançou no funil
                    // ──────────────────────────────────────────────
                    if (in_array($status, ['selecionado', 'contratado', 'reprovado', 'nao_compareceu', 'recusou_vaga'])) {
                        $dataEntrevista = (clone $createdAt)->addDays(rand(3, 12))
                            ->setHour(rand(8, 17))
                            ->setMinute(rand(0, 59))
                            ->setSecond(rand(0, 59));
                        if ($dataEntrevista->isAfter(now())) {
                            $dataEntrevista = now()->subDays(rand(1, 5))
                                ->setHour(rand(8, 17))
                                ->setMinute(rand(0, 59))
                                ->setSecond(rand(0, 59));
                        }

                        Entrevista::create([
                            'candidato_vaga_id' => $cv->id,
                            'data_hora'         => $dataEntrevista,
                            'tipo'              => rand(0, 100) < 40 ? 'Online' : 'Presencial',
                            'link_meet'         => rand(0, 100) < 40 ? 'https://meet.google.com/abc-defg-hij' : null,
                            'user_id'           => $allRecrutadores[array_rand($allRecrutadores)],
                            'observacao'         => null,
                        ]);
                    }

                    // ──────────────────────────────────────────────
                    // 5. Criar histórico de transições (para Time-to-Hire)
                    // ──────────────────────────────────────────────
                    $historico = [];

                    // Transição inicial: null → marcada (candidatura)
                    $historico[] = [
                        'candidato_vaga_id' => $cv->id,
                        'status_anterior'   => null,
                        'status_novo'       => 'marcada',
                        'created_at'        => $createdAt,
                    ];

                    if (in_array($status, ['selecionado', 'contratado', 'reprovado', 'nao_compareceu', 'recusou_vaga'])) {
                        // marcada → selecionado (triagem)
                        $triagem = (clone $createdAt)->addDays(rand(1, 5));
                        $historico[] = [
                            'candidato_vaga_id' => $cv->id,
                            'status_anterior'   => 'marcada',
                            'status_novo'       => 'selecionado',
                            'created_at'        => $triagem,
                        ];
                    }

                    if ($status === 'contratado') {
                        // selecionado → contratado
                        $contratacao = (clone $createdAt)->addDays(rand(8, 30));
                        if ($contratacao->isAfter(now())) $contratacao = now();
                        $historico[] = [
                            'candidato_vaga_id' => $cv->id,
                            'status_anterior'   => 'selecionado',
                            'status_novo'       => 'contratado',
                            'created_at'        => $contratacao,
                        ];
                    } elseif ($status === 'reprovado') {
                        $reprovacao = (clone $createdAt)->addDays(rand(5, 15));
                        if ($reprovacao->isAfter(now())) $reprovacao = now();
                        $historico[] = [
                            'candidato_vaga_id' => $cv->id,
                            'status_anterior'   => 'selecionado',
                            'status_novo'       => 'reprovado',
                            'created_at'        => $reprovacao,
                        ];
                    } elseif ($status === 'nao_compareceu') {
                        $historico[] = [
                            'candidato_vaga_id' => $cv->id,
                            'status_anterior'   => 'selecionado',
                            'status_novo'       => 'nao_compareceu',
                            'created_at'        => (clone $createdAt)->addDays(rand(4, 10)),
                        ];
                    } elseif ($status === 'recusou_vaga') {
                        $historico[] = [
                            'candidato_vaga_id' => $cv->id,
                            'status_anterior'   => 'selecionado',
                            'status_novo'       => 'recusou_vaga',
                            'created_at'        => (clone $createdAt)->addDays(rand(6, 18)),
                        ];
                    } elseif ($status === 'desclassificado') {
                        $historico[] = [
                            'candidato_vaga_id' => $cv->id,
                            'status_anterior'   => 'marcada',
                            'status_novo'       => 'desclassificado',
                            'created_at'        => (clone $createdAt)->addDays(rand(1, 5)),
                        ];
                    }

                    // Inserir histórico em batch
                    DB::table('candidato_vaga_historico')->insert($historico);
                }
            }
        });

        // ──────────────────────────────────────────────
        // 6. Criar metas de recrutadores (últimos 3 meses)
        // ──────────────────────────────────────────────
        foreach ($allRecrutadores as $userId) {
            for ($m = 0; $m < 3; $m++) {
                $date = Carbon::now()->subMonths($m);
                MetaRecrutador::updateOrCreate(
                    ['user_id' => $userId, 'mes' => $date->month, 'ano' => $date->year],
                    [
                        'meta_contratacoes' => rand(3, 8),
                        'meta_entrevistas'  => rand(10, 25),
                    ]
                );
            }
        }

        $totalCv = CandidatoVaga::count();
        $totalEntrevistas = Entrevista::count();
        $totalHistorico = DB::table('candidato_vaga_historico')->count();
        $totalMetas = MetaRecrutador::count();

        $this->command->info("✅ Relatórios Seeder concluído:");
        $this->command->info("   → {$totalCv} registros em candidato_vaga");
        $this->command->info("   → {$totalEntrevistas} entrevistas");
        $this->command->info("   → {$totalHistorico} registros de histórico");
        $this->command->info("   → {$totalMetas} metas de recrutadores");
    }
}
