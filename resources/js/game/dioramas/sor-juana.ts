import type { DioramaConfig } from './types';

/**
 * 📜 Sor Juana — celda-biblioteca del convento de San Jerónimo
 *
 * Primera figura en nacer directo en nivel B (escenario simple, spec
 * 2026-08-17): fondo + sprites de cuerpo completo del Estudio, sombra y
 * ambient genérico reusado — sin props ni efectos custom (eso es nivel C).
 *
 * Ambient: motas doradas a la luz de las velas (reusa el efecto `petals`
 * con paleta ámbar; cero código de efectos nuevo).
 */

// Ámbar de vela sobre la madera oscura del fondo.
const CANDLE_MOTES = [0xf7d9a0, 0xe8b84a, 0xd9a441, 0xc98f2e];

export const sorJuanaDiorama: DioramaConfig = {
    background: '/backgrounds/sor-juana.png',
    layers: [],
    character: {
        sprites: {
            neutral: '/sprites/sor-juana/neutral.png',
            happy: '/sprites/sor-juana/happy.png',
            thinking: '/sprites/sor-juana/thinking.png',
            surprised: '/sprites/sor-juana/surprised.png',
        },
        anchorY: 0.92, // parada sobre el piso de barro, frente al escritorio
        heightRatio: 0.5, // los sprites del Estudio traen margen propio (2:3)
        shadow: true,
    },
    ambient: [{ effect: 'petals', params: { colors: CANDLE_MOTES, delay: 1400 } }],
    emotes: {},
};
