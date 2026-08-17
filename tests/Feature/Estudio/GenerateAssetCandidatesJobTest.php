<?php

use App\Jobs\GenerateAssetCandidatesJob;
use App\Models\AssetRequest;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake('public');
    config(['services.fal.key' => 'test-key']);
});

function fakeFalBatch(): void
{
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
}

it('generates candidates via text-to-image for a neutral sprite', function () {
    fakeFalBatch();

    $request = AssetRequest::factory()->create(['type' => 'sprite', 'emote' => 'neutral']);

    (new GenerateAssetCandidatesJob($request->id))->handle();

    expect($request->fresh())
        ->status->toBe('ready_for_review')
        ->candidates->toHaveCount(3);

    Http::assertSent(fn ($req) => str_contains($req->url(), 'fal.run')
        && ! isset($req['image_urls']) && ! isset($req['image_url']));
});

it('generates emote sprites as edits of the source image', function () {
    fakeFalBatch();
    Storage::disk('public')->put('asset-staging/sor-juana/neutral-approved.png', 'png');

    $request = AssetRequest::factory()->create([
        'type' => 'sprite', 'emote' => 'happy',
        'source_path' => 'asset-staging/sor-juana/neutral-approved.png',
    ]);

    (new GenerateAssetCandidatesJob($request->id))->handle();

    expect($request->fresh())->status->toBe('ready_for_review');

    // El path base de gpt-image ignora image_urls: los edits DEBEN ir a /edit.
    Http::assertSent(fn ($req) => str_contains($req->url(), 'gpt-image-2/edit')
        && (isset($req['image_urls']) || isset($req['image_url'])));
});

it('chains remove-background per sprite candidate when mode is rembg', function () {
    config(['estudio.transparency_mode' => 'rembg']);
    fakeFalBatch();

    $request = AssetRequest::factory()->create(['type' => 'sprite', 'emote' => 'neutral']);

    (new GenerateAssetCandidatesJob($request->id))->handle();

    expect($request->fresh())
        ->status->toBe('ready_for_review')
        ->candidates->toHaveCount(3);

    Http::assertSent(fn ($req) => str_contains($req->url(), 'birefnet'));
});

it('marks the request failed when fal errors', function () {
    Http::fake(['fal.run/*' => Http::response('boom', 500)]);

    $request = AssetRequest::factory()->create(['type' => 'background', 'emote' => null]);

    (new GenerateAssetCandidatesJob($request->id))->handle();

    expect($request->fresh())
        ->status->toBe('failed')
        ->error->not->toBeNull();
});
