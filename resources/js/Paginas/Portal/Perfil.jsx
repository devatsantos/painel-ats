import React, { useEffect, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import FlashMessages from '../Componentes/FlashMessages';
import axios from 'axios';

export default function PortalPerfil({ candidato }) {
    const [buscandoCep, setBuscandoCep] = useState(false);

    const { data, setData, put, processing, errors } = useForm({
        nome: candidato.nome || '',
        email: candidato.email || '',
        telefone: candidato.telefone || '',
        cep: candidato.cep || '',
        logradouro: candidato.logradouro || '',
        regiao: candidato.regiao || '',
        nivel_escolaridade: candidato.nivel_escolaridade || '',
        data_nascimento: candidato.data_nascimento || '',
    });

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

    useEffect(() => {
        const cepLimpo = data.cep.replace(/\D/g, '');
        if (cepLimpo.length === 8) {
            setBuscandoCep(true);
            axios.get(`https://viacep.com.br/ws/${cepLimpo}/json/`)
                .then(response => {
                    if (!response.data.erro) {
                        const { logradouro } = response.data;
                        setData(prev => ({ ...prev, logradouro: logradouro || '', cep: data.cep }));
                    }
                })
                .finally(() => setBuscandoCep(false));
        }
    }, [data.cep]);

    function submitPerfil(e) {
        e.preventDefault();
        put('/portal/perfil', {
            preserveScroll: true,
        });
    }

    const inputClasses = "mt-1 block w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-gray-900 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-sm";
    const labelClasses = "block text-sm font-semibold text-gray-700 mb-1";

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Head title="Meu Perfil — Portal do Candidato" />

            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#071F30] flex items-center justify-center">
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
                        <Link href="/portal/perfil" className="px-3 py-2 text-sm font-semibold text-[#071F30] bg-blue-50 rounded-lg">
                            Perfil
                        </Link>
                        <Link href="/logout" method="post" as="button" className="ml-2 px-3 py-2 text-sm font-medium text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                            Sair
                        </Link>
                    </nav>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">

                {/* Voltar */}
                <Link href="/portal/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-[#071F30] transition-colors font-medium">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Voltar ao painel
                </Link>

                <FlashMessages />

                <form onSubmit={submitPerfil} className="space-y-0">
                    {/* Dados Pessoais */}
                    <div className="bg-white rounded-t-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
                            <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <span className="w-2 h-5 bg-[#071F30] rounded-full" />
                                Dados Pessoais
                            </h1>
                            <p className="text-xs text-gray-400 mt-1">Atualize suas informações de contato</p>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                                <div className="md:col-span-6">
                                    <label className={labelClasses}>Nome Completo</label>
                                    <input value={data.nome} onChange={e => setData('nome', e.target.value)} className={inputClasses} placeholder="Seu nome completo" />
                                    {errors.nome && <p className="text-red-500 text-xs mt-1">{errors.nome}</p>}
                                </div>
                                <div className="md:col-span-3">
                                    <label className={labelClasses}>CPF</label>
                                    <input value={candidato.cpf} readOnly className={`${inputClasses} bg-gray-200 cursor-not-allowed`} />
                                    <p className="text-xs text-gray-400 mt-1">O CPF não pode ser alterado</p>
                                </div>
                                <div className="md:col-span-3">
                                    <label className={labelClasses}>E-mail</label>
                                    <input type="email" value={data.email} onChange={e => setData('email', e.target.value)} className={inputClasses} placeholder="email@exemplo.com" />
                                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                </div>
                                <div className="md:col-span-3">
                                    <label className={labelClasses}>Telefone</label>
                                    <input value={data.telefone} onChange={e => setData('telefone', maskPhone(e.target.value))} className={inputClasses} placeholder="(00) 00000-0000" />
                                    {errors.telefone && <p className="text-red-500 text-xs mt-1">{errors.telefone}</p>}
                                </div>
                                <div className="md:col-span-3">
                                    <label className={labelClasses}>Nível de Escolaridade</label>
                                    <select value={data.nivel_escolaridade} onChange={e => setData('nivel_escolaridade', e.target.value)} className={inputClasses}>
                                        <option value="">Selecione</option>
                                        <option value="fundamental">Fundamental</option>
                                        <option value="medio">Ensino Médio</option>
                                        <option value="tecnico">Técnico</option>
                                        <option value="graduacao">Graduação</option>
                                        <option value="posgraduacao">Pós-graduação</option>
                                    </select>
                                    {errors.nivel_escolaridade && <p className="text-red-500 text-xs mt-1">{errors.nivel_escolaridade}</p>}
                                </div>
                                <div className="md:col-span-3">
                                    <label className={labelClasses}>Data de Nascimento</label>
                                    <input
                                        type="date"
                                        value={data.data_nascimento}
                                        onChange={e => setData('data_nascimento', e.target.value)}
                                        className={inputClasses}
                                        max={new Date().toISOString().split('T')[0]}
                                    />
                                    {errors.data_nascimento && <p className="text-red-500 text-xs mt-1">{errors.data_nascimento}</p>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Localização */}
                    <div className="bg-white border-x border-gray-100 overflow-hidden">
                        <div className="px-6 pt-6 pb-4 border-y border-gray-100 bg-gray-50/50">
                            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                <span className="w-2 h-5 bg-[#071F30] rounded-full" />
                                Localização
                            </h2>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                                <div className="md:col-span-2 relative">
                                    <label className={labelClasses}>CEP</label>
                                    <input value={data.cep} onChange={e => setData('cep', maskCEP(e.target.value))} className={inputClasses} placeholder="00000-000" />
                                    {buscandoCep && <span className="absolute right-3 top-9 text-xs font-bold text-blue-600 animate-pulse">Buscando...</span>}
                                    {errors.cep && <p className="text-red-500 text-xs mt-1">{errors.cep}</p>}
                                </div>
                                <div className="md:col-span-4">
                                    <label className={labelClasses}>Logradouro</label>
                                    <input value={data.logradouro} onChange={e => setData('logradouro', e.target.value)} className={inputClasses} />
                                    {errors.logradouro && <p className="text-red-500 text-xs mt-1">{errors.logradouro}</p>}
                                </div>
                                <div className="md:col-span-6">
                                    <label className={labelClasses}>Região</label>
                                    <select value={data.regiao} onChange={e => setData('regiao', e.target.value)} className={inputClasses}>
                                        <option value="">Selecione uma região</option>
                                        <option value="Zona Sul">Zona Sul</option>
                                        <option value="Zona Norte">Zona Norte</option>
                                        <option value="Zona Leste">Zona Leste</option>
                                        <option value="Zona Oeste">Zona Oeste</option>
                                        <option value="Centro">Centro</option>
                                        <option value="ABC">ABC</option>
                                    </select>
                                    {errors.regiao && <p className="text-red-500 text-xs mt-1">{errors.regiao}</p>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Botão Salvar */}
                    <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border border-gray-100 rounded-b-2xl shadow-sm">
                        <Link href="/portal/dashboard" className="text-sm font-medium text-gray-600 hover:text-gray-800 px-5 py-2.5 rounded-xl hover:bg-gray-200 transition-colors">
                            Cancelar
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex justify-center items-center gap-2 py-2.5 px-8 shadow-sm text-sm font-bold rounded-xl text-white bg-[#071F30] hover:bg-[#007EAE] focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {processing ? (
                                <>
                                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Salvando...
                                </>
                            ) : 'Salvar Alterações'}
                        </button>
                    </div>
                </form>

            </main>
        </div>
    );
}
