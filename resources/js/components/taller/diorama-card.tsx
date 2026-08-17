import type { RefObject } from 'react';
import { EMOTE_STICKER } from '@/lib/emotes';
import type { EmoteKey } from '@/types/chat';

interface Props {
    sceneRef: RefObject<HTMLDivElement | null>;
    escena: string | null;
    emote: EmoteKey;
}

/** La escena Phaser enmarcada como pieza pegada en el cuaderno. */
export default function DioramaCard({ sceneRef, escena, emote }: Props) {
    const sticker = EMOTE_STICKER[emote];

    return (
        <div>
            <div className="sticker-tape relative -rotate-[1.5deg] overflow-hidden rounded-[14px] shadow-[var(--shadow-diorama)]">
                <div className="relative aspect-[2/3] w-full">
                    <div ref={sceneRef} className="absolute inset-0" />
                </div>

                {/* La acotación entra a la escena como subtítulo, sobre un velo que la hace legible. */}
                {escena && (
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[rgba(20,12,2,0.82)] via-[rgba(20,12,2,0.55)] to-transparent px-3 pt-8 pb-3">
                        <p className="font-body text-[13px] leading-snug italic text-[#ffeacd] [text-shadow:0_1px_2px_rgba(0,0,0,0.5)]">
                            {escena}
                        </p>
                    </div>
                )}
            </div>

            <span
                key={emote}
                className="mt-3 ml-1 inline-flex animate-[emote-pop_180ms_ease-out] items-center gap-1 rounded-full bg-[var(--paper-deep)] px-2.5 py-1 font-display text-[11px] font-extrabold text-[var(--ink-soft)]"
            >
                <span aria-hidden="true">{sticker.emoji}</span>
                {sticker.label}
            </span>
        </div>
    );
}
