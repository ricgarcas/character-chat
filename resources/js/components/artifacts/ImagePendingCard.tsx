import type { ImagePendingArtifact } from '@/types/chat';
import { useT } from '@/lib/i18n';

interface Props {
    data: ImagePendingArtifact['data'];
    accent: string;
}

export default function ImagePendingCard({ data, accent }: Props) {
    const t = useT();
    const hasError = !!data.error;
    const badge = hasError ? '⚠ ERROR' : t('chat.show.painting_badge');

    return (
        <div
            className="inline-flex items-center gap-2 border-2 border-[var(--ink)] px-3 py-1.5"
            style={{
                backgroundColor: accent,
                boxShadow: `3px 3px 0 0 var(--ink)`,
                imageRendering: 'pixelated',
            }}
        >
            <span className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--bg)]">
                {badge}
            </span>
            {hasError && data.error && (
                <span className="font-body text-xs text-[var(--bg)]">— {data.error}</span>
            )}
        </div>
    );
}
