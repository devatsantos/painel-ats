import React from 'react';
import { usePage } from '@inertiajs/react';

const TABS = [
    { label: 'Visão Geral',  href: '/relatorios' },
    { label: 'Funil',        href: '/relatorios/funil' },
    { label: 'Time-to-Hire', href: '/relatorios/time-to-hire' },
    { label: 'Volume',       href: '/relatorios/volume' },
    { label: 'Performance',  href: '/relatorios/performance' },
];

export default function RelatoriosTabs({ titulo = 'Relatórios', subtitulo = 'Visão geral' }) {
    const { url } = usePage();

    return (
        <header className="flex flex-col gap-4">
            <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">{subtitulo}</p>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">{titulo}</h1>
            </div>
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit flex-wrap">
                {TABS.map(tab => {
                    const isActive = url === tab.href || (tab.href !== '/relatorios' && url.startsWith(tab.href));
                    const isExactActive = tab.href === '/relatorios' ? url === '/relatorios' : url.startsWith(tab.href);
                    return isExactActive ? (
                        <span
                            key={tab.href}
                            className="px-4 py-2 rounded-lg text-sm font-semibold bg-white text-gray-900 shadow-sm cursor-default transition-all"
                        >
                            {tab.label}
                        </span>
                    ) : (
                        <a
                            key={tab.href}
                            href={tab.href}
                            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-white/50 transition-all"
                        >
                            {tab.label}
                        </a>
                    );
                })}
            </div>
        </header>
    );
}
