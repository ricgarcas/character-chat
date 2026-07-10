// Stub inicial — la UI completa se construye en la Task 8 del plan.
interface PortfolioArtifact {
    id: number;
    type: string;
    title: string | null;
    data: Record<string, unknown>;
    created_at: string;
    character: { slug: string; name: string };
}

export default function PortfolioIndex({ artifacts }: { artifacts: PortfolioArtifact[] }) {
    return <div data-testid="portfolio-count">{artifacts.length}</div>;
}
