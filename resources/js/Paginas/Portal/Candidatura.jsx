import React, { useState } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import axios from 'axios';

const formatBRL = (val) => {
    if (!val) return '—';
    const num = typeof val === 'string' ? parseFloat(val) : val;
    if (isNaN(num)) return val;
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
};

const hasBenefit = (val) => {
    if (!val) return false;
    if (val === '0' || val === '0.00' || val === 0) return false;
    const num = typeof val === 'string' ? parseFloat(val) : val;
    if (!isNaN(num) && num === 0) return false;
    return true;
};

const STATUS_CONFIG = {
    marcada:        { label: 'Inscrito',         color: 'bg-blue-100 text-blue-700',      step: 1 },
    selecionado:    { label: 'Aprovado no quiz', color: 'bg-orange-100 text-orange-700',  step: 2 },
    contratado:     { label: 'Contratado',       color: 'bg-emerald-100 text-emerald-700', step: 4 },
    reprovado:      { label: 'Não aprovado',     color: 'bg-red-100 text-red-600',        step: -1 },
    recusou_vaga:   { label: 'Recusou vaga',     color: 'bg-yellow-100 text-yellow-700',  step: -1 },
    sem_vaga:       { label: 'Sem vaga',         color: 'bg-gray-100 text-gray-600',      step: -1 },
    nao_compareceu: { label: 'Não compareceu',   color: 'bg-pink-100 text-pink-700',      step: -1 },
    desclassificado: { label: 'Desclassificado',  color: 'bg-rose-100 text-rose-700',      step: -1 },
};

const TIMELINE_STEPS = [
    { key: 'inscrito',   label: 'Inscrito',         icon: '📋' },
    { key: 'aprovado',   label: 'Aprovado no quiz', icon: '✅' },
    { key: 'entrevista', label: 'Entrevista',       icon: '🗓️' },
    { key: 'resultado',  label: 'Resultado',        icon: '🎯' },
];

