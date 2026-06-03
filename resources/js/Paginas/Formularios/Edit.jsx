import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import Sidebar from '../Componentes/Index';

export default function Edit({ formulario }) {
    const { data, setData, put, processing, errors } = useForm({
        titulo_formulario: formulario.titulo_formulario || '',
        descricao: formulario.descricao || '',
        requisitos: formulario.requisitos || '',
        posto: formulario.posto || '',
        threshold: formulario.threshold || 3,
        perguntas: formulario.perguntas && formulario.perguntas.length > 0 
            ? formulario.perguntas 
            : [
                {
                    enunciado: '',
                    alternativas: [
                        { texto: '', correta: true },
                        { texto: '', correta: false }
                    ]
                }
            ]
    });

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
        put(`/formularios/${formulario.id}`);
    };

    return (
        <>
            <Head title={`Editar: ${formulario.titulo_formulario}`} />
            <Sidebar />
            <div className="flex min-h-screen bg-gray-100 md:ml-64">
                <main className="flex-1 p-4 pt-16 sm:p-6 md:p-8 lg:p-10 max-w-full overflow-hidden">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <Link href="/formularios" className="text-sm font-medium text-gray-500 hover:text-gray-800 flex items-center gap-1 mb-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Voltar para Formulários
                            </Link>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                                Editar Formulário
                            </h1>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200">
                        <div className="p-6 md:p-8 space-y-8">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Título do Formulário <span className="text-red-500">*</span>
                                </label>
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
                            <div className="border-t border-gray-100 pt-8">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h4 className="text-lg font-bold text-gray-800">Perguntas</h4>
                                        <p className="text-sm text-gray-500 mt-1">Gerencie as perguntas de múltipla escolha.</p>
                                    </div>
                                    <button type="button" onClick={handleAddPergunta} className="text-sm text-blue-600 bg-blue-50 px-4 py-2 rounded-xl font-medium hover:bg-blue-100 transition-colors shadow-sm">
                                        + Nova Pergunta
                                    </button>
                                </div>

                                <div className="space-y-8">
                                    {data.perguntas.map((pergunta, pIndex) => (
                                        <div key={pIndex} className="bg-gray-50 border border-gray-200 rounded-xl p-5 md:p-6 relative group">
                                            {data.perguntas.length > 1 && (
                                                <button 
                                                    type="button" 
                                                    onClick={() => handleRemovePergunta(pIndex)} 
                                                    className="absolute top-5 right-5 text-red-500 hover:text-red-700 opacity-60 hover:opacity-100 transition-opacity p-2 rounded-lg hover:bg-red-50"
                                                    title="Remover Pergunta"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            )}

                                            <div className="mb-6 pr-12">
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Pergunta {pIndex + 1}</label>
                                                <input 
                                                    type="text" 
                                                    value={pergunta.enunciado}
                                                    onChange={e => updatePergunta(pIndex, 'enunciado', e.target.value)}
                                                    required
                                                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#071F30]/20 focus:border-[#071F30] transition-shadow"
                                                    placeholder="Digite o enunciado da pergunta"
                                                />
                                            </div>

                                            <div className="space-y-3">
                                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Alternativas</label>
                                                {pergunta.alternativas.map((alt, aIndex) => (
                                                    <div key={aIndex} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white p-3 rounded-lg border border-gray-200">
                                                        <label className="flex items-center gap-2 min-w-max cursor-pointer">
                                                            <input 
                                                                type="radio" 
                                                                name={`correta-${pIndex}`}
                                                                checked={alt.correta}
                                                                onChange={() => updateAlternativa(pIndex, aIndex, 'correta', true)}
                                                                className="w-4 h-4 text-[#071F30] focus:ring-[#071F30] cursor-pointer"
                                                            />
                                                            <span className="text-xs font-medium text-gray-600 uppercase">Correta</span>
                                                        </label>
                                                        
                                                        <input 
                                                            type="text" 
                                                            value={alt.texto}
                                                            onChange={e => updateAlternativa(pIndex, aIndex, 'texto', e.target.value)}
                                                            required
                                                            className="flex-1 bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#071F30]/20 focus:border-[#071F30] transition-colors"
                                                            placeholder={`Alternativa ${aIndex + 1}`}
                                                        />
                                                        
                                                        {pergunta.alternativas.length > 2 && (
                                                            <button 
                                                                type="button" 
                                                                onClick={() => handleRemoveAlternativa(pIndex, aIndex)}
                                                                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                                                title="Remover Alternativa"
                                                            >
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}

                                                <button 
                                                    type="button" 
                                                    onClick={() => handleAddAlternativa(pIndex)}
                                                    className="mt-3 text-xs font-semibold text-[#071F30] hover:text-blue-900 inline-flex items-center gap-1"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                                    Adicionar Alternativa
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="px-6 md:px-8 py-5 bg-gray-50 border-t border-gray-200 rounded-b-2xl flex items-center justify-end gap-4">
                            <Link href="/formularios" className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors">
                                Cancelar
                            </Link>
                            <button 
                                type="submit" 
                                disabled={processing}
                                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#071F30] hover:bg-[#007EAE] disabled:opacity-50 transition-all shadow-md"
                            >
                                {processing ? (
                                    <>
                                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                        </svg>
                                        Salvando...
                                    </>
                                ) : 'Salvar Alterações'}
                            </button>
                        </div>
                    </form>
                </main>
            </div>
        </>
    );
}
