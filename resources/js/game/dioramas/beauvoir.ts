import type { DioramaConfig } from './types';

/**
 * ☕ Beauvoir — Parisian café (stub).
 *
 * Minimal config: background + character + idle. Enrich with passing
 * silhouettes, rain on the glass, and coffee steam once the diorama
 * assets land.
 */
export const beauvoirDiorama: DioramaConfig = {
    background: '/backgrounds/beauvoir.png',
    layers: [],
    character: {
        sprites: {
            neutral: '/avatars/beauvoir/neutral.png',
            happy: '/avatars/beauvoir/happy.png',
            thinking: '/avatars/beauvoir/thinking.png',
            surprised: '/avatars/beauvoir/surprised.png',
        },
        shadow: true,
    },
    ambient: [],
    emotes: {},
};
