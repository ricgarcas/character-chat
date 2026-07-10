import type { DioramaConfig } from './types';

/**
 * 🌺 Frida — Casa Azul
 *
 * Props: cactus + monstera frame her from behind, bougainvillea drapes from
 * the top-right; a wooden stool, clay jug and potted geraniums sit in the
 * foreground, slightly cropped by the bottom edge for depth.
 *
 * Ambient: bougainvillea petals drifting, butterflies wandering.
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
    background: '/backgrounds/frida-courtyard.png',
    backgroundZoom: 1.3, // crop the empty upper wall, enlarge the courtyard floor
    layers: [
        // ── Back row — potted plants against the wall, deeper in perspective ──
        { texture: '/props/frida/cactus.png', x: 0.27, y: 0.69, z: -12, heightRatio: 0.3 },
        { texture: '/props/frida/monstera.png', x: 0.73, y: 0.71, z: -10, heightRatio: 0.24 },
        // ── Bougainvillea draping from the top-right corner ──
        {
            texture: '/props/frida/bougainvillea.png',
            x: 0.82,
            y: -0.03,
            z: -8,
            originY: 0, // hangs from the top edge
            heightRatio: 0.3,
        },
        // ── Foreground — furniture and a low pot framing the bottom corners ──
        { texture: '/props/frida/stool.png', x: 0.15, y: 1.0, z: 12, heightRatio: 0.14 },
        { texture: '/props/frida/jug.png', x: 0.24, y: 1.0, z: 14, heightRatio: 0.105 },
        { texture: '/props/frida/geraniums.png', x: 0.85, y: 1.0, z: 12, heightRatio: 0.16 },
    ],
    character: {
        // PixelLab Pro gesture states — one full-body pose per emote.
        sprites: {
            neutral: '/sprites/frida/neutral.png',
            happy: '/sprites/frida/happy.png',
            thinking: '/sprites/frida/thinking.png',
            surprised: '/sprites/frida/surprised.png',
        },
        anchorY: 0.9, // stands mid-floor, with depth in front and behind
        heightRatio: 0.32,
        shadow: true,
    },
    ambient: [
        { effect: 'petals', params: { colors: PETAL_COLORS, delay: 800 } },
        { effect: 'butterflies', params: { colors: PETAL_COLORS, max: 3 } },
    ],
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
