import { Link } from '@inertiajs/react';
import { Check } from 'pixelarticons/react';
import SectionHeading from '@/components/landing/section-heading';
import { useT } from '@/lib/i18n';
import type { LandingProps } from '@/pages/landing';
import { login } from '@/routes';

type Props = Pick<LandingProps, 'pricing'>;

export default function Pricing({ pricing }: Props) {
    const t = useT();

    return (
        <section className="border-t-2 border-[var(--ink-faint)] bg-[var(--bg-deep)] px-4 py-24">
            <SectionHeading
                eyebrow={t('landing.pricing.eyebrow')}
                title={t('landing.pricing.title')}
                subtitle={t('landing.pricing.subtitle')}
                accent="var(--accent-frida)"
            />

            <div className="mx-auto mt-14 grid max-w-5xl gap-6 md:grid-cols-3">
                {pricing.map((tier) => (
                    <div
                        key={tier.name}
                        className="flex flex-col border-2 border-[var(--ink)] bg-[var(--bg)] p-6"
                        style={{
                            boxShadow: tier.available
                                ? '6px 6px 0 0 var(--accent-frida)'
                                : '4px 4px 0 0 var(--ink-faint)',
                            opacity: tier.available ? 1 : 0.75,
                        }}
                    >
                        <div className="flex items-center justify-between">
                            <h3 className="font-display text-[12px] uppercase tracking-wider text-[var(--ink)]">
                                {tier.name}
                            </h3>
                            {!tier.available && (
                                <span className="border border-[var(--ink-faint)] px-2 py-1 font-display text-[8px] uppercase tracking-widest text-[var(--ink-faint)]">
                                    {t('landing.pricing.soon')}
                                </span>
                            )}
                        </div>

                        <p className="mt-6 font-display text-2xl text-[var(--ink)]">{tier.price}</p>
                        <p className="mt-2 font-body text-base text-[var(--ink-faint)]">{tier.period}</p>

                        <ul className="mt-6 flex-1 space-y-3">
                            {tier.features.map((feature) => (
                                <li key={feature} className="flex items-start gap-2">
                                    <Check width={14} height={14} className="mt-1 shrink-0 text-[var(--ink-faint)]" />
                                    <span className="font-body text-lg leading-snug text-[var(--ink-light)]">
                                        {feature}
                                    </span>
                                </li>
                            ))}
                        </ul>

                        <div className="mt-8">
                            {tier.available ? (
                                <Link
                                    href={login()}
                                    className="block border-2 border-[var(--ink)] bg-[var(--accent-frida)] px-4 py-3 text-center font-display text-[10px] font-bold uppercase tracking-widest text-[var(--ink)] transition active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_0_var(--ink)]"
                                    style={{ boxShadow: '4px 4px 0 0 var(--ink)' }}
                                >
                                    {t('landing.pricing.cta_free')}
                                </Link>
                            ) : (
                                <span className="block border-2 border-[var(--ink-faint)] px-4 py-3 text-center font-display text-[10px] uppercase tracking-widest text-[var(--ink-faint)]">
                                    {t('landing.pricing.soon')}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
