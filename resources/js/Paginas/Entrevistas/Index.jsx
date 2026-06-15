import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import Sidebar from '../Componentes/Index.jsx';
import Paginacao from '../Componentes/Paginacao.jsx';
import FlashMessages from '../Componentes/FlashMessages.jsx';
import WhatsAppLink from '../Componentes/WhatsAppLink.jsx';

const STATUS_CONFIG = {
    marcada:        { label: 'Marcada',        bg: 'bg-blue-100',   text: 'text-blue-700' },
    selecionado:    { label: 'Selecionado',     bg: 'bg-indigo-100', text: 'text-indigo-700' },
    contratado:     { label: 'Contratado',      bg: 'bg-green-100',  text: 'text-green-700' },
    reprovado:      { label: 'Reprovado',       bg: 'bg-red-100',    text: 'text-red-700' },
    recusou_vaga:   { label: 'Recusou a Vaga',  bg: 'bg-orange-100', text: 'text-orange-700' },
    sem_vaga:       { label: 'Sem Vaga',        bg: 'bg-gray-200',   text: 'text-gray-600' },
    nao_compareceu: { label: 'Não Compareceu',  bg: 'bg-yellow-100', text: 'text-yellow-700' },
    desclassificado: { label: 'Desclassificado', bg: 'bg-rose-100',   text: 'text-rose-700' },
};

const OPCOES_RESULTADO = [
    { value: 'contratado',     label: 'Contratado',      desc: 'Candidato aprovado e contratado' },
    { value: 'reprovado',      label: 'Reprovado',       desc: 'Candidato não aprovado na entrevista' },
    { value: 'desclassificado', label: 'Desclassificado',  desc: 'Candidato desclassificado antes da entrevista' },
    { value: 'recusou_vaga',   label: 'Recusou a Vaga',  desc: 'Candidato optou por não aceitar a vaga' },
    { value: 'sem_vaga',       label: 'Sem Vaga',        desc: 'Não há vaga disponível no momento' },
    { value: 'nao_compareceu', label: 'Não Compareceu',  desc: 'Candidato não apareceu na entrevista' },
];

