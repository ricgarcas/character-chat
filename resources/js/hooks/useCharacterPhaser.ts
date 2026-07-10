import Phaser from 'phaser';
import { RefObject, useEffect, useRef } from 'react';
import { DioramaScene } from '@/game/DioramaScene';
import { getDiorama } from '@/game/dioramas';
import type { Character, EmoteKey } from '@/types/chat';

/**
 * Mounts the Phaser `DioramaScene` into a container div and pipes React state
 * (the current emote) into it. The scene is fully data-driven — see
 * `game/dioramas/` for per-character configs.
 *
 * The canvas tracks the container with `Scale.RESIZE` plus a `ResizeObserver`,
 * so the diorama fills its panel at any size (mobile stack or desktop split).
 *
 * Returns the Phaser game ref so callers can emit extra events
 * (e.g. `tool:active`).
 */
export function useCharacterPhaser(
    containerRef: RefObject<HTMLDivElement | null>,
    character: Character,
    emote: EmoteKey,
) {
    const gameRef = useRef<Phaser.Game | null>(null);

    // Mount Phaser once per character
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const game = new Phaser.Game({
            type: Phaser.AUTO,
            parent: container,
            width: container.offsetWidth || 400,
            height: container.offsetHeight || 600,
            transparent: true,
            scene: [DioramaScene],
            scale: {
                mode: Phaser.Scale.RESIZE,
            },
            render: {
                pixelArt: true,
                antialias: false,
            },
        });

        game.registry.set('diorama', getDiorama(character.slug));
        gameRef.current = game;

        // Keep the canvas matched to the container as the layout reflows
        const observer = new ResizeObserver(() => {
            const w = container.offsetWidth;
            const h = container.offsetHeight;
            if (w > 0 && h > 0) game.scale.resize(w, h);
        });
        observer.observe(container);

        return () => {
            observer.disconnect();
            game.destroy(true);
            gameRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [character.slug]);

    // Pipe emote changes into Phaser
    useEffect(() => {
        gameRef.current?.events.emit('emote:change', emote);
    }, [emote]);

    return gameRef;
}
