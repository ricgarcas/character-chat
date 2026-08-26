import type { DioramaConfig } from './types';
import { fridaDiorama } from './frida';
import { freudDiorama } from './freud';
import { beauvoirDiorama } from './beauvoir';
import { daliDiorama } from './dali';
import { sorJuanaDiorama } from './sor-juana';

/** Slug → diorama config. */
export const dioramas: Record<string, DioramaConfig> = {
    frida: fridaDiorama,
    freud: freudDiorama,
    beauvoir: beauvoirDiorama,
    dali: daliDiorama,
    'sor-juana': sorJuanaDiorama,
};

/**
 * Resolve a character's diorama config. Unknown slugs fall back to a bare
 * config built from convention (background + 4 emote sprites, no FX).
 *
 * Los sprites de cuerpo completo son lo que publica el Estudio para cada
 * figura del roster; `/avatars/` sólo guarda el busto y no sirve en escena.
 */
export function getDiorama(slug: string): DioramaConfig {
    return (
        dioramas[slug] ?? {
            background: `/backgrounds/${slug}.png`,
            layers: [],
            character: {
                sprites: {
                    neutral: `/sprites/${slug}/neutral.png`,
                    happy: `/sprites/${slug}/happy.png`,
                    thinking: `/sprites/${slug}/thinking.png`,
                    surprised: `/sprites/${slug}/surprised.png`,
                },
                shadow: true,
            },
            ambient: [],
            emotes: {},
        }
    );
}

export type { DioramaConfig } from './types';