function getIniciais(nome) {
    if (!nome) return '';
    const partes = nome.trim().split(/\s+/);
    if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase();
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

export default function Entrevistas({ candidatos, vagas = [], filters = {} }) {
    const [modalCandidato, setModalCandidato] = useState(null);
    const [modalResultado, setModalResultado] = useState(null);
    const [entrevistasPegas, setEntrevistasPegas] = useState(new Set());
    const [modalAdiar, setModalAdiar] = useState(null);
    const [justificativa, setJustificativa] = useState('');
    const [adiando, setAdiando] = useState(false);

    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [vagaId, setVagaId] = useState(filters.vaga_id || '');
    const [tab, setTab] = useState(filters.tab || 'hoje');

    React.useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (search !== (filters.search || '')) {
                router.get('/entrevistas', {
                    tab,
                    search,
                    status,
                    vaga_id: vagaId,
                }, {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true
                });
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [search]);

    const changeTab = (newTab) => {
        setTab(newTab);
        router.get('/entrevistas', {
            tab: newTab,
            search,
            status,
            vaga_id: vagaId,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const changeStatus = (newStatus) => {
        setStatus(newStatus);
        router.get('/entrevistas', {
            tab,
            search,
            status: newStatus,
            vaga_id: vagaId,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const changeVaga = (newVagaId) => {
        setVagaId(newVagaId);
        router.get('/entrevistas', {
            tab,
            search,
            status,
            vaga_id: newVagaId,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        setSearch('');
        setStatus('');
        setVagaId('');
        router.get('/entrevistas', {
            tab,
            search: '',
            status: '',
            vaga_id: '',
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    function desatribuirEntrevista(entrevistaId) {
        if (confirm('Tem certeza que deseja remover o entrevistador desta entrevista?')) {
            router.put(`/entrevistas/${entrevistaId}/desatribuir`);
        }
    }

    const { data, setData, put, processing, errors, reset } = useForm({
        status: '',
        observacao: '',
    });

    function abrirResultado(candidato) {
        setModalResultado(candidato);
        setData({ status: candidato.status || '', observacao: candidato.observacao || '' });
    }

    function fecharResultado() {
        setModalResultado(null);
        reset();
    }

    function abrirAdiar(candidato) {
        setModalAdiar(candidato);
        setJustificativa('');
    }

    function fecharAdiar() {
        setModalAdiar(null);
        setJustificativa('');
    }

    function submitAdiar(e) {
        e.preventDefault();
        setAdiando(true);
        router.put(`/entrevistas/${modalAdiar.entrevista_id}/adiar`, {
            justificativa: justificativa
        }, {
            onSuccess: () => {
                fecharAdiar();
                setAdiando(false);
            },
            onError: () => {
                setAdiando(false);
            }
        });
    }

    function pegarEntrevista(entrevistaId) {
        setEntrevistasPegas(prev => new Set(prev).add(entrevistaId));
        router.put(`/entrevistas/${entrevistaId}/pegar`);
    }

    function submitResultado(e) {
        e.preventDefault();
        put(`/entrevistas/${modalResultado.entrevista_id}/status`, {
            onSuccess: fecharResultado,
        });
    }

    return (
        <>
            <Head title="Entrevistas" />
            <Sidebar />
            <div className="flex min-h-screen bg-gray-50 md:ml-64">
                <main className="flex-1 p-6 lg:p-10">
                    
                    <FlashMessages />

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Entrevistas</h1>
                            <p className="text-sm text-gray-400 mt-1">Acompanhe os candidatos e suas entrevistas.</p>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span className="ds-badge bg-white border border-gray-200 text-gray-500 px-3 py-1.5">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {candidatos.total} candidato{candidatos.total !== 1 && 's'}
                            </span>
                        </div>
                    </div>

                    {/* Abas */}
                    <div className="flex border-b border-gray-200 mb-6 gap-6">
                        <button
                            onClick={() => changeTab('hoje')}
                            className={`pb-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                                tab === 'hoje'
                                    ? 'border-[#0C4773] text-[#0C4773]'
                                    : 'border-transparent text-gray-400 hover:text-gray-600'
                            }`}
                        >
                            Hoje e Pendentes
                        </button>
                        <button
                            onClick={() => changeTab('proximas')}
                            className={`pb-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                                tab === 'proximas'
                                    ? 'border-[#0C4773] text-[#0C4773]'
                                    : 'border-transparent text-gray-400 hover:text-gray-600'
                            }`}
                        >
                            Próximas
                        </button>
                        <button
                            onClick={() => changeTab('concluidas')}
                            className={`pb-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                                tab === 'concluidas'
                                    ? 'border-[#0C4773] text-[#0C4773]'
                                    : 'border-transparent text-gray-400 hover:text-gray-600'
                            }`}
                        >
                            Histórico / Concluídas
                        </button>
                    </div>

                    {/* Painel de Busca e Filtros */}
                    <div className="bg-white p-5 rounded-2xl border border-gray-200/50 shadow-xs mb-8 flex flex-col md:flex-row items-center gap-4">
                        <div className="relative flex-1 w-full">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <svg className="w-5 h-5 text-gray-450" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Buscar por nome ou CPF..."
                                className="w-full rounded-xl border border-gray-200 pl-11 pr-4 py-2.5 text-sm transition focus:outline-none focus:border-[#0C4773] focus:ring-2 focus:ring-[#0C4773]/20 bg-gray-50/50 text-gray-800 placeholder-gray-400"
                            />
                        </div>

                        <div className="w-full md:w-64">
                            <select
                                value={vagaId}
                                onChange={e => changeVaga(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm transition focus:outline-none focus:border-[#0C4773] focus:ring-2 focus:ring-[#0C4773]/20 bg-gray-50/50 text-gray-800"
                            >
                                <option value="">Todas as Vagas</option>
                                {vagas.map(vaga => (
                                    <option key={vaga.id} value={vaga.id}>{vaga.titulo}</option>
                                ))}
                            </select>
                        </div>

                        {tab === 'concluidas' && (
                            <div className="w-full md:w-56">
                                <select
                                    value={status}
                                    onChange={e => changeStatus(e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm transition focus:outline-none focus:border-[#0C4773] focus:ring-2 focus:ring-[#0C4773]/20 bg-gray-50/50 text-gray-800"
                                >
                                    <option value="">Todos os Resultados</option>
                                    {OPCOES_RESULTADO.map(op => (
                                        <option key={op.value} value={op.value}>{op.label}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {(search || status || vagaId) && (
                            <button
                                onClick={clearFilters}
                                className="ds-btn ds-btn-ghost text-sm text-red-500 hover:text-red-700 hover:bg-red-50 py-2.5 px-4 cursor-pointer shrink-0"
                            >
                                Limpar Filtros
                            </button>
                        )}
                    </div>

                    {candidatos.total === 0 && (
                        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                            <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-lg font-medium">Nenhuma entrevista encontrada</p>
                            <p className="text-sm mt-1">Os candidatos aparecerão aqui ao se inscreverem.</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {candidatos.data.map((candidato) => {
                            const status = STATUS_CONFIG[candidato.status] || STATUS_CONFIG.marcada;
                            return (
                                <div key={candidato.id} className="ds-card flex flex-col overflow-hidden">

                                    {/* Header */}
                                    <div className="p-6 flex items-start gap-4">
                                        <div className="ds-avatar ds-avatar-lg bg-[#0C4773]/10 text-[#0C4773] rounded-xl">
                                            {getIniciais(candidato.nome)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-base font-bold text-gray-900 truncate">{candidato.nome}</p>
                                            <p className="text-sm text-gray-400 truncate mt-0.5">{candidato.vaga_titulo}</p>
                                        </div>
                                        <span className={`ds-badge shrink-0 ${status.bg} ${status.text}`}>
                                            {status.label}
                                        </span>
                                    </div>

                                    {/* Info: data + contato */}
                                    <div className="px-6 pb-6 grid grid-cols-2 gap-4">
                                        {/* Data/hora */}
                                        <div className="flex flex-col gap-1.5">
                                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Data</p>
                                            <div className="flex items-center gap-2">
                                                <svg className="w-4 h-4 text-[#0C4773] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <span className="text-sm font-semibold text-gray-800">
                                                    {candidato.data_hora
                                                        ? new Date(candidato.data_hora).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
                                                        : 'Não definida'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Tipo */}
                                        <div className="flex flex-col gap-1.5">
                                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Tipo</p>
                                            <div className="flex items-center gap-2">
                                                {candidato.tipo_entrevista === 'Online' && candidato.link_meet ? (
                                                    <a href={candidato.link_meet} target="_blank" rel="noopener noreferrer"
                                                       className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-xs transition-all duration-200">
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.845v6.31a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                        </svg>
                                                        Entrar no Meet
                                                    </a>
                                                ) : (
                                                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${candidato.tipo_entrevista === 'Online' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                                                        {candidato.tipo_entrevista || 'Presencial'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Telefone */}
                                        <div className="flex flex-col gap-1.5">
                                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Telefone</p>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                </svg>
                                                <span className="text-sm text-gray-700">{candidato.telefone || '—'}</span>
                                                <WhatsAppLink telefone={candidato.telefone} />
                                            </div>
                                        </div>

                                        {/* Entrevistador */}
                                        <div className="flex flex-col gap-1.5">
                                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Entrevistador</p>
                                            {(candidato.entrevistador_nome || entrevistasPegas.has(candidato.entrevista_id)) ? (
                                                <div className="flex items-center justify-between w-full group/entrevistador">
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                        </svg>
                                                        <span className="text-sm font-semibold text-gray-700 truncate" title={candidato.entrevistador_nome}>
                                                            {candidato.entrevistador_nome}
                                                        </span>
                                                    </div>
                                                    <button
                                                        onClick={() => desatribuirEntrevista(candidato.entrevista_id)}
                                                        className="text-xs text-red-500 hover:text-red-700 font-medium hover:underline opacity-0 group-hover/entrevistador:opacity-100 transition-opacity ml-2 shrink-0 cursor-pointer"
                                                        title="Remover entrevistador"
                                                    >
                                                        Liberar
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => pegarEntrevista(candidato.entrevista_id)}
                                                    className="ds-btn text-xs text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 self-start cursor-pointer"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
                                                    </svg>
                                                    Conduzir
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {candidato.observacao && (
                                        <div className="mx-6 mb-4 p-3 bg-gray-50 border border-gray-100 rounded-xl">
                                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Observação registrada</p>
                                            <p className="text-xs text-gray-600 mt-1 italic">"{candidato.observacao}"</p>
                                        </div>
                                    )}

                                    {/* Rodapé */}
                                    <div className="mt-auto px-6 py-3.5 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            {candidato.path_curriculo && (
                                                <a
                                                    href={`/storage/${candidato.path_curriculo}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="ds-btn ds-btn-ghost text-[#0C4773] text-sm px-3 py-2 hover:bg-[#0C4773]/5"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                    Currículo
                                                </a>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setModalCandidato(candidato)}
                                                className="ds-btn ds-btn-ghost text-sm px-3 py-2"
                                            >
                                                Detalhes
                                            </button>
                                            {['marcada', 'selecionado'].includes(candidato.status) && (
                                                <button
                                                    onClick={() => abrirAdiar(candidato)}
                                                    className="ds-btn text-sm text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-2"
                                                >
                                                    Adiar
                                                </button>
                                            )}
                                            <button
                                                onClick={() => abrirResultado(candidato)}
                                                className="ds-btn ds-btn-primary text-sm px-4 py-2"
                                            >
                                                Resultado
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <Paginacao paginacao={candidatos} />
                </main>
            </div>

            {modalCandidato && (
                <div className="ds-panel-overlay" onClick={() => setModalCandidato(null)}>
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

                    {/* Painel lateral */}
                    <div
                        className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col overflow-hidden ds-panel-slide"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header colorido */}
                        <div className="bg-[#0C4773] px-6 pt-8 pb-6 relative">
                            <button
                                onClick={() => setModalCandidato(null)}
                                className="absolute top-4 right-4 ds-btn-icon text-white/60 hover:text-white hover:bg-white/10"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>

                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-white/15 rounded-2xl flex items-center justify-center shrink-0">
                                    <span className="text-xl font-bold text-white">
                                        {getIniciais(modalCandidato.nome)}
                                    </span>
                                </div>
                                <div className="min-w-0">
                                    <h2 className="text-lg font-bold text-white truncate">{modalCandidato.nome}</h2>
                                    <p className="text-sm text-white/60 truncate mt-0.5">{modalCandidato.email}</p>
                                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                                        {modalCandidato.vaga_titulo && (
                                            <span className="text-xs font-semibold text-white/80 bg-white/10 px-2.5 py-1 rounded-full">
                                                {modalCandidato.vaga_titulo}
                                            </span>
                                        )}
                                        {(() => {
                                            const s = STATUS_CONFIG[modalCandidato.status] || STATUS_CONFIG.marcada;
                                            return (
                                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${s.bg} ${s.text}`}>
                                                    {s.label}
                                                </span>
                                            );
                                        })()}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Corpo com scroll */}
                        <div className="flex-1 overflow-y-auto">

                            {/* Entrevista */}
                            <div className="px-6 pt-6 pb-4">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Entrevista</p>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-[#0C4773]/8 rounded-lg flex items-center justify-center shrink-0">
                                            <svg className="w-4 h-4 text-[#0C4773]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400">Data e hora</p>
                                            <p className="text-sm font-semibold text-gray-800">
                                                {modalCandidato.data_hora
                                                    ? new Date(modalCandidato.data_hora).toLocaleString('pt-BR', { dateStyle: 'long', timeStyle: 'short' })
                                                    : 'Não definida'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-[#0C4773]/8 rounded-lg flex items-center justify-center shrink-0">
                                            <svg className="w-4 h-4 text-[#0C4773]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.845v6.31a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <div>
                                                <p className="text-xs text-gray-400">Tipo</p>
                                                <p className="text-sm font-semibold text-gray-800">{modalCandidato.tipo_entrevista || 'Presencial'}</p>
                                            </div>
                                            {modalCandidato.tipo_entrevista === 'Online' && modalCandidato.link_meet && (
                                                <a
                                                    href={modalCandidato.link_meet}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline bg-blue-50 px-2 py-1 rounded-lg"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                    </svg>
                                                    Abrir Meet
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                    {modalCandidato.entrevistador_nome && (
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-[#0C4773]/8 rounded-lg flex items-center justify-center shrink-0">
                                                <svg className="w-4 h-4 text-[#0C4773]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400">Entrevistador</p>
                                                <p className="text-sm font-semibold text-gray-800">{modalCandidato.entrevistador_nome}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mx-6 border-t border-gray-100" />

                            {/* Contato */}
                            <div className="px-6 py-4">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Contato</p>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs text-gray-400">E-mail</p>
                                            <p className="text-sm font-semibold text-gray-800 break-all">{modalCandidato.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-gray-400">Telefone</p>
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-semibold text-gray-800">{modalCandidato.telefone || '—'}</p>
                                                <WhatsAppLink telefone={modalCandidato.telefone} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mx-6 border-t border-gray-100" />

                            {/* Dados pessoais + Endereço */}
                            <div className="px-6 py-4">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Dados Pessoais</p>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400">CPF</p>
                                            <p className="text-sm font-semibold text-gray-800">{modalCandidato.cpf || '—'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400">Escolaridade</p>
                                            <p className="text-sm font-semibold text-gray-800">{modalCandidato.nivel_escolaridade || '—'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400">Endereço</p>
                                            <p className="text-sm font-semibold text-gray-800">{modalCandidato.logradouro || '—'}</p>
                                            {(modalCandidato.cep || modalCandidato.regiao) && (
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    {[modalCandidato.cep && `CEP ${modalCandidato.cep}`, modalCandidato.regiao].filter(Boolean).join(' · ')}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {modalCandidato.path_curriculo && (
                                <>
                                    <div className="mx-6 border-t border-gray-100" />
                                    <div className="px-6 py-4">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Currículo</p>
                                        <a
                                            href={`/storage/${modalCandidato.path_curriculo}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2.5 px-4 py-3 bg-[#0C4773]/5 border border-[#0C4773]/15 text-[#0C4773] rounded-xl text-sm font-semibold hover:bg-[#0C4773]/10 transition-colors w-full"
                                        >
                                            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            Baixar Currículo
                                        </a>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Rodapé fixo */}
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3 shrink-0">
                            <button
                                onClick={() => setModalCandidato(null)}
                                className="ds-btn ds-btn-ghost"
                            >
                                Fechar
                            </button>
                            <button
                                onClick={() => { abrirResultado(modalCandidato); setModalCandidato(null); }}
                                className="ds-btn ds-btn-primary"
                            >
                                Registrar Resultado
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {modalResultado && (
                <div className="ds-modal-overlay" onClick={fecharResultado}>
                    <div className="ds-modal-panel max-w-md" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <div>
                                <h2 className="text-base font-bold text-gray-900">Registrar Resultado</h2>
                                <p className="text-xs text-gray-400 mt-0.5">{modalResultado.nome} — {modalResultado.vaga_titulo}</p>
                            </div>
                            <button onClick={fecharResultado} className="ds-btn-icon">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={submitResultado}>
                            <div className="p-6 space-y-4">
                                <div className="space-y-2">
                                    {OPCOES_RESULTADO.map(opcao => (
                                        <label
                                            key={opcao.value}
                                            className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all duration-200 ${
                                                data.status === opcao.value
                                                    ? 'border-[#0C4773] bg-[#0C4773]/5 shadow-sm'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="status"
                                                value={opcao.value}
                                                checked={data.status === opcao.value}
                                                onChange={() => setData('status', opcao.value)}
                                                className="mt-0.5 text-[#0C4773] focus:ring-[#0C4773]"
                                            />
                                            <div>
                                                <span className="text-sm font-semibold text-gray-800">{opcao.label}</span>
                                                <p className="text-xs text-gray-400 mt-0.5">{opcao.desc}</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                                {errors.status && <p className="text-xs text-red-500">{errors.status}</p>}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                        Observação <span className="text-gray-400 font-normal normal-case">(opcional)</span>
                                    </label>
                                    <textarea
                                        value={data.observacao}
                                        onChange={e => setData('observacao', e.target.value)}
                                        rows={3}
                                        placeholder="Anotações sobre a entrevista..."
                                        className="ds-input resize-none"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
                                <button type="button" onClick={fecharResultado} className="ds-btn ds-btn-ghost">
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={!data.status || processing}
                                    className="ds-btn ds-btn-primary"
                                >
                                    {processing ? 'Salvando...' : 'Salvar Resultado'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {modalAdiar && (
                <div className="ds-modal-overlay" onClick={fecharAdiar}>
                    <div className="ds-modal-panel max-w-md" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <div>
                                <h2 className="text-base font-bold text-gray-900">Adiar Entrevista</h2>
                                <p className="text-xs text-gray-400 mt-0.5">{modalAdiar.nome} — {modalAdiar.vaga_titulo}</p>
                            </div>
                            <button onClick={fecharAdiar} className="ds-btn-icon">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={submitAdiar}>
                            <div className="p-6 space-y-4">
                                <p className="text-sm text-gray-655 font-medium text-amber-800 bg-amber-50 p-3.5 rounded-xl border border-amber-200/50">
                                    Esta ação removerá o agendamento atual da entrevista. O candidato será notificado por WhatsApp e convidado a selecionar um novo horário através do portal.
                                </p>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                        Motivo/Justificativa <span className="text-gray-400 font-normal normal-case">(opcional, será enviado ao candidato)</span>
                                    </label>
                                    <textarea
                                        value={justificativa}
                                        onChange={e => setJustificativa(e.target.value)}
                                        rows={3}
                                        placeholder="Ex: Tivemos um imprevisto na agenda interna e precisamos reagendar..."
                                        className="ds-input resize-none"
                                        maxLength={1000}
                                    />
                                </div>
                            </div>
                            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
                                <button type="button" onClick={fecharAdiar} className="ds-btn ds-btn-ghost">
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={adiando}
                                    className="ds-btn bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {adiando ? 'Confirmando...' : 'Confirmar e Adiar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

