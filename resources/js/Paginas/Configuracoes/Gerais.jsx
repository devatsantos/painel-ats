import React from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import Sidebar from '../Componentes/Index';

function FlashMessage() {
    const { flash } = usePage().props;
    if (!flash?.success && !flash?.error) return null;
    return (
        <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium ${flash.success ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {flash.success || flash.error}
        </div>
    );
}

export default function Gerais({ prazos }) {
    const { data, setData, put, processing, errors } = useForm({
        otp_expira_minutos: prazos.otp_expira_minutos,
        token_expira_dias: prazos.token_expira_dias,
        selecao_expira_dias: prazos.selecao_expira_dias,
        quarentena_reprovacao_dias: prazos.quarentena_reprovacao_dias,
        entrevista_duracao_minutos: prazos.entrevista_duracao_minutos,
    });

    const submit = (e) => {
        e.preventDefault();
        put('/configuracoes/gerais', {
            preserveScroll: true,
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans">
            <Head title="Configurações Gerais - Painel RH" />
            <Sidebar />

            <main className="flex-1 p-6 md:pl-[280px] transition-all duration-300">
                <div className="max-w-4xl mx-auto space-y-6">
                    {/* Header */}
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Configurações Gerais</h1>
                        <p className="text-sm text-gray-400 mt-1">Gerencie os prazos, durações e regras de expiração do processo seletivo</p>
                    </div>

                    <FlashMessage />

                    <form onSubmit={submit} className="space-y-6">
                        <div className="ds-card-static p-6 md:p-8 space-y-6">
                            
                            {/* Seção: Segurança e Acesso */}
                            <div>
                                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    Acesso e Segurança
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    
                                    {/* OTP Expiração */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">
                                            Expiração do Código OTP
                                        </label>
                                        <p className="text-xs text-gray-400">Tempo de validade do código de verificação enviado por e-mail/WhatsApp para login temporário.</p>
                                        <div className="relative flex items-center">
                                            <input
                                                type="number"
                                                value={data.otp_expira_minutos}
                                                onChange={e => setData('otp_expira_minutos', e.target.value)}
                                                className="ds-input pr-20"
                                                min="1"
                                                required
                                            />
                                            <span className="absolute right-3 text-xs font-semibold text-gray-400 select-none">minutos</span>
                                        </div>
                                        {errors.otp_expira_minutos && <p className="text-xs text-red-600 font-medium">{errors.otp_expira_minutos}</p>}
                                    </div>

                                    {/* Token Expiração */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">
                                            Validade do Token do Candidato
                                        </label>
                                        <p className="text-xs text-gray-400">Duração do login persistente/token que mantém o candidato conectado no portal sem precisar de novo OTP.</p>
                                        <div className="relative flex items-center">
                                            <input
                                                type="number"
                                                value={data.token_expira_dias}
                                                onChange={e => setData('token_expira_dias', e.target.value)}
                                                className="ds-input pr-16"
                                                min="1"
                                                required
                                            />
                                            <span className="absolute right-3 text-xs font-semibold text-gray-400 select-none">dias</span>
                                        </div>
                                        {errors.token_expira_dias && <p className="text-xs text-red-600 font-medium">{errors.token_expira_dias}</p>}
                                    </div>

                                </div>
                            </div>

                            <hr className="border-gray-100" />

                            {/* Seção: Fluxo da Candidatura */}
                            <div>
                                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    Prazos e Regras do Processo
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    
                                    {/* Prazo de agendamento */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">
                                            Prazo para Agendar Entrevista
                                        </label>
                                        <p className="text-xs text-gray-400">Dias que o candidato tem para realizar o agendamento de sua entrevista no portal após ter sido pré-selecionado.</p>
                                        <div className="relative flex items-center">
                                            <input
                                                type="number"
                                                value={data.selecao_expira_dias}
                                                onChange={e => setData('selecao_expira_dias', e.target.value)}
                                                className="ds-input pr-16"
                                                min="1"
                                                required
                                            />
                                            <span className="absolute right-3 text-xs font-semibold text-gray-400 select-none">dias</span>
                                        </div>
                                        {errors.selecao_expira_dias && <p className="text-xs text-red-600 font-medium">{errors.selecao_expira_dias}</p>}
                                    </div>

                                    {/* Quarentena */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">
                                            Quarentena de Reprovação
                                        </label>
                                        <p className="text-xs text-gray-400">Tempo necessário que o candidato deve aguardar após ser reprovado para poder aplicar a uma nova vaga no portal.</p>
                                        <div className="relative flex items-center">
                                            <input
                                                type="number"
                                                value={data.quarentena_reprovacao_dias}
                                                onChange={e => setData('quarentena_reprovacao_dias', e.target.value)}
                                                className="ds-input pr-16"
                                                min="0"
                                                required
                                            />
                                            <span className="absolute right-3 text-xs font-semibold text-gray-400 select-none">dias</span>
                                        </div>
                                        {errors.quarentena_reprovacao_dias && <p className="text-xs text-red-600 font-medium">{errors.quarentena_reprovacao_dias}</p>}
                                    </div>

                                </div>
                            </div>

                            <hr className="border-gray-100" />

                            {/* Seção: Agenda e Entrevistas */}
                            <div>
                                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    Vídeoconferência
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    
                                    {/* Duração da entrevista */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">
                                            Duração Padrão da Entrevista
                                        </label>
                                        <p className="text-xs text-gray-400">Tempo estimado de duração para a sala de videoconferência gerada automaticamente para os candidatos.</p>
                                        <div className="relative flex items-center">
                                            <input
                                                type="number"
                                                value={data.entrevista_duracao_minutos}
                                                onChange={e => setData('entrevista_duracao_minutos', e.target.value)}
                                                className="ds-input pr-20"
                                                min="5"
                                                required
                                            />
                                            <span className="absolute right-3 text-xs font-semibold text-gray-400 select-none">minutos</span>
                                        </div>
                                        {errors.entrevista_duracao_minutos && <p className="text-xs text-red-600 font-medium">{errors.entrevista_duracao_minutos}</p>}
                                    </div>

                                </div>
                            </div>

                        </div>

                        {/* Botão de Salvar */}
                        <div className="flex items-center justify-end">
                            <button
                                type="submit"
                                disabled={processing}
                                className="ds-btn ds-btn-primary animate-fade-in"
                            >
                                {processing ? (
                                    <>
                                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                        </svg>
                                        Salvando...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                        Salvar Alterações
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
