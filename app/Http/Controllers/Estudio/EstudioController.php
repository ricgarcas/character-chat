<?php

namespace App\Http\Controllers\Estudio;

use App\Http\Controllers\Controller;
use App\Models\AssetRequest;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class EstudioController extends Controller
{
    private const EMOTES = ['neutral', 'happy', 'thinking', 'surprised'];

    public function index(): Response
    {
        $requests = AssetRequest::query()
            ->with('candidates')
            ->latest()
            ->get()
            ->groupBy(fn (AssetRequest $request) => "{$request->character_slug}|{$request->type}|{$request->emote}");

        $figures = collect(config('estudio.figures'))
            ->map(function (array $figure, string $slug) use ($requests) {
                $slots = [];

                foreach (self::EMOTES as $emote) {
                    $slots["sprite_{$emote}"] = $this->slotState($requests, $slug, 'sprite', $emote);
                }

                $slots['avatar'] = $this->slotState($requests, $slug, 'avatar', null);
                $slots['background'] = $this->slotState($requests, $slug, 'background', null);

                return ['slug' => $slug, 'name' => $figure['name'], 'slots' => $slots];
            })
            ->values();

        return Inertia::render('estudio/index', ['figures' => $figures]);
    }

    /**
     * @param  Collection<string, Collection<int, AssetRequest>>  $requests
     * @return array{status: string, request_id: int|null, pending_candidates: int}
     */
    private function slotState(Collection $requests, string $slug, string $type, ?string $emote): array
    {
        $latest = $requests->get("{$slug}|{$type}|{$emote}")?->first();

        $destination = match ($type) {
            'sprite' => public_path("sprites/{$slug}/{$emote}.png"),
            'avatar' => public_path("avatars/{$slug}/neutral.png"),
            'background' => public_path("backgrounds/{$slug}.png"),
        };

        $status = match (true) {
            $latest?->status === 'approved' || file_exists($destination) => 'approved',
            $latest?->status === 'ready_for_review' => 'review',
            $latest?->status === 'pending' => 'draft', // creado, prompt editable, aún sin disparar
            $latest?->status === 'generating' => 'generating',
            $latest?->status === 'failed' => 'failed',
            $type === 'sprite' && $emote !== 'neutral' && ! $this->hasNeutralSource($requests, $slug) => 'blocked',
            default => 'empty',
        };

        return [
            'status' => $status,
            'request_id' => $latest?->id,
            'pending_candidates' => $latest?->candidates->where('status', 'candidate')->count() ?? 0,
        ];
    }

    /**
     * Hay fuente para la cadena de consistencia: un neutral aprobado en el
     * Estudio, o un sprite/busto legado ya publicado en public/.
     *
     * @param  Collection<string, Collection<int, AssetRequest>>  $requests
     */
    private function hasNeutralSource(Collection $requests, string $slug): bool
    {
        return $requests->get("{$slug}|sprite|neutral")?->first()?->status === 'approved'
            || file_exists(public_path("sprites/{$slug}/neutral.png"))
            || file_exists(public_path("avatars/{$slug}/neutral.png"));
    }
}
