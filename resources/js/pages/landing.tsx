import { Head } from '@inertiajs/react';
import Hero from '@/components/landing/hero';
import type { Character } from '@/types/chat';

export interface UpcomingFigure {
    slug: string;
    name: string;
    role: string;
    teaser: string;
}

export interface ShowcaseItem {
    title: string;
    character: string;
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

export default function Landing() {
    return (
        <>
            <Head title="Crea algo con quienes cambiaron el mundo" />
            <main className="bg-[var(--bg)]">
                <Hero />
            </main>
        </>
    );
}
