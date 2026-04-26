export interface Character {
    id: number;
    slug: string;
    name: string;
    tagline: string;
    description: string;
    avatar: string | null;
    model: string;
    active: boolean;
    superpowers: Superpower[] | null;
    default_situation?: string | null;
}

export type EmoteKey = 'neutral' | 'happy' | 'thinking' | 'surprised';

export interface Superpower {
    key: string;
    name: string;
    icon: string;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    created_at: string;
    image_url?: string | null;
    artifacts?: Artifact[];
}

export interface RecetaArtifact {
    artifact_type: 'receta';
    data: {
        title: string;
        servings: string;
        time: string;
        ingredients: { amount: string; name: string }[];
        steps: string[];
        frida_note: string;
    };
}

export interface ReadingArtifact {
    artifact_type: 'reading';
    data: {
        observation: string;
        verdict: string;
        palette: { name: string; hex: string }[];
        metaphor: string;
        photo_url: string | null;
    };
}

export interface PortraitArtifact {
    artifact_type: 'portrait';
    data: {
        title: string;
        image_url: string;
    };
}

export interface PaintingArtifact {
    artifact_type: 'painting';
    data: {
        title: string;
        image_url: string;
    };
}

export type ImageKind = 'portrait' | 'painting';

export interface ImagePendingArtifact {
    artifact_type: 'image_pending';
    data: {
        job_id: string;
        kind: ImageKind;
        title: string;
        image_url?: string | null;
        error?: string | null;
    };
}

export interface ErrorArtifact {
    artifact_type: 'error';
    data: { message: string };
}

export interface DreamAnalysisArtifact {
    artifact_type: 'dream_analysis';
    data: {
        manifest_content: string;
        latent_content: string;
        symbols: { image: string; meaning: string }[];
        interpretation: string;
        question_for_couch: string;
    };
}

export interface DefensesArtifact {
    artifact_type: 'defenses';
    data: {
        scene: string;
        mechanisms: { name: string; evidence: string }[];
        protective_function: string;
        cost: string;
    };
}

export interface UnconsciousFaceArtifact {
    artifact_type: 'unconscious_face';
    data: {
        observation: string;
        inferred_tension: string;
        visible_defense: string;
        question_for_couch: string;
        photo_url: string | null;
    };
}

export interface ParanoidCriticalArtifact {
    artifact_type: 'paranoid_critical';
    data: {
        subject: string;
        apparent: string;
        visions: { title: string; vision: string }[];
        synthesis: string;
        signature: string;
    };
}

export type Artifact =
    | RecetaArtifact
    | ReadingArtifact
    | PortraitArtifact
    | PaintingArtifact
    | ImagePendingArtifact
    | ParanoidCriticalArtifact
    | DreamAnalysisArtifact
    | DefensesArtifact
    | UnconsciousFaceArtifact
    | ErrorArtifact;
