import SectionHeading from '@/components/landing/section-heading';
import { useT } from '@/lib/i18n';

const POINTS = ['point1', 'point2', 'point3'];

export default function ParaPadres() {
    const t = useT();

    return (
        <section className="border-t-2 border-[var(--ink-faint)] bg-[var(--bg-tile)] px-4 py-28">
            <SectionHeading
                eyebrow={t('landing.padres.eyebrow')}
                title={t('landing.padres.title')}
                subtitle={t('landing.padres.body')}
                accent="var(--ink-light)"
            />

            <div className="mx-auto mt-14 max-w-3xl divide-y divide-[var(--ink-faint)]">
                {POINTS.map((key) => (
                    <div key={key} className="py-7">
                        <h3 className="font-display text-[11px] uppercase tracking-wider text-[var(--ink)]">
                            {t(`landing.padres.${key}_title`)}
                        </h3>
                        <p className="mt-3 font-body text-lg leading-relaxed text-[var(--ink-light)]">
                            {t(`landing.padres.${key}_body`)}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}
