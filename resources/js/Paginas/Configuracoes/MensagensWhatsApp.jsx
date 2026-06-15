import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import Sidebar from '../Componentes/Index';

function FlashMessage() {
    const { flash } = usePage().props;
    if (!flash?.success && !flash?.error) return null;
    return (
        <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium ${flash.success ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {flash.success || flash.error}
        </div>
    );
}

const CANAL_LABELS = {
    whatsapp: { label: 'WhatsApp', icon: '💬', color: 'bg-emerald-100 text-emerald-700' },
    email:    { label: 'E-mail',   icon: '📧', color: 'bg-blue-100 text-blue-700' },
};

const VAR_COLORS = [
    'bg-violet-100 text-violet-700',
    'bg-amber-100 text-amber-700',
    'bg-sky-100 text-sky-700',
    'bg-rose-100 text-rose-700',
    'bg-teal-100 text-teal-700',
    'bg-orange-100 text-orange-700',
];

export default function MensagensWhatsApp({ mensagens }) {
    const [editando, setEditando] = useState(null);
    const [conteudo, setConteudo] = useState('');
    const [preview, setPreview] = useState('');
    const [loadingPreview, setLoadingPreview] = useState(false);
    const [salvando, setSalvando] = useState(false);
    const [resetando, setResetando] = useState(null);

    const abrirEdicao = (msg) => {
        setEditando(msg.id);
        setConteudo(msg.conteudo);
        setPreview('');
    };

    const cancelarEdicao = () => {
        setEditando(null);
        setConteudo('');
        setPreview('');
    };

    const salvar = (id) => {
        setSalvando(true);
        router.put(`/configuracoes/mensagens-whatsapp/${id}`, { conteudo }, {
            preserveScroll: true,
            onSuccess: () => {
                setEditando(null);
                setConteudo('');
                setPreview('');
                setSalvando(false);
            },
            onError: () => setSalvando(false),
        });
    };

    const resetar = (id) => {
        setResetando(id);
        router.post(`/configuracoes/mensagens-whatsapp/${id}/resetar`, {}, {
            preserveScroll: true,
            onFinish: () => setResetando(null),
        });
    };

    const gerarPreview = (msg) => {
        setLoadingPreview(true);
        fetch('/configuracoes/mensagens-whatsapp/preview', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
            },
            body: JSON.stringify({ chave: msg.chave, conteudo: conteudo || msg.conteudo }),
        })
            .then(r => r.json())
            .then(data => {
                setPreview(data.preview);
                setLoadingPreview(false);
            })
            .catch(() => setLoadingPreview(false));
    };

    const inserirVariavel = (variavel) => {
        setConteudo(prev => prev + `{${variavel}}`);
    };

    return (
        <>
        <div className="min-h-screen bg-gray-50 flex font-sans">
            <Head title="Mensagens WhatsApp - Painel RH" />
            <Sidebar />

            <main className="flex-1 p-6 md:pl-[280px] transition-all duration-300">
                <div className="max-w-5xl mx-auto space-y-6">

                    {/* Header */}
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Mensagens WhatsApp</h1>
                        <p className="text-sm text-gray-400 mt-1">Personalize as mensagens automáticas enviadas por WhatsApp e e-mail</p>
                    </div>

                    <FlashMessage />

                    {/* Info */}
                    <div className="ds-card-static p-4">
                        <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center shrink-0 mt-0.5">
                                <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-700">Como funciona</p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Use variáveis entre chaves como <code className="bg-gray-100 px-1.5 py-0.5 rounded text-violet-600 font-mono text-[11px]">{'{nome}'}</code> para inserir dados dinâmicos. 
                                    Cada mensagem mostra quais variáveis estão disponíveis. O sistema substituirá automaticamente pelo valor real ao enviar.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Templates */}
                    <div className="space-y-4">
                        {mensagens.map((msg) => {
                            const canal = CANAL_LABELS[msg.canal] || CANAL_LABELS.whatsapp;
                            const vars = msg.variaveis_disponiveis || [];
                            const isEditing = editando === msg.id;

                            return (
                                <div key={msg.id} className="ds-card-static overflow-hidden">
                                    {/* Header do template */}
                                    <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg ${canal.color}`}>
                                                {canal.icon}
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-bold text-gray-700">{msg.titulo}</h3>
                                                <p className="text-xs text-gray-400 mt-0.5">{msg.descricao}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`ds-badge ${canal.color}`}>{canal.label}</span>
                                            <span className="ds-badge bg-gray-100 text-gray-500 font-mono text-[10px]">{msg.chave}</span>
                                        </div>
                                    </div>

                                    {/* Variáveis disponíveis */}
                                    <div className="px-5 py-3 bg-gray-50/50 border-b border-gray-100">
                                        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-2">Variáveis disponíveis</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {vars.map((v, i) => (
                                                <button
                                                    key={v}
                                                    type="button"
                                                    onClick={() => isEditing && inserirVariavel(v)}
                                                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-mono font-medium transition-all ${VAR_COLORS[i % VAR_COLORS.length]} ${isEditing ? 'cursor-pointer hover:scale-105 hover:shadow-sm' : 'cursor-default'}`}
                                                    title={isEditing ? `Clique para inserir {${v}}` : v}
                                                >
                                                    {`{${v}}`}
                                                    {isEditing && (
                                                        <svg className="w-3 h-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                        </svg>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Conteúdo */}
                                    <div className="px-5 py-4">
                                        {isEditing ? (
                                            <div className="space-y-3">
                                                <textarea
                                                    value={conteudo}
                                                    onChange={(e) => setConteudo(e.target.value)}
                                                    rows={8}
                                                    className="ds-input font-mono text-sm leading-relaxed resize-y"
                                                    placeholder="Digite o conteúdo da mensagem..."
                                                />

                                                {/* Preview */}
                                                {preview && (
                                                    <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4">
                                                        <p className="text-[10px] uppercase tracking-wider text-emerald-600 font-semibold mb-2 flex items-center gap-1.5">
                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                            </svg>
                                                            Preview com dados fictícios
                                                        </p>
                                                        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{preview}</p>
                                                    </div>
                                                )}

                                                {/* Ações de edição */}
                                                <div className="flex items-center justify-between">
                                                    <button
                                                        type="button"
                                                        onClick={() => gerarPreview(msg)}
                                                        disabled={loadingPreview}
                                                        className="ds-btn ds-btn-ghost text-sm"
                                                    >
                                                        {loadingPreview ? (
                                                            <>
                                                                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                                                </svg>
                                                                Gerando...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                </svg>
                                                                Preview
                                                            </>
                                                        )}
                                                    </button>
                                                    <div className="flex items-center gap-2">
                                                        <button type="button" onClick={cancelarEdicao} className="ds-btn ds-btn-ghost text-sm">
                                                            Cancelar
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => salvar(msg.id)}
                                                            disabled={salvando}
                                                            className="ds-btn ds-btn-primary text-sm"
                                                        >
                                                            {salvando ? (
                                                                <>
                                                                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                                                    </svg>
                                                                    Salvando...
                                                                </>
                                                            ) : 'Salvar'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="relative group">
                                                <pre className="text-sm text-gray-600 whitespace-pre-wrap font-sans leading-relaxed bg-gray-50 rounded-xl p-4 border border-gray-100">
                                                    {msg.conteudo}
                                                </pre>
                                                <div className="flex items-center gap-2 mt-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => abrirEdicao(msg)}
                                                        className="ds-btn ds-btn-secondary text-sm"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                        Editar mensagem
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => resetar(msg.id)}
                                                        disabled={resetando === msg.id}
                                                        className="ds-btn ds-btn-ghost text-sm text-gray-400 hover:text-amber-600"
                                                        title="Restaurar mensagem para o padrão original"
                                                    >
                                                        {resetando === msg.id ? (
                                                            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                                            </svg>
                                                        ) : (
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                            </svg>
                                                        )}
                                                        Restaurar padrão
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                </div>
            </main>
        </div>
        </>
    );
}
