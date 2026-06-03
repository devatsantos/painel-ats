import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';

const STATUS_CONFIG = {
    marcada:        { label: 'Inscrito',         color: 'bg-blue-100 text-blue-700',      step: 1 },
    selecionado:    { label: 'Aprovado no quiz', color: 'bg-orange-100 text-orange-700',  step: 2 },
    contratado:     { label: 'Contratado',       color: 'bg-emerald-100 text-emerald-700', step: 4 },
    reprovado:      { label: 'Não aprovado',     color: 'bg-red-100 text-red-600',        step: -1 },
    recusou_vaga:   { label: 'Recusou vaga',     color: 'bg-yellow-100 text-yellow-700',  step: -1 },
    sem_vaga:       { label: 'Sem vaga',         color: 'bg-gray-100 text-gray-600',      step: -1 },
    nao_compareceu: { label: 'Não compareceu',   color: 'bg-pink-100 text-pink-700',      step: -1 },
};

const TIMELINE_STEPS = [
    { key: 'inscrito',   label: 'Inscrito',         icon: '📋' },
    { key: 'aprovado',   label: 'Aprovado no quiz', icon: '✅' },
    { key: 'entrevista', label: 'Entrevista',       icon: '🗓️' },
    { key: 'resultado',  label: 'Resultado',        icon: '🎯' },
];

export default function PortalCandidatura({ vaga, status, entrevista, dataCandidatura }) {
    const { auth } = usePage().props;
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.marcada;

    // Determina o step atual da timeline
    let currentStep = 0;
    if (status === 'marcada') currentStep = 1;
    if (status === 'selecionado') currentStep = 2;
    if (entrevista) currentStep = 3;
    if (status === 'contratado') currentStep = 4;

    // Status negativos
    const isNegativo = cfg.step === -1;

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Head title={`${vaga.titulo} — Portal do Candidato`} />

            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#071F30] flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-900 leading-tight">Portal do Candidato</p>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider">AT & Santos</p>
                        </div>
                    </div>

                    <nav className="flex items-center gap-1">
                        <Link href="/portal/dashboard" className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                            Início
                        </Link>
                        <Link href="/portal/perfil" className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                            Perfil
                        </Link>
                        <Link href="/logout" method="post" as="button" className="ml-2 px-3 py-2 text-sm font-medium text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                            Sair
                        </Link>
                    </nav>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">

                {/* Voltar */}
                <Link href="/portal/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-[#071F30] transition-colors font-medium">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Voltar ao painel
                </Link>

                {/* Header da Vaga */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 pt-6 pb-4 border-b border-gray-100">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h1 className="text-xl font-extrabold text-gray-900">{vaga.titulo}</h1>
                                <p className="text-sm text-gray-400 mt-1">Candidatura realizada em {dataCandidatura}</p>
                            </div>
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${cfg.color} shrink-0`}>
                                {cfg.label}
                            </span>
                        </div>
                    </div>

                    {/* Timeline de progresso */}
                    {!isNegativo && (
                        <div className="px-6 py-5 bg-gray-50/50 border-b border-gray-100">
                            <div className="flex items-center justify-between">
                                {TIMELINE_STEPS.map((step, i) => {
                                    const isActive = i < currentStep;
                                    const isCurrent = i === currentStep - 1;
                                    return (
                                        <React.Fragment key={step.key}>
                                            <div className="flex flex-col items-center gap-1.5">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 transition-all ${
                                                    isActive
                                                        ? 'border-[#071F30] bg-[#071F30]/10'
                                                        : 'border-gray-200 bg-white'
                                                } ${isCurrent ? 'ring-4 ring-[#071F30]/20 scale-110' : ''}`}>
                                                    {step.icon}
                                                </div>
                                                <span className={`text-xs font-medium ${isActive ? 'text-[#071F30]' : 'text-gray-400'}`}>
                                                    {step.label}
                                                </span>
                                            </div>
                                            {i < TIMELINE_STEPS.length - 1 && (
                                                <div className={`flex-1 h-0.5 mx-2 rounded-full transition-colors ${
                                                    i < currentStep - 1 ? 'bg-[#071F30]' : 'bg-gray-200'
                                                }`} />
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Informações da vaga */}
                    <div className="p-6 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-50 rounded-lg">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Local</p>
                                    <p className="text-sm font-semibold text-gray-800">{vaga.local || '—'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-50 rounded-lg">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Horário</p>
                                    <p className="text-sm font-semibold text-gray-800">{vaga.horario || '—'} · {vaga.escala || ''}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-50 rounded-lg">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Salário</p>
                                    <p className="text-sm font-semibold text-gray-800">{vaga.salario || '—'}</p>
                                </div>
                            </div>

                            {(vaga.va || vaga.vr || vaga.vt) && (
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-50 rounded-lg">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Benefícios</p>
                                        <div className="flex flex-wrap gap-1.5 mt-0.5">
                                            {vaga.va && <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md font-medium">VA: {vaga.va}</span>}
                                            {vaga.vr && <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md font-medium">VR: {vaga.vr}</span>}
                                            {vaga.vt && <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md font-medium">VT: {vaga.vt}</span>}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {vaga.descricao && (
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2">Descrição</p>
                                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{vaga.descricao}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Card Entrevista */}
                {entrevista && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
                            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                <span className="w-2 h-5 bg-emerald-500 rounded-full" />
                                Entrevista Agendada
                            </h2>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Data e Horário</p>
                                    <p className="text-sm font-bold text-gray-900">{entrevista.data_hora}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">{entrevista.data_relativa}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Tipo</p>
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                                        entrevista.tipo === 'Online' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                                    }`}>
                                        {entrevista.tipo === 'Online' ? '💻' : '🏢'} {entrevista.tipo}
                                    </span>
                                </div>
                                {entrevista.entrevistador && (
                                    <div>
                                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Entrevistador</p>
                                        <p className="text-sm font-semibold text-gray-800">{entrevista.entrevistador}</p>
                                    </div>
                                )}
                                {entrevista.link_meet && (
                                    <div>
                                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Link da Reunião</p>
                                        <a
                                            href={entrevista.link_meet}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 text-sm font-semibold text-[#071F30] hover:underline"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                            Abrir link da reunião
                                        </a>
                                    </div>
                                )}
                            </div>
                            {entrevista.observacao && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Observações</p>
                                    <p className="text-sm text-gray-600">{entrevista.observacao}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
}
