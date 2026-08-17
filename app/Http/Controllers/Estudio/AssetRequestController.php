<?php

namespace App\Http\Controllers\Estudio;

use App\Http\Controllers\Controller;
use App\Jobs\GenerateAssetCandidatesJob;
use App\Models\AssetCandidate;
use App\Models\AssetRequest;
use App\Services\Estudio\AssetPromptComposer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AssetRequestController extends Controller
{
    public function store(Request $request, AssetPromptComposer $composer): RedirectResponse
    {
        $data = $request->validate([
            'character_slug' => ['required', Rule::in(array_keys(config('estudio.figures')))],
            'type' => ['required', Rule::in(['sprite', 'avatar', 'background'])],
            'emote' => ['nullable', 'required_if:type,sprite', Rule::in(['neutral', 'happy', 'thinking', 'surprised'])],
            'prompt' => ['nullable', 'string', 'max:4000'],
        ]);

        $emote = $data['type'] === 'sprite' ? $data['emote'] : null;

        [$sourcePath, $sourceCandidateId] = $this->resolveSource($data['character_slug'], $data['type'], $emote);

        $assetRequest = AssetRequest::create([
            'character_slug' => $data['character_slug'],
            'type' => $data['type'],
            'emote' => $emote,
            'prompt' => $data['prompt'] ?? $composer->compose($data['character_slug'], $data['type'], $emote),
            'source_path' => $sourcePath,
            'source_candidate_id' => $sourceCandidateId,
        ]);

        // NO se despacha aquí: el request nace como borrador y el detalle muestra
        // el prompt editable; "Generar batch" llama regenerate (spec §4.2).
        return redirect()->route('estudio.requests.show', $assetRequest);
    }

    public function show(AssetRequest $assetRequest): Response
    {
        return Inertia::render('estudio/request', [
            'request' => [
                'id' => $assetRequest->id,
                'character_slug' => $assetRequest->character_slug,
                'character_name' => config("estudio.figures.{$assetRequest->character_slug}.name"),
                'type' => $assetRequest->type,
                'emote' => $assetRequest->emote,
                'prompt' => $assetRequest->prompt,
                'status' => $assetRequest->status,
                'error' => $assetRequest->error,
                'destination_url' => '/'.$assetRequest->destinationPath(),
            ],
            'candidates' => $assetRequest->candidates->map(fn (AssetCandidate $candidate) => [
                'id' => $candidate->id,
                'url' => Storage::disk('public')->url($candidate->path),
                'status' => $candidate->status,
            ])->values(),
        ]);
    }

    public function regenerate(Request $request, AssetRequest $assetRequest): RedirectResponse
    {
        $data = $request->validate(['prompt' => ['required', 'string', 'max:4000']]);

        $assetRequest->update(['prompt' => $data['prompt'], 'status' => 'pending', 'error' => null]);

        GenerateAssetCandidatesJob::dispatch($assetRequest->id);

        return redirect()->route('estudio.requests.show', $assetRequest);
    }

    /**
     * Cadena de consistencia (spec §4.2): los emotes y el busto se generan
     * editando el neutral aprobado, nunca desde cero.
     *
     * @return array{string|null, int|null} [source_path, source_candidate_id]
     */
    private function resolveSource(string $slug, string $type, ?string $emote): array
    {
        $needsSource = ($type === 'sprite' && $emote !== 'neutral') || $type === 'avatar';

        if (! $needsSource) {
            // Primer neutral de una figura legado: su busto sirve de referencia.
            if ($type === 'sprite' && $emote === 'neutral') {
                return [$this->stageLegacyFile("avatars/{$slug}/neutral.png", $slug), null];
            }

            return [null, null];
        }

        $approvedNeutral = AssetCandidate::query()
            ->where('status', 'approved')
            ->whereHas('request', fn ($query) => $query->where([
                'character_slug' => $slug, 'type' => 'sprite', 'emote' => 'neutral', 'status' => 'approved',
            ]))
            ->latest()
            ->first();

        if ($approvedNeutral) {
            return [$approvedNeutral->path, $approvedNeutral->id];
        }

        // Un sprite neutral ya publicado (ej. Frida) también sirve de fuente.
        if ($staged = $this->stageLegacyFile("sprites/{$slug}/neutral.png", $slug)) {
            return [$staged, null];
        }

        throw ValidationException::withMessages([
            'emote' => 'Primero aprueba el sprite neutral de esta figura (cadena de consistencia).',
        ]);
    }

    /** Copia un archivo de public/ al staging para poder usarlo como fuente de edit. */
    private function stageLegacyFile(string $publicRelative, string $slug): ?string
    {
        $absolute = public_path($publicRelative);

        if (! file_exists($absolute)) {
            return null;
        }

        $staged = "asset-staging/{$slug}/source-".basename($publicRelative);
        Storage::disk('public')->put($staged, (string) file_get_contents($absolute));

        return $staged;
    }
}
