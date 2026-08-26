export const characterAccent: Record<string, string> = {
    dali: 'var(--accent-dali)',
    freud: 'var(--accent-freud)',
    frida: 'var(--accent-frida)',
    beauvoir: 'var(--accent-beauvoir)',
    'sor-juana': 'var(--accent-sor-juana)',
    einstein: 'var(--accent-einstein)',
    'da-vinci': 'var(--accent-da-vinci)',
    nezahualcoyotl: 'var(--accent-nezahualcoyotl)',
    socrates: 'var(--accent-socrates)',
    'marie-curie': 'var(--accent-marie-curie)',
    darwin: 'var(--accent-darwin)',
    'van-gogh': 'var(--accent-van-gogh)',
    cervantes: 'var(--accent-cervantes)',
    juarez: 'var(--accent-juarez)',
};

export const characterAccentInk: Record<string, string> = {
    dali: 'var(--bg)',
    freud: 'var(--ink)',
    frida: 'var(--ink)',
    beauvoir: 'var(--ink)',
    'sor-juana': 'var(--ink)',
    einstein: 'var(--ink)',
    'da-vinci': 'var(--ink)',
    nezahualcoyotl: 'var(--bg)',
    socrates: 'var(--ink)',
    'marie-curie': 'var(--ink)',
    darwin: 'var(--ink)',
    'van-gogh': 'var(--ink)',
    cervantes: 'var(--bg)',
    juarez: 'var(--bg)',
};

export function accentFor(slug: string): string {
    return characterAccent[slug] ?? 'var(--ink)';
}
