<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $usuarios = [
            ['nome' => 'Administrador RH', 'cpf' => '000.000.000-00', 'role' => 'admin'],
            ['nome' => 'Recrutador Teste', 'cpf' => '111.111.111-11', 'role' => 'recrutador'],
            ['nome' => 'Larissa Almeida', 'cpf' => '222.222.222-22', 'role' => 'recrutador'],
            ['nome' => 'Caio Martins', 'cpf' => '333.333.333-33', 'role' => 'recrutador'],
            ['nome' => 'Bruna Freitas', 'cpf' => '444.444.444-44', 'role' => 'recrutador'],
            ['nome' => 'Diego Rocha', 'cpf' => '555.555.555-55', 'role' => 'coordenador'],
            ['nome' => 'Fernanda Lima', 'cpf' => '666.666.666-66', 'role' => 'coordenador'],
            ['nome' => 'Ricardo Nunes', 'cpf' => '777.777.777-77', 'role' => 'coordenador'],
            ['nome' => 'Patricia Gomes', 'cpf' => '888.888.888-88', 'role' => 'coordenador'],
            ['nome' => 'Thiago Sales', 'cpf' => '999.999.999-99', 'role' => 'coordenador'],
            ['nome' => 'Coordenador Teste', 'cpf' => '000.111.333-44', 'role' => 'coordenador'],
        ];

        foreach ($usuarios as $usuario) {
            User::updateOrCreate(
                ['cpf' => $usuario['cpf']],
                [
                    'nome' => $usuario['nome'],
                    'password' => Hash::make('senha123'),
                    'role' => $usuario['role'],
                ]
            );
        }
    }
}
