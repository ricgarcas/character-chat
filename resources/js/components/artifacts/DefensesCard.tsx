import type { DefensesArtifact } from '@/types/chat';

interface Props {
    data: DefensesArtifact['data'];
    accent: string;
}

export default function DefensesCard({ data, accent }: Props) {
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
                    ★ Mecanismos de Defensa ★
                </span>
            </div>

            <div className="space-y-3 px-4 py-3 text-[var(--ink)]">
                <div>
                    <p className="font-display text-[9px] uppercase tracking-widest text-[var(--ink-faint)]">
                        Escena
                    </p>
                    <p className="mt-0.5 font-body text-sm leading-snug italic opacity-80">
                        {data.scene}
                    </p>
                </div>

                <div>
                    <p className="font-display text-[9px] uppercase tracking-widest text-[var(--ink-faint)]">
                        Operaciones identificadas
                    </p>
                    <ul className="mt-1 space-y-2">
                        {data.mechanisms.map((m, i) => (
                            <li
                                key={i}
                                className="border-l-2 pl-3"
                                style={{ borderColor: accent }}
                            >
                                <p className="font-display text-[11px] font-bold uppercase tracking-wider">
                                    {m.name}
                                </p>
                                <p className="font-body text-sm leading-snug">{m.evidence}</p>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <div className="border-2 border-[var(--ink)] bg-[var(--bg)] px-3 py-2">
                        <p className="font-display text-[9px] uppercase tracking-widest text-[var(--ink-faint)]">
                            Función protectora
                        </p>
                        <p className="mt-0.5 font-body text-sm leading-snug">
                            {data.protective_function}
                        </p>
                    </div>
                    <div className="border-2 border-[var(--ink)] bg-[var(--bg)] px-3 py-2">
                        <p className="font-display text-[9px] uppercase tracking-widest text-[var(--ink-faint)]">
                            Costo
                        </p>
                        <p className="mt-0.5 font-body text-sm leading-snug">{data.cost}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
