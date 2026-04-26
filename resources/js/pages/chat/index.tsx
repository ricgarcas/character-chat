import { Head, router } from '@inertiajs/react';
import { create } from '@/routes/chat';
import type { Character } from '@/types';
import PixelAvatar from '@/components/pixel-avatar';
import { useT } from '@/lib/i18n';
import { sfx } from '@/lib/sfx';
import { LocaleToggle } from '@/components/locale-toggle';
import Balatro from '@/components/Balatro';
import { useEffect, useRef, useState, type ComponentType, type ReactNode } from 'react';
import {
    ArrowLeft,
    ArrowRight,
    Eye,
    Moon as MoonStars,
    ColorsSwatch as Palette,
    Home as House,
    Scale as Scales,
    Link as LinkSimple,
    BookOpen,
    Lightbulb as Brain,
    Zap,
    Gamepad,
    Sparkles,
    Potion as CookingPot,
    Shield,
} from 'pixelarticons/react';
import {
    Notebook,
    Key,
    VenusSymbol as GenderFemale,
    PaintBrush,
    Egg,
} from '@/components/icons/retro';

type PhosphorIcon = ComponentType<{ width?: number | string; height?: number | string; className?: string; style?: React.CSSProperties }>;

const superpowerIcon: Record<string, PhosphorIcon> = {
    paranoid_critical: Brain,
    pintar_surreal: Egg,
    retrato_dali: PaintBrush,
    artwork_analysis: Palette,
    visual_diary: Notebook,
    casa_azul_tour: House,
    coyoacan_recipe: CookingPot,
    face_reading: Eye,
    frida_portrait: PaintBrush,
    dream_analysis: MoonStars,
    defenses: Shield,
    unconscious_face: Eye,
    existential_analysis: Key,
    feminist_critique: GenderFemale,
    philosophical_debate: Scales,
    dream_analysis: MoonStars,
    free_association: LinkSimple,
    psychoanalytic_library: BookOpen,
};

const roleIcon: Record<string, PhosphorIcon> = {
    dali: Eye,
    frida: Palette,
    beauvoir: Scales,
    freud: Brain,
};

const characterAccent: Record<string, string> = {
    dali: 'var(--accent-dali)',
    freud: 'var(--accent-freud)',
    frida: 'var(--accent-frida)',
    beauvoir: 'var(--accent-beauvoir)',
};

interface CardMeta {
    role: string;
    quote: string;
}

const characterMeta: Record<string, CardMeta> = {
    dali: {
        role: 'SURREALIST',
        quote: '"La única diferencia entre yo y un loco es que yo no estoy loco."',
    },
    frida: {
        role: 'PAINTER',
        quote: '"Pies, para qué los quiero si tengo alas para volar."',
    },
    beauvoir: {
        role: 'PHILOSOPHER',
        quote: '"No se nace mujer: se llega a serlo."',
    },
    freud: {
        role: 'ANALYST',
        quote: '"De tus vulnerabilidades saldrá tu fortaleza."',
    },
};

interface TiltCardProps {
    enabled: boolean;
    accent: string;
    glowEnabled?: boolean;
    children: ReactNode;
}

function TiltCard({ enabled, accent, glowEnabled = true, children }: TiltCardProps) {
    const ref = useRef<HTMLDivElement>(null);
    const innerRef = useRef<HTMLDivElement>(null);

    const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!enabled || !ref.current || !innerRef.current) return;
        const rect = ref.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        const rx = (0.5 - y) * 14;
        const ry = (x - 0.5) * 14;
        innerRef.current.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
    };

    const handleLeave = () => {
        if (innerRef.current) innerRef.current.style.transform = '';
    };

    return (
        <div
            ref={ref}
            onMouseMove={handleMove}
            onMouseLeave={handleLeave}
            className="relative"
            style={enabled ? { perspective: '900px' } : undefined}
        >
            {glowEnabled && enabled && (
                <div
                    aria-hidden
                    className="pointer-events-none absolute -inset-6 rounded-md blur-2xl"
                    style={{ backgroundColor: 'rgba(255,255,255,0.18)', zIndex: -1 }}
                />
            )}
            <div
                ref={innerRef}
                className="relative"
                style={{
                    transition: 'transform 200ms ease-out',
                }}
            >
                {children}
            </div>
        </div>
    );
}

