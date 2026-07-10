import type { AmbientEffect, TriggerEffect } from './types';
import { butterflies, petals } from './ambient';
import { bloom, easel, flash, paintSplatter, papelPicado } from './triggers';

/**
 * Shared effects library. Diorama configs reference effects by name; this is
 * where the name resolves to the actual implementation.
 */

export const ambientEffects: Record<string, AmbientEffect> = {
    petals,
    butterflies,
};

export const triggerEffects: Record<string, TriggerEffect> = {
    paintSplatter,
    bloom,
    papelPicado,
    flash,
    easel,
};

export type { AmbientEffect, AmbientHandle, DioramaContext, TriggerEffect } from './types';
