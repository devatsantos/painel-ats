import React from 'react';
import { Head } from '@inertiajs/react';
import Sidebar from '../Componentes/Index.jsx';

const STATUS_CONFIG = {
    contratado:     { bar: 'bg-emerald-400', badge: 'bg-emerald-100 text-emerald-700' },
    selecionado:    { bar: 'bg-orange-400',  badge: 'bg-orange-100 text-orange-700'  },
    reprovado:      { bar: 'bg-red-400',     badge: 'bg-red-100 text-red-600'        },
    recusou_vaga:   { bar: 'bg-yellow-400',  badge: 'bg-yellow-100 text-yellow-700'  },
    sem_vaga:       { bar: 'bg-gray-400',    badge: 'bg-gray-100 text-gray-600'      },
    nao_compareceu: { bar: 'bg-pink-400',    badge: 'bg-pink-100 text-pink-700'      },
};

function KpiCard({ label, value, suffix = '', sub }) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-1 hover:shadow-md transition-shadow">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{label}</p>
            <p className="text-3xl font-extrabold text-gray-900 tracking-tight">
                {value}<span className="text-lg font-semibold text-gray-500 ml-0.5">{suffix}</span>
            </p>
            {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
    );
}

export default function Relatorios({
    metricas,
    candidatos_por_status,
    vagas_destaque,
    entrevistas_por_mes,
    funil,
    escolaridades,
    regioes,
    entrevistas_tipo,
}) {
    const maxStatus = Math.max(...candidatos_por_status.map(s => s.total), 1);
    const maxEntrevistas = Math.max(...entrevistas_por_mes.map(e => e.total), 1);

    return (
        <>
            <Head title="Relatórios - Painel RH" />
            <div className="min-h-screen bg-gray-50 flex font-sans">
                <Sidebar />

                <main className="flex-1 p-6 md:pl-[280px] transition-all duration-300">
                    <div className="max-w-7xl mx-auto space-y-6">

                        {/* Header */}
                        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Visão geral</p>
                                <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Relatórios</h1>
                            </div>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                Dados em tempo real
                            </span>
                        </header>

                        {/* KPIs */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                            <KpiCard
                                label="Total de candidaturas"
                                value={metricas.total_candidaturas}
                                sub="Acumulado"
                            />
                            <KpiCard
                                label="Mais contratações no mês"
                                value={metricas.recrutador_destaque_total}
                                suffix={metricas.recrutador_destaque_total === 1 ? " contratação" : " contratações"}
                                sub={metricas.recrutador_destaque_total > 0 
                                    ? `Destaque: ${metricas.recrutador_destaque_nome}` 
                                    : "Nenhuma contratação este mês"}
                            />
                            <KpiCard
                                label="Tempo médio até contratação"
                                value={metricas.tempo_medio_dias}
                                suffix=" dias"
                                sub="Da candidatura ao contrato"
                            />
                            <KpiCard
                                label="Vagas preenchidas"
                                value={metricas.vagas_preenchidas}
                                sub="Vagas com candidatos contratados"
                            />
                            <KpiCard
                                label="Banco de Talentos"
                                value={metricas.banco_talentos_total}
                                sub="Candidatos qualificados na base"
                            />
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

                            {/* Candidatos por status */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h2 className="text-sm font-bold text-gray-700 mb-5">Candidatos por status</h2>
                                <div className="space-y-3.5">
                                    {candidatos_por_status.map(item => {
                                        const cfg = STATUS_CONFIG[item.status] ?? { bar: 'bg-gray-300', badge: 'bg-gray-100 text-gray-600' };
                                        const pct = Math.round((item.total / maxStatus) * 100);
                                        return (
                                            <div key={item.status}>
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.badge}`}>
                                                        {item.label}
                                                    </span>
                                                    <span className="text-xs font-bold text-gray-600">{item.total}</span>
                                                </div>
                                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-500 ${cfg.bar}`}
                                                        style={{ width: `${pct}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Entrevistas por mês */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h2 className="text-sm font-bold text-gray-700 mb-5">Entrevistas por mês</h2>
                                <div className="flex items-end justify-between gap-2 h-40">
                                    {entrevistas_por_mes.map(item => {
                                        const heightPct = Math.round((item.total / maxEntrevistas) * 100);
                                        return (
                                            <div key={item.mes} className="flex-1 flex flex-col items-center gap-1.5">
                                                <span className="text-xs font-bold text-gray-500">{item.total}</span>
                                                <div className="w-full bg-gray-100 rounded-t-md overflow-hidden flex flex-col justify-end" style={{ height: '100px' }}>
                                                    <div
                                                        className="w-full bg-[#071F30] rounded-t-md transition-all duration-500"
                                                        style={{ height: `${heightPct}%` }}
                                                    />
                                                </div>
                                                <span className="text-[11px] font-semibold text-gray-400">{item.mes}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Detalhes de Candidatos e Funil */}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

                            {/* Funil de Recrutamento */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
                                <div>
                                    <h2 className="text-sm font-bold text-gray-700 mb-5">Funil de Recrutamento</h2>
                                    <div className="space-y-4">
                                        <div className="relative">
                                            <div className="flex justify-between items-center bg-[#071F30]/5 border border-[#071F30]/10 rounded-xl p-4">
                                                <div>
                                                    <span className="text-xs font-semibold text-gray-400 uppercase">1. Candidaturas</span>
                                                    <p className="text-xl font-bold text-gray-800">{funil.candidaturas}</p>
                                                </div>
                                                <span className="text-xs font-bold text-[#071F30] bg-[#071F30]/10 px-2.5 py-1 rounded-lg">100%</span>
                                            </div>
                                        </div>

                                        <div className="flex justify-center -my-2.5 z-10 relative">
                                            <div className="bg-white border border-gray-100 rounded-full p-1.5 shadow-sm">
                                                <svg className="w-4 h-4 text-[#071F30]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 13l-7 7-7-7m14-6l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>

                                        <div className="relative">
                                            <div className="flex justify-between items-center bg-blue-50/50 border border-blue-100 rounded-xl p-4">
                                                <div>
                                                    <span className="text-xs font-semibold text-gray-400 uppercase">2. Entrevistas</span>
                                                    <p className="text-xl font-bold text-gray-800">{funil.entrevistas}</p>
                                                </div>
                                                <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-lg">
                                                    {funil.candidaturas > 0 ? Math.round((funil.entrevistas / funil.candidaturas) * 100) : 0}%
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex justify-center -my-2.5 z-10 relative">
                                            <div className="bg-white border border-gray-100 rounded-full p-1.5 shadow-sm">
                                                <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 13l-7 7-7-7m14-6l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>

                                        <div className="relative">
                                            <div className="flex justify-between items-center bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                                                <div>
                                                    <span className="text-xs font-semibold text-gray-400 uppercase">3. Contratados</span>
                                                    <p className="text-xl font-bold text-emerald-800">{funil.contratados}</p>
                                                </div>
                                                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg">
                                                    {funil.candidaturas > 0 ? Math.round((funil.contratados / funil.candidaturas) * 100) : 0}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                                    <span>Conversão geral do funil</span>
                                    <span className="font-bold text-emerald-600 text-sm">
                                        {funil.candidaturas > 0 ? ((funil.contratados / funil.candidaturas) * 100).toFixed(1) : '0.0'}%
                                    </span>
                                </div>
                            </div>

                            {/* Modalidade de Entrevistas */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
                                <div>
                                    <h2 className="text-sm font-bold text-gray-700 mb-5">Modalidade de Entrevistas</h2>
                                    <div className="space-y-6 mt-4">
                                        <div>
                                            <div className="flex justify-between text-xs font-semibold text-gray-500 mb-1">
                                                <span className="flex items-center gap-1.5">
                                                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                                                    Online (Google Meet)
                                                </span>
                                                <span>{entrevistas_tipo.online} ({
                                                    (entrevistas_tipo.online + entrevistas_tipo.presencial) > 0
                                                        ? Math.round((entrevistas_tipo.online / (entrevistas_tipo.online + entrevistas_tipo.presencial)) * 100)
                                                        : 0
                                                }%)</span>
                                            </div>
                                            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                                                    style={{
                                                        width: `${(entrevistas_tipo.online + entrevistas_tipo.presencial) > 0
                                                            ? (entrevistas_tipo.online / (entrevistas_tipo.online + entrevistas_tipo.presencial)) * 100
                                                            : 0}%`
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex justify-between text-xs font-semibold text-gray-500 mb-1">
                                                <span className="flex items-center gap-1.5">
                                                    <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                                                    Presencial (Na empresa)
                                                </span>
                                                <span>{entrevistas_tipo.presencial} ({
                                                    (entrevistas_tipo.online + entrevistas_tipo.presencial) > 0
                                                        ? Math.round((entrevistas_tipo.presencial / (entrevistas_tipo.online + entrevistas_tipo.presencial)) * 100)
                                                        : 0
                                                }%)</span>
                                            </div>
                                            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-slate-500 rounded-full transition-all duration-500"
                                                    style={{
                                                        width: `${(entrevistas_tipo.online + entrevistas_tipo.presencial) > 0
                                                            ? (entrevistas_tipo.presencial / (entrevistas_tipo.online + entrevistas_tipo.presencial)) * 100
                                                            : 0}%`
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-8 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                                    <span>Total de entrevistas</span>
                                    <span className="font-bold text-gray-700 text-sm">
                                        {entrevistas_tipo.online + entrevistas_tipo.presencial}
                                    </span>
                                </div>
                            </div>

                            {/* Escolaridade dos Candidatos */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h2 className="text-sm font-bold text-gray-700 mb-5">Escolaridade dos Candidatos</h2>
                                <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
                                    {escolaridades.length > 0 ? (
                                        escolaridades.map((item, idx) => {
                                            const totalCandidatos = escolaridades.reduce((acc, curr) => acc + curr.total, 0);
                                            const pct = totalCandidatos > 0 ? Math.round((item.total / totalCandidatos) * 100) : 0;
                                            const barColors = ['bg-[#071F30]', 'bg-[#007EAE]', 'bg-sky-400', 'bg-indigo-400', 'bg-violet-400'];
                                            const barColor = barColors[idx % barColors.length];

                                            return (
                                                <div key={item.label}>
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-xs font-semibold text-gray-600 truncate max-w-[150px]" title={item.label}>
                                                            {item.label}
                                                        </span>
                                                        <span className="text-xs font-bold text-gray-500">{item.total} ({pct}%)</span>
                                                    </div>
                                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                                                            style={{ width: `${pct}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <p className="text-xs text-gray-400 text-center py-4">Nenhum dado disponível</p>
                                    )}
                                </div>
                            </div>

                            {/* Regiões de Origem */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h2 className="text-sm font-bold text-gray-700 mb-5">Principais Regiões de Origem</h2>
                                <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
                                    {regioes.length > 0 ? (
                                        regioes.map((item, idx) => {
                                            const totalRegioes = regioes.reduce((acc, curr) => acc + curr.total, 0);
                                            const pct = totalRegioes > 0 ? Math.round((item.total / totalRegioes) * 100) : 0;
                                            const barColors = ['bg-[#071F30]', 'bg-[#007EAE]', 'bg-sky-400', 'bg-indigo-400', 'bg-violet-400'];
                                            const barColor = barColors[idx % barColors.length];

                                            return (
                                                <div key={item.label}>
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-xs font-semibold text-gray-600 truncate max-w-[150px]" title={item.label}>
                                                            {item.label}
                                                        </span>
                                                        <span className="text-xs font-bold text-gray-500">{item.total} ({pct}%)</span>
                                                    </div>
                                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                                                            style={{ width: `${pct}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <p className="text-xs text-gray-400 text-center py-4">Nenhum dado disponível</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Vagas em destaque */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100">
                                <h2 className="text-sm font-bold text-gray-700">Vagas — candidaturas e contratações</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-left border-b border-gray-100">
                                            <th className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Vaga</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider text-center">Candidaturas</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider text-center">Contratações</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider text-center">Taxa</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {vagas_destaque.map((vaga, i) => {
                                            const taxa = vaga.candidaturas > 0 ? Math.round((vaga.contratacoes / vaga.candidaturas) * 100) : 0;
                                            return (
                                                <tr key={i} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-3.5 font-medium text-gray-800">{vaga.titulo}</td>
                                                    <td className="px-6 py-3.5 text-center text-gray-600">{vaga.candidaturas}</td>
                                                    <td className="px-6 py-3.5 text-center text-gray-600">{vaga.contratacoes}</td>
                                                    <td className="px-6 py-3.5 text-center">
                                                        <span className="font-semibold text-gray-700">{taxa}%</span>
                                                    </td>
                                                    <td className="px-6 py-3.5 text-center">
                                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${vaga.ativo ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full ${vaga.ativo ? 'bg-emerald-400' : 'bg-gray-400'}`} />
                                                            {vaga.ativo ? 'Ativa' : 'Encerrada'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
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
