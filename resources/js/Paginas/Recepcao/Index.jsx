import React, { useState } from 'react';
import { Head, useForm, router, usePage, Link } from '@inertiajs/react';

function getIniciais(nome) {
    if (!nome) return '?';
    return nome.trim().split(/\s+/).map(p => p[0]).slice(0, 2).join('').toUpperCase();
}

function KpiCard({ label, value, icon, accent = 'bg-blue-50 text-blue-600' }) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 group hover:shadow-md transition-shadow duration-300">
            <div className={`w-12 h-12 rounded-xl ${accent} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300`}>
                {icon}
            </div>
            <div>
                <p className="text-2xl font-extrabold text-gray-900 tracking-tight">{value}</p>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{label}</p>
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

export default function Recepcao({ registros, filtros, metricas, entrevistas_presenciais = [] }) {
    const { props } = usePage();
    const nomeUsuario = props.auth?.user?.nome ?? 'Recepcionista';

    const [modalAberto, setModalAberto] = useState(false);
    const [editando, setEditando] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        nome: '',
        assunto: '',
        posto_cargo_empresa: '',
        departamento_responsavel: '',
        contato: '',
        horario_entrada: new Date().toISOString().slice(0, 16),
        retorno: '',
        indicacao: '',
    });

    const abrirNovoRegistro = () => {
        reset();
        setData('horario_entrada', new Date().toISOString().slice(0, 16));
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
                <header className="bg-[#071F30] text-white shadow-lg">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <img 
                                src="https://1884w9942rbuynxx.public.blob.vercel-storage.com/Novo%20site%20AT%20%26%20Santos/LogoTipo-ATSANTOS%2Bletreiro-branco.png" 
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
                            <div className="w-9 h-9 rounded-full bg-teal-500 flex items-center justify-center text-white text-sm font-bold">
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
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
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
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-50 text-orange-600 text-xs font-semibold">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Presencial
                            </span>
                        </div>

                        {entrevistas_presenciais.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-50/50 border-b border-gray-100">
                                            <th className="text-center px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Horário</th>
                                            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Candidato</th>
                                            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">Telefone</th>
                                            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Vaga</th>
                                            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Recrutador</th>
                                            <th className="text-center px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
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
                                                <tr key={ent.id} className="hover:bg-orange-50/30 transition-colors">
                                                    <td className="px-5 py-3 text-center">
                                                        <span className="inline-flex items-center gap-1 font-mono text-xs font-bold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-lg">
                                                            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            {new Date(ent.data_hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3">
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                                                {getIniciais(ent.candidato_nome)}
                                                            </div>
                                                            <span className="font-medium text-gray-800">{ent.candidato_nome}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3 text-gray-500 text-xs hidden md:table-cell">{ent.candidato_telefone || '—'}</td>
                                                    <td className="px-5 py-3">
                                                        <span className="text-gray-700 text-xs font-medium">{ent.vaga_titulo}</span>
                                                    </td>
                                                    <td className="px-5 py-3 text-gray-500 text-xs hidden lg:table-cell">{ent.entrevistador}</td>
                                                    <td className="px-5 py-3 text-center">
                                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${st.cls}`}>
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
                            <div className="px-6 py-10 text-center">
                                <svg className="w-12 h-12 text-gray-200 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <p className="text-sm text-gray-400 font-medium">Nenhuma entrevista presencial nesta data.</p>
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
                                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0C4773] focus:ring-2 focus:ring-[#0C4773]/20 transition"
                                />
                            </div>
                            <input
                                type="date"
                                value={filtros.data}
                                onChange={(e) => handleFiltro('data', e.target.value)}
                                className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-[#0C4773] focus:ring-2 focus:ring-[#0C4773]/20 transition"
                            />
                        </div>
                        <button
                            onClick={abrirNovoRegistro}
                            className="inline-flex items-center gap-2 bg-[#0C4773] hover:bg-[#007EAE] text-white font-semibold px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Novo Visitante
                        </button>
                    </div>

                    {/* ── Tabela de Registros ── */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Visitante</th>
                                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Assunto</th>
                                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">Departamento</th>
                                        <th className="text-center px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Horário</th>
                                        <th className="text-center px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                                        <th className="text-right px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {registros.data.length > 0 ? (
                                        registros.data.map((reg) => (
                                            <tr key={reg.id} className="hover:bg-gray-50/50 transition-colors">
                                                {/* Visitante: nome + contato + cargo */}
                                                <td className="px-5 py-3">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-8 h-8 rounded-full bg-[#0C4773] flex items-center justify-center text-white text-xs font-bold shrink-0">
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
                                                <td className="px-5 py-3 max-w-[200px]">
                                                    <p className="text-gray-700 truncate" title={reg.assunto}>{reg.assunto}</p>
                                                    {reg.indicacao && (
                                                        <p className="text-[11px] text-gray-400 truncate mt-0.5" title={reg.indicacao}>Indicação: {reg.indicacao}</p>
                                                    )}
                                                </td>
                                                {/* Departamento + retorno */}
                                                <td className="px-5 py-3 hidden md:table-cell">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold">
                                                        {reg.departamento_responsavel}
                                                    </span>
                                                    {reg.retorno && (
                                                        <p className="text-[11px] text-gray-400 truncate mt-1 max-w-[160px]" title={reg.retorno}>↩ {reg.retorno}</p>
                                                    )}
                                                </td>
                                                {/* Horário: entrada → saída */}
                                                <td className="px-5 py-3 text-center">
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
                                                <td className="px-5 py-3 text-center">
                                                    {reg.horario_saida ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-xs font-semibold">
                                                            Saiu
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                            Presente
                                                        </span>
                                                    )}
                                                </td>
                                                {/* Ações */}
                                                <td className="px-5 py-3">
                                                    <div className="flex items-center justify-end gap-1">
                                                        {!reg.horario_saida && (
                                                            <button
                                                                onClick={() => handleSaida(reg.id)}
                                                                className="p-1.5 rounded-lg text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                                                                title="Registrar saída"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                                </svg>
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => abrirEdicao(reg)}
                                                            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                                                            title="Editar"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => setConfirmDelete(reg.id)}
                                                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
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
                                            <td colSpan={6} className="px-6 py-16 text-center">
                                                <svg className="w-14 h-14 text-gray-200 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                <p className="text-sm text-gray-400 font-medium">Nenhum visitante registrado nesta data.</p>
                                                <p className="text-xs text-gray-300 mt-1">Clique em "Novo Visitante" para começar.</p>
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
                                                    ? 'bg-[#0C4773] text-white'
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
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={fecharModal}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                        
                        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">
                                    {editando ? 'Editar Visitante' : 'Novo Visitante'}
                                </h2>
                                <p className="text-sm text-gray-400 mt-0.5">
                                    {editando ? 'Atualize as informações do visitante' : 'Registre a entrada de um novo visitante'}
                                </p>
                            </div>
                            <button type="button" onClick={fecharModal} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form id="form-recepcao" onSubmit={handleSubmit} className="overflow-y-auto px-6 py-5 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome <span className="text-red-400">*</span></label>
                                    <input
                                        type="text"
                                        value={data.nome}
                                        onChange={e => setData('nome', e.target.value)}
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0C4773] focus:ring-2 focus:ring-[#0C4773]/20 transition"
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
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0C4773] focus:ring-2 focus:ring-[#0C4773]/20 transition"
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
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0C4773] focus:ring-2 focus:ring-[#0C4773]/20 transition"
                                        placeholder="Ex: Analista - Empresa X"
                                    />
                                    {errors.posto_cargo_empresa && <p className="text-red-500 text-xs mt-1">{errors.posto_cargo_empresa}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Depto Responsável <span className="text-red-400">*</span></label>
                                    <input
                                        type="text"
                                        value={data.departamento_responsavel}
                                        onChange={e => setData('departamento_responsavel', e.target.value)}
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0C4773] focus:ring-2 focus:ring-[#0C4773]/20 transition"
                                        placeholder="Departamento que vai receber"
                                        required
                                    />
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
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0C4773] focus:ring-2 focus:ring-[#0C4773]/20 transition"
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
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-[#0C4773] focus:ring-2 focus:ring-[#0C4773]/20 transition"
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
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0C4773] focus:ring-2 focus:ring-[#0C4773]/20 transition"
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
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0C4773] focus:ring-2 focus:ring-[#0C4773]/20 transition"
                                        placeholder="Observação sobre retorno"
                                    />
                                    {errors.retorno && <p className="text-red-500 text-xs mt-1">{errors.retorno}</p>}
                                </div>
                            </div>
                        </form>

                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3 rounded-b-2xl shrink-0">
                            <button type="button" onClick={fecharModal} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-200 transition-colors cursor-pointer">
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                form="form-recepcao"
                                disabled={processing}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#0C4773] hover:bg-[#007EAE] disabled:opacity-50 transition-colors cursor-pointer shadow-md"
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
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setConfirmDelete(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-1">Excluir registro?</h3>
                        <p className="text-sm text-gray-500 mb-6">Esta ação não pode ser desfeita.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setConfirmDelete(null)} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer">
                                Cancelar
                            </button>
                            <button onClick={() => handleDelete(confirmDelete)} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors cursor-pointer">
                                Excluir
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
