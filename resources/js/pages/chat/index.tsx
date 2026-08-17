import { Head, router } from '@inertiajs/react';
import { Lock } from '@phosphor-icons/react';
import { accentFor } from '@/lib/accents';
import { characterMeta } from '@/lib/character-meta';
import { useT } from '@/lib/i18n';
import { create } from '@/routes/chat';
import type { Character } from '@/types';

interface Upcoming {
    slug: string;
    name: string;
}

/** Inclinaciones fijas por posición: el cuaderno se ve pegado a mano, pero no baila entre renders. */
const TILTS = ['-rotate-2', 'rotate-1', 'rotate-2', '-rotate-1'];

export default function ChatIndex({ characters, upcoming }: { characters: Character[]; upcoming: Upcoming[] }) {
    const t = useT();

    return (
        <>
            <Head title={t('chat.index.title')} />

            <div className="mx-auto max-w-5xl px-4 py-8">
                <h1 className="font-display text-3xl font-black text-[var(--ink)]">{t('chat.index.title')}</h1>
                <p className="mt-1 font-body text-base text-[var(--ink-soft)]">{t('chat.index.subtitle')}</p>

                <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
                    {characters.map((character, index) => {
                        const accent = accentFor(character.slug);
                        const meta = characterMeta[character.slug];

                        return (
                            <button
                                key={character.slug}
                                type="button"
                                onClick={() => router.visit(create.url(character.slug))}
                                className={`sticker-tape relative text-left transition hover:-translate-y-1 ${TILTS[index % TILTS.length]}`}
                            >
                                <div className="rounded-[14px] bg-[var(--surface)] p-2.5 pb-3 shadow-[var(--shadow-sticker)]">
                                    <img
                                        src={`/avatars/${character.slug}/neutral.png`}
                                        alt={character.name}
                                        className="aspect-square w-full rounded-[10px] object-cover"
                                    />
                                    <p className="mt-2.5 font-display text-base leading-tight font-black text-[var(--ink)]">
                                        {character.name}
                                    </p>
                                    {meta && (
                                        <span
                                            className="mt-1.5 inline-block rounded-full px-2.5 py-0.5 font-display text-[11px] font-extrabold"
                                            style={{
                                                backgroundColor: `color-mix(in srgb, ${accent} 18%, white)`,
                                                color: accent,
                                            }}
                                        >
                                            {meta.role}
                                        </span>
                                    )}
                                </div>
                            </button>
                        );
                    })}

                    {upcoming.map((figure, index) => (
                        <div
                            key={figure.slug}
                            className={`${TILTS[(characters.length + index) % TILTS.length]} rounded-[14px] bg-[var(--paper-deep)] p-2.5 pb-3 opacity-70`}
                        >
                            <div className="flex aspect-square w-full items-center justify-center rounded-[10px] bg-[var(--line)]/60 font-display text-4xl font-black text-[var(--ink-faint)]">
                                ?
                            </div>
                            <p className="mt-2.5 font-display text-base leading-tight font-black text-[var(--ink-soft)]">
                                {figure.name}
                            </p>
                            <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-[var(--surface)] px-2.5 py-0.5 font-display text-[11px] font-extrabold text-[var(--ink-faint)]">
                                <Lock size={10} weight="bold" /> {t('chat.index.upcoming')}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
