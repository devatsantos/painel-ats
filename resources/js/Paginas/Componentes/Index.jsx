import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';

export default function Sidebar() {
    const { url, props } = usePage();
    const isAdmin = props.auth?.user?.role === 'admin';
    const [mobileOpen, setMobileOpen] = useState(false);

    const isDashboard = url.startsWith('/dashboard');
    const isEntrevistas = url.startsWith('/entrevistas');
    const isUsuarios = url.startsWith('/usuarios');
    const isVagas = url.startsWith('/vagas');
    const isTalentos = url.startsWith('/talentos');
    const isOrcamentos = url.startsWith('/orcamentos');
    const isFormularios = url.startsWith('/formularios');
    const isAgenda = url.startsWith('/agenda');
    const isRelatorios = url.startsWith('/relatorios');
    const isOuvidoria = url.startsWith('/ouvidoria');
    const navItems = [
        {
            label: 'Dashboard',
            href: '/dashboard',
            active: isDashboard,
            icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z" />
            ),
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
            label: 'Vagas',
            href: '/vagas',
            active: isVagas,
            icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0H8m8 0h2a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h2" />
            ),
        },
        {
            label: 'Usuários',
            href: '/usuarios',
            active: isUsuarios,
            adminOnly: true,
            icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            ),
            
        },
        {
            label: 'Banco de Talentos',
            href: '/talentos',
            active: isTalentos,
            icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            )
        },
        {
            label: 'Orçamentos',
            href: '/orcamentos',
            active: isOrcamentos,
            adminOnly: true,
            icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            )
        },
        {
            label: 'Formulários',
            href: '/formularios',
            active: isFormularios,
            icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            )
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
        {
            label: 'Ouvidoria',
            href: '/ouvidoria',
            active: isOuvidoria,
            adminOnly: true,
            icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            )
        }
    ];

    const SidebarContent = () => (
        <>
            
            <div className="flex flex-col justify-center px-6 h-20 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <img 
                        src="https://1884w9942rbuynxx.public.blob.vercel-storage.com/Novo%20site%20AT%20%26%20Santos/LogoTipo-ATSANTOS%2Bletreiro-branco.png" 
                        alt="AT & Santos Logo" 
                        className="h-8 w-auto object-contain"
                    />
                    <div className="border-l border-white/20 pl-3">
                        <h1 className="text-xs font-black text-white tracking-widest leading-none font-heading uppercase">Painel RH</h1>
                        <p className="text-[9px] text-blue-200/60 mt-1 uppercase tracking-wider">Gestão</p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 px-3 py-6 overflow-y-auto">
                <p className="text-[10px] uppercase tracking-[0.15em] text-blue-200/50 font-bold mb-3 px-3">Navegação</p>
                <ul className="flex flex-col gap-1">
                    {navItems.filter(item => !item.adminOnly || isAdmin).map((item) => (
                        <li key={item.href}>
                            <Link
                                href={item.href}
                                onClick={() => setMobileOpen(false)}
                                className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 ${
                                    item.active
                                        ? 'bg-white/10 text-white shadow-sm'
                                        : 'text-blue-100/70 hover:bg-white/5 hover:text-white'
                                }`}
                            >
                                <svg
                                    className={`w-[18px] h-[18px] transition-colors ${
                                        item.active ? 'text-white' : 'text-blue-200/50 group-hover:text-blue-100'
                                    }`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    {item.icon}
                                </svg>
                                {item.label}
                                {item.active && (
                                    <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full"></div>
                                )}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="px-3 pb-4 pt-2 border-t border-white/10">
                <Link
                    href="/logout"
                    method="post"
                    as="button"
                    className="group w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium text-blue-100/70 hover:bg-red-500/15 hover:text-red-400 transition-all duration-150"
                >
                    <svg className="w-[18px] h-[18px] text-blue-200/50 group-hover:text-red-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sair
                </Link>
            </div>
        </>
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
                    <aside className="relative flex flex-col w-64 h-full bg-[#071F30] shadow-2xl">
                        <SidebarContent />
                    </aside>
                </div>
            )}

            <aside className="fixed inset-y-0 left-0 hidden md:flex flex-col w-64 bg-[#071F30] z-50">
                <SidebarContent />
            </aside>
        </>
    );
}
