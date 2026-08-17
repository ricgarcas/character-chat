<?php

use App\Models\AssetRequest;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

use function Pest\Laravel\post;

beforeEach(function () {
    $this->withoutVite();
    Storage::fake('public');
    config([
        'services.fal.key' => 'test-key',
        'estudio.figures.test-e2e' => [
            'name' => 'Figura E2E',
            'visual' => 'test figure',
            'scene' => 'test scene',
        ],
    ]);
});

afterEach(fn () => File::deleteDirectory(public_path('sprites/test-e2e')));

it('runs the full flow: request → job → review → approve → published png', function () {
    $image = imagecreatetruecolor(100, 150);
    imagesavealpha($image, true);
    ob_start();
    imagepng($image);
    $png = ob_get_clean();

    Http::fake([
        'fal.run/*' => Http::response(['images' => [['url' => 'https://fal.media/a.png']]]),
        'fal.media/*' => Http::response($png),
    ]);

    // 1. Crear el request (nace borrador, sin dispatch)
    post(route('estudio.requests.store'), [
        'character_slug' => 'test-e2e', 'type' => 'sprite', 'emote' => 'neutral',
    ]);

    $request = AssetRequest::sole();
    expect($request->status)->toBe('pending');

    // 2. Disparar el batch (queue sync en tests → el job corre inline)
    post(route('estudio.requests.regenerate', $request), ['prompt' => $request->prompt]);

    expect($request->fresh()->status)->toBe('ready_for_review')
        ->and($request->fresh()->candidates)->toHaveCount(1);

    // 3. Aprobar el candidato
    post(route('estudio.candidates.approve', $request->fresh()->candidates->first()));

    // 4. PNG publicado y normalizado al spec
    $published = public_path('sprites/test-e2e/neutral.png');
    expect(file_exists($published))->toBeTrue();

    [$width, $height] = getimagesize($published);
    expect([$width, $height])->toBe([1024, 1536])
        ->and($request->fresh()->status)->toBe('approved');
});
