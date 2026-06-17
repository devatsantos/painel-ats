import React from 'react';
import { Head } from '@inertiajs/react';
import Sidebar from '../Componentes/Index.jsx';
import RelatoriosTabs from './RelatoriosTabs.jsx';

const FUNNEL_COLORS = [
    { bg: 'bg-[#0C4773]', text: 'text-white', light: 'bg-[#0C4773]/10 text-[#0C4773]' },
    { bg: 'bg-[#007EAE]', text: 'text-white', light: 'bg-sky-100 text-sky-700' },
    { bg: 'bg-violet-500', text: 'text-white', light: 'bg-violet-100 text-violet-700' },
    { bg: 'bg-amber-500', text: 'text-white', light: 'bg-amber-100 text-amber-700' },
    { bg: 'bg-emerald-500', text: 'text-white', light: 'bg-emerald-100 text-emerald-700' },
];

function KpiCard({ label, value, suffix = '', sub, delay = '', accent = 'from-blue-50/60' }) {
    return (
        <div className={`bento-card ${delay} bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-1 relative overflow-hidden group`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${accent} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
            <p className="relative z-10 text-xs font-semibold text-gray-400 uppercase tracking-widest">{label}</p>
            <p className="relative z-10 text-2xl font-black text-gray-900 tracking-tight">
                {value}<span className="text-lg font-semibold text-gray-500 ml-0.5">{suffix}</span>
            </p>
            {sub && <p className="relative z-10 text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
    );
}

export default function Funil({ funil_etapas, conversoes, conversao_geral, tendencia_mensal, funil_por_vaga }) {
    const maxFunil = Math.max(...funil_etapas.map(e => e.total), 1);
    const maxTendencia = Math.max(...tendencia_mensal.map(m => Math.max(m.candidaturas, m.entrevistas, m.contratados)), 1);

    return (
        <>
            <Head title="Relatórios — Funil de Recrutamento" />
            <div className="min-h-screen bg-gray-50 flex font-sans">
                <Sidebar />
                <main className="flex-1 p-6 md:pl-[280px] transition-all duration-300">
                    <div className="max-w-7xl mx-auto space-y-6">

                        <RelatoriosTabs subtitulo="Funil de recrutamento" />

                        {/* KPIs */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <KpiCard label="Total candidaturas" value={funil_etapas[0]?.total ?? 0} sub="Todas as etapas" delay="bento-delay-1" accent="from-[#0C4773]/8" />
                            <KpiCard label="Entrevistados" value={funil_etapas[2]?.total ?? 0} sub="Com entrevista agendada" delay="bento-delay-2" accent="from-violet-50/60" />
                            <KpiCard label="Contratados" value={funil_etapas[4]?.total ?? 0} sub="Contratações efetivadas" delay="bento-delay-3" accent="from-emerald-50/60" />
                            <div className="bento-card bento-delay-4 bg-gradient-to-br from-[#0C4773] to-[#007EAE] rounded-2xl shadow-sm border border-[#0C4773]/20 p-5 flex flex-col justify-center relative overflow-hidden">
                                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/5 rounded-full" />
                                <div className="absolute right-12 -top-4 w-16 h-16 bg-white/5 rounded-full" />
                                <div className="relative z-10">
                                    <p className="text-xs font-semibold text-white/70 uppercase tracking-widest mb-1">Conversão geral</p>
                                    <p className="text-3xl font-extrabold text-white tracking-tight">{conversao_geral}%</p>
                                    <p className="text-xs text-white/60 mt-1">Candidatura → Contratação</p>
                                </div>
                            </div>
                        </div>

                        {/* Funil Visual + Taxas de Conversão */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            {/* Funil Visual (2 cols) */}
                            <div className="bento-card bento-delay-5 lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h2 className="text-sm font-bold text-gray-700 mb-6 border-l-4 border-[#0C4773] pl-3">Funil de Recrutamento</h2>
                                <div className="space-y-4">
                                    {funil_etapas.map((etapa, idx) => {
                                        const pct = Math.round((etapa.total / maxFunil) * 100);
                                        const color = FUNNEL_COLORS[idx] || FUNNEL_COLORS[0];
                                        return (
                                            <div key={etapa.etapa}>
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`w-6 h-6 rounded-lg ${color.bg} flex items-center justify-center text-white text-xs font-bold`}>{idx + 1}</span>
                                                        <span className="text-sm font-semibold text-gray-700">{etapa.etapa}</span>
                                                    </div>
                                                    <span className="text-sm font-bold text-gray-800">{etapa.total}</span>
                                                </div>
                                                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-700 ${color.bg}`}
                                                        style={{ width: `${pct}%` }}
                                                    />
                                                </div>
                                                {/* Seta de conversão entre etapas */}
                                                {conversoes[idx] && (
                                                    <div className="flex items-center justify-center mt-2 mb-1">
                                                        <div className="flex items-center gap-2 bg-gray-50 rounded-full px-3 py-1">
                                                            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                                            </svg>
                                                            <span className={`text-xs font-bold ${conversoes[idx].taxa >= 50 ? 'text-emerald-600' : conversoes[idx].taxa >= 25 ? 'text-amber-600' : 'text-red-500'}`}>
                                                                {conversoes[idx].taxa}%
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Taxas de conversão por etapa (1 col) */}
                            <div className="bento-card bento-delay-5 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
                                <div>
                                    <h2 className="text-sm font-bold text-gray-700 mb-5 border-l-4 border-emerald-500 pl-3">Taxas de Conversão</h2>
                                    <div className="space-y-4">
                                        {conversoes.map((conv, idx) => (
                                            <div key={idx} className="bg-gray-50 rounded-xl p-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="text-xs text-gray-500">
                                                        <span className="font-semibold text-gray-700">{conv.de}</span>
                                                        <span className="mx-1.5">→</span>
                                                        <span className="font-semibold text-gray-700">{conv.para}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full transition-all duration-500 ${conv.taxa >= 50 ? 'bg-emerald-400' : conv.taxa >= 25 ? 'bg-amber-400' : 'bg-red-400'}`}
                                                            style={{ width: `${Math.min(conv.taxa, 100)}%` }}
                                                        />
                                                    </div>
                                                    <span className={`text-sm font-bold min-w-[48px] text-right ${conv.taxa >= 50 ? 'text-emerald-600' : conv.taxa >= 25 ? 'text-amber-600' : 'text-red-500'}`}>
                                                        {conv.taxa}%
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                                    <span>Conversão geral do funil</span>
                                    <span className="font-bold text-emerald-600 text-sm">{conversao_geral}%</span>
                                </div>
                            </div>
                        </div>

                        {/* Tendência Mensal */}
                        <div className="bento-card bento-delay-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-sm font-bold text-gray-700 mb-5 border-l-4 border-violet-500 pl-3">Tendência Mensal do Funil</h2>
                            <div className="flex items-center gap-6 mb-4 text-xs">
                                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#0C4773]" /> Candidaturas</span>
                                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-violet-500" /> Entrevistas</span>
                                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Contratados</span>
                            </div>
                            <div className="flex items-end justify-between gap-3 h-44">
                                {tendencia_mensal.map(mes => (
                                    <div key={mes.mes} className="flex-1 flex items-end gap-1 h-full">
                                        {[
                                            { val: mes.candidaturas, color: 'bg-[#0C4773]' },
                                            { val: mes.entrevistas, color: 'bg-violet-500' },
                                            { val: mes.contratados, color: 'bg-emerald-500' },
                                        ].map((bar, i) => (
                                            <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                                                <span className="text-[10px] font-bold text-gray-500">{bar.val}</span>
                                                <div className="w-full bg-gray-100 rounded-t-md overflow-hidden flex flex-col justify-end" style={{ height: '120px' }}>
                                                    <div
                                                        className={`w-full ${bar.color} rounded-t-md transition-all duration-500`}
                                                        style={{ height: `${Math.round((bar.val / maxTendencia) * 100)}%`, minHeight: bar.val > 0 ? '4px' : '0' }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                        <div className="w-full text-center mt-1">
                                            <span className="text-[11px] font-semibold text-gray-400 block" style={{ marginLeft: '-200%', width: '500%' }}>{mes.mes}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Funil por Vaga — Tabela */}
                        <div className="bento-card bento-delay-6 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100">
                                <h2 className="text-sm font-bold text-gray-700 border-l-4 border-[#0C4773] pl-3">Funil por Vaga</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-left border-b border-gray-100">
                                            <th className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Vaga</th>
                                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider text-center">Candidaturas</th>
                                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider text-center">Triados</th>
                                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider text-center">Entrevistados</th>
                                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider text-center">Contratados</th>
                                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider text-center">Conversão</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {funil_por_vaga.map((vaga, i) => (
                                            <tr key={i} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-3.5 font-medium text-gray-800">{vaga.titulo}</td>
                                                <td className="px-4 py-3.5 text-center text-gray-600">{vaga.candidaturas}</td>
                                                <td className="px-4 py-3.5 text-center text-gray-600">{vaga.triados}</td>
                                                <td className="px-4 py-3.5 text-center text-gray-600">{vaga.entrevistados}</td>
                                                <td className="px-4 py-3.5 text-center">
                                                    <span className="font-bold text-emerald-600">{vaga.contratados}</span>
                                                </td>
                                                <td className="px-4 py-3.5 text-center">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${vaga.taxa >= 20 ? 'bg-emerald-100 text-emerald-700' : vaga.taxa >= 10 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>
                                                        {vaga.taxa}%
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                        {funil_por_vaga.length === 0 && (
                                            <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400 text-sm">Nenhuma vaga ativa encontrada</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>
                </main>
            </div>
        </>
    );
}
