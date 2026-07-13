import React, { useState } from 'react';
import { useForm, Head } from '@inertiajs/react';
import Sidebar from '../Componentes/Index';
import Paginacao from '../Componentes/Paginacao';
import FlashMessages from '../Componentes/FlashMessages';
import WhatsAppLink from '../Componentes/WhatsAppLink';

export default function Index({ ouvidorias }) {
    const [selectedOuvidoria, setSelectedOuvidoria] = useState(null);
    const { delete: destroy, processing } = useForm();

    const formatarData = (dataStr) => {
        return new Date(dataStr).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleDelete = (id) => {
        if (confirm('Tem certeza que deseja remover este relato da Ouvidoria permanentemente?')) {
            destroy(`/ouvidoria/${id}`, {
                onSuccess: () => {
                    setSelectedOuvidoria(null);
                }
            });
        }
    };

    const labelClasses = 'block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1';
    const detailValueClasses = 'text-sm font-semibold text-gray-800 bg-gray-50 p-2.5 rounded-xl border border-gray-100/50';

    return (
        <>
            <Head title="Ouvidoria - Admin" />
            <Sidebar />
            
            <div className="flex min-h-screen bg-gray-50 md:ml-64">
                <main className="flex-1 p-6 lg:p-10">

                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Ouvidoria</h1>
                            <p className="text-gray-500 mt-1">Gerencie e analise os relatos enviados pelos usuários e candidatos.</p>
                        </div>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-500 shadow-sm self-start">
                            <svg className="w-4 h-4 text-[#0C4773]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                            </svg>
                            {ouvidorias.total} relato{ouvidorias.total !== 1 ? 's' : ''} recebido{ouvidorias.total !== 1 ? 's' : ''}
                        </span>
                    </div>

                    <FlashMessages />

                    {/* List/Table */}
                    {ouvidorias.data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-gray-400 bg-white rounded-2xl border border-gray-200 shadow-sm">
                            <svg className="w-16 h-16 mb-4 text-gray-300 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                            </svg>
                            <p className="text-lg font-semibold text-gray-500">Nenhum relato na ouvidoria</p>
                            <p className="text-sm mt-1 text-gray-400">Os relatos enviados através da página pública serão exibidos aqui.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead>
                                            <tr className="border-b border-gray-100 bg-gray-50/50">
                                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Data</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Remetente</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Contato</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Situação</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Foto</th>
                                                <th className="px-6 py-4 w-28 text-right"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {ouvidorias.data.map((o) => (
                                                <tr key={o.id} className="hover:bg-gray-50/70 transition-colors group">
                                                    
                                                    {/* Data */}
                                                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 font-medium">
                                                        {formatarData(o.created_at)}
                                                    </td>

                                                    {/* Nome */}
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="font-semibold text-gray-800">
                                                            {o.nome || <span className="text-gray-400 italic">Anônimo</span>}
                                                        </span>
                                                    </td>

                                                    {/* Contatos */}
                                                    <td className="px-6 py-4 whitespace-nowrap space-y-1">
                                                        {o.email && (
                                                            <div className="text-xs text-gray-600 font-mono flex items-center gap-1">
                                                                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                                </svg>
                                                                {o.email}
                                                            </div>
                                                        )}
                                                        {o.telefone && (
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="text-xs text-gray-600 font-mono">{o.telefone}</span>
                                                                <WhatsAppLink telefone={o.telefone} />
                                                            </div>
                                                        )}
                                                        {!o.email && !o.telefone && (
                                                            <span className="text-xs text-gray-400 italic">—</span>
                                                        )}
                                                    </td>

                                                    {/* Resumo Relato */}
                                                    <td className="px-6 py-4 max-w-xs truncate text-gray-600">
                                                        {o.situacao}
                                                    </td>

                                                    {/* Foto (indicador) */}
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        {o.foto ? (
                                                            <span className="inline-flex items-center justify-center p-1 rounded-lg bg-emerald-50 text-emerald-600" title="Possui foto anexada">
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                </svg>
                                                            </span>
                                                        ) : (
                                                            <span className="text-gray-300 font-mono">—</span>
                                                        )}
                                                    </td>

                                                    {/* Ações */}
                                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={() => setSelectedOuvidoria(o)}
                                                                className="p-1.5 text-gray-400 hover:text-[#0C4773] hover:bg-[#0C4773]/10 rounded-lg transition-colors cursor-pointer"
                                                                title="Visualizar relato completo"
                                                            >
                                                                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                </svg>
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(o.id)}
                                                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                                                title="Excluir relato"
                                                            >
                                                                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <Paginacao paginacao={ouvidorias} />
                        </div>
                    )}
                </main>
            </div>

            {/* Modal de Detalhes do Relato */}
            {selectedOuvidoria && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="ds-modal-panel max-w-2xl max-h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                        
                        {/* Header Modal */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Relato da Ouvidoria</h2>
                                <p className="text-xs text-gray-400 mt-0.5">Enviado em {formatarData(selectedOuvidoria.created_at)}</p>
                            </div>
                            <button onClick={() => setSelectedOuvidoria(null)} className="ds-btn-icon">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Body Modal */}
                        <div className="p-6 overflow-y-auto space-y-5 flex-1">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 shrink-0">
                                <div>
                                    <span className={labelClasses}>Nome</span>
                                    <p className={detailValueClasses}>{selectedOuvidoria.nome || <span className="text-gray-400 italic">Anônimo</span>}</p>
                                </div>
                                <div>
                                    <span className={labelClasses}>E-mail</span>
                                    <p className={detailValueClasses}>{selectedOuvidoria.email || <span className="text-gray-400 italic">Anônimo</span>}</p>
                                </div>
                                <div>
                                    <span className={labelClasses}>Telefone</span>
                                    <div className={`${detailValueClasses} flex items-center justify-between`}>
                                        <span>{selectedOuvidoria.telefone || <span className="text-gray-400 italic">Anônimo</span>}</span>
                                        {selectedOuvidoria.telefone && <WhatsAppLink telefone={selectedOuvidoria.telefone} />}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <span className={labelClasses}>Situação / Manifesto</span>
                                <div className="text-sm text-gray-700 bg-gray-50/80 p-4 rounded-xl border border-gray-100/50 leading-relaxed whitespace-pre-wrap">
                                    {selectedOuvidoria.situacao}
                                </div>
                            </div>

                            {/* Foto Anexada */}
                            {selectedOuvidoria.foto && (
                                <div>
                                    <span className={labelClasses}>Foto / Anexo</span>
                                    <div className="mt-2 flex justify-center border border-gray-100 rounded-2xl overflow-hidden bg-slate-50 relative group/photo">
                                        <a href={selectedOuvidoria.foto} target="_blank" rel="noopener noreferrer" className="absolute top-3 right-3 p-2 bg-black/60 hover:bg-black/80 rounded-xl text-white opacity-0 group-hover/photo:opacity-100 transition-opacity" title="Abrir imagem em tamanho real">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                        </a>
                                        <img src={selectedOuvidoria.foto} alt="Anexo Ouvidoria" className="max-h-80 w-auto object-contain p-1" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer Modal */}
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center shrink-0 rounded-b-2xl">
                            <button
                                onClick={() => handleDelete(selectedOuvidoria.id)}
                                disabled={processing}
                                className="px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold rounded-xl transition cursor-pointer"
                            >
                                Excluir Relato
                            </button>
                            <button
                                onClick={() => setSelectedOuvidoria(null)}
                                className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition cursor-pointer"
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
