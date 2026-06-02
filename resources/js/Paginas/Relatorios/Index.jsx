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
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
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
                                                        className="w-full bg-[#080073] rounded-t-md transition-all duration-500"
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
