<?php

use App\Services\ImageGeneration\FalImageService;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake('public');
    config(['services.fal.key' => 'test-key']);
});

it('stores every image of a batch', function () {
    Http::fake([
        'fal.run/*' => Http::response([
            'images' => [
                ['url' => 'https://fal.media/a.png'],
                ['url' => 'https://fal.media/b.png'],
                ['url' => 'https://fal.media/c.png'],
            ],
        ]),
        'fal.media/*' => Http::response('png-bytes'),
    ]);

    $results = app(FalImageService::class)->generateBatch('a prompt', [
        'num_images' => 3,
        'folder' => 'asset-staging/sor-juana',
    ]);

    expect($results)->toHaveCount(3);

    foreach ($results as $result) {
        Storage::disk('public')->assertExists($result['path']);
        expect($result['path'])->toStartWith('asset-staging/sor-juana/');
    }
});

it('keeps the single-image API intact', function () {
    Http::fake([
        'fal.run/*' => Http::response(['images' => [['url' => 'https://fal.media/a.png']]]),
        'fal.media/*' => Http::response('png-bytes'),
    ]);

    $result = app(FalImageService::class)->generate('a prompt', ['folder' => 'generated']);

    expect($result)->toHaveKeys(['path', 'url', 'raw']);
});

it('edits a batch from a source image', function () {
    Http::fake([
        'fal.run/*' => Http::response([
            'images' => [
                ['url' => 'https://fal.media/a.png'],
                ['url' => 'https://fal.media/b.png'],
            ],
        ]),
        'fal.media/*' => Http::response('png-bytes'),
    ]);

    Storage::disk('public')->put('asset-staging/source.png', 'png-bytes');

    $results = app(FalImageService::class)->editBatch('edit it', 'asset-staging/source.png', [
        'num_images' => 2,
        'folder' => 'asset-staging/sor-juana',
    ]);

    expect($results)->toHaveCount(2);

    Http::assertSent(fn ($request) => str_contains($request->url(), 'fal.run')
        && (isset($request['image_urls']) || isset($request['image_url'])));
});
