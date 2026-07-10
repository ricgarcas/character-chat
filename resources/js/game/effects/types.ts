import type Phaser from 'phaser';

/**
 * Runtime context handed to every diorama effect.
 * Effects use this to position themselves relative to the scene and character.
 */
export interface DioramaContext {
    scene: Phaser.Scene;
    /** The character sprite. */
    sprite: Phaser.GameObjects.Image;
    width: number;
    height: number;
    /** Y of the character's feet / ground line. */
    baseY: number;
    /** The character's depth value — offset from this to render in front/behind. */
    charDepth: number;
}

/** Handle returned by ambient effects so the scene can stop them on shutdown. */
export interface AmbientHandle {
    destroy(): void;
}

/** Continuous effect — runs until its handle is destroyed. */
export type AmbientEffect = (
    ctx: DioramaContext,
    params: Record<string, unknown>,
) => AmbientHandle;

/** One-shot effect — fires once and cleans up after itself. */
export type TriggerEffect = (
    ctx: DioramaContext,
    params: Record<string, unknown>,
) => void;
