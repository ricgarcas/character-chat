import { Link } from '@inertiajs/react';
import { CharacterCard, LockedCharacterCard } from '@/components/character-card';
import SectionHeading from '@/components/landing/section-heading';
import TiltCard from '@/components/tilt-card';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { characterMeta } from '@/lib/character-meta';
import { useT } from '@/lib/i18n';
import type { LandingProps } from '@/pages/landing';
import { create } from '@/routes/chat';

type Props = Pick<LandingProps, 'featured' | 'upcoming'>;

export default function Roster({ featured, upcoming }: Props) {
    const t = useT();
    const reduced = useReducedMotion();

    return (
        <section className="border-t-2 border-[var(--ink-faint)] bg-[var(--bg-deep)] px-4 py-24">
            <SectionHeading
                eyebrow={t('landing.roster.eyebrow')}
                title={t('landing.roster.title')}
                subtitle={t('landing.roster.subtitle')}
            />

            <div className="mx-auto mt-16 flex max-w-6xl flex-wrap justify-center gap-10">
                {featured.map((character) => (
                    <div key={character.slug} className="w-[300px]">
                        <Link href={create.url(character.slug)} className="block">
                            <TiltCard enabled={!reduced} glowEnabled={false}>
                                <CharacterCard
                                    character={character}
                                    highlighted
                                    footerLabel={`${t('landing.roster.play')} ${character.name.split(' ')[0].toUpperCase()}`}
                                    heightClass="h-[560px]"
                                />
                            </TiltCard>
                        </Link>
                        <p className="mt-5 text-center font-body text-lg leading-relaxed italic text-[var(--ink-faint)]">
                            {characterMeta[character.slug]?.quote}
                        </p>
                    </div>
                ))}
            </div>

            <div className="mx-auto mt-16 flex max-w-6xl flex-wrap justify-center gap-10">
                {upcoming.map((figure) => (
                    <div key={figure.slug} className="w-[300px]">
                        <LockedCharacterCard
                            name={figure.name}
                            role={figure.role}
                            teaser={figure.teaser}
                            footerLabel={t('landing.roster.locked')}
                            heightClass="h-[560px]"
                        />
                    </div>
                ))}
            </div>
        </section>
    );
}
