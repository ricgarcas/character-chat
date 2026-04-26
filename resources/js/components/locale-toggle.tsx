import { router } from '@inertiajs/react';
import { useLocale, useT, type Locale } from '@/lib/i18n';

interface Props {
    className?: string;
    accent?: string;
    fixed?: boolean;
}

export function LocaleToggle({ className = '', accent = 'var(--accent-dali)', fixed = false }: Props) {
    const locale = useLocale();
    const t = useT();

    const set = (next: Locale) => {
        if (next === locale) return;
        router.post(
            '/locale',
            { locale: next },
            { preserveScroll: true, preserveState: false },
        );
    };

    const btn = (target: Locale) => {
        const active = locale === target;
        return {
            className: `px-3 py-1.5 font-display text-[10px] uppercase font-bold tracking-widest transition ${
                active ? 'text-[var(--bg)]' : 'text-[var(--ink-faint)] hover:text-[var(--ink)]'
            }`,
            style: active
                ? { backgroundColor: accent, textShadow: '1px 1px 0 var(--pixel-shadow)' }
                : undefined,
        };
    };

    const wrapperBase =
        'inline-flex items-stretch border-2 border-[var(--ink)] bg-[var(--bg-deep)]';
    const wrapperPos = fixed ? 'fixed top-4 right-4 z-50' : '';

    return (
        <div
            className={`${wrapperBase} ${wrapperPos} ${className}`}
            style={{ boxShadow: `3px 3px 0 0 ${accent}` }}
            aria-label={t('locale.switch')}
        >
            <button type="button" onClick={() => set('en')} {...btn('en')}>
                {t('locale.en')}
            </button>
            <button type="button" onClick={() => set('es')} {...btn('es')}>
                {t('locale.es')}
            </button>
        </div>
    );
}
