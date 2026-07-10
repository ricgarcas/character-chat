import Phaser from 'phaser';
import type { EmoteKey } from '@/types/chat';
import type { DioramaContext } from './effects';
import { ambientEffects, triggerEffects } from './effects';
import type { DioramaConfig, EffectSpec } from './dioramas/types';

/**
 * Generic 2.5D diorama scene. Reads a `DioramaConfig` from the registry and
 * renders it — background, depth-sorted prop layers, the character (with a
 * ground shadow), ambient effects, and emote/tool reactions.
 *
 * The character is a static sprite that swaps texture per emote — no
 * transform/tween motion. Real animation, when added, comes from sprite
 * frames, not from CSS/transform effects.
 *
 * The scene is fully responsive: `layout()` positions everything from the
 * current canvas size and re-runs on every panel resize.
 */
export class DioramaScene extends Phaser.Scene {
    private config!: DioramaConfig;
    private bg!: Phaser.GameObjects.Image;
    private gradient!: Phaser.GameObjects.Graphics;
    private sprite!: Phaser.GameObjects.Image;
    private shadow?: Phaser.GameObjects.Ellipse;
    private layerImages: Phaser.GameObjects.Image[] = [];
    private currentEmote: EmoteKey = 'neutral';
    private baseX = 0;
    private baseY = 0;
    private charDepth = 100;
    private ambientHandles: { destroy(): void }[] = [];

    /** Base width the ground-shadow ellipse is created at, before scaling. */
    private static readonly SHADOW_BASE_W = 100;

    constructor() {
        super({ key: 'DioramaScene' });
    }

    preload() {
        this.config = this.registry.get('diorama') as DioramaConfig;

        this.load.image('bg', this.config.background);

        for (const [emote, path] of Object.entries(this.config.character.sprites)) {
            if (path) this.load.image(`char:${emote}`, path);
        }

        this.config.layers.forEach((layer, i) => {
            this.load.image(`layer:${i}`, layer.texture);
        });
    }

    create() {
        const char = this.config.character;
        this.charDepth = char.z ?? 100;

        // Background + bottom-up gradient overlay
        this.bg = this.add.image(0, 0, 'bg').setOrigin(0.5).setDepth(0);
        this.gradient = this.add.graphics().setDepth(1);

        // Character + ground shadow
        this.sprite = this.add
            .image(0, 0, 'char:neutral')
            .setOrigin(0.5, 1)
            .setDepth(this.charDepth);
        if (char.shadow !== false) {
            this.shadow = this.add
                .ellipse(0, 0, DioramaScene.SHADOW_BASE_W, 14, 0x000000, 0.28)
                .setDepth(this.charDepth - 1);
        }

        // Prop layers, depth-sorted around the character
        this.config.layers.forEach((layer, i) => {
            this.layerImages.push(
                this.add
                    .image(0, 0, `layer:${i}`)
                    .setOrigin(layer.originX ?? 0.5, layer.originY ?? 1)
                    .setDepth(this.charDepth + layer.z),
            );
        });

        // Position everything for the current size, and on every resize
        this.layout();
        this.scale.on('resize', this.layout, this);

        // Ambient effects
        for (const spec of this.config.ambient) {
            const fn = ambientEffects[spec.effect];
            if (fn) this.ambientHandles.push(fn(this.context(), spec.params ?? {}));
        }

        // React → Phaser events
        this.game.events.on('emote:change', this.onEmote, this);
        this.game.events.on('tool:active', this.onTool, this);
    }

    /** (Re)position every static object from the current canvas size. */
    private layout() {
        const { width, height } = this.scale;
        const char = this.config.character;

        // Background — cover-scaled, optionally zoomed past cover, and pinned
        // to the bottom edge so a zoom crops the empty upper wall, never the
        // ground line.
        this.bg.setScale(
            Math.max(width / this.bg.width, height / this.bg.height) *
                (this.config.backgroundZoom ?? 1),
        );
        this.bg.setPosition(width / 2, height - this.bg.displayHeight / 2);

        // Bottom-up gradient overlay
        this.gradient.clear();
        this.gradient.fillGradientStyle(0x000000, 0x000000, 0x0e0e0e, 0x0e0e0e, 0, 0, 0.7, 0.7);
        this.gradient.fillRect(0, height * 0.35, width, height * 0.65);

        // Character
        this.baseX = (char.anchorX ?? 0.5) * width;
        this.baseY = (char.anchorY ?? 1) * height;
        this.sprite.setPosition(this.baseX, this.baseY);
        this.fitSprite();

        // Ground shadow — base ellipse is SHADOW_BASE_W wide
        this.shadow
            ?.setPosition(this.baseX, this.baseY)
            .setScale((this.sprite.displayWidth * 0.55) / DioramaScene.SHADOW_BASE_W, 1);

        // Prop layers
        this.config.layers.forEach((layer, i) => {
            const img = this.layerImages[i];
            img.setPosition(layer.x * width, layer.y * height);
            img.setScale(
                layer.heightRatio
                    ? (layer.heightRatio * height) / img.height
                    : layer.scale ?? 1,
            );
        });
    }

    // ─── Event handlers ───────────────────────────────────────────────────────

    private onEmote(emote: EmoteKey) {
        if (emote === this.currentEmote) return;
        this.currentEmote = emote;

        // Animation is expressed purely through the sprite swap — no
        // transform/tween motion on the character.
        const key = `char:${emote}`;
        if (this.textures.exists(key)) {
            this.sprite.setTexture(key);
            this.fitSprite();
        }

        this.runEffects(this.config.emotes[emote]);
    }

    private onTool(toolName: string) {
        this.runEffects(this.config.tools?.[toolName]);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private runEffects(specs?: EffectSpec[]) {
        if (!specs) return;
        const ctx = this.context();
        for (const spec of specs) {
            triggerEffects[spec.effect]?.(ctx, spec.params ?? {});
        }
    }

    private context(): DioramaContext {
        return {
            scene: this,
            sprite: this.sprite,
            width: this.scale.width,
            height: this.scale.height,
            baseY: this.baseY,
            charDepth: this.charDepth,
        };
    }

    private fitSprite() {
        const ratio =
            ((this.config.character.heightRatio ?? 0.7) * this.scale.height) /
            this.sprite.height;
        this.sprite.setScale(ratio);
    }

    shutdown() {
        this.scale.off('resize', this.layout, this);
        this.ambientHandles.forEach((h) => h.destroy());
        this.ambientHandles = [];
        this.game.events.off('emote:change', this.onEmote, this);
        this.game.events.off('tool:active', this.onTool, this);
    }
}
