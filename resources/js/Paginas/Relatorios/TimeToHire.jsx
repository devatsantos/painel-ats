import React from 'react';
import { Head } from '@inertiajs/react';
import Sidebar from '../Componentes/Index.jsx';
import RelatoriosTabs from './RelatoriosTabs.jsx';

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

export default function TimeToHire({
    tempo_medio_geral, tempo_por_etapa, vagas_sla, sla_resumo,
    por_recrutador, por_area, tendencia_tempo, etapa_mais_lenta
}) {
    const maxTempo = Math.max(...tendencia_tempo.map(t => t.dias), 1);
    const maxRecrutadorTempo = Math.max(...por_recrutador.map(r => r.tempo_medio), 1);
    const maxAreaTempo = Math.max(...(por_area.length > 0 ? por_area.map(a => a.tempo_medio) : [1]), 1);

    return (
        <>
            <Head title="Relatórios — Time-to-Hire" />
            <div className="min-h-screen bg-gray-50 flex font-sans">
                <Sidebar />
                <main className="flex-1 p-6 md:pl-[280px] transition-all duration-300">
                    <div className="max-w-7xl mx-auto space-y-6">

                        <RelatoriosTabs subtitulo="Tempo de contratação" />

                        {/* KPIs */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <KpiCard label="Tempo médio geral" value={tempo_medio_geral} suffix=" dias" sub="Da candidatura à contratação" delay="bento-delay-1" accent="from-[#0C4773]/8" />
                            <KpiCard label="Vagas no prazo" value={`${sla_resumo.pct_dentro}%`} sub={`${sla_resumo.dentro} de ${sla_resumo.dentro + sla_resumo.fora} vagas`} delay="bento-delay-2" accent="from-emerald-50/60" />
                            <KpiCard label="Vagas atrasadas" value={sla_resumo.fora} sub="Fora do SLA definido" delay="bento-delay-3" accent="from-red-50/60" />
                            <div className="bento-card bento-delay-4 bg-gradient-to-br from-[#0C4773] to-[#007EAE] rounded-2xl shadow-sm border border-[#0C4773]/20 p-5 flex flex-col justify-center relative overflow-hidden">
                                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/5 rounded-full" />
                                <div className="relative z-10">
                                    <p className="text-xs font-semibold text-white/70 uppercase tracking-widest mb-1">Etapa mais lenta</p>
                                    <p className="text-2xl font-extrabold text-white tracking-tight">{etapa_mais_lenta?.etapa ?? '—'}</p>
                                    <p className="text-xs text-white/60 mt-1">{etapa_mais_lenta?.dias ?? 0} dias em média</p>
                                </div>
                            </div>
                        </div>

                        {/* Tempo por Etapa + Tendência */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {/* Tempo por Etapa */}
                            <div className="bento-card bento-delay-5 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h2 className="text-sm font-bold text-gray-700 mb-5 border-l-4 border-[#0C4773] pl-3">Tempo Médio por Etapa</h2>
                                <div className="space-y-4">
                                    {tempo_por_etapa.map((etapa, idx) => {
                                        const maxEtapa = Math.max(...tempo_por_etapa.map(e => e.dias), 1);
                                        const pct = Math.round((etapa.dias / maxEtapa) * 100);
                                        const colors = ['bg-[#0C4773]', 'bg-[#007EAE]', 'bg-violet-500'];
                                        return (
                                            <div key={idx}>
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <span className="text-sm font-semibold text-gray-700">{etapa.etapa}</span>
                                                    <span className="text-sm font-bold text-gray-800">{etapa.dias} <span className="text-gray-400 font-normal text-xs">dias</span></span>
                                                </div>
                                                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-700 ${colors[idx % colors.length]}`}
                                                        style={{ width: `${pct}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {tempo_por_etapa.length === 0 && (
                                        <p className="text-xs text-gray-400 text-center py-4">Sem dados de histórico disponíveis. Os dados serão coletados automaticamente a partir de agora.</p>
                                    )}
                                </div>
                            </div>

                            {/* Tendência mensal */}
                            <div className="bento-card bento-delay-5 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h2 className="text-sm font-bold text-gray-700 mb-5 border-l-4 border-violet-500 pl-3">Tendência — Tempo Médio por Mês</h2>
                                <div className="flex items-end justify-between gap-2 h-44">
                                    {tendencia_tempo.map(mes => {
                                        const hPct = maxTempo > 0 ? Math.round((mes.dias / maxTempo) * 100) : 0;
                                        return (
                                            <div key={mes.mes} className="flex-1 flex flex-col items-center gap-1.5">
                                                <span className="text-xs font-bold text-gray-500">{mes.dias > 0 ? `${mes.dias}d` : '—'}</span>
                                                <div className="w-full bg-gray-100 rounded-t-md overflow-hidden flex flex-col justify-end" style={{ height: '120px' }}>
                                                    <div
                                                        className="w-full bg-gradient-to-t from-[#0C4773] to-[#007EAE] rounded-t-md transition-all duration-500"
                                                        style={{ height: `${hPct}%`, minHeight: mes.dias > 0 ? '4px' : '0' }}
                                                    />
                                                </div>
                                                <span className="text-[11px] font-semibold text-gray-400">{mes.mes}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Comparativo por Recrutador + Área */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {/* Por Recrutador */}
                            <div className="bento-card bento-delay-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h2 className="text-sm font-bold text-gray-700 mb-5 border-l-4 border-amber-500 pl-3">Tempo por Recrutador</h2>
                                <div className="space-y-3.5">
                                    {por_recrutador.map((r, idx) => {
                                        const pct = Math.round((r.tempo_medio / maxRecrutadorTempo) * 100);
                                        return (
                                            <div key={idx}>
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-xs font-semibold text-gray-600">{r.nome}</span>
                                                    <span className="text-xs font-bold text-gray-700">{r.tempo_medio} <span className="text-gray-400 font-normal">dias</span> · <span className="text-gray-400">{r.total_contratacoes} contrat.</span></span>
                                                </div>
                                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-500 ${r.tempo_medio <= 15 ? 'bg-emerald-400' : r.tempo_medio <= 30 ? 'bg-amber-400' : 'bg-red-400'}`}
                                                        style={{ width: `${pct}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {por_recrutador.length === 0 && <p className="text-xs text-gray-400 text-center py-4">Nenhum dado disponível</p>}
                                </div>
                            </div>

                            {/* Por Área */}
                            <div className="bento-card bento-delay-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h2 className="text-sm font-bold text-gray-700 mb-5 border-l-4 border-teal-500 pl-3">Tempo por Área</h2>
                                <div className="space-y-3.5">
                                    {por_area.map((a, idx) => {
                                        const pct = Math.round((a.tempo_medio / maxAreaTempo) * 100);
                                        return (
                                            <div key={idx}>
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-xs font-semibold text-gray-600">{a.area}</span>
                                                    <span className="text-xs font-bold text-gray-700">{a.tempo_medio} <span className="text-gray-400 font-normal">dias</span> · <span className="text-gray-400">{a.total_contratacoes} contrat.</span></span>
                                                </div>
                                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-500 ${a.tempo_medio <= 15 ? 'bg-emerald-400' : a.tempo_medio <= 30 ? 'bg-amber-400' : 'bg-red-400'}`}
                                                        style={{ width: `${pct}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {por_area.length === 0 && <p className="text-xs text-gray-400 text-center py-4">Nenhuma vaga com área definida. Edite as vagas para adicionar a área/setor.</p>}
                                </div>
                            </div>
                        </div>

                        {/* Tabela SLA */}
                        <div className="bento-card bento-delay-6 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                                <h2 className="text-sm font-bold text-gray-700 border-l-4 border-[#0C4773] pl-3">Vagas — Cumprimento do SLA</h2>
                                <div className="flex items-center gap-3 text-xs text-gray-400">
                                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Dentro do SLA</span>
                                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" /> Fora do SLA</span>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-left border-b border-gray-100">
                                            <th className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Vaga</th>
                                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider text-center">SLA</th>
                                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider text-center">Dias Reais</th>
                                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider text-center">Status</th>
                                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider text-center">Situação</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {vagas_sla.map((v, i) => (
                                            <tr key={i} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-3.5 font-medium text-gray-800">{v.titulo}</td>
                                                <td className="px-4 py-3.5 text-center text-gray-600">{v.sla_dias} dias</td>
                                                <td className="px-4 py-3.5 text-center">
                                                    <span className={`font-bold ${v.dentro_sla ? 'text-emerald-600' : 'text-red-500'}`}>{v.dias_reais} dias</span>
                                                </td>
                                                <td className="px-4 py-3.5 text-center">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${v.dentro_sla ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${v.dentro_sla ? 'bg-emerald-400' : 'bg-red-400'}`} />
                                                        {v.dentro_sla ? 'No prazo' : 'Atrasada'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3.5 text-center">
                                                    <span className={`text-xs font-semibold ${v.preenchida ? 'text-emerald-600' : v.ativo ? 'text-amber-600' : 'text-gray-400'}`}>
                                                        {v.preenchida ? 'Preenchida' : v.ativo ? 'Aberta' : 'Encerrada'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                        {vagas_sla.length === 0 && (
                                            <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400 text-sm">Nenhuma vaga com SLA definido. Edite as vagas para configurar o prazo (SLA).</td></tr>
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
