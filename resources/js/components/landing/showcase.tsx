import SectionHeading from '@/components/landing/section-heading';
import { accentFor } from '@/lib/accents';
import { useT } from '@/lib/i18n';
import type { LandingProps } from '@/pages/landing';

type Props = Pick<LandingProps, 'showcase'>;

export default function Showcase({ showcase }: Props) {
    const t = useT();

    if (showcase.length === 0) {
        return null;
    }

    return (
        <section className="border-t-2 border-[var(--ink-faint)] bg-[var(--bg)] px-4 py-24">
            <SectionHeading
                eyebrow={t('landing.showcase.eyebrow')}
                title={t('landing.showcase.title')}
                subtitle={t('landing.showcase.subtitle')}
                accent="var(--accent-dali)"
            />

            <div className="mx-auto mt-14 grid max-w-5xl gap-8 sm:grid-cols-2">
                {showcase.map((item) => {
                    const accent = accentFor(item.character);

                    return (
                        <figure
                            key={item.image}
                            className="border-2 border-[var(--ink)] bg-[var(--bg-deep)]"
                            style={{ boxShadow: `6px 6px 0 0 ${accent}` }}
                        >
                            <img
                                src={item.image}
                                alt={item.title}
                                className="aspect-[4/3] w-full object-cover"
                                style={{ imageRendering: 'pixelated' }}
                                loading="lazy"
                            />
                            <figcaption className="border-t-2 border-[var(--ink)] px-4 py-3">
                                <p className="font-display text-[11px] uppercase tracking-wider text-[var(--ink)]">
                                    {item.title}
                                </p>
                                <p className="mt-2 font-body text-base text-[var(--ink-faint)]">
                                    {item.kind} · {t('landing.showcase.with')}{' '}
                                    <span style={{ color: accent }}>{item.character_name}</span>
                                </p>
                            </figcaption>
                        </figure>
                    );
                })}
            </div>
        </section>
    );
}
