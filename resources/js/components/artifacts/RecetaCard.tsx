import { useState } from 'react';
import { Copy, Check } from 'pixelarticons/react';
import { Notebook, X } from '@/components/icons/retro';
import type { RecetaArtifact } from '@/types/chat';
import { useT } from '@/lib/i18n';

interface Props {
    data: RecetaArtifact['data'];
    accent: string;
}

export default function RecetaCard({ data, accent }: Props) {
    const [open, setOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const t = useT();

    const handleCopyShoppingList = async () => {
        const list = data.ingredients.map((i) => `• ${i.amount} ${i.name}`).join('\n');
        await navigator.clipboard.writeText(`${data.title}\n\n${list}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-2 border-2 border-[var(--ink)] px-3 py-1.5 transition hover:translate-y-[-1px]"
                style={{
                    backgroundColor: accent,
                    boxShadow: `3px 3px 0 0 var(--ink)`,
                    imageRendering: 'pixelated',
                }}
            >
                <Notebook width={14} height={14} className="text-[var(--bg)]" />
                <span className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--bg)]">
                    {t('chat.show.view_receta')}
                </span>
            </button>

            {open && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
                    onClick={() => setOpen(false)}
                >
                    <div
                        className="flex w-full max-w-lg flex-col bg-[#f5ecd9]"
                        style={{
                            maxHeight: '85vh',
                            border: '3px solid var(--ink)',
                            boxShadow: `8px 8px 0 0 ${accent}`,
                            imageRendering: 'pixelated',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div
                            className="flex items-center justify-between border-b-2 border-[var(--ink)] px-3 py-1.5"
                            style={{ backgroundColor: accent }}
                        >
                            <span className="font-display text-[9px] uppercase tracking-widest text-[var(--bg)]">
                                ★ Recetario de la Casa Azul ★
                            </span>
                            <button
                                onClick={() => setOpen(false)}
                                className="font-display text-[9px] uppercase tracking-widest text-[var(--bg)] flex items-center gap-1 hover:opacity-80"
                            >
                                <X width={12} height={12} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-4 py-3 text-[#2b1d0e]">
                            <h3 className="font-display text-lg leading-tight font-bold uppercase tracking-wide">
                                {data.title}
                            </h3>
                            <p className="mt-0.5 font-body text-xs italic opacity-70">
                                {data.servings} · {data.time}
                            </p>

                            <div className="mt-3">
                                <p className="font-display text-[9px] uppercase tracking-widest opacity-60">
                                    Ingredientes
                                </p>
                                <ul className="mt-1 grid grid-cols-1 gap-x-3 gap-y-0.5 sm:grid-cols-2">
                                    {data.ingredients.map((ing, i) => (
                                        <li key={i} className="font-body text-sm leading-snug">
                                            <span className="opacity-60">{ing.amount}</span>{' '}
                                            <span>{ing.name}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="mt-3">
                                <p className="font-display text-[9px] uppercase tracking-widest opacity-60">
                                    Cómo se hace
                                </p>
                                <ol className="mt-1 space-y-1">
                                    {data.steps.map((step, i) => (
                                        <li key={i} className="font-body text-sm leading-snug">
                                            <span className="font-display font-bold opacity-70">{i + 1}.</span>{' '}
                                            {step}
                                        </li>
                                    ))}
                                </ol>
                            </div>

                            <div className="mt-3 border-l-2 border-[var(--ink)] pl-3">
                                <p className="font-display text-[9px] uppercase tracking-widest opacity-60">
                                    Nota de Frida
                                </p>
                                <p className="mt-0.5 font-body text-sm italic leading-snug">
                                    {data.frida_note}
                                </p>
                            </div>

                            <button
                                onClick={handleCopyShoppingList}
                                className="mt-4 flex items-center gap-1.5 border-2 border-[var(--ink)] bg-[var(--bg-deep)] px-2.5 py-1 font-display text-[9px] uppercase tracking-widest text-[var(--ink)] transition hover:translate-y-[-1px]"
                                style={{ boxShadow: '2px 2px 0 0 var(--ink)' }}
                            >
                                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                {copied ? 'Copiado' : 'Lista de compras'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
