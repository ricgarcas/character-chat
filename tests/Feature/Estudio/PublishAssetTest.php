<?php

use App\Models\AssetCandidate;
use App\Models\AssetRequest;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

use function Pest\Laravel\post;

beforeEach(function () {
    $this->withoutVite();
    Storage::fake('public');
});

afterEach(function () {
    File::deleteDirectory(public_path('sprites/test-fixture'));
});

/** Crea un PNG real en staging con las dimensiones dadas. */
function stagePng(AssetRequest $request, int $width, int $height): AssetCandidate
{
    $image = imagecreatetruecolor($width, $height);
    imagesavealpha($image, true);
    imagefill($image, 0, 0, imagecolorallocatealpha($image, 255, 0, 0, 60));
    ob_start();
    imagepng($image);
    $bytes = ob_get_clean();

    $path = "asset-staging/{$request->character_slug}/candidate.png";
    Storage::disk('public')->put($path, $bytes);

    return AssetCandidate::factory()->for($request, 'request')->create(['path' => $path]);
}

it('publishes the approved candidate normalized to spec dimensions', function () {
    $request = AssetRequest::factory()->create([
        'character_slug' => 'test-fixture', 'type' => 'sprite',
        'emote' => 'neutral', 'status' => 'ready_for_review',
    ]);
    $candidate = stagePng($request, 512, 512); // dimensiones incorrectas a propósito
    $sibling = AssetCandidate::factory()->for($request, 'request')->create();

    post(route('estudio.candidates.approve', $candidate))->assertRedirect();

    expect($request->fresh())->status->toBe('approved')
        ->and($candidate->fresh())->status->toBe('approved')
        ->and($sibling->fresh())->status->toBe('rejected');

    $published = public_path('sprites/test-fixture/neutral.png');
    expect(file_exists($published))->toBeTrue();

    [$width, $height] = getimagesize($published);
    expect([$width, $height])->toBe([1024, 1536]);
});

it('rejects a candidate without touching the request status', function () {
    $request = AssetRequest::factory()->create(['status' => 'ready_for_review']);
    $candidate = AssetCandidate::factory()->for($request, 'request')->create();

    post(route('estudio.candidates.reject', $candidate))->assertRedirect();

    expect($candidate->fresh())->status->toBe('rejected')
        ->and($request->fresh())->status->toBe('ready_for_review');
});
