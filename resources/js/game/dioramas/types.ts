import type { EmoteKey } from '@/types/chat';

/**
 * Data-driven description of a character's living scene.
 * A `DioramaConfig` is all the `DioramaScene` engine needs to render a
 * character — adding a new character means writing one of these, no new code.
 */

/** A static prop placed in the diorama at a given depth. */
export interface DioramaLayer {
    /** Full image path, e.g. '/dioramas/frida/easel.png'. */
    texture: string;
    /** Position as a fraction of scene size (0-1). */
    x: number;
    y: number;
    /**
     * Depth relative to the character: negative renders behind the
     * character, positive renders in front.
     */
    z: number;
    /** Origin (default 0.5, 1.0 — bottom-centered, like a standing prop). */
    originX?: number;
    originY?: number;
    /** Scale multiplier (default 1). */
    scale?: number;
    /**
     * Rendered height as a fraction of scene height. Takes precedence over
     * `scale` — sizes the prop independently of its native resolution.
     */
    heightRatio?: number;
}

/** A reference to an effect in the effects registry, plus its params. */
export interface EffectSpec {
    /** Key into `ambientEffects` / `triggerEffects`. */
    effect: string;
    /** Arbitrary params forwarded to the effect function. */
    params?: Record<string, unknown>;
}

/** The character sprite within the diorama. */
export interface DioramaCharacter {
    /**
     * Sprite texture(s), keyed by emote. Must include `neutral`.
     * Missing emotes simply don't swap the texture — a single-sprite
     * PixelLab character only provides `neutral`, and its emotes are
     * expressed purely through effects.
     */
    sprites: Partial<Record<EmoteKey, string>> & { neutral: string };
    /** Horizontal position as a fraction of width (default 0.5). */
    anchorX?: number;
    /** Vertical foot position as a fraction of height (default 0.96). */
    anchorY?: number;
    /** Sprite canvas height as a fraction of scene height (default 0.72). */
    heightRatio?: number;
    /** Depth value — layers sort around this (default 100). */
    z?: number;
    /** Draw an elliptical ground shadow under the feet (default true). */
    shadow?: boolean;
}

/** Complete description of one character's living scene. */
export interface DioramaConfig {
    /** Background image path. */
    background: string;
    /**
     * Zoom multiplier for the background (default 1). Values > 1 scale the
     * background past cover and pin it to the bottom edge — cropping the
     * empty upper area while always keeping the ground line.
     */
    backgroundZoom?: number;
    /** Depth-sorted static props. */
    layers: DioramaLayer[];
    /** The character. */
    character: DioramaCharacter;
    /** Effects that run continuously. */
    ambient: EffectSpec[];
    /** Effects triggered per emote (each may fire several effects). */
    emotes: Partial<Record<EmoteKey, EffectSpec[]>>;
    /** Effects triggered per tool / superpower name. */
    tools?: Record<string, EffectSpec[]>;
}
