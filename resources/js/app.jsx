import '../css/app.css';
import '@fontsource/inter';
import React from 'react';
import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';

createInertiaApp({
    resolve: name => {
        const pages = import.meta.glob('./Paginas/**/*.jsx', { eager: true });
        const keyA = `./Paginas/${name}.jsx`;
        const keyB = `./Paginas/${name}/Index.jsx`;
        const mod = pages[keyA] || pages[keyB];
        if (!mod) {
            throw new Error(`Page ${name} not found. Checked ${keyA} and ${keyB}`);
        }
        return mod.default || mod;
    },
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },
});
