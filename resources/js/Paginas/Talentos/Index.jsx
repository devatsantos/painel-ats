import React, { useState, useEffect } from 'react';
import Sidebar from '../Componentes/Index';
import Paginacao from '../Componentes/Paginacao.jsx';
import { useForm, router } from '@inertiajs/react';
import WhatsAppLink from '../Componentes/WhatsAppLink.jsx';
import axios from 'axios';

export default function Talentos({ talentos, vagas, totalRegioes, regioes = [], filtros = {} }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [talentoId, setTalentoId] = useState(null);
    const [buscaCargo, setBuscaCargo] = useState(filtros.busca || '');
    const [filtroRegiao, setFiltroRegiao] = useState(filtros.regiao || '');

    const [typingTimeout, setTypingTimeout] = useState(null);
    const [buscandoCep, setBuscandoCep] = useState(false);

    const maskCPF = (value) => {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})/, '$1-$2')
            .replace(/(-\d{2})\d+?$/, '$1');
    };

    const maskPhone = (value) => {
        let v = value.replace(/\D/g, '');
        if (v.length <= 10) {
            v = v.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2');
        } else {
            v = v.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2');
        }
        return v.substring(0, 15);
    };

    const maskCEP = (value) => {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{5})(\d)/, '$1-$2')
            .replace(/(-\d{3})\d+?$/, '$1');
    };

    const handleSearchChange = (val) => {
        setBuscaCargo(val);
        if (typingTimeout) clearTimeout(typingTimeout);
        setTypingTimeout(
            setTimeout(() => {
                router.get('/talentos', { busca: val, regiao: filtroRegiao }, { preserveState: true, replace: true, preserveScroll: true });
            }, 400)
        );
    };

    const handleRegiaoChange = (val) => {
        setFiltroRegiao(val);
        router.get('/talentos', { busca: buscaCargo, regiao: val }, { preserveState: true, replace: true, preserveScroll: true });
    };

    // Modal de agendamento de entrevista
    const [modalEntrevista, setModalEntrevista] = useState(null);
    const [slots, setSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [submittingEntrevista, setSubmittingEntrevista] = useState(false);
    const [entrevistaErrors, setEntrevistaErrors] = useState({});
    const [entrevista, setEntrevista] = useState({ vaga_id: '', data: '', hora: '', tipo: 'Presencial' });
    const hoje = new Date().toISOString().split('T')[0];

    function abrirModalEntrevista(talento) {
        setEntrevista({ vaga_id: '', data: '', hora: '', tipo: 'Presencial' });
        setSlots([]);
        setEntrevistaErrors({});
        setModalEntrevista(talento);
    }

    function fecharModalEntrevista() {
        setModalEntrevista(null);
        setSlots([]);
        setEntrevistaErrors({});
    }

    async function buscarSlots(data) {
        if (!data) return;
        setLoadingSlots(true);
        setSlots([]);
        setEntrevista(prev => ({ ...prev, hora: '' }));
        try {
            const res = await fetch(`/talentos/slots?data=${data}`);
            const json = await res.json();
            setSlots(json.slots ?? []);
        } catch {
            setSlots([]);
        } finally {
            setLoadingSlots(false);
        }
    }

    function submeterEntrevista(e) {
        e.preventDefault();
        setEntrevistaErrors({});
        setSubmittingEntrevista(true);
        router.post(`/talentos/${modalEntrevista.id}/agendar`, {
            vaga_id:  entrevista.vaga_id,
            data_hora: `${entrevista.data} ${entrevista.hora}:00`,
            tipo:     entrevista.tipo,
        }, {
            onSuccess: () => fecharModalEntrevista(),
            onError:   (errs) => setEntrevistaErrors(errs),
            onFinish:  () => setSubmittingEntrevista(false),
        });
    }

    const { data, setData, post, processing, delete: destroy, errors, reset, clearErrors } = useForm({
        nome: '',
        cpf: '',
        email: '',
        telefone: '',
        nivel_escolaridade: '',
        cep: '',
        logradouro: '',
        regiao: '',
        data_nascimento: '',
        curriculo: null,
        _method: 'post',
    });

    useEffect(() => {
        const cepLimpo = data.cep ? data.cep.replace(/\D/g, '') : '';
        if (cepLimpo.length === 8) {
            setBuscandoCep(true);
            axios.get(`https://viacep.com.br/ws/${cepLimpo}/json/`)
                .then(response => {
                    if (!response.data.erro) {
                        const { logradouro } = response.data;
                        setData(prev => ({ ...prev, logradouro: logradouro || '', cep: data.cep }));
                    }
                })
                .catch(err => console.error(err))
                .finally(() => setBuscandoCep(false));
        }
    }, [data.cep]);

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (editMode) {
            post(`/talentos/${talentoId}`, {
                onSuccess: () => closeModal()
            });
        } else {
            post('/talentos', {
                onSuccess: () => closeModal()
            });
        }
    };

    const handleEdit = (talento) => {
        setEditMode(true);
        setTalentoId(talento.id);
        setData({
            nome: talento.nome,
            cpf: talento.cpf,
            email: talento.email || '',
            telefone: talento.telefone,
            nivel_escolaridade: talento.nivel_escolaridade,
            cep: talento.cep || '',
            logradouro: talento.logradouro || '',
            regiao: talento.regiao,
            data_nascimento: talento.data_nascimento ? talento.data_nascimento.split('T')[0] : '',
            curriculo: null,
            _method: 'put',
        });
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        if (confirm('Tem certeza que deseja excluir este talento?')) {
            destroy(`/talentos/${id}`);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditMode(false);
        setTalentoId(null);
        reset();
        clearErrors();
    };

    const handleCreateNew = () => {
        setEditMode(false);
        setTalentoId(null);
        setData({
            nome: '',
            cpf: '',
            email: '',
            telefone: '',
            nivel_escolaridade: '',
            cep: '',
            logradouro: '',
            regiao: '',
            data_nascimento: '',
            curriculo: null,
            _method: 'post',
        });
        setIsModalOpen(true);
    };
    const getCor = (id) => {
        const cores = ['bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500'];
        return cores[id % cores.length];
    };
    const getIniciais = (nome) => {
        if (!nome) return '';
        const partes = nome.trim().split(/\s+/);
        if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase();
        return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
    };

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans">
            <Sidebar />

            <main className="flex-1 p-8 md:pl-[280px] transition-all duration-300">
                <div className="max-w-7xl mx-auto">
                    <header className="mb-8">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Banco de Talentos</h1>
                                <p className="text-gray-500 mt-1">Gerencie os currículos e perfis dos candidatos.</p>
                            </div>
                            <button
                                onClick={handleCreateNew}
                                className="bg-[#0C4773] hover:bg-[#007EAE] text-white font-semibold py-2.5 px-5 rounded-xl shadow-sm transition-colors flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                </svg>
                                Cadastrar Talento
                            </button>
                        </div>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
                            <div>
                                <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-1">Total de Talentos</p>
                                <h3 className="text-4xl font-bold text-[#0C4773]">{talentos.total}</h3>
                            </div>
                            <div className="p-4 bg-blue-50 rounded-2xl">
                                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
                            <div>
                                <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-1">Currículos Recebidos</p>
                                <h3 className="text-4xl font-bold text-emerald-600">{talentos.total}</h3>
                            </div>
                            <div className="p-4 bg-emerald-50 rounded-2xl">
                                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
                            <div>
                                <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-1">Regiões Cobertas</p>
                                <h3 className="text-4xl font-bold text-amber-500">{totalRegioes}</h3>
                            </div>
                            <div className="p-4 bg-amber-50 rounded-2xl">
                                <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="mb-6 flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                            </div>
                            <input 
                                type="text"
                                placeholder="Buscar por Nome, Cargo ou Formação..."
                                className="bg-white border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 shadow-sm transition-shadow outline-none"
                                value={buscaCargo}
                                onChange={(e) => handleSearchChange(e.target.value)}
                            />
                        </div>
                        <div className="sm:w-64">
                            <select
                                value={filtroRegiao}
                                onChange={(e) => handleRegiaoChange(e.target.value)}
                                className="bg-white border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 shadow-sm transition-shadow outline-none cursor-pointer"
                            >
                                <option value="">Todas as Regiões</option>
                                {regioes.map(r => (
                                    <option key={r} value={r}>{r}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {talentos.data.map((talento) => (
                            <div key={talento.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow overflow-hidden">
                                <div className="p-6">
                                    <div className="flex items-start gap-4">
                                        <div className={`${getCor(talento.id)} w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-sm`}>
                                            {getIniciais(talento.nome)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-lg font-bold text-gray-900 truncate">{talento.nome}</h3>
                                            </div>
                                            <p className="text-sm text-[#0C4773] font-semibold mt-0.5">{talento.nivel_escolaridade}</p>
                                        </div>
                                    </div>

                                    <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2H5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0" />
                                            </svg>
                                            <span>{talento.cpf}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                            <span>{talento.telefone}</span>
                                            <WhatsAppLink telefone={talento.telefone} />
                                        </div>
                                        {talento.email && (
                                            <div className="flex items-center gap-2 text-gray-600 col-span-2">
                                                <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                                <span className="truncate">{talento.email}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 text-gray-600 col-span-2">
                                            <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <span>{talento.regiao}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-gray-100 px-6 py-3.5 bg-gray-50/50 flex items-center justify-between">
                                    <a
                                        href={`/storage/${talento.path_curriculo}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors inline-flex items-center gap-1.5"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Ver Currículo
                                    </a>
                                    <div className="flex items-center gap-3">
                                    <button 
                                            onClick={() => abrirModalEntrevista(talento)}
                                            className="text-sm font-medium text-gray-500 hover:text-emerald-600 transition-colors flex items-center gap-1"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            Entrevista
                                        </button>
                                        <button 
                                            onClick={() => handleEdit(talento)}
                                            className="text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors flex items-center gap-1"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                            Editar
                                        </button>
                                        <button className="text-sm font-medium text-gray-500 hover:text-red-600 transition-colors flex items-center gap-1" onClick={() => handleDelete(talento.id)}>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                            Excluir
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <Paginacao paginacao={talentos} />

                    {talentos.data.length === 0 && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <p className="text-gray-500 text-lg">Nenhum talento cadastrado no momento.</p>
                            <p className="text-gray-400 text-sm mt-1">Clique em "Cadastrar Talento" para começar.</p>
                        </div>
                    )}
                </div>
            </main>

            {/* Modal agendar entrevista */}
            {modalEntrevista && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={fecharModalEntrevista}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">Agendar Entrevista</h2>
                                <p className="text-sm text-gray-400 mt-0.5">{modalEntrevista.nome}</p>
                            </div>
                            <button type="button" onClick={fecharModalEntrevista} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <form onSubmit={submeterEntrevista} className="px-6 py-5 space-y-4">
                            {/* Vaga */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Vaga</label>
                                <select
                                    value={entrevista.vaga_id}
                                    onChange={e => setEntrevista(prev => ({ ...prev, vaga_id: e.target.value }))}
                                    required
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-[#0C4773] focus:ring-2 focus:ring-[#0C4773]/20 transition"
                                >
                                    <option value="">Selecione uma vaga...</option>
                                    {vagas.map(v => <option key={v.id} value={v.id}>{v.titulo}</option>)}
                                </select>
                                {entrevistaErrors.vaga_id && <p className="text-red-500 text-xs mt-1">{entrevistaErrors.vaga_id}</p>}
                            </div>

                            {/* Data */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Data</label>
                                <input
                                    type="date"
                                    min={hoje}
                                    value={entrevista.data}
                                    onChange={e => {
                                        setEntrevista(prev => ({ ...prev, data: e.target.value, hora: '' }));
                                        buscarSlots(e.target.value);
                                    }}
                                    required
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-[#0C4773] focus:ring-2 focus:ring-[#0C4773]/20 transition"
                                />
                            </div>

                            {/* Horário */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Horário</label>
                                {loadingSlots ? (
                                    <p className="text-sm text-gray-400 py-2">Carregando slots...</p>
                                ) : slots.length === 0 && entrevista.data ? (
                                    <p className="text-sm text-amber-600 py-2">Nenhum horário disponível para esta data.</p>
                                ) : (
                                    <select
                                        value={entrevista.hora}
                                        onChange={e => setEntrevista(prev => ({ ...prev, hora: e.target.value }))}
                                        required
                                        disabled={slots.length === 0}
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-[#0C4773] focus:ring-2 focus:ring-[#0C4773]/20 transition disabled:opacity-50"
                                    >
                                        <option value="">Selecione um horário...</option>
                                        {slots.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                )}
                                {entrevistaErrors.data_hora && <p className="text-red-500 text-xs mt-1">{entrevistaErrors.data_hora}</p>}
                            </div>

                            {/* Tipo */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Tipo</label>
                                <div className="flex gap-3">
                                    {['Presencial', 'Online'].map(t => (
                                        <label key={t} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border cursor-pointer text-sm font-medium transition ${
                                            entrevista.tipo === t
                                                ? 'border-[#0C4773] bg-[#0C4773]/5 text-[#0C4773]'
                                                : 'border-gray-200 text-gray-500 hover:border-gray-300'
                                        }`}>
                                            <input type="radio" name="tipo" value={t} checked={entrevista.tipo === t} onChange={() => setEntrevista(prev => ({ ...prev, tipo: t }))} className="sr-only" />
                                            {t}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-2 flex justify-end gap-3">
                                <button type="button" onClick={fecharModalEntrevista} className="text-sm font-medium text-gray-600 hover:text-gray-800 px-5 py-2.5 rounded-xl hover:bg-gray-200 transition-colors cursor-pointer">
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={submittingEntrevista || !entrevista.vaga_id || !entrevista.hora}
                                    className="text-sm font-semibold text-white bg-[#0C4773] hover:bg-[#007EAE] px-5 py-2.5 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                                >
                                    {submittingEntrevista ? 'Agendando...' : 'Confirmar Entrevista'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={closeModal}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                        
                        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">
                                    {editMode ? 'Editar Talento' : 'Novo Talento'}
                                </h2>
                                <p className="text-sm text-gray-400 mt-0.5">
                                    {editMode ? `Atualizando informações de ${data.nome}` : 'Cadastre um novo perfil no banco de talentos'}
                                </p>
                            </div>
                            <button type="button" onClick={closeModal} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form id="form-talento" onSubmit={handleSubmit} className="overflow-y-auto px-6 py-5 space-y-6">
                            {/* Dados Pessoais e Contato */}
                            <div>
                                <h3 className="text-sm font-bold text-[#0C4773] mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
                                    <span className="w-1.5 h-4 bg-[#0C4773] rounded-full"></span>
                                    Dados Pessoais e Contato
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Nome Completo</label>
                                        <input
                                            type="text"
                                            value={data.nome}
                                            onChange={e => setData('nome', e.target.value)}
                                            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0C4773] focus:ring-2 focus:ring-[#0C4773]/20 transition"
                                            placeholder="Nome completo"
                                            required
                                        />
                                        {errors.nome && <span className="text-red-500 text-xs mt-1 block">{errors.nome}</span>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">CPF</label>
                                        <input
                                            type="text"
                                            value={data.cpf}
                                            onChange={e => setData('cpf', maskCPF(e.target.value))}
                                            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0C4773] focus:ring-2 focus:ring-[#0C4773]/20 transition"
                                            placeholder="000.000.000-00"
                                            required
                                        />
                                        {errors.cpf && <span className="text-red-500 text-xs mt-1 block">{errors.cpf}</span>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">E-mail</label>
                                        <input
                                            type="email"
                                            value={data.email}
                                            onChange={e => setData('email', e.target.value)}
                                            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0C4773] focus:ring-2 focus:ring-[#0C4773]/20 transition"
                                            placeholder="email@exemplo.com"
                                            required
                                        />
                                        {errors.email && <span className="text-red-500 text-xs mt-1 block">{errors.email}</span>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Telefone</label>
                                        <input
                                            type="text"
                                            value={data.telefone}
                                            onChange={e => setData('telefone', maskPhone(e.target.value))}
                                            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0C4773] focus:ring-2 focus:ring-[#0C4773]/20 transition"
                                            placeholder="(00) 00000-0000"
                                            required
                                        />
                                        {errors.telefone && <span className="text-red-500 text-xs mt-1 block">{errors.telefone}</span>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Nível de Escolaridade</label>
                                        <select
                                            value={data.nivel_escolaridade}
                                            onChange={e => setData('nivel_escolaridade', e.target.value)}
                                            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0C4773] focus:ring-2 focus:ring-[#0C4773]/20 transition cursor-pointer"
                                            required
                                        >
                                            <option value="">Selecione</option>
                                            <option value="fundamental">Fundamental</option>
                                            <option value="medio">Ensino Médio</option>
                                            <option value="tecnico">Técnico</option>
                                            <option value="graduacao">Graduação</option>
                                            <option value="posgraduacao">Pós-graduação</option>
                                        </select>
                                        {errors.nivel_escolaridade && <span className="text-red-500 text-xs mt-1 block">{errors.nivel_escolaridade}</span>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Data de Nascimento</label>
                                        <input
                                            type="date"
                                            value={data.data_nascimento}
                                            onChange={e => setData('data_nascimento', e.target.value)}
                                            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0C4773] focus:ring-2 focus:ring-[#0C4773]/20 transition"
                                            max={new Date().toISOString().split('T')[0]}
                                        />
                                        {errors.data_nascimento && <span className="text-red-500 text-xs mt-1 block">{errors.data_nascimento}</span>}
                                    </div>
                                </div>
                            </div>

                            {/* Localização */}
                            <div>
                                <h3 className="text-sm font-bold text-[#0C4773] mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
                                    <span className="w-1.5 h-4 bg-[#0C4773] rounded-full"></span>
                                    Localização
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="relative">
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">CEP</label>
                                        <input
                                            type="text"
                                            value={data.cep}
                                            onChange={e => setData('cep', maskCEP(e.target.value))}
                                            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0C4773] focus:ring-2 focus:ring-[#0C4773]/20 transition"
                                            placeholder="00000-000"
                                            required
                                        />
                                        {buscandoCep && <span className="absolute right-3 top-8 text-xs font-bold text-[#0C4773] animate-pulse">Buscando...</span>}
                                        {errors.cep && <span className="text-red-500 text-xs mt-1 block">{errors.cep}</span>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Logradouro</label>
                                        <input
                                            type="text"
                                            value={data.logradouro}
                                            onChange={e => setData('logradouro', e.target.value)}
                                            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0C4773] focus:ring-2 focus:ring-[#0C4773]/20 transition"
                                            placeholder="Rua, Avenida, etc."
                                            required
                                        />
                                        {errors.logradouro && <span className="text-red-500 text-xs mt-1 block">{errors.logradouro}</span>}
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Região</label>
                                        <select
                                            value={data.regiao}
                                            onChange={e => setData('regiao', e.target.value)}
                                            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0C4773] focus:ring-2 focus:ring-[#0C4773]/20 transition cursor-pointer"
                                            required
                                        >
                                            <option value="">Selecione uma região</option>
                                            <option value="Zona Sul">Zona Sul</option>
                                            <option value="Zona Norte">Zona Norte</option>
                                            <option value="Zona Leste">Zona Leste</option>
                                            <option value="Zona Oeste">Zona Oeste</option>
                                            <option value="Centro">Centro</option>
                                            <option value="ABC">ABC</option>
                                        </select>
                                        {errors.regiao && <span className="text-red-500 text-xs mt-1 block">{errors.regiao}</span>}
                                    </div>
                                </div>
                            </div>

                            {/* Formação e Currículo */}
                            <div>
                                <h3 className="text-sm font-bold text-[#0C4773] mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
                                    <span className="w-1.5 h-4 bg-[#0C4773] rounded-full"></span>
                                    Currículo
                                </h3>
                                <div>
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        onChange={e => setData('curriculo', e.target.files[0])}
                                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-[#0C4773]/10 file:text-[#0C4773] hover:file:bg-[#0C4773]/20 file:cursor-pointer file:transition-colors"
                                        required={!editMode}
                                    />
                                    {editMode && (
                                        <p className="text-xs text-gray-400 mt-2 ml-1">
                                            * Se deseja manter o currículo atual, não precisa enviar outro arquivo.
                                        </p>
                                    )}
                                    {errors.curriculo && <span className="text-red-500 text-xs mt-1 block">{errors.curriculo}</span>}
                                </div>
                            </div>
                        </form>

                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 rounded-b-2xl shrink-0">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="text-sm font-medium text-gray-600 hover:text-gray-800 px-5 py-2.5 rounded-xl hover:bg-gray-200 transition-colors cursor-pointer"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                form="form-talento"
                                disabled={processing}
                                className="text-sm font-semibold text-white bg-[#0C4773] hover:bg-[#007EAE] px-5 py-2.5 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                            >
                                {processing ? 'Salvando...' : 'Salvar Talento'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
