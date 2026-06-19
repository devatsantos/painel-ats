import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import FlashMessages from '../Componentes/FlashMessages';

const STATUS_CONFIG = {
    marcada:        { label: 'Inscrito',         color: 'bg-blue-100 text-blue-700',      dot: 'bg-blue-500',    icon: '📋' },
    selecionado:    { label: 'Aprovado',         color: 'bg-orange-100 text-orange-700',  dot: 'bg-orange-500',  icon: '✅' },
    contratado:     { label: 'Contratado',       color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500', icon: '🎉' },
    reprovado:      { label: 'Não aprovado',     color: 'bg-red-100 text-red-600',        dot: 'bg-red-500',     icon: '❌' },
    recusou_vaga:   { label: 'Recusou vaga',     color: 'bg-yellow-100 text-yellow-700',  dot: 'bg-yellow-500',  icon: '↩️' },
    sem_vaga:       { label: 'Sem vaga',         color: 'bg-gray-100 text-gray-600',      dot: 'bg-gray-400',    icon: '⏸️' },
    nao_compareceu: { label: 'Não compareceu',   color: 'bg-pink-100 text-pink-700',      dot: 'bg-pink-500',    icon: '🚫' },
    desclassificado: { label: 'Desclassificado',  color: 'bg-rose-100 text-rose-700',      dot: 'bg-rose-500',    icon: '🚫' },
};

function saudacao() {
    const h = new Date().getHours();
    if (h < 12) return 'Bom dia';
    if (h < 18) return 'Boa tarde';
    return 'Boa noite';
}

function getIniciais(nome) {
    if (!nome) return '?';
    const partes = nome.trim().split(/\s+/);
    if (partes.length === 1) return partes[0].charAt(0).toUpperCase();
    return (partes[0].charAt(0) + partes[partes.length - 1].charAt(0)).toUpperCase();
}

export default function PortalDashboard({ candidato, candidaturas, proximaEntrevista, totalCandidaturas }) {
    const { auth } = usePage().props;
    const nome = candidato?.nome || auth?.candidato?.nome || 'Candidato';

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Head title="Portal do Candidato" />

            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#0C4773] flex items-center justify-center">
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
                        <Link href="/portal/dashboard" className="px-3 py-2 text-sm font-semibold text-[#0C4773] bg-blue-50 rounded-lg">
                            Início
                        </Link>
                        <Link href="/portal/perfil" className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                            Perfil
                        </Link>
                        <Link
                            href="/portal/logout"
                            method="post"
                            as="button"
                            className="ml-2 px-3 py-2 text-sm font-medium text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            Sair
                        </Link>
                    </nav>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
                <FlashMessages />

                {/* Saudação */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-[#0C4773]/10 flex items-center justify-center text-[#0C4773] font-bold text-lg">
                            {getIniciais(nome)}
                        </div>
                        <div>
                            <h1 className="text-xl font-extrabold text-gray-900">{saudacao()}, {nome.split(/\s+/)[0]}!</h1>
                            <p className="text-sm text-gray-400">Acompanhe suas candidaturas e entrevistas</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            href="/portal/banco-de-talentos"
                            method="post"
                            as="button"
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm ${
                                candidato?.banco_de_talentos
                                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300'
                                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-[#0C4773] hover:border-[#0C4773]/30'
                            }`}
                        >
                            {candidato?.banco_de_talentos ? (
                                <>
                                    <svg className="w-4 h-4 text-emerald-600 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    No Banco de Talentos
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.36 1.242.588 1.81l-3.97 2.883a1 1 0 00-.364 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.971-2.883a1 1 0 00-1.17 0l-3.97 2.883c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.364-1.118L2.98 10.1c-.773-.568-.374-1.81.588-1.81h4.907a1 1 0 00.95-.69l1.519-4.674z" />
                                    </svg>
                                    Participar do Banco de Talentos
                                </>
                            )}
                        </Link>
                        <Link
                            href="/portal/perfil"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Editar Perfil
                        </Link>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Total Candidaturas */}
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
                        <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Candidaturas</p>
                            <h3 className="text-3xl font-bold text-[#0C4773]">{totalCandidaturas}</h3>
                        </div>
                        <div className="p-3.5 bg-blue-50 rounded-2xl shrink-0">
                            <svg className="w-7 h-7 text-[#0C4773]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                    </div>

                    {/* Próxima Entrevista */}
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow sm:col-span-2">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Próxima Entrevista</p>
                        {proximaEntrevista ? (
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-emerald-50 rounded-xl shrink-0">
                                    <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-gray-900 truncate">{proximaEntrevista.vaga}</p>
                                    <p className="text-sm text-gray-600 mt-0.5">
                                        📅 {proximaEntrevista.data_hora} · 📍 {proximaEntrevista.tipo}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400">Nenhuma entrevista agendada</p>
                        )}
                    </div>
                </div>

                {/* Lista de Candidaturas */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 pt-6 pb-4 border-b border-gray-100">
                        <h2 className="text-base font-bold text-gray-900">Minhas Candidaturas</h2>
                        <p className="text-xs text-gray-400 mt-0.5">Histórico de todas as suas candidaturas</p>
                    </div>

                    {candidaturas && candidaturas.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                            {candidaturas.map((c) => {
                                const cfg = STATUS_CONFIG[c.status] || STATUS_CONFIG.marcada;
                                return (
                                    <Link
                                        key={c.id}
                                        href={`/portal/candidatura/${c.vaga_id}`}
                                        className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/80 transition-colors group"
                                    >
                                        {/* Icon */}
                                        <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-lg shrink-0">
                                            {cfg.icon}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-[#0C4773] transition-colors">{c.titulo}</p>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-xs text-gray-400">{c.local}</span>
                                                <span className="text-xs text-gray-300">·</span>
                                                <span className="text-xs text-gray-400">{c.data_candidatura}</span>
                                            </div>
                                        </div>

                                        {/* Status + Entrevista */}
                                        <div className="shrink-0 text-right space-y-1">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.color}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                                                {cfg.label}
                                            </span>
                                            {c.entrevista && (
                                                <p className="text-xs text-gray-400">{c.entrevista.data_hora}</p>
                                            )}
                                        </div>

                                        {/* Arrow */}
                                        <svg className="w-4 h-4 text-gray-300 group-hover:text-[#0C4773] transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-gray-300 px-6">
                            <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-3">
                                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <p className="text-sm font-medium text-gray-400">Nenhuma candidatura encontrada</p>
                            <a href="/candidatura" className="text-xs text-[#0C4773] font-semibold mt-2 hover:underline">
                                Candidate-se a uma vaga →
                            </a>
                        </div>
                    )}
                </div>

            </main>
        </div>
    );
}
