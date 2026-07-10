import type { DioramaConfig } from './types';
import { fridaDiorama } from './frida';
import { freudDiorama } from './freud';
import { beauvoirDiorama } from './beauvoir';
import { daliDiorama } from './dali';

/** Slug → diorama config. */
export const dioramas: Record<string, DioramaConfig> = {
    frida: fridaDiorama,
    freud: freudDiorama,
    beauvoir: beauvoirDiorama,
    dali: daliDiorama,
};

/**
 * Resolve a character's diorama config. Unknown slugs fall back to a bare
 * config built from convention (background + 4 emote avatars, no FX).
 */
export function getDiorama(slug: string): DioramaConfig {
    return (
        dioramas[slug] ?? {
            background: `/backgrounds/${slug}.png`,
            layers: [],
            character: {
                sprites: {
                    neutral: `/avatars/${slug}/neutral.png`,
                    happy: `/avatars/${slug}/happy.png`,
                    thinking: `/avatars/${slug}/thinking.png`,
                    surprised: `/avatars/${slug}/surprised.png`,
                },
                shadow: true,
            },
            ambient: [],
            emotes: {},
        }
    );
}

export type { DioramaConfig } from './types';
