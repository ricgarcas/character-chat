import {
    BookOpen,
    Brain,
    CookingPot,
    Egg,
    Eye,
    GenderFemale,
    Lightning,
    MoonStars,
    PaintBrush,
    PenNib,
    Scales,
    Shield,
    Sparkle,
} from '@phosphor-icons/react';
import type { ReactNode } from 'react';

const ICONS: Record<string, ReactNode> = {
    receta: <CookingPot size={22} weight="bold" />,
    cara: <Eye size={22} weight="bold" />,
    retrato: <PaintBrush size={22} weight="bold" />,
    paranoide: <Brain size={22} weight="bold" />,
    huevo: <Egg size={22} weight="bold" />,
    analiza: <Scales size={22} weight="bold" />,
    critica: <GenderFemale size={22} weight="bold" />,
    lectura: <BookOpen size={22} weight="bold" />,
    sueno: <MoonStars size={22} weight="bold" />,
    defensas: <Shield size={22} weight="bold" />,
    rostro: <Eye size={22} weight="bold" />,
    taller: <PenNib size={22} weight="bold" />,
    duelo: <Lightning size={22} weight="bold" />,
    biblioteca: <BookOpen size={22} weight="bold" />,
};

export function powerupIcon(key: string): ReactNode {
    return ICONS[key] ?? <Sparkle size={22} weight="bold" />;
}
