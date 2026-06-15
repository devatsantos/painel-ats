<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\MensagemWhatsApp;

class MensagensWhatsAppController extends Controller
{
    /**
     * Lista todos os templates.
     */
    public function index()
    {
        $mensagens = MensagemWhatsApp::orderBy('titulo')->get();

        return Inertia::render('Configuracoes/MensagensWhatsApp', [
            'mensagens' => $mensagens,
        ]);
    }

    /**
     * Atualiza um template.
     */
    public function update(Request $request, MensagemWhatsApp $mensagem)
    {
        $validated = $request->validate([
            'conteudo' => 'required|string|max:2000',
        ]);

        $mensagem->update($validated);

        return redirect()->back()->with('success', 'Mensagem atualizada com sucesso.');
    }

    /**
     * Reseta um template para o padrão original.
     */
    public function resetar(MensagemWhatsApp $mensagem)
    {
        $defaults = $this->getDefaults();

        if (isset($defaults[$mensagem->chave])) {
            $mensagem->update(['conteudo' => $defaults[$mensagem->chave]]);
            return redirect()->back()->with('success', 'Mensagem restaurada para o padrão.');
        }

        return redirect()->back()->with('error', 'Template padrão não encontrado.');
    }

    /**
     * Preview: renderiza o template com dados fictícios.
     */
    public function preview(Request $request)
    {
        $request->validate([
            'chave'    => 'required|string',
            'conteudo' => 'required|string',
        ]);

        $dadosExemplo = [
            'nome'          => 'João da Silva',
            'vaga'          => 'Auxiliar de Limpeza',
            'codigo'        => '482913',
            'data'          => '20/06/2026',
            'horario'       => '14:00',
            'tipo'          => 'Presencial',
            'link_meet'     => '',
            'justificativa' => "\n\nMotivo informado pelo recrutador: Conflito de agenda",
            'url_portal'    => config('app.url') . '/portal',
        ];

        $mensagem = $request->conteudo;
        foreach ($dadosExemplo as $var => $valor) {
            $mensagem = str_replace("{{$var}}", $valor, $mensagem);
        }
        $mensagem = preg_replace('/\{[a-z_]+\}/', '', $mensagem);
        $mensagem = preg_replace('/\n{3,}/', "\n\n", $mensagem);

        return response()->json(['preview' => trim($mensagem)]);
    }

    /**
     * Mensagens padrão para restauração.
     */
    private function getDefaults(): array
    {
        return [
            'otp_candidatura' => "Olá, {nome}! 👋\n\nSeu código de verificação para continuar a candidatura à vaga *{vaga}* é:\n\n*{codigo}*\n\nEste código expira em *15 minutos*. Não compartilhe com ninguém.",
            'otp_portal' => "Olá, {nome}! 👋\n\nSeu código de acesso ao portal do candidato é:\n\n*{codigo}*\n\nEste código expira em *15 minutos*. Não compartilhe com ninguém.",
            'entrevista_agendada' => "Olá {nome}! 🎉\n\nSua entrevista para a vaga *{vaga}* foi confirmada!\n\n📅 Data: {data}\n⏰ Horário: {horario}\n📍 Tipo: {tipo}\n{link_meet}\nQualquer dúvida, entre em contato conosco. Boa sorte!",
            'entrevista_adiada' => "Olá, {nome}! 🗓️\n\nSeu agendamento de entrevista para a vaga *{vaga}* precisou ser adiado/reagendado.{justificativa}\n\nPor favor, acesse o portal do candidato para selecionar uma nova data e horário:\n🔗 {url_portal}",
            'otp_email' => "Olá, {nome}! 👋\n\nSeu código de acesso ao processo seletivo é:\n\n{codigo}\n\nEste código expira em 15 minutos. Não compartilhe com ninguém.",
        ];
    }
}
