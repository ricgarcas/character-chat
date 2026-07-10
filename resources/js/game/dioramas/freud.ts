import type { DioramaConfig } from './types';

/**
 * 🛋️ Freud — Vienna study (stub).
 *
 * Minimal config: background + character + idle. Enrich with ambient
 * cigar smoke, a swinging pendulum clock, and dream-distortion FX once
 * the diorama assets land.
 */
export const freudDiorama: DioramaConfig = {
    background: '/backgrounds/freud.png',
    layers: [],
    character: {
        sprites: {
            neutral: '/avatars/freud/neutral.png',
            happy: '/avatars/freud/happy.png',
            thinking: '/avatars/freud/thinking.png',
            surprised: '/avatars/freud/surprised.png',
        },
        shadow: true,
    },
    ambient: [],
    emotes: {},
};
