import React, { useEffect, useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import axios from 'axios';

export default function Candidatura({ vagas, candidato_id }) {
    const [etapa, setEtapa] = useState('vagas');
    const [vagaSelecionada, setVagaSelecionada] = useState(null);
    const [buscandoCep, setBuscandoCep] = useState(false);
    const [cpfInput, setCpfInput] = useState('');
    const [verificandoCpf, setVerificandoCpf] = useState(false);
    const [candidatoExistente, setCandidatoExistente] = useState(null);
    const [perguntas, setPerguntas] = useState([]);
    const [respostas, setRespostas] = useState({});
    const [carregandoPerguntas, setCarregandoPerguntas] = useState(false);
    const [dataEntrevista, setDataEntrevista] = useState('');
    const [slotSelecionado, setSlotSelecionado] = useState('');
    const [slots, setSlots] = useState([]);
    const [carregandoSlots, setCarregandoSlots] = useState(false);
    const [erroData, setErroData] = useState('');
    const [tipoEntrevista, setTipoEntrevista] = useState('Presencial');
    const [agendando, setAgendando] = useState(false);

    // Verificação WhatsApp
    const [codigoInput, setCodigoInput] = useState('');
    const [verificandoCodigo, setVerificandoCodigo] = useState(false);
    const [enviandoCodigo, setEnviandoCodigo] = useState(false);
    const [erroCodigo, setErroCodigo] = useState('');
    const [telefoneMascarado, setTelefoneMascarado] = useState('');
    const [candidatoPendente, setCandidatoPendente] = useState(null);

    // Modal confirmação de envio de código
    const [modalConfirmacaoTelefone, setModalConfirmacaoTelefone] = useState(false);
    const [ultimosDigitosTelefone, setUltimosDigitosTelefone] = useState('');

    // Verificação alternativa (data de nascimento / e-mail)
    const [subetapaAlt, setSubetapaAlt] = useState('opcoes');
    const [nascimentoInput, setNascimentoInput] = useState('');
    const [erroNascimento, setErroNascimento] = useState('');
    const [verificandoNascimento, setVerificandoNascimento] = useState(false);
    const [meioEnvio, setMeioEnvio] = useState('whatsapp'); // 'whatsapp' | 'email'
    const [emailMascarado, setEmailMascarado] = useState('');
    const [enviandoEmail, setEnviandoEmail] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        nome: '',
        cpf: '',
        nivel_escolaridade: '',
        email: '',
        telefone: '',
        path_curriculo: null,
        cep: '',
        logradouro: '',
        regiao: '',
        data_nascimento: '',
        vaga_id: '',
    });

    function fecharModal() {
        setEtapa('vagas');
        setVagaSelecionada(null);
        setCpfInput('');
        setCandidatoExistente(null);
        setCandidatoPendente(null);
        setCodigoInput('');
        setErroCodigo('');
        setTelefoneMascarado('');
        setModalConfirmacaoTelefone(false);
        setUltimosDigitosTelefone('');
        setSubetapaAlt('opcoes');
        setNascimentoInput('');
        setErroNascimento('');
        setMeioEnvio('whatsapp');
        setEmailMascarado('');
        setEnviandoEmail(false);
        setPerguntas([]);
        setRespostas({});
        reset();
    }

    function iniciarCandidatura(vaga) {
        setVagaSelecionada(vaga);
        setData(prev => ({ ...prev, vaga_id: vaga.id }));
        setEtapa('cpf');
    }

    function salvarTokenCandidato(cpf, token) {
        const expira = Date.now() + 7 * 24 * 60 * 60 * 1000;
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

    async function verificarCpf() {
        if (cpfInput.replace(/\D/g, '').length < 11) return;
        setVerificandoCpf(true);
        try {
            const tokenSalvo = lerTokenCandidato(cpfInput);
            const res = await axios.post('/candidatura/verificar-cpf', {
                cpf: cpfInput,
                vaga_id: vagaSelecionada?.id,
                ...(tokenSalvo ? { token: tokenSalvo } : {}),
            });
            
            if (res.data.bloqueado) {
                alert(res.data.mensagem);
                setVerificandoCpf(false);
                return;
            }

            if (res.data.reprovado) {
                alert(res.data.mensagem);
                setVerificandoCpf(false);
                return;
            }

            if (res.data.ja_agendado) {
                alert('Você já possui uma entrevista agendada para esta vaga.');
                setVerificandoCpf(false);
                return;
            }

            if (res.data.ja_aprovado) {
                // Aprovado no quiz, mas ainda não agendou — pula direto para agendamento
                const c = res.data.candidato;
                setCandidatoExistente(c);
                setData(prev => ({ ...prev, cpf: c.cpf || cpfInput }));
                setEtapa('entrevista');
                setVerificandoCpf(false);
                return;
            }

            if (res.data.token_valido) {
                if (res.data.ja_agendado) {
                    alert('Você já possui uma entrevista agendada para esta vaga.');
                    setVerificandoCpf(false);
                    return;
                }

                // Token de 7 dias válido — pula WhatsApp, preenche formulário diretamente
                const c = res.data.candidato;
                setCandidatoExistente(c);
                setData(prev => ({
                    ...prev,
                    cpf: c.cpf || cpfInput,
                    nome: c.nome || '',
                    email: c.email || '',
                    telefone: c.telefone || '',
                    nivel_escolaridade: c.nivel_escolaridade || '',
                    cep: c.cep || '',
                    logradouro: c.logradouro || '',
                    regiao: c.regiao || '',
                    data_nascimento: c.data_nascimento ? c.data_nascimento.split('T')[0] : '',
                }));
                setVerificandoCpf(false);
                if (res.data.ja_aprovado) {
                    setEtapa('entrevista');
                } else {
                    setEtapa('formulario');
                }
                return;
            }

            if (res.data.existe) {
                // Candidato existente — exibe modal perguntando se quer receber o código
                const c = res.data.candidato;
                setCandidatoPendente(c);
                const digits = (c.telefone || '').replace(/\D/g, '');
                setUltimosDigitosTelefone(digits.slice(-3));
                setModalConfirmacaoTelefone(true);
            } else {
                setCandidatoExistente(null);
                setData(prev => ({ ...prev, cpf: cpfInput }));
                setEtapa('formulario');
            }
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Erro desconhecido.';
            alert('Erro ao verificar CPF: ' + msg);
        } finally {
            setVerificandoCpf(false);
        }
    }

    async function verificarCodigo() {
        if (codigoInput.replace(/\D/g, '').length < 6) return;
        setVerificandoCodigo(true);
        setErroCodigo('');
        try {
            const res = await axios.post('/candidatura/verificar-codigo', {
                cpf: cpfInput,
                codigo: codigoInput,
                vaga_id: vagaSelecionada?.id,
            });

            if (res.data.ja_agendado) {
                alert('Você já possui uma entrevista agendada para esta vaga.');
                fecharModal();
                return;
            }

            // Código válido — preenche o formulário com dados do candidato
            const c = res.data.candidato || candidatoPendente;
            setCandidatoExistente(c);
            setData(prev => ({
                ...prev,
                cpf: c.cpf || cpfInput,
                nome: c.nome || '',
                email: c.email || '',
                telefone: c.telefone || '',
                nivel_escolaridade: c.nivel_escolaridade || '',
                cep: c.cep || '',
                logradouro: c.logradouro || '',
                regiao: c.regiao || '',
                data_nascimento: c.data_nascimento ? c.data_nascimento.split('T')[0] : '',
            }));
            setCandidatoPendente(null);
            // Salva token para não exigir 2FA por 7 dias
            try { const t = await axios.post('/candidatura/token'); salvarTokenCandidato(cpfInput, t.data.token); } catch { /* não bloqueia */ }
            
            if (res.data.ja_aprovado) {
                setEtapa('entrevista');
            } else {
                setEtapa('formulario');
            }
        } catch (err) {
            setErroCodigo(err.response?.data?.error || 'Código inválido. Tente novamente.');
        } finally {
            setVerificandoCodigo(false);
        }
    }

    async function confirmarEnvioWhatsApp() {
        setModalConfirmacaoTelefone(false);
        setEnviandoCodigo(true);
        try {
            const codRes = await axios.post('/candidatura/enviar-codigo', {
                cpf: cpfInput,
                vaga_id: vagaSelecionada?.id,
            });
            setTelefoneMascarado(codRes.data.telefone_mascarado || '');
            setCodigoInput('');
            setErroCodigo('');
            setMeioEnvio('whatsapp');
            setEtapa('verificacao');
        } catch (errCod) {
            const msg = errCod.response?.data?.error || errCod.message || 'Erro ao enviar código.';
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
        try {
            const res = await axios.post('/candidatura/enviar-codigo-email', {
                cpf: cpfInput,
            });
            setEmailMascarado(res.data.email_mascarado || '');
            setCodigoInput('');
            setMeioEnvio('email');
            setEtapa('verificacao');
        } catch (err) {
            const msg = err.response?.data?.error || err.message || 'Erro ao enviar código por e-mail.';
            alert('Erro: ' + msg);
        } finally {
            setEnviandoEmail(false);
        }
    }

    function recusarEnvioWhatsApp() {
        setModalConfirmacaoTelefone(false);
        setCandidatoPendente(null);
        setUltimosDigitosTelefone('');
    }

    function semAcessoAoNumero() {
        setModalConfirmacaoTelefone(false);
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
            const res = await axios.post('/candidatura/verificar-nascimento', {
                cpf: cpfInput,
                data_nascimento: nascimentoInput,
                vaga_id: vagaSelecionada?.id,
            });

            if (res.data.ja_agendado) {
                alert('Você já possui uma entrevista agendada para esta vaga.');
                fecharModal();
                return;
            }

            const c = res.data.candidato;
            setCandidatoExistente(c);
            setData(prev => ({
                ...prev,
                cpf: c.cpf || cpfInput,
                nome: c.nome || '',
                email: c.email || '',
                telefone: c.telefone || '',
                nivel_escolaridade: c.nivel_escolaridade || '',
                cep: c.cep || '',
                logradouro: c.logradouro || '',
                regiao: c.regiao || '',
                data_nascimento: c.data_nascimento ? c.data_nascimento.split('T')[0] : '',
            }));
            setCandidatoPendente(null);
            try { const t = await axios.post('/candidatura/token'); salvarTokenCandidato(cpfInput, t.data.token); } catch { /* não bloqueia */ }
            
            if (res.data.ja_aprovado) {
                setEtapa('entrevista');
            } else {
                setEtapa('formulario');
            }
        } catch (err) {
            setErroNascimento(err.response?.data?.error || 'Dados incorretos. Tente novamente.');
        } finally {
            setVerificandoNascimento(false);
        }
    }

    async function reenviarCodigo() {
        setEnviandoCodigo(true);
        setErroCodigo('');
        setCodigoInput('');
        try {
            if (meioEnvio === 'email') {
                const res = await axios.post('/candidatura/enviar-codigo-email', {
                    cpf: cpfInput,
                });
                setEmailMascarado(res.data.email_mascarado || '');
            } else {
                const res = await axios.post('/candidatura/enviar-codigo', {
                    cpf: cpfInput,
                    vaga_id: vagaSelecionada?.id,
                });
                setTelefoneMascarado(res.data.telefone_mascarado || '');
            }
        } catch (err) {
            setErroCodigo(err.response?.data?.error || 'Erro ao reenviar código. Tente novamente.');
        } finally {
            setEnviandoCodigo(false);
        }
    }

    async function carregarPerguntas() {
        if (!vagaSelecionada) return;
        setCarregandoPerguntas(true);
        try {
            const res = await axios.get(`/candidatura/perguntas/${vagaSelecionada.id}`);
            if (res.data.formulario && res.data.formulario.perguntas) {
                setPerguntas(res.data.formulario.perguntas);
            } else {
                setPerguntas([]);
            }
        } catch {
            setPerguntas([]);
        } finally {
            setCarregandoPerguntas(false);
        }
    }

    function submitFormulario(e) {
        e.preventDefault();
        post('/candidatura', {
            preserveState: true,
            preserveScroll: true,
            onSuccess: async () => {
                // Salva token para não exigir 2FA por 7 dias
                try { const t = await axios.post('/candidatura/token'); salvarTokenCandidato(cpfInput, t.data.token); } catch { /* não bloqueia */ }
                await carregarPerguntas();
                setEtapa('questionario');
            },
            onError: (errors) => {
                console.error("Erros de validação:", errors);
            }
        });
    }

    async function finalizarQuestionario(e) {
        e.preventDefault();
        
        try {
            const response = await axios.post('/candidatura/salvar-respostas', {
                cpf: data.cpf,
                vaga_id: vagaSelecionada.id,
                respostas: respostas
            });
            
            const { aprovado } = response.data;
            if (aprovado) {
                setEtapa('entrevista');
            } else {
                setEtapa('concluido');
            }
        } catch (error) {
            console.error('Erro ao salvar respostas:', error);
            alert('Não foi possível salvar suas respostas. Tente novamente.');
        }
    }

    async function handleAgendarEntrevista(e) {
        e.preventDefault();
        if (!dataEntrevista || !slotSelecionado) return alert('Selecione data e horário.');
        setAgendando(true);
        try {
            const dataHora = `${dataEntrevista}T${slotSelecionado}:00`;
            await axios.post('/candidatura/agendar-entrevista', {
                vaga_id: vagaSelecionada.id,
                data_hora: dataHora,
                tipo: tipoEntrevista,
            });
            setEtapa('concluido');
        } catch (error) {
            alert('Não foi possível agendar: ' + (error.response?.data?.message || error.response?.data?.error || error.message));
        } finally {
            setAgendando(false);
        }
    }

    async function buscarSlots(data) {
        if (!data) return;
        setCarregandoSlots(true);
        setSlots([]);
        setSlotSelecionado('');
        try {
            const res = await axios.get('/candidatura/slots-disponiveis', { params: { data } });
            setSlots(res.data.slots || []);
        } catch {
            setSlots([]);
        } finally {
            setCarregandoSlots(false);
        }
    }

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

    const inputClasses = "mt-1 block w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-gray-900 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-sm";
    const labelClasses = "block text-sm font-semibold text-gray-700 mb-1";

    const modalAberto = etapa !== 'vagas';

    return (
        <div className="min-h-screen bg-gray-100 font-sans">
            <Head title="Vagas Disponíveis" />

            <main className="w-full py-12 px-4">
                <div className="max-w-6xl mx-auto">

                    <div className="mb-10 text-center">
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Vagas Disponíveis</h1>
                        <p className="text-gray-600 mt-2 text-lg">Confira nossas oportunidades abertas e candidate-se.</p>
                    </div>

                    {vagas.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                            <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <p className="text-lg font-medium">Nenhuma vaga disponível no momento</p>
                            <p className="text-sm mt-1">Volte em breve para conferir novas oportunidades!</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {vagas.map((vaga) => (
                            <div key={vaga.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 flex flex-col">
                                <div className="px-6 pt-6 pb-4 border-b border-gray-100">
                                    <div className="flex items-start justify-between gap-3">
                                        <h2 className="text-lg font-bold text-gray-800">{vaga.titulo}</h2>
                                        <div className="flex gap-1.5">
                                            {vaga.pcd === 1 && (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">PCD</span>
                                            )}
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">Aberta</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="px-6 py-4 space-y-3 flex-1">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        {vaga.local}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {vaga.horario} &middot; {vaga.escala}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {vaga.salario}
                                    </div>

                                    {vaga.descricao && (
                                        <p className="text-sm text-gray-500 line-clamp-3 mt-2">{vaga.descricao}</p>
                                    )}

                                    {(vaga.va || vaga.vr || vaga.vt) && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {vaga.va && <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-md font-medium">VA: {vaga.va}</span>}
                                            {vaga.vr && <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-md font-medium">VR: {vaga.vr}</span>}
                                            {vaga.vt && <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-md font-medium">VT: {vaga.vt}</span>}
                                        </div>
                                    )}
                                </div>

                                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                                    <button
                                        onClick={() => iniciarCandidatura(vaga)}
                                        className="w-full inline-flex justify-center items-center gap-2 py-2.5 px-4 text-sm font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all cursor-pointer"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Candidatar-se
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {modalAberto && vagaSelecionada && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={fecharModal}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>

                        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-gray-100">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">
                                    {etapa === 'cpf' && 'Identificação'}
                                    {etapa === 'verificacao' && 'Verificação por WhatsApp'}
                                    {etapa === 'verificacao_alternativa' && 'Verificação de Identidade'}
                                    {etapa === 'formulario' && 'Cadastro de Candidato'}
                                    {etapa === 'questionario' && 'Questionário da Vaga'}
                                    {etapa === 'entrevista' && 'Agendar Entrevista'}
                                    {etapa === 'concluido' && 'Candidatura Enviada'}
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">Vaga: <span className="font-semibold text-gray-700">{vagaSelecionada.titulo}</span></p>
                            </div>
                            <button onClick={fecharModal} className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="px-6 pt-4 pb-2">
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                <span className={`px-2.5 py-1 rounded-full font-semibold ${etapa === 'cpf' || etapa === 'verificacao' || etapa === 'verificacao_alternativa' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>1. CPF</span>
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
                                <span className={`px-2.5 py-1 rounded-full font-semibold ${etapa === 'formulario' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>2. Cadastro</span>
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
                                <span className={`px-2.5 py-1 rounded-full font-semibold ${etapa === 'questionario' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>3. Questionário</span>
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
                                <span className={`px-2.5 py-1 rounded-full font-semibold ${etapa === 'entrevista' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>4. Entrevista</span>
                            </div>
                        </div>

                        {etapa === 'cpf' && (
                            <div className="p-6">
                                <div className="text-center mb-6">
                                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-600 text-sm">Já se candidatou anteriormente? Informe seu CPF para verificar.</p>
                                </div>
                                <div className="max-w-sm mx-auto">
                                    <label className={labelClasses}>CPF</label>
                                    <input
                                        value={cpfInput}
                                        onChange={e => setCpfInput(maskCPF(e.target.value))}
                                        className={inputClasses}
                                        placeholder="000.000.000-00"
                                        onKeyDown={e => e.key === 'Enter' && verificarCpf()}
                                    />
                                </div>
                                <div className="flex justify-center gap-3 mt-6">
                                    <button type="button" onClick={fecharModal} className="text-sm font-medium text-gray-600 hover:text-gray-800 px-5 py-2.5 rounded-xl hover:bg-gray-200 transition-colors cursor-pointer">
                                        Cancelar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={verificarCpf}
                                        disabled={verificandoCpf || cpfInput.replace(/\D/g, '').length < 11}
                                        className="inline-flex justify-center items-center gap-2 py-2.5 px-8 shadow-sm text-sm font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
                                    >
                                        {verificandoCpf ? 'Verificando...' : 'Continuar'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {etapa === 'verificacao' && (
                            <div className="p-6">
                                <div className="text-center mb-6">
                                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${meioEnvio === 'email' ? 'bg-blue-50' : 'bg-green-50'}`}>
                                        {meioEnvio === 'email' ? (
                                            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                        ) : (
                                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                            </svg>
                                        )}
                                    </div>
                                    <h3 className="text-base font-bold text-gray-900 mb-1">
                                        {meioEnvio === 'email' ? 'Verificação por E-mail' : 'Verificação por WhatsApp'}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        {meioEnvio === 'email' ? (
                                            <>Enviamos um código de 6 dígitos para o e-mail <span className="font-semibold text-gray-700">{emailMascarado}</span>.</>
                                        ) : (
                                            <>Enviamos um código de 6 dígitos para o número{' '}{telefoneMascarado && (<span className="font-semibold text-gray-700">{telefoneMascarado}</span>)}.</>
                                        )}
                                        <br />O código expira em <span className="font-semibold">15 minutos</span>.
                                    </p>
                                </div>

                                <div className="max-w-xs mx-auto">
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                        Código de verificação
                                    </label>
                                    <input
                                        value={codigoInput}
                                        onChange={e => {
                                            const v = e.target.value.replace(/\D/g, '').slice(0, 6);
                                            setCodigoInput(v);
                                            setErroCodigo('');
                                        }}
                                        className="w-full text-center text-2xl font-bold tracking-widest border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors"
                                        placeholder="000000"
                                        maxLength={6}
                                        onKeyDown={e => e.key === 'Enter' && verificarCodigo()}
                                        autoFocus
                                    />
                                    {erroCodigo && (
                                        <p className="text-red-500 text-sm text-center mt-2 font-medium">{erroCodigo}</p>
                                    )}
                                </div>

                                <div className="flex justify-center gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={reenviarCodigo}
                                        disabled={enviandoCodigo}
                                        className="text-sm font-medium text-gray-500 hover:text-gray-700 px-4 py-2.5 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-50"
                                    >
                                        {enviandoCodigo ? 'Reenviando...' : 'Reenviar código'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={verificarCodigo}
                                        disabled={verificandoCodigo || codigoInput.length < 6}
                                        className="inline-flex justify-center items-center gap-2 py-2.5 px-8 shadow-sm text-sm font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
                                    >
                                        {verificandoCodigo ? 'Verificando...' : 'Confirmar'}
                                    </button>
                                </div>

                                <p className="text-center mt-4">
                                    <button
                                        type="button"
                                        onClick={() => { setEtapa('cpf'); setCandidatoPendente(null); }}
                                        className="text-xs text-gray-400 hover:text-gray-600 underline cursor-pointer"
                                    >
                                        Voltar e corrigir o CPF
                                    </button>
                                </p>
                            </div>
                        )}

                        {etapa === 'verificacao_alternativa' && (
                            <div className="p-6">
                                {subetapaAlt === 'opcoes' && (
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-base font-bold text-gray-900 mb-2">Como deseja confirmar sua identidade?</h3>
                                        <p className="text-sm text-gray-500 mb-8">Escolha uma opção para verificar que você é o titular deste CPF.</p>
                                        <div className="max-w-sm mx-auto flex flex-col gap-3 text-left">
                                            <button
                                                type="button"
                                                onClick={() => setSubetapaAlt('nascimento')}
                                                className="flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50/40 transition-all cursor-pointer"
                                            >
                                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                                className="flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50/40 transition-all cursor-pointer disabled:opacity-50 text-left w-full"
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
                                                    <p className="text-xs text-gray-500">Receba um código no seu e-mail cadastrado</p>
                                                </div>
                                            </button>
                                        </div>
                                        <p className="text-center mt-6">
                                            <button
                                                type="button"
                                                onClick={() => setEtapa('cpf')}
                                                className="text-xs text-gray-400 hover:text-gray-600 underline cursor-pointer"
                                            >
                                                Voltar
                                            </button>
                                        </p>
                                    </div>
                                )}

                                {subetapaAlt === 'nascimento' && (
                                    <>
                                        <div className="text-center mb-6">
                                            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <h3 className="text-base font-bold text-gray-900 mb-1">Confirme sua data de nascimento</h3>
                                            <p className="text-sm text-gray-500">Informe a data de nascimento cadastrada anteriormente.</p>
                                        </div>
                                        <div className="max-w-xs mx-auto">
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
                                        <div className="flex justify-center gap-3 mt-6">
                                            <button
                                                type="button"
                                                onClick={() => setSubetapaAlt('opcoes')}
                                                className="text-sm font-medium text-gray-500 hover:text-gray-700 px-4 py-2.5 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                                            >
                                                Voltar
                                            </button>
                                            <button
                                                type="button"
                                                onClick={verificarNascimento}
                                                disabled={!nascimentoInput || verificandoNascimento}
                                                className="inline-flex justify-center items-center gap-2 py-2.5 px-8 shadow-sm text-sm font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
                                            >
                                                {verificandoNascimento ? 'Verificando...' : 'Confirmar'}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {etapa === 'formulario' && (
                            <form onSubmit={submitFormulario} encType="multipart/form-data">
                                <div className="p-6 border-b border-gray-100">
                                    <h3 className="text-base font-bold text-blue-900 mb-4 flex items-center gap-2">
                                        <span className="w-2 h-5 bg-blue-600 rounded-full"></span>
                                        Dados Pessoais e Contato
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                                        <div className="md:col-span-6">
                                            <label className={labelClasses}>Nome Completo</label>
                                            <input value={data.nome} onChange={e => setData('nome', e.target.value)} className={inputClasses} placeholder="Seu nome completo" />
                                            {errors.nome && <p className="text-red-500 text-xs mt-1">{errors.nome}</p>}
                                        </div>
                                        <div className="md:col-span-3">
                                            <label className={labelClasses}>CPF</label>
                                            <input value={data.cpf} readOnly className={`${inputClasses} bg-gray-200 cursor-not-allowed`} />
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

                                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                                    <h3 className="text-base font-bold text-blue-900 mb-4 flex items-center gap-2">
                                        <span className="w-2 h-5 bg-blue-600 rounded-full"></span>
                                        Localização
                                    </h3>
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

                                <div className="p-6 border-b border-gray-100">
                                    <h3 className="text-base font-bold text-blue-900 mb-4 flex items-center gap-2">
                                        <span className="w-2 h-5 bg-blue-600 rounded-full"></span>
                                        Currículo
                                    </h3>
                                    <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-400 transition-colors bg-white">
                                        <div className="space-y-1 text-center">
                                            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            <div className="flex text-sm text-gray-600 justify-center">
                                                <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                                                    <span>Clique para enviar</span>
                                                    <input type="file" accept=".pdf,.doc,.docx" className="sr-only" onChange={e => setData('path_curriculo', e.target.files[0])} />
                                                </label>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-2">
                                                {data.path_curriculo ? (
                                                    <span className="text-green-600 font-semibold text-sm">&#10003; {data.path_curriculo.name}</span>
                                                ) : 'PDF, DOC ou DOCX até 10MB'}
                                            </p>
                                        </div>
                                    </div>
                                    {errors.path_curriculo && <p className="text-red-500 text-xs mt-1">{errors.path_curriculo}</p>}
                                </div>

                                <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-100 rounded-b-2xl">
                                    <button type="button" onClick={fecharModal} className="text-sm font-medium text-gray-600 hover:text-gray-800 px-5 py-2.5 rounded-xl hover:bg-gray-200 transition-colors cursor-pointer">
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="inline-flex justify-center py-2.5 px-8 shadow-sm text-sm font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
                                    >
                                        {processing ? 'Salvando...' : 'Salvar e Continuar'}
                                    </button>
                                </div>
                            </form>
                        )}

                        {etapa === 'questionario' && (
                            <form onSubmit={finalizarQuestionario}>
                                <div className="p-6">
                                    {carregandoPerguntas ? (
                                        <div className="text-center py-12 text-gray-400">
                                            <svg className="animate-spin h-8 w-8 mx-auto mb-3 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                            </svg>
                                            <p>Carregando questionário...</p>
                                        </div>
                                    ) : perguntas.length === 0 ? (
                                        <div className="text-center py-12 text-gray-400">
                                            <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <p className="font-medium">Nenhuma pergunta para esta vaga</p>
                                            <p className="text-sm mt-1">Você pode finalizar diretamente.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            {perguntas.map((pergunta, idx) => (
                                                <div key={pergunta.id} className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                                                    <p className="text-sm font-bold text-gray-800 mb-3">
                                                        <span className="text-blue-600 mr-1">{idx + 1}.</span>
                                                        {pergunta.enunciado}
                                                    </p>
                                                    <div className="space-y-2">
                                                        {pergunta.alternativas && pergunta.alternativas.map((alt) => (
                                                            <label key={alt.id} className="flex items-center gap-3 p-3 rounded-lg bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all cursor-pointer">
                                                                <input
                                                                    type="radio"
                                                                    name={`pergunta_${pergunta.id}`}
                                                                    value={alt.id}
                                                                    checked={respostas[pergunta.id] === alt.id}
                                                                    onChange={() => setRespostas(prev => ({ ...prev, [pergunta.id]: alt.id }))}
                                                                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                                                />
                                                                <span className="text-sm text-gray-700">{alt.texto}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-100 rounded-b-2xl">
                                    <button type="button" onClick={fecharModal} className="text-sm font-medium text-gray-600 hover:text-gray-800 px-5 py-2.5 rounded-xl hover:bg-gray-200 transition-colors cursor-pointer">
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="inline-flex justify-center py-2.5 px-8 shadow-sm text-sm font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all cursor-pointer"
                                    >
                                        Continuar
                                    </button>
                                </div>
                            </form>
                        )}

                        {etapa === 'entrevista' && (
                            <form onSubmit={handleAgendarEntrevista}>
                                <div className="p-6">
                                    <div className="text-center mb-6">
                                        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900">Parabéns, você foi aprovado!</h3>
                                        <p className="text-gray-600 mt-2 text-sm">Selecione uma data e horário para sua entrevista. Disponível de segunda a sexta, das 08h às 09h45.</p>
                                    </div>
                                    <div className="max-w-md mx-auto space-y-5">
                                        <div>
                                            <label className={labelClasses}>Data</label>
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
                                                            setErroData('Entrevistas não são realizadas aos fins de semana. Escolha uma data de segunda a sexta.');
                                                            return;
                                                        }
                                                    }
                                                    buscarSlots(val);
                                                }}
                                                className={inputClasses}
                                            />
                                            {erroData && (
                                                <p className="text-sm text-red-500 mt-1.5">{erroData}</p>
                                            )}
                                        </div>

                                        {dataEntrevista && (
                                            <div>
                                                <label className={labelClasses}>Horário disponível</label>
                                                {carregandoSlots ? (
                                                    <p className="text-sm text-gray-500">Carregando horários...</p>
                                                ) : slots.length === 0 ? (
                                                    <p className="text-sm text-red-500">Nenhum horário disponível para esta data. Tente outro dia.</p>
                                                ) : (
                                                    <div className="grid grid-cols-4 gap-2 mt-1">
                                                        {slots.map(slot => (
                                                            <button
                                                                key={slot}
                                                                type="button"
                                                                onClick={() => setSlotSelecionado(slot)}
                                                                className={`py-2 rounded-lg text-sm font-medium border transition-colors cursor-pointer ${
                                                                    slotSelecionado === slot
                                                                        ? 'bg-blue-600 text-white border-blue-600'
                                                                        : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                                                                }`}
                                                            >
                                                                {slot}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div>
                                            <label className={labelClasses}>Modelo de Entrevista</label>
                                            {vagaSelecionada.permite_online ? (
                                                <select
                                                    className={inputClasses}
                                                    value={tipoEntrevista}
                                                    onChange={e => setTipoEntrevista(e.target.value)}
                                                >
                                                    <option value="Online">Online</option>
                                                    <option value="Presencial">Presencial</option>
                                                </select>
                                            ) : (
                                                <p className="mt-1 text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-2.5 font-medium">
                                                    🏢 Presencial (no escritório da empresa)
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-100 rounded-b-2xl">
                                    <button type="button" onClick={fecharModal} className="text-sm font-medium text-gray-600 hover:text-gray-800 px-5 py-2.5 rounded-xl hover:bg-gray-200 transition-colors cursor-pointer">
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={agendando || !slotSelecionado}
                                        className="inline-flex justify-center py-2.5 px-8 shadow-sm text-sm font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
                                    >
                                        {agendando ? 'Agendando...' : 'Confirmar Agendamento'}
                                    </button>
                                </div>
                            </form>
                        )}

                        {etapa === 'concluido' && (
                            <div className="p-8 text-center">
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                                    <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-800 mb-2">Candidatura enviada!</h3>
                                <p className="text-gray-500 mb-6">Sua candidatura para <span className="font-semibold text-gray-700">{vagaSelecionada.titulo}</span> foi registrada com sucesso. Entraremos em contato em breve.</p>
                                <button
                                    type="button"
                                    onClick={fecharModal}
                                    className="inline-flex justify-center py-2.5 px-8 shadow-sm text-sm font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all cursor-pointer"
                                >
                                    Voltar às Vagas
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Modal de confirmação de envio de código WhatsApp */}
            {modalConfirmacaoTelefone && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={recusarEnvioWhatsApp}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="p-6">
                            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-green-50 mx-auto mb-4">
                                <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                            </div>

                            <h3 className="text-base font-bold text-gray-900 text-center mb-1">Enviar código de verificação?</h3>
                            <p className="text-sm text-gray-500 text-center mb-6">
                                Encontramos um cadastro associado ao número com final{' '}
                                <span className="font-bold text-gray-800">***{ultimosDigitosTelefone}</span>.
                                <br />Deseja receber um código de verificação por WhatsApp neste número?
                            </p>

                            <div className="flex gap-3 mb-4">
                                <button
                                    type="button"
                                    onClick={recusarEnvioWhatsApp}
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
                                Não reconheço ou não tenho mais acesso a este número
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
