import { Sparkles, Zap, Lock } from 'pixelarticons/react';
import type { ReactNode } from 'react';
import PixelAvatar from '@/components/pixel-avatar';
import { accentFor } from '@/lib/accents';
import { characterMeta, roleIcon, superpowerIcon } from '@/lib/character-meta';
import type { Character } from '@/types/chat';

interface CardFrameProps {
    accent: string;
    role: string;
    roleIconEl: ReactNode;
    highlighted: boolean;
    heightClass: string;
    children: ReactNode;
}

/** Marco pixelado compartido: borde grueso, sombra dura, banda de rol arriba. */
function CardFrame({ accent, role, roleIconEl, highlighted, heightClass, children }: CardFrameProps) {
    return (
        <div
            className={`relative flex ${heightClass} flex-col overflow-hidden bg-[var(--bg-deep)]`}
            style={{
                border: '3px solid var(--ink)',
                boxShadow: highlighted
                    ? `0 0 0 2px var(--bg), 8px 8px 0 0 ${accent}`
                    : `0 0 0 2px var(--bg), 4px 4px 0 0 ${accent}`,
            }}
        >
            <div
                className="flex items-center justify-center border-b-2 border-[var(--ink)] px-3 py-3"
                style={{ backgroundColor: accent }}
            >
                <span
                    className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-[0.3em]"
                    style={{ color: 'var(--bg)', textShadow: '1px 1px 0 var(--pixel-shadow)' }}
                >
                    {roleIconEl}
                    {role}
                    {roleIconEl}
                </span>
            </div>
            {children}
        </div>
    );
}

interface CharacterCardProps {
    character: Pick<Character, 'slug' | 'name' | 'superpowers'>;
    /** Realza la carta: sombra mayor, glow radial sobre el arte. */
    highlighted?: boolean;
    /** Banda inferior de llamada a la acción. `null` la oculta. */
    footerLabel?: string | null;
    heightClass?: string;
}

export function CharacterCard({
    character,
    highlighted = false,
    footerLabel = null,
    heightClass = 'h-[620px]',
}: CharacterCardProps) {
    const accent = accentFor(character.slug);
    const RoleIcon = roleIcon[character.slug] ?? Sparkles;
    const role = characterMeta[character.slug]?.role ?? '';

    return (
        <CardFrame
            accent={accent}
            role={role}
            roleIconEl={<RoleIcon width={16} height={16} />}
            highlighted={highlighted}
            heightClass={heightClass}
        >
            {/* Ventana de arte: background del personaje + avatar */}
            <div
                className="relative flex flex-1 items-end justify-center overflow-hidden border-b-2 border-[var(--ink)]"
                style={{
                    backgroundImage: `url(/backgrounds/${character.slug}.png)`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    imageRendering: 'pixelated',
                }}
            >
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[var(--bg-deep)] via-black/30 to-transparent" />
                {highlighted && (
                    <div
                        className="animate-gentle-glow pointer-events-none absolute inset-0 z-10 mix-blend-screen"
                        style={{
                            background: 'radial-gradient(circle at 50% 40%, rgba(255,255,255,0.15), transparent 70%)',
                        }}
                    />
                )}
                <div className="relative z-0">
                    <PixelAvatar character={character} emote="neutral" size={300} />
                </div>
            </div>

            {/* Bento: nombre + superpoderes + CTA */}
            <div className="space-y-1.5 bg-[var(--bg-deep)] p-2">
                <div className="border-2 border-[var(--ink)] bg-[var(--bg)] px-2.5 py-3">
                    <h2
                        className="text-center font-display text-[14px] font-bold uppercase tracking-wider text-[var(--ink)]"
                        style={{ textShadow: '2px 2px 0 var(--pixel-shadow)' }}
                    >
                        {character.name}
                    </h2>
                </div>

                <div className="border-2 border-[var(--ink)] bg-[var(--bg)]">
                    <div
                        className="flex items-center justify-center gap-2 border-b-2 border-[var(--ink)] px-2 py-1 text-center font-display text-[9px] font-bold uppercase tracking-[0.25em]"
                        style={{ backgroundColor: accent, color: 'var(--bg)' }}
                    >
                        <Zap width={12} height={12} />
                        SUPERPODERES
                        <Zap width={12} height={12} />
                    </div>
                    <div className="flex flex-col gap-1.5 p-2">
                        {character.superpowers?.slice(0, 3).map((sp) => {
                            const Icon = superpowerIcon[sp.key];

                            return (
                                <div key={sp.key} className="flex items-center gap-2">
                                    {Icon ? (
                                        <Icon width={16} height={16} style={{ color: accent }} />
                                    ) : (
                                        <span className="text-[14px]">{sp.icon}</span>
                                    )}
                                    <span className="truncate font-display text-[10px] font-bold uppercase tracking-wider text-[var(--ink)]">
                                        {sp.name}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {footerLabel && (
                    <div
                        className="animate-pixel-blink flex items-center justify-center border-2 border-[var(--ink)] px-2 py-2 font-display text-[11px] font-bold uppercase tracking-widest"
                        style={{ backgroundColor: accent, color: 'var(--bg)', boxShadow: '2px 2px 0 0 var(--ink)' }}
                    >
                        {footerLabel}
                    </div>
                )}
            </div>
        </CardFrame>
    );
}

interface LockedCharacterCardProps {
    name: string;
    role: string;
    teaser: string;
    footerLabel: string;
    heightClass?: string;
}

/**
 * Carta de una figura aún no construida. No hay avatares ni background para
 * estos slugs, así que dibuja una silueta en vez de intentar cargar un PNG.
 */
export function LockedCharacterCard({
    name,
    role,
    teaser,
    footerLabel,
    heightClass = 'h-[620px]',
}: LockedCharacterCardProps) {
    return (
        <CardFrame
            accent="var(--ink-faint)"
            role={role}
            roleIconEl={<Lock width={16} height={16} />}
            highlighted={false}
            heightClass={heightClass}
        >
            <div
                className="relative flex flex-1 items-center justify-center overflow-hidden border-b-2 border-[var(--ink)] bg-[var(--bg-tile)]"
                aria-hidden
            >
                <span
                    className="font-display text-[96px] leading-none text-[var(--ink-faint)]"
                    style={{ textShadow: '4px 4px 0 var(--pixel-shadow)' }}
                >
                    ?
                </span>
            </div>

            <div className="space-y-1.5 bg-[var(--bg-deep)] p-2">
                <div className="border-2 border-[var(--ink-faint)] bg-[var(--bg)] px-2.5 py-3">
                    <h2 className="text-center font-display text-[14px] font-bold uppercase tracking-wider text-[var(--ink-faint)]">
                        {name}
                    </h2>
                </div>
                <div className="border-2 border-[var(--ink-faint)] bg-[var(--bg)] px-2.5 py-3">
                    <p className="text-center font-body text-base text-[var(--ink-faint)]">{teaser}</p>
                </div>
                <div className="flex items-center justify-center border-2 border-[var(--ink-faint)] px-2 py-2 font-display text-[11px] font-bold uppercase tracking-widest text-[var(--ink-faint)]">
                    {footerLabel}
                </div>
            </div>
        </CardFrame>
    );
}
