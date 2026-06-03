import React, { useState, useEffect } from 'react';
import { Link, usePage, useForm, router } from '@inertiajs/react';
import Sidebar from '../Componentes/Index';
import Paginacao from '../Componentes/Paginacao.jsx';

export default function Vagas({vagas, formularios}) {
    const [modalVaga, setModalVaga] = useState(null);
    const [vagaEditando, setVagaEditando] = useState(null);
    const [novaVaga, setNovaVaga] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('modal') === 'true') setNovaVaga(true);
    }, []);
    const [searchTerm, setSearchTerm] = useState('');

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        titulo: '',
        horario: '',
        local: '',
        descricao: '',
        requisitos: '',
        salario: '',
        va: '',
        vr: '',
        vt: '',
        escala: '',
        status_efetivacao: '',
        ativo: false,
        pcd: false,
        formulario_id: '',
    });

    const handleEdit = (vaga) => {
        setVagaEditando(vaga);
        setData({
            titulo: vaga.titulo || '',
            horario: vaga.horario || '',
            local: vaga.local || '',
            descricao: vaga.descricao || '',
            requisitos: vaga.requisitos || '',
            salario: vaga.salario || '',
            va: vaga.va || '',
            vr: vaga.vr || '',
            vt: vaga.vt || '',
            escala: vaga.escala || '',
            status_efetivacao: vaga.status_efetivacao || '',
            ativo: vaga.ativo ? true : false,
            pcd: vaga.pcd ? true : false,
            formulario_id: vaga.formulario_id || '',
        });
    };
    const handleToggleAtivo = (vaga) => {
        router.put(`/vagas/${vaga.id}`, {
            titulo: vaga.titulo,
            horario: vaga.horario,
            local: vaga.local,
            descricao: vaga.descricao,
            requisitos: vaga.requisitos,
            salario: vaga.salario,
            va: vaga.va || '',
            vr: vaga.vr || '',
            vt: vaga.vt || '',
            escala: vaga.escala,
            status_efetivacao: vaga.status_efetivacao,
            ativo: !vaga.ativo,
            pcd: vaga.pcd ? true : false,
            formulario_id: vaga.formulario_id,
        }, {
            preserveScroll: true,
        });
    };

    const handleDelete = (vaga) => {
        if (confirm(`Tem certeza que deseja excluir a vaga "${vaga.titulo}"? Esta ação não pode ser desfeita.`)) {
            destroy(`/vagas/${vaga.id}`, {
                preserveScroll: true,
            });
        }
    };
    const maskMoney = (value) => {
        if (!value) return '';
        let cleanValue = value.replace(/\D/g, '');
        if (cleanValue === '') return '';
        cleanValue = cleanValue.padStart(3, '0');
        const reais = cleanValue.slice(0, -2);
        const centavos = cleanValue.slice(-2);
        
        const reaisFormatado = parseInt(reais, 10).toLocaleString('pt-BR');
        return `R$ ${reaisFormatado},${centavos}`;
    };

    const handleMoneyChange = (field, e) => {
        const rawValue = e.target.value;
        setData(field, maskMoney(rawValue));
    };

    const submitEdit = (e) => {
        e.preventDefault();
        put(`/vagas/${vagaEditando.id}`, {
            onSuccess: () => {
                setVagaEditando(null);
                reset();
            }
        });
    };

    const handleCreate = () => {
        reset();
        setNovaVaga(true);
    };

    const submitCreate = (e) => {
        e.preventDefault();
        post('/vagas', {
            onSuccess: () => {
                setNovaVaga(false);
                reset();
            }
        });
    };

    const closeModalEdit = () => {
        setVagaEditando(null);
        setNovaVaga(false);
        reset();
    };

    const filteredVagas = vagas.data.filter(vaga => {
        const search = searchTerm.toLowerCase();
        const matchTitulo = vaga.titulo?.toLowerCase().includes(search);
        const matchLocal = vaga.local?.toLowerCase().includes(search);
        return matchTitulo || matchLocal;
    });

    return (
        <>
            <Sidebar />
            <div className="flex min-h-screen bg-gray-100 md:ml-64">
                <main className="flex-1 p-6 lg:p-10">
                    
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Vagas</h1>
                            <p className="text-gray-500 mt-1">Gerencie as vagas disponíveis na empresa.</p>
                        </div>
                        <button onClick={handleCreate} className="inline-flex items-center justify-center gap-2 bg-[#0C4773] hover:bg-[#007EAE] text-white font-semibold px-5 py-2.5 rounded-xl shadow-md transition-all duration-200 cursor-pointer">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Nova Vaga
                        </button>
                    </div>

                    <div className="mb-8 relative w-full">
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            className="w-full pl-14 pr-12 py-4 rounded-2xl border-0 ring-1 ring-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0C4773] shadow-sm transition-all sm:text-base text-sm"
                            placeholder="Pesquisar vagas por título ou local..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button 
                                onClick={() => setSearchTerm('')}
                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {filteredVagas.length > 0 ? (
                            filteredVagas.map((vaga) => (
                                <div key={vaga.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
                                
                                <div className="px-6 pt-6 pb-4 border-b border-gray-100">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1">
                                            <h2 className="text-xl font-bold text-gray-800">{vaga.titulo}</h2>
                                            <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                {vaga.local}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <button
                                                onClick={() => handleToggleAtivo(vaga)}
                                                className={`group inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-200 cursor-pointer ${
                                                    vaga.ativo
                                                        ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                                                        : 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
                                                }`}
                                                title={vaga.ativo ? 'Desativar vaga' : 'Ativar vaga'}
                                            >
                                                <div className={`relative w-8 h-4 rounded-full transition-colors duration-200 ${vaga.ativo ? 'bg-green-600' : 'bg-red-400'}`}>
                                                    <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform duration-200 ${vaga.ativo ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
                                                </div>
                                                <span>
                                                    {vaga.ativo ? 'Ativa' : 'Inativa'}
                                                </span>
                                            </button>
                                            {vaga.pcd ? (
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                                                    PCD
                                                </span>
                                            ) : null}
                                        </div>
                                    </div>
                                </div>

                                <div className="px-6 py-4 space-y-4">
                                    <div>
                                        <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">{vaga.descricao}</p>
                                    </div>

                                    <div>
                                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Requisitos</span>
                                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{vaga.requisitos}</p>
                                    </div>

                                    <button
                                        onClick={() => setModalVaga(vaga)}
                                        className="text-sm font-medium text-[#0C4773] hover:underline cursor-pointer"
                                    >
                                        Ver mais
                                    </button>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {vaga.horario}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            Escala {vaga.escala}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            {vaga.status_efetivacao}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                                            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                            </svg>
                                            {vaga.salario}
                                        </div>
                                    </div>

                                    <div>
                                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Benefícios</span>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600">
                                                🍽️ VA: {vaga.va}
                                            </span>
                                            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600">
                                                🥗 VR: {vaga.vr}
                                            </span>
                                            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600">
                                                🚌 VT: {vaga.vt}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
                                    <button 
                                        onClick={() => handleEdit(vaga)}
                                        className="text-sm font-medium text-gray-500 hover:text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer">
                                        Editar
                                    </button>
                                    <button className="text-sm font-medium text-red-500 hover:text-red-700 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors cursor-pointer" onClick={() => handleDelete(vaga)}>
                                        Excluir
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full flex flex-col items-center justify-center p-12 bg-white rounded-2xl shadow-sm border border-gray-200">
                            <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h3 className="text-xl font-bold text-gray-800 mb-1">Nenhuma vaga encontrada</h3>
                            <p className="text-gray-500 text-center">
                                {searchTerm ? `Não encontramos resultados para "${searchTerm}".` : "Ainda não existem vagas cadastradas."}
                            </p>
                        </div>
                    )}
                    </div>
                    <Paginacao paginacao={vagas} />
                </main>
            </div>

            {modalVaga && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setModalVaga(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        
                        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-gray-100">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">{modalVaga.titulo}</h2>
                                <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    {modalVaga.local}
                                </div>
                            </div>
                            <button onClick={() => setModalVaga(null)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="px-6 py-5 space-y-5">
                            <div className="flex flex-wrap gap-2">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${modalVaga.ativo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {modalVaga.ativo ? 'Ativa' : 'Inativa'}
                                </span>
                                {modalVaga.pcd ? (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                                        PCD
                                    </span>
                                ) : null}
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                                    {modalVaga.status_efetivacao}
                                </span>
                            </div>

                            <div>
                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Descrição</span>
                                <p className="text-sm text-gray-600 mt-2 leading-relaxed whitespace-pre-wrap break-words">{modalVaga.descricao}</p>
                            </div>

                            <div>
                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Requisitos</span>
                                <p className="text-sm text-gray-600 mt-2 leading-relaxed whitespace-pre-wrap break-words">{modalVaga.requisitos}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {modalVaga.horario}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    Escala {modalVaga.escala}
                                </div>
                                <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                    </svg>
                                    {modalVaga.salario}
                                </div>
                            </div>

                            <div>
                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Benefícios</span>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600">
                                        🍽️ VA: {modalVaga.va}
                                    </span>
                                    <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600">
                                        🥗 VR: {modalVaga.vr}
                                    </span>
                                    <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600">
                                        🚌 VT: {modalVaga.vt}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end rounded-b-2xl">
                            <button onClick={() => setModalVaga(null)} className="text-sm font-medium text-gray-600 hover:text-gray-800 px-5 py-2.5 rounded-xl hover:bg-gray-200 transition-colors cursor-pointer">
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {(vagaEditando || novaVaga) && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={closeModalEdit}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>

                        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">{vagaEditando ? 'Editar Vaga' : 'Nova Vaga'}</h2>
                                <p className="text-sm text-gray-400 mt-0.5">{vagaEditando ? vagaEditando.titulo : 'Cadastre uma nova vaga no sistema'}</p>
                            </div>
                            <button
                                type="button"
                                onClick={closeModalEdit}
                                className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form id="form-editar-vaga" onSubmit={vagaEditando ? submitEdit : submitCreate} className="overflow-y-auto px-6 py-5 space-y-5">

                            <div>
                                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Informações Gerais</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Título <span className="text-red-400">*</span></label>
                                        <input
                                            type="text"
                                            value={data.titulo}
                                            onChange={e => setData('titulo', e.target.value)}
                                            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0C4773] focus:ring-2 focus:ring-[#0C4773]/20 transition"
                                            placeholder="Ex: Desenvolvedor Full Stack"
                                            required
                                        />
                                        {errors.titulo && <p className="text-red-500 text-xs mt-1">{errors.titulo}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Local <span className="text-red-400">*</span></label>
                                        <input
                                            type="text"
                                            value={data.local}
                                            onChange={e => setData('local', e.target.value)}
                                            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0C4773] focus:ring-2 focus:ring-[#0C4773]/20 transition"
                                            placeholder="Ex: São Paulo - SP"
                                            required
                                        />
                                        {errors.local && <p className="text-red-500 text-xs mt-1">{errors.local}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Horário <span className="text-red-400">*</span></label>
                                        <input
                                            type="text"
                                            value={data.horario}
                                            onChange={e => setData('horario', e.target.value)}
                                            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0C4773] focus:ring-2 focus:ring-[#0C4773]/20 transition"
                                            placeholder="Ex: 08:00 - 17:00"
                                            required
                                        />
                                        {errors.horario && <p className="text-red-500 text-xs mt-1">{errors.horario}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Escala <span className="text-red-400">*</span></label>
                                        <input
                                            type="text"
                                            value={data.escala}
                                            onChange={e => setData('escala', e.target.value)}
                                            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0C4773] focus:ring-2 focus:ring-[#0C4773]/20 transition"
                                            placeholder="Ex: 5x2"
                                            required
                                        />
                                        {errors.escala && <p className="text-red-500 text-xs mt-1">{errors.escala}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Status de Efetivação <span className="text-red-400">*</span></label>
                                        <input
                                            type="text"
                                            value={data.status_efetivacao}
                                            onChange={e => setData('status_efetivacao', e.target.value)}
                                            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0C4773] focus:ring-2 focus:ring-[#0C4773]/20 transition"
                                            placeholder="Ex: CLT, PJ, Temporário"
                                            required
                                        />
                                        {errors.status_efetivacao && <p className="text-red-500 text-xs mt-1">{errors.status_efetivacao}</p>}
                                    </div>
                                    
                                    <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">Formulário <span className="text-red-400">*</span></label>
                                          <select
                                              value={data.formulario_id}
                                              onChange={e => {
                                                  const selectedId = e.target.value;
                                                  const selectedForm = formularios.find(f => f.id.toString() === selectedId);
                                                  
                                                  if (selectedForm) {
                                                      setData(prevData => ({
                                                          ...prevData,
                                                          formulario_id: selectedId,
                                                          titulo: selectedForm.titulo_formulario || prevData.titulo,
                                                          descricao: selectedForm.descricao || prevData.descricao,
                                                          requisitos: selectedForm.requisitos || prevData.requisitos
                                                      }));
                                                  } else {
                                                      setData('formulario_id', selectedId);
                                                  }
                                              }}
                                            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0C4773] focus:ring-2 focus:ring-[#0C4773]/20 transition"
                                            required
                                        >
                                            <option value="" disabled>Selecione um formulário</option>
                                            {formularios && formularios.map((form) => (
                                                <option key={form.id} value={form.id}>
                                                    {form.titulo_formulario || form.titulo || form.nome}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.formulario_id && <p className="text-red-500 text-xs mt-1">{errors.formulario_id}</p>}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Detalhes da Vaga</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Descrição <span className="text-red-400">*</span></label>
                                        <textarea
                                            value={data.descricao}
                                            onChange={e => setData('descricao', e.target.value)}
                                            rows={3}
                                            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0C4773] focus:ring-2 focus:ring-[#0C4773]/20 transition resize-none"
                                            placeholder="Descreva as responsabilidades da vaga..."
                                            required
                                        />
                                        {errors.descricao && <p className="text-red-500 text-xs mt-1">{errors.descricao}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Requisitos <span className="text-red-400">*</span></label>
                                        <textarea
                                            value={data.requisitos}
                                            onChange={e => setData('requisitos', e.target.value)}
                                            rows={3}
                                            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0C4773] focus:ring-2 focus:ring-[#0C4773]/20 transition resize-none"
                                            placeholder="Liste os requisitos necessários..."
                                            required
                                        />
                                        {errors.requisitos && <p className="text-red-500 text-xs mt-1">{errors.requisitos}</p>}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Remuneração e Benefícios</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    <div className="col-span-2 sm:col-span-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Salário <span className="text-red-400">*</span></label>
                                        <input
                                            type="text"
                                            value={data.salario}
                                            onChange={e => handleMoneyChange('salario', e)}
                                            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0C4773] focus:ring-2 focus:ring-[#0C4773]/20 transition"
                                            placeholder="Ex: R$ 5.000,00"
                                            required
                                        />
                                        {errors.salario && <p className="text-red-500 text-xs mt-1">{errors.salario}</p>}
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <label className="text-sm font-medium text-gray-700">🍽️ VA</label>
                                            <label className="flex items-center gap-1.5 cursor-pointer">
                                                <div className={`relative w-7 h-4 rounded-full transition-colors ${data.va === 'Não tem' ? 'bg-red-400' : 'bg-gray-300'}`}>
                                                    <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${data.va === 'Não tem' ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={data.va === 'Não tem'}
                                                    onChange={e => setData('va', e.target.checked ? 'Não tem' : '')}
                                                    className="sr-only"
                                                />
                                                <span className="text-[10px] uppercase font-bold text-gray-500">Não tem</span>
                                            </label>
                                        </div>
                                        <input
                                            type="text"
                                            value={data.va === 'Não tem' ? '' : data.va}
                                            onChange={e => handleMoneyChange('va', e)}
                                            disabled={data.va === 'Não tem'}
                                            className={`w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm transition focus:outline-none focus:border-[#0C4773] focus:ring-2 focus:ring-[#0C4773]/20 ${data.va === 'Não tem' ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-50 text-gray-800 placeholder-gray-400'}`}
                                            placeholder={data.va === 'Não tem' ? 'Não possui VA' : "R$ 0,00"}
                                        />
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <label className="text-sm font-medium text-gray-700">🥗 VR</label>
                                            <label className="flex items-center gap-1.5 cursor-pointer">
                                                <div className={`relative w-7 h-4 rounded-full transition-colors ${data.vr === 'Não tem' ? 'bg-red-400' : 'bg-gray-300'}`}>
                                                    <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${data.vr === 'Não tem' ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={data.vr === 'Não tem'}
                                                    onChange={e => setData('vr', e.target.checked ? 'Não tem' : '')}
                                                    className="sr-only"
                                                />
                                                <span className="text-[10px] uppercase font-bold text-gray-500">Não tem</span>
                                            </label>
                                        </div>
                                        <input
                                            type="text"
                                            value={data.vr === 'Não tem' ? '' : data.vr}
                                            onChange={e => handleMoneyChange('vr', e)}
                                            disabled={data.vr === 'Não tem'}
                                            className={`w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm transition focus:outline-none focus:border-[#0C4773] focus:ring-2 focus:ring-[#0C4773]/20 ${data.vr === 'Não tem' ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-50 text-gray-800 placeholder-gray-400'}`}
                                            placeholder={data.vr === 'Não tem' ? 'Não possui VR' : "R$ 0,00"}
                                        />
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <label className="text-sm font-medium text-gray-700">🚌 VT</label>
                                            <label className="flex items-center gap-1.5 cursor-pointer">
                                                <div className={`relative w-7 h-4 rounded-full transition-colors ${data.vt === 'Não tem' ? 'bg-red-400' : 'bg-gray-300'}`}>
                                                    <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${data.vt === 'Não tem' ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={data.vt === 'Não tem'}
                                                    onChange={e => setData('vt', e.target.checked ? 'Não tem' : '')}
                                                    className="sr-only"
                                                />
                                                <span className="text-[10px] uppercase font-bold text-gray-500">Não tem</span>
                                            </label>
                                        </div>
                                        <input
                                            type="text"
                                            value={data.vt === 'Não tem' ? '' : data.vt}
                                            onChange={e => handleMoneyChange('vt', e)}
                                            disabled={data.vt === 'Não tem'}
                                            className={`w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm transition focus:outline-none focus:border-[#0C4773] focus:ring-2 focus:ring-[#0C4773]/20 ${data.vt === 'Não tem' ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-50 text-gray-800 placeholder-gray-400'}`}
                                            placeholder={data.vt === 'Não tem' ? 'Não possui VT' : "R$ 0,00"}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-4">
                                <label className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 cursor-pointer hover:bg-gray-100 transition">
                                    <div className={`relative w-10 h-5 rounded-full transition-colors ${data.ativo ? 'bg-[#0C4773]' : 'bg-gray-300'}`}>
                                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${data.ativo ? 'translate-x-5' : 'translate-x-0.5'}`} />
                                    </div>
                                    <input type="checkbox" checked={data.ativo} onChange={e => setData('ativo', e.target.checked)} className="sr-only" />
                                    <span className="text-sm font-medium text-gray-700">Vaga Ativa</span>
                                </label>

                                <label className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 cursor-pointer hover:bg-gray-100 transition">
                                    <div className={`relative w-10 h-5 rounded-full transition-colors ${data.pcd ? 'bg-[#0C4773]' : 'bg-gray-300'}`}>
                                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${data.pcd ? 'translate-x-5' : 'translate-x-0.5'}`} />
                                    </div>
                                    <input type="checkbox" checked={data.pcd} onChange={e => setData('pcd', e.target.checked)} className="sr-only" />
                                    <span className="text-sm font-medium text-gray-700">Vaga PCD</span>
                                </label>
                            </div>

                        </form>

                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3 rounded-b-2xl shrink-0">
                            <button
                                type="button"
                                onClick={closeModalEdit}
                                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-200 transition-colors cursor-pointer"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                form="form-editar-vaga"
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
                                ) : (vagaEditando ? 'Salvar Alterações' : 'Criar Vaga')}
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </>
    );
}
