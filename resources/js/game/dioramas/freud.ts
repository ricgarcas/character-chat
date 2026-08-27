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
            neutral: '/sprites/freud/neutral.png',
            happy: '/sprites/freud/happy.png',
            thinking: '/sprites/freud/thinking.png',
            surprised: '/sprites/freud/surprised.png',
        },
        shadow: true,
    },
    ambient: [],
    emotes: {},
};
