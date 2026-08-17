import type { Powerup } from '@/components/PowerupBar';
import { powerupIcon } from '@/lib/powerup-icons';

interface Props {
    powerups: Powerup[];
    disabled: boolean;
    onLaunch: (powerup: Powerup) => void;
}

/** Los superpowers del personaje, como menú de movimientos bajo el diorama. */
export default function MoveMenu({ powerups, disabled, onLaunch }: Props) {
    if (powerups.length === 0) return null;

    return (
        <div className="mt-3 grid grid-cols-2 gap-2">
            {powerups.map((powerup, index) => (
                <button
                    key={powerup.key}
                    type="button"
                    disabled={disabled}
                    onClick={() => onLaunch(powerup)}
                    className={`${index === 0 ? 'btn-candy' : 'btn-soft'} flex items-center gap-2 px-3 py-2.5 text-left text-[13px] leading-tight disabled:opacity-50`}
                >
                    {powerupIcon(powerup.key)}
                    <span className="min-w-0 flex-1 truncate">{powerup.label}</span>
                </button>
            ))}
        </div>
    );
}
