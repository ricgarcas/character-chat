import type { Artifact } from '@/types/chat';
import PortraitCard from './PortraitCard';
import PaintingCard from './PaintingCard';
import ImagePendingCard from './ImagePendingCard';
import ToolBadge, { isInfoArtifact } from './ToolBadge';

interface Props {
    artifact: Artifact;
    accent: string;
    characterName?: string;
    characterSlug?: string;
}

export default function ArtifactCard({ artifact, accent, characterName = '', characterSlug = '' }: Props) {
    if (isInfoArtifact(artifact)) {
        return <ToolBadge mode="ready" artifact={artifact} accent={accent} />;
    }
    if (artifact.artifact_type === 'portrait')
        return <PortraitCard data={artifact.data} accent={accent} characterSlug={characterSlug} />;
    if (artifact.artifact_type === 'painting')
        return <PaintingCard data={artifact.data} accent={accent} characterSlug={characterSlug} />;
    if (artifact.artifact_type === 'image_pending')
        return <ImagePendingCard data={artifact.data} accent={accent} characterName={characterName} />;
    if (artifact.artifact_type === 'error') {
        return (
            <div
                className="border-2 border-[var(--ink)] bg-[var(--bg)] px-3 py-2 font-body text-sm text-[var(--ink)]"
                style={{ boxShadow: '3px 3px 0 0 var(--ink)' }}
            >
                ⚠ {artifact.data.message}
            </div>
        );
    }
    return null;
}
