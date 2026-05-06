import esTranslations from '../../../lang/es.json';

export type Translations = Record<string, string>;

const translations = esTranslations as Translations;

export function useT() {
    return function t(key: string, replacements?: Record<string, string | number>): string {
        let value = translations[key] ?? key;

        if (replacements) {
            for (const [name, replacement] of Object.entries(replacements)) {
                value = value.replace(new RegExp(`\\{${name}\\}`, 'g'), String(replacement));
            }
        }

        return value;
    };
}
