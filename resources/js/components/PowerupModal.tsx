import { useRef, type ReactNode } from 'react';
import { Check, Camera } from 'pixelarticons/react';
import { X } from '@/components/icons/retro';
import { useT } from '@/lib/i18n';

interface Props {
    title: string;
    description: string;
    icon: ReactNode;
    accent: string;
    requiresPhoto?: boolean;
    photoPreview?: string | null;
    onSelectPhoto?: (file: File | null) => void;
    onClearPhoto?: () => void;
    onClose: () => void;
    onAccept: () => void;
}

export default function PowerupModal({
    title,
    description,
    icon,
    accent,
    requiresPhoto = false,
    photoPreview = null,
    onSelectPhoto,
    onClearPhoto,
    onClose,
    onAccept,
}: Props) {
    const fileRef = useRef<HTMLInputElement>(null);
    const photoBlocking = requiresPhoto && !photoPreview;
    const t = useT();

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div
                className="w-full max-w-sm bg-[var(--bg-deep)]"
                style={{
                    border: '3px solid var(--ink)',
                    boxShadow: `8px 8px 0 0 ${accent}`,
                    imageRendering: 'pixelated',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Title bar */}
                <div
                    className="flex items-center justify-between border-b-2 border-[var(--ink)] px-3 py-1.5"
                    style={{ backgroundColor: accent }}
                >
                    <span className="font-display text-[10px] uppercase font-bold tracking-[0.2em] text-[var(--bg)]">
                        {t('powerup.modal.title')}
                    </span>
                    <button
                        onClick={onClose}
                        aria-label={t('powerup.modal.close')}
                        className="text-[var(--bg)] transition hover:scale-110"
                    >
                        <X width={14} height={14} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex flex-col items-center gap-3 px-5 py-5">
                    <div
                        className="flex h-16 w-16 items-center justify-center border-2 border-[var(--ink)]"
                        style={{
                            backgroundColor: 'var(--bg-tile)',
                            boxShadow: '3px 3px 0 0 var(--pixel-shadow)',
                        }}
                    >
                        <span className="powerup-icon flex h-9 w-9 items-center justify-center text-[var(--ink)]">
                            {icon}
                        </span>
                    </div>

                    <h2 className="text-center font-display text-base uppercase font-bold tracking-wide text-[var(--ink)]">
                        {title}
                    </h2>

                    <p className="text-center font-body text-sm leading-snug text-[var(--ink)]">
                        {description}
                    </p>

                    {requiresPhoto && (
                        <div className="mt-1 w-full">
                            <input
                                ref={fileRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => onSelectPhoto?.(e.target.files?.[0] ?? null)}
                            />
                            {photoPreview ? (
                                <div className="flex items-center gap-3 border-2 border-[var(--ink)] bg-[var(--bg)] p-2">
                                    <img
                                        src={photoPreview}
                                        alt="preview"
                                        className="h-14 w-14 flex-shrink-0 border-2 border-[var(--ink)] object-cover"
                                        style={{ boxShadow: '2px 2px 0 0 var(--ink)' }}
                                    />
                                    <div className="flex flex-1 flex-col gap-1">
                                        <span className="font-display text-[9px] uppercase tracking-widest text-[var(--ink-faint)]">
                                            {t('powerup.modal.photo_ready')}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                onClearPhoto?.();
                                                if (fileRef.current) fileRef.current.value = '';
                                            }}
                                            className="self-start font-display text-[9px] uppercase tracking-widest text-[var(--ink)] underline hover:text-[var(--ink-faint)]"
                                        >
                                            {t('powerup.modal.change_photo')}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => fileRef.current?.click()}
                                    className="flex w-full items-center justify-center gap-2 border-2 border-dashed border-[var(--ink)] bg-[var(--bg)] py-3 font-display text-[10px] uppercase tracking-widest text-[var(--ink)] transition hover:bg-[var(--bg-tile)]"
                                    style={{ boxShadow: `3px 3px 0 0 ${accent}` }}
                                >
                                    <Camera width={14} height={14} />
                                    {t('powerup.modal.upload_photo')}
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Buttons */}
                <div className="flex border-t-2 border-[var(--ink)]">
                    <button
                        onClick={onClose}
                        className="flex flex-1 items-center justify-center gap-1.5 border-r border-[var(--ink)] bg-[var(--bg)] py-2.5 font-display text-[10px] uppercase tracking-widest text-[var(--ink-faint)] transition hover:bg-[var(--bg-tile)] hover:text-[var(--ink)]"
                    >
                        <X width={12} height={12} />
                        {t('powerup.modal.cancel')}
                    </button>
                    <button
                        onClick={onAccept}
                        disabled={photoBlocking}
                        className="flex flex-1 items-center justify-center gap-1.5 py-2.5 font-display text-[10px] uppercase font-bold tracking-widest transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
                        style={{ backgroundColor: accent, color: 'var(--bg)' }}
                    >
                        <Check width={12} height={12} />
                        {t('powerup.modal.activate')}
                    </button>
                </div>
            </div>
        </div>
    );
}
