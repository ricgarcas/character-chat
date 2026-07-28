import { Head, router } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Gamepad } from 'pixelarticons/react';
import { useEffect, useState } from 'react';
import Balatro from '@/components/Balatro';
import { CharacterCard } from '@/components/character-card';
import { PowerOffButton } from '@/components/power-off-button';
import TiltCard from '@/components/tilt-card';
import { accentFor } from '@/lib/accents';
import { useT } from '@/lib/i18n';
import { sfx } from '@/lib/sfx';
import { create } from '@/routes/chat';
import type { Character } from '@/types';


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
            <Head title="Choose your character" />

            <PowerOffButton />

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

                            if (off > n / 2) {
off -= n;
}

                            if (off < -n / 2) {
off += n;
}

                            const abs = Math.abs(off);

                            const isCenter = off === 0;
                            // Hide cards more than 1 away (so we don't render the back-most card)
                            const visible = abs <= 1;

                            const translateX = off * 280;
                            const rotateY = off * -38;
                            const scale = isCenter ? 1 : 0.72;
                            const z = isCenter ? 30 : 20;
                            const opacity = visible ? (isCenter ? 1 : 0.55) : 0;

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
                                    <TiltCard enabled={isCenter} glowEnabled>
                                        <div className={isCenter ? 'animate-card-land' : ''}>
                                            <CharacterCard
                                                character={character}
                                                highlighted={isCenter}
                                                footerLabel={isCenter ? t('chat.index.press_to_talk') : null}
                                            />
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
                                        if (i !== selected) {
sfx.select();
}

                                        setSelected(i);
                                    }}
                                    aria-label={`Go to ${i + 1}`}
                                    className="relative h-4 w-4 border-2 border-[var(--ink)] transition"
                                    style={{
                                        backgroundColor: active
                                            ? accentFor(characters[i].slug)
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
