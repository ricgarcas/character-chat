import { Head, Link } from '@inertiajs/react';
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
                <h1 className="font-display text-lg uppercase tracking-widest text-[var(--ink)]">
                    {t('portfolio.title')}
                </h1>
                <p className="mt-1 font-body text-sm text-[var(--ink)]/70">{t('portfolio.subtitle')}</p>

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
                    <div
                        className="mt-10 border-2 border-[var(--ink)] bg-[var(--bg-deep)] p-10 text-center"
                        style={{ boxShadow: '4px 4px 0 0 var(--ink)' }}
                    >
                        <p className="font-display text-sm uppercase tracking-widest text-[var(--ink)]">
                            {t('portfolio.empty_title')}
                        </p>
                        <p className="mt-2 font-body text-sm text-[var(--ink)]/70">{t('portfolio.empty_body')}</p>
                        <Link
                            href={chatIndex.url()}
                            className="mt-6 inline-block border-2 border-[var(--ink)] bg-[var(--bg)] px-4 py-2 font-display text-[10px] uppercase tracking-widest text-[var(--ink)] transition hover:translate-y-[-1px]"
                            style={{ boxShadow: '3px 3px 0 0 var(--ink)' }}
                        >
                            {t('portfolio.empty_cta')} →
                        </Link>
                    </div>
                ) : (
                    <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                        {visible.map((a) => (
                            <div key={a.id} className="min-w-0">
                                <ArtifactByType artifact={a} />
                                <p className="mt-1 font-display text-[9px] uppercase tracking-widest text-[var(--ink)]/50">
                                    {a.character.name} · {a.created_at}
                                </p>
                            </div>
                        ))}
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
            className={`border-2 border-[var(--ink)] px-3 py-1 font-display text-[9px] uppercase tracking-widest transition ${
                active ? 'bg-[var(--ink)] text-[var(--bg)]' : 'bg-[var(--bg-deep)] text-[var(--ink)] hover:translate-y-[-1px]'
            }`}
            style={{ boxShadow: active ? 'none' : `2px 2px 0 0 ${accent}` }}
        >
            {children}
        </button>
    );
}
