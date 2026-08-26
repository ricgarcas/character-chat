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
    Zap,
    Clock,
    Feather,
    Leaf,
    Cloud,
    Message,
    Chess,
    MapPin,
    Search,
    Mail,
    Human,
    Sword,
    Flag,
} from 'pixelarticons/react';
import type { ComponentType } from 'react';
import { Notebook, Key, VenusSymbol as GenderFemale, PaintBrush, Egg, Star, Sitemap } from '@/components/icons/retro';

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
    taller_poetico: Notebook,
    duelo_de_ingenio: Brain,
    biblioteca_infinita: BookOpen,
    experimento_mental: Brain,
    caza_paradojas: Zap,
    fisica_cotidiana: Clock,
    cuaderno_inventos: Notebook,
    maquinas_imposibles: Sitemap,
    escritura_espejo: Eye,
    flor_y_canto: Feather,
    ingenieria_del_agua: Cloud,
    filosofia_efimera: Leaf,
    dialogo_socratico: Message,
    torneo_preguntas: Chess,
    mayeutica: Egg,
    diseno_experimentos: CookingPot,
    bitacora_laboratorio: Notebook,
    perseverancia_radiante: Star,
    expedicion_naturalista: MapPin,
    clasificar_criaturas: Search,
    arbol_de_la_vida: Leaf,
    pintar_emociones: PaintBrush,
    carta_a_theo: Mail,
    ver_el_color: Palette,
    inventar_personajes: Human,
    aventuras_por_capitulos: BookOpen,
    duelo_de_refranes: Sword,
    debate_justo: Scales,
    que_harias_tu: Message,
    leyes_para_todos: Flag,
};

export const roleIcon: Record<string, PixelIcon> = {
    dali: Eye,
    frida: Palette,
    beauvoir: Scales,
    freud: Brain,
    'sor-juana': BookOpen,
    einstein: Brain,
    'da-vinci': Sitemap,
    nezahualcoyotl: Feather,
    socrates: Message,
    'marie-curie': CookingPot,
    darwin: Leaf,
    'van-gogh': Palette,
    cervantes: Sword,
    juarez: Scales,
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
    'sor-juana': {
        role: 'POETA',
        quote: '"Yo no estudio por saber más, sino por ignorar menos."',
    },
    einstein: {
        role: 'FÍSICO',
        quote: '"La imaginación es más importante que el conocimiento."',
    },
    'da-vinci': {
        role: 'INVENTOR',
        quote: '"La sabiduría es hija de la experiencia."',
    },
    nezahualcoyotl: {
        role: 'POETA REY',
        quote: '"No acabarán mis flores, no cesarán mis cantos."',
    },
    socrates: {
        role: 'FILÓSOFO',
        quote: '"Sólo sé que no sé nada."',
    },
    'marie-curie': {
        role: 'CIENTÍFICA',
        quote: '"Nada en la vida debe ser temido, solamente comprendido."',
    },
    darwin: {
        role: 'NATURALISTA',
        quote: '"La ignorancia engendra confianza más frecuentemente que el conocimiento."',
    },
    'van-gogh': {
        role: 'PINTOR',
        quote: '"¿Qué sería de la vida si no tuviéramos el valor de intentar algo?"',
    },
    cervantes: {
        role: 'NOVELISTA',
        quote: '"El que lee mucho y anda mucho, ve mucho y sabe mucho."',
    },
    juarez: {
        role: 'ESTADISTA',
        quote: '"El respeto al derecho ajeno es la paz."',
    },
};
