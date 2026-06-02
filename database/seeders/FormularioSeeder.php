<?php

namespace Database\Seeders;

use App\Models\Alternativa;
use App\Models\Formulario;
use App\Models\Pergunta;
use Illuminate\Database\Seeder;

class FormularioSeeder extends Seeder
{
    public function run(): void
    {
        $formularios = [
            [
                'titulo_formulario' => 'Avaliação Front-end',
                'descricao' => 'Teste das capacidades de um desenvolvedor front-end React.',
                'requisitos' => 'React, Tailwind e JavaScript moderno.',
                'posto' => 'Desenvolvedor Front-end Júnior',
                'perguntas' => [
                    $this->pergunta('Qual hook é utilizado para estado local no React?', 'useState', ['useEffect', 'useMemo']),
                    $this->pergunta('Qual método é mais comum para renderizar listas em React?', 'map()', ['filter()', 'reduce()']),
                    $this->pergunta('Como dados são enviados de um componente pai para um filho?', 'Props', ['State', 'Refs']),
                    $this->pergunta('Qual hook é usado para efeitos colaterais?', 'useEffect', ['useContext', 'useReducer']),
                ],
            ],
            [
                'titulo_formulario' => 'Triagem Inicial - Administrativo',
                'descricao' => 'Conhecimentos básicos de rotinas administrativas.',
                'requisitos' => 'Pacote Office, organização e atendimento.',
                'posto' => 'Auxiliar Administrativo',
                'perguntas' => [
                    $this->pergunta('O que significa a sigla RH?', 'Recursos Humanos', ['Registro de Horas', 'Relação Hierárquica']),
                    $this->pergunta('Qual software é mais comum para edição de planilhas?', 'Microsoft Excel', ['Microsoft Word', 'Adobe Photoshop']),
                    $this->pergunta('Como informações sigilosas da empresa devem ser tratadas?', 'Com sigilo e acesso restrito', ['Compartilhando com qualquer colega', 'Publicando em grupos externos']),
                    $this->pergunta('Como um auxiliar administrativo deve lidar com atendimento?', 'Com empatia, educação e eficiência', ['De forma apressada', 'Repassando tudo sem analisar']),
                ],
            ],
            [
                'titulo_formulario' => 'Triagem Back-end PHP',
                'descricao' => 'Avaliação de fundamentos de Laravel e PHP.',
                'requisitos' => 'PHP, Laravel, APIs REST e MySQL.',
                'posto' => 'Desenvolvedor Back-end Júnior',
                'perguntas' => [
                    $this->pergunta('Qual framework PHP é usado neste projeto?', 'Laravel', ['Symfony UX', 'CodeIgniter Legacy']),
                    $this->pergunta('Qual comando cria uma migration no Laravel?', 'php artisan make:migration', ['php artisan db:migrate:new', 'php artisan schema:create']),
                    $this->pergunta('Qual ORM é padrão no Laravel?', 'Eloquent', ['Doctrine DBAL apenas', 'Prisma']),
                    $this->pergunta('Onde ficam as rotas web em um projeto Laravel?', 'routes/web.php', ['bootstrap/routes.php', 'app/Routes/web.php']),
                ],
            ],
            [
                'titulo_formulario' => 'Atendimento ao Cliente',
                'descricao' => 'Triagem comportamental e operacional para atendimento.',
                'requisitos' => 'Comunicação clara, empatia e foco em solução.',
                'posto' => 'Analista de Atendimento',
                'perguntas' => [
                    $this->pergunta('Ao receber uma reclamação, qual deve ser a primeira atitude?', 'Ouvir com atenção e entender o contexto', ['Encerrar rapidamente o contato', 'Transferir sem registrar nada']),
                    $this->pergunta('O registro do atendimento é importante porque:', 'Cria histórico e ajuda no acompanhamento', ['Substitui o contato com o cliente', 'É opcional em qualquer situação']),
                    $this->pergunta('Escuta ativa significa:', 'Prestar atenção, confirmar entendimento e responder com clareza', ['Responder antes do cliente terminar', 'Ler respostas prontas sem adaptar']),
                    $this->pergunta('Em um conflito, o foco do analista deve ser:', 'Resolver com respeito e dentro da política da empresa', ['Vencer a discussão', 'Ignorar a necessidade do cliente']),
                ],
            ],
            [
                'titulo_formulario' => 'Operação Logística',
                'descricao' => 'Conhecimentos práticos de operação e armazenagem.',
                'requisitos' => 'Organização, conferência e rotinas de estoque.',
                'posto' => 'Assistente de Logística',
                'perguntas' => [
                    $this->pergunta('FIFO em estoque significa:', 'Primeiro que entra, primeiro que sai', ['Último que entra, primeiro que sai', 'Separação por cor do produto']),
                    $this->pergunta('Durante a conferência de mercadoria, deve-se validar:', 'Quantidade, integridade e documentação', ['Apenas a cor da embalagem', 'Só o nome do fornecedor']),
                    $this->pergunta('Picking é o processo de:', 'Separar itens para atendimento de pedidos', ['Registrar férias do time', 'Solicitar orçamento ao cliente']),
                    $this->pergunta('O uso de EPI na operação serve para:', 'Reduzir riscos e cumprir normas de segurança', ['Aumentar a velocidade do inventário', 'Substituir treinamento']),
                ],
            ],
            [
                'titulo_formulario' => 'Analista de RH',
                'descricao' => 'Avaliação de recrutamento, seleção e rotinas de pessoas.',
                'requisitos' => 'Triagem, entrevistas e noções de LGPD.',
                'posto' => 'Analista de Recursos Humanos',
                'perguntas' => [
                    $this->pergunta('Na triagem curricular, o ideal é priorizar:', 'Aderência real aos requisitos da vaga', ['Apenas a faculdade mais conhecida', 'A foto do currículo']),
                    $this->pergunta('Feedback ao candidato deve ser:', 'Claro, respeitoso e objetivo', ['Inexistente para economizar tempo', 'Enviado com informações sigilosas de outros candidatos']),
                    $this->pergunta('Onboarding bem estruturado ajuda a:', 'Acelerar adaptação e reduzir dúvidas iniciais', ['Eliminar a necessidade de liderança', 'Substituir treinamentos técnicos']),
                    $this->pergunta('Pela LGPD, dados de candidatos devem ser:', 'Tratados com finalidade definida e acesso controlado', ['Compartilhados livremente entre áreas', 'Usados sem critério depois do processo']),
                ],
            ],
            [
                'titulo_formulario' => 'Suporte Técnico',
                'descricao' => 'Conhecimentos básicos de atendimento e diagnóstico técnico.',
                'requisitos' => 'Atendimento, troubleshooting e registro de incidentes.',
                'posto' => 'Analista de Suporte N1',
                'perguntas' => [
                    $this->pergunta('Ao abrir um chamado, a primeira etapa é:', 'Coletar sintomas e contexto do problema', ['Trocar o equipamento sem análise', 'Encerrar o chamado preventivamente']),
                    $this->pergunta('Reset de senha deve seguir:', 'Procedimento seguro com validação do usuário', ['Qualquer pedido informal por chat', 'Compartilhamento da senha padrão do setor']),
                    $this->pergunta('Backup é importante porque:', 'Ajuda na recuperação de dados em incidentes', ['Dispensa controle de acesso', 'Substitui antivírus']),
                    $this->pergunta('Hardware se refere a:', 'Componentes físicos do equipamento', ['Programas instalados', 'Apenas acesso à internet']),
                ],
            ],
            [
                'titulo_formulario' => 'Financeiro Júnior',
                'descricao' => 'Triagem de rotinas básicas financeiras.',
                'requisitos' => 'Contas a pagar/receber e conciliação bancária.',
                'posto' => 'Assistente Financeiro',
                'perguntas' => [
                    $this->pergunta('Fluxo de caixa representa:', 'Entradas e saídas financeiras ao longo do tempo', ['Somente despesas fixas', 'Apenas salários do mês']),
                    $this->pergunta('Conciliação bancária serve para:', 'Conferir se lançamentos internos batem com o extrato', ['Criar contratos automaticamente', 'Substituir aprovação de pagamento']),
                    $this->pergunta('Contas a pagar trata de:', 'Obrigações financeiras da empresa', ['Leads comerciais', 'Gestão de benefícios']),
                    $this->pergunta('Uma nota fiscal deve ser conferida antes do pagamento para validar:', 'Dados do fornecedor, valores e vencimento', ['Somente a cor do documento', 'A assinatura do cliente final']),
                ],
            ],
            [
                'titulo_formulario' => 'Marketing Digital',
                'descricao' => 'Avaliação introdutória de métricas e campanhas.',
                'requisitos' => 'Conteúdo, mídia paga e análise de indicadores.',
                'posto' => 'Assistente de Marketing',
                'perguntas' => [
                    $this->pergunta('KPI é:', 'Um indicador-chave de desempenho', ['Um tipo de contrato PJ', 'Uma etapa do fechamento financeiro']),
                    $this->pergunta('CTA em uma peça digital é:', 'Um convite objetivo para a próxima ação', ['Um relatório contábil', 'Um filtro de dashboard']),
                    $this->pergunta('Tráfego orgânico é aquele que:', 'Chega sem mídia paga direta', ['Vem exclusivamente de anúncios', 'Só existe em e-mail marketing']),
                    $this->pergunta('O funil de marketing ajuda a:', 'Entender a jornada até a conversão', ['Substituir atendimento comercial', 'Definir escalas de trabalho']),
                ],
            ],
            [
                'titulo_formulario' => 'Assistente Comercial',
                'descricao' => 'Triagem para rotina comercial e relacionamento com leads.',
                'requisitos' => 'CRM, follow-up e organização de pipeline.',
                'posto' => 'Assistente Comercial',
                'perguntas' => [
                    $this->pergunta('CRM é usado principalmente para:', 'Organizar relacionamento e histórico de clientes', ['Emitir folha de pagamento', 'Agendar férias automaticamente']),
                    $this->pergunta('Follow-up comercial significa:', 'Acompanhar o contato após uma interação inicial', ['Cancelar oportunidades antigas sem análise', 'Encerrar uma negociação no primeiro não']),
                    $this->pergunta('Uma proposta comercial deve ser:', 'Clara, objetiva e alinhada à necessidade do cliente', ['Genérica e sem prazo', 'Enviada sem revisar valores']),
                    $this->pergunta('Pipeline comercial ajuda a visualizar:', 'Em que etapa cada oportunidade está', ['Somente o faturamento passado', 'A escala de entrevistas do RH']),
                ],
            ],
        ];

        foreach ($formularios as $dadosFormulario) {
            $perguntas = $dadosFormulario['perguntas'];
            unset($dadosFormulario['perguntas']);

            $dadosFormulario['threshold'] = $dadosFormulario['threshold'] ?? 3;

            $formulario = Formulario::updateOrCreate(
                ['titulo_formulario' => $dadosFormulario['titulo_formulario']],
                $dadosFormulario
            );

            $formulario->perguntas()->delete();

            foreach ($perguntas as $dadosPergunta) {
                $alternativas = $dadosPergunta['alternativas'];
                unset($dadosPergunta['alternativas']);

                $pergunta = Pergunta::create([
                    'formulario_id' => $formulario->id,
                    'enunciado' => $dadosPergunta['enunciado'],
                ]);

                foreach ($alternativas as $alternativa) {
                    Alternativa::create([
                        'pergunta_id' => $pergunta->id,
                        'texto' => $alternativa['texto'],
                        'correta' => $alternativa['correta'],
                    ]);
                }
            }
        }
    }

    private function pergunta(string $enunciado, string $correta, array $incorretas): array
    {
        return [
            'enunciado' => $enunciado,
            'alternativas' => [
                ['texto' => $incorretas[0], 'correta' => false],
                ['texto' => $correta, 'correta' => true],
                ['texto' => $incorretas[1], 'correta' => false],
            ],
        ];
    }
}
