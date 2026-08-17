import confetti from 'canvas-confetti';
import { type ReactNode, useEffect, useRef } from 'react';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

interface Props {
    children: ReactNode;
    /** true solo cuando la pieza acaba de crearse en vivo (no al releer el historial) */
    celebrate: boolean;
    accent: string;
}

/** Cada pieza co-creada entra al hilo como calcomanía; la primera vez, se celebra. */
export default function ArtifactSticker({ children, celebrate, accent }: Props) {
    const reduced = useReducedMotion();
    const fired = useRef(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!celebrate || reduced || fired.current) return;
        fired.current = true;

        const rect = ref.current?.getBoundingClientRect();

        confetti({
            particleCount: 60,
            spread: 55,
            startVelocity: 22,
            colors: [accent, '#ff9f43', '#ffe3b3'],
            origin: rect
                ? {
                      x: (rect.left + rect.width / 2) / window.innerWidth,
                      y: rect.top / window.innerHeight,
                  }
                : { y: 0.6 },
        });
    }, [celebrate, reduced, accent]);

    return (
        <div
            ref={ref}
            className="rotate-[1.5deg] rounded-[10px] border-2 border-dashed border-[#ecca8a] bg-[var(--surface)] p-2 shadow-[var(--shadow-sticker)]"
        >
            {children}
        </div>
    );
}