export default function ChatIndex({ characters }: { characters: Character[] }) {
    const t = useT();
    const [selected, setSelected] = useState(0);
    const n = characters.length;

    const goPrev = () => {
        sfx.moveBack();
        setSelected((s) => (s - 1 + n) % n);
    };
    const goNext = () => {
        sfx.move();
        setSelected((s) => (s + 1) % n);
    };
    const enter = (slug: string) => {
        sfx.confirm();
        router.visit(create.url(slug));
    };

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                goPrev();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                goNext();
            } else if (e.key === 'Enter') {
                e.preventDefault();
                enter(characters[selected].slug);
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selected, characters]);

    return (
        <>
            <Head title={t('chat.index.title')} />

            <LocaleToggle
                fixed
                accent={characterAccent[characters[selected]?.slug] ?? 'var(--accent-dali)'}
            />

            <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-10">
                <div className="fixed inset-0 z-0">
                    <Balatro
                        spinRotation={0}
                        spinSpeed={2}
                        color1="#bfc7c4"
                        color2="#828587"
                        color3="#0e0e0e"
                        contrast={5.5}
                        lighting={0.4}
                        spinAmount={0.45}
                        pixelFilter={500}
                    />
                    <div className="absolute inset-0 bg-black/80" />
                </div>
                <div className="relative z-10 flex w-full flex-col items-center">
                {/* Title */}
                <div className="relative mb-8 text-center">
                    <h1
                        className="flex items-center justify-center gap-3 font-display text-2xl leading-tight font-extrabold tracking-tight text-[var(--ink)] sm:text-3xl"
                        style={{ textShadow: '3px 3px 0 var(--pixel-shadow)' }}
                    >
                        <Gamepad width={28} height={28} className="text-[var(--accent-dali)]" />
                        {t('chat.index.title')}
                        <Gamepad width={28} height={28} className="text-[var(--accent-dali)]" />
                    </h1>
                </div>

                {/* 3D Carousel stage */}
                <div
                    className="relative h-[660px] w-full max-w-5xl"
                    style={{ perspective: '1400px' }}
                >
                    <div
                        className="relative h-full w-full"
                        style={{ transformStyle: 'preserve-3d' }}
                    >
                        {characters.map((character, i) => {
                            // shortest circular offset (-floor(n/2)..floor(n/2))
                            let off = i - selected;
                            if (off > n / 2) off -= n;
                            if (off < -n / 2) off += n;
                            const abs = Math.abs(off);

                            const isCenter = off === 0;
                            // Hide cards more than 1 away (so we don't render the back-most card)
                            const visible = abs <= 1;

                            const translateX = off * 280;
                            const rotateY = off * -38;
                            const scale = isCenter ? 1 : 0.72;
                            const z = isCenter ? 30 : 20;
                            const opacity = visible ? (isCenter ? 1 : 0.55) : 0;

                            const accent = characterAccent[character.slug] ?? 'var(--ink)';
                            const meta = characterMeta[character.slug];

                            return (
                                <div
                                    key={character.slug}
                                    className="absolute top-1/2 left-1/2 cursor-pointer"
                                    style={{
                                        width: '340px',
                                        marginLeft: '-170px',
                                        marginTop: '-310px',
                                        transform: `translateX(${translateX}px) translateZ(0) rotateY(${rotateY}deg) scale(${scale})`,
                                        transformStyle: 'preserve-3d',
                                        transition: 'transform 220ms steps(8, end), opacity 220ms steps(4, end)',
                                        zIndex: z,
                                        opacity,
                                        pointerEvents: visible ? 'auto' : 'none',
                                    }}
                                    onClick={() => {
                                        if (isCenter) {
                                            enter(character.slug);
                                        } else {
                                            sfx.select();
                                            setSelected(i);
                                        }
                                    }}
                                >
                                    {/* Breathing wrapper — only on center */}
                                    <div className={isCenter ? 'animate-card-breathe' : ''}>
                                    <TiltCard enabled={isCenter} accent={accent} glowEnabled>
                                    {/* TCG Card */}
                                    <div
                                        key={isCenter ? `center-${selected}` : `side-${i}`}
                                        className={`relative flex h-[620px] flex-col bg-[var(--bg-deep)] overflow-hidden ${isCenter ? 'animate-card-land' : ''}`}
                                        style={{
                                            border: '3px solid var(--ink)',
                                            boxShadow: isCenter
                                                ? `0 0 0 2px var(--bg), 8px 8px 0 0 ${accent}`
                                                : `0 0 0 2px var(--bg), 4px 4px 0 0 ${accent}`,
                                        }}
                                    >
                                        {/* Top band: role centered, taller */}
                                        <div
                                            className="flex items-center justify-center border-b-2 border-[var(--ink)] px-3 py-3"
                                            style={{ backgroundColor: accent }}
                                        >
                                            <span
                                                className="flex items-center gap-2 font-display text-sm uppercase font-bold tracking-[0.3em]"
                                                style={{ color: 'var(--bg)', textShadow: '1px 1px 0 var(--pixel-shadow)' }}
                                            >
                                                {(() => {
                                                    const RoleIcon = roleIcon[character.slug] ?? Sparkles;
                                                    return (
                                                        <>
                                                            <RoleIcon width={16} height={16} />
                                                            {t(`chat.role.${character.slug}`)}
                                                            <RoleIcon width={16} height={16} />
                                                        </>
                                                    );
                                                })()}
                                            </span>
                                        </div>

                                        {/* Art window: bg + avatar */}
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
                                            {isCenter && (
                                                <div
                                                    key={`glow-${selected}`}
                                                    className="animate-gentle-glow pointer-events-none absolute inset-0 z-10 mix-blend-screen"
                                                    style={{
                                                        background:
                                                            'radial-gradient(circle at 50% 40%, rgba(255,255,255,0.15), transparent 70%)',
                                                    }}
                                                />
                                            )}
                                            <div className="relative z-0">
                                                <PixelAvatar character={character} emote="neutral" size={300} />
                                            </div>
                                        </div>

                                        {/* Bento grid */}
                                        <div className="bg-[var(--bg-deep)] p-2 space-y-1.5">
                                            {/* Hero row: name centered */}
                                            <div className="border-2 border-[var(--ink)] bg-[var(--bg)] px-2.5 py-3">
                                                <h2
                                                    className="text-center font-display text-[14px] uppercase font-bold tracking-wider text-[var(--ink)]"
                                                    style={{ textShadow: '2px 2px 0 var(--pixel-shadow)' }}
                                                >
                                                    {character.name}
                                                </h2>
                                            </div>

                                            {/* Superpowers */}
                                            <div className="border-2 border-[var(--ink)] bg-[var(--bg)]">
                                                <div
                                                    className="flex items-center justify-center gap-2 border-b-2 border-[var(--ink)] px-2 py-1 text-center font-display text-[9px] uppercase font-bold tracking-[0.25em]"
                                                    style={{ backgroundColor: accent, color: 'var(--bg)' }}
                                                >
                                                    <Zap width={12} height={12} />
                                                    {t('chat.index.power_ups')}
                                                    <Zap width={12} height={12} />
                                                </div>
                                                <div className="flex flex-col gap-1.5 p-2">
                                                    {character.superpowers?.slice(0, 3).map((sp) => {
                                                        const Icon = superpowerIcon[sp.key];
                                                        return (
                                                            <div
                                                                key={sp.key}
                                                                className="flex items-center gap-2"
                                                            >
                                                                {Icon ? (
                                                                    <Icon width={16} height={16} style={{ color: accent }} />
                                                                ) : (
                                                                    <span className="text-[14px]">{sp.icon}</span>
                                                                )}
                                                                <span className="truncate font-display text-[10px] uppercase font-bold tracking-wider text-[var(--ink)]">
                                                                    {sp.name}
                                                                </span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {isCenter && (
                                                <div
                                                    className="flex items-center justify-center border-2 border-[var(--ink)] px-2 py-2 font-display text-[11px] uppercase font-bold tracking-widest animate-pixel-blink"
                                                    style={{ backgroundColor: accent, color: 'var(--bg)', boxShadow: '2px 2px 0 0 var(--ink)' }}
                                                >
                                                    {t('chat.index.press_to_talk')}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    </TiltCard>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Side arrows */}
                    <button
                        onClick={goPrev}
                        aria-label={t('chat.index.previous')}
                        className="group absolute top-1/2 left-2 z-40 flex h-12 w-12 -translate-y-1/2 items-center justify-center border-2 border-[var(--ink)] bg-[var(--bg-deep)] text-[var(--ink)] transition active:translate-x-[2px] active:translate-y-[calc(-50%+2px)] active:shadow-[2px_2px_0_0_var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--bg-deep)]"
                        style={{ boxShadow: '4px 4px 0 0 var(--ink)', imageRendering: 'pixelated' }}
                    >
                        <ArrowLeft width={24} height={24} />
                    </button>
                    <button
                        onClick={goNext}
                        aria-label={t('chat.index.next')}
                        className="group absolute top-1/2 right-2 z-40 flex h-12 w-12 -translate-y-1/2 items-center justify-center border-2 border-[var(--ink)] bg-[var(--bg-deep)] text-[var(--ink)] transition active:translate-x-[2px] active:translate-y-[calc(-50%+2px)] active:shadow-[2px_2px_0_0_var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--bg-deep)]"
                        style={{ boxShadow: '4px 4px 0 0 var(--ink)', imageRendering: 'pixelated' }}
                    >
                        <ArrowRight width={24} height={24} />
                    </button>
                </div>

                {/* HUD bar: dots + hint */}
                <div className="mt-8 flex items-center gap-2 border-2 border-[var(--ink)] bg-[var(--bg-deep)] px-3 py-2"
                    style={{ boxShadow: '4px 4px 0 0 var(--ink)' }}
                >
                    <span className="font-display text-[10px] uppercase tracking-[0.25em] text-[var(--ink-faint)]">
                        {`P${selected + 1}/${characters.length}`}
                    </span>
                    <span className="mx-1 h-4 w-[2px] bg-[var(--ink-faint)]" />
                    <div className="flex items-center gap-2">
                        {characters.map((_, i) => {
                            const active = i === selected;
                            return (
                                <button
                                    key={i}
                                    onClick={() => {
                                        if (i !== selected) sfx.select();
                                        setSelected(i);
                                    }}
                                    aria-label={`Go to ${i + 1}`}
                                    className="relative h-4 w-4 border-2 border-[var(--ink)] transition"
                                    style={{
                                        backgroundColor: active
                                            ? characterAccent[characters[i].slug] ?? 'var(--ink)'
                                            : 'var(--bg)',
                                        boxShadow: active ? '2px 2px 0 0 var(--ink)' : 'none',
                                    }}
                                />
                            );
                        })}
                    </div>
                </div>

                <p className="mt-4 flex items-center gap-2 font-display text-[10px] uppercase tracking-widest text-[var(--ink-faint)]">
                    <span className="inline-flex h-5 w-5 items-center justify-center border border-[var(--ink-faint)]">
                        <ArrowLeft width={10} height={10} />
                    </span>
                    <span className="inline-flex h-5 w-5 items-center justify-center border border-[var(--ink-faint)]">
                        <ArrowRight width={10} height={10} />
                    </span>
                    <span>{t('chat.index.to_cycle')}</span>
                    <span>·</span>
                    <span className="inline-flex h-5 items-center justify-center border border-[var(--ink-faint)] px-1.5 text-[8px]">
                        ENTER
                    </span>
                    <span>{t('chat.index.enter_to_talk')}</span>
                </p>
                </div>
            </div>
        </>
    );
}
