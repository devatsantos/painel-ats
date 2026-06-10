import React, { useState } from "react";
import Sidebar from "../Componentes/Index.jsx"
import { Head, usePage } from '@inertiajs/react';

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
    candidatosPorStatus,
    aguardandoEntrevista,
    proximasEntrevistas,
    vagasDestaque,
    atividadesRecentes,
}) {
    const [painelAberto, setPainelAberto] = useState(false);
    const { auth } = usePage().props;
    const nomeUsuario = auth?.user?.nome ?? "Recrutador";

    return (
        <>
        <div className="min-h-screen bg-gray-50 flex font-sans">
            <Head title="Dashboard - Painel RH" />
            <Sidebar />

            <main className="flex-1 p-6 md:pl-[280px] transition-all duration-300">
                <div className="max-w-7xl mx-auto space-y-6">

                    {/* ── Header Premium ── */}
                    <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
                        {/* Linha superior de destaque em gradiente */}
                        <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-[#0C4773] to-[#007EAE]" />
                        
                        <div className="flex items-center gap-4">
                            {/* Ícone dinâmico do período do dia com fundo suave */}
                            <div className="hidden sm:flex p-3 bg-blue-50/80 rounded-2xl text-[#0C4773] shrink-0 border border-blue-100/50 shadow-sm">
                                {(() => {
                                    const h = new Date().getHours();
                                    if (h < 12) {
                                        return (
                                            <svg className="w-7 h-7 text-amber-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                                            </svg>
                                        );
                                    } else if (h < 18) {
                                        return (
                                            <svg className="w-7 h-7 text-orange-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707m2.357 5.657a4 4 0 00-6 0" />
                                            </svg>
                                        );
                                    } else {
                                        return (
                                            <svg className="w-7 h-7 text-indigo-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                            </svg>
                                        );
                                    }
                                })()}
                            </div>
                            
                            <div>
                                {/* Badge de Data */}
                                <div className="inline-flex items-center gap-1.5 bg-blue-50/70 border border-blue-100/50 text-[#0c4773] text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2 shadow-sm">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    {dataAtual()}
                                </div>
                                <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2 mt-0.5">
                                    {saudacao()}, <span className="text-[#0c4773] bg-[#0c4773]/5 px-2.5 py-0.5 rounded-lg border border-[#0c4773]/10 font-black">{nomeUsuario}</span>!
                                </h1>
                                <p className="text-sm text-gray-400 mt-1">Confira o andamento dos processos seletivos e atividades recentes.</p>
                            </div>
                        </div>

                        {/* Botões de Ação */}
                        <div className="flex items-center gap-2.5 shrink-0 sm:self-auto self-stretch">
                            <a href="/vagas?modal=true" className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0C4773] to-[#007EAE] text-white text-xs font-bold hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-sm">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                                Nova Vaga
                            </a>
                            <a href="/agenda?modal=true" className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-50 hover:border-gray-300 hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-sm">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                Bloquear Agenda
                            </a>
                        </div>
                    </header>

                    {/* ── Bento Grid ── */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-auto">

                        {/* ─── KPI: Entrevistas no mês (1 col) ─── */}
                        <div className="bento-card bento-delay-1 bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                            <div className="relative z-10">
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
                            <div className="relative z-10 p-3.5 bg-blue-50 rounded-2xl shrink-0">
                                <svg className="w-7 h-7 text-[#0C4773]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                        </div>

                        {/* ─── KPI: Aguardando Entrevista (1 col) ─── */}
                        <div onClick={() => setPainelAberto(true)} className="bento-card bento-delay-2 bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between cursor-pointer group relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-50/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                            <div className="relative z-10">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Aguardando entrevista</p>
                                <h3 className="text-3xl font-bold text-orange-500">{aguardandoEntrevista.length}</h3>
                                <p className="text-xs text-orange-500 font-medium mt-2 flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></span>
                                    {aguardandoEntrevista.length > 0 ? 'Clique para ver a fila' : 'Nenhum aguardando'}
                                </p>
                            </div>
                            <div className="relative z-10 p-3.5 bg-orange-50 rounded-2xl shrink-0 group-hover:bg-orange-100 transition-colors">
                                <svg className="w-7 h-7 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>

                        {/* ─── KPI: Vagas Abertas (2 cols - destaque) ─── */}
                        <div className="bento-card bento-delay-3 sm:col-span-2 bg-gradient-to-br from-[#0C4773] to-[#007EAE] p-5 rounded-2xl shadow-sm border border-[#0C4773]/20 flex items-center justify-between relative overflow-hidden group">
                            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/5 rounded-full" />
                            <div className="absolute right-16 -top-6 w-20 h-20 bg-white/5 rounded-full" />
                            <div className="relative z-10">
                                <p className="text-xs font-semibold text-white/70 uppercase tracking-widest mb-1">Vagas abertas</p>
                                <h3 className="text-3xl font-bold text-white">{totalVagas}</h3>
                                <a href="/vagas" className="text-xs text-white/80 font-medium mt-2 flex items-center gap-1 hover:text-white transition-colors">
                                    Ver todas as vagas →
                                </a>
                            </div>
                            <div className="relative z-10 p-3.5 bg-white/15 rounded-2xl shrink-0 backdrop-blur-sm">
                                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>

                        {/* ─── Próximas Entrevistas (2 cols, tall) ─── */}
                        <div className="bento-card bento-delay-4 sm:col-span-2 lg:row-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
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
                                <div className="px-6 pb-6 space-y-3 flex-1 overflow-y-auto">
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
                                <div className="flex flex-col items-center justify-center py-14 text-gray-300 px-6 flex-1">
                                    <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-3">
                                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    </div>
                                    <p className="text-sm font-medium text-gray-400">Nenhuma entrevista futura agendada</p>
                                    <p className="text-xs text-gray-300 mt-1">Novas entrevistas aparecerão aqui</p>
                                </div>
                            )}
                        </div>

                        {/* ─── Vagas em Destaque (2 cols, tall) ─── */}
                        <div className="bento-card bento-delay-5 sm:col-span-2 lg:row-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
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

                        {/* ─── Resumo do Recrutamento (1 col em lg, 2 em sm) ─── */}
                        <div className="bento-card bento-delay-5 sm:col-span-2 lg:col-span-1 lg:row-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
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

                        {/* ─── Atividades Recentes (3 cols em lg) ─── */}
                        <div className="bento-card bento-delay-6 sm:col-span-2 lg:col-span-3 lg:row-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                            <div className="flex justify-between items-center mb-5">
                                <h2 className="text-base font-bold text-gray-900 border-l-4 border-blue-500 pl-3">Atividades Recentes</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 flex-1">
                                {atividadesRecentes && atividadesRecentes.length > 0 ? atividadesRecentes.map((atividade, index) => {
                                    const CONFIG = {
                                        vaga_criada: {
                                            bg: 'bg-emerald-50',
                                            text: 'text-emerald-600',
                                            icon: (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                            )
                                        },
                                        candidatura: {
                                            bg: 'bg-blue-50',
                                            text: 'text-blue-600',
                                            icon: (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            )
                                        },
                                        resultado: {
                                            bg: 'bg-purple-50',
                                            text: 'text-purple-600',
                                            icon: (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            )
                                        },
                                        novo_talento: {
                                            bg: 'bg-amber-50',
                                            text: 'text-amber-600',
                                            icon: (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                                </svg>
                                            )
                                        },
                                        entrevista_agendada: {
                                            bg: 'bg-indigo-50',
                                            text: 'text-indigo-600',
                                            icon: (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            )
                                        },
                                        triagem_aprovado: {
                                            bg: 'bg-teal-50',
                                            text: 'text-teal-600',
                                            icon: (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                                </svg>
                                            )
                                        },
                                        entrevista_assumida: {
                                            bg: 'bg-sky-50',
                                            text: 'text-sky-600',
                                            icon: (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2H9m2-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V7a2 2 0 012-2zM9 14l2 2 4-4" />
                                                </svg>
                                            )
                                        },
                                        agenda_bloqueada: {
                                            bg: 'bg-rose-50',
                                            text: 'text-rose-600',
                                            icon: (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                </svg>
                                            )
                                        }
                                    };
                                    const cfg = CONFIG[atividade.tipo] || {
                                        bg: 'bg-gray-50',
                                        text: 'text-gray-600',
                                        icon: (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        )
                                    };
                                    return (
                                        <div key={index} className="flex gap-4">
                                            <div className={`w-10 h-10 rounded-full ${cfg.bg} ${cfg.text} flex items-center justify-center shrink-0`}>
                                                {cfg.icon}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-700 leading-snug">
                                                    {atividade.descricao}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1 font-medium">{atividade.data}</p>
                                            </div>
                                        </div>
                                    );
                                }) : (
                                    <p className="text-sm text-gray-400 text-center py-8 col-span-2">Nenhuma atividade recente.</p>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>

        {/* Painel - Aguardando Entrevista Premium */}
        {painelAberto && (
            <div className="fixed inset-0 z-50 flex justify-end">
                {/* Overlay com desfoque e fade-in suave */}
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm overlay-fade-in" onClick={() => setPainelAberto(false)} />
                
                {/* Painel lateral com slide-in e borda sutil */}
                <div className="relative bg-[#F6F7F9] w-full max-w-md h-full shadow-2xl flex flex-col panel-slide-in border-l border-gray-200/50 z-10">
                    {/* Linha gradiente decorativa no topo */}
                    <div className="absolute top-0 left-0 h-1.5 w-full bg-gradient-to-r from-[#0C4773] to-[#007EAE]" />
                    
                    {/* Header do Painel */}
                    <div className="flex items-center justify-between px-6 py-5 bg-white border-b border-gray-100 mt-1.5">
                        <div>
                            <h2 className="text-lg font-black text-gray-900 tracking-tight">Fila de Espera</h2>
                            <p className="text-xs text-gray-400 mt-1 font-semibold flex items-center gap-1.5">
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-orange-50 text-orange-600 border border-orange-100/50 shadow-sm">
                                    {aguardandoEntrevista.length}
                                </span>
                                candidato{aguardandoEntrevista.length !== 1 ? 's' : ''} aguardando agendamento
                            </p>
                        </div>
                        <button onClick={() => setPainelAberto(false)} className="p-2 rounded-xl hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-colors border border-transparent hover:border-gray-100 shadow-sm bg-white">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Lista de Candidatos */}
                    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                        {aguardandoEntrevista.length === 0 ? (
                            <div className="text-center py-20 text-gray-400 flex flex-col items-center justify-center">
                                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4 border border-gray-200/50">
                                    <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <p className="text-sm font-bold text-gray-500">Nenhum candidato na fila</p>
                                <p className="text-xs text-gray-400 mt-1 max-w-[200px] mx-auto">Candidatos aprovados na triagem que ainda não agendaram aparecerão aqui.</p>
                            </div>
                        ) : aguardandoEntrevista.map((item, index) => (
                            <div key={index} className="bg-white rounded-2xl p-5 border border-gray-200/70 shadow-sm hover:shadow-md hover:border-orange-200/60 transition-all duration-300 relative group/card flex flex-col">
                                {/* Badge de Ordem no Topo-Direito */}
                                <span className="absolute top-4 right-4 text-xs font-black bg-orange-50/70 text-orange-500 w-6 h-6 rounded-full flex items-center justify-center border border-orange-100/30">
                                    {index + 1}
                                </span>

                                <div className="flex-1 min-w-0">
                                    {/* Nome */}
                                    <h3 className="font-extrabold text-gray-800 text-sm tracking-tight pr-6">{item.candidato}</h3>
                                    
                                    {/* Vaga Tag */}
                                    <span className="inline-block text-[11px] font-bold text-[#0c4773] bg-[#0c4773]/5 border border-[#0c4773]/10 px-2 py-0.5 rounded-md mt-1.5">
                                        {item.vaga}
                                    </span>

                                    {/* Metadados adicionais */}
                                    <div className="mt-3.5 space-y-2.5">
                                        {/* Status principal */}
                                        <div className="flex items-center gap-2 text-xs font-semibold">
                                            {item.data_hora ? (
                                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-blue-50/70 border border-blue-100/50 text-blue-600">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                    {item.data_hora}
                                                </div>
                                            ) : (
                                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-orange-50/70 border border-orange-100/50 text-orange-600">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                                                    Aguardando agendamento
                                                </div>
                                            )}
                                        </div>

                                        {/* Data da aprovação */}
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
                                            <svg className="w-3.5 h-3.5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" /></svg>
                                            Aprovado {item.esperando}
                                        </p>

                                        {item.entrevistador_nome && (
                                            <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1.5 bg-emerald-50/50 px-2 py-1 rounded-lg w-fit border border-emerald-100/30">
                                                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                                Recrutador: {item.entrevistador_nome}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Ações e Contatos integrados */}
                                <div className="mt-4 pt-3.5 border-t border-gray-100 flex items-center justify-between gap-4">
                                    <div className="flex flex-col gap-1.5 min-w-0">
                                        {item.telefone && (
                                            <a href={`tel:${item.telefone}`} className="text-xs text-gray-500 hover:text-[#0C4773] transition-colors flex items-center gap-1.5 font-semibold">
                                                <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                                {item.telefone}
                                            </a>
                                        )}
                                        {item.email && (
                                            <a href={`mailto:${item.email}`} className="text-xs text-gray-500 hover:text-[#0C4773] transition-colors flex items-center gap-1.5 font-semibold truncate" title={item.email}>
                                                <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                                <span className="truncate">{item.email}</span>
                                            </a>
                                        )}
                                    </div>
                                    
                                    {/* Botão de contato rápido WhatsApp */}
                                    {item.telefone && (
                                        <div className="flex gap-1.5 shrink-0">
                                            <a 
                                                href={`https://wa.me/55${item.telefone.replace(/\D/g, '')}`} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                title="Contatar via WhatsApp"
                                                className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition-all border border-emerald-100/50 hover:scale-105 active:scale-95 shadow-sm"
                                            >
                                                <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.18 1.449 4.725 1.45 5.513 0 10.002-4.49 10.005-10.008.001-2.673-1.04-5.186-2.93-7.078-1.892-1.893-4.407-2.935-7.08-2.936-5.516 0-10.007 4.491-10.01 10.01-.001 1.76.478 3.48 1.387 5.004l-.997 3.637 3.72-.975L6.647 19.15zM17.487 14.39c-.3-.15-1.774-.875-2.026-.968-.25-.092-.433-.138-.615.138-.182.276-.704.875-.863 1.058-.158.182-.317.204-.616.054-.3-.15-1.265-.467-2.41-1.485-.89-.795-1.49-1.776-1.664-2.076-.173-.3-.018-.462.13-.61.135-.133.3-.35.45-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.615-1.483-.84-2.025-.22-.53-.44-.457-.615-.466-.157-.008-.337-.01-.518-.01-.18 0-.474.067-.72.333-.248.267-.947.925-.947 2.258 0 1.333.97 2.62 1.104 2.8.135.18 1.908 2.913 4.622 4.08.645.278 1.148.444 1.54.568.65.206 1.24.177 1.706.108.52-.078 1.774-.725 2.025-1.425.252-.7 2.52-2.008.252-2.008z"/>
                                                </svg>
                                            </a>
                                        </div>
                                    )}
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
