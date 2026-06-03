import React, { useState } from "react";
import Sidebar from "../Componentes/Index.jsx"
import { Head } from '@inertiajs/react';

function saudacao() {
    const h = new Date().getHours();
    if (h < 12) return 'Bom dia';
    if (h < 18) return 'Boa tarde';
    return 'Boa noite';
}

function dataAtual() {
    return new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

const TIPO_LABEL = { presencial: 'Presencial', online: 'Online', hibrido: 'Híbrido' };
const TIPO_COLOR = {
    presencial: 'bg-blue-100 text-blue-700',
    online:     'bg-purple-100 text-purple-700',
    hibrido:    'bg-teal-100 text-teal-700',
};

const STATUS_CONFIG = {
    selecionado:   { label: 'Selecionados',   color: 'bg-orange-100 text-orange-700',  dot: 'bg-orange-400' },
    contratado:    { label: 'Contratados',    color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-400' },
    reprovado:     { label: 'Reprovados',     color: 'bg-red-100 text-red-600',        dot: 'bg-red-400' },
    recusou_vaga:  { label: 'Recusaram vaga', color: 'bg-yellow-100 text-yellow-700',  dot: 'bg-yellow-400' },
    sem_vaga:      { label: 'Sem vaga',       color: 'bg-gray-100 text-gray-600',      dot: 'bg-gray-400' },
    nao_compareceu:{ label: 'Não compareceu', color: 'bg-pink-100 text-pink-700',      dot: 'bg-pink-400' },
};

const CORES_PROGRESSO = [
    'bg-violet-500',
    'bg-blue-500',
    'bg-emerald-500',
    'bg-amber-500',
    'bg-indigo-500',
    'bg-rose-500',
    'bg-teal-500',
];

export default function Dashboard({
    totalEntrevistasMes,
    variacaoEntrevistas,
    totalVagas,
    totalCandidatos,
    totalContratados,
    candidatosPorStatus,
    aguardandoEntrevista,
    proximasEntrevistas,
    vagasDestaque,
    atividadesRecentes,
}) {
    const [painelAberto, setPainelAberto] = useState(false);


    return (
        <>
        <div className="min-h-screen bg-gray-50 flex font-sans">
            <Head title="Dashboard - Painel RH" />
            <Sidebar />

            <main className="flex-1 p-6 md:pl-[280px] transition-all duration-300">
                <div className="max-w-7xl mx-auto space-y-6">

                    {/* â”€â”€ Header â”€â”€ */}
                    <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                            <p className="text-sm font-medium text-gray-400 capitalize">{dataAtual()}</p>
                            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight mt-0.5">{saudacao()}, bem-vindo de volta!</h1>
                        </div>
                        <div className="flex gap-2">
                            <a href="/vagas?modal=true" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0C4773] text-white text-sm font-semibold hover:bg-[#007EAE] transition-colors shadow-sm">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                                Nova Vaga
                            </a>
                            <a href="/agenda?modal=true" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                Bloquear Agenda
                            </a>
                        </div>
                    </header>

                    {/* â”€â”€ KPI Cards â”€â”€ */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

                        {/* Entrevistas no mês */}
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Entrevistas no mês</p>
                                <h3 className="text-3xl font-bold text-[#0C4773]">{totalEntrevistasMes}</h3>
                                <p className="text-xs font-medium mt-2 flex items-center gap-1">
                                    {variacaoEntrevistas !== null && variacaoEntrevistas !== undefined ? (
                                        <>
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={variacaoEntrevistas >= 0 ? "M5 10l7-7m0 0l7 7m-7-7v18" : "M19 14l-7 7m0 0l-7-7m7 7V3"} />
                                            </svg>
                                            <span className={variacaoEntrevistas >= 0 ? "text-emerald-600" : "text-red-500"}>
                                                {variacaoEntrevistas >= 0 ? '+' : ''}{variacaoEntrevistas}% vs mês anterior
                                            </span>
                                        </>
                                    ) : (
                                        <span className="text-gray-400">Sem dados do mês anterior</span>
                                    )}
                                </p>
                            </div>
                            <div className="p-3.5 bg-blue-50 rounded-2xl shrink-0">
                                <svg className="w-7 h-7 text-[#0C4773]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                        </div>

                        {/* Aguardando Entrevista */}
                        <div onClick={() => setPainelAberto(true)} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer group">
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Aguardando entrevista</p>
                                <h3 className="text-3xl font-bold text-orange-500">{aguardandoEntrevista.length}</h3>
                                <p className="text-xs text-orange-500 font-medium mt-2 flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></span>
                                    {aguardandoEntrevista.length > 0 ? 'Clique para ver a fila' : 'Nenhum aguardando'}
                                </p>
                            </div>
                            <div className="p-3.5 bg-orange-50 rounded-2xl shrink-0 group-hover:bg-orange-100 transition-colors">
                                <svg className="w-7 h-7 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>

                        {/* Vagas Abertas */}
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Vagas abertas</p>
                                <h3 className="text-3xl font-bold text-emerald-600">{totalVagas}</h3>
                                <a href="/vagas" className="text-xs text-emerald-600 font-medium mt-2 flex items-center gap-1 hover:underline">
                                Ver todas as vagas →
                                </a>
                            </div>
                            <div className="p-3.5 bg-emerald-50 rounded-2xl shrink-0">
                                <svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>

                        {/* Total de Candidatos */}
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Total de candidatos</p>
                                <h3 className="text-3xl font-bold text-violet-600">{totalCandidatos}</h3>
                                <p className="text-xs text-violet-600 font-medium mt-2 flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    {totalContratados} contratados
                                </p>
                            </div>
                            <div className="p-3.5 bg-violet-50 rounded-2xl shrink-0">
                                <svg className="w-7 h-7 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Proximas Entrevistas + Pipeline */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Próximas Entrevistas */}
                        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="flex items-center justify-between px-6 pt-6 pb-4">
                                <div>
                                    <h2 className="text-base font-bold text-gray-900">Próximas Entrevistas</h2>
                                    <p className="text-xs text-gray-400 mt-0.5">Agendamentos futuros confirmados</p>
                                </div>
                                <a href="/entrevistas" className="text-xs font-semibold text-[#0C4773] bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                                    Ver todas
                                </a>
                            </div>
                            {proximasEntrevistas && proximasEntrevistas.length > 0 ? (
                                <div className="px-6 pb-6 space-y-3">
                                    {proximasEntrevistas.map((e, i) => {
                                        const accentBorder = e.tipo === 'online' ? 'border-l-purple-400' : e.tipo === 'hibrido' ? 'border-l-teal-400' : 'border-l-[#0C4773]';
                                        return (
                                            <div key={i} className={`flex items-center gap-4 p-4 rounded-xl border border-gray-100 border-l-4 ${accentBorder} bg-gray-50/50 hover:bg-gray-50 transition-colors`}>
                                                {/* Avatar */}
                                                <div className="w-10 h-10 rounded-full bg-[#0C4773]/10 flex items-center justify-center shrink-0 text-[#0C4773] font-bold text-sm">
                                                    {e.candidato?.charAt(0)?.toUpperCase() ?? '?'}
                                                </div>

                                                {/* Info */}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-gray-900 truncate">{e.candidato ?? '—'}</p>
                                                    <p className="text-xs text-gray-500 truncate mt-0.5">{e.vaga ?? '—'}</p>
                                                    {e.entrevistador && (
                                                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                                            <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                                            {e.entrevistador}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Date + badge */}
                                                <div className="shrink-0 text-right space-y-1.5">
                                                    <p className="text-xs font-bold text-gray-800">{e.data_hora}</p>
                                                    <p className="text-xs text-gray-400">{e.data_relativa}</p>
                                                    {e.tipo && (
                                                        <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${TIPO_COLOR[e.tipo] ?? 'bg-gray-100 text-gray-600'}`}>
                                                            {TIPO_LABEL[e.tipo] ?? e.tipo}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-14 text-gray-300 px-6">
                                    <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-3">
                                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    </div>
                                    <p className="text-sm font-medium text-gray-400">Nenhuma entrevista futura agendada</p>
                                    <p className="text-xs text-gray-300 mt-1">Novas entrevistas aparecerão aqui</p>
                                </div>
                            )}
                        </div>

                        {/* Vagas em Destaque */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-base font-bold text-gray-900 border-l-4 border-violet-500 pl-3">Vagas em Destaque</h2>
                                <a href="/vagas" className="text-xs font-semibold text-[#0C4773] hover:underline">Ver todas</a>
                            </div>

                            {vagasDestaque && vagasDestaque.length > 0 ? (
                                <div className="space-y-4 flex-1">
                                    {vagasDestaque.map((vaga, i) => {
                                        const maxTotal = Math.max(...vagasDestaque.map(v => v.total), 1);
                                        const pct = Math.round((vaga.total / maxTotal) * 100);
                                        const corProgresso = CORES_PROGRESSO[i % CORES_PROGRESSO.length];
                                        return (
                                            <div key={i}>
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <span className="text-sm font-semibold text-gray-800 truncate pr-2" title={vaga.titulo}>{vaga.titulo}</span>
                                                    <div className="flex items-center gap-1.5 shrink-0">
                                                        {vaga.em_processo > 0 && (
                                                            <span className="text-xs font-bold px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">{vaga.em_processo} em proc.</span>
                                                        )}
                                                        {vaga.contratados > 0 && (
                                                            <span className="text-xs font-bold px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">{vaga.contratados} contrat.</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                                                        <div className={`h-1.5 rounded-full ${corProgresso} transition-all`} style={{ width: `${pct}%` }} />
                                                    </div>
                                                    <span className="text-xs text-gray-400 font-medium w-12 text-right">{vaga.total} cand.</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="flex-1 flex items-center justify-center">
                                    <p className="text-sm text-gray-400">Nenhuma vaga ativa.</p>
                                </div>
                            )}

                            <div className="mt-5 pt-4 border-t border-gray-100 flex justify-between items-center">
                                <span className="text-xs text-gray-400 font-medium">Vagas abertas</span>
                                <span className="text-sm font-bold text-gray-800">{totalVagas}</span>
                            </div>
                        </div>
                    </div>

                    {/* Atividades Recentes + Acoes Rapidas */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Atividades Recentes */}
                        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex justify-between items-center mb-5">
                                <h2 className="text-base font-bold text-gray-900 border-l-4 border-blue-500 pl-3">Atividades Recentes</h2>
                            </div>
                            <div className="space-y-5">
                                {atividadesRecentes && atividadesRecentes.length > 0 ? atividadesRecentes.map((atividade, index) => (
                                    <div key={index} className="flex gap-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                            <svg className="w-5 h-5 text-[#0C4773]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-700">
                                                Entrevista agendada com{' '}
                                                <span className="font-semibold text-gray-900">{atividade.candidato ?? 'Candidato'}</span>
                                                {atividade.vaga && (
                                                    <> para a vaga de <span className="font-bold text-[#0C4773]">{atividade.vaga}</span></>
                                                )}.
                                            </p>
                                            <p className="text-xs text-gray-400 mt-0.5 font-medium">{atividade.data}</p>
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-sm text-gray-400 text-center py-8">Nenhuma atividade recente.</p>
                                )}
                            </div>
                        </div>

                        {/* Resumo do Recrutamento */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                            <h2 className="text-base font-bold text-gray-900 border-l-4 border-[#0C4773] pl-3 mb-5">Resumo do Recrutamento</h2>

                            {(() => {
                                const aguardando   = aguardandoEntrevista?.length ?? 0;
                                const emProcesso   = (candidatosPorStatus?.marcada ?? 0) + (candidatosPorStatus?.selecionado ?? 0);
                                const contratados  = candidatosPorStatus?.contratado ?? 0;
                                const perdidos     = (candidatosPorStatus?.reprovado ?? 0) + (candidatosPorStatus?.nao_compareceu ?? 0) + (candidatosPorStatus?.recusou_vaga ?? 0);
                                const totalProc    = emProcesso + contratados + perdidos;
                                const taxaAprov    = totalProc > 0 ? Math.round((contratados / totalProc) * 100) : 0;

                                const metricas = [
                                    {
                                        label: 'Aguardando entrevista',
                                        value: aguardando,
                                        dot: 'bg-orange-400',
                                        bar: 'bg-orange-400',
                                        href: '/talentos',
                                        total: aguardando,
                                        max: Math.max(aguardando, emProcesso, contratados, perdidos, 1),
                                    },
                                    {
                                        label: 'Em processo de seleção',
                                        value: emProcesso,
                                        dot: 'bg-blue-500',
                                        bar: 'bg-blue-500',
                                        href: '/entrevistas',
                                        total: emProcesso,
                                        max: Math.max(aguardando, emProcesso, contratados, perdidos, 1),
                                    },
                                    {
                                        label: 'Contratados',
                                        value: contratados,
                                        dot: 'bg-emerald-500',
                                        bar: 'bg-emerald-500',
                                        href: '/entrevistas',
                                        total: contratados,
                                        max: Math.max(aguardando, emProcesso, contratados, perdidos, 1),
                                    },
                                    {
                                        label: 'Reprovados / Desistiram',
                                        value: perdidos,
                                        dot: 'bg-red-400',
                                        bar: 'bg-red-400',
                                        href: '/entrevistas',
                                        total: perdidos,
                                        max: Math.max(aguardando, emProcesso, contratados, perdidos, 1),
                                    },
                                ];

                                return (
                                    <>
                                        <div className="space-y-4 flex-1">
                                            {metricas.map((m) => (
                                                <a key={m.label} href={m.href} className="flex items-center gap-3 group">
                                                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${m.dot}`} />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="text-xs font-medium text-gray-500 group-hover:text-gray-800 transition-colors truncate">{m.label}</span>
                                                            <span className="text-xs font-bold text-gray-800 ml-2 shrink-0">{m.value}</span>
                                                        </div>
                                                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                                                            <div className={`h-1.5 rounded-full transition-all ${m.bar}`} style={{ width: `${Math.round((m.total / m.max) * 100)}%` }} />
                                                        </div>
                                                    </div>
                                                </a>
                                            ))}
                                        </div>

                                        <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                                            <div>
                                                <p className="text-xs text-gray-400">Taxa de aprovação</p>
                                                <p className="text-lg font-bold text-gray-900">{taxaAprov}%</p>
                                            </div>
                                            <div className="w-14 h-14 relative flex items-center justify-center">
                                                <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
                                                    <circle cx="18" cy="18" r="15" fill="none" stroke="#f3f4f6" strokeWidth="3" />
                                                    <circle cx="18" cy="18" r="15" fill="none" stroke="#10b981" strokeWidth="3"
                                                        strokeDasharray={`${taxaAprov * 0.942} 94.2`}
                                                        strokeLinecap="round"
                                                    />
                                                </svg>
                                                <span className="absolute text-xs font-bold text-gray-700">{taxaAprov}%</span>
                                            </div>
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                    </div>

                </div>
            </main>
        </div>

        {/* Painel - Aguardando Entrevista */}
        {painelAberto && (
            <div className="fixed inset-0 z-50 flex justify-end">
                <div className="absolute inset-0 bg-black/40" onClick={() => setPainelAberto(false)} />
                <div className="relative bg-white w-full max-w-md h-full shadow-2xl flex flex-col">
                    <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Aguardando Entrevista</h2>
                            <p className="text-sm text-gray-400 mt-0.5">{aguardandoEntrevista.length} candidato{aguardandoEntrevista.length !== 1 ? 's' : ''} na fila</p>
                        </div>
                        <button onClick={() => setPainelAberto(false)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                        {aguardandoEntrevista.length === 0 ? (
                            <div className="text-center py-16 text-gray-400">
                                <svg className="w-12 h-12 mx-auto mb-3 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-sm font-medium">Nenhum candidato aguardando</p>
                            </div>
                        ) : aguardandoEntrevista.map((item, index) => (
                            <div key={index} className="flex items-start gap-4 bg-gray-50 rounded-xl p-4 border border-gray-100">
                                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm shrink-0">
                                    {index + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-900 text-sm truncate">{item.candidato}</p>
                                    <p className="text-xs text-[#0C4773] font-medium mt-0.5 truncate">{item.vaga}</p>
                                    <div className="mt-2 flex flex-col gap-1">
                                        {item.data_hora ? (
                                            <p className="text-xs text-blue-600 font-semibold flex items-center gap-1">
                                                <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                {item.data_hora}
                                            </p>
                                        ) : (
                                            <p className="text-xs text-amber-500 flex items-center gap-1">
                                                <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                Aguardando agendamento
                                            </p>
                                        )}
                                        {item.telefone && (
                                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                                <svg className="w-3 h-3 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                                {item.telefone}
                                            </p>
                                        )}
                                        {item.email && (
                                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                                <svg className="w-3 h-3 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                                {item.email}
                                            </p>
                                        )}
                                        {item.entrevistador_nome && (
                                            <p className="text-xs text-emerald-600 flex items-center gap-1">
                                                <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                                <span className="font-semibold">{item.entrevistador_nome}</span>
                                            </p>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-400 mt-2">Aprovado {item.esperando}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}
        </>
    );
}
