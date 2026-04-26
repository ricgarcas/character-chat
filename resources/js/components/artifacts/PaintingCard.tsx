import { useState } from 'react';
import { Eye } from 'pixelarticons/react';
import type { PaintingArtifact } from '@/types/chat';
import { useT } from '@/lib/i18n';
import EaselModal from './EaselModal';
import { getEasel } from './easels';

interface Props {
    data: PaintingArtifact['data'];
    accent: string;
    characterSlug?: string;
}

export default function PaintingCard({ data, accent, characterSlug = '' }: Props) {
    const [open, setOpen] = useState(false);
    const t = useT();
    const easel = getEasel(characterSlug);

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
                <Eye className="h-3 w-3 text-[var(--bg)]" />
                <span className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--bg)]">
                    {t('chat.show.reveal_painting')}
                </span>
            </button>

            {open && (
                <EaselModal
                    wrapperSrc={easel.wrapperSrc}
                    aspectRatio={easel.aspectRatio}
                    overlay={easel.overlay}
                    bordered={easel.bordered}
                    title={data.title}
                    imageUrl={data.image_url}
                    accent={accent}
                    onClose={() => setOpen(false)}
                />
            )}
        </>
    );
}
