<?php

namespace App\Jobs;

use App\Models\AssetRequest;
use App\Services\ImageGeneration\FalImageService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Throwable;

class GenerateAssetCandidatesJob implements ShouldQueue
{
    use Queueable;

    public int $timeout = 300;

    public int $tries = 1;

    public function __construct(public int $assetRequestId) {}

    public function handle(): void
    {
        $request = AssetRequest::findOrFail($this->assetRequestId);
        $request->update(['status' => 'generating', 'error' => null]);

        try {
            $fal = app(FalImageService::class);

            $opts = [
                'model' => $request->source_path
                    ? config('estudio.models.edit')
                    : config('estudio.models.default'),
                'num_images' => config('estudio.candidates_per_batch'),
                'folder' => "asset-staging/{$request->character_slug}",
                'output_format' => 'png',
                // fal sólo acepta tamaños con nombre; PublishAssetAction normaliza
                // después al spec exacto (1024×1024 / 1024×1536) con recorte cover.
                'image_size' => $request->type === 'avatar' ? 'square_hd' : 'portrait_4_3',
            ];

            // Transparencia nativa; la contingencia rembg vive en su propia rama.
            if ($request->type === 'sprite' && config('estudio.transparency_mode') === 'native') {
                $opts['extra'] = ['background' => 'transparent'];
            }

            $results = $request->source_path
                ? $fal->editBatch($request->prompt, $request->source_path, $opts)
                : $fal->generateBatch($request->prompt, $opts);

            if ($request->type === 'sprite' && config('estudio.transparency_mode') === 'rembg') {
                $results = $this->removeBackgrounds($fal, $results, $request->character_slug);
            }

            foreach ($results as $result) {
                $request->candidates()->create([
                    'path' => $result['path'],
                    'meta' => ['url' => $result['url']],
                ]);
            }

            $request->update(['status' => 'ready_for_review']);
        } catch (Throwable $e) {
            Log::error('GenerateAssetCandidatesJob failed', [
                'asset_request_id' => $this->assetRequestId,
                'error' => $e->getMessage(),
            ]);

            $request->update(['status' => 'failed', 'error' => $e->getMessage()]);
        }
    }

    /**
     * Contingencia del spec §2: si gpt-image no respeta `background: transparent`,
     * cada candidato pasa por un modelo de remove-background antes de guardarse.
     *
     * @param  list<array{path: string, url: string, raw: array<string,mixed>}>  $results
     * @return list<array{path: string, url: string, raw: array<string,mixed>}>
     */
    private function removeBackgrounds(FalImageService $fal, array $results, string $slug): array
    {
        return array_map(fn (array $result) => $fal->editBatch(
            prompt: 'remove background',
            sourcePhotoPath: $result['path'],
            opts: [
                'model' => config('estudio.models.rembg'),
                'num_images' => 1,
                'folder' => "asset-staging/{$slug}",
                'output_format' => 'png',
            ],
        )[0], $results);
    }
}
