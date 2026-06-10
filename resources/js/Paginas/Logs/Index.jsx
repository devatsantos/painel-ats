import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import Sidebar from '../Componentes/Index';

export default function Logs({ logs, fileSize, filters }) {
    const [busca, setBusca] = useState(filters.search || '');
    const [level, setLevel] = useState(filters.level || '');
    const [expandedLogIndex, setExpandedLogIndex] = useState(null);
    const [typingTimeout, setTypingTimeout] = useState(null);

    // Sync state with props when filters change
    useEffect(() => {
        setBusca(filters.search || '');
        setLevel(filters.level || '');
    }, [filters]);

    const handleSearchChange = (val) => {
        setBusca(val);
        if (typingTimeout) clearTimeout(typingTimeout);
        setTypingTimeout(
            setTimeout(() => {
                router.get('/logs', 
                    { search: val, level: level }, 
                    { preserveState: true, replace: true, preserveScroll: true }
                );
            }, 400)
        );
    };

    const handleLevelChange = (val) => {
        setLevel(val);
        router.get('/logs', 
            { search: busca, level: val }, 
            { preserveState: true, replace: true, preserveScroll: true }
        );
    };

    const handleClearLogs = () => {
        if (confirm('Tem certeza de que deseja limpar permanentemente todo o arquivo de logs do sistema?')) {
            router.delete('/logs', {
                onSuccess: () => {
                    alert('Arquivo de logs limpo com sucesso.');
                }
            });
        }
    };

    const getLevelBadgeClass = (levelName) => {
        const lvl = levelName.toUpperCase();
        if (lvl === 'ERROR' || lvl === 'CRITICAL' || lvl === 'ALERT' || lvl === 'EMERGENCY') {
            return 'bg-red-100 text-red-800 border-red-200';
        }
        if (lvl === 'WARNING') {
            return 'bg-amber-100 text-amber-800 border-amber-200';
        }
        if (lvl === 'INFO') {
            return 'bg-blue-100 text-blue-800 border-blue-200';
        }
        return 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert('Copiado para a área de transferência!');
    };

    return (
        <>
            <Sidebar />
            <div className="flex min-h-screen bg-gray-50 md:ml-64">
                <main className="flex-1 p-6 lg:p-10">
                    
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 font-heading">Logs de Erro</h1>
                            <p className="text-gray-500 mt-1 text-sm">Monitoramento e depuração das exceções ocorridas no sistema.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-500 bg-white border border-gray-200 px-3 py-2 rounded-xl font-medium">
                                Tamanho do arquivo: <strong>{fileSize}</strong>
                            </span>
                            <button 
                                onClick={handleClearLogs} 
                                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2.5 rounded-xl shadow-sm text-sm transition cursor-pointer"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Limpar Logs
                            </button>
                        </div>
                    </div>

                    {/* Filters Bar */}
                    <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col md:flex-row gap-4 mb-6">
                        <div className="flex-1 relative">
                            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                value={busca}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                placeholder="Pesquisar por mensagem ou conteúdo do erro..."
                                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0C4773] focus:ring-2 focus:ring-[#0C4773]/20 transition"
                            />
                        </div>
                        <div className="w-full md:w-64">
                            <select
                                value={level}
                                onChange={(e) => handleLevelChange(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-[#0C4773] focus:ring-2 focus:ring-[#0C4773]/20 transition"
                            >
                                <option value="">Todos os Níveis</option>
                                <option value="ERROR">ERROR / CRITICAL</option>
                                <option value="WARNING">WARNING</option>
                                <option value="INFO">INFO</option>
                                <option value="DEBUG">DEBUG</option>
                            </select>
                        </div>
                    </div>

                    {/* Logs List */}
                    <div className="space-y-4">
                        {logs.length > 0 ? (
                            logs.map((log, index) => {
                                const isExpanded = expandedLogIndex === index;
                                return (
                                    <div key={index} className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden hover:shadow-md/5 transition duration-150">
                                        
                                        {/* Card Header & Brief info */}
                                        <div 
                                            onClick={() => setExpandedLogIndex(isExpanded ? null : index)}
                                            className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none bg-white hover:bg-gray-50/50 transition-colors"
                                        >
                                            <div className="flex-1 space-y-1.5">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase ${getLevelBadgeClass(log.level)}`}>
                                                        {log.level}
                                                    </span>
                                                    <span className="text-xs text-gray-400 font-mono">
                                                        [{log.date}]
                                                    </span>
                                                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded font-mono">
                                                        {log.env}
                                                    </span>
                                                </div>
                                                <h3 className="text-sm font-semibold text-gray-800 break-words leading-relaxed">
                                                    {log.message}
                                                </h3>
                                            </div>
                                            
                                            <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                                                {log.stack && (
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            copyToClipboard(`[${log.date}] ${log.env}.${log.level}: ${log.message}\n\n${log.stack}`);
                                                        }}
                                                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
                                                        title="Copiar erro completo"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m-5 4h5m-5 4h3m1 2a4 4 0 11-8 0 4 4 0 018 0z" />
                                                        </svg>
                                                    </button>
                                                )}
                                                <svg 
                                                    className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
                                                    fill="none" 
                                                    stroke="currentColor" 
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>

                                        {/* Stack Trace / Detail */}
                                        {isExpanded && log.stack && (
                                            <div className="border-t border-gray-100 bg-gray-50/50 p-5">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Stack Trace</span>
                                                    <button 
                                                        onClick={() => copyToClipboard(log.stack)}
                                                        className="inline-flex items-center gap-1.5 text-xs text-[#0C4773] hover:text-[#007EAE] font-semibold transition"
                                                    >
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                        </svg>
                                                        Copiar Stack Trace
                                                    </button>
                                                </div>
                                                <pre className="text-xs font-mono whitespace-pre-wrap break-words bg-gray-950 text-gray-300 p-4 rounded-xl max-h-[400px] overflow-y-auto leading-relaxed shadow-inner border border-white/5">
                                                    {log.stack}
                                                </pre>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="bg-white rounded-2xl border border-gray-200/80 p-12 text-center shadow-sm">
                                <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-sm font-medium text-gray-500">Nenhum log de erro encontrado com os filtros atuais.</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </>
    );
}
