import { X } from '@/components/icons/retro';
import { Download as DownloadSimple } from 'pixelarticons/react';

interface Props {
    wrapperSrc: string;
    overlay: { left: string; top: string; width: string; height: string };
    aspectRatio: string;
    title: string;
    imageUrl: string;
    accent: string;
    bordered?: boolean;
    onClose: () => void;
}

export default function EaselModal({
    wrapperSrc,
    overlay,
    aspectRatio,
    title,
    imageUrl,
    accent,
    bordered = true,
    onClose,
}: Props) {
    return (
        <div
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="w-full max-w-3xl bg-[var(--bg-deep)]"
                style={{
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
                    <span className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--bg)]">
                        ★ {title} ★
                    </span>
                    <div className="flex items-center gap-3">
                        <a
                            href={imageUrl}
                            download
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 font-display text-[9px] uppercase tracking-widest text-[var(--bg)]"
                        >
                            <DownloadSimple className="h-3 w-3" />
                            Bajar
                        </a>
                        <button
                            onClick={onClose}
                            aria-label="close"
                            className="text-[var(--bg)] transition hover:scale-110"
                        >
                            <X width={14} height={14} />
                        </button>
                    </div>
                </div>

                <div className="p-4">
                    <div
                        className="relative w-full overflow-hidden border-2 border-[var(--ink)]"
                        style={{
                            boxShadow: '4px 4px 0 0 var(--ink)',
                            aspectRatio,
                            imageRendering: 'pixelated',
                        }}
                    >
                        <img
                            src={wrapperSrc}
                            alt=""
                            aria-hidden
                            className="absolute inset-0 h-full w-full object-cover"
                            style={{ imageRendering: 'pixelated' }}
                        />
                        <div
                            className={`absolute ${bordered ? 'border-2 border-[var(--ink)]' : ''}`}
                            style={{ ...overlay, imageRendering: 'pixelated' }}
                        >
                            <img
                                src={imageUrl}
                                alt={title}
                                className="h-full w-full object-cover"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
