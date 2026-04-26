import type { ReadingArtifact } from '@/types/chat';

interface Props {
    data: ReadingArtifact['data'];
    accent: string;
}

export default function ReadingCard({ data, accent }: Props) {
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
                    ★ Lo Que Veo En Tu Cara ★
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

                    <p
                        className="border-l-4 pl-2 font-body text-base font-bold leading-tight italic"
                        style={{ borderColor: accent }}
                    >
                        “{data.verdict}”
                    </p>

                    <div>
                        <p className="font-display text-[9px] uppercase tracking-widest text-[var(--ink-faint)]">
                            Paleta
                        </p>
                        <div className="mt-1 flex flex-wrap gap-2">
                            {data.palette.map((c, i) => (
                                <div key={i} className="flex items-center gap-1.5">
                                    <span
                                        className="block h-5 w-5 border-2 border-[var(--ink)]"
                                        style={{ backgroundColor: c.hex }}
                                    />
                                    <span className="font-body text-xs italic">{c.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <p className="font-body text-xs italic text-[var(--ink-faint)]">~ {data.metaphor} ~</p>
                </div>
            </div>
        </div>
    );
}
