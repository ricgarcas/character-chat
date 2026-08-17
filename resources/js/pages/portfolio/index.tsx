import { Head, Link } from '@inertiajs/react';
import { Plus } from '@phosphor-icons/react';
import { useMemo, useState, type ReactNode } from 'react';
import InfoArtifactRenderer, { isInfoType, type InfoArtifact } from '@/components/artifacts/InfoArtifactRenderer';
import PortraitCard from '@/components/artifacts/PortraitCard';
import PaintingCard from '@/components/artifacts/PaintingCard';
import type { PaintingArtifact, PortraitArtifact } from '@/types/chat';
import { accentFor } from '@/lib/accents';
import { useT } from '@/lib/i18n';
import { index as chatIndex } from '@/routes/chat';

interface PortfolioArtifact {
    id: number;
    type: string;
    title: string | null;
    data: Record<string, unknown>;
    created_at: string;
    character: { slug: string; name: string };
}

export default function PortfolioIndex({ artifacts }: { artifacts: PortfolioArtifact[] }) {
    const t = useT();
    const [filter, setFilter] = useState<string>('all');

    const characters = useMemo(() => {
        const seen = new Map<string, string>();
        artifacts.forEach((a) => seen.set(a.character.slug, a.character.name));
        return [...seen.entries()];
    }, [artifacts]);

    const visible = filter === 'all' ? artifacts : artifacts.filter((a) => a.character.slug === filter);

    return (
        <>
            <Head title={t('portfolio.title')} />
            <div className="mx-auto max-w-5xl px-4 py-8">
                <h1 className="font-display text-3xl font-black text-[var(--ink)]">
                    {t('portfolio.title')}
                    {artifacts.length > 0 && (
                        <span className="text-[var(--ink-soft)]">
                            {' '}
                            — {artifacts.length} {artifacts.length === 1 ? 'pieza' : 'piezas'}
                        </span>
                    )}
                </h1>
                <p className="mt-1 font-body text-base text-[var(--ink-soft)]">{t('portfolio.subtitle')}</p>

                {characters.length > 1 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                        <FilterChip active={filter === 'all'} accent="var(--ink)" onClick={() => setFilter('all')}>
                            {t('portfolio.filter_all')}
                        </FilterChip>
                        {characters.map(([slug, name]) => (
                            <FilterChip key={slug} active={filter === slug} accent={accentFor(slug)} onClick={() => setFilter(slug)}>
                                {name}
                            </FilterChip>
                        ))}
                    </div>
                )}

                {visible.length === 0 ? (
                    <div className="mt-10 rounded-2xl bg-[var(--surface)] p-10 text-center shadow-[var(--shadow-sticker)]">
                        <p className="font-display text-xl font-black text-[var(--ink)]">
                            {t('portfolio.empty_title')}
                        </p>
                        <p className="mt-2 font-body text-sm text-[var(--ink-soft)]">{t('portfolio.empty_body')}</p>
                        <Link href={chatIndex.url()} className="btn-candy mt-6 inline-block px-5 py-2.5 text-sm">
                            {t('portfolio.empty_cta')}
                        </Link>
                    </div>
                ) : (
                    <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-9 sm:grid-cols-2">
                        {visible.map((a, index) => (
                            <div
                                key={a.id}
                                className={`min-w-0 rounded-[12px] bg-[var(--surface)] p-2.5 shadow-[var(--shadow-sticker)] ${
                                    index % 2 === 0 ? 'rotate-1' : '-rotate-1'
                                }`}
                            >
                                <ArtifactByType artifact={a} />
                                <p className="mt-2 px-1 font-body text-xs text-[var(--ink-soft)]">
                                    con {a.character.name} · {a.created_at}
                                </p>
                            </div>
                        ))}

                        <Link
                            href={chatIndex.url()}
                            className="flex min-h-40 flex-col items-center justify-center gap-1.5 rounded-[12px] border-2 border-dashed border-[var(--line)] font-display text-sm font-extrabold text-[var(--ink-faint)] transition hover:border-[var(--candy)] hover:text-[var(--candy-deep)]"
                        >
                            <Plus size={22} weight="bold" />
                            siguiente pieza
                        </Link>
                    </div>
                )}
            </div>
        </>
    );
}

function ArtifactByType({ artifact }: { artifact: PortfolioArtifact }): ReactNode {
    const accent = accentFor(artifact.character.slug);

    if (isInfoType(artifact.type)) {
        const payload = { artifact_type: artifact.type, data: artifact.data } as InfoArtifact;
        return <InfoArtifactRenderer artifact={payload} accent={accent} />;
    }
    if (artifact.type === 'portrait') {
        return <PortraitCard data={artifact.data as PortraitArtifact['data']} accent={accent} characterSlug={artifact.character.slug} />;
    }
    if (artifact.type === 'painting') {
        return <PaintingCard data={artifact.data as PaintingArtifact['data']} accent={accent} characterSlug={artifact.character.slug} />;
    }
    return null;
}

function FilterChip({ active, accent, onClick, children }: {
    active: boolean; accent: string; onClick: () => void; children: ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`rounded-full px-4 py-1.5 font-display text-xs font-extrabold transition ${
                active ? 'bg-[var(--ink)] text-[var(--paper)]' : 'btn-soft'
            }`}
            style={active ? undefined : { color: accent }}
        >
            {children}
        </button>
    );
}
