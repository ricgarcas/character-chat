import type { Character } from '@/types/chat';

interface Props {
    character: Pick<Character, 'slug' | 'name'>;
    emote?: string;
    size?: number;
    className?: string;
}

export default function PixelAvatar({ character, emote = 'neutral', size = 96, className = '' }: Props) {
    const src = `/avatars/${character.slug}/${emote}.png`;

    return (
        <img
            src={src}
            alt={`${character.name} (${emote})`}
            width={size}
            height={size}
            style={{ imageRendering: 'pixelated', width: size, height: size }}
            className={className}
            onError={(e) => {
                const img = e.currentTarget;
                if (!img.dataset.fallback) {
                    img.dataset.fallback = '1';
                    img.src = `/avatars/${character.slug}/neutral.png`;
                }
            }}
        />
    );
}
