import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';

const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
};

const getRoleLabel = (role) => {
    const roles = {
        admin: 'Administrador',
        coordenador: 'Coordenador',
        recrutador: 'Recrutador'
    };
    return roles[role] || role || 'Membro';
};

export default function Sidebar() {
    const { url, props } = usePage();
    const isAdmin = props.auth?.user?.role === 'admin';
    const isCoordenador = props.auth?.user?.role === 'coordenador';
    const logoWhiteUrl = props.appConfig?.logo_white_url;
    const [mobileOpen, setMobileOpen] = useState(false);

    const isDashboard = url.startsWith('/dashboard');
    const isEntrevistas = url.startsWith('/entrevistas');
    const isUsuarios = url.startsWith('/usuarios');
    const isVagas = url.startsWith('/vagas');
    const isCandidatos = url.startsWith('/candidatos') || url.startsWith('/talentos') || url.startsWith('/base-de-dados');
    const isOrcamentos = url.startsWith('/orcamentos');
    const isFormularios = url.startsWith('/formularios');
    const isAgenda = url.startsWith('/agenda');
    const isRelatorios = url.startsWith('/relatorios');
    const isReprovados = url.startsWith('/reprovados');
    const isOuvidoria = url.startsWith('/ouvidoria');
    const isLogs = url.startsWith('/logs');
    const isConfiguracoesGerais = url === '/configuracoes/gerais';
    const isConfiguracoesWhatsapp = url === '/configuracoes/mensagens-whatsapp';

    const menuGroups = [
        {
            title: 'Painel',
            items: [
                {
                    label: 'Dashboard',
                    href: '/dashboard',
                    active: isDashboard,
                    icon: (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z" />
                    ),
                },
                {
                    label: 'Agenda',
                    href: '/agenda',
                    active: isAgenda,
                    icon: (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    )
                },
                {
                    label: 'Relatórios',
                    href: '/relatorios',
                    active: isRelatorios,
                    icon: (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    )
                },
            ]
        },
        {
            title: 'Recrutamento',
            items: [
                {
                    label: 'Vagas',
                    href: '/vagas',
                    active: isVagas,
                    icon: (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0H8m8 0h2a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h2" />
                    ),
                },
                {
                    label: 'Candidatos',
                    href: '/candidatos',
                    active: isCandidatos,
                    icon: (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    )
                },
                {
                    label: 'Reprovados',
                    href: '/reprovados',
                    active: isReprovados,
                    icon: (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    )
                },
                {
                    label: 'Entrevistas',
                    href: '/entrevistas',
                    active: isEntrevistas,
                    icon: (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    ),
                },
                {
                    label: 'Formulários',
                    href: '/formularios',
                    active: isFormularios,
                    icon: (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    )
                },
            ]
        },
        {
            title: 'Administração',
            items: [
                {
                    label: 'Usuários',
                    href: '/usuarios',
                    active: isUsuarios,
                    adminOnly: true,
                    coordenadorAllowed: true,
                    icon: (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    ),
                },
                {
                    label: 'Orçamentos',
                    href: '/orcamentos',
                    active: isOrcamentos,
                    adminOnly: true,
                    icon: (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    )
                },
                {
                    label: 'Ouvidoria',
                    href: '/ouvidoria',
                    active: isOuvidoria,
                    adminOnly: true,
                    icon: (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    )
                },
            ]
        },
        {
            title: 'Configurações',
            items: [
                {
                    label: 'Gerais',
                    href: '/configuracoes/gerais',
                    active: isConfiguracoesGerais,
                    adminOnly: true,
                    icon: (
                        <>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </>
                    )
                },
                {
                    label: 'WhatsApp',
                    href: '/configuracoes/mensagens-whatsapp',
                    active: isConfiguracoesWhatsapp,
                    adminOnly: true,
                    icon: (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    )
                },
                {
                    label: 'Monitoramento',
                    href: '/logs',
                    active: isLogs,
                    adminOnly: true,
                    icon: (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    )
                },
            ]
        }
    ];

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            <div className="flex flex-col justify-center px-6 h-20 border-b border-white/[0.06] bg-white/[0.02]">
                <div className="flex items-center gap-3">
                    <img 
                        src={logoWhiteUrl} 
                        alt="AT & Santos Logo" 
                        className="h-8 w-auto object-contain"
                    />
                    <div className="border-l border-white/20 pl-3">
                        <h1 className="text-xs font-black text-white tracking-widest leading-none font-heading uppercase">Painel RH</h1>
                        <p className="text-[9px] text-blue-200/60 mt-1 uppercase tracking-wider">Gestão</p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 px-3 py-4 overflow-y-auto ds-scrollbar-hidden">
                {menuGroups.map((group, groupIdx) => {
                    const visibleItems = group.items.filter(item => 
                        !item.adminOnly || isAdmin || (item.coordenadorAllowed && isCoordenador));
                    
                    if (visibleItems.length === 0) return null;

                    return (
                        <div key={groupIdx} className="mb-6">
                            <span className="text-[10px] tracking-[0.2em] font-semibold text-blue-200/40 uppercase mb-2 block px-4">
                                {group.title}
                            </span>
                            <ul className="flex flex-col gap-1">
                                {visibleItems.map((item, itemIdx) => (
                                    <li key={itemIdx}>
                                        <Link
                                            href={item.href}
                                            onClick={() => setMobileOpen(false)}
                                            className={`group flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13.5px] font-medium transition-all duration-300 relative ${
                                                item.active
                                                    ? 'bg-white/[0.06] text-white font-semibold border border-white/[0.05] shadow-inner'
                                                    : 'text-blue-100/60 hover:bg-white/[0.03] hover:text-white hover:pl-[19px]'
                                            }`}
                                        >
                                            {item.active && (
                                                <span className="absolute left-0 top-3 bottom-3 w-1 bg-gradient-to-b from-[#007EAE] to-[#0C4773] rounded-r-md shadow-[0_0_8px_#007EAE]" />
                                            )}
                                            <svg
                                                className={`w-[18px] h-[18px] shrink-0 transition-all duration-300 ${
                                                    item.active ? 'text-white scale-110' : 'text-blue-200/40 group-hover:text-white group-hover:scale-110'
                                                }`}
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                {item.icon}
                                            </svg>
                                            <span className="transition-colors duration-200">
                                                {item.label}
                                            </span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-white/[0.06] bg-white/[0.01]">
                <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] transition-all duration-300">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#0C4773] to-[#007EAE] border border-white/10 flex items-center justify-center font-bold text-white text-[13px] shadow-[0_2px_8px_rgba(12,71,115,0.3)] shrink-0 select-none">
                            {props.auth?.user?.nome ? getInitials(props.auth.user.nome) : 'U'}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-[12.5px] font-semibold text-white truncate max-w-[120px] leading-tight">
                                {props.auth?.user?.nome || 'Usuário'}
                            </span>
                            <span className="text-[9.5px] text-blue-200/50 font-medium capitalize mt-0.5 tracking-wider">
                                {getRoleLabel(props.auth?.user?.role)}
                            </span>
                        </div>
                    </div>
                    <Link
                        href="/logout"
                        method="post"
                        as="button"
                        className="p-1.5 rounded-lg text-blue-200/50 hover:bg-red-500/15 hover:text-red-400 transition-all duration-200 cursor-pointer shrink-0"
                        title="Sair"
                    >
                        <svg className="w-[17px] h-[17px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    </Link>
                </div>
            </div>
        </div>
    );

    return (
        <>
            <button
                onClick={() => setMobileOpen(true)}
                className="fixed top-4 left-4 z-50 md:hidden p-2 bg-[#071F30] rounded-lg shadow-lg text-white"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>

            {mobileOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
                    <aside className="relative flex flex-col w-64 h-full bg-gradient-to-b from-[#061826] via-[#092235] to-[#04121d] border-r border-white/[0.06] shadow-2xl">
                        <SidebarContent />
                    </aside>
                </div>
            )}

            <aside className="fixed inset-y-0 left-0 hidden md:flex flex-col w-64 bg-gradient-to-b from-[#061826] via-[#092235] to-[#04121d] border-r border-white/[0.06] z-50">
                <SidebarContent />
            </aside>
        </>
    );
}

