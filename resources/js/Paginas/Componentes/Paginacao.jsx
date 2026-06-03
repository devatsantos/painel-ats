import { router } from '@inertiajs/react';

export default function Paginacao({ paginacao }) {
    if (!paginacao || paginacao.last_page <= 1) return null;

    const { current_page, last_page, from, to, total } = paginacao;

    function irPara(page) {
        if (page < 1 || page > last_page || page === current_page) return;
        const params = new URLSearchParams(window.location.search);
        params.set('page', page);
        router.get(`${window.location.pathname}?${params.toString()}`, {}, {
            preserveState: true,
            preserveScroll: false,
        });
    }

    const delta = 2;
    const range = [];
    for (let i = Math.max(1, current_page - delta); i <= Math.min(last_page, current_page + delta); i++) {
        range.push(i);
    }

    const pages = [];
    if (range[0] > 1) pages.push(1);
    if (range[0] > 2) pages.push('...');
    pages.push(...range);
    if (range[range.length - 1] < last_page - 1) pages.push('...');
    if (range[range.length - 1] < last_page) pages.push(last_page);

    return (
        <div className="flex items-center justify-between mt-6 px-1">
            <p className="text-sm text-gray-500">
                {from}–{to} de {total} registro{total !== 1 ? 's' : ''}
            </p>
            <div className="flex items-center gap-1">
                <button
                    onClick={() => irPara(current_page - 1)}
                    disabled={current_page === 1}
                    className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                {pages.map((p, i) =>
                    p === '...'
                        ? <span key={`e${i}`} className="px-2 py-2 text-gray-400 text-sm">…</span>
                        : <button
                            key={p}
                            onClick={() => irPara(p)}
                            className={`w-8 h-8 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                                p === current_page
                                    ? 'bg-[#0C4773] text-white'
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            {p}
                          </button>
                )}
                <button
                    onClick={() => irPara(current_page + 1)}
                    disabled={current_page === last_page}
                    className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
