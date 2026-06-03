import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import Sidebar from '../Componentes/Index';

export default function Formularios({ formulariosCadastrados = [] }) {
    const [modalCriar, setModalCriar] = useState(false);
    const formatData = (dataString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dataString).toLocaleDateString('pt-BR', options);
    }
    
    const { data, setData, post, processing, errors, reset } = useForm({
        titulo_formulario: '',
        descricao: '',
        requisitos: '',
        posto: '',
        threshold: 3,
        perguntas: [
            {
                enunciado: '',
                alternativas: [
                    { texto: '', correta: true },
                    { texto: '', correta: false }
                ]
            }
        ]
    });

    const [formularios, setFormularios] = useState(formulariosCadastrados || []);

    const handleAddPergunta = () => {
        setData('perguntas', [
            ...data.perguntas,
            {
                enunciado: '',
                alternativas: [
                    { texto: '', correta: true },
                    { texto: '', correta: false }
                ]
            }
        ]);
    };

    const handleRemovePergunta = (index) => {
        const novasPerguntas = [...data.perguntas];
        novasPerguntas.splice(index, 1);
        setData('perguntas', novasPerguntas);
    };

    const handleAddAlternativa = (perguntaIndex) => {
        const novasPerguntas = [...data.perguntas];
        novasPerguntas[perguntaIndex].alternativas.push({ texto: '', correta: false });
        setData('perguntas', novasPerguntas);
    };

    const handleRemoveAlternativa = (perguntaIndex, alternativaIndex) => {
        const novasPerguntas = [...data.perguntas];
        novasPerguntas[perguntaIndex].alternativas.splice(alternativaIndex, 1);
        setData('perguntas', novasPerguntas);
    };

    const updatePergunta = (index, field, value) => {
        const novasPerguntas = [...data.perguntas];
        novasPerguntas[index][field] = value;
        setData('perguntas', novasPerguntas);
    };

    const updateAlternativa = (pIndex, aIndex, field, value) => {
        const novasPerguntas = [...data.perguntas];

        if (field === 'correta' && value === true) {
            novasPerguntas[pIndex].alternativas.forEach((alt, i) => {
                alt.correta = (i === aIndex);
            });
        } else {
            novasPerguntas[pIndex].alternativas[aIndex][field] = value;
        }
        
        setData('perguntas', novasPerguntas);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/formularios', {
            onSuccess: () => {
                setModalCriar(false);
                reset();
            }
        });
    };

    return (
        <>
            <Head title="Formulários" />
            <Sidebar />
            <div className="flex min-h-screen bg-gray-100 md:ml-64">
                <main className="flex-1 p-4 pt-16 sm:p-6 md:p-8 lg:p-10 max-w-full overflow-hidden">
                    
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 md:mb-8 gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Formulários</h1>
                            <p className="text-gray-500 mt-1">Crie e gerencie formulários customizados para os processos seletivos.</p>
                        </div>
                        <button
                            onClick={() => setModalCriar(true)}
                            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#071F30] text-white text-sm font-semibold rounded-xl hover:bg-blue-900 transition-colors shadow-sm"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                            Novo Formulário
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {formularios.map((form) => (
                            <div key={form.id} className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition flex flex-col h-full">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider ${form.status === 'Inativo' ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-700'}`}>
                                        {form.status || 'Ativo'}
                                    </div>
                                    <div className="text-xs text-gray-400 flex items-center gap-1">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                        {formatData(form.created_at)}
                                    </div>
                                </div>
                                
                                <h3 className="text-lg font-bold text-gray-800 mb-1 line-clamp-2">{form.titulo_formulario} -  {form.posto}</h3>
                                <p className="text-sm text-gray-500 flex-1">{form.perguntas_count || 0} {(form.perguntas_count || 0) === 1 ? 'pergunta' : 'perguntas'}</p>

                                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                                    <Link 
                                        href={`/formularios/${form.id}/edit`} 
                                        className="text-sm font-medium text-[#071F30] hover:underline"
                                    >
                                        Configurar
                                    </Link>
                                    <button className="text-sm font-medium text-red-500 hover:text-red-700 hover:underline" onClick={() => handleDeleteFormulario(form.id)}>
                                        Excluir
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </main>
            </div>

            {modalCriar && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setModalCriar(false)}>
                    <form onSubmit={handleSubmit} className="relative w-full max-w-4xl bg-white rounded-2xl shadow-xl flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                        
                        <div className="flex-shrink-0 flex justify-between items-center px-6 py-5 border-b border-gray-100">
                            <h3 className="text-lg sm:text-xl font-bold text-[#071F30] flex items-center gap-2">
                                <span className="w-1.5 h-5 sm:h-6 bg-[#071F30] rounded-full inline-block"></span>
                                Criar Novo Formulário
                            </h3>
                            <button type="button" onClick={() => setModalCriar(false)} className="text-gray-400 hover:bg-gray-100 p-2 rounded-full transition-all">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        
                        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Título do Formulário <span className="text-red-500">*</span></label>
                                <input 
                                    type="text" 
                                    value={data.titulo_formulario}
                                    onChange={e => setData('titulo_formulario', e.target.value)}
                                    required
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#071F30]" 
                                    placeholder="Ex: Avaliação Técnica" 
                                />
                                {errors.titulo_formulario && <p className="text-red-500 text-xs mt-1">{errors.titulo_formulario}</p>}
                            </div>
                              <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">Descrição <span className="text-red-500">*</span></label>
                                  <textarea 
                                      value={data.descricao}
                                      onChange={e => setData('descricao', e.target.value)}
                                      required
                                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#071F30]" 
                                      placeholder="Descreva o formulário" 
                                      rows="3"
                                  />
                                  {errors.descricao && <p className="text-red-500 text-xs mt-1">{errors.descricao}</p>}
                              </div>

                              <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">Requisitos <span className="text-red-500">*</span></label>
                                  <textarea 
                                      value={data.requisitos}
                                      onChange={e => setData('requisitos', e.target.value)}
                                      required
                                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#071F30]" 
                                      placeholder="Descreva os requisitos" 
                                      rows="3"
                                  />
                                  {errors.requisitos && <p className="text-red-500 text-xs mt-1">{errors.requisitos}</p>}
                              </div>

                              <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">Posto <span className="text-red-500">*</span></label>
                                  <input 
                                      type="text" 
                                      value={data.posto}
                                      onChange={e => setData('posto', e.target.value)}
                                      required
                                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#071F30]" 
                                      placeholder="Posto/Cargo" 
                                  />
                                  {errors.posto && <p className="text-red-500 text-xs mt-1">{errors.posto}</p>}
                              </div>

                              <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                      Mínimo de acertos para aprovação <span className="text-red-500">*</span>
                                  </label>
                                  <p className="text-xs text-gray-400 mb-2">Candidatos que acertarem menos que esse valor serão reprovados e bloqueados por 30 dias.</p>
                                  <input
                                      type="number"
                                      min={1}
                                      value={data.threshold}
                                      onChange={e => setData('threshold', parseInt(e.target.value) || 1)}
                                      required
                                      className="w-24 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#071F30]"
                                  />
                                  {errors.threshold && <p className="text-red-500 text-xs mt-1">{errors.threshold}</p>}
                              </div>
                            <div className="border-t border-gray-100 pt-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-800">Perguntas</h4>
                                        <p className="text-xs text-gray-500">Adicione os campos necessários (Perguntas de Múltipla Escolha).</p>
                                    </div>
                                    <button type="button" onClick={handleAddPergunta} className="text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-lg font-medium hover:bg-blue-100">
                                        + Nova Pergunta
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    {data.perguntas.map((pergunta, pIndex) => (
                                        <div key={pIndex} className="bg-gray-50 border border-gray-200 rounded-xl p-4 relative group">
                                            {data.perguntas.length > 1 && (
                                                <button 
                                                    type="button" 
                                                    onClick={() => handleRemovePergunta(pIndex)} 
                                                    className="absolute top-4 right-4 text-red-500 hover:text-red-700 opacity-60 hover:opacity-100 transition-opacity"
                                                >
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            )}
                                            
                                            <div className="mb-4 pr-8">
                                                <label className="block text-xs font-semibold text-gray-800 mb-1.5 uppercase">Enunciado da Pergunta {pIndex + 1} <span className="text-red-500">*</span></label>
                                                <input 
                                                    type="text" 
                                                    value={pergunta.enunciado}
                                                    onChange={e => updatePergunta(pIndex, 'enunciado', e.target.value)}
                                                    required
                                                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm" 
                                                    placeholder="Digite a pergunta aqui" 
                                                />
                                                {errors[`perguntas.${pIndex}.enunciado`] && <p className="text-red-500 text-xs mt-1">{errors[`perguntas.${pIndex}.enunciado`]}</p>}
                                            </div>
                                            
                                            <div className="pl-4 border-l-2 border-[#071F30]/20 space-y-3">
                                                <label className="block text-xs font-semibold text-gray-500 uppercase">Alternativas</label>
                                                
                                                {pergunta.alternativas.map((alt, aIndex) => (
                                                    <div key={aIndex} className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                                                        <div className="flex-1 flex w-full">
                                                            <input 
                                                                type="text" 
                                                                value={alt.texto}
                                                                onChange={e => updateAlternativa(pIndex, aIndex, 'texto', e.target.value)}
                                                                required
                                                                className="flex-1 bg-white border border-gray-300 rounded-l-lg rounded-r-none px-3 py-2 text-sm focus:z-10 focus:outline-none focus:border-[#071F30]" 
                                                                placeholder={`Alternativa ${aIndex + 1}`} 
                                                            />
                                                            <div className="flex items-center bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg px-3">
                                                                <label className="flex items-center gap-2 cursor-pointer py-2">
                                                                    <input 
                                                                        type="radio" 
                                                                        name={`correta_${pIndex}`}
                                                                        checked={alt.correta}
                                                                        onChange={e => updateAlternativa(pIndex, aIndex, 'correta', true)}
                                                                        className="text-[#071F30] focus:ring-[#071F30]"
                                                                    />
                                                                    <span className="text-xs font-medium text-gray-700 whitespace-nowrap">É a Correta</span>
                                                                </label>
                                                            </div>
                                                        </div>
                                                        
                                                        {pergunta.alternativas.length > 2 && (
                                                            <button 
                                                                type="button" 
                                                                onClick={() => handleRemoveAlternativa(pIndex, aIndex)} 
                                                                className="text-gray-400 hover:text-red-500 p-1"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}

                                                <button type="button" onClick={() => handleAddAlternativa(pIndex)} className="text-xs font-semibold text-blue-600 flex items-center gap-1 mt-2">
                                                    + Adicionar Alternativa
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex-shrink-0 px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-100 rounded-b-2xl flex justify-end gap-3">
                            <button type="button" onClick={() => setModalCriar(false)} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-100">Cancelar</button>
                            <button type="submit" disabled={processing} className={`px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#071F30] hover:bg-blue-900 ${processing ? 'opacity-50' : ''}`}>
                                {processing ? 'Salvando...' : 'Salvar Formulário'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
}
