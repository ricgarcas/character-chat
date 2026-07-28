import SectionHeading from '@/components/landing/section-heading';
import { useT } from '@/lib/i18n';

const STEPS = ['step1', 'step2', 'step3', 'step4'];

export default function ComoFunciona() {
    const t = useT();

    return (
        <section className="border-t-2 border-[var(--ink-faint)] bg-[var(--bg)] px-4 py-24">
            <SectionHeading
                eyebrow={t('landing.como.eyebrow')}
                title={t('landing.como.title')}
                accent="var(--accent-beauvoir)"
            />

            <ol className="mx-auto mt-14 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {STEPS.map((key, i) => (
                    <li
                        key={key}
                        className="relative border-2 border-[var(--ink)] bg-[var(--bg-deep)] p-6"
                        style={{ boxShadow: '4px 4px 0 0 var(--ink)' }}
                    >
                        <span
                            className="absolute -top-4 -left-3 flex h-9 w-9 items-center justify-center border-2 border-[var(--ink)] bg-[var(--accent-beauvoir)] font-display text-[12px] text-[var(--ink)]"
                            style={{ boxShadow: '3px 3px 0 0 var(--pixel-shadow)' }}
                        >
                            {i + 1}
                        </span>
                        <h3 className="mt-3 font-display text-[11px] uppercase tracking-wider text-[var(--ink)]">
                            {t(`landing.como.${key}_title`)}
                        </h3>
                        <p className="mt-3 font-body text-lg leading-relaxed text-[var(--ink-light)]">
                            {t(`landing.como.${key}_body`)}
                        </p>
                    </li>
                ))}
            </ol>
        </section>
    );
}
