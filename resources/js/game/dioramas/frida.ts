import type { DioramaConfig } from './types';

/**
 * 🌺 Frida — Casa Azul
 *
 * The background carries the complete Casa Azul set; no extra props or
 * ambient particles are layered over it.
 * thinking  → paint splatter rises from Frida
 * happy     → flowers bloom across the scene
 * surprised → papel picado burst + screen flash
 * tool      → easel fills with paint strokes
 */

// Bougainvillea + flower tones from the background.
const PETAL_COLORS = [0xe83e8c, 0xd63384, 0xc62c6e, 0xff6b9d, 0xf06292];
// Papel picado banner colors.
const PICADO_COLORS = [0xf7d749, 0x50c878, 0xe83e8c, 0xff6347, 0x6495ed, 0xffa500];
// Frida's painting palette.
const PAINT_COLORS = [0xe83e8c, 0x1a5fb4, 0xf7d749, 0x50c878, 0xff6347];

export const fridaDiorama: DioramaConfig = {
    background: '/backgrounds/frida.png?v=20260827-2',
    backgroundZoom: 1.3,
    layers: [],
    character: {
        // PixelLab Pro gesture states — one full-body pose per emote.
        sprites: {
            neutral: '/sprites/frida/neutral.png',
            happy: '/sprites/frida/happy.png',
            thinking: '/sprites/frida/thinking.png',
            surprised: '/sprites/frida/surprised.png',
        },
        anchorY: 0.96,
        heightRatio: 0.72,
        shadow: true,
    },
    ambient: [],
    emotes: {
        thinking: [{ effect: 'paintSplatter', params: { colors: PAINT_COLORS } }],
        happy: [{ effect: 'bloom', params: { colors: PETAL_COLORS } }],
        surprised: [
            { effect: 'papelPicado', params: { colors: PICADO_COLORS } },
            { effect: 'flash' },
        ],
    },
    tools: {
        retrato_frida: [{ effect: 'easel', params: { colors: PAINT_COLORS } }],
    },
};
