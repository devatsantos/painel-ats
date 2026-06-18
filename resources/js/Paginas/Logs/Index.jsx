import React, { useState, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import Sidebar from '../Componentes/Index';

export default function Logs({ logs, fileSize, filters }) {
    const { props } = usePage();
    const getCsrfToken = () =>
        document.querySelector('meta[name="csrf-token"]')?.content
        ?? props._token
        ?? '';

    const [activeTab, setActiveTab] = useState('logs');
    const [busca, setBusca] = useState(filters.search || '');
    const [level, setLevel] = useState(filters.level || '');
    const [expandedLogIndex, setExpandedLogIndex] = useState(null);
    const [typingTimeout, setTypingTimeout] = useState(null);

    // WhatsApp state
    const [whatsappStatus, setWhatsappStatus] = useState(null);
    const [whatsappLoading, setWhatsappLoading] = useState(false);
    const [whatsappNumero, setWhatsappNumero] = useState('');
    const [whatsappMensagem, setWhatsappMensagem] = useState('🔔 Mensagem de teste do Painel RH.\nSe você recebeu essa mensagem, o envio de WhatsApp está funcionando corretamente!');
    const [whatsappEnviando, setWhatsappEnviando] = useState(false);
    const [whatsappResultado, setWhatsappResultado] = useState(null);

    // Portal state
    const [portalStatus, setPortalStatus] = useState(null);
    const [portalLoading, setPortalLoading] = useState(false);
    const [portalNome, setPortalNome] = useState('');
    const [portalCpf, setPortalCpf] = useState('');
    const [portalEmail, setPortalEmail] = useState('');
    const [portalTelefone, setPortalTelefone] = useState('');
    const [portalEnviando, setPortalEnviando] = useState(false);
    const [portalResultado, setPortalResultado] = useState(null);

    // Email state
    const [emailStatus, setEmailStatus] = useState(null);
    const [emailLoading, setEmailLoading] = useState(false);
    const [emailDestino, setEmailDestino] = useState('');
    const [emailEnviando, setEmailEnviando] = useState(false);
    const [emailResultado, setEmailResultado] = useState(null);

    // Sync state with props when filters change
    useEffect(() => {
        setBusca(filters.search || '');
        setLevel(filters.level || '');
    }, [filters]);

    // Fetch status when tab changes
    useEffect(() => {
        if (activeTab === 'whatsapp') fetchWhatsappStatus();
        if (activeTab === 'portal') fetchPortalStatus();
        if (activeTab === 'email') fetchEmailStatus();
    }, [activeTab]);

    const fetchWhatsappStatus = async () => {
        setWhatsappLoading(true);
        try {
            const response = await fetch('/logs/whatsapp-status', {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });
            const data = await response.json();
            setWhatsappStatus(data);
        } catch (err) {
            setWhatsappStatus({
                connected: false,
                state: 'error',
                message: 'Não foi possível verificar o status.',
            });
        } finally {
            setWhatsappLoading(false);
        }
    };

    const fetchPortalStatus = async () => {
        setPortalLoading(true);
        try {
            const response = await fetch('/logs/portal-status', {
                headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            });
            const data = await response.json();
            setPortalStatus(data);
        } catch (err) {
            setPortalStatus({ connected: false, state: 'error', message: 'Não foi possível verificar o status.' });
        } finally {
            setPortalLoading(false);
        }
    };

    const fetchEmailStatus = async () => {
        setEmailLoading(true);
        try {
            const response = await fetch('/logs/email-status', {
                headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            });
            const data = await response.json();
            setEmailStatus(data);
        } catch (err) {
            setEmailStatus({ configured: false, error: 'Não foi possível carregar as configurações.' });
        } finally {
            setEmailLoading(false);
        }
    };

    const handleEnviarTesteEmail = async (e) => {
        e.preventDefault();
        setEmailEnviando(true);
        setEmailResultado(null);
        try {
            const response = await fetch('/logs/email-testar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
                body: JSON.stringify({ email: emailDestino }),
            });
            const data = await response.json();
            setEmailResultado(data);
        } catch (err) {
            setEmailResultado({ success: false, message: 'Erro de conexão ao enviar.' });
        } finally {
            setEmailEnviando(false);
        }
    };

    const handleEnviarTestePortal = async (e) => {
        e.preventDefault();
        setPortalEnviando(true);
        setPortalResultado(null);
        try {
            const response = await fetch('/logs/portal-testar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
                body: JSON.stringify({ nome: portalNome, cpf: portalCpf.replace(/\D/g, ''), email: portalEmail || null, telefone: portalTelefone || null }),
            });
            const data = await response.json();
            setPortalResultado(data);
        } catch (err) {
            setPortalResultado({ success: false, message: 'Erro de conexão ao enviar.' });
        } finally {
            setPortalEnviando(false);
        }
    };

    const handleEnviarTeste = async (e) => {
        e.preventDefault();
        setWhatsappEnviando(true);
        setWhatsappResultado(null);

        try {
            const response = await fetch('/logs/whatsapp-testar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
                body: JSON.stringify({
                    numero: whatsappNumero,
                    mensagem: whatsappMensagem,
                }),
            });
            const data = await response.json();
            setWhatsappResultado(data);
        } catch (err) {
            setWhatsappResultado({
                success: false,
                message: 'Erro de conexão ao enviar mensagem.',
            });
        } finally {
            setWhatsappEnviando(false);
        }
    };

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

    const phoneMask = (value) => {
        let v = value.replace(/\D/g, '');
        if (v.length > 11) v = v.slice(0, 11);
        if (v.length > 7) {
            return `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`;
        } else if (v.length > 2) {
            return `(${v.slice(0,2)}) ${v.slice(2)}`;
        } else if (v.length > 0) {
            return `(${v}`;
        }
        return v;
    };

    return (
        <>
            <Sidebar />
            <div className="flex min-h-screen bg-gray-50 md:ml-64">
                <main className="flex-1 p-6 lg:p-10">
                    
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Monitoramento</h1>
                            <p className="text-gray-500 mt-1 text-sm">Logs de erro e status dos serviços do sistema.</p>
                        </div>
                        {activeTab === 'logs' && (
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
                        )}
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-1 mb-6 bg-white p-1 rounded-xl border border-gray-200/80 shadow-sm w-fit">
                        <button
                            onClick={() => setActiveTab('logs')}
                            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
                                activeTab === 'logs'
                                    ? 'bg-[#0C4773] text-white shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            Logs de Erro
                        </button>
                        <button
                            onClick={() => setActiveTab('whatsapp')}
                            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
                                activeTab === 'whatsapp'
                                    ? 'bg-[#0C4773] text-white shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                            </svg>
                            WhatsApp
                            {whatsappStatus && (
                                <span className={`w-2 h-2 rounded-full ${whatsappStatus.connected ? 'bg-green-400' : 'bg-red-400'}`} />
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('portal')}
                            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
                                activeTab === 'portal'
                                    ? 'bg-[#0C4773] text-white shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                            Portal
                            {portalStatus && (
                                <span className={`w-2 h-2 rounded-full ${portalStatus.connected ? 'bg-green-400' : 'bg-red-400'}`} />
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('email')}
                            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
                                activeTab === 'email'
                                    ? 'bg-[#0C4773] text-white shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            E-mail
                            {emailResultado && (
                                <span className={`w-2 h-2 rounded-full ${emailResultado.success ? 'bg-green-400' : 'bg-red-400'}`} />
                            )}
                        </button>
                    </div>

                    {/* ==================== TAB: LOGS ==================== */}
                    {activeTab === 'logs' && (
                        <>
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
                        </>
                    )}

                    {/* ==================== TAB: WHATSAPP ==================== */}
                    {activeTab === 'whatsapp' && (
                        <div className="space-y-6">
                            {/* Status Card */}
                            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
                                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                            whatsappStatus?.connected 
                                                ? 'bg-green-100' 
                                                : 'bg-red-100'
                                        }`}>
                                            <svg className={`w-5 h-5 ${whatsappStatus?.connected ? 'text-green-600' : 'text-red-600'}`} viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-gray-800">Status da Conexão</h3>
                                            <p className="text-xs text-gray-500 mt-0.5">Evolution API — WhatsApp Business</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={fetchWhatsappStatus}
                                        disabled={whatsappLoading}
                                        className="inline-flex items-center gap-2 text-sm font-semibold text-[#0C4773] hover:text-[#007EAE] transition cursor-pointer disabled:opacity-50"
                                    >
                                        <svg className={`w-4 h-4 ${whatsappLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        Atualizar
                                    </button>
                                </div>

                                <div className="px-6 py-5">
                                    {whatsappLoading && !whatsappStatus ? (
                                        <div className="flex items-center gap-3 text-gray-500">
                                            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                            <span className="text-sm">Verificando conexão...</span>
                                        </div>
                                    ) : whatsappStatus ? (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${
                                                    whatsappStatus.connected
                                                        ? 'bg-green-50 border-green-200 text-green-700'
                                                        : 'bg-red-50 border-red-200 text-red-700'
                                                }`}>
                                                    <span className={`w-2 h-2 rounded-full ${whatsappStatus.connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                                                    {whatsappStatus.connected ? 'Conectado' : 'Desconectado'}
                                                </span>
                                                {whatsappStatus.instance && (
                                                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded font-mono">
                                                        {whatsappStatus.instance}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600">{whatsappStatus.message}</p>
                                            {whatsappStatus.state && whatsappStatus.state !== 'open' && (
                                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                                                    <div className="flex items-start gap-2">
                                                        <svg className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                                        </svg>
                                                        <div>
                                                            <p className="text-sm font-semibold text-amber-800">Atenção</p>
                                                            <p className="text-xs text-amber-700 mt-0.5">
                                                                O WhatsApp não está conectado. Verifique a instância na Evolution API e escaneie o QR Code novamente se necessário.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : null}
                                </div>
                            </div>

                            {/* Send Test Message Card */}
                            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
                                <div className="px-6 py-5 border-b border-gray-100">
                                    <h3 className="text-sm font-bold text-gray-800">Enviar Mensagem de Teste</h3>
                                    <p className="text-xs text-gray-500 mt-0.5">Verifique se o envio de mensagens está funcionando corretamente.</p>
                                </div>

                                <form onSubmit={handleEnviarTeste} className="px-6 py-5 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Número do WhatsApp <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={whatsappNumero}
                                            onChange={(e) => setWhatsappNumero(phoneMask(e.target.value))}
                                            placeholder="(11) 99999-9999"
                                            className="ds-input"
                                            required
                                        />
                                        <p className="text-xs text-gray-400 mt-1">Informe o número com DDD (sem código do país).</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Mensagem <span className="text-red-400">*</span>
                                        </label>
                                        <textarea
                                            value={whatsappMensagem}
                                            onChange={(e) => setWhatsappMensagem(e.target.value)}
                                            rows={3}
                                            className="ds-input resize-none"
                                            required
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={whatsappEnviando || !whatsappNumero}
                                        className="ds-btn ds-btn-primary"
                                    >
                                        {whatsappEnviando ? (
                                            <>
                                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                </svg>
                                                Enviando...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                                </svg>
                                                Enviar Mensagem de Teste
                                            </>
                                        )}
                                    </button>
                                </form>

                                {/* Result */}
                                {whatsappResultado && (
                                    <div className={`mx-6 mb-5 p-4 rounded-xl border ${
                                        whatsappResultado.success 
                                            ? 'bg-green-50 border-green-200' 
                                            : 'bg-red-50 border-red-200'
                                    }`}>
                                        <div className="flex items-start gap-2">
                                            {whatsappResultado.success ? (
                                                <svg className="w-5 h-5 text-green-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            ) : (
                                                <svg className="w-5 h-5 text-red-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            )}
                                            <div className="flex-1">
                                                <p className={`text-sm font-semibold ${whatsappResultado.success ? 'text-green-800' : 'text-red-800'}`}>
                                                    {whatsappResultado.message}
                                                </p>
                                                {whatsappResultado.response && (
                                                    <details className="mt-2">
                                                        <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700 transition">
                                                            Ver resposta da API
                                                        </summary>
                                                        <pre className="mt-2 text-xs font-mono bg-gray-950 text-gray-300 p-3 rounded-lg overflow-x-auto max-h-48">
                                                            {JSON.stringify(whatsappResultado.response, null, 2)}
                                                        </pre>
                                                    </details>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ==================== TAB: PORTAL ==================== */}
                    {activeTab === 'portal' && (
                        <div className="space-y-6">
                            {/* Status Card */}
                            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
                                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                            portalStatus?.connected ? 'bg-green-100' : 'bg-red-100'
                                        }`}>
                                            <svg className={`w-5 h-5 ${portalStatus?.connected ? 'text-green-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-gray-800">Status da Conexão</h3>
                                            <p className="text-xs text-gray-500 mt-0.5">Portal AT&Santos — Integração de Contratados</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={fetchPortalStatus}
                                        disabled={portalLoading}
                                        className="inline-flex items-center gap-2 text-sm font-semibold text-[#0C4773] hover:text-[#007EAE] transition cursor-pointer disabled:opacity-50"
                                    >
                                        <svg className={`w-4 h-4 ${portalLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        Atualizar
                                    </button>
                                </div>

                                <div className="px-6 py-5">
                                    {portalLoading && !portalStatus ? (
                                        <div className="flex items-center gap-3 text-gray-500">
                                            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                            <span className="text-sm">Verificando conexão...</span>
                                        </div>
                                    ) : portalStatus ? (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${
                                                    portalStatus.connected
                                                        ? 'bg-green-50 border-green-200 text-green-700'
                                                        : 'bg-red-50 border-red-200 text-red-700'
                                                }`}>
                                                    <span className={`w-2 h-2 rounded-full ${portalStatus.connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                                                    {portalStatus.connected ? 'Online' : 'Offline'}
                                                </span>
                                                {portalStatus.url && (
                                                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded font-mono">
                                                        {portalStatus.url}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600">{portalStatus.message}</p>
                                            {!portalStatus.connected && portalStatus.state !== 'not_configured' && (
                                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                                                    <div className="flex items-start gap-2">
                                                        <svg className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                                        </svg>
                                                        <div>
                                                            <p className="text-sm font-semibold text-amber-800">Atenção</p>
                                                            <p className="text-xs text-amber-700 mt-0.5">
                                                                O Portal não está respondendo. A integração de contratados continuará tentando, mas os dados não serão sincronizados até o portal voltar.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : null}
                                </div>
                            </div>

                            {/* Test Sync Card */}
                            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
                                <div className="px-6 py-5 border-b border-gray-100">
                                    <h3 className="text-sm font-bold text-gray-800">Teste de Sincronização</h3>
                                    <p className="text-xs text-gray-500 mt-0.5">Envie dados de teste para verificar se a integração está funcionando.</p>
                                </div>

                                <form onSubmit={handleEnviarTestePortal} className="px-6 py-5 space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Nome <span className="text-red-400">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={portalNome}
                                                onChange={(e) => setPortalNome(e.target.value)}
                                                placeholder="Nome completo de teste"
                                                className="ds-input"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                CPF <span className="text-red-400">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={portalCpf}
                                                onChange={(e) => {
                                                    let v = e.target.value.replace(/\D/g, '');
                                                    if (v.length > 11) v = v.slice(0, 11);
                                                    v = v.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})/, '$1-$2');
                                                    setPortalCpf(v);
                                                }}
                                                placeholder="000.000.000-00"
                                                className="ds-input"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                                            <input
                                                type="email"
                                                value={portalEmail}
                                                onChange={(e) => setPortalEmail(e.target.value)}
                                                placeholder="teste@email.com"
                                                className="ds-input"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                                            <input
                                                type="text"
                                                value={portalTelefone}
                                                onChange={(e) => setPortalTelefone(e.target.value)}
                                                placeholder="(11) 99999-9999"
                                                className="ds-input"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={portalEnviando || !portalNome || !portalCpf}
                                        className="ds-btn ds-btn-primary"
                                    >
                                        {portalEnviando ? (
                                            <>
                                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                </svg>
                                                Sincronizando...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                </svg>
                                                Enviar Teste de Sincronização
                                            </>
                                        )}
                                    </button>
                                </form>

                                {/* Result */}
                                {portalResultado && (
                                    <div className={`mx-6 mb-5 p-4 rounded-xl border ${
                                        portalResultado.success
                                            ? 'bg-green-50 border-green-200'
                                            : 'bg-red-50 border-red-200'
                                    }`}>
                                        <div className="flex items-start gap-2">
                                            {portalResultado.success ? (
                                                <svg className="w-5 h-5 text-green-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            ) : (
                                                <svg className="w-5 h-5 text-red-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            )}
                                            <div className="flex-1">
                                                <p className={`text-sm font-semibold ${portalResultado.success ? 'text-green-800' : 'text-red-800'}`}>
                                                    {portalResultado.message}
                                                </p>
                                                {portalResultado.action && (
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Ação realizada: <strong>{portalResultado.action === 'created' ? 'Novo colaborador criado' : 'Colaborador atualizado'}</strong>
                                                    </p>
                                                )}
                                                {portalResultado.collaborator && (
                                                    <details className="mt-2">
                                                        <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700 transition">
                                                            Ver resposta da API
                                                        </summary>
                                                        <pre className="mt-2 text-xs font-mono bg-gray-950 text-gray-300 p-3 rounded-lg overflow-x-auto max-h-48">
                                                            {JSON.stringify(portalResultado, null, 2)}
                                                        </pre>
                                                    </details>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ==================== TAB: E-MAIL ==================== */}
                    {activeTab === 'email' && (
                        <div className="space-y-6">
                            {/* Config Card */}
                            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
                                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-100">
                                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-gray-800">Configuração SMTP</h3>
                                            <p className="text-xs text-gray-500 mt-0.5">Parâmetros atuais do servidor de e-mail</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={fetchEmailStatus}
                                        disabled={emailLoading}
                                        className="inline-flex items-center gap-2 text-sm font-semibold text-[#0C4773] hover:text-[#007EAE] transition cursor-pointer disabled:opacity-50"
                                    >
                                        <svg className={`w-4 h-4 ${emailLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        Atualizar
                                    </button>
                                </div>
                                <div className="px-6 py-5">
                                    {emailLoading && !emailStatus ? (
                                        <div className="flex items-center gap-3 text-gray-500">
                                            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                            <span className="text-sm">Carregando configurações...</span>
                                        </div>
                                    ) : emailStatus ? (
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            {[
                                                { label: 'Driver', value: emailStatus.mailer },
                                                { label: 'Host SMTP', value: emailStatus.host },
                                                { label: 'Porta', value: emailStatus.port },
                                                { label: 'Criptografia', value: emailStatus.encryption },
                                                { label: 'Usuário', value: emailStatus.username },
                                                { label: 'Remetente', value: emailStatus.from },
                                            ].map(({ label, value }) => (
                                                <div key={label} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
                                                    <p className="text-sm font-mono text-gray-800 break-all">{value || '—'}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : null}
                                </div>
                            </div>

                            {/* Test Send Card */}
                            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
                                <div className="px-6 py-5 border-b border-gray-100">
                                    <h3 className="text-sm font-bold text-gray-800">Enviar E-mail de Teste</h3>
                                    <p className="text-xs text-gray-500 mt-0.5">Envia um e-mail real via SMTP para confirmar a entrega em produção.</p>
                                </div>
                                <form onSubmit={handleEnviarTesteEmail} className="px-6 py-5 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Endereço de e-mail destinatário <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            value={emailDestino}
                                            onChange={(e) => setEmailDestino(e.target.value)}
                                            placeholder="voce@exemplo.com"
                                            className="ds-input"
                                            required
                                        />
                                        <p className="text-xs text-gray-400 mt-1">O e-mail chegará com o assunto <strong>[TESTE SMTP] Painel RH</strong>.</p>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={emailEnviando || !emailDestino}
                                        className="ds-btn ds-btn-primary"
                                    >
                                        {emailEnviando ? (
                                            <>
                                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                </svg>
                                                Enviando...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                                </svg>
                                                Enviar E-mail de Teste
                                            </>
                                        )}
                                    </button>
                                </form>
                                {emailResultado && (
                                    <div className={`mx-6 mb-5 p-4 rounded-xl border ${emailResultado.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                        <div className="flex items-start gap-2">
                                            {emailResultado.success ? (
                                                <svg className="w-5 h-5 text-green-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            ) : (
                                                <svg className="w-5 h-5 text-red-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            )}
                                            <div className="flex-1">
                                                <p className={`text-sm font-semibold ${emailResultado.success ? 'text-green-800' : 'text-red-800'}`}>
                                                    {emailResultado.message}
                                                </p>
                                                {emailResultado.class && (
                                                    <p className="text-xs text-red-600 font-mono mt-1">{emailResultado.class}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </>
    );
}
