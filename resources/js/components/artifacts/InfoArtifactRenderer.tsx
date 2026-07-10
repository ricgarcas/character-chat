import type {
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

export type InfoArtifact =
    | RecetaArtifact
    | ReadingArtifact
    | DreamAnalysisArtifact
    | DefensesArtifact
    | UnconsciousFaceArtifact
    | ParanoidCriticalArtifact;

const INFO_TYPES: InfoArtifact['artifact_type'][] = [
    'receta', 'reading', 'dream_analysis', 'defenses', 'unconscious_face', 'paranoid_critical',
];

export function isInfoType(type: string): type is InfoArtifact['artifact_type'] {
    return (INFO_TYPES as string[]).includes(type);
}

export default function InfoArtifactRenderer({ artifact, accent }: { artifact: InfoArtifact; accent: string }) {
    if (artifact.artifact_type === 'receta') return <RecetaCard data={artifact.data} accent={accent} />;
    if (artifact.artifact_type === 'reading') return <ReadingCard data={artifact.data} accent={accent} />;
    if (artifact.artifact_type === 'dream_analysis') return <DreamAnalysisCard data={artifact.data} accent={accent} />;
    if (artifact.artifact_type === 'defenses') return <DefensesCard data={artifact.data} accent={accent} />;
    if (artifact.artifact_type === 'unconscious_face') return <UnconsciousFaceCard data={artifact.data} accent={accent} />;
    if (artifact.artifact_type === 'paranoid_critical') return <ParanoidCriticalCard data={artifact.data} accent={accent} />;
    return null;
}
