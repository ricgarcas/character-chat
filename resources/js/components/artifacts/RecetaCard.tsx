import { useState, type ComponentType } from 'react';
import {
    Copy,
    Check,
    User,
    Clock,
    Notebook,
    Heart,
    Fire,
    ListBox,
} from 'pixelarticons/react';
import type { RecetaArtifact } from '@/types/chat';
import { useT } from '@/lib/i18n';

interface Props {
    data: RecetaArtifact['data'];
    accent: string;
}

export default function RecetaCard({ data, accent }: Props) {
    const [copied, setCopied] = useState(false);
    const t = useT();

    const handleCopyShoppingList = async () => {
        const list = data.ingredients.map((i) => `• ${i.amount} ${i.name}`).join('\n');
        await navigator.clipboard.writeText(`${data.title}\n\n${list}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
    };

    return (
        <div
            className="flex w-full flex-col bg-[#f5ecd9] text-[#2b1d0e]"
            style={{
                maxHeight: '85vh',
                border: '3px solid var(--ink)',
                boxShadow: `8px 8px 0 0 ${accent}`,
                imageRendering: 'pixelated',
            }}
        >
            <div
                className="flex items-center justify-between border-b-2 border-[var(--ink)] px-3 py-1.5"
                style={{ backgroundColor: accent }}
            >
                <span className="flex items-center gap-2 font-display text-[10px] uppercase tracking-widest text-[var(--bg)]">
                    <Notebook width={14} height={14} />
                    {t('receta.title')}
                </span>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
                <h3 className="font-display text-lg leading-tight font-bold uppercase tracking-wide">
                    {data.title}
                </h3>
                <div className="mt-2 flex flex-wrap items-center gap-3 font-body text-xs">
                    <span className="inline-flex items-center gap-1 opacity-75">
                        <User width={12} height={12} />
                        {data.servings}
                    </span>
                    <span className="inline-flex items-center gap-1 opacity-75">
                        <Clock width={12} height={12} />
                        {data.time}
                    </span>
                </div>

                <div className="my-4 h-px w-full" style={{ background: 'repeating-linear-gradient(90deg, var(--ink) 0 4px, transparent 4px 8px)' }} />

                <SectionHeader label={t('receta.ingredients')} accent={accent} icon={ListBox} />
                <ul className="mt-2 grid grid-cols-1 gap-x-4 gap-y-1 sm:grid-cols-2">
                    {data.ingredients.map((ing, i) => (
                        <li key={i} className="font-body text-sm leading-snug">
                            <span className="font-display text-[10px] uppercase tracking-wider opacity-50">
                                {ing.amount}
                            </span>{' '}
                            <span>{ing.name}</span>
                        </li>
                    ))}
                </ul>

                <div className="my-4 h-px w-full" style={{ background: 'repeating-linear-gradient(90deg, var(--ink) 0 4px, transparent 4px 8px)' }} />

                <SectionHeader label={t('receta.steps')} accent={accent} icon={Fire} />
                <ol className="mt-2 space-y-2">
                    {data.steps.map((step, i) => (
                        <li key={i} className="flex gap-3 font-body text-sm leading-snug">
                            <span
                                className="flex h-6 w-6 shrink-0 items-center justify-center border-2 border-[var(--ink)] font-display text-[10px] font-bold"
                                style={{ backgroundColor: accent, color: 'var(--bg)' }}
                            >
                                {i + 1}
                            </span>
                            <span className="pt-0.5">{step}</span>
                        </li>
                    ))}
                </ol>

                <div className="my-4 h-px w-full" style={{ background: 'repeating-linear-gradient(90deg, var(--ink) 0 4px, transparent 4px 8px)' }} />

                <div
                    className="border-l-4 px-3 py-2"
                    style={{ borderColor: accent, backgroundColor: 'rgba(0,0,0,0.04)' }}
                >
                    <p
                        className="inline-flex items-center gap-1.5 font-display text-[10px] font-bold uppercase tracking-widest"
                        style={{ color: accent }}
                    >
                        <Heart width={12} height={12} />
                        {t('receta.note')}
                    </p>
                    <p className="mt-1 font-body text-sm italic leading-snug">
                        {data.frida_note}
                    </p>
                </div>

                <button
                    onClick={handleCopyShoppingList}
                    className="mt-5 inline-flex items-center gap-2 border-2 border-[var(--ink)] px-3 py-1.5 font-display text-[10px] font-bold uppercase tracking-widest transition hover:translate-y-[-1px]"
                    style={{
                        backgroundColor: copied ? accent : 'var(--bg-deep)',
                        color: copied ? 'var(--bg)' : 'var(--ink)',
                        boxShadow: `3px 3px 0 0 ${accent}`,
                    }}
                >
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? t('receta.copied') : t('receta.shopping_list')}
                </button>
            </div>
        </div>
    );
}

type IconCmp = ComponentType<{ width?: number | string; height?: number | string; className?: string }>;

function SectionHeader({ label, accent, icon: Icon }: { label: string; accent: string; icon: IconCmp }) {
    return (
        <div className="flex items-center gap-2">
            <span
                className="flex h-5 w-5 items-center justify-center border-2 border-[var(--ink)]"
                style={{ backgroundColor: accent }}
            >
                <Icon width={10} height={10} className="text-[var(--bg)]" />
            </span>
            <span
                className="font-display text-[11px] font-bold uppercase tracking-[0.2em]"
                style={{ color: accent }}
            >
                {label}
            </span>
        </div>
    );
}
