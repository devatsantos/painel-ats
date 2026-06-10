import React, { useState } from 'react';
import Sidebar from '../Componentes/Index';
import Paginacao from '../Componentes/Paginacao.jsx';
import WhatsAppLink from '../Componentes/WhatsAppLink.jsx';
import { router } from '@inertiajs/react';

export default function BaseDeDados({ candidatos, regioes = [], vagas = [], totalCandidatos, totalBancoTalentos, filtros = {} }) {
    const [busca, setBusca] = useState(filtros.busca || '');
    const [filtroRegiao, setFiltroRegiao] = useState(filtros.regiao || '');
    const [filtroEscolaridade, setFiltroEscolaridade] = useState(filtros.escolaridade || '');
    const [filtroStatus, setFiltroStatus] = useState(filtros.status || '');
    const [filtroVaga, setFiltroVaga] = useState(filtros.vaga_id || '');
    const [typingTimeout, setTypingTimeout] = useState(null);
    const [expandido, setExpandido] = useState(null);

    const buildFiltros = (overrides = {}) => {
        const f = {
            busca,
            regiao: filtroRegiao,
            escolaridade: filtroEscolaridade,
            status: filtroStatus,
            vaga_id: filtroVaga,
            ...overrides,
        };
        // Remove filtros vazios
        return Object.fromEntries(Object.entries(f).filter(([, v]) => v !== ''));
    };

    const aplicarFiltro = (overrides = {}) => {
        router.get('/base-de-dados', buildFiltros(overrides), {
            preserveState: true,
            replace: true,
            preserveScroll: true,
        });
    };

    const handleSearchChange = (val) => {
        setBusca(val);
        if (typingTimeout) clearTimeout(typingTimeout);
        setTypingTimeout(
            setTimeout(() => aplicarFiltro({ busca: val }), 400)
        );
    };

    const handleRegiaoChange = (val) => {
        setFiltroRegiao(val);
        aplicarFiltro({ regiao: val });
    };

    const handleEscolaridadeChange = (val) => {
        setFiltroEscolaridade(val);
        aplicarFiltro({ escolaridade: val });
    };

    const handleStatusChange = (val) => {
        setFiltroStatus(val);
        aplicarFiltro({ status: val });
    };

    const handleVagaChange = (val) => {
        setFiltroVaga(val);
        aplicarFiltro({ vaga_id: val });
    };

    const limparFiltros = () => {
        setBusca('');
        setFiltroRegiao('');
        setFiltroEscolaridade('');
        setFiltroStatus('');
        setFiltroVaga('');
        router.get('/base-de-dados', {}, { preserveState: true, replace: true, preserveScroll: true });
    };

    const temFiltroAtivo = busca || filtroRegiao || filtroEscolaridade || filtroStatus || filtroVaga;

    const getIniciais = (nome) => {
        if (!nome) return '';
        const partes = nome.trim().split(/\s+/);
        if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase();
        return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
    };

    const getCor = (id) => {
        const cores = ['bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500', 'bg-indigo-500', 'bg-teal-500'];
        return cores[id % cores.length];
    };

    const statusLabels = {
        marcada: { label: 'Marcada', cor: 'bg-blue-100 text-blue-700' },
        selecionado: { label: 'Selecionado', cor: 'bg-emerald-100 text-emerald-700' },
        contratado: { label: 'Contratado', cor: 'bg-green-100 text-green-800' },
        reprovado: { label: 'Reprovado', cor: 'bg-red-100 text-red-700' },
        recusou_vaga: { label: 'Recusou Vaga', cor: 'bg-orange-100 text-orange-700' },
        sem_vaga: { label: 'Sem Vaga', cor: 'bg-gray-100 text-gray-600' },
        nao_compareceu: { label: 'Não Compareceu', cor: 'bg-yellow-100 text-yellow-700' },
    };

    const escolaridadeLabels = {
        fundamental: 'Fundamental',
        medio: 'Ensino Médio',
        tecnico: 'Técnico',
        graduacao: 'Graduação',
        posgraduacao: 'Pós-graduação',
    };

    const formatarData = (data) => {
        if (!data) return '—';
        return new Date(data).toLocaleDateString('pt-BR');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans">
            <Sidebar />

            <main className="flex-1 p-8 md:pl-[280px] transition-all duration-300">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <header className="mb-8">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Base de Dados</h1>
                                <p className="text-gray-500 mt-1">Todos os candidatos registrados no sistema.</p>
                            </div>
                        </div>
                    </header>

                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
                            <div>
                                <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-1">Total de Candidatos</p>
                                <h3 className="text-4xl font-bold text-[#0C4773]">{totalCandidatos}</h3>
                            </div>
                            <div className="p-4 bg-blue-50 rounded-2xl">
                                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
                            <div>
                                <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-1">Nesta Página</p>
                                <h3 className="text-4xl font-bold text-emerald-600">{candidatos.data.length}</h3>
                            </div>
                            <div className="p-4 bg-emerald-50 rounded-2xl">
                                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
                            <div>
                                <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-1">Banco de Talentos</p>
                                <h3 className="text-4xl font-bold text-amber-500">{totalBancoTalentos}</h3>
                            </div>
                            <div className="p-4 bg-amber-50 rounded-2xl">
                                <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Filtros */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                </svg>
                                Filtros
                            </h3>
                            {temFiltroAtivo && (
                                <button
                                    onClick={limparFiltros}
                                    className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors flex items-center gap-1 cursor-pointer"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Limpar Filtros
                                </button>
                            )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                            {/* Busca */}
                            <div className="relative lg:col-span-2">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Buscar por nome, CPF, e-mail ou telefone..."
                                    className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 shadow-sm transition-shadow outline-none"
                                    value={busca}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                />
                            </div>
                            {/* Região */}
                            <select
                                value={filtroRegiao}
                                onChange={(e) => handleRegiaoChange(e.target.value)}
                                className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 shadow-sm transition-shadow outline-none cursor-pointer"
                            >
                                <option value="">Todas as Regiões</option>
                                {regioes.map(r => (
                                    <option key={r} value={r}>{r}</option>
                                ))}
                            </select>
                            {/* Escolaridade */}
                            <select
                                value={filtroEscolaridade}
                                onChange={(e) => handleEscolaridadeChange(e.target.value)}
                                className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 shadow-sm transition-shadow outline-none cursor-pointer"
                            >
                                <option value="">Escolaridade</option>
                                <option value="fundamental">Fundamental</option>
                                <option value="medio">Ensino Médio</option>
                                <option value="tecnico">Técnico</option>
                                <option value="graduacao">Graduação</option>
                                <option value="posgraduacao">Pós-graduação</option>
                            </select>
                            {/* Status */}
                            <select
                                value={filtroStatus}
                                onChange={(e) => handleStatusChange(e.target.value)}
                                className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 shadow-sm transition-shadow outline-none cursor-pointer"
                            >
                                <option value="">Todos os Status</option>
                                <option value="marcada">Marcada</option>
                                <option value="selecionado">Selecionado</option>
                                <option value="contratado">Contratado</option>
                                <option value="reprovado">Reprovado</option>
                                <option value="recusou_vaga">Recusou Vaga</option>
                                <option value="sem_vaga">Sem Vaga</option>
                                <option value="nao_compareceu">Não Compareceu</option>
                            </select>
                        </div>
                        {/* Filtro de vaga (segunda linha) */}
                        {vagas.length > 0 && (
                            <div className="mt-4">
                                <select
                                    value={filtroVaga}
                                    onChange={(e) => handleVagaChange(e.target.value)}
                                    className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full sm:w-80 p-2.5 shadow-sm transition-shadow outline-none cursor-pointer"
                                >
                                    <option value="">Todas as Vagas</option>
                                    {vagas.map(v => (
                                        <option key={v.id} value={v.id}>{v.titulo}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Tabela */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Candidato</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Contato</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Escolaridade</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Região</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Vagas</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Cadastro</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Detalhes</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {candidatos.data.map((candidato) => (
                                        <React.Fragment key={candidato.id}>
                                            <tr className="hover:bg-gray-50/50 transition-colors">
                                                {/* Candidato */}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`${getCor(candidato.id)} w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm`}>
                                                            {getIniciais(candidato.nome)}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="font-semibold text-gray-900 truncate max-w-[200px]">{candidato.nome}</p>
                                                            <p className="text-xs text-gray-400 mt-0.5">{candidato.cpf}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                {/* Contato */}
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-gray-600 text-sm">{candidato.telefone}</span>
                                                            <WhatsAppLink telefone={candidato.telefone} />
                                                        </div>
                                                        {candidato.email && (
                                                            <span className="text-xs text-gray-400 truncate max-w-[180px]">{candidato.email}</span>
                                                        )}
                                                    </div>
                                                </td>
                                                {/* Escolaridade */}
                                                <td className="px-6 py-4 hidden lg:table-cell">
                                                    <span className="text-gray-600">{escolaridadeLabels[candidato.nivel_escolaridade] || candidato.nivel_escolaridade || '—'}</span>
                                                </td>
                                                {/* Região */}
                                                <td className="px-6 py-4 hidden lg:table-cell">
                                                    <span className="text-gray-600">{candidato.regiao || '—'}</span>
                                                </td>
                                                {/* Vagas */}
                                                <td className="px-6 py-4">
                                                    {candidato.vagas && candidato.vagas.length > 0 ? (
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {candidato.vagas.slice(0, 2).map((vaga) => {
                                                                const st = statusLabels[vaga.pivot?.status] || { label: vaga.pivot?.status, cor: 'bg-gray-100 text-gray-600' };
                                                                return (
                                                                    <span
                                                                        key={vaga.id}
                                                                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ${st.cor}`}
                                                                        title={`${vaga.titulo} — ${st.label}`}
                                                                    >
                                                                        {st.label}
                                                                    </span>
                                                                );
                                                            })}
                                                            {candidato.vagas.length > 2 && (
                                                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-gray-100 text-gray-500">
                                                                    +{candidato.vagas.length - 2}
                                                                </span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-gray-300">Nenhuma</span>
                                                    )}
                                                </td>
                                                {/* Cadastro */}
                                                <td className="px-6 py-4 hidden md:table-cell">
                                                    <span className="text-gray-500 text-xs">{formatarData(candidato.created_at)}</span>
                                                </td>
                                                {/* Expandir */}
                                                <td className="px-6 py-4 text-center">
                                                    <button
                                                        onClick={() => setExpandido(expandido === candidato.id ? null : candidato.id)}
                                                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                                                        title="Ver detalhes"
                                                    >
                                                        <svg className={`w-5 h-5 transition-transform duration-200 ${expandido === candidato.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    </button>
                                                </td>
                                            </tr>

                                            {/* Linha expandida */}
                                            {expandido === candidato.id && (
                                                <tr>
                                                    <td colSpan="7" className="px-6 py-5 bg-gray-50/70">
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                            {/* Info pessoal */}
                                                            <div>
                                                                <h4 className="text-xs font-bold text-[#0C4773] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                                                    <span className="w-1 h-3 bg-[#0C4773] rounded-full"></span>
                                                                    Dados Pessoais
                                                                </h4>
                                                                <div className="space-y-2 text-sm">
                                                                    <div className="flex justify-between">
                                                                        <span className="text-gray-400">Nome:</span>
                                                                        <span className="text-gray-700 font-medium">{candidato.nome}</span>
                                                                    </div>
                                                                    <div className="flex justify-between">
                                                                        <span className="text-gray-400">CPF:</span>
                                                                        <span className="text-gray-700 font-medium">{candidato.cpf}</span>
                                                                    </div>
                                                                    <div className="flex justify-between">
                                                                        <span className="text-gray-400">Nascimento:</span>
                                                                        <span className="text-gray-700 font-medium">{formatarData(candidato.data_nascimento)}</span>
                                                                    </div>
                                                                    <div className="flex justify-between">
                                                                        <span className="text-gray-400">Escolaridade:</span>
                                                                        <span className="text-gray-700 font-medium">{escolaridadeLabels[candidato.nivel_escolaridade] || candidato.nivel_escolaridade || '—'}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            {/* Localização */}
                                                            <div>
                                                                <h4 className="text-xs font-bold text-[#0C4773] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                                                    <span className="w-1 h-3 bg-[#0C4773] rounded-full"></span>
                                                                    Localização
                                                                </h4>
                                                                <div className="space-y-2 text-sm">
                                                                    <div className="flex justify-between">
                                                                        <span className="text-gray-400">CEP:</span>
                                                                        <span className="text-gray-700 font-medium">{candidato.cep || '—'}</span>
                                                                    </div>
                                                                    <div className="flex justify-between">
                                                                        <span className="text-gray-400">Logradouro:</span>
                                                                        <span className="text-gray-700 font-medium truncate max-w-[180px]">{candidato.logradouro || '—'}</span>
                                                                    </div>
                                                                    <div className="flex justify-between">
                                                                        <span className="text-gray-400">Região:</span>
                                                                        <span className="text-gray-700 font-medium">{candidato.regiao || '—'}</span>
                                                                    </div>
                                                                    <div className="flex justify-between">
                                                                        <span className="text-gray-400">Banco de Talentos:</span>
                                                                        <span className={`font-semibold ${candidato.banco_de_talentos ? 'text-emerald-600' : 'text-gray-400'}`}>
                                                                            {candidato.banco_de_talentos ? 'Sim' : 'Não'}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            {/* Vagas vinculadas */}
                                                            <div>
                                                                <h4 className="text-xs font-bold text-[#0C4773] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                                                    <span className="w-1 h-3 bg-[#0C4773] rounded-full"></span>
                                                                    Vagas Vinculadas
                                                                </h4>
                                                                {candidato.vagas && candidato.vagas.length > 0 ? (
                                                                    <div className="space-y-2">
                                                                        {candidato.vagas.map((vaga) => {
                                                                            const st = statusLabels[vaga.pivot?.status] || { label: vaga.pivot?.status, cor: 'bg-gray-100 text-gray-600' };
                                                                            return (
                                                                                <div key={vaga.id} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-gray-100">
                                                                                    <span className="text-sm text-gray-700 font-medium truncate max-w-[150px]">{vaga.titulo}</span>
                                                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ${st.cor}`}>
                                                                                        {st.label}
                                                                                    </span>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                ) : (
                                                                    <p className="text-sm text-gray-400 italic">Nenhuma vaga vinculada.</p>
                                                                )}

                                                                {/* Currículo */}
                                                                {candidato.path_curriculo && (
                                                                    <a
                                                                        href={`/storage/${candidato.path_curriculo}`}
                                                                        target="_blank"
                                                                        rel="noreferrer"
                                                                        className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                                                                    >
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                        </svg>
                                                                        Ver Currículo
                                                                    </a>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {candidatos.data.length === 0 && (
                            <div className="p-12 text-center">
                                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <p className="text-gray-500 text-lg">Nenhum candidato encontrado.</p>
                                <p className="text-gray-400 text-sm mt-1">Ajuste os filtros ou aguarde novos cadastros.</p>
                            </div>
                        )}
                    </div>

                    <Paginacao paginacao={candidatos} />
                </div>
            </main>
        </div>
    );
}
