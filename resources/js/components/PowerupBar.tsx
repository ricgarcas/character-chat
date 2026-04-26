import { useState, type ReactNode } from 'react';
import { useT } from '@/lib/i18n';

export interface Powerup {
    key: string;
    icon: ReactNode;
    label: string;
    description: string;
    requiresPhoto: boolean;
    prompt: string;
}

interface Props {
    powerups: Powerup[];
    accent: string;
    accentInk?: string;
    hasPhoto: boolean;
    disabled?: boolean;
    onLaunch: (p: Powerup) => void;
}

export default function PowerupBar({ powerups, accent, accentInk = 'var(--ink)', hasPhoto, disabled, onLaunch }: Props) {
    const [claimedKey, setClaimedKey] = useState<string | null>(null);
    const t = useT();

    const handleClick = (p: Powerup) => {
        setClaimedKey(p.key);
        setTimeout(() => setClaimedKey(null), 500);
        onLaunch(p);
    };

    return (
        <div className="absolute bottom-3 right-3 z-20 flex flex-col gap-2">
            {powerups.map((p, i) => {
                const needsPhoto = p.requiresPhoto && !hasPhoto;
                const label = needsPhoto ? `${p.label} (${t('chat.show.needs_photo')})` : p.label;
                return (
                    <button
                        key={p.key}
                        type="button"
                        onClick={() => handleClick(p)}
                        disabled={disabled}
                        aria-label={label}
                        style={
                            {
                                '--pu-accent': accent,
                                '--pu-accent-ink': accentInk,
                                animationDelay: `${i * 0.18}s`,
                                imageRendering: 'pixelated',
                            } as React.CSSProperties
                        }
                        className={`btn-powerup group relative flex h-12 w-12 items-center justify-center bg-[var(--bg-deep)] not-disabled:hover:bg-[var(--pu-accent)] disabled:opacity-50 ${
                            claimedKey === p.key ? 'btn-powerup--claimed' : ''
                        }`}
                    >
                        <span className="powerup-icon flex h-7 w-7 items-center justify-center text-[var(--ink)] not-disabled:group-hover:text-[var(--pu-accent-ink)]">
                            {p.icon}
                        </span>
                        <span
                            className="pointer-events-none absolute top-1/2 right-full mr-2 -translate-y-1/2 translate-x-1 border-2 border-[var(--ink)] bg-[var(--bg)] px-2 py-1 font-display text-[9px] whitespace-nowrap text-[var(--ink)] uppercase tracking-widest opacity-0 transition-all duration-100 not-disabled:group-hover:translate-x-0 not-disabled:group-hover:opacity-100"
                            style={{ boxShadow: `2px 2px 0 0 ${accent}` }}
                        >
                            {label}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
