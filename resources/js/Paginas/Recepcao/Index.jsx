import React, { useState } from 'react';
import { Head, useForm, router, usePage, Link } from '@inertiajs/react';

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
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
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
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

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

                    {/* ── Entrevistas Presenciais do Dia ── */}
                    <div className="ds-card-static overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-sm font-bold text-gray-700">Entrevistas Presenciais</h2>
                                    <p className="text-xs text-gray-400">
                                        {entrevistas_presenciais.length > 0
                                            ? `${entrevistas_presenciais.length} entrevista${entrevistas_presenciais.length !== 1 ? 's' : ''} agendada${entrevistas_presenciais.length !== 1 ? 's' : ''}`
                                            : 'Nenhuma entrevista presencial nesta data'}
                                    </p>
                                </div>
                            </div>
                            <span className="ds-badge bg-orange-50 text-orange-600 border border-orange-100/50">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Presencial
                            </span>
                        </div>

                        {entrevistas_presenciais.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="ds-table">
                                    <thead>
                                        <tr>
                                            <th className="text-center">Horário</th>
                                            <th>Candidato</th>
                                            <th className="hidden md:table-cell">Telefone</th>
                                            <th>Vaga</th>
                                            <th className="hidden lg:table-cell">Recrutador</th>
                                            <th className="text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {entrevistas_presenciais.map((ent) => {
                                            const statusConfig = {
                                                marcada:        { label: 'Agendada',        cls: 'bg-blue-100 text-blue-700' },
                                                selecionado:    { label: 'Selecionado',      cls: 'bg-orange-100 text-orange-700' },
                                                contratado:     { label: 'Contratado',       cls: 'bg-emerald-100 text-emerald-700' },
                                                reprovado:      { label: 'Reprovado',        cls: 'bg-red-100 text-red-600' },
                                                recusou_vaga:   { label: 'Recusou Vaga',     cls: 'bg-yellow-100 text-yellow-700' },
                                                sem_vaga:       { label: 'Sem Vaga',         cls: 'bg-gray-100 text-gray-600' },
                                                nao_compareceu: { label: 'Não Compareceu',   cls: 'bg-pink-100 text-pink-700' },
                                            };
                                            const st = statusConfig[ent.status] ?? { label: ent.status, cls: 'bg-gray-100 text-gray-600' };

                                            return (
                                                <tr key={ent.id} className="hover:bg-orange-50/30">
                                                    <td className="text-center">
                                                        <span className="inline-flex items-center gap-1 font-mono text-xs font-bold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-lg">
                                                            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            {new Date(ent.data_hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="ds-avatar ds-avatar-sm bg-orange-500 text-white">
                                                                {getIniciais(ent.candidato_nome)}
                                                            </div>
                                                            <span className="font-medium text-gray-800">{ent.candidato_nome}</span>
                                                        </div>
                                                    </td>
                                                    <td className="text-gray-500 text-xs hidden md:table-cell">{ent.candidato_telefone || '—'}</td>
                                                    <td>
                                                        <span className="text-gray-700 text-xs font-medium">{ent.vaga_titulo}</span>
                                                    </td>
                                                    <td className="text-gray-500 text-xs hidden lg:table-cell">{ent.entrevistador}</td>
                                                    <td className="text-center">
                                                        <span className={`ds-badge ${st.cls}`}>
                                                            {st.label}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="ds-empty">
                                <div className="ds-empty-icon">
                                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <p className="ds-empty-title">Nenhuma entrevista presencial nesta data.</p>
                            </div>
                        )}
                    </div>

                    {/* ── Barra de Ações ── */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1">
                            <div className="relative flex-1 max-w-sm">
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
                            <input
                                type="date"
                                value={filtros.data}
                                onChange={(e) => handleFiltro('data', e.target.value)}
                                className="ds-input w-auto"
                            />
                        </div>
                        <button
                            onClick={abrirNovoRegistro}
                            className="ds-btn ds-btn-primary"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Novo Visitante
                        </button>
                    </div>

                    {/* ── Tabela de Registros ── */}
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
                                                {/* Visitante: nome + contato + cargo */}
                                                <td>
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="ds-avatar ds-avatar-sm bg-[#0C4773] text-white">
                                                            {getIniciais(reg.nome)}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="font-medium text-gray-800 truncate">{reg.nome}</p>
                                                            <p className="text-[11px] text-gray-400 truncate">
                                                                {[reg.posto_cargo_empresa, reg.contato].filter(Boolean).join(' · ') || '—'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                {/* Assunto + indicação */}
                                                <td className="max-w-[200px]">
                                                    <p className="text-gray-700 truncate" title={reg.assunto}>{reg.assunto}</p>
                                                    {reg.indicacao && (
                                                        <p className="text-[11px] text-gray-400 truncate mt-0.5" title={reg.indicacao}>Indicação: {reg.indicacao}</p>
                                                    )}
                                                </td>
                                                {/* Departamento + retorno */}
                                                <td className="hidden md:table-cell">
                                                    <span className="ds-badge bg-blue-50 text-blue-700">
                                                        {reg.departamento_responsavel}
                                                    </span>
                                                    {reg.retorno && (
                                                        <p className="text-[11px] text-gray-400 truncate mt-1 max-w-[160px]" title={reg.retorno}>↩ {reg.retorno}</p>
                                                    )}
                                                </td>
                                                {/* Horário: entrada → saída */}
                                                <td className="text-center">
                                                    <div className="inline-flex items-center gap-1.5 font-mono text-xs">
                                                        <span className="font-bold text-gray-700">
                                                            {reg.horario_entrada ? new Date(reg.horario_entrada).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '—'}
                                                        </span>
                                                        <span className="text-gray-300">→</span>
                                                        <span className={reg.horario_saida ? 'text-gray-500' : 'text-gray-300'}>
                                                            {reg.horario_saida ? new Date(reg.horario_saida).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '—'}
                                                        </span>
                                                    </div>
                                                </td>
                                                {/* Status */}
                                                <td className="text-center">
                                                    {reg.horario_saida ? (
                                                        <span className="ds-badge bg-gray-100 text-gray-500">
                                                            Saiu
                                                        </span>
                                                    ) : (
                                                        <span className="ds-badge bg-emerald-100 text-emerald-700">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
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
                </main>
            </div>

            {/* ── Modal Novo/Editar Visitante ── */}
            {modalAberto && (
                <div className="ds-modal-overlay" onClick={fecharModal}>
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
                                    <input
                                        type="text"
                                        value={data.nome}
                                        onChange={e => setData('nome', e.target.value)}
                                        className={`ds-input ${errors.nome ? 'ds-input-error' : ''}`}
                                        placeholder="Nome do visitante"
                                        required
                                    />
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
                <div className="ds-modal-overlay" onClick={() => setConfirmDelete(null)}>
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
