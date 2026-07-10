import Phaser from 'phaser';
import type { TriggerEffect } from './types';

/**
 * Trigger effects — one-shot bursts fired by emotes or tool calls.
 * Each spawns its own objects and cleans them up when finished.
 */

const DEFAULT_COLORS = [0xe83e8c, 0x1a5fb4, 0xf7d749, 0x50c878, 0xff6347];

/** Paint splatter particles rising from the character (thinking). */
export const paintSplatter: TriggerEffect = (ctx, params) => {
    const { scene, sprite, baseY, charDepth } = ctx;
    const colors = (params.colors as number[]) ?? DEFAULT_COLORS;
    const cx = sprite.x;
    const topY = baseY - sprite.displayHeight;

    for (let i = 0; i < 8; i++) {
        const color = Phaser.Utils.Array.GetRandom(colors);
        const splat = scene.add
            .circle(
                cx + Phaser.Math.Between(-40, 40),
                topY + Phaser.Math.Between(-10, 20),
                Phaser.Math.Between(4, 10),
                color,
            )
            .setAlpha(0.8)
            .setDepth(charDepth + 20);

        scene.tweens.add({
            targets: splat,
            y: splat.y - Phaser.Math.Between(30, 70),
            x: splat.x + Phaser.Math.Between(-20, 20),
            alpha: 0,
            scale: { from: 0.3, to: 1.2 },
            duration: Phaser.Math.Between(800, 1400),
            delay: i * 80,
            ease: 'Quad.easeOut',
            onComplete: () => splat.destroy(),
        });
    }
};

/** Flowers bloom across the lower scene (happy). */
export const bloom: TriggerEffect = (ctx, params) => {
    const { scene, width, height, charDepth } = ctx;
    const colors = (params.colors as number[]) ?? DEFAULT_COLORS;

    for (let i = 0; i < 5; i++) {
        const x = Phaser.Math.Between(width * 0.1, width * 0.9);
        const y = Phaser.Math.Between(height * 0.5, height * 0.85);
        const color = Phaser.Utils.Array.GetRandom(colors);
        const delay = i * 200;

        const center = scene.add
            .circle(x, y, 3, 0xf7d749)
            .setAlpha(0)
            .setScale(0)
            .setDepth(charDepth + 20);

        const petalShapes: Phaser.GameObjects.Ellipse[] = [];
        for (let p = 0; p < 5; p++) {
            const angle = (p / 5) * Math.PI * 2;
            petalShapes.push(
                scene.add
                    .ellipse(x, y, 6, 4, color)
                    .setAngle(Phaser.Math.RadToDeg(angle))
                    .setAlpha(0)
                    .setScale(0)
                    .setDepth(charDepth + 20),
            );
        }

        scene.tweens.add({
            targets: center,
            alpha: 0.9,
            scale: 1,
            duration: 400,
            delay,
            ease: 'Back.easeOut',
        });

        petalShapes.forEach((petal, p) => {
            const angle = (p / 5) * Math.PI * 2;
            scene.tweens.add({
                targets: petal,
                x: x + Math.cos(angle) * 8,
                y: y + Math.sin(angle) * 8,
                alpha: 0.8,
                scale: 1,
                duration: 500,
                delay: delay + 100,
                ease: 'Back.easeOut',
            });
        });

        scene.time.delayedCall(delay + 2500, () => {
            [center, ...petalShapes].forEach((obj) => {
                if (!obj.active) return;
                scene.tweens.add({
                    targets: obj,
                    alpha: 0,
                    scale: 0,
                    duration: 600,
                    onComplete: () => obj.destroy(),
                });
            });
        });
    }
};

/** Papel picado confetti bursting from the top (surprised). */
export const papelPicado: TriggerEffect = (ctx, params) => {
    const { scene, width, height, charDepth } = ctx;
    const colors =
        (params.colors as number[]) ??
        [0xf7d749, 0x50c878, 0xe83e8c, 0xff6347, 0x6495ed, 0xffa500];
    const cx = width / 2;

    for (let i = 0; i < 20; i++) {
        const color = Phaser.Utils.Array.GetRandom(colors);
        const piece = scene.add
            .rectangle(
                cx + Phaser.Math.Between(-60, 60),
                20,
                Phaser.Math.Between(6, 12),
                Phaser.Math.Between(8, 14),
                color,
            )
            .setAlpha(0.85)
            .setAngle(Phaser.Math.Between(0, 360))
            .setDepth(charDepth + 20);

        scene.tweens.add({
            targets: piece,
            x: piece.x + Phaser.Math.Between(-150, 150),
            y: height + 20,
            angle: piece.angle + Phaser.Math.Between(-360, 360),
            alpha: 0,
            duration: Phaser.Math.Between(1500, 3000),
            delay: Phaser.Math.Between(0, 300),
            ease: 'Quad.easeIn',
            onComplete: () => piece.destroy(),
        });
    }
};

/** Brief white screen flash. */
export const flash: TriggerEffect = (ctx) => {
    const { scene, width, height, charDepth } = ctx;
    const rect = scene.add
        .rectangle(0, 0, width, height, 0xffffff, 0.25)
        .setOrigin(0, 0)
        .setDepth(charDepth + 100);

    scene.tweens.add({
        targets: rect,
        alpha: 0,
        duration: 200,
        ease: 'Quad.easeOut',
        onComplete: () => rect.destroy(),
    });
};

/** A framed canvas appears and fills with paint strokes (tool: portrait). */
export const easel: TriggerEffect = (ctx, params) => {
    const { scene, width, height, charDepth } = ctx;
    const colors = (params.colors as number[]) ?? DEFAULT_COLORS;

    const frameX = width * 0.78;
    const frameY = height * 0.35;
    const frameW = 60;
    const frameH = 75;
    const depth = charDepth + 20;

    const frame = scene.add
        .rectangle(frameX, frameY, frameW + 8, frameH + 8, 0x8b4513)
        .setAlpha(0)
        .setScale(0)
        .setDepth(depth);
    const canvas = scene.add
        .rectangle(frameX, frameY, frameW, frameH, 0xfaf8ef)
        .setAlpha(0)
        .setScale(0)
        .setDepth(depth);

    scene.tweens.add({
        targets: [frame, canvas],
        alpha: { value: 0.9, duration: 300 },
        scale: { value: 1, duration: 400 },
        ease: 'Back.easeOut',
    });

    const objects: Phaser.GameObjects.GameObject[] = [frame, canvas];
    for (let i = 0; i < 6; i++) {
        scene.time.delayedCall(600 + i * 400, () => {
            if (!canvas.active) return;
            const color = Phaser.Utils.Array.GetRandom(colors);
            const stroke = scene.add
                .ellipse(
                    frameX + Phaser.Math.Between(-frameW / 3, frameW / 3),
                    frameY + Phaser.Math.Between(-frameH / 3, frameH / 3),
                    Phaser.Math.Between(8, 18),
                    Phaser.Math.Between(3, 7),
                    color,
                )
                .setAngle(Phaser.Math.Between(-30, 30))
                .setAlpha(0)
                .setScale(0.3)
                .setDepth(depth);
            objects.push(stroke);

            scene.tweens.add({
                targets: stroke,
                alpha: 0.8,
                scale: 1,
                duration: 300,
                ease: 'Quad.easeOut',
            });
        });
    }

    scene.time.delayedCall(4500, () => {
        objects.forEach((obj) => {
            if (!obj.active) return;
            scene.tweens.add({
                targets: obj,
                alpha: 0,
                scale: 0.5,
                duration: 600,
                onComplete: () => obj.destroy(),
            });
        });
    });
};
