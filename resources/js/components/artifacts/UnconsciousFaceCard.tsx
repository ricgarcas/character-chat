import type { UnconsciousFaceArtifact } from '@/types/chat';

interface Props {
    data: UnconsciousFaceArtifact['data'];
    accent: string;
}

export default function UnconsciousFaceCard({ data, accent }: Props) {
    return (
        <div
            className="relative w-full overflow-hidden border-2 border-[var(--ink)] bg-[var(--bg-deep)]"
            style={{ boxShadow: `4px 4px 0 0 ${accent}` }}
        >
            <div
                className="flex items-center justify-between border-b-2 border-[var(--ink)] px-3 py-1.5"
                style={{ backgroundColor: accent }}
            >
                <span className="font-display text-[9px] uppercase tracking-widest text-[var(--bg)]">
                    ★ Lo Que el Rostro Delata ★
                </span>
            </div>

            <div className="grid grid-cols-1 gap-3 px-4 py-3 sm:grid-cols-[100px_1fr]">
                {data.photo_url && (
                    <div
                        className="relative aspect-square w-full overflow-hidden border-2 border-[var(--ink)]"
                        style={{ boxShadow: '2px 2px 0 0 var(--ink)' }}
                    >
                        <img src={data.photo_url} alt="tu foto" className="h-full w-full object-cover" />
                    </div>
                )}

                <div className="space-y-3 text-[var(--ink)]">
                    <p className="font-body text-sm leading-snug">{data.observation}</p>

                    <div>
                        <p className="font-display text-[9px] uppercase tracking-widest text-[var(--ink-faint)]">
                            Tensión inferida
                        </p>
                        <p className="mt-0.5 font-body text-sm leading-snug">
                            {data.inferred_tension}
                        </p>
                    </div>

                    <div>
                        <p className="font-display text-[9px] uppercase tracking-widest text-[var(--ink-faint)]">
                            Defensa visible
                        </p>
                        <p
                            className="mt-0.5 border-l-2 pl-2 font-body text-sm italic leading-snug"
                            style={{ borderColor: accent }}
                        >
                            {data.visible_defense}
                        </p>
                    </div>

                    <p className="font-body text-xs italic text-[var(--ink-faint)]">
                        ~ {data.question_for_couch} ~
                    </p>
                </div>
            </div>
        </div>
    );
}
