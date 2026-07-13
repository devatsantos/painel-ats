import React, { useState, useEffect } from 'react';
import { Head, useForm, router, usePage, Link } from '@inertiajs/react';
import axios from 'axios';

function getIniciais(nome) {
    if (!nome) return '?';
    return nome.trim().split(/\s+/).map(p => p[0]).slice(0, 2).join('').toUpperCase();
}

function KpiCard({ label, value, icon, accent = 'bg-blue-50 text-blue-600' }) {
    return (
        <div className="ds-kpi">
            <div className={`ds-kpi-icon ${accent}`}>
                {icon}
            </div>
            <div className="relative z-10">
                <p className="ds-kpi-value">{value}</p>
                <p className="ds-kpi-label">{label}</p>
            </div>
        </div>
    );
}

function FlashMessage() {
    const { flash } = usePage().props;
    if (!flash?.success && !flash?.error) return null;
    return (
        <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium ${flash.success ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {flash.success || flash.error}
        </div>
    );
}

export default function Recepcao({ registros, filtros, metricas, entrevistas_presenciais = [], horario_servidor }) {
    const { props } = usePage();
    const nomeUsuario = props.auth?.user?.nome ?? 'Recepcionista';
    const logoWhiteUrl = props.appConfig?.logo_white_url;

    // Calcula a diferença entre o relógio do servidor e o relógio local do cliente
    const serverTime = new Date(horario_servidor);
    const localTime = new Date();
    const serverOffset = serverTime.getTime() - localTime.getTime();

    const obterHorarioAtualServidor = () => {
        const dataServidor = new Date(Date.now() + serverOffset);
        const ano = dataServidor.getFullYear();
        const mes = String(dataServidor.getMonth() + 1).padStart(2, '0');
        const dia = String(dataServidor.getDate()).padStart(2, '0');
        const horas = String(dataServidor.getHours()).padStart(2, '0');
        const minutos = String(dataServidor.getMinutes()).padStart(2, '0');
        return `${ano}-${mes}-${dia}T${horas}:${minutos}`;
    };

    const [sugestoes, setSugestoes] = useState([]);
    const [mostrarSugestoes, setMostrarSugestoes] = useState(false);
    const [debounceTimeout, setDebounceTimeout] = useState(null);

    const handleNomeChange = (val) => {
        setData('nome', val);
        if (debounceTimeout) clearTimeout(debounceTimeout);

        if (val.trim().length >= 2) {
            setDebounceTimeout(
                setTimeout(async () => {
                    try {
                        const res = await axios.get(`/recepcao/autocomplete?q=${encodeURIComponent(val)}`);
                        setSugestoes(res.data || []);
                        setMostrarSugestoes(true);
                    } catch (err) {
                        setSugestoes([]);
                    }
                }, 300)
            );
        } else {
            setSugestoes([]);
            setMostrarSugestoes(false);
        }
    };

    const selecionarSugestao = (sug) => {
        setData(prev => ({
            ...prev,
            nome: sug.nome,
            contato: sug.contato || prev.contato,
            posto_cargo_empresa: sug.posto_cargo_empresa || prev.posto_cargo_empresa,
            departamento_responsavel: sug.departamento_responsavel || prev.departamento_responsavel,
        }));
        setMostrarSugestoes(false);
    };

    const [modalAberto, setModalAberto] = useState(false);
    const [editando, setEditando] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        nome: '',
        assunto: '',
        posto_cargo_empresa: '',
        departamento_responsavel: '',
        contato: '',
        horario_entrada: obterHorarioAtualServidor(),
        retorno: '',
        indicacao: '',
    });

    const abrirNovoRegistro = () => {
        reset();
        setData('horario_entrada', obterHorarioAtualServidor());
        setEditando(null);
        setModalAberto(true);
    };

    const abrirEdicao = (registro) => {
        setEditando(registro.id);
        setData({
            nome: registro.nome,
            assunto: registro.assunto,
            posto_cargo_empresa: registro.posto_cargo_empresa ?? '',
            departamento_responsavel: registro.departamento_responsavel,
            contato: registro.contato ?? '',
            horario_entrada: registro.horario_entrada?.slice(0, 16) ?? '',
            retorno: registro.retorno ?? '',
            indicacao: registro.indicacao ?? '',
        });
        setModalAberto(true);
    };

    const fecharModal = () => {
        setModalAberto(false);
        setEditando(null);
        reset();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editando) {
            put(`/recepcao/${editando}`, { onSuccess: fecharModal });
        } else {
            post('/recepcao', { onSuccess: fecharModal });
        }
    };

    const handleSaida = (id) => {
        router.put(`/recepcao/${id}/saida`, {}, { preserveScroll: true });
    };

    const handleDelete = (id) => {
        router.delete(`/recepcao/${id}`, { preserveScroll: true });
        setConfirmDelete(null);
    };

    const handleFiltro = (campo, valor) => {
        router.get('/recepcao', { ...filtros, [campo]: valor }, { preserveState: true, replace: true });
    };

    const hojeStr = new Date().toISOString().slice(0, 10);

    return (
        <>
            <Head title="Recepção - Painel RH" />
            <div className="min-h-screen bg-gray-50 font-sans">

                {/* ── Top Bar ── */}
                <header className="bg-[#071F30] text-white shadow-lg relative">
                    <div className="absolute bottom-0 left-0 right-0 ds-accent-line" />
                    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <img 
                                src={logoWhiteUrl} 
                                alt="AT & Santos Logo" 
                                className="h-7 w-auto object-contain"
                            />
                            <div className="border-l border-white/20 pl-3">
                                <h1 className="text-xs font-black tracking-widest uppercase leading-none">Recepção</h1>
                                <p className="text-[9px] text-blue-200/60 mt-0.5 uppercase tracking-wider">Controle de Visitantes</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">

                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-semibold text-white/90">{nomeUsuario}</p>
                                <p className="text-[10px] text-blue-200/50 uppercase tracking-wider">Recepção</p>
                            </div>
                            <div className="ds-avatar ds-avatar-md bg-teal-500 text-white">
                                {getIniciais(nomeUsuario)}
                            </div>
                            <Link
                                href="/logout"
                                method="post"
                                as="button"
                                className="ml-2 p-2 rounded-lg text-blue-200/60 hover:text-red-400 hover:bg-white/5 transition-colors"
                                title="Sair"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                            </Link>
                        </div>
                    </div>
                </header>

                {/* ── Conteúdo Principal ── */}
                <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

                    <FlashMessage />

                    {/* ── KPIs ── */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <KpiCard
                            label="Visitantes hoje"
                            value={metricas.total_hoje}
                            accent="bg-[#0C4773]/10 text-[#0C4773]"
                            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                        />
                        <KpiCard
                            label="Presentes agora"
                            value={metricas.presentes_agora}
                            accent="bg-emerald-50 text-emerald-600"
                            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                        />
                        <KpiCard
                            label="Já saíram"
                            value={metricas.ja_sairam}
                            accent="bg-amber-50 text-amber-600"
                            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>}
                        />
                        <KpiCard
                            label="Total no mês"
                            value={metricas.total_mes}
                            accent="bg-violet-50 text-violet-600"
                            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                        />
                    </div>

                    {/* ── Split Layout Dashboard ── */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                        
                        {/* Coluna da Esquerda (Visitantes) */}
                        <div className="lg:col-span-3 space-y-6">
                            {/* Barra de Ações */}
                            <div className="ds-card-static p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
                                    {/* Busca */}
                                    <div className="relative flex-1 min-w-0">
                                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        <input
                                            type="text"
                                            defaultValue={filtros.busca}
                                            placeholder="Buscar por nome, assunto ou depto..."
                                            onKeyDown={(e) => e.key === 'Enter' && handleFiltro('busca', e.target.value)}
                                            onBlur={(e) => e.target.value !== filtros.busca && handleFiltro('busca', e.target.value)}
                                            className="ds-input pl-9"
                                        />
                                    </div>
                                    {/* Data */}
                                    <div className="w-full sm:w-44">
                                        <input
                                            type="date"
                                            value={filtros.data}
                                            onChange={(e) => handleFiltro('data', e.target.value)}
                                            className="ds-input cursor-pointer"
                                        />
                                    </div>
                                    {/* Status */}
                                    <div className="w-full sm:w-48">
                                        <select
                                            value={filtros.status || ''}
                                            onChange={(e) => handleFiltro('status', e.target.value)}
                                            className="ds-input cursor-pointer"
                                        >
                                            <option value="">Todos os Visitantes</option>
                                            <option value="presente">Apenas Presentes</option>
                                            <option value="saiu">Já Saíram</option>
                                        </select>
                                    </div>
                                </div>
                                {/* Ações */}
                                <div className="flex items-center gap-3 shrink-0">
                                    <button
                                        onClick={() => window.open(`/recepcao/exportar?data=${filtros.data}`, '_blank')}
                                        className="ds-btn ds-btn-secondary flex-1 sm:flex-none cursor-pointer flex items-center justify-center gap-1.5"
                                        title="Exportar registros do dia para CSV"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Exportar CSV
                                    </button>
                                    <button
                                        onClick={abrirNovoRegistro}
                                        className="ds-btn ds-btn-primary flex-1 sm:flex-none cursor-pointer flex items-center justify-center gap-1.5"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Novo Visitante
                                    </button>
                                </div>
                            </div>

                            {/* Tabela de Visitantes */}
                            <div className="ds-card-static overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="ds-table">
                                        <thead>
                                            <tr>
                                                <th>Visitante</th>
                                                <th>Assunto</th>
                                                <th className="hidden md:table-cell">Departamento</th>
                                                <th className="text-center">Horário</th>
                                                <th className="text-center">Status</th>
                                                <th className="text-right">Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {registros.data.length > 0 ? (
                                                registros.data.map((reg) => (
                                                    <tr key={reg.id}>
                                                        {/* Visitante */}
                                                        <td>
                                                            <div className="flex items-center gap-2.5">
                                                                <div className="ds-avatar ds-avatar-sm bg-[#0C4773] text-white">
                                                                    {getIniciais(reg.nome)}
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className="font-semibold text-gray-800 truncate text-sm">{reg.nome}</p>
                                                                    <p className="text-[11px] text-gray-400 truncate">
                                                                        {[reg.posto_cargo_empresa, reg.contato].filter(Boolean).join(' · ') || '—'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        {/* Assunto */}
                                                        <td className="max-w-[180px]">
                                                            <p className="text-gray-700 truncate text-xs" title={reg.assunto}>{reg.assunto}</p>
                                                            {reg.indicacao && (
                                                                <p className="text-[10px] text-gray-400 truncate mt-0.5" title={reg.indicacao}>Indicação: {reg.indicacao}</p>
                                                            )}
                                                        </td>
                                                        {/* Departamento */}
                                                        <td className="hidden md:table-cell">
                                                            <span className="ds-badge bg-blue-50 text-blue-700 border border-blue-100/30">
                                                                {reg.departamento_responsavel}
                                                            </span>
                                                            {reg.retorno && (
                                                                <p className="text-[10px] text-gray-450 truncate mt-1 max-w-[140px] flex items-center gap-1" title={reg.retorno}>
                                                                    <svg className="w-3 h-3 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                                                    </svg>
                                                                    {reg.retorno}
                                                                </p>
                                                            )}
                                                        </td>
                                                        {/* Horário */}
                                                        <td className="text-center">
                                                            <div className="inline-flex items-center gap-1 font-mono text-xs text-gray-650 bg-gray-50 px-2 py-1 rounded-lg">
                                                                <span className="font-bold text-gray-700">
                                                                    {reg.horario_entrada ? new Date(reg.horario_entrada).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '—'}
                                                                </span>
                                                                <span className="text-gray-300">→</span>
                                                                <span className={reg.horario_saida ? 'text-gray-500 font-bold' : 'text-gray-300'}>
                                                                    {reg.horario_saida ? new Date(reg.horario_saida).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '—'}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        {/* Status */}
                                                        <td className="text-center">
                                                            {reg.horario_saida ? (
                                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200/50">
                                                                    Saiu
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100/50">
                                                                    <span className="w-1 h-1 rounded-full bg-emerald-500 animate-ping" />
                                                                    Presente
                                                                </span>
                                                            )}
                                                        </td>
                                                        {/* Ações */}
                                                        <td className="text-right">
                                                            <div className="flex items-center justify-end gap-1">
                                                                {!reg.horario_saida && (
                                                                    <button
                                                                        onClick={() => handleSaida(reg.id)}
                                                                        className="ds-btn-icon ds-btn-icon-success"
                                                                        title="Registrar saída"
                                                                    >
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                                        </svg>
                                                                    </button>
                                                                )}
                                                                <button
                                                                    onClick={() => abrirEdicao(reg)}
                                                                    className="ds-btn-icon"
                                                                    title="Editar"
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                    </svg>
                                                                </button>
                                                                <button
                                                                    onClick={() => setConfirmDelete(reg.id)}
                                                                    className="ds-btn-icon ds-btn-icon-danger"
                                                                    title="Excluir"
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={6}>
                                                        <div className="ds-empty">
                                                            <div className="ds-empty-icon">
                                                                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                </svg>
                                                            </div>
                                                            <p className="ds-empty-title">Nenhum visitante registrado nesta data.</p>
                                                            <p className="ds-empty-desc">Clique em "Novo Visitante" para começar.</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Paginação */}
                                {registros.last_page > 1 && (
                                    <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                                        <p className="text-xs text-gray-400">
                                            Mostrando {registros.from}–{registros.to} de {registros.total}
                                        </p>
                                        <div className="flex gap-1">
                                            {registros.links.map((link, i) => (
                                                <button
                                                    key={i}
                                                    disabled={!link.url}
                                                    onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                                                        link.active
                                                            ? 'bg-[#0C4773] text-white shadow-sm'
                                                            : link.url
                                                                ? 'text-gray-600 hover:bg-gray-200'
                                                                : 'text-gray-300 cursor-not-allowed'
                                                    }`}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="px-5 py-2.5 bg-gray-50 border-t border-gray-100 text-xs text-gray-400">
                                    {registros.total} registro{registros.total !== 1 ? 's' : ''} encontrado{registros.total !== 1 ? 's' : ''}
                                </div>
                            </div>
                        </div>

                        {/* Coluna da Direita (Entrevistas Presenciais) */}
                        <div className="lg:sticky lg:top-24 space-y-6">
                            <div className="ds-card-static overflow-hidden">
                                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center border border-orange-100/50">
                                            <svg className="w-4.5 h-4.5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h2 className="text-sm font-bold text-gray-700">Entrevistas Presenciais</h2>
                                            <p className="text-[10px] text-gray-400">Agendamentos de hoje</p>
                                        </div>
                                    </div>
                                    <span className="inline-flex items-center justify-center bg-orange-100 text-orange-800 text-xs font-extrabold px-2.5 py-0.5 rounded-full">
                                        {entrevistas_presenciais.length}
                                    </span>
                                </div>

                                <div className="p-4 space-y-3 max-h-[520px] overflow-y-auto ds-scrollbar">
                                    {entrevistas_presenciais.length > 0 ? (
                                        entrevistas_presenciais.map((ent) => {
                                            const statusConfig = {
                                                marcada:        { label: 'Agendada',        cls: 'bg-blue-50 text-blue-700 border-blue-100', accent: 'bg-blue-500' },
                                                selecionado:    { label: 'Selecionado',      cls: 'bg-orange-50 text-orange-700 border-orange-100', accent: 'bg-orange-500' },
                                                contratado:     { label: 'Contratado',       cls: 'bg-emerald-50 text-emerald-700 border-emerald-100', accent: 'bg-emerald-500' },
                                                reprovado:      { label: 'Reprovado',        cls: 'bg-red-50 text-red-700 border-red-100', accent: 'bg-red-500' },
                                                recusou_vaga:   { label: 'Recusou Vaga',     cls: 'bg-yellow-50 text-yellow-700 border-yellow-100', accent: 'bg-yellow-500' },
                                                sem_vaga:       { label: 'Sem Vaga',         cls: 'bg-gray-50 text-gray-700 border-gray-100', accent: 'bg-gray-400' },
                                                nao_compareceu: { label: 'Não Compareceu',   cls: 'bg-pink-50 text-pink-700 border-pink-100', accent: 'bg-pink-500' },
                                            };
                                            const st = statusConfig[ent.status] ?? { label: ent.status, cls: 'bg-gray-50 text-gray-600 border-gray-100', accent: 'bg-gray-400' };

                                            return (
                                                <div key={ent.id} className="relative group bg-white border border-gray-100 hover:border-gray-200/80 pl-5 pr-3.5 py-3.5 rounded-xl shadow-xs transition duration-200 flex items-center justify-between gap-3 overflow-hidden">
                                                    {/* Faixa lateral indicadora de status */}
                                                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${st.accent}`} />
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <div className="flex flex-col items-center justify-center bg-gray-50 border border-gray-200/60 rounded-xl px-2 py-1 shrink-0 min-w-[52px] text-center font-mono">
                                                            <span className="text-[8px] text-gray-400 font-bold uppercase leading-none tracking-wider">Hora</span>
                                                            <span className="text-[11px] font-black text-gray-750 mt-0.5">
                                                                {new Date(ent.data_hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                                <span className="font-bold text-gray-900 text-xs truncate max-w-[110px]" title={ent.candidato_nome}>{ent.candidato_nome}</span>
                                                            </div>
                                                            <p className="text-[10px] text-gray-500 mt-0.5 truncate max-w-[130px]" title={ent.vaga_titulo}>
                                                                {ent.vaga_titulo}
                                                            </p>
                                                            <p className="text-[9px] text-gray-400 mt-0.5">
                                                                {ent.candidato_telefone}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="shrink-0">
                                                        {['marcada', 'selecionado'].includes(ent.status) ? (
                                                            <button
                                                                onClick={() => {
                                                                    if (confirm(`Registrar que ${ent.candidato_nome} chegou para a entrevista?`)) {
                                                                        router.post(`/recepcao/entrevistas/${ent.id}/chegada`, {}, {
                                                                            preserveScroll: true
                                                                        });
                                                                    }
                                                                }}
                                                                className="ds-btn ds-btn-primary py-1.5 px-2.5 text-[10px] flex items-center gap-1 cursor-pointer transition shadow-xs"
                                                            >
                                                                Chegou
                                                            </button>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-semibold bg-emerald-50 border border-emerald-100/50 px-2 py-1.5 rounded-lg">
                                                                ✓ Chegou
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="ds-empty py-12">
                                            <div className="ds-empty-icon mb-2">
                                                <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <p className="ds-empty-title text-xs">Sem entrevistas agendadas.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* ── Modal Novo/Editar Visitante ── */}
            {modalAberto && (
                <div className="ds-modal-overlay">
                    <div className="ds-modal-panel max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                        
                        <div className="ds-modal-header shrink-0">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">
                                    {editando ? 'Editar Visitante' : 'Novo Visitante'}
                                </h2>
                                <p className="text-sm text-gray-400 mt-0.5">
                                    {editando ? 'Atualize as informações do visitante' : 'Registre a entrada de um novo visitante'}
                                </p>
                            </div>
                            <button type="button" onClick={fecharModal} className="ds-btn-icon">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form id="form-recepcao" onSubmit={handleSubmit} className="overflow-y-auto ds-scrollbar px-6 py-5 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome <span className="text-red-400">*</span></label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={data.nome}
                                            onChange={e => handleNomeChange(e.target.value)}
                                            onFocus={() => sugestoes.length > 0 && setMostrarSugestoes(true)}
                                            onBlur={() => setTimeout(() => setMostrarSugestoes(false), 200)}
                                            className={`ds-input ${errors.nome ? 'ds-input-error' : ''}`}
                                            placeholder="Nome do visitante"
                                            autoComplete="off"
                                            required
                                        />
                                        {mostrarSugestoes && sugestoes.length > 0 && (
                                            <ul className="absolute z-[120] left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto divide-y divide-gray-100">
                                                {sugestoes.map((sug, idx) => (
                                                    <li 
                                                        key={idx}
                                                        onMouseDown={() => selecionarSugestao(sug)}
                                                        className="px-4 py-2.5 hover:bg-blue-50 cursor-pointer text-sm text-gray-700 flex flex-col gap-0.5 text-left"
                                                    >
                                                        <span className="font-semibold text-gray-800">{sug.nome}</span>
                                                        <span className="text-xs text-gray-400">
                                                            {[sug.posto_cargo_empresa, sug.departamento_responsavel, sug.contato].filter(Boolean).join(' · ')}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                    {errors.nome && <p className="text-red-500 text-xs mt-1">{errors.nome}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Assunto <span className="text-red-400">*</span></label>
                                    <input
                                        type="text"
                                        value={data.assunto}
                                        onChange={e => setData('assunto', e.target.value)}
                                        className={`ds-input ${errors.assunto ? 'ds-input-error' : ''}`}
                                        placeholder="Motivo da visita"
                                        required
                                    />
                                    {errors.assunto && <p className="text-red-500 text-xs mt-1">{errors.assunto}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Posto / Cargo / Empresa</label>
                                    <input
                                        type="text"
                                        value={data.posto_cargo_empresa}
                                        onChange={e => setData('posto_cargo_empresa', e.target.value)}
                                        className="ds-input"
                                        placeholder="Ex: Analista - Empresa X"
                                    />
                                    {errors.posto_cargo_empresa && <p className="text-red-500 text-xs mt-1">{errors.posto_cargo_empresa}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Depto Responsável <span className="text-red-400">*</span></label>
                                    <select
                                        value={data.departamento_responsavel}
                                        onChange={e => setData('departamento_responsavel', e.target.value)}
                                        className="ds-input"
                                        required
                                    >
                                        <option value="">Selecione o departamento</option>
                                        <option value="RH">RH</option>
                                        <option value="Departamento Pessoal">Departamento Pessoal</option>
                                        <option value="Financeiro">Financeiro</option>
                                        <option value="Marketing">Marketing</option>
                                        <option value="Contratos">Contratos</option>
                                        <option value="Operacional">Operacional</option>
                                        <option value="Doutor">Doutor</option>
                                    </select>
                                    {errors.departamento_responsavel && <p className="text-red-500 text-xs mt-1">{errors.departamento_responsavel}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Contato</label>
                                    <input
                                        type="text"
                                        value={data.contato}
                                        onChange={e => setData('contato', e.target.value)}
                                        className="ds-input"
                                        placeholder="Telefone ou e-mail"
                                    />
                                    {errors.contato && <p className="text-red-500 text-xs mt-1">{errors.contato}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Horário de Entrada <span className="text-red-400">*</span></label>
                                    <input
                                        type="datetime-local"
                                        value={data.horario_entrada}
                                        onChange={e => setData('horario_entrada', e.target.value)}
                                        className="ds-input"
                                        required
                                    />
                                    {errors.horario_entrada && <p className="text-red-500 text-xs mt-1">{errors.horario_entrada}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Indicação</label>
                                    <input
                                        type="text"
                                        value={data.indicacao}
                                        onChange={e => setData('indicacao', e.target.value)}
                                        className="ds-input"
                                        placeholder="Quem indicou ou encaminhou"
                                    />
                                    {errors.indicacao && <p className="text-red-500 text-xs mt-1">{errors.indicacao}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Retorno</label>
                                    <input
                                        type="text"
                                        value={data.retorno}
                                        onChange={e => setData('retorno', e.target.value)}
                                        className="ds-input"
                                        placeholder="Observação sobre retorno"
                                    />
                                    {errors.retorno && <p className="text-red-500 text-xs mt-1">{errors.retorno}</p>}
                                </div>
                            </div>
                        </form>

                        <div className="ds-modal-footer shrink-0">
                            <button type="button" onClick={fecharModal} className="ds-btn ds-btn-ghost">
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                form="form-recepcao"
                                disabled={processing}
                                className="ds-btn ds-btn-primary"
                            >
                                {processing ? (
                                    <>
                                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                        </svg>
                                        Salvando...
                                    </>
                                ) : (editando ? 'Salvar Alterações' : 'Registrar Entrada')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Modal Confirmar Exclusão ── */}
            {confirmDelete && (
                <div className="ds-modal-overlay">
                    <div className="ds-modal-panel max-w-sm p-6 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-1">Excluir registro?</h3>
                        <p className="text-sm text-gray-500 mb-6">Esta ação não pode ser desfeita.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setConfirmDelete(null)} className="ds-btn ds-btn-secondary flex-1">
                                Cancelar
                            </button>
                            <button onClick={() => handleDelete(confirmDelete)} className="ds-btn ds-btn-danger flex-1">
                                Excluir
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
