import { Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import Balatro from '@/components/Balatro';
import PixelAvatar from '@/components/pixel-avatar';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { useT } from '@/lib/i18n';
import { login, register } from '@/routes';
import type { EmoteKey } from '@/types/chat';

const EMOTE_CYCLE: EmoteKey[] = ['neutral', 'thinking', 'happy'];

export default function Hero() {
    const t = useT();
    const reduced = useReducedMotion();
    const [emoteIndex, setEmoteIndex] = useState(0);

    useEffect(() => {
        if (reduced) {
            return;
        }

        const id = setInterval(() => setEmoteIndex((i) => (i + 1) % EMOTE_CYCLE.length), 2400);

        return () => clearInterval(id);
    }, [reduced]);

    const emote = reduced ? 'neutral' : EMOTE_CYCLE[emoteIndex];

    return (
        <section className="relative flex min-h-screen items-center overflow-hidden px-4 py-20">
            <div className="absolute inset-0 z-0">
                <Balatro
                    spinRotation={0}
                    spinSpeed={reduced ? 0 : 1.4}
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

            <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-10 md:grid-cols-[1.15fr_1fr]">
                <div>
                    <p className="font-display text-[10px] uppercase tracking-[0.35em] text-[var(--accent-frida)]">
                        {t('landing.hero.eyebrow')}
                    </p>
                    <h1
                        className="mt-5 font-display text-2xl leading-[1.5] font-extrabold text-[var(--ink)] sm:text-3xl"
                        style={{ textShadow: '3px 3px 0 var(--pixel-shadow)' }}
                    >
                        {t('landing.hero.title')}
                    </h1>
                    <p className="mt-6 max-w-xl font-body text-xl leading-relaxed text-[var(--ink-light)]">
                        {t('landing.hero.subtitle')}
                    </p>

                    <div className="mt-9 flex flex-wrap items-center gap-4">
                        <Link
                            href={register()}
                            className="border-2 border-[var(--ink)] bg-[var(--accent-frida)] px-6 py-3 font-display text-[12px] font-bold uppercase tracking-widest text-[var(--ink)] transition active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_0_var(--ink)]"
                            style={{ boxShadow: '5px 5px 0 0 var(--ink)' }}
                        >
                            {t('landing.hero.cta_primary')}
                        </Link>
                        <Link
                            href={login()}
                            className="font-display text-[10px] uppercase tracking-widest text-[var(--ink-faint)] underline-offset-4 hover:text-[var(--ink)] hover:underline"
                        >
                            {t('landing.hero.cta_secondary')}
                        </Link>
                    </div>
                </div>

                <div
                    className="relative flex items-end justify-center overflow-hidden border-2 border-[var(--ink)] bg-[var(--bg-tile)]"
                    style={{
                        backgroundImage: 'url(/backgrounds/frida.png)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        imageRendering: 'pixelated',
                        boxShadow: '6px 6px 0 0 var(--accent-frida)',
                        minHeight: '420px',
                    }}
                >
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[var(--bg-deep)] via-black/30 to-transparent" />
                    <PixelAvatar
                        character={{ slug: 'frida', name: 'Frida Kahlo' }}
                        emote={emote}
                        size={320}
                        className="relative z-10"
                    />
                </div>
            </div>
        </section>
    );
}
