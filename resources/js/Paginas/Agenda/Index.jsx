import React, { useState, useEffect } from 'react';
import { useForm, Head, usePage } from '@inertiajs/react';
import Sidebar from '../Componentes/Index';
import FlashMessages from '../Componentes/FlashMessages.jsx';

const FILTROS = [
    { value: 'todos',   label: 'Todos' },
    { value: 'manual',  label: 'Manuais' },
    { value: 'feriado', label: 'Feriados' },
];

function formatarData(dataStr) {
    return new Date(dataStr + 'T00:00:00').toLocaleDateString('pt-BR', {
        weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric',
    });
}

export default function Agenda({ bloqueios, configuracao }) {
    const { props } = usePage();
    const isAdmin = props.auth?.user?.role === 'admin';

    const [modalAberto, setModalAberto] = useState(false);
    const [bloqueioEditando, setBloqueioEditando] = useState(null);
    const [filtro, setFiltro] = useState('todos');

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('modal') === 'true') setModalAberto(true);
    }, []);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        data: '',
        dia_todo: false,
        hora_inicio: '',
        hora_fim: '',
        motivo: '',
    });

    const configForm = useForm({
        hora_inicio: configuracao?.hora_inicio ? configuracao.hora_inicio.substring(0, 5) : '08:00',
        hora_fim: configuracao?.hora_fim ? configuracao.hora_fim.substring(0, 5) : '10:00',
        intervalo_minutos: configuracao?.intervalo_minutos ?? 15,
    });

    function abrirNovo() {
        reset();
        setBloqueioEditando(null);
        setModalAberto(true);
    }

    function abrirEdicao(bloqueio) {
        setBloqueioEditando(bloqueio);
        setData({
            data: bloqueio.data,
            dia_todo: bloqueio.dia_todo ?? false,
            hora_inicio: bloqueio.hora_inicio ? bloqueio.hora_inicio.substring(0, 5) : '',
            hora_fim: bloqueio.hora_fim ? bloqueio.hora_fim.substring(0, 5) : '',
            motivo: bloqueio.motivo,
        });
        setModalAberto(true);
    }

    function fecharModal() {
        setModalAberto(false);
        setBloqueioEditando(null);
        reset();
    }

    function handleSubmit(e) {
        e.preventDefault();
        if (bloqueioEditando) {
            put(`/agenda/${bloqueioEditando.id}`, { onSuccess: fecharModal });
        } else {
            post('/agenda', { onSuccess: fecharModal });
        }
    }

    function handleSalvarConfig(e) {
        e.preventDefault();
        configForm.put('/agenda/configuracao', {
            preserveScroll: true,
        });
    }

    function handleDelete(bloqueio) {
        if (confirm(`Remover bloqueio de ${formatarData(bloqueio.data)}?`)) {
            destroy(`/agenda/${bloqueio.id}`, { preserveScroll: true });
        }
    }

    const bloqueiosFiltrados = filtro === 'todos'
        ? bloqueios
        : bloqueios.filter(b => b.origem === filtro);

    const inputClasses = 'mt-1 block w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0C4773]/40 focus:border-[#0C4773]';
    const labelClasses = 'block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1';

    return (
        <>
            <Head title="Agenda" />
            <Sidebar />
            <div className="min-h-screen bg-gray-100 md:ml-64 overflow-x-hidden">
                <main className="flex-1 min-w-0 p-6 lg:p-10">

                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Agenda</h1>
                            <p className="text-gray-500 mt-1">Gerencie os bloqueios de horário e as configurações das entrevistas.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-500">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {bloqueios.length} bloqueio{bloqueios.length !== 1 ? 's' : ''}
                            </span>
                            <button
                                onClick={abrirNovo}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-[#0C4773] text-white text-sm font-semibold rounded-xl hover:bg-[#0C4773]/90 transition-colors cursor-pointer shadow-sm"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Novo Bloqueio
                            </button>
                        </div>
                    </div>

                    <FlashMessages />

                    <div className="flex flex-col xl:flex-row gap-8">
                        {/* Coluna Esquerda: Filtros e Tabela de Bloqueios */}
                        <div className="flex-1 min-w-0 space-y-6">
                            {/* Filtros */}
                            <div className="flex gap-2">
                                {FILTROS.map(f => (
                                    <button
                                        key={f.value}
                                        onClick={() => setFiltro(f.value)}
                                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                                            filtro === f.value
                                                ? 'bg-[#0C4773] text-white shadow-sm'
                                                : 'bg-white text-gray-500 border border-gray-200 hover:border-[#0C4773]/40 hover:text-[#0C4773]'
                                        }`}
                                    >
                                        {f.label}
                                        {f.value !== 'todos' && (
                                            <span className={`ml-1.5 text-xs ${filtro === f.value ? 'opacity-70' : 'text-gray-400'}`}>
                                                ({bloqueios.filter(b => b.origem === f.value).length})
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>

                            {/* Tabela */}
                            {bloqueiosFiltrados.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-24 text-gray-400 bg-white rounded-2xl border border-gray-200">
                                    <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <p className="text-lg font-medium text-gray-500">Nenhum bloqueio encontrado</p>
                                    <p className="text-sm mt-1">
                                        {filtro === 'todos' ? 'Crie um bloqueio manual ou importe feriados.' : `Sem bloqueios do tipo "${filtro}".`}
                                    </p>
                                </div>
                            ) : (
                                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-gray-100 bg-gray-50">
                                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Data</th>
                                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Horário</th>
                                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Motivo</th>
                                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Tipo</th>
                                                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider w-24">Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {bloqueiosFiltrados.map(b => (
                                                <tr
                                                    key={b.id}
                                                    className={`group transition-colors ${b.origem === 'feriado' ? 'bg-purple-50/40 hover:bg-purple-50' : 'hover:bg-gray-50'}`}
                                                >
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <span className="font-semibold text-gray-800 capitalize">
                                                            {formatarData(b.data)}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                                                        {b.dia_todo ? (
                                                            <span className="inline-flex items-center gap-1 text-xs font-semibold bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full">
                                                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                                                </svg>
                                                                Dia todo
                                                            </span>
                                                        ) : (
                                                            <span className="font-mono text-gray-700">
                                                                {b.hora_inicio?.substring(0, 5)} – {b.hora_fim?.substring(0, 5)}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-600 max-w-[180px] xl:max-w-[240px] truncate" title={b.motivo}>{b.motivo}</td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        {b.origem === 'feriado' ? (
                                                            <span className="inline-flex items-center gap-1 text-xs font-semibold bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full">
                                                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                                </svg>
                                                                Feriado
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 text-xs font-semibold bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full">
                                                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                                </svg>
                                                                Manual
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        {b.origem !== 'feriado' && (
                                                            <div className="flex items-center justify-end gap-1">
                                                                <button
                                                                    onClick={() => abrirEdicao(b)}
                                                                    className="p-1.5 text-gray-500 hover:text-[#0C4773] hover:bg-[#0C4773]/10 rounded-lg transition-colors cursor-pointer"
                                                                    title="Editar"
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                    </svg>
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(b)}
                                                                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                                                    title="Remover"
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Coluna Direita: Painel de Configurações da Agenda */}
                        <div className="xl:w-80 xl:flex-shrink-0 space-y-6">
                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
                                    <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                                        <svg className="w-5 h-5 text-[#0C4773]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                        </svg>
                                        Configuração de Horário
                                    </h3>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {isAdmin 
                                            ? 'Defina o expediente e intervalo das entrevistas.' 
                                            : 'Expediente ativo de atendimento de entrevistas.'}
                                    </p>
                                </div>
                                <form onSubmit={handleSalvarConfig} className="p-6 space-y-4">
                                    <div>
                                        <label className={labelClasses}>Hora Início</label>
                                        <input
                                            type="time"
                                            value={configForm.data.hora_inicio}
                                            onChange={e => configForm.setData('hora_inicio', e.target.value)}
                                            className={inputClasses}
                                            disabled={!isAdmin}
                                            required
                                        />
                                        {configForm.errors.hora_inicio && <p className="text-xs text-red-500 mt-1">{configForm.errors.hora_inicio}</p>}
                                    </div>
                                    <div>
                                        <label className={labelClasses}>Hora Fim</label>
                                        <input
                                            type="time"
                                            value={configForm.data.hora_fim}
                                            onChange={e => configForm.setData('hora_fim', e.target.value)}
                                            className={inputClasses}
                                            disabled={!isAdmin}
                                            required
                                        />
                                        <p className="text-[10px] text-gray-400 mt-1 leading-normal">Horário limite (o último slot termina antes deste horário).</p>
                                        {configForm.errors.hora_fim && <p className="text-xs text-red-500 mt-1">{configForm.errors.hora_fim}</p>}
                                    </div>
                                    <div>
                                        <label className={labelClasses}>Intervalo entre entrevistas</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={configForm.data.intervalo_minutos}
                                                onChange={e => configForm.setData('intervalo_minutos', e.target.value)}
                                                className={inputClasses + ' pr-12'}
                                                min="5"
                                                max="120"
                                                disabled={!isAdmin}
                                                required
                                            />
                                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-xs text-gray-400 font-semibold pt-1">
                                                min
                                            </div>
                                        </div>
                                        {configForm.errors.intervalo_minutos && <p className="text-xs text-red-500 mt-1">{configForm.errors.intervalo_minutos}</p>}
                                    </div>

                                    {isAdmin && (
                                        <button
                                            type="submit"
                                            disabled={configForm.processing}
                                            className="w-full inline-flex justify-center items-center gap-2 py-2.5 px-4 text-sm font-semibold rounded-xl text-white bg-[#0C4773] hover:bg-[#007EAE] transition-colors disabled:opacity-50 cursor-pointer shadow-sm mt-2 font-semibold"
                                        >
                                            {configForm.processing ? 'Salvando...' : 'Salvar Configuração'}
                                        </button>
                                    )}
                                </form>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Modal */}
            {modalAberto && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <div>
                                <h2 className="text-base font-bold text-gray-900">
                                    {bloqueioEditando ? 'Editar Bloqueio' : 'Novo Bloqueio'}
                                </h2>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    {bloqueioEditando ? 'Altere os dados do bloqueio.' : 'Bloqueie um dia ou horário específico.'}
                                </p>
                            </div>
                            <button onClick={fecharModal} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className={labelClasses}>Data</label>
                                    <input
                                        type="date"
                                        value={data.data}
                                        onChange={e => setData('data', e.target.value)}
                                        className={inputClasses}
                                        required
                                    />
                                    {errors.data && <p className="text-xs text-red-500 mt-1">{errors.data}</p>}
                                </div>

                                <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 bg-gray-50 cursor-pointer select-none hover:bg-gray-100 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={data.dia_todo}
                                        onChange={e => setData('dia_todo', e.target.checked)}
                                        className="w-4 h-4 rounded border-gray-300 text-[#0C4773] focus:ring-[#0C4773]"
                                    />
                                    <div>
                                        <span className="text-sm font-semibold text-gray-700">Bloquear o dia todo</span>
                                        <p className="text-xs text-gray-400">Nenhum slot ficará disponível neste dia.</p>
                                    </div>
                                </label>

                                {!data.dia_todo && (
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className={labelClasses}>Hora Início</label>
                                            <input
                                                type="time"
                                                value={data.hora_inicio}
                                                onChange={e => setData('hora_inicio', e.target.value)}
                                                className={inputClasses}
                                                required
                                            />
                                            {errors.hora_inicio && <p className="text-xs text-red-500 mt-1">{errors.hora_inicio}</p>}
                                        </div>
                                        <div>
                                            <label className={labelClasses}>Hora Fim</label>
                                            <input
                                                type="time"
                                                value={data.hora_fim}
                                                onChange={e => setData('hora_fim', e.target.value)}
                                                className={inputClasses}
                                                required
                                            />
                                            {errors.hora_fim && <p className="text-xs text-red-500 mt-1">{errors.hora_fim}</p>}
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className={labelClasses}>Motivo</label>
                                    <input
                                        type="text"
                                        value={data.motivo}
                                        onChange={e => setData('motivo', e.target.value)}
                                        placeholder="Ex: Feriado Estadual — 9 de julho"
                                        className={inputClasses}
                                        required
                                    />
                                    {errors.motivo && <p className="text-xs text-red-500 mt-1">{errors.motivo}</p>}
                                </div>
                            </div>
                            <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex justify-end gap-3 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={fecharModal}
                                    className="text-sm font-medium text-gray-600 px-5 py-2.5 rounded-xl hover:bg-gray-200 transition-colors cursor-pointer"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-6 py-2.5 bg-[#0C4773] text-white text-sm font-semibold rounded-xl hover:bg-[#0C4773]/90 transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
                                >
                                    {processing ? 'Salvando...' : 'Salvar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
