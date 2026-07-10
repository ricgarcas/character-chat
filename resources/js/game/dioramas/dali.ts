import type { DioramaConfig } from './types';

/**
 * 🫠 Dalí — surreal Catalan coast (stub).
 *
 * Minimal config: background + character + idle. Enrich with melting
 * clocks, marching ants, and a constantly mutating scene once the
 * diorama assets land.
 */
export const daliDiorama: DioramaConfig = {
    background: '/backgrounds/dali.png',
    layers: [],
    character: {
        sprites: {
            neutral: '/avatars/dali/neutral.png',
            happy: '/avatars/dali/happy.png',
            thinking: '/avatars/dali/thinking.png',
            surprised: '/avatars/dali/surprised.png',
        },
        shadow: true,
    },
    ambient: [],
    emotes: {},
};
