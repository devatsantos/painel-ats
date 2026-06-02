<?php

namespace Database\Seeders;

use App\Models\Candidatos;
use App\Models\Vagas;
use Illuminate\Database\Seeder;

class CandidatoSeeder extends Seeder
{
    public function run(): void
    {
        $vagas = Vagas::orderBy('id')->get();

        if ($vagas->isEmpty()) {
            return;
        }

        $candidatos = [
            ['nome' => 'Ana Souza',          'cpf' => '000.111.222-33', 'email' => 'ana.souza@exemplo.com',       'telefone' => '(11) 99338-2194', 'path_curriculo' => null, 'cep' => '01001-000', 'logradouro' => 'Praca da Se',              'nivel_escolaridade' => 'Superior Completo',   'regiao' => 'Centro',                  'data_nascimento' => '1995-03-22', 'status' => 'marcada'],
            ['nome' => 'Bruno Costa',         'cpf' => '111.222.333-44', 'email' => 'bruno.costa@exemplo.com',      'telefone' => '(11) 99991-0002', 'path_curriculo' => null, 'cep' => '01310-100', 'logradouro' => 'Avenida Paulista',        'nivel_escolaridade' => 'Superior Incompleto', 'regiao' => 'Bela Vista',              'data_nascimento' => '2001-09-11', 'status' => 'selecionado'],
            ['nome' => 'Carla Menezes',        'cpf' => '222.333.444-55', 'email' => 'carla.menezes@exemplo.com',   'telefone' => '(11) 99991-0003', 'path_curriculo' => null, 'cep' => '01509-000', 'logradouro' => 'Rua da Mooca',            'nivel_escolaridade' => 'Tecnico Completo',    'regiao' => 'Mooca',                   'data_nascimento' => '1998-07-14', 'status' => 'contratado'],
            ['nome' => 'Daniel Rocha',         'cpf' => '333.444.555-66', 'email' => 'daniel.rocha@exemplo.com',    'telefone' => '(11) 99991-0004', 'path_curriculo' => null, 'cep' => '02020-000', 'logradouro' => 'Rua Voluntarios da Patria', 'nivel_escolaridade' => 'Superior Completo',   'regiao' => 'Santana',                 'data_nascimento' => '1993-11-30', 'status' => 'reprovado'],
            ['nome' => 'Erika Santos',         'cpf' => '444.555.666-77', 'email' => 'erika.santos@exemplo.com',    'telefone' => '(11) 99991-0005', 'path_curriculo' => null, 'cep' => '03045-000', 'logradouro' => 'Rua Tuiuti',              'nivel_escolaridade' => 'Medio Completo',      'regiao' => 'Tatuape',                 'data_nascimento' => '2000-05-08', 'status' => 'recusou_vaga'],
            ['nome' => 'Fabio Oliveira',        'cpf' => '555.666.777-88', 'email' => 'fabio.oliveira@exemplo.com',  'telefone' => '(11) 99991-0006', 'path_curriculo' => null, 'cep' => '05010-000', 'logradouro' => 'Rua Tito',                'nivel_escolaridade' => 'Superior Completo',   'regiao' => 'Lapa',                    'data_nascimento' => '1990-02-17', 'status' => 'sem_vaga'],
            ['nome' => 'Gabriela Lima',         'cpf' => '666.777.888-99', 'email' => 'gabriela.lima@exemplo.com',   'telefone' => '(11) 99991-0007', 'path_curriculo' => null, 'cep' => '04101-000', 'logradouro' => 'Rua Vergueiro',           'nivel_escolaridade' => 'Pos-graduacao',       'regiao' => 'Vila Mariana',            'data_nascimento' => '1988-09-25', 'status' => 'nao_compareceu'],
            ['nome' => 'Henrique Alves',        'cpf' => '777.888.999-00', 'email' => 'henrique.alves@exemplo.com',  'telefone' => '(11) 99991-0008', 'path_curriculo' => null, 'cep' => '04538-000', 'logradouro' => 'Rua Funchal',             'nivel_escolaridade' => 'Superior Completo',   'regiao' => 'Itaim Bibi',              'data_nascimento' => '1996-12-03', 'status' => 'marcada'],
            ['nome' => 'Isabela Martins',       'cpf' => '888.999.000-11', 'email' => 'isabela.martins@exemplo.com', 'telefone' => '(11) 99991-0009', 'path_curriculo' => null, 'cep' => '04094-000', 'logradouro' => 'Avenida Indianopolis',    'nivel_escolaridade' => 'Tecnico Completo',    'regiao' => 'Saude',                   'data_nascimento' => '1999-04-19', 'status' => 'selecionado'],
            ['nome' => 'Joao Pedro Ribeiro',    'cpf' => '999.888.777-66', 'email' => 'joao.ribeiro@exemplo.com',    'telefone' => '(11) 99991-0010', 'path_curriculo' => null, 'cep' => '07097-000', 'logradouro' => 'Avenida Tiradentes',      'nivel_escolaridade' => 'Superior Incompleto', 'regiao' => 'Centro de Guarulhos',     'data_nascimento' => '2002-08-06', 'status' => 'contratado'],
        ];

        foreach ($candidatos as $indice => $dadosCandidato) {
            $status = $dadosCandidato['status'];
            unset($dadosCandidato['status']);

            $candidato = Candidatos::updateOrCreate(
                ['cpf' => $dadosCandidato['cpf']],
                $dadosCandidato
            );

            $vaga = $vagas[$indice % $vagas->count()];

            $candidato->vagas()->syncWithoutDetaching([
                $vaga->id => ['status' => $status],
            ]);
        }
    }
}
