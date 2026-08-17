<?php

namespace App\Services\ImageGeneration;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;

class FalImageService
{
    protected string $apiKey;

    protected string $baseUrl = 'https://fal.run';

    protected int $timeout = 180;

    public function __construct(?string $apiKey = null)
    {
        $this->apiKey = $apiKey ?? (string) (config('services.fal.key') ?? env('FAL_KEY'));
    }

    /**
     * Edit a source image with a prompt (image-to-image).
     *
     * @param  array{quality?: string, image_size?: string, num_images?: int, output_format?: string, model?: string, folder?: string, disk?: string, extra?: array<string,mixed>}  $opts
     * @return array{path: string, url: string, raw: array<string,mixed>}
     */
    public function edit(string $prompt, string $sourcePhotoPath, array $opts = []): array
    {
        return $this->editBatch($prompt, $sourcePhotoPath, $opts)[0];
    }

    /**
     * Edit a source image and keep every image of the batch.
     *
     * @param  array<string,mixed>  $opts
     * @return list<array{path: string, url: string, raw: array<string,mixed>}>
     */
    public function editBatch(string $prompt, string $sourcePhotoPath, array $opts = []): array
    {
        $disk = $opts['disk'] ?? 'public';
        $imageDataUri = $this->fileToDataUri($sourcePhotoPath, $disk);
        $model = $opts['model'] ?? 'openai/gpt-image-2';

        return $this->runBatch($model, $this->buildEditPayload($prompt, $imageDataUri, $model, $opts), $opts);
    }

    /**
     * @param  array<string,mixed>  $opts
     * @return array<string,mixed>
     */
    protected function buildEditPayload(string $prompt, string $imageDataUri, string $model, array $opts): array
    {
        if ($this->isFluxKontext($model)) {
            $payload = [
                'prompt' => $prompt,
                'image_url' => $imageDataUri,
                'num_images' => $opts['num_images'] ?? 1,
                'output_format' => $opts['output_format'] ?? 'jpeg',
                'aspect_ratio' => $opts['aspect_ratio'] ?? '3:4',
                'guidance_scale' => $opts['guidance_scale'] ?? 3.0,
            ];
        } else {
            $payload = [
                'prompt' => $prompt,
                'image_urls' => [$imageDataUri],
                'quality' => $opts['quality'] ?? 'high',
                'output_format' => $opts['output_format'] ?? 'png',
                'num_images' => $opts['num_images'] ?? 1,
            ];

            if (isset($opts['image_size'])) {
                $payload['image_size'] = $opts['image_size'];
            }
        }

        if (isset($opts['extra']) && is_array($opts['extra'])) {
            $payload = array_merge($payload, $opts['extra']);
        }

        return $payload;
    }

    protected function isFluxKontext(string $model): bool
    {
        return str_contains($model, 'flux-pro/kontext') || str_contains($model, 'flux-kontext');
    }

    /**
     * Text-to-image generation.
     *
     * @param  array{quality?: string, image_size?: string, num_images?: int, output_format?: string, model?: string, folder?: string, disk?: string, extra?: array<string,mixed>}  $opts
     * @return array{path: string, url: string, raw: array<string,mixed>}
     */
    public function generate(string $prompt, array $opts = []): array
    {
        return $this->generateBatch($prompt, $opts)[0];
    }

    /**
     * Text-to-image generation keeping every image of the batch.
     *
     * @param  array<string,mixed>  $opts
     * @return list<array{path: string, url: string, raw: array<string,mixed>}>
     */
    public function generateBatch(string $prompt, array $opts = []): array
    {
        $payload = [
            'prompt' => $prompt,
            'quality' => $opts['quality'] ?? 'high',
            'output_format' => $opts['output_format'] ?? 'png',
            'num_images' => $opts['num_images'] ?? 1,
        ];

        if (isset($opts['image_size'])) {
            $payload['image_size'] = $opts['image_size'];
        }

        if (isset($opts['extra']) && is_array($opts['extra'])) {
            $payload = array_merge($payload, $opts['extra']);
        }

        return $this->runBatch($opts['model'] ?? 'openai/gpt-image-2', $payload, $opts);
    }

    /**
     * @param  array<string,mixed>  $payload
     * @param  array<string,mixed>  $opts
     * @return array{path: string, url: string, raw: array<string,mixed>}
     */
    protected function run(string $model, array $payload, array $opts): array
    {
        return $this->runBatch($model, $payload, $opts)[0];
    }

    /**
     * @param  array<string,mixed>  $payload
     * @param  array<string,mixed>  $opts
     * @return list<array{path: string, url: string, raw: array<string,mixed>}>
     */
    protected function runBatch(string $model, array $payload, array $opts): array
    {
        if (! $this->apiKey) {
            throw new RuntimeException('FAL_API_KEY is not configured.');
        }

        $url = rtrim($this->baseUrl, '/').'/'.ltrim($model, '/');

        Log::info('fal.ai request', [
            'url' => $url,
            'model' => $model,
            'payload_keys' => array_keys($payload),
            'image_urls_count' => isset($payload['image_urls']) ? count($payload['image_urls']) : 0,
            'prompt_preview' => mb_substr((string) ($payload['prompt'] ?? ''), 0, 200),
        ]);

        $response = $this->client()->post($url, $payload);

        if (! $response->successful()) {
            Log::error('fal.ai request failed', [
                'url' => $url,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            throw new RuntimeException(sprintf(
                'fal.ai request failed (%d): %s',
                $response->status(),
                $response->body(),
            ));
        }

        Log::info('fal.ai request ok', [
            'url' => $url,
            'status' => $response->status(),
            'has_images' => isset($response->json()['images']),
        ]);

        $body = $response->json();
        $images = array_values(array_filter(
            $body['images'] ?? [],
            fn ($image) => is_array($image) && isset($image['url']),
        ));

        if ($images === []) {
            throw new RuntimeException('fal.ai response missing images[].url: '.$response->body());
        }

        return array_map(
            fn (array $image) => $this->storeRemoteImage($image['url'], $body, $opts),
            $images,
        );
    }

    /**
     * @param  array<string,mixed>  $body
     * @param  array<string,mixed>  $opts
     * @return array{path: string, url: string, raw: array<string,mixed>}
     */
    protected function storeRemoteImage(string $remoteUrl, array $body, array $opts): array
    {
        $disk = $opts['disk'] ?? 'public';
        $folder = trim($opts['folder'] ?? 'generated', '/');
        $ext = $opts['output_format'] ?? 'png';
        $filename = sprintf('%s/%s.%s', $folder, Str::uuid(), $ext);

        $download = Http::timeout($this->timeout)->get($remoteUrl);
        if (! $download->successful()) {
            throw new RuntimeException("Failed to download generated image from {$remoteUrl}");
        }

        Storage::disk($disk)->put($filename, $download->body());

        return [
            'path' => $filename,
            'url' => Storage::disk($disk)->url($filename),
            'raw' => $body,
        ];
    }

    protected function client(): PendingRequest
    {
        return Http::withHeaders([
            'Authorization' => 'Key '.$this->apiKey,
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
        ])->timeout($this->timeout)->connectTimeout(15);
    }

    protected function fileToDataUri(string $path, string $disk): string
    {
        if (! Storage::disk($disk)->exists($path)) {
            throw new RuntimeException("Source image not found on disk [{$disk}]: {$path}");
        }

        $bytes = Storage::disk($disk)->get($path);
        $mime = Storage::disk($disk)->mimeType($path) ?: 'image/png';

        return 'data:'.$mime.';base64,'.base64_encode((string) $bytes);
    }
}