export default function PortalCandidatura({ vaga, status, entrevista, dataCandidatura }) {
    const { auth } = usePage().props;
    
    const [dataEntrevista, setDataEntrevista] = useState('');
    const [slotSelecionado, setSlotSelecionado] = useState('');
    const [slots, setSlots] = useState([]);
    const [carregandoSlots, setCarregandoSlots] = useState(false);
    const [erroData, setErroData] = useState('');
    const [tipoEntrevista, setTipoEntrevista] = useState('Presencial');
    const [agendando, setAgendando] = useState(false);

    async function buscarSlots(data) {
        if (!data) return;
        setCarregandoSlots(true);
        setSlots([]);
        setSlotSelecionado('');
        try {
            const res = await axios.get('/candidatura/slots-disponiveis', { params: { data } });
            setSlots(res.data.slots || []);
        } catch (err) {
            setSlots([]);
        } finally {
            setCarregandoSlots(false);
        }
    }

    async function handleAgendarEntrevista(e) {
        e.preventDefault();
        if (!dataEntrevista || !slotSelecionado) return alert('Selecione data e horário.');
        setAgendando(true);
        try {
            const dataHora = `${dataEntrevista}T${slotSelecionado}:00`;
            await axios.post('/candidatura/agendar-entrevista', {
                vaga_id: vaga.id,
                data_hora: dataHora,
                tipo: tipoEntrevista,
            });
            router.reload({
                preserveScroll: true,
                onSuccess: () => {
                    alert('Entrevista agendada com sucesso!');
                }
            });
        } catch (error) {
            alert('Não foi possível agendar: ' + (error.response?.data?.message || error.response?.data?.error || error.message));
        } finally {
            setAgendando(false);
        }
    }
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.marcada;

    // Determina o step atual da timeline
    let currentStep = 0;
    if (status === 'marcada') currentStep = 1;
    if (status === 'selecionado') currentStep = 2;
    if (entrevista) currentStep = 3;
    if (status === 'contratado') currentStep = 4;

    // Status negativos
    const isNegativo = cfg.step === -1;

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Head title={`${vaga.titulo} — Portal do Candidato`} />

            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#0C4773] flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-900 leading-tight">Portal do Candidato</p>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider">AT & Santos</p>
                        </div>
                    </div>

                    <nav className="flex items-center gap-1">
                        <Link href="/portal/dashboard" className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                            Início
                        </Link>
                        <Link href="/portal/perfil" className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                            Perfil
                        </Link>
                        <Link href="/portal/logout" method="post" as="button" className="ml-2 px-3 py-2 text-sm font-medium text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                            Sair
                        </Link>
                    </nav>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">

                {/* Voltar */}
                <Link href="/portal/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-[#0C4773] transition-colors font-medium">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Voltar ao painel
                </Link>

                {/* Header da Vaga */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 pt-6 pb-4 border-b border-gray-100">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h1 className="text-xl font-extrabold text-gray-900">{vaga.titulo}</h1>
                                <p className="text-sm text-gray-400 mt-1">Candidatura realizada em {dataCandidatura}</p>
                            </div>
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${cfg.color} shrink-0`}>
                                {cfg.label}
                            </span>
                        </div>
                    </div>

                    {/* Timeline de progresso */}
                    {!isNegativo && (
                        <div className="px-6 py-5 bg-gray-50/50 border-b border-gray-100">
                            <div className="flex items-center justify-between">
                                {TIMELINE_STEPS.map((step, i) => {
                                    const isActive = i < currentStep;
                                    const isCurrent = i === currentStep - 1;
                                    return (
                                        <React.Fragment key={step.key}>
                                            <div className="flex flex-col items-center gap-1.5">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 transition-all ${
                                                    isActive
                                                        ? 'border-[#0C4773] bg-[#0C4773]/10'
                                                        : 'border-gray-200 bg-white'
                                                } ${isCurrent ? 'ring-4 ring-[#0C4773]/20 scale-110' : ''}`}>
                                                    {step.icon}
                                                </div>
                                                <span className={`text-xs font-medium ${isActive ? 'text-[#0C4773]' : 'text-gray-400'}`}>
                                                    {step.label}
                                                </span>
                                            </div>
                                            {i < TIMELINE_STEPS.length - 1 && (
                                                <div className={`flex-1 h-0.5 mx-2 rounded-full transition-colors ${
                                                    i < currentStep - 1 ? 'bg-[#0C4773]' : 'bg-gray-200'
                                                }`} />
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Informações da vaga */}
                    <div className="p-6 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-50 rounded-lg">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Local</p>
                                    <p className="text-sm font-semibold text-gray-800">{vaga.local || '—'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-50 rounded-lg">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Horário</p>
                                    <p className="text-sm font-semibold text-gray-800">{vaga.horario || '—'} · {vaga.escala || ''}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-50 rounded-lg">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Salário</p>
                                    <p className="text-sm font-semibold text-gray-800">{formatBRL(vaga.salario)}</p>
                                </div>
                            </div>

                            {(hasBenefit(vaga.va) || hasBenefit(vaga.vr) || hasBenefit(vaga.vt)) && (
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-50 rounded-lg">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Benefícios</p>
                                        <div className="flex flex-wrap gap-1.5 mt-0.5">
                                            {hasBenefit(vaga.va) && <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md font-medium">VA: {formatBRL(vaga.va)}</span>}
                                            {hasBenefit(vaga.vr) && <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md font-medium">VR: {formatBRL(vaga.vr)}</span>}
                                            {hasBenefit(vaga.vt) && <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md font-medium">VT: {formatBRL(vaga.vt)}</span>}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {vaga.descricao && (
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2">Descrição</p>
                                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{vaga.descricao}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Agendar Entrevista (após adiamento ou se pendente) */}
                {status === 'selecionado' && !entrevista && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 pt-6 pb-4 border-b border-gray-100 bg-emerald-50/20">
                            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                <span className="w-2.5 h-5 bg-emerald-500 rounded-full" />
                                Agendar sua Entrevista
                            </h2>
                            <p className="text-xs text-gray-400 mt-0.5">Selecione uma data e horário de sua preferência para realizar a entrevista.</p>
                        </div>
                        <form onSubmit={handleAgendarEntrevista} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Seleção de Data */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">Data de Preferência</label>
                                    <input
                                        type="date"
                                        required
                                        value={dataEntrevista}
                                        min={new Date().toISOString().split('T')[0]}
                                        onChange={e => {
                                            const val = e.target.value;
                                            setDataEntrevista(val);
                                            setErroData('');
                                            setSlots([]);
                                            setSlotSelecionado('');
                                            if (val) {
                                                const diaSemana = new Date(val + 'T00:00:00').getDay();
                                                if (diaSemana === 0 || diaSemana === 6) {
                                                    setErroData('Entrevistas são realizadas apenas de segunda a sexta-feira.');
                                                    return;
                                                }
                                            }
                                            buscarSlots(val);
                                        }}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0C4773]/40 focus:border-[#0C4773] transition-all"
                                    />
                                    {erroData && (
                                        <p className="text-xs font-medium text-red-500">{erroData}</p>
                                    )}
                                </div>

                                {/* Tipo de Entrevista */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">Modelo de Entrevista</label>
                                    {vaga.permite_online ? (
                                        <select
                                            value={tipoEntrevista}
                                            onChange={e => setTipoEntrevista(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0C4773]/40 focus:border-[#0C4773] transition-all"
                                        >
                                            <option value="Online">Online (Reunião por vídeo)</option>
                                            <option value="Presencial">Presencial (No escritório da empresa)</option>
                                        </select>
                                    ) : (
                                        <p className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-600">
                                            🏢 Presencial (no escritório da empresa)
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Horários disponíveis */}
                            {dataEntrevista && !erroData && (
                                <div className="space-y-3 pt-2">
                                    <label className="block text-sm font-semibold text-gray-700">Horários Disponíveis</label>
                                    {carregandoSlots ? (
                                        <div className="flex items-center gap-2 py-4">
                                            <div className="w-5 h-5 border-2 border-gray-300 border-t-[#0C4773] rounded-full animate-spin" />
                                            <span className="text-sm text-gray-400 font-medium">Buscando horários na agenda...</span>
                                        </div>
                                    ) : slots.length === 0 ? (
                                        <p className="text-sm text-red-500 font-medium bg-red-50 border border-red-200/50 p-4 rounded-xl">
                                            ⚠️ Não há horários disponíveis para esta data. Por favor, escolha outro dia útil.
                                        </p>
                                    ) : (
                                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                                            {slots.map(slot => (
                                                <button
                                                    key={slot}
                                                    type="button"
                                                    onClick={() => setSlotSelecionado(slot)}
                                                    className={`py-3 rounded-xl text-sm font-semibold border transition-all cursor-pointer ${
                                                        slotSelecionado === slot
                                                            ? 'bg-[#0C4773] text-white border-[#0C4773] shadow-md shadow-[#0C4773]/10 scale-105'
                                                            : 'bg-white text-gray-700 border-gray-200 hover:border-[#0C4773]/40 hover:bg-[#0C4773]/5'
                                                    }`}
                                                >
                                                    {slot}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Submit */}
                            <div className="pt-4 border-t border-gray-100 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={agendando || !slotSelecionado || !dataEntrevista || !!erroData}
                                    className="w-full sm:w-auto inline-flex justify-center items-center gap-2 py-3 px-8 text-sm font-bold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-100 transition-all cursor-pointer disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed disabled:shadow-none shadow-lg shadow-emerald-600/10"
                                >
                                    {agendando ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Reservando horário...
                                        </>
                                    ) : 'Confirmar Agendamento'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Card Entrevista */}
                {entrevista && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
                            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                <span className="w-2 h-5 bg-emerald-500 rounded-full" />
                                Entrevista Agendada
                            </h2>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Data e Horário</p>
                                    <p className="text-sm font-bold text-gray-900">{entrevista.data_hora}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">{entrevista.data_relativa}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Tipo</p>
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                                        entrevista.tipo === 'Online' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                                    }`}>
                                        {entrevista.tipo === 'Online' ? '💻' : '🏢'} {entrevista.tipo}
                                    </span>
                                </div>
                                {entrevista.entrevistador && (
                                    <div>
                                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Entrevistador</p>
                                        <p className="text-sm font-semibold text-gray-800">{entrevista.entrevistador}</p>
                                    </div>
                                )}
                            </div>
                            {entrevista.observacao && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Observações</p>
                                    <p className="text-sm text-gray-600">{entrevista.observacao}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
}
