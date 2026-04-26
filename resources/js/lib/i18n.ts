import { usePage } from '@inertiajs/react';

export type Locale = 'en' | 'es';

export type Translations = Record<string, string>;

export interface I18nProps {
    locale: Locale;
    translations: Translations;
    [key: string]: unknown;
}

export function useT() {
    const { translations } = usePage<I18nProps>().props;

    return function t(key: string, replacements?: Record<string, string | number>): string {
        let value = translations?.[key] ?? key;

        if (replacements) {
            for (const [name, replacement] of Object.entries(replacements)) {
                value = value.replace(new RegExp(`\\{${name}\\}`, 'g'), String(replacement));
            }
        }

        return value;
    };
}

export function useLocale(): Locale {
    return usePage<I18nProps>().props.locale ?? 'en';
}
