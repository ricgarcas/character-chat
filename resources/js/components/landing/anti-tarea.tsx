import { Check, Comment, Notes } from 'pixelarticons/react';
import SectionHeading from '@/components/landing/section-heading';
import type { PixelIcon } from '@/lib/character-meta';
import { useT } from '@/lib/i18n';

const BEATS: { key: string; icon: PixelIcon; accent: string }[] = [
    { key: 'beat1', icon: Comment, accent: 'var(--accent-beauvoir)' },
    { key: 'beat2', icon: Notes, accent: 'var(--accent-dali)' },
    { key: 'beat3', icon: Check, accent: 'var(--accent-frida)' },
];

export default function AntiTarea() {
    const t = useT();

    return (
        <section className="border-t-2 border-[var(--ink-faint)] bg-[var(--bg-deep)] px-4 py-24">
            <SectionHeading
                eyebrow={t('landing.antitarea.eyebrow')}
                title={t('landing.antitarea.title')}
                accent="var(--accent-frida)"
            />

            <div className="mx-auto mt-14 grid max-w-5xl gap-6 md:grid-cols-3">
                {BEATS.map(({ key, icon: Icon, accent }) => (
                    <div
                        key={key}
                        className="border-2 border-[var(--ink)] bg-[var(--bg)] p-6"
                        style={{ boxShadow: `5px 5px 0 0 ${accent}` }}
                    >
                        <Icon width={28} height={28} style={{ color: accent }} />
                        <h3 className="mt-4 font-display text-[12px] uppercase tracking-wider text-[var(--ink)]">
                            {t(`landing.antitarea.${key}_title`)}
                        </h3>
                        <p className="mt-3 font-body text-lg leading-relaxed text-[var(--ink-light)]">
                            {t(`landing.antitarea.${key}_body`)}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}
