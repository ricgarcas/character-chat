import type { ParanoidCriticalArtifact } from '@/types/chat';

interface Props {
    data: ParanoidCriticalArtifact['data'];
    accent: string;
}

export default function ParanoidCriticalCard({ data, accent }: Props) {
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
                    ★ Método Paranoico-Crítico ★
                </span>
            </div>

            <div className="space-y-3 px-4 py-3 text-[var(--ink)]">
                <div>
                    <p className="font-display text-[9px] uppercase tracking-widest text-[var(--ink-faint)]">
                        Sujeto
                    </p>
                    <p className="mt-0.5 font-display text-base font-bold uppercase tracking-wide">
                        {data.subject}
                    </p>
                </div>

                <div>
                    <p className="font-display text-[9px] uppercase tracking-widest text-[var(--ink-faint)]">
                        Lo que el ojo vulgar ve
                    </p>
                    <p className="mt-0.5 font-body text-sm leading-snug italic opacity-80">
                        {data.apparent}
                    </p>
                </div>

                <div>
                    <p className="font-display text-[9px] uppercase tracking-widest text-[var(--ink-faint)]">
                        Tres visiones simultáneas
                    </p>
                    <ol className="mt-1 space-y-2">
                        {data.visions.map((v, i) => (
                            <li
                                key={i}
                                className="border-l-2 pl-3"
                                style={{ borderColor: accent }}
                            >
                                <p className="font-display text-[11px] font-bold uppercase tracking-wider">
                                    {i + 1}. {v.title}
                                </p>
                                <p className="mt-0.5 font-body text-sm leading-snug">{v.vision}</p>
                            </li>
                        ))}
                    </ol>
                </div>

                <div
                    className="border-2 border-[var(--ink)] px-3 py-2"
                    style={{ backgroundColor: accent }}
                >
                    <p
                        className="font-display text-[9px] uppercase tracking-widest"
                        style={{ color: 'var(--bg)' }}
                    >
                        Síntesis
                    </p>
                    <p
                        className="mt-0.5 font-body text-base font-bold leading-tight"
                        style={{ color: 'var(--bg)' }}
                    >
                        “{data.synthesis}”
                    </p>
                </div>

                <p className="font-body text-xs italic text-[var(--ink-faint)]">
                    ~ {data.signature} ~
                </p>
            </div>
        </div>
    );
}
