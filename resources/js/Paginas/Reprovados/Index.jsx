import React, { useState } from 'react';
import { useForm, Head, router } from '@inertiajs/react';
import Sidebar from '../Componentes/Index';
import Paginacao from '../Componentes/Paginacao';
import FlashMessages from '../Componentes/FlashMessages';

export default function Index({ reprovados, formularios, totalAtivos, totalExpirados, filtros }) {
    const { delete: destroy, processing } = useForm();
    const [selectedReprovado, setSelectedReprovado] = useState(null);
    const [busca, setBusca] = useState(filtros?.busca || '');
    const [formularioId, setFormularioId] = useState(filtros?.formulario_id || '');
    const [dataDe, setDataDe] = useState(filtros?.data_de || '');
    const [dataAte, setDataAte] = useState(filtros?.data_ate || '');
    const [ativos, setAtivos] = useState(filtros?.ativos || '');

    const formatarData = (dataStr) => {
        if (!dataStr) return '—';
        return new Date(dataStr).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatarDataCurta = (dataStr) => {
        if (!dataStr) return '—';
        return new Date(dataStr).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const isBloqueioAtivo = (reprovadoAte) => {
        if (!reprovadoAte) return false;
        return new Date(reprovadoAte) >= new Date();
    };

    const handleDelete = (id) => {
        if (confirm('Tem certeza que deseja remover este registro de reprovação?')) {
            destroy(`/reprovados/${id}`, {
                onSuccess: () => setSelectedReprovado(null),
            });
        }
    };

    const handleFiltrar = (e) => {
        e?.preventDefault();
        const params = {};
        if (busca) params.busca = busca;
        if (formularioId) params.formulario_id = formularioId;
        if (dataDe) params.data_de = dataDe;
        if (dataAte) params.data_ate = dataAte;
        if (ativos) params.ativos = ativos;
        router.get('/reprovados', params, { preserveState: true });
    };

    const handleLimparFiltros = () => {
        setBusca('');
        setFormularioId('');
        setDataDe('');
        setDataAte('');
        setAtivos('');
        router.get('/reprovados', {}, { preserveState: true });
    };

    const getIniciais = (nome) => {
        if (!nome) return '?';
        return nome.trim().split(/\s+/).map(p => p[0]).slice(0, 2).join('').toUpperCase();
    };

    const labelClasses = 'block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1';
    const detailValueClasses = 'text-sm font-semibold text-gray-800 bg-gray-50 p-2.5 rounded-xl border border-gray-100/50';

    return (
        <>
            <Head title="Reprovados" />
            <Sidebar />

            <div className="flex min-h-screen bg-gray-50 md:ml-64">
                <main className="flex-1 p-6 lg:p-10">

                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Reprovados</h1>
                            <p className="text-gray-500 mt-1">Candidatos bloqueados por reprovação no quiz (quarentena de 30 dias).</p>
                        </div>
                        <div className="flex gap-3 self-start">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 font-semibold shadow-sm">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                                {totalAtivos} bloqueio{totalAtivos !== 1 ? 's' : ''} ativo{totalAtivos !== 1 ? 's' : ''}
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-500 shadow-sm">
                                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {totalExpirados} expirado{totalExpirados !== 1 ? 's' : ''}
                            </span>
                        </div>
                    </div>

                    <FlashMessages />

                    {/* Filtros */}
                    <form onSubmit={handleFiltrar} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                            <div>
                                <label className={labelClasses}>Busca</label>
                                <input
                                    type="text"
                                    value={busca}
                                    onChange={(e) => setBusca(e.target.value)}
                                    placeholder="Nome ou CPF..."
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0C4773]/20 focus:border-[#0C4773] outline-none"
                                />
                            </div>
                            <div>
                                <label className={labelClasses}>Formulário</label>
                                <select
                                    value={formularioId}
                                    onChange={(e) => setFormularioId(e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0C4773]/20 focus:border-[#0C4773] outline-none bg-white"
                                >
                                    <option value="">Todos</option>
                                    {formularios.map((f) => (
                                        <option key={f.id} value={f.id}>{f.titulo_formulario}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className={labelClasses}>Data De</label>
                                <input
                                    type="date"
                                    value={dataDe}
                                    onChange={(e) => setDataDe(e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0C4773]/20 focus:border-[#0C4773] outline-none"
                                />
                            </div>
                            <div>
                                <label className={labelClasses}>Data Até</label>
                                <input
                                    type="date"
                                    value={dataAte}
                                    onChange={(e) => setDataAte(e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0C4773]/20 focus:border-[#0C4773] outline-none"
                                />
                            </div>
                            <div>
                                <label className={labelClasses}>Status</label>
                                <select
                                    value={ativos}
                                    onChange={(e) => setAtivos(e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0C4773]/20 focus:border-[#0C4773] outline-none bg-white"
                                >
                                    <option value="">Todos</option>
                                    <option value="true">Bloqueio Ativo</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-4">
                            <button
                                type="submit"
                                className="px-4 py-2 bg-[#0C4773] text-white text-sm font-semibold rounded-xl hover:bg-[#0a3a5e] transition-colors"
                            >
                                Filtrar
                            </button>
                            <button
                                type="button"
                                onClick={handleLimparFiltros}
                                className="px-4 py-2 bg-gray-100 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                            >
                                Limpar
                            </button>
                        </div>
                    </form>

                    {/* Table */}
                    {reprovados.data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-gray-400 bg-white rounded-2xl border border-gray-200 shadow-sm">
                            <svg className="w-16 h-16 mb-4 text-gray-300 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                            <p className="text-lg font-semibold text-gray-500">Nenhum registro de reprovação encontrado</p>
                            <p className="text-sm mt-1 text-gray-400">Os candidatos bloqueados por reprovação no quiz aparecerão aqui.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead>
                                            <tr className="border-b border-gray-100 bg-gray-50/50">
                                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Candidato</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">CPF</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Formulário</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Reprovado em</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Bloqueio até</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Status</th>
                                                <th className="px-6 py-4 w-28 text-right"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {reprovados.data.map((rep) => {
                                                const ativo = isBloqueioAtivo(rep.reprovado_ate);
                                                return (
                                                    <tr
                                                        key={rep.id}
                                                        className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                                                        onClick={() => setSelectedReprovado(rep)}
                                                    >
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-500 text-xs font-bold flex-shrink-0">
                                                                    {getIniciais(rep.candidato?.nome)}
                                                                </div>
                                                                <span className="font-semibold text-gray-800">
                                                                    {rep.candidato?.nome || 'Candidato Excluído'}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                                                            {rep.candidato?.cpf || '—'}
                                                        </td>
                                                        <td className="px-6 py-4 text-gray-600">
                                                            {rep.formulario?.titulo_formulario || '—'}
                                                        </td>
                                                        <td className="px-6 py-4 text-gray-500 text-xs">
                                                            {formatarData(rep.created_at)}
                                                        </td>
                                                        <td className="px-6 py-4 text-gray-500 text-xs">
                                                            {formatarDataCurta(rep.reprovado_ate)}
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            {ativo ? (
                                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-200">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"></span>
                                                                    Bloqueado
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-600 border border-green-200">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                                                                    Expirado
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); setSelectedReprovado(rep); }}
                                                                className="text-gray-400 hover:text-[#0C4773] transition-colors"
                                                                title="Ver detalhes"
                                                            >
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                </svg>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <Paginacao paginator={reprovados} />
                        </div>
                    )}

                    {/* Modal de Detalhes */}
                    {selectedReprovado && (
                        <div
                            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
                        >
                            <div
                                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Header do Modal */}
                                <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
                                    <h2 className="text-lg font-bold text-gray-900">Detalhes da Reprovação</h2>
                                    <button
                                        onClick={() => setSelectedReprovado(null)}
                                        className="text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="p-6 space-y-4">
                                    {/* Status Badge */}
                                    <div className="flex justify-center">
                                        {isBloqueioAtivo(selectedReprovado.reprovado_ate) ? (
                                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold bg-red-50 text-red-600 border border-red-200">
                                                <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></span>
                                                Bloqueio Ativo
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold bg-green-50 text-green-600 border border-green-200">
                                                <span className="w-2 h-2 rounded-full bg-green-400"></span>
                                                Bloqueio Expirado
                                            </span>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelClasses}>Candidato</label>
                                            <p className={detailValueClasses}>{selectedReprovado.candidato?.nome || 'Candidato Excluído'}</p>
                                        </div>
                                        <div>
                                            <label className={labelClasses}>CPF</label>
                                            <p className={detailValueClasses}>{selectedReprovado.candidato?.cpf || '—'}</p>
                                        </div>
                                        <div>
                                            <label className={labelClasses}>E-mail</label>
                                            <p className={detailValueClasses}>{selectedReprovado.candidato?.email || '—'}</p>
                                        </div>
                                        <div>
                                            <label className={labelClasses}>Telefone</label>
                                            <p className={detailValueClasses}>{selectedReprovado.candidato?.telefone || '—'}</p>
                                        </div>
                                        <div>
                                            <label className={labelClasses}>Formulário</label>
                                            <p className={detailValueClasses}>{selectedReprovado.formulario?.titulo_formulario || '—'}</p>
                                        </div>
                                        <div>
                                            <label className={labelClasses}>Reprovado em</label>
                                            <p className={detailValueClasses}>{formatarData(selectedReprovado.created_at)}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <label className={labelClasses}>Bloqueio válido até</label>
                                            <p className={detailValueClasses}>{formatarData(selectedReprovado.reprovado_ate)}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer do Modal */}
                                <div className="border-t border-gray-100 px-6 py-4 flex justify-between items-center">
                                    <button
                                        onClick={() => handleDelete(selectedReprovado.id)}
                                        disabled={processing}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        Remover Bloqueio
                                    </button>
                                    <button
                                        onClick={() => setSelectedReprovado(null)}
                                        className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                                    >
                                        Fechar
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </>
    );
}
