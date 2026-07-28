import { Head } from '@inertiajs/react';
import AntiTarea from '@/components/landing/anti-tarea';
import ComoFunciona from '@/components/landing/como-funciona';
import Hero from '@/components/landing/hero';
import Roster from '@/components/landing/roster';
import Showcase from '@/components/landing/showcase';
import type { Character } from '@/types/chat';

export interface UpcomingFigure {
    slug: string;
    name: string;
    role: string;
    teaser: string;
}

export interface ShowcaseItem {
    title: string;
    /** Slug — determina el color de acento de la tarjeta. */
    character: string;
    /** Nombre para mostrar en la atribución. */
    character_name: string;
    kind: string;
    image: string;
}

export interface PricingTier {
    name: string;
    price: string;
    period: string;
    available: boolean;
    features: string[];
}

export interface LandingProps {
    featured: Pick<Character, 'id' | 'slug' | 'name' | 'tagline' | 'superpowers'>[];
    upcoming: UpcomingFigure[];
    showcase: ShowcaseItem[];
    pricing: PricingTier[];
}

export default function Landing({ featured, upcoming, showcase }: LandingProps) {
    return (
        <>
            <Head title="Crea algo con quienes cambiaron el mundo" />
            <main className="bg-[var(--bg)]">
                <Hero />
                <AntiTarea />
                <Roster featured={featured} upcoming={upcoming} />
                <ComoFunciona />
                <Showcase showcase={showcase} />
            </main>
        </>
    );
}
