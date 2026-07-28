import {
    Eye,
    Moon as MoonStars,
    ColorsSwatch as Palette,
    Home as House,
    Scale as Scales,
    Link as LinkSimple,
    BookOpen,
    Lightbulb as Brain,
    Potion as CookingPot,
    Shield,
} from 'pixelarticons/react';
import type { ComponentType } from 'react';
import { Notebook, Key, VenusSymbol as GenderFemale, PaintBrush, Egg } from '@/components/icons/retro';

export type PixelIcon = ComponentType<{
    width?: number | string;
    height?: number | string;
    className?: string;
    style?: React.CSSProperties;
}>;

export const superpowerIcon: Record<string, PixelIcon> = {
    paranoid_critical: Brain,
    pintar_surreal: Egg,
    retrato_dali: PaintBrush,
    artwork_analysis: Palette,
    visual_diary: Notebook,
    casa_azul_tour: House,
    coyoacan_recipe: CookingPot,
    face_reading: Eye,
    frida_portrait: PaintBrush,
    dream_analysis: MoonStars,
    defenses: Shield,
    unconscious_face: Eye,
    existential_analysis: Key,
    feminist_critique: GenderFemale,
    philosophical_debate: Scales,
    free_association: LinkSimple,
    psychoanalytic_library: BookOpen,
};

export const roleIcon: Record<string, PixelIcon> = {
    dali: Eye,
    frida: Palette,
    beauvoir: Scales,
    freud: Brain,
};

export interface CharacterMeta {
    role: string;
    quote: string;
}

/** Citas curadas por personaje. Las usa el roster de la landing. */
export const characterMeta: Record<string, CharacterMeta> = {
    dali: {
        role: 'SURREALISTA',
        quote: '"La única diferencia entre yo y un loco es que yo no estoy loco."',
    },
    frida: {
        role: 'PINTORA',
        quote: '"Pies, para qué los quiero si tengo alas para volar."',
    },
    beauvoir: {
        role: 'FILÓSOFA',
        quote: '"No se nace mujer: se llega a serlo."',
    },
    freud: {
        role: 'ANALISTA',
        quote: '"De tus vulnerabilidades saldrá tu fortaleza."',
    },
};
