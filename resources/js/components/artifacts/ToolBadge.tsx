import { useEffect, useState, type ComponentType, type ReactNode } from 'react';
import { Eye, Moon, Lightbulb as Brain, Shield, Potion as CookingPot } from 'pixelarticons/react';
import { X, PaintBrush, Egg } from '@/components/icons/retro';
import { useT } from '@/lib/i18n';
import type {
    Artifact,
    DefensesArtifact,
    DreamAnalysisArtifact,
    ParanoidCriticalArtifact,
    ReadingArtifact,
    RecetaArtifact,
    UnconsciousFaceArtifact,
} from '@/types/chat';
import RecetaCard from './RecetaCard';
import ReadingCard from './ReadingCard';
import DreamAnalysisCard from './DreamAnalysisCard';
import DefensesCard from './DefensesCard';
import UnconsciousFaceCard from './UnconsciousFaceCard';
import ParanoidCriticalCard from './ParanoidCriticalCard';

type InfoArtifact =
    | RecetaArtifact
    | ReadingArtifact
    | DreamAnalysisArtifact
    | DefensesArtifact
    | UnconsciousFaceArtifact
    | ParanoidCriticalArtifact;

type IconCmp = ComponentType<{ width?: number | string; height?: number | string; className?: string }>;

const META: Record<InfoArtifact['artifact_type'], { icon: IconCmp; labelKey: string; toolName: string }> = {
    receta: { icon: CookingPot, labelKey: 'chat.tool_badge.receta', toolName: 'receta_de_coyoacan' },
    reading: { icon: Eye, labelKey: 'chat.tool_badge.reading', toolName: 'leerte_la_cara' },
    dream_analysis: { icon: Moon, labelKey: 'chat.tool_badge.dream_analysis', toolName: 'analisis_sueno' },
    defenses: { icon: Shield, labelKey: 'chat.tool_badge.defenses', toolName: 'mecanismos_defensa' },
    unconscious_face: { icon: Eye, labelKey: 'chat.tool_badge.unconscious_face', toolName: 'rostro_inconsciente' },
    paranoid_critical: { icon: Brain, labelKey: 'chat.tool_badge.paranoid_critical', toolName: 'metodo_paranoico_critico' },
};

const TOOL_TO_TYPE: Record<string, InfoArtifact['artifact_type']> = Object.fromEntries(
    (Object.entries(META) as [InfoArtifact['artifact_type'], { toolName: string }][]).map(
        ([type, { toolName }]) => [toolName, type],
    ),
);

export function isInfoArtifact(a: Artifact): a is InfoArtifact {
    return a.artifact_type in META;
}

export function infoTypeFromToolName(toolName: string | null | undefined): InfoArtifact['artifact_type'] | null {
    if (!toolName) return null;
    return TOOL_TO_TYPE[toolName] ?? null;
}

interface ReadyProps {
    mode: 'ready';
    artifact: InfoArtifact;
    accent: string;
}

interface StreamingProps {
    mode: 'streaming';
    artifactType: InfoArtifact['artifact_type'];
    accent: string;
}

type Props = ReadyProps | StreamingProps;

export default function ToolBadge(props: Props) {
    const t = useT();
    const [open, setOpen] = useState(false);
    const meta = META[props.mode === 'ready' ? props.artifact.artifact_type : props.artifactType];
    const Icon = meta.icon;
    const label = t(meta.labelKey);
    const isStreaming = props.mode === 'streaming';

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpen(false);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open]);

    return (
        <>
            <button
                type="button"
                disabled={isStreaming}
                onClick={() => !isStreaming && setOpen(true)}
                className="group inline-flex w-full max-w-md items-center gap-2 border-2 border-[var(--ink)] bg-[var(--bg-deep)] px-2 py-1.5 text-left transition hover:translate-y-[-1px] disabled:cursor-default"
                style={{ boxShadow: `3px 3px 0 0 ${props.accent}` }}
            >
                <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center border-2 border-[var(--ink)] ${
                        isStreaming ? 'animate-pulse' : ''
                    }`}
                    style={{ backgroundColor: props.accent }}
                >
                    <Icon width={14} height={14} className="text-[var(--bg)]" />
                </span>
                <span className="flex-1 truncate font-display text-[10px] uppercase tracking-widest text-[var(--ink)]">
                    {label}
                </span>
                <span
                    className="font-display text-[9px] uppercase tracking-widest"
                    style={{ color: props.accent }}
                >
                    {isStreaming ? (
                        <span className="inline-flex items-center gap-1">
                            {t('chat.tool_badge.writing')}
                            <span className="animate-pulse">▌</span>
                        </span>
                    ) : (
                        <>{t('chat.tool_badge.show')} →</>
                    )}
                </span>
            </button>

            {open && props.mode === 'ready' && (
                <div
                    className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
                    onClick={() => setOpen(false)}
                >
                    <div
                        className="relative w-full max-w-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setOpen(false)}
                            aria-label="close"
                            className="absolute -top-3 -right-3 z-10 flex h-8 w-8 items-center justify-center border-2 border-[var(--ink)] bg-[var(--bg-deep)] text-[var(--ink)] transition hover:scale-110"
                            style={{ boxShadow: `2px 2px 0 0 ${props.accent}` }}
                        >
                            <X width={14} height={14} />
                        </button>
                        <ArtifactRenderer artifact={props.artifact} accent={props.accent} />
                    </div>
                </div>
            )}
        </>
    );
}

function ArtifactRenderer({ artifact, accent }: { artifact: InfoArtifact; accent: string }): ReactNode {
    if (artifact.artifact_type === 'receta') return <RecetaCard data={artifact.data} accent={accent} />;
    if (artifact.artifact_type === 'reading') return <ReadingCard data={artifact.data} accent={accent} />;
    if (artifact.artifact_type === 'dream_analysis') return <DreamAnalysisCard data={artifact.data} accent={accent} />;
    if (artifact.artifact_type === 'defenses') return <DefensesCard data={artifact.data} accent={accent} />;
    if (artifact.artifact_type === 'unconscious_face') return <UnconsciousFaceCard data={artifact.data} accent={accent} />;
    if (artifact.artifact_type === 'paranoid_critical') return <ParanoidCriticalCard data={artifact.data} accent={accent} />;
    return null;
}
