import { Head, Link, router, useForm } from '@inertiajs/react';
import { index } from '@/routes/estudio';
import { approve, reject } from '@/routes/estudio/candidates';
import { regenerate } from '@/routes/estudio/requests';

type Candidate = { id: number; url: string; status: string };

type AssetReq = {
    id: number;
    character_slug: string;
    character_name: string;
    type: string;
    emote: string | null;
    prompt: string;
    status: string;
    error: string | null;
    destination_url: string;
};

// Fondo ajedrez para ver la transparencia de los sprites (spec §4.3).
const CHECKER: React.CSSProperties = {
    backgroundImage:
        'linear-gradient(45deg,#333 25%,transparent 25%),linear-gradient(-45deg,#333 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#333 75%),linear-gradient(-45deg,transparent 75%,#333 75%)',
    backgroundSize: '16px 16px',
    backgroundPosition: '0 0,0 8px,8px -8px,-8px 0',
    backgroundColor: '#222',
};

export default function EstudioRequest({ request, candidates }: { request: AssetReq; candidates: Candidate[] }) {
    const form = useForm({ prompt: request.prompt });
    const title = `${request.character_name} · ${request.type}${request.emote ? `:${request.emote}` : ''}`;

    return (
        <div className="min-h-svh bg-neutral-900 p-8 font-mono text-neutral-100">
            <Head title={title} />

            <header className="mb-6">
                <Link href={index().url} className="text-xs text-neutral-400 hover:text-white">
                    ← matriz
                </Link>
                <h1 className="mt-1 text-xl font-bold">{title}</h1>
                <p className="text-xs text-neutral-500">
                    estado: {request.status} · destino: {request.destination_url}
                </p>
                {request.error && <p className="mt-2 bg-red-950 p-2 text-xs text-red-300">{request.error}</p>}
            </header>

            {request.status === 'generating' && (
                <p className="mb-6 animate-pulse text-blue-300">⟳ Generando candidatos… recarga en unos segundos.</p>
            )}

            {candidates.length > 0 && (
                <div className="mb-8 grid grid-cols-3 gap-4">
                    {candidates.map((candidate) => (
                        <figure
                            key={candidate.id}
                            className={`border-2 p-2 ${
                                candidate.status === 'approved'
                                    ? 'border-green-400'
                                    : candidate.status === 'rejected'
                                      ? 'border-neutral-800 opacity-40'
                                      : 'border-neutral-600'
                            }`}
                        >
                            <div style={CHECKER} className="flex items-center justify-center">
                                <img
                                    src={candidate.url}
                                    alt=""
                                    className="max-h-96 w-full object-contain"
                                    style={{ imageRendering: 'pixelated' }}
                                />
                            </div>

                            {candidate.status === 'candidate' && (
                                <figcaption className="mt-2 flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => router.post(approve(candidate.id).url)}
                                        className="flex-1 bg-green-400 px-2 py-1 text-xs font-bold text-green-950 hover:opacity-80"
                                    >
                                        ✓ Aprobar y publicar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => router.post(reject(candidate.id).url)}
                                        className="bg-neutral-700 px-2 py-1 text-xs hover:opacity-80"
                                    >
                                        ✗
                                    </button>
                                </figcaption>
                            )}
                        </figure>
                    ))}
                </div>
            )}

            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    form.post(regenerate(request.id).url);
                }}
                className="max-w-2xl"
            >
                <label htmlFor="prompt" className="mb-1 block text-xs uppercase tracking-widest text-neutral-400">
                    Prompt (editable antes de generar)
                </label>
                <textarea
                    id="prompt"
                    value={form.data.prompt}
                    onChange={(event) => form.setData('prompt', event.target.value)}
                    rows={5}
                    className="w-full border border-neutral-600 bg-neutral-800 p-2 text-sm"
                />
                <button
                    type="submit"
                    disabled={form.processing || request.status === 'generating'}
                    className="mt-2 bg-blue-400 px-4 py-2 text-sm font-bold text-blue-950 hover:opacity-80 disabled:opacity-50"
                >
                    ⟳ {request.status === 'pending' ? 'Generar batch' : 'Regenerar batch'}
                </button>
            </form>
        </div>
    );
}
