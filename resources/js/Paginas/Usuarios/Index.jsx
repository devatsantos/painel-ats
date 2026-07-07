import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import Sidebar from '../Componentes/Index';

export default function Usuarios({usuarios}) {
    const [busca, setBusca] = useState('');
    const [modalCriar, setModalCriar] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [usuarioId, setUsuarioId] = useState(null);

    const { data, setData, post, put, processing, errors, reset, delete: destroy } = useForm({
        nome: '',
        cpf: '',
        password: '',
        role: '',
    });

    const listaUsuarios = Array.isArray(usuarios) ? usuarios : (usuarios?.data ?? []);
    const usuariosFiltrados = listaUsuarios.filter((u) =>
        u.nome.toLowerCase().includes(busca.toLowerCase()) ||
        (u.cpf && u.cpf.includes(busca))
    );
    const maskCpf = (value) => {
        if (!value) return '';
        return value
            .replace(/\D/g, '')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})/, '$1-$2')
            .replace(/(-\d{2})\d+?$/, '$1');
    };

    const handleCreate = () => {
        reset();
        setEditMode(false);
        setUsuarioId(null);
        setModalCriar(true);
    };

    const handleEdit = (usuario) => {
        setEditMode(true);
        setUsuarioId(usuario.id);
        setData({
            nome: usuario.nome,
            cpf: usuario.cpf,
            password: '',
            role: usuario.role ?? '',
        });
        setModalCriar(true);
    };

    const closeModal = () => {
        setModalCriar(false);
        setEditMode(false);
        setUsuarioId(null);
        reset();
    };

    const handleDelete = (id) => {
        if (confirm('Tem certeza que deseja excluir este usuário?')) {
            destroy(`/usuarios/${id}`);
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (editMode) {
            put(`/usuarios/${usuarioId}`, {
                onSuccess: () => {
                    closeModal();
                }
            });
        } else {
            post('/usuarios', {
                onSuccess: () => {
                    closeModal();
                }
            });
        }
    };

    return (
        <>
            <Sidebar />
            <div className="flex min-h-screen bg-gray-50 md:ml-64">
                <main className="flex-1 p-6 lg:p-10">
                    
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Usuários</h1>
                            <p className="text-gray-500 mt-1">Gerencie os usuários com acesso ao painel.</p>
                        </div>
                        <button onClick={handleCreate} className="inline-flex items-center gap-2 bg-[#0C4773] hover:bg-[#007EAE] text-white font-semibold px-5 py-2.5 rounded-xl shadow-md transition-all duration-200 cursor-pointer">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Novo Usuário
                        </button>
                    </div>

                    <div className="mb-6">
                        <div className="relative">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                value={busca}
                                onChange={(e) => setBusca(maskCpf(e.target.value))}
                                placeholder="Buscar por CPF..."
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0C4773] focus:ring-2 focus:ring-[#0C4773]/20 transition"
                            />
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Nome</th>
                                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">CPF</th>
                                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">Cargo</th>
                                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Cadastrado em</th>
                                        <th className="text-right px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {usuariosFiltrados.length > 0 ? (
                                        usuariosFiltrados.map((usuario) => (
                                            <tr key={usuario.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-[#0C4773] flex items-center justify-center text-white text-sm font-semibold shrink-0">
                                                            {usuario.nome.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="text-sm font-medium text-gray-800">{usuario.nome}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600 font-mono">{usuario.cpf}</td>
                                                <td className="px-6 py-4 hidden md:table-cell">
                                                    {usuario.role ? (
                                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${
                                                            usuario.role === 'admin'         ? 'bg-purple-100 text-purple-700' :
                                                            usuario.role === 'recrutador'    ? 'bg-blue-100 text-blue-700' :
                                                            usuario.role === 'coordenador'   ? 'bg-amber-100 text-amber-700' :
                                                            usuario.role === 'recepcao'      ? 'bg-teal-100 text-teal-700' :
                                                            'bg-gray-100 text-gray-600'
                                                        }`}>
                                                            {usuario.role.charAt(0).toUpperCase() + usuario.role.slice(1)}
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-gray-400">—</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500 hidden sm:table-cell">
                                                    {new Date(usuario.created_at).toLocaleDateString('pt-BR')}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button 
                                                            onClick={() => handleEdit(usuario)}
                                                            className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer" 
                                                            title="Editar">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                        </button>
                                                        <button className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer" title="Excluir" onClick={() => handleDelete(usuario.id)}>
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center">
                                                <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                <p className="text-sm text-gray-400">Nenhum usuário encontrado.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-400">
                            {usuariosFiltrados.length} usuário{usuariosFiltrados.length !== 1 ? 's' : ''} encontrado{usuariosFiltrados.length !== 1 ? 's' : ''}
                        </div>
                    </div>
                </main>
            </div>

            {modalCriar && (
                <div className="ds-modal-overlay" onClick={closeModal}>
                    <div className="ds-modal-panel max-w-lg max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                        
                        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">
                                    {editMode ? 'Editar Usuário' : 'Novo Usuário'}
                                </h2>
                                <p className="text-sm text-gray-400 mt-0.5">
                                    {editMode ? `Editando permissões de ${data.nome}` : 'Cadastre um novo usuário para acesso ao painel' }
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={closeModal}
                                className="ds-btn-icon"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form id="form-criar-usuario" onSubmit={handleSubmit} className="overflow-y-auto px-6 py-5 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo <span className="text-red-400">*</span></label>
                                <input
                                    type="text"
                                    value={data.nome}
                                    onChange={e => setData('nome', e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0C4773] focus:ring-2 focus:ring-[#0C4773]/20 transition"
                                    placeholder="Ex: João da Silva"
                                    required
                                />
                                {errors.nome && <p className="text-red-500 text-xs mt-1">{errors.nome}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">CPF <span className="text-red-400">*</span></label>
                                <input
                                    type="text"
                                    value={data.cpf}
                                    onChange={e => setData('cpf', maskCpf(e.target.value))}
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0C4773] focus:ring-2 focus:ring-[#0C4773]/20 transition"
                                    placeholder="000.000.000-00"
                                    maxLength="14"
                                    required
                                />
                                {errors.cpf && <p className="text-red-500 text-xs mt-1">{errors.cpf}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Senha {editMode ? '' : <span className="text-red-400">*</span>}
                                </label>
                                <input
                                    type="password"
                                    value={data.password}
                                    onChange={e => setData('password', e.target.value)}
                                    placeholder={editMode ? 'Deixe em branco para manter a atual' : 'Sua senha de acesso'}
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0C4773] focus:ring-2 focus:ring-[#0C4773]/20 transition"
                                    required={!editMode}
                                />
                                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                            </div>

                            <div className="pt-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Perfil de acesso</label>
                                <select
                                    value={data.role}
                                    onChange={e => setData('role', e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-[#0C4773] focus:ring-2 focus:ring-[#0C4773]/20 transition"
                                >
                                    <option value="">Sem perfil</option>
                                    <option value="admin">Administrador</option>
                                    <option value="recrutador">Recrutador</option>
                                    <option value="coordenador">Coordenador</option>
                                    <option value="recepcao">Recepção</option>
                                </select>
                                {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
                            </div>
                        </form>

                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3 rounded-b-2xl shrink-0">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-200 transition-colors cursor-pointer"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                form="form-criar-usuario"
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
                                ) : (editMode ? 'Salvar Alterações' : 'Criar Usuário')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
