import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';

export default function Login() {
    const {data, setData, post, processing, errors: formErrors} = useForm({
        cpf: '',
        password: ''
    });

    const { errors: pageErrors } = usePage().props;
    const erroMsg = formErrors.cpf || formErrors.password || pageErrors?.cpf || pageErrors?.password;

    const [showPassword, setShowPassword] = useState(false);

    const maskCPF = (value) => {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})/, '$1-$2')
            .replace(/(-\d{2})\d+?$/, '$1');
    };

    return (
        <div className="min-h-screen bg-[#F6F7F9] flex items-center justify-center p-4">
            <Head title="Login - Painel RH" />
            
            <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-gray-100 p-8 sm:p-10 ds-login-card relative overflow-hidden">
                {/* Gradient accent top */}
                <div className="absolute top-0 left-0 right-0 ds-accent-line" />

                <div className="text-center mb-10 pt-2">
                    <img 
                        src="https://1884w9942rbuynxx.public.blob.vercel-storage.com/Novo%20site%20AT%20%26%20Santos/LogoTipo-ATSANTOS.png" 
                        alt="AT & Santos Logo" 
                        className="h-16 mx-auto mb-6 object-contain"
                    />
                    <h1 className="text-xl font-black text-slate-800 tracking-wider font-heading uppercase">Painel RH</h1>
                    <p className="text-slate-400 text-xs mt-1 uppercase tracking-wider">Acesse sua conta para continuar</p>
                </div>
                
                <div>
                    {erroMsg && (
                        <div className="flex items-center gap-2 bg-red-50 text-red-600 rounded-xl px-4 py-3 mb-6 text-sm border border-red-100">
                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                            </svg>
                            <p className="font-medium">{erroMsg}</p>
                        </div>
                    )}
                    <form onSubmit={(e) => { e.preventDefault(); post('/login'); }} className="space-y-5">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
                                CPF
                            </label>
                            <input 
                                type="text" 
                                name="cpf"
                                value={data.cpf}
                                onChange={(e) => setData('cpf', maskCPF(e.target.value))}
                                className={`ds-input ${formErrors.cpf ? 'ds-input-error' : ''}`}
                                placeholder="000.000.000-00"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
                                Senha
                            </label>
                            <div className="relative">
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    name="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className={`ds-input pr-11 ${formErrors.password ? 'ds-input-error' : ''}`}
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.522 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={processing}
                            className="ds-btn ds-btn-primary w-full py-3 text-sm mt-2"
                        >
                            {processing ? (
                                <>
                                    <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                                    </svg>
                                    Entrando...
                                </>
                            ) : (
                                'Entrar no sistema'
                            )}
                        </button>
                    </form>
                </div>
            </div>
            
            <div className="fixed bottom-6 left-0 right-0">
                <p className="text-center text-xs text-gray-400">
                    Painel RH &middot; Gestão de Pessoas
                </p>
            </div>
        </div>
    );
}
