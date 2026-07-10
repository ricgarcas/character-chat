import Phaser from 'phaser';
import type { AmbientEffect } from './types';

/**
 * Ambient effects — continuous, always-on scene life.
 * Each returns a handle that stops the effect when the scene shuts down.
 */

const DEFAULT_COLORS = [0xe83e8c, 0xd63384, 0xc62c6e, 0xff6b9d, 0xf06292];

/** Petals / leaves drifting down with a gentle sway. */
export const petals: AmbientEffect = (ctx, params) => {
    const { scene, width, height, charDepth } = ctx;
    const colors = (params.colors as number[]) ?? DEFAULT_COLORS;
    const delay = (params.delay as number) ?? 800;

    const spawn = () => {
        const x = Phaser.Math.Between(0, width);
        const color = Phaser.Utils.Array.GetRandom(colors);
        const size = Phaser.Math.Between(3, 6);

        const petal = scene.add
            .ellipse(x, -10, size, size * 0.6, color)
            .setAlpha(Phaser.Math.FloatBetween(0.4, 0.7))
            .setAngle(Phaser.Math.Between(0, 360))
            .setDepth(charDepth + 10);

        scene.tweens.add({
            targets: petal,
            y: height + 20,
            x: x + Phaser.Math.Between(-30, 30),
            angle: petal.angle + Phaser.Math.Between(-180, 180),
            duration: Phaser.Math.Between(4000, 7000),
            ease: 'Sine.InOut',
            onComplete: () => petal.destroy(),
        });
    };

    const timer = scene.time.addEvent({ delay, callback: spawn, loop: true });
    return { destroy: () => timer.destroy() };
};

/** Butterflies that fade in, flap, and wander erratically before despawning. */
export const butterflies: AmbientEffect = (ctx, params) => {
    const { scene, width, height, charDepth } = ctx;
    const colors = (params.colors as number[]) ?? DEFAULT_COLORS;
    const max = (params.max as number) ?? 3;
    const delay = (params.delay as number) ?? 5000;
    let alive: Phaser.GameObjects.Container[] = [];

    const spawn = () => {
        alive = alive.filter((b) => b.active);
        if (alive.length >= max) return;

        const startX = Phaser.Math.Between(0, width);
        const startY = Phaser.Math.Between(height * 0.1, height * 0.5);
        const color = Phaser.Utils.Array.GetRandom(colors);

        const leftWing = scene.add.triangle(0, 0, 0, 0, -8, -5, -8, 5, color).setAlpha(0.8);
        const rightWing = scene.add.triangle(0, 0, 0, 0, 8, -5, 8, 5, color).setAlpha(0.8);
        const body = scene.add.rectangle(0, 0, 2, 6, 0x000000);

        const butterfly = scene.add
            .container(startX, startY, [leftWing, rightWing, body])
            .setScale(0.8)
            .setAlpha(0)
            .setDepth(charDepth + 10);

        alive.push(butterfly);

        scene.tweens.add({ targets: butterfly, alpha: 0.7, duration: 600 });

        for (const wing of [leftWing, rightWing]) {
            scene.tweens.add({
                targets: wing,
                scaleX: { from: 1, to: 0.2 },
                duration: 200,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.InOut',
            });
        }

        const wander = () => {
            if (!butterfly.active) return;
            const targetX = Phaser.Math.Clamp(
                butterfly.x + Phaser.Math.Between(-120, 120),
                20,
                width - 20,
            );
            const targetY = Phaser.Math.Clamp(
                butterfly.y + Phaser.Math.Between(-80, 80),
                height * 0.05,
                height * 0.55,
            );
            scene.tweens.add({
                targets: butterfly,
                x: targetX,
                y: targetY,
                duration: Phaser.Math.Between(2000, 4000),
                ease: 'Sine.InOut',
                onComplete: wander,
            });
        };
        wander();

        scene.time.delayedCall(Phaser.Math.Between(12000, 20000), () => {
            if (!butterfly.active) return;
            scene.tweens.add({
                targets: butterfly,
                alpha: 0,
                duration: 800,
                onComplete: () => butterfly.destroy(),
            });
        });
    };

    const timer = scene.time.addEvent({ delay, callback: spawn, loop: true });
    scene.time.delayedCall(500, spawn);
    return { destroy: () => timer.destroy() };
};
