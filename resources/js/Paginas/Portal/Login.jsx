import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';

export default function PortalLogin() {
    const [etapa, setEtapa] = useState('cpf');
    const [cpfInput, setCpfInput] = useState('');
    const [verificandoCpf, setVerificandoCpf] = useState(false);

    // OTP WhatsApp
    const [codigoInput, setCodigoInput] = useState('');
    const [verificandoCodigo, setVerificandoCodigo] = useState(false);
    const [enviandoCodigo, setEnviandoCodigo] = useState(false);
    const [erroCodigo, setErroCodigo] = useState('');
    const [telefoneMascarado, setTelefoneMascarado] = useState('');
    const [candidatoPendente, setCandidatoPendente] = useState(null);

    // Confirmação telefone
    const [modalConfirmacao, setModalConfirmacao] = useState(false);
    const [ultimosDigitos, setUltimosDigitos] = useState('');

    // Verificação alternativa
    const [subetapaAlt, setSubetapaAlt] = useState('opcoes');
    const [nascimentoInput, setNascimentoInput] = useState('');
    const [erroNascimento, setErroNascimento] = useState('');
    const [verificandoNascimento, setVerificandoNascimento] = useState(false);
    const [meioEnvio, setMeioEnvio] = useState('whatsapp'); // 'whatsapp' | 'email'
    const [emailMascarado, setEmailMascarado] = useState('');
    const [enviandoEmail, setEnviandoEmail] = useState(false);

    // Erro geral
    const [erroGeral, setErroGeral] = useState('');

    function salvarTokenCandidato(cpf, token) {
        const expira = Date.now() + 14 * 24 * 60 * 60 * 1000;
        localStorage.setItem(`crh_tok_${cpf.replace(/\D/g, '')}`, JSON.stringify({ token, expira }));
    }

    function lerTokenCandidato(cpf) {
        try {
            const key = `crh_tok_${cpf.replace(/\D/g, '')}`;
            const raw = localStorage.getItem(key);
            if (!raw) return null;
            const { token, expira } = JSON.parse(raw);
            if (Date.now() > expira) { localStorage.removeItem(key); return null; }
            return token;
        } catch { return null; }
    }

    const maskCPF = (value) => {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})/, '$1-$2')
            .replace(/(-\d{2})\d+?$/, '$1');
    };

    async function verificarCpf() {
        if (cpfInput.replace(/\D/g, '').length < 11) return;
        setVerificandoCpf(true);
        setErroGeral('');
        try {
            const tokenSalvo = lerTokenCandidato(cpfInput);
            const res = await axios.post('/portal/verificar-cpf', {
                cpf: cpfInput,
                ...(tokenSalvo ? { token: tokenSalvo } : {}),
            });

            if (res.data.token_valido || res.data.ja_aprovado) {
                // Token válido ou já aprovado — já está autenticado no guard candidato
                router.visit('/portal/dashboard');
                return;
            }

            if (res.data.existe) {
                const c = res.data.candidato;
                setCandidatoPendente(c);
                const mascarado = c.telefone_mascarado || '';
                setUltimosDigitos(mascarado.slice(-3));
                setModalConfirmacao(true);
            } else {
                setErroGeral('CPF não encontrado. Cadastre-se primeiro em uma de nossas vagas.');
            }
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Erro desconhecido.';
            setErroGeral(msg);
        } finally {
            setVerificandoCpf(false);
        }
    }

    async function confirmarEnvioWhatsApp() {
        setModalConfirmacao(false);
        setEnviandoCodigo(true);
        setErroCodigo('');
        try {
            const codRes = await axios.post('/portal/enviar-codigo', {
                cpf: cpfInput,
            });
            setTelefoneMascarado(codRes.data.telefone_mascarado || '');
            setCodigoInput('');
            setMeioEnvio('whatsapp');
            setEtapa('verificacao');
        } catch (err) {
            const msg = err.response?.data?.error || err.message || 'Erro ao enviar código.';
            setErroCodigo(msg);
            setEtapa('verificacao');
        } finally {
            setEnviandoCodigo(false);
        }
    }

    async function confirmarEnvioEmail() {
        setSubetapaAlt('opcoes');
        setEnviandoEmail(true);
        setErroCodigo('');
        setErroGeral('');
        try {
            const res = await axios.post('/portal/enviar-codigo-email', {
                cpf: cpfInput,
            });
            setEmailMascarado(res.data.email_mascarado || '');
            setCodigoInput('');
            setMeioEnvio('email');
            setEtapa('verificacao');
        } catch (err) {
            const msg = err.response?.data?.error || err.message || 'Erro ao enviar código por e-mail.';
            setErroGeral(msg);
        } finally {
            setEnviandoEmail(false);
        }
    }

    async function verificarCodigo() {
        if (codigoInput.replace(/\D/g, '').length < 6) return;
        setVerificandoCodigo(true);
        setErroCodigo('');
        try {
            await axios.post('/portal/verificar-codigo', {
                cpf: cpfInput,
                codigo: codigoInput,
            });
            // Salva token para não exigir 2FA por 14 dias
            try { const t = await axios.post('/portal/token'); salvarTokenCandidato(cpfInput, t.data.token); } catch { /* não bloqueia */ }
            router.visit('/portal/dashboard');
        } catch (err) {
            setErroCodigo(err.response?.data?.error || 'Código inválido. Tente novamente.');
        } finally {
            setVerificandoCodigo(false);
        }
    }

    async function reenviarCodigo() {
        setEnviandoCodigo(true);
        setErroCodigo('');
        setCodigoInput('');
        try {
            if (meioEnvio === 'email') {
                const res = await axios.post('/portal/enviar-codigo-email', {
                    cpf: cpfInput,
                });
                setEmailMascarado(res.data.email_mascarado || '');
            } else {
                const res = await axios.post('/portal/enviar-codigo', {
                    cpf: cpfInput,
                });
                setTelefoneMascarado(res.data.telefone_mascarado || '');
            }
        } catch (err) {
            setErroCodigo(err.response?.data?.error || 'Erro ao reenviar código. Tente novamente.');
        } finally {
            setEnviandoCodigo(false);
        }
    }

    function semAcessoAoNumero() {
        setModalConfirmacao(false);
        setSubetapaAlt('opcoes');
        setNascimentoInput('');
        setErroNascimento('');
        setEtapa('verificacao_alternativa');
    }

    async function verificarNascimento() {
        if (!nascimentoInput) return;
        setVerificandoNascimento(true);
        setErroNascimento('');
        try {
            await axios.post('/portal/verificar-nascimento', {
                cpf: cpfInput,
                data_nascimento: nascimentoInput,
            });
            // verificar-nascimento faz login no guard candidato
            try { const t = await axios.post('/portal/token'); salvarTokenCandidato(cpfInput, t.data.token); } catch { /* não bloqueia */ }
            router.visit('/portal/dashboard');
        } catch (err) {
            setErroNascimento(err.response?.data?.error || 'Dados incorretos. Tente novamente.');
        } finally {
            setVerificandoNascimento(false);
        }
    }

    const inputClasses = "mt-1 block w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-gray-900 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-sm";
    const labelClasses = "block text-sm font-semibold text-gray-700 mb-1";

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#071F30] via-[#0C4773] to-[#0A3A5E] flex items-center justify-center px-4 font-sans">
            <Head title="Portal do Candidato — Login" />

            <div className="w-full max-w-md">
                {/* Logo / Branding */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-extrabold text-white tracking-tight">Portal do Candidato</h1>
                    <p className="text-blue-200/60 text-sm mt-1">Acompanhe suas candidaturas e entrevistas</p>
                </div>

                {/* Card principal */}
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">

                    {/* Etapa CPF */}
                    {etapa === 'cpf' && (
                        <div className="p-8">
                            <div className="text-center mb-6">
                                <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <svg className="w-7 h-7 text-[#0C4773]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                    </svg>
                                </div>
                                <h2 className="text-lg font-bold text-gray-900">Acesse seu portal</h2>
                                <p className="text-sm text-gray-500 mt-1">Informe seu CPF para continuar</p>
                            </div>

                            <div>
                                <label className={labelClasses}>CPF</label>
                                <input
                                    value={cpfInput}
                                    onChange={e => setCpfInput(maskCPF(e.target.value))}
                                    className={inputClasses}
                                    placeholder="000.000.000-00"
                                    onKeyDown={e => e.key === 'Enter' && verificarCpf()}
                                    autoFocus
                                />
                            </div>

                            {erroGeral && (
                                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-center gap-2">
                                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {erroGeral}
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={verificarCpf}
                                disabled={verificandoCpf || cpfInput.replace(/\D/g, '').length < 11}
                                className="mt-6 w-full inline-flex justify-center items-center gap-2 py-3 px-6 text-sm font-bold rounded-xl text-white bg-[#0C4773] hover:bg-[#007EAE] focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
                            >
                                {verificandoCpf ? (
                                    <>
                                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Verificando...
                                    </>
                                ) : 'Entrar'}
                            </button>

                            <p className="text-center mt-5">
                                <a href="/candidatura" className="text-xs text-gray-400 hover:text-[#0C4773] transition-colors">
                                    Ainda não tem cadastro? Candidate-se a uma vaga →
                                </a>
                            </p>
                        </div>
                    )}

                    {etapa === 'verificacao' && (
                        <div className="p-8">
                            <div className="text-center mb-6">
                                <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 ${meioEnvio === 'email' ? 'bg-blue-50' : 'bg-green-50'}`}>
                                    {meioEnvio === 'email' ? (
                                        <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    ) : (
                                        <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                        </svg>
                                    )}
                                </div>
                                <h2 className="text-lg font-bold text-gray-900">
                                    {meioEnvio === 'email' ? 'Verificação por E-mail' : 'Verificação por WhatsApp'}
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    {meioEnvio === 'email' ? (
                                        <>Enviamos um código de 6 dígitos para <span className="font-semibold text-gray-700">{emailMascarado}</span>.</>
                                    ) : (
                                        <>Enviamos um código de 6 dígitos para <span className="font-semibold text-gray-700">{telefoneMascarado}</span>.</>
                                    )}
                                    <br />Expira em <span className="font-semibold">15 minutos</span>.
                                </p>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Código de verificação</label>
                                <input
                                    value={codigoInput}
                                    onChange={e => {
                                        const v = e.target.value.replace(/\D/g, '').slice(0, 6);
                                        setCodigoInput(v);
                                        setErroCodigo('');
                                    }}
                                    className="w-full text-center text-2xl font-bold tracking-widest border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#0C4773] transition-colors"
                                    placeholder="000000"
                                    maxLength={6}
                                    onKeyDown={e => e.key === 'Enter' && verificarCodigo()}
                                    autoFocus
                                />
                                {erroCodigo && <p className="text-red-500 text-sm text-center mt-2 font-medium">{erroCodigo}</p>}
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={reenviarCodigo}
                                    disabled={enviandoCodigo}
                                    className="flex-1 text-sm font-medium text-gray-500 hover:text-gray-700 py-2.5 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-50"
                                >
                                    {enviandoCodigo ? 'Reenviando...' : 'Reenviar'}
                                </button>
                                <button
                                    type="button"
                                    onClick={verificarCodigo}
                                    disabled={verificandoCodigo || codigoInput.length < 6}
                                    className="flex-1 py-2.5 text-sm font-bold rounded-xl text-white bg-[#0C4773] hover:bg-[#007EAE] transition-all disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    {verificandoCodigo ? 'Verificando...' : 'Confirmar'}
                                </button>
                            </div>

                            <p className="text-center mt-4">
                                <button type="button" onClick={() => { setEtapa('cpf'); setCandidatoPendente(null); }} className="text-xs text-gray-400 hover:text-gray-600 underline cursor-pointer">
                                    Voltar e corrigir o CPF
                                </button>
                            </p>
                        </div>
                    )}

                    {/* Verificação Alternativa */}
                    {etapa === 'verificacao_alternativa' && (
                        <div className="p-8">
                            {subetapaAlt === 'opcoes' && (
                                <div className="text-center">
                                    <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <svg className="w-7 h-7 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                    <h2 className="text-lg font-bold text-gray-900 mb-1">Verificação alternativa</h2>
                                    <p className="text-sm text-gray-500 mb-6">Escolha uma forma de confirmar sua identidade.</p>

                                    <button
                                        type="button"
                                        onClick={() => setSubetapaAlt('nascimento')}
                                        className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-[#0C4773] hover:bg-blue-50/40 transition-all cursor-pointer text-left"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                            <svg className="w-5 h-5 text-[#0C4773]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800">Data de nascimento</p>
                                            <p className="text-xs text-gray-500">Confirme a data cadastrada anteriormente</p>
                                        </div>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={confirmarEnvioEmail}
                                        disabled={enviandoEmail}
                                        className="mt-3 w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-[#0C4773] hover:bg-blue-50/40 transition-all cursor-pointer text-left disabled:opacity-50"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                                            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800">
                                                {enviandoEmail ? 'Enviando...' : 'Código por e-mail'}
                                            </p>
                                            <p className="text-xs text-gray-500">Receba um código de acesso no e-mail cadastrado</p>
                                        </div>
                                    </button>

                                    <p className="mt-5">
                                        <button type="button" onClick={() => setEtapa('cpf')} className="text-xs text-gray-400 hover:text-gray-600 underline cursor-pointer">
                                            Voltar
                                        </button>
                                    </p>
                                </div>
                            )}

                            {subetapaAlt === 'nascimento' && (
                                <>
                                    <div className="text-center mb-6">
                                        <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <svg className="w-7 h-7 text-[#0C4773]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <h2 className="text-lg font-bold text-gray-900 mb-1">Confirme sua data de nascimento</h2>
                                        <p className="text-sm text-gray-500">Informe a data cadastrada anteriormente.</p>
                                    </div>
                                    <div>
                                        <label className={labelClasses}>Data de Nascimento</label>
                                        <input
                                            type="date"
                                            value={nascimentoInput}
                                            onChange={e => { setNascimentoInput(e.target.value); setErroNascimento(''); }}
                                            className={inputClasses}
                                            max={new Date().toISOString().split('T')[0]}
                                        />
                                        {erroNascimento && <p className="text-red-500 text-sm text-center mt-2 font-medium">{erroNascimento}</p>}
                                    </div>
                                    <div className="flex gap-3 mt-6">
                                        <button
                                            type="button"
                                            onClick={() => setSubetapaAlt('opcoes')}
                                            className="flex-1 text-sm font-medium text-gray-500 hover:text-gray-700 py-2.5 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                                        >
                                            Voltar
                                        </button>
                                        <button
                                            type="button"
                                            onClick={verificarNascimento}
                                            disabled={!nascimentoInput || verificandoNascimento}
                                            className="flex-1 py-2.5 text-sm font-bold rounded-xl text-white bg-[#0C4773] hover:bg-[#007EAE] transition-all disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
                                        >
                                            {verificandoNascimento ? 'Verificando...' : 'Confirmar'}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Link para vagas */}
                <p className="text-center mt-6 text-blue-200/40 text-xs">
                    © {new Date().getFullYear()} AT & Santos — Todos os direitos reservados
                </p>
            </div>

            {/* Modal confirmação WhatsApp */}
            {modalConfirmacao && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setModalConfirmacao(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="p-6">
                            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-green-50 mx-auto mb-4">
                                <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                            </div>

                            <h3 className="text-base font-bold text-gray-900 text-center mb-1">Enviar código de verificação?</h3>
                            <p className="text-sm text-gray-500 text-center mb-6">
                                Encontramos seu cadastro com o número final{' '}
                                <span className="font-bold text-gray-800">***{ultimosDigitos}</span>.
                                <br />Deseja receber um código por WhatsApp?
                            </p>

                            <div className="flex gap-3 mb-4">
                                <button
                                    type="button"
                                    onClick={() => setModalConfirmacao(false)}
                                    className="flex-1 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                                >
                                    Não
                                </button>
                                <button
                                    type="button"
                                    onClick={confirmarEnvioWhatsApp}
                                    className="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-sm font-bold text-white transition-colors cursor-pointer"
                                >
                                    Sim, enviar
                                </button>
                            </div>

                            <button
                                type="button"
                                onClick={semAcessoAoNumero}
                                className="w-full text-xs text-gray-400 hover:text-gray-600 py-2 underline underline-offset-2 transition-colors cursor-pointer"
                            >
                                Não tenho mais acesso a este número
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
