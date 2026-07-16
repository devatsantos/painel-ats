import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import Sidebar from '../Componentes/Index';
import Paginacao from '../Componentes/Paginacao.jsx';

export default function Orcamentos({ orcamentos }) {
    const [modalOrcamento, setModalOrcamento] = useState(null);

    const formatDate = (dateString) => {
        const d = new Date(dateString);
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        }).format(d);
    };

    const renderStatusBadge = (status) => {
        if (status === 'enviado') {
            return (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Enviado
                </span>
            );
        }
        if (status === 'falhou') {
            return (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
                    Falhou
                </span>
            );
        }
        return (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-gray-50 text-gray-600 border border-gray-200">
                Pendente
            </span>
        );
    };

    return (
        <>
            <Head title="Orçamentos" />
            <Sidebar />
            <div className="flex min-h-screen bg-gray-50 md:ml-64">
                <main className="flex-1 p-4 pt-16 sm:p-6 sm:pt-16 md:p-8 lg:p-10 max-w-full overflow-hidden">
                    
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 md:mb-8 gap-4">
                        <div className="mt-2 sm:mt-0">
                            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Orçamentos</h1>
                            <p className="text-gray-500 mt-1">Gerencie e visualize as solicitações de orçamento recebidas.</p>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg">
                                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                {orcamentos.total} Registros
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
                        {orcamentos.data.map((orcamento) => (
                            <div key={orcamento.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col gap-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-gray-800">{orcamento.empresa}</h3>
                                            {renderStatusBadge(orcamento.status)}
                                        </div>
                                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            {orcamento.nome_representante}
                                        </p>
                                    </div>
                                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-md whitespace-nowrap">
                                        {formatDate(orcamento.created_at).split(',')[0]}
                                    </span>
                                </div>
                                
                                <div>
                                    <p className="text-sm text-gray-700 font-medium">{orcamento.iniciativa}</p>
                                    <p className="text-blue-600 text-xs mt-0.5 break-all">{orcamento.email}</p>
                                </div>

                                <button
                                    onClick={() => setModalOrcamento(orcamento)}
                                    className="mt-2 w-full inline-flex items-center justify-center p-2 text-white bg-[#0C4773] hover:bg-[#007EAE] focus:ring-4 focus:outline-none focus:ring-blue-100 font-medium rounded-lg text-sm transition-all"
                                >
                                    Ver Detalhes
                                </button>
                            </div>
                        ))}
                        {orcamentos.data.length === 0 && (
                            <div className="p-8 text-center text-gray-500 bg-white rounded-xl shadow-sm border border-gray-200">
                                <svg className="mx-auto h-12 w-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Nenhum orçamento encontrado.
                            </div>
                        )}
                    </div>

                    <div className="hidden lg:block bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 uppercase tracking-wider text-gray-500 text-xs border-b border-gray-200">
                                    <tr>
                                        <th className="px-4 py-4 font-semibold whitespace-nowrap">Empresa / Rep.</th>
                                        <th className="px-4 py-4 font-semibold whitespace-nowrap">Iniciativa</th>
                                        <th className="px-4 py-4 font-semibold hidden xl:table-cell whitespace-nowrap">Serviços</th>
                                        <th className="px-4 py-4 font-semibold hidden lg:table-cell whitespace-nowrap">Local</th>
                                        <th className="px-4 py-4 font-semibold text-center whitespace-nowrap">Status</th>
                                        <th className="px-4 py-4 font-semibold text-center whitespace-nowrap">Data</th>
                                        <th className="px-4 py-4 font-semibold text-right whitespace-nowrap">Ação</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {orcamentos.data.map((orcamento) => (
                                        <tr key={orcamento.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-4 py-4">
                                                <div className="flex flex-col min-w-[150px]">
                                                    <span className="font-semibold text-gray-800 line-clamp-1">{orcamento.empresa}</span>
                                                    <span className="text-gray-500 text-xs flex items-center gap-1 mt-0.5 line-clamp-1">
                                                        <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                        </svg>
                                                        {orcamento.nome_representante}
                                                    </span>
                                                    <span className="text-blue-600 text-xs hover:underline mt-0.5 line-clamp-1">{orcamento.email}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-gray-700 font-medium">
                                                <div className="min-w-[140px] max-w-[200px] xl:max-w-xs break-words line-clamp-2">
                                                    {orcamento.iniciativa}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 hidden xl:table-cell">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100 max-w-[180px] line-clamp-2">
                                                    {orcamento.servicos.length > 35 ? orcamento.servicos.substring(0, 35) + '...' : orcamento.servicos}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-gray-500 hidden lg:table-cell whitespace-nowrap">
                                                {orcamento.cidade} - {orcamento.estado}
                                            </td>
                                            <td className="px-4 py-4 text-center whitespace-nowrap">
                                                {renderStatusBadge(orcamento.status)}
                                            </td>
                                            <td className="px-4 py-4 text-center text-gray-500 whitespace-nowrap text-xs">
                                                <span className="block xl:inline">{formatDate(orcamento.created_at).split(',')[0]}</span>
                                                <span className="hidden xl:inline">, {formatDate(orcamento.created_at).split(',')[1]}</span>
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <button
                                                    onClick={() => setModalOrcamento(orcamento)}
                                                    className="inline-flex items-center justify-center p-2 text-white bg-[#0C4773] hover:bg-[#007EAE] focus:ring-4 focus:outline-none focus:ring-blue-100 font-medium rounded-lg text-sm transition-all"
                                                >
                                                    Detalhes
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {orcamentos.data.length === 0 && (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                                <svg className="mx-auto h-12 w-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                Nenhum orçamento encontrado.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <Paginacao paginacao={orcamentos} />
                </main>
            </div>

            {modalOrcamento && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                        
                        <div className="flex-shrink-0 flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100">
                            <h3 className="text-lg sm:text-xl font-bold text-[#0C4773] flex items-center gap-2">
                                <span className="w-1.5 h-5 sm:h-6 bg-[#0C4773] rounded-full inline-block"></span>
                                Detalhes do Orçamento
                            </h3>
                            <button
                                onClick={() => setModalOrcamento(null)}
                                className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-all"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-4 sm:p-6 space-y-5 sm:space-y-6 overflow-y-auto flex-1">
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <p className="text-xs font-semibold text-gray-400 uppercase">Empresa / Iniciativa</p>
                                        {renderStatusBadge(modalOrcamento.status)}
                                    </div>
                                    <p className="text-sm font-medium text-gray-800">{modalOrcamento.empresa}</p>
                                    <p className="text-sm text-gray-600">{modalOrcamento.iniciativa}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold text-gray-400 uppercase">Data da Solicitação</p>
                                    <p className="text-sm font-medium text-gray-800">{formatDate(modalOrcamento.created_at)}</p>
                                </div>

                                <div className="col-span-1 md:col-span-2 border-t border-gray-100 pt-4">
                                    <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Contato do Representante</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                            <p className="text-xs text-gray-500 mb-1">Nome e Telefone</p>
                                            <p className="text-sm font-medium text-gray-800">{modalOrcamento.nome_representante}</p>
                                            <p className="text-sm text-blue-600 font-medium mt-0.5">{modalOrcamento.telefone}</p>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                            <p className="text-xs text-gray-500 mb-1">E-mail e Local</p>
                                            <p className="text-sm font-medium text-gray-800 break-all">{modalOrcamento.email}</p>
                                            <p className="text-sm text-gray-600 mt-0.5">{modalOrcamento.cidade} - {modalOrcamento.estado}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-span-1 md:col-span-2 border-t border-gray-100 pt-4">
                                    <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Serviços Desejados</p>
                                    <div className="bg-indigo-50/50 p-3 rounded-lg border border-indigo-100">
                                        <p className="text-sm font-medium text-indigo-900">{modalOrcamento.servicos}</p>
                                    </div>
                                </div>

                                <div className="col-span-1 md:col-span-2 border-t border-gray-100 pt-4">
                                    <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Descrição / Escopo</p>
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                                            {modalOrcamento.descricao}
                                        </p>
                                    </div>
                                </div>

                                {modalOrcamento.anexo_referencia && (
                                    <div className="col-span-1 md:col-span-2 border-t border-gray-100 pt-4">
                                        <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Anexo de Referência</p>
                                        <a href={`/arquivos/${modalOrcamento.anexo_referencia}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:border-blue-400 hover:text-blue-600 rounded-xl text-sm font-medium text-gray-700 hover:shadow-sm transition-all">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                            </svg>
                                            {modalOrcamento.anexo_referencia.split('/').pop()}
                                        </a>
                                    </div>
                                )}
                            </div>

                        </div>

                        <div className="flex-shrink-0 px-4 sm:px-6 py-3 sm:py-4 bg-gray-50/50 border-t border-gray-100 rounded-b-2xl flex justify-end">
                            <button
                                onClick={() => setModalOrcamento(null)}
                                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm"
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
