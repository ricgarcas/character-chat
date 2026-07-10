export const characterAccent: Record<string, string> = {
    dali: 'var(--accent-dali)',
    freud: 'var(--accent-freud)',
    frida: 'var(--accent-frida)',
    beauvoir: 'var(--accent-beauvoir)',
};

export const characterAccentInk: Record<string, string> = {
    dali: 'var(--bg)',
    freud: 'var(--ink)',
    frida: 'var(--ink)',
    beauvoir: 'var(--ink)',
};

export function accentFor(slug: string): string {
    return characterAccent[slug] ?? 'var(--ink)';
}
