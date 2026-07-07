import React from 'react';
import { Head } from '@inertiajs/react';
import Sidebar from '../Componentes/Index.jsx';
import RelatoriosTabs from './RelatoriosTabs.jsx';

function KpiCard({ label, value, suffix = '', sub, delay = '', accent = 'from-blue-50/60' }) {
    return (
        <div className={`bento-card ${delay} bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-1 relative overflow-hidden group`}>
            <div className="absolute inset-0 bg-slate-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <p className="relative z-10 text-xs font-semibold text-gray-400 uppercase tracking-widest">{label}</p>
            <p className="relative z-10 text-2xl font-black text-gray-900 tracking-tight">
                {value}<span className="text-lg font-semibold text-gray-500 ml-0.5">{suffix}</span>
            </p>
            {sub && <p className="relative z-10 text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
    );
}

export default function Volume({ kpis, vagas_por_area, vagas_por_cidade, vagas_ativas, candidatos_por_vaga }) {
    const maxArea = Math.max(...(vagas_por_area.length > 0 ? vagas_por_area.map(a => a.total) : [1]), 1);
    const maxCidade = Math.max(...(vagas_por_cidade.length > 0 ? vagas_por_cidade.map(c => c.total) : [1]), 1);
    const maxCandVaga = Math.max(...(candidatos_por_vaga.length > 0 ? candidatos_por_vaga.map(c => c.total) : [1]), 1);

    return (
        <>
            <Head title="Relatórios — Volume de Vagas" />
            <div className="min-h-screen bg-gray-50 flex font-sans">
                <Sidebar />
                <main className="flex-1 p-6 md:pl-[280px] transition-all duration-300">
                    <div className="max-w-7xl mx-auto space-y-6">

                        <RelatoriosTabs subtitulo="Volume de vagas e candidatos" />

                        {/* KPIs */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <KpiCard label="Vagas abertas" value={kpis.vagas_abertas} sub="Atualmente ativas" delay="bento-delay-1" accent="from-[#0C4773]/8" />
                            <KpiCard label="Candidatos ativos" value={kpis.candidatos_ativos} sub="No pipeline (triagem + selecionados)" delay="bento-delay-2" accent="from-violet-50/60" />
                            <KpiCard label="Ratio médio" value={kpis.ratio_medio} suffix=" cand./vaga" sub="Média de candidatos por vaga" delay="bento-delay-3" accent="from-sky-50/60" />
                            <div className="bento-card bento-delay-4 bg-[#0C4773] rounded-2xl shadow-sm border border-[#0C4773]/20 p-5 flex flex-col justify-center relative overflow-hidden">
                                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/5 rounded-full" />
                                <div className="relative z-10">
                                    <p className="text-xs font-semibold text-white/70 uppercase tracking-widest mb-1">Vagas críticas</p>
                                    <p className="text-3xl font-extrabold text-white tracking-tight">{kpis.vagas_criticas}</p>
                                    <p className="text-xs text-white/60 mt-1">Candidatos insuficientes</p>
                                </div>
                            </div>
                        </div>

                        {/* Vagas por Área + Cidade */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div className="bento-card bento-delay-5 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h2 className="text-sm font-bold text-gray-700 mb-5 border-l-4 border-[#0C4773] pl-3">Vagas por Área</h2>
                                <div className="space-y-3.5">
                                    {vagas_por_area.length > 0 ? vagas_por_area.map((item, idx) => {
                                        const pct = Math.round((item.total / maxArea) * 100);
                                        const colors = ['bg-[#0C4773]', 'bg-[#007EAE]', 'bg-sky-400', 'bg-indigo-400', 'bg-violet-400'];
                                        return (
                                            <div key={idx}>
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-xs font-semibold text-gray-600">{item.label}</span>
                                                    <span className="text-xs font-bold text-gray-500">{item.total} vagas · {item.posicoes} posições</span>
                                                </div>
                                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                    <div className={`h-full rounded-full transition-all duration-500 ${colors[idx % colors.length]}`} style={{ width: `${pct}%` }} />
                                                </div>
                                            </div>
                                        );
                                    }) : <p className="text-xs text-gray-400 text-center py-4">Nenhuma vaga com área definida. Edite as vagas para adicionar a área/setor.</p>}
                                </div>
                            </div>

                            <div className="bento-card bento-delay-5 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h2 className="text-sm font-bold text-gray-700 mb-5 border-l-4 border-teal-500 pl-3">Vagas por Cidade</h2>
                                <div className="space-y-3.5">
                                    {vagas_por_cidade.length > 0 ? vagas_por_cidade.map((item, idx) => {
                                        const pct = Math.round((item.total / maxCidade) * 100);
                                        const colors = ['bg-teal-500', 'bg-teal-400', 'bg-cyan-500', 'bg-cyan-400', 'bg-sky-400'];
                                        return (
                                            <div key={idx}>
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-xs font-semibold text-gray-600 truncate max-w-[180px]" title={item.label}>{item.label}</span>
                                                    <span className="text-xs font-bold text-gray-500">{item.total}</span>
                                                </div>
                                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                    <div className={`h-full rounded-full transition-all duration-500 ${colors[idx % colors.length]}`} style={{ width: `${pct}%` }} />
                                                </div>
                                            </div>
                                        );
                                    }) : <p className="text-xs text-gray-400 text-center py-4">Nenhuma vaga ativa</p>}
                                </div>
                            </div>
                        </div>

                        {/* Candidatos por Vaga */}
                        <div className="bento-card bento-delay-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-sm font-bold text-gray-700 mb-5 border-l-4 border-violet-500 pl-3">Candidatos por Vaga</h2>
                            <div className="space-y-3">
                                {candidatos_por_vaga.map((item, idx) => {
                                    const pct = Math.round((item.total / maxCandVaga) * 100);
                                    return (
                                        <div key={idx}>
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-xs font-semibold text-gray-600 truncate max-w-[250px]" title={item.titulo}>{item.titulo}</span>
                                                <span className="text-xs font-bold text-gray-700">{item.total}</span>
                                            </div>
                                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div className="h-full rounded-full transition-all duration-500 bg-[#0C4773]" style={{ width: `${pct}%` }} />
                                            </div>
                                        </div>
                                    );
                                })}
                                {candidatos_por_vaga.length === 0 && <p className="text-xs text-gray-400 text-center py-4">Nenhuma vaga ativa</p>}
                            </div>
                        </div>

                        {/* Tabela de Vagas Ativas */}
                        <div className="bento-card bento-delay-6 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                                <h2 className="text-sm font-bold text-gray-700 border-l-4 border-[#0C4773] pl-3">Vagas Ativas — Detalhes</h2>
                                <div className="flex items-center gap-3 text-xs text-gray-400">
                                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" /> Crítica</span>
                                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Suficiente</span>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-left border-b border-gray-100">
                                            <th className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Vaga</th>
                                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Área</th>
                                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Local</th>
                                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider text-center">Posições</th>
                                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider text-center">Candidatos</th>
                                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider text-center">Dias Aberta</th>
                                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Recrutador</th>
                                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {vagas_ativas.map((v, i) => (
                                            <tr key={i} className={`hover:bg-gray-50 transition-colors ${v.critica ? 'bg-red-50/30' : ''}`}>
                                                <td className="px-6 py-3.5 font-medium text-gray-800">{v.titulo}</td>
                                                <td className="px-4 py-3.5 text-gray-600 text-xs">{v.area}</td>
                                                <td className="px-4 py-3.5 text-gray-600 text-xs">{v.local}</td>
                                                <td className="px-4 py-3.5 text-center text-gray-600">{v.quantidade_vagas}</td>
                                                <td className="px-4 py-3.5 text-center">
                                                    <span className={`font-bold ${v.critica ? 'text-red-500' : 'text-emerald-600'}`}>{v.candidatos_ativos}</span>
                                                </td>
                                                <td className="px-4 py-3.5 text-center text-gray-600">{v.dias_aberta}d</td>
                                                <td className="px-4 py-3.5 text-gray-600 text-xs">{v.recrutador}</td>
                                                <td className="px-4 py-3.5 text-center">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${v.critica ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-700'}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${v.critica ? 'bg-red-400' : 'bg-emerald-400'}`} />
                                                        {v.critica ? 'Crítica' : 'OK'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                        {vagas_ativas.length === 0 && (
                                            <tr><td colSpan={8} className="px-6 py-8 text-center text-gray-400 text-sm">Nenhuma vaga ativa</td></tr>
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
