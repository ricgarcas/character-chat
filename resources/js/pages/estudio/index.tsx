import { Head, router } from '@inertiajs/react';
import { show, store } from '@/routes/estudio/requests';

type Slot = { status: string; request_id: number | null; pending_candidates: number };
type Figure = { slug: string; name: string; slots: Record<string, Slot> };

const SLOT_KEYS = [
    'sprite_neutral',
    'sprite_happy',
    'sprite_thinking',
    'sprite_surprised',
    'avatar',
    'background',
] as const;

const SLOT_LABELS: Record<string, string> = {
    sprite_neutral: 'Neutral',
    sprite_happy: 'Happy',
    sprite_thinking: 'Thinking',
    sprite_surprised: 'Surprised',
    avatar: 'Busto',
    background: 'Fondo',
};

const CHIP: Record<string, { label: string; cls: string }> = {
    approved: { label: '✓', cls: 'bg-green-300 text-green-950' },
    review: { label: '● revisar', cls: 'bg-yellow-300 text-yellow-950' },
    draft: { label: '✎ borrador', cls: 'bg-purple-300 text-purple-950' },
    generating: { label: '⟳', cls: 'bg-blue-300 text-blue-950 animate-pulse' },
    failed: { label: '✗ error', cls: 'bg-red-300 text-red-950' },
    blocked: { label: '🔒', cls: 'bg-neutral-700 text-neutral-500' },
    empty: { label: '◌', cls: 'bg-neutral-800 text-neutral-400' },
};

function slotPayload(slug: string, key: string) {
    const isSprite = key.startsWith('sprite_');

    return {
        character_slug: slug,
        type: isSprite ? 'sprite' : key,
        emote: isSprite ? key.replace('sprite_', '') : null,
    };
}

export default function EstudioIndex({ figures }: { figures: Figure[] }) {
    const pendingReview = figures.reduce(
        (total, figure) => total + Object.values(figure.slots).filter((slot) => slot.status === 'review').length,
        0,
    );

    const onCell = (figure: Figure, key: string) => {
        const slot = figure.slots[key];

        if (slot.status === 'blocked') return;

        if (slot.request_id) {
            router.visit(show(slot.request_id).url);
        } else {
            router.post(store().url, slotPayload(figure.slug, key));
        }
    };

    return (
        <div className="min-h-svh bg-neutral-900 p-8 font-mono text-neutral-100">
            <Head title="Estudio de Assets" />

            <header className="mb-6 flex items-baseline justify-between">
                <h1 className="text-xl font-bold">🎨 Estudio de Assets</h1>
                <span className="text-sm text-yellow-300">{pendingReview} por revisar</span>
            </header>

            <table className="w-full border-collapse text-sm">
                <thead>
                    <tr>
                        <th className="border border-neutral-700 p-2 text-left">Figura</th>
                        {SLOT_KEYS.map((key) => (
                            <th key={key} className="border border-neutral-700 p-2 text-xs uppercase tracking-widest">
                                {SLOT_LABELS[key]}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {figures.map((figure) => (
                        <tr key={figure.slug}>
                            <td className="border border-neutral-700 p-2 font-bold">{figure.name}</td>
                            {SLOT_KEYS.map((key) => {
                                const slot = figure.slots[key];
                                const chip = CHIP[slot.status] ?? CHIP.empty;
                                const blocked = slot.status === 'blocked';

                                return (
                                    <td key={key} className="border border-neutral-700 p-1 text-center">
                                        <button
                                            type="button"
                                            onClick={() => onCell(figure, key)}
                                            disabled={blocked}
                                            className={`w-full px-2 py-1 text-xs ${chip.cls} ${blocked ? 'cursor-not-allowed' : 'cursor-pointer hover:opacity-80'}`}
                                        >
                                            {chip.label}
                                            {slot.status === 'review' && ` (${slot.pending_candidates})`}
                                        </button>
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>

            <p className="mt-4 text-xs text-neutral-500">
                Celda vacía = crea el borrador · 🔒 = aprueba primero el sprite neutral · herramienta local; los PNG
                publicados se commitean a git.
            </p>
        </div>
    );
}
