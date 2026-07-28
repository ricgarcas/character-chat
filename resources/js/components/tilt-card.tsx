import { useRef  } from 'react';
import type {ReactNode} from 'react';

interface TiltCardProps {
    enabled: boolean;
    glowEnabled?: boolean;
    children: ReactNode;
}

export default function TiltCard({ enabled, glowEnabled = true, children }: TiltCardProps) {
    const ref = useRef<HTMLDivElement>(null);
    const innerRef = useRef<HTMLDivElement>(null);

    const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!enabled || !ref.current || !innerRef.current) {
return;
}

        const rect = ref.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        const rx = (0.5 - y) * 14;
        const ry = (x - 0.5) * 14;
        innerRef.current.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
    };

    const handleLeave = () => {
        if (innerRef.current) {
innerRef.current.style.transform = '';
}
    };

    return (
        <div
            ref={ref}
            onMouseMove={handleMove}
            onMouseLeave={handleLeave}
            className="relative"
            style={enabled ? { perspective: '900px' } : undefined}
        >
            {glowEnabled && enabled && (
                <div
                    aria-hidden
                    className="pointer-events-none absolute -inset-6 rounded-md blur-2xl"
                    style={{ backgroundColor: 'rgba(255,255,255,0.18)', zIndex: -1 }}
                />
            )}
            <div ref={innerRef} className="relative" style={{ transition: 'transform 200ms ease-out' }}>
                {children}
            </div>
        </div>
    );
}
