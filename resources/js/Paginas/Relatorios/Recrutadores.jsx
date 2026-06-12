import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import Sidebar from '../Componentes/Index.jsx';

const ROLE_LABELS = {
    admin: 'Admin',
    coordenador: 'Coordenador',
    recrutador: 'Recrutador',
};

const ROLE_COLORS = {
    admin: 'bg-violet-100 text-violet-700',
    coordenador: 'bg-amber-100 text-amber-700',
    recrutador: 'bg-sky-100 text-sky-700',
};

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

export default function Recrutadores({
    recrutadores,
    entrevistas_por_mes_recrutador,
    resumo,
}) {
    const [expandido, setExpandido] = useState(null);
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

    const sorted = [...recrutadores].sort((a, b) => {
        const va = a[sortKey] ?? 0;
        const vb = b[sortKey] ?? 0;
        return sortDir === 'asc' ? va - vb : vb - va;
    });

    const maxTaxa = Math.max(...recrutadores.map(r => r.taxa_conversao), 1);

    return (
        <>
            <Head title="Relatórios — Recrutadores" />
            <div className="min-h-screen bg-gray-50 flex font-sans">
                <Sidebar />

                <main className="flex-1 p-6 md:pl-[280px] transition-all duration-300">
                    <div className="max-w-7xl mx-auto space-y-6">

                        {/* Header com Tabs */}
                        <header className="flex flex-col gap-4">
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Performance da equipe</p>
                                <h1 className="text-2xl font-black text-gray-900 tracking-tight">Relatórios</h1>
                            </div>
                            <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
                                <a href="/relatorios" className="px-4 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-white/50 transition-all">
                                    Visão Geral
                                </a>
                                <span className="px-4 py-2 rounded-lg text-sm font-semibold bg-white text-gray-900 shadow-sm cursor-default transition-all">
                                    Recrutadores
                                </span>
                            </div>
                        </header>

                        {/* KPIs de Resumo */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <KpiCard
                                label="Recrutadores ativos"
                                value={resumo.total_recrutadores}
                                sub="Com acesso ao sistema"
                                delay="bento-delay-1"
                                accent="from-[#0C4773]/8"
                            />
                            <KpiCard
                                label="Entrevistas no mês"
                                value={resumo.total_entrevistas_mes}
                                sub="Equipe completa"
                                delay="bento-delay-2"
                                accent="from-violet-50/60"
                            />
                            <KpiCard
                                label="Destaque do mês"
                                value={resumo.maior_contratacao_mes}
                                suffix={resumo.maior_contratacao_mes === 1 ? " contratação" : " contratações"}
                                sub={resumo.maior_contratacao_mes > 0 ? resumo.destaque_nome : "Nenhuma contratação"}
                                delay="bento-delay-3"
                                accent="from-amber-50/60"
                            />
                            <div className="bento-card bento-delay-4 bg-gradient-to-br from-[#0C4773] to-[#007EAE] rounded-2xl shadow-sm border border-[#0C4773]/20 p-5 flex flex-col justify-center relative overflow-hidden">
                                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/5 rounded-full" />
                                <div className="absolute right-12 -top-4 w-16 h-16 bg-white/5 rounded-full" />
                                <div className="relative z-10">
                                    <p className="text-xs font-semibold text-white/70 uppercase tracking-widest mb-1">Conversão média</p>
                                    <p className="text-3xl font-extrabold text-white tracking-tight">{resumo.media_conversao}%</p>
                                    <p className="text-xs text-white/60 mt-1">Entrevista → Contratação</p>
                                </div>
                            </div>
                        </div>

                        {/* Tabela de Recrutadores */}
                        <div className="bento-card bento-delay-5 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                                <h2 className="text-sm font-bold text-gray-700 border-l-4 border-[#0C4773] pl-3">Performance por recrutador</h2>
                                <p className="text-xs text-gray-400">Clique nos cabeçalhos para ordenar</p>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-left border-b border-gray-100">
                                            <th className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Recrutador</th>
                                            {[
                                                { key: 'total_entrevistas', label: 'Entrevistas' },
                                                { key: 'contratacoes', label: 'Contratações' },
                                                { key: 'taxa_conversao', label: 'Conversão' },
                                                { key: 'reprovados', label: 'Reprovados' },
                                                { key: 'nao_compareceu', label: 'Não Comp.' },
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
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {sorted.map((r) => (
                                            <React.Fragment key={r.id}>
                                                <tr
                                                    onClick={() => setExpandido(expandido === r.id ? null : r.id)}
                                                    className={`hover:bg-gray-50/80 transition-colors cursor-pointer ${expandido === r.id ? 'bg-gray-50' : ''}`}
                                                >
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
                                                    <td className="px-4 py-3.5 text-center">
                                                        <span className="font-semibold text-gray-700">{r.total_entrevistas}</span>
                                                        {r.entrevistas_mes > 0 && (
                                                            <span className="ml-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                                                                +{r.entrevistas_mes} mês
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3.5 text-center">
                                                        <span className="font-semibold text-gray-700">{r.contratacoes}</span>
                                                        {r.contratacoes_mes > 0 && (
                                                            <span className="ml-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                                                                +{r.contratacoes_mes} mês
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3.5">
                                                        <div className="flex flex-col items-center gap-1">
                                                            <span className="font-bold text-gray-700 text-xs">{r.taxa_conversao}%</span>
                                                            <div className="w-full max-w-[80px] h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                                <div
                                                                    className={`h-full rounded-full transition-all duration-500 ${
                                                                        r.taxa_conversao >= 30 ? 'bg-emerald-400' :
                                                                        r.taxa_conversao >= 15 ? 'bg-amber-400' : 'bg-red-400'
                                                                    }`}
                                                                    style={{ width: `${Math.round((r.taxa_conversao / maxTaxa) * 100)}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3.5 text-center text-gray-600">{r.reprovados}</td>
                                                    <td className="px-4 py-3.5 text-center text-gray-600">{r.nao_compareceu}</td>
                                                    <td className="px-4 py-3.5 text-center">
                                                        {r.tempo_medio_dias !== null ? (
                                                            <span className="font-semibold text-gray-700">{r.tempo_medio_dias} <span className="text-gray-400 font-normal text-xs">dias</span></span>
                                                        ) : (
                                                            <span className="text-gray-300 text-xs">—</span>
                                                        )}
                                                    </td>
                                                </tr>

                                                {/* Card expandível */}
                                                {expandido === r.id && (
                                                    <tr>
                                                        <td colSpan={7} className="px-6 py-5 bg-gray-50/50 border-b border-gray-100">
                                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                                                                {/* Entrevistas por mês (mini bar chart) */}
                                                                <div className="bg-white rounded-xl border border-gray-100 p-4">
                                                                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 border-l-3 border-[#0C4773] pl-2">
                                                                        Entrevistas por mês
                                                                    </h3>
                                                                    <div className="flex items-end justify-between gap-1.5 h-24">
                                                                        {entrevistas_por_mes_recrutador.map((mes) => {
                                                                            const val = mes.dados[r.id] ?? 0;
                                                                            const maxMes = Math.max(
                                                                                ...entrevistas_por_mes_recrutador.map(m => m.dados[r.id] ?? 0),
                                                                                1
                                                                            );
                                                                            const hPct = Math.round((val / maxMes) * 100);
                                                                            return (
                                                                                <div key={mes.mes} className="flex-1 flex flex-col items-center gap-1">
                                                                                    <span className="text-[10px] font-bold text-gray-500">{val}</span>
                                                                                    <div className="w-full bg-gray-100 rounded-t-md overflow-hidden flex flex-col justify-end" style={{ height: '56px' }}>
                                                                                        <div
                                                                                            className="w-full bg-[#0C4773] rounded-t-md transition-all duration-500"
                                                                                            style={{ height: `${hPct}%`, minHeight: val > 0 ? '4px' : '0' }}
                                                                                        />
                                                                                    </div>
                                                                                    <span className="text-[9px] font-semibold text-gray-400">{mes.mes}</span>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </div>

                                                                {/* Modalidade */}
                                                                <div className="bg-white rounded-xl border border-gray-100 p-4">
                                                                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 border-l-3 border-blue-500 pl-2">
                                                                        Modalidade
                                                                    </h3>
                                                                    <div className="space-y-3 mt-2">
                                                                        {(() => {
                                                                            const totalMod = r.entrevistas_online + r.entrevistas_presencial;
                                                                            const pctOnline = totalMod > 0 ? Math.round((r.entrevistas_online / totalMod) * 100) : 0;
                                                                            const pctPresencial = totalMod > 0 ? Math.round((r.entrevistas_presencial / totalMod) * 100) : 0;
                                                                            return (
                                                                                <>
                                                                                    <div>
                                                                                        <div className="flex justify-between text-xs font-semibold text-gray-500 mb-1">
                                                                                            <span className="flex items-center gap-1.5">
                                                                                                <span className="w-2 h-2 rounded-full bg-blue-500" />
                                                                                                Online
                                                                                            </span>
                                                                                            <span>{r.entrevistas_online} ({pctOnline}%)</span>
                                                                                        </div>
                                                                                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                                                            <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${pctOnline}%` }} />
                                                                                        </div>
                                                                                    </div>
                                                                                    <div>
                                                                                        <div className="flex justify-between text-xs font-semibold text-gray-500 mb-1">
                                                                                            <span className="flex items-center gap-1.5">
                                                                                                <span className="w-2 h-2 rounded-full bg-slate-500" />
                                                                                                Presencial
                                                                                            </span>
                                                                                            <span>{r.entrevistas_presencial} ({pctPresencial}%)</span>
                                                                                        </div>
                                                                                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                                                            <div className="h-full bg-slate-500 rounded-full transition-all duration-500" style={{ width: `${pctPresencial}%` }} />
                                                                                        </div>
                                                                                    </div>
                                                                                </>
                                                                            );
                                                                        })()}
                                                                    </div>
                                                                </div>

                                                                {/* Breakdown por status */}
                                                                <div className="bg-white rounded-xl border border-gray-100 p-4">
                                                                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 border-l-3 border-emerald-500 pl-2">
                                                                        Resultados
                                                                    </h3>
                                                                    <div className="space-y-2.5 mt-2">
                                                                        {[
                                                                            { label: 'Contratados', value: r.contratacoes, color: 'bg-emerald-400', badge: 'bg-emerald-50 text-emerald-700' },
                                                                            { label: 'Reprovados', value: r.reprovados, color: 'bg-red-400', badge: 'bg-red-50 text-red-600' },
                                                                            { label: 'Não compareceu', value: r.nao_compareceu, color: 'bg-pink-400', badge: 'bg-pink-50 text-pink-700' },
                                                                        ].map(item => {
                                                                            const maxVal = Math.max(r.contratacoes, r.reprovados, r.nao_compareceu, 1);
                                                                            const pct = Math.round((item.value / maxVal) * 100);
                                                                            return (
                                                                                <div key={item.label}>
                                                                                    <div className="flex items-center justify-between mb-1">
                                                                                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${item.badge}`}>
                                                                                            {item.label}
                                                                                        </span>
                                                                                        <span className="text-xs font-bold text-gray-600">{item.value}</span>
                                                                                    </div>
                                                                                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                                                        <div
                                                                                            className={`h-full rounded-full transition-all duration-500 ${item.color}`}
                                                                                            style={{ width: `${pct}%` }}
                                                                                        />
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </div>

                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Rodapé da tabela */}
                            {recrutadores.length === 0 && (
                                <div className="px-6 py-12 text-center">
                                    <p className="text-sm text-gray-400">Nenhum recrutador encontrado</p>
                                </div>
                            )}
                            {recrutadores.length > 0 && (
                                <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                                    <span>Mostrando {recrutadores.length} recrutador{recrutadores.length !== 1 ? 'es' : ''}</span>
                                    <span>Clique na linha para expandir detalhes</span>
                                </div>
                            )}
                        </div>

                    </div>
                </main>
            </div>
        </>
    );
}
