import React, { useState, useEffect } from 'react';
import { useForm, Head, usePage } from '@inertiajs/react';

export default function Create() {
    const { props } = usePage();
    const { data, setData, post, processing, errors, reset } = useForm({
        nome: '',
        email: '',
        telefone: '',
        situacao: '',
        foto: null,
    });

    const [fotoPreview, setFotoPreview] = useState(null);
    const [fotoError, setFotoError] = useState('');
    const [enviadoComSucesso, setEnviadoComSucesso] = useState(false);

    // Monitora mensagem de sucesso vinda do backend (flash messages)
    useEffect(() => {
        if (props.flash?.success) {
            setEnviadoComSucesso(true);
            reset();
            setFotoPreview(null);
        }
    }, [props.flash?.success]);

    const maskTelefone = (value) => {
        if (!value) return '';
        return value
            .replace(/\D/g, '')
            .replace(/(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{5})(\d)/, '$1-$2')
            .replace(/(-\d{4})\d+?$/, '$1');
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setFotoError('');
        setFotoPreview(null);

        if (!file) {
            setData('foto', null);
            return;
        }

        // Validação de tipo (apenas imagens)
        if (!file.type.startsWith('image/')) {
            setFotoError('Por favor, selecione apenas arquivos de imagem.');
            return;
        }

        // Validação de tamanho (máximo 2MB)
        if (file.size > 2 * 1024 * 1024) {
            setFotoError('A imagem deve ter no máximo 2MB.');
            return;
        }

        setData('foto', file);

        // Gera preview instantâneo da foto
        const reader = new FileReader();
        reader.onloadend = () => {
            setFotoPreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (fotoError) return;

        post('/ouvidoria', {
            forceFormData: true,
            onSuccess: () => {
                // Sucesso é manipulado no useEffect do flash message
            }
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0C4773]/10 via-slate-50 to-[#0C4773]/5 flex items-center justify-center p-4 sm:p-6 font-sans">
            <Head title="Ouvidoria - Enviar Relato" />

            <div className="w-full max-w-2xl bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-white/40 overflow-hidden transition-all duration-300">
                
                {/* Header */}
                <div className="bg-[#0C4773] px-6 py-10 sm:px-10 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent)] pointer-events-none" />
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">Ouvidoria</h1>
                    <p className="text-blue-200/90 text-sm mt-2 max-w-md mx-auto leading-relaxed">
                        Este é um canal aberto e seguro para enviar suas dúvidas, sugestões, reclamações ou elogios de forma transparente.
                    </p>
                </div>

                {/* Form / Success view */}
                <div className="p-6 sm:p-10">
                    {enviadoComSucesso ? (
                        <div className="text-center py-8 space-y-4 animate-fade-in">
                            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
                                <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800">Relato Enviado com Sucesso!</h2>
                            <p className="text-gray-500 max-w-sm mx-auto text-sm">
                                Seu manifesto foi recebido por nossa ouvidoria e será analisado cuidadosamente pela equipe administrativa.
                            </p>
                            <button
                                onClick={() => setEnviadoComSucesso(false)}
                                className="inline-flex items-center justify-center px-6 py-2.5 bg-[#0C4773] hover:bg-[#007EAE] text-white font-semibold rounded-xl text-sm transition-all duration-200 shadow-md cursor-pointer mt-4"
                            >
                                Enviar outro relato
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Nome */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Nome Completo (Opcional)</label>
                                    <input
                                        type="text"
                                        value={data.nome}
                                        onChange={e => setData('nome', e.target.value)}
                                        placeholder="Seu nome"
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0C4773] focus:ring-2 focus:ring-[#0C4773]/20 transition"
                                    />
                                    {errors.nome && <p className="text-red-500 text-xs mt-1">{errors.nome}</p>}
                                </div>

                                {/* E-mail */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">E-mail (Opcional)</label>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={e => setData('email', e.target.value)}
                                        placeholder="seu.email@exemplo.com"
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0C4773] focus:ring-2 focus:ring-[#0C4773]/20 transition"
                                    />
                                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                </div>
                            </div>

                            {/* Telefone */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Telefone / WhatsApp (Opcional)</label>
                                <input
                                    type="text"
                                    value={data.telefone}
                                    onChange={e => setData('telefone', maskTelefone(e.target.value))}
                                    placeholder="(00) 00000-0000"
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0C4773] focus:ring-2 focus:ring-[#0C4773]/20 transition"
                                />
                                {errors.telefone && <p className="text-red-500 text-xs mt-1">{errors.telefone}</p>}
                            </div>

                            {/* Situação / Relato */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Situação / Descrição do Relato <span className="text-red-400">*</span></label>
                                <textarea
                                    value={data.situacao}
                                    onChange={e => setData('situacao', e.target.value)}
                                    rows="5"
                                    placeholder="Descreva detalhadamente o ocorrido ou a sua solicitação..."
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0C4773] focus:ring-2 focus:ring-[#0C4773]/20 transition resize-y"
                                    required
                                />
                                {errors.situacao && <p className="text-red-500 text-xs mt-1">{errors.situacao}</p>}
                            </div>

                            {/* Anexo de Foto */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Anexar Foto (Opcional)</label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-200 border-dashed rounded-2xl hover:border-[#0C4773]/40 hover:bg-[#0C4773]/5 transition duration-150 cursor-pointer relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <div className="space-y-1 text-center pointer-events-none">
                                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        <div className="flex text-sm text-gray-600 justify-center">
                                            <span className="relative rounded-md font-semibold text-[#0C4773] hover:underline focus-within:outline-none">
                                                Escolher arquivo
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-400">PNG, JPG, GIF até 2MB</p>
                                    </div>
                                </div>

                                {fotoError && <p className="text-red-500 text-xs mt-2 font-medium">{fotoError}</p>}
                                {errors.foto && <p className="text-red-500 text-xs mt-2 font-medium">{errors.foto}</p>}

                                {/* Preview da Foto */}
                                {fotoPreview && (
                                    <div className="mt-4 p-3 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between animate-fade-in">
                                        <div className="flex items-center gap-3">
                                            <img src={fotoPreview} alt="Preview" className="w-16 h-16 rounded-xl object-cover border border-gray-200" />
                                            <div>
                                                <span className="text-xs font-semibold text-gray-800">Arquivo anexado</span>
                                                <p className="text-[10px] text-gray-400">Imagem pronta para envio</p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setData('foto', null);
                                                setFotoPreview(null);
                                            }}
                                            className="p-1.5 rounded-lg bg-gray-200/50 hover:bg-red-50 text-gray-500 hover:text-red-600 transition cursor-pointer"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full inline-flex justify-center items-center gap-2 py-3 px-6 text-sm font-semibold rounded-xl text-white bg-[#0C4773] hover:bg-[#007EAE] transition-colors disabled:opacity-50 cursor-pointer shadow-md font-mono mt-4"
                            >
                                {processing ? (
                                    <>
                                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                        </svg>
                                        Enviando...
                                    </>
                                ) : (
                                    'Enviar Relato'
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
