import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import Sidebar from '../Componentes/Index.jsx';
import RelatoriosTabs from './RelatoriosTabs.jsx';

const ROLE_LABELS = { admin: 'Admin', coordenador: 'Coordenador', recrutador: 'Recrutador' };
const ROLE_COLORS = { admin: 'bg-violet-100 text-violet-700', coordenador: 'bg-amber-100 text-amber-700', recrutador: 'bg-sky-100 text-sky-700' };
const MEDAL_COLORS = ['from-amber-400 to-yellow-300', 'from-gray-300 to-gray-200', 'from-amber-700 to-amber-600'];

function getIniciais(nome) {
    if (!nome) return '??';
    const partes = nome.trim().split(/\s+/);
    if (partes.length === 1) return partes[0][0].toUpperCase();
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

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

export default function Performance({ ranking, resumo }) {
    const [sortKey, setSortKey] = useState('contratacoes');
    const [sortDir, setSortDir] = useState('desc');

    const handleSort = (key) => {
        if (sortKey === key) {
            setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDir('desc');
        }
    };

    const sorted = [...ranking].sort((a, b) => {
        const va = a[sortKey] ?? 0;
        const vb = b[sortKey] ?? 0;
        return sortDir === 'asc' ? va - vb : vb - va;
    });

    // Ranking top 3 por contratações no mês
    const top3 = [...ranking].sort((a, b) => b.contratacoes_mes - a.contratacoes_mes).slice(0, 3);

    return (
        <>
            <Head title="Relatórios — Performance de Recrutadores" />
            <div className="min-h-screen bg-gray-50 flex font-sans">
                <Sidebar />
                <main className="flex-1 p-6 md:pl-[280px] transition-all duration-300">
                    <div className="max-w-7xl mx-auto space-y-6">

                        <RelatoriosTabs subtitulo="Performance de recrutadores" />

                        {/* KPIs */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <KpiCard label="Recrutadores ativos" value={resumo.total_recrutadores} sub="Com acesso ao sistema" delay="bento-delay-1" accent="from-[#0C4773]/8" />
                            <KpiCard label="Contratações no mês" value={resumo.total_contratacoes_mes} sub="Equipe completa" delay="bento-delay-2" accent="from-emerald-50/60" />
                            <KpiCard label="Melhor conversão" value={`${resumo.melhor_conversao}%`} sub="Entrevista → Contratação" delay="bento-delay-3" accent="from-amber-50/60" />
                            <div className="bento-card bento-delay-4 bg-gradient-to-br from-[#0C4773] to-[#007EAE] rounded-2xl shadow-sm border border-[#0C4773]/20 p-5 flex flex-col justify-center relative overflow-hidden">
                                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/5 rounded-full" />
                                <div className="relative z-10">
                                    <p className="text-xs font-semibold text-white/70 uppercase tracking-widest mb-1">Meta atingida (média)</p>
                                    <p className="text-3xl font-extrabold text-white tracking-tight">
                                        {resumo.media_meta_atingida !== null ? `${resumo.media_meta_atingida}%` : '—'}
                                    </p>
                                    <p className="text-xs text-white/60 mt-1">{resumo.media_meta_atingida !== null ? 'Cumprimento médio das metas' : 'Nenhuma meta definida'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Top 3 Ranking */}
                        {top3.length > 0 && top3[0].contratacoes_mes > 0 && (
                            <div className="bento-card bento-delay-5 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h2 className="text-sm font-bold text-gray-700 mb-5 border-l-4 border-amber-500 pl-3">Destaques do Mês</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {top3.map((r, idx) => (
                                        <div key={r.id} className={`relative rounded-xl border p-5 flex flex-col items-center gap-3 transition-all ${idx === 0 ? 'border-amber-200 bg-amber-50/30' : 'border-gray-100 bg-gray-50/50'}`}>
                                            {/* Position badge */}
                                            <div className={`absolute -top-3 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-gradient-to-br ${MEDAL_COLORS[idx]} flex items-center justify-center text-white text-xs font-bold shadow-sm`}>
                                                {idx + 1}
                                            </div>

                                            {/* Avatar */}
                                            <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-[#0C4773] to-[#007EAE] flex items-center justify-center text-white font-bold text-sm mt-2 ${idx === 0 ? 'ring-2 ring-amber-300 ring-offset-2' : ''}`}>
                                                {getIniciais(r.nome)}
                                            </div>

                                            <div className="text-center">
                                                <p className="font-semibold text-gray-800 text-sm">{r.nome}</p>
                                                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${ROLE_COLORS[r.role] ?? 'bg-gray-100 text-gray-500'}`}>
                                                    {ROLE_LABELS[r.role] ?? r.role}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3 w-full mt-2">
                                                <div className="text-center">
                                                    <p className="text-lg font-black text-gray-900">{r.contratacoes_mes}</p>
                                                    <p className="text-[10px] text-gray-400 uppercase font-semibold">Contratações</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-lg font-black text-gray-900">{r.taxa_conversao}%</p>
                                                    <p className="text-[10px] text-gray-400 uppercase font-semibold">Conversão</p>
                                                </div>
                                            </div>

                                            {/* Progress bar for meta */}
                                            {r.pct_meta_contratacoes !== null && (
                                                <div className="w-full mt-1">
                                                    <div className="flex justify-between text-[10px] text-gray-400 mb-0.5">
                                                        <span>Meta</span>
                                                        <span className="font-bold">{r.pct_meta_contratacoes}%</span>
                                                    </div>
                                                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full transition-all duration-500 ${r.pct_meta_contratacoes >= 100 ? 'bg-emerald-400' : r.pct_meta_contratacoes >= 50 ? 'bg-amber-400' : 'bg-red-400'}`}
                                                            style={{ width: `${Math.min(r.pct_meta_contratacoes, 100)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Tabela Detalhada */}
                        <div className="bento-card bento-delay-6 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                                <h2 className="text-sm font-bold text-gray-700 border-l-4 border-[#0C4773] pl-3">Performance Detalhada</h2>
                                <p className="text-xs text-gray-400">Clique nos cabeçalhos para ordenar</p>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-left border-b border-gray-100">
                                            <th className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Recrutador</th>
                                            {[
                                                { key: 'vagas_fechadas', label: 'Vagas Fechadas' },
                                                { key: 'contratacoes_mes', label: 'Contrat. Mês' },
                                                { key: 'total_entrevistas', label: 'Entrevistas' },
                                                { key: 'taxa_conversao', label: 'Conversão' },
                                                { key: 'tempo_medio_dias', label: 'Tempo Médio' },
                                            ].map(col => (
                                                <th
                                                    key={col.key}
                                                    onClick={() => handleSort(col.key)}
                                                    className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider text-center cursor-pointer hover:text-gray-600 transition-colors select-none"
                                                >
                                                    <span className="inline-flex items-center gap-1">
                                                        {col.label}
                                                        {sortKey === col.key && (
                                                            <svg className={`w-3 h-3 transition-transform ${sortDir === 'asc' ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" />
                                                            </svg>
                                                        )}
                                                    </span>
                                                </th>
                                            ))}
                                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider text-center">Meta</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {sorted.map((r) => (
                                            <tr key={r.id} className="hover:bg-gray-50/80 transition-colors">
                                                <td className="px-6 py-3.5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0C4773] to-[#007EAE] flex items-center justify-center text-white text-xs font-bold shrink-0">
                                                            {getIniciais(r.nome)}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-gray-800 text-sm">{r.nome}</p>
                                                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${ROLE_COLORS[r.role] ?? 'bg-gray-100 text-gray-500'}`}>
                                                                {ROLE_LABELS[r.role] ?? r.role}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3.5 text-center font-semibold text-gray-700">{r.vagas_fechadas}</td>
                                                <td className="px-4 py-3.5 text-center">
                                                    <span className="font-semibold text-gray-700">{r.contratacoes_mes}</span>
                                                    {r.contratacoes_mes > 0 && (
                                                        <span className="ml-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">mês</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3.5 text-center">
                                                    <span className="font-semibold text-gray-700">{r.total_entrevistas}</span>
                                                    {r.entrevistas_mes > 0 && (
                                                        <span className="ml-1 text-[10px] font-bold text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded-full">+{r.entrevistas_mes}</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <span className="font-bold text-gray-700 text-xs">{r.taxa_conversao}%</span>
                                                        <div className="w-full max-w-[80px] h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full transition-all duration-500 ${r.taxa_conversao >= 30 ? 'bg-emerald-400' : r.taxa_conversao >= 15 ? 'bg-amber-400' : 'bg-red-400'}`}
                                                                style={{ width: `${Math.min(r.taxa_conversao, 100)}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3.5 text-center">
                                                    {r.tempo_medio_dias !== null ? (
                                                        <span className="font-semibold text-gray-700">{r.tempo_medio_dias} <span className="text-gray-400 font-normal text-xs">dias</span></span>
                                                    ) : (
                                                        <span className="text-gray-300 text-xs">—</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3.5 text-center">
                                                    {r.pct_meta_contratacoes !== null ? (
                                                        <div className="flex flex-col items-center gap-1">
                                                            <span className={`text-xs font-bold ${r.pct_meta_contratacoes >= 100 ? 'text-emerald-600' : r.pct_meta_contratacoes >= 50 ? 'text-amber-600' : 'text-red-500'}`}>
                                                                {r.pct_meta_contratacoes}%
                                                            </span>
                                                            <div className="w-full max-w-[60px] h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                                <div
                                                                    className={`h-full rounded-full transition-all duration-500 ${r.pct_meta_contratacoes >= 100 ? 'bg-emerald-400' : r.pct_meta_contratacoes >= 50 ? 'bg-amber-400' : 'bg-red-400'}`}
                                                                    style={{ width: `${Math.min(r.pct_meta_contratacoes, 100)}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-300 text-xs">Sem meta</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {ranking.length > 0 && (
                                <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                                    <span>Mostrando {ranking.length} recrutador{ranking.length !== 1 ? 'es' : ''}</span>
                                    <span>Dados do mês atual comparados com o acumulado</span>
                                </div>
                            )}
                            {ranking.length === 0 && (
                                <div className="px-6 py-12 text-center">
                                    <p className="text-sm text-gray-400">Nenhum recrutador encontrado</p>
                                </div>
                            )}
                        </div>

                    </div>
                </main>
            </div>
        </>
    );
}
