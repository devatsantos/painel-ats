<?php

namespace Database\Seeders;

use App\Models\Candidatos;
use Illuminate\Database\Seeder;

class TalentoSeeder extends Seeder
{
    public function run(): void
    {
        $talentos = [
            ['nome' => 'Talento Promissor', 'cpf' => '123.456.789-00', 'email' => 'talento.promissor@exemplo.com', 'telefone' => '(11) 98888-8881', 'nivel_escolaridade' => 'Superior em Engenharia de Software', 'regiao' => 'Sao Paulo, SP',          'data_nascimento' => '1994-06-10'],
            ['nome' => 'Maria Silva',       'cpf' => '987.654.321-00', 'email' => 'maria.silva@exemplo.com',       'telefone' => '(11) 98888-8882', 'nivel_escolaridade' => 'Superior em Administracao',          'regiao' => 'Grande ABC',               'data_nascimento' => '1991-01-27'],
            ['nome' => 'Rafael Pires',      'cpf' => '159.357.258-46', 'email' => 'rafael.pires@exemplo.com',      'telefone' => '(11) 98888-8883', 'nivel_escolaridade' => 'Tecnologo em Logistica',             'regiao' => 'Guarulhos',                'data_nascimento' => '1997-10-15'],
            ['nome' => 'Camila Duarte',     'cpf' => '753.951.654-82', 'email' => 'camila.duarte@exemplo.com',     'telefone' => '(11) 98888-8884', 'nivel_escolaridade' => 'Superior em Psicologia',             'regiao' => 'Osasco',                   'data_nascimento' => '1996-03-08'],
            ['nome' => 'Leonardo Prado',    'cpf' => '246.810.121-41', 'email' => 'leonardo.prado@exemplo.com',    'telefone' => '(11) 98888-8885', 'nivel_escolaridade' => 'Superior em Marketing',              'regiao' => 'Campinas',                 'data_nascimento' => '1992-07-22'],
            ['nome' => 'Juliana Batista',   'cpf' => '321.654.987-10', 'email' => 'juliana.batista@exemplo.com',   'telefone' => '(11) 98888-8886', 'nivel_escolaridade' => 'Superior em Gestao Financeira',      'regiao' => 'Santo Andre',              'data_nascimento' => '1989-11-04'],
            ['nome' => 'Paulo Henrique',    'cpf' => '654.987.321-09', 'email' => 'paulo.henrique@exemplo.com',    'telefone' => '(11) 98888-8887', 'nivel_escolaridade' => 'Tecnico em Informatica',             'regiao' => 'Sao Bernardo do Campo',    'data_nascimento' => '2000-08-30'],
            ['nome' => 'Vanessa Lopes',     'cpf' => '741.852.963-14', 'email' => 'vanessa.lopes@exemplo.com',     'telefone' => '(11) 98888-8888', 'nivel_escolaridade' => 'Superior em Recursos Humanos',       'regiao' => 'Sorocaba',                 'data_nascimento' => '1993-02-18'],
            ['nome' => 'Marcos Vinicius',   'cpf' => '852.741.963-25', 'email' => 'marcos.vinicius@exemplo.com',   'telefone' => '(11) 98888-8889', 'nivel_escolaridade' => 'Superior em Administracao',          'regiao' => 'Jundiai',                  'data_nascimento' => '1987-05-12'],
            ['nome' => 'Aline Farias',      'cpf' => '963.258.741-36', 'email' => 'aline.farias@exemplo.com',      'telefone' => '(11) 98888-8890', 'nivel_escolaridade' => 'Superior em Publicidade',            'regiao' => 'Sao Jose dos Campos',      'data_nascimento' => '1999-09-01'],
        ];

        foreach ($talentos as $talento) {
            Candidatos::updateOrCreate(
                ['cpf' => $talento['cpf']],
                [...$talento, 'banco_de_talentos' => true]
            );
        }
    }
}
