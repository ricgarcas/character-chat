import { Link } from '@inertiajs/react';
import PixelAvatar from '@/components/pixel-avatar';
import { useT } from '@/lib/i18n';
import { register } from '@/routes';

const appName = import.meta.env.VITE_APP_NAME || 'Muni';

export default function FinalCta() {
    const t = useT();

    return (
        <>
            <section className="border-t-2 border-[var(--ink-faint)] bg-[var(--bg)] px-4 py-28 text-center">
                <PixelAvatar
                    character={{ slug: 'frida', name: 'Frida Kahlo' }}
                    emote="happy"
                    size={160}
                    className="mx-auto"
                />
                <h2
                    className="mt-8 font-display text-xl leading-[1.5] font-extrabold text-[var(--ink)] sm:text-2xl"
                    style={{ textShadow: '3px 3px 0 var(--pixel-shadow)' }}
                >
                    {t('landing.final.title')}
                </h2>
                <p className="mx-auto mt-5 max-w-xl font-body text-xl leading-relaxed text-[var(--ink-light)]">
                    {t('landing.final.subtitle')}
                </p>
                <Link
                    href={register()}
                    className="mt-9 inline-block border-2 border-[var(--ink)] bg-[var(--accent-frida)] px-8 py-4 font-display text-[12px] font-bold uppercase tracking-widest text-[var(--ink)] transition active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_0_var(--ink)]"
                    style={{ boxShadow: '5px 5px 0 0 var(--ink)' }}
                >
                    {t('landing.final.cta')}
                </Link>
            </section>

            <footer className="border-t-2 border-[var(--ink-faint)] bg-[var(--bg-deep)] px-4 py-10">
                <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="font-display text-[12px] uppercase tracking-widest text-[var(--ink)]">
                            {appName}
                        </p>
                        <p className="mt-2 font-body text-base text-[var(--ink-faint)]">
                            {t('landing.footer.tagline')}
                        </p>
                    </div>
                    <p className="font-body text-base text-[var(--ink-faint)]">{t('landing.footer.made')}</p>
                </div>
            </footer>
        </>
    );
}
