import type { DreamAnalysisArtifact } from '@/types/chat';

interface Props {
    data: DreamAnalysisArtifact['data'];
    accent: string;
}

export default function DreamAnalysisCard({ data, accent }: Props) {
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
                    ★ Análisis del Sueño · Berggasse 19 ★
                </span>
            </div>

            <div className="space-y-3 px-4 py-3 text-[var(--ink)]">
                <div>
                    <p className="font-display text-[9px] uppercase tracking-widest text-[var(--ink-faint)]">
                        Contenido manifiesto
                    </p>
                    <p className="mt-0.5 font-body text-sm leading-snug italic opacity-80">
                        {data.manifest_content}
                    </p>
                </div>

                <div>
                    <p className="font-display text-[9px] uppercase tracking-widest text-[var(--ink-faint)]">
                        Contenido latente
                    </p>
                    <p className="mt-0.5 font-body text-sm leading-snug">
                        {data.latent_content}
                    </p>
                </div>

                <div>
                    <p className="font-display text-[9px] uppercase tracking-widest text-[var(--ink-faint)]">
                        Símbolos
                    </p>
                    <ul className="mt-1 space-y-1">
                        {data.symbols.map((s, i) => (
                            <li
                                key={i}
                                className="border-l-2 pl-3"
                                style={{ borderColor: accent }}
                            >
                                <p className="font-display text-[11px] font-bold uppercase tracking-wider">
                                    {s.image}
                                </p>
                                <p className="font-body text-sm leading-snug">{s.meaning}</p>
                            </li>
                        ))}
                    </ul>
                </div>

                <div
                    className="border-2 border-[var(--ink)] px-3 py-2"
                    style={{ backgroundColor: accent }}
                >
                    <p
                        className="font-display text-[9px] uppercase tracking-widest"
                        style={{ color: 'var(--bg)' }}
                    >
                        Interpretación
                    </p>
                    <p
                        className="mt-0.5 font-body text-sm leading-snug"
                        style={{ color: 'var(--bg)' }}
                    >
                        {data.interpretation}
                    </p>
                </div>

                <p className="font-body text-xs italic text-[var(--ink-faint)]">
                    ~ {data.question_for_couch} ~
                </p>
            </div>
        </div>
    );
}
