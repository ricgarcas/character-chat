<?php

use App\Models\AssetCandidate;
use App\Models\AssetRequest;

it('creates a request with its candidates', function () {
    $request = AssetRequest::factory()->create([
        'character_slug' => 'sor-juana',
        'type' => 'sprite',
        'emote' => 'neutral',
    ]);

    $candidate = AssetCandidate::factory()->for($request, 'request')->create([
        'meta' => ['seed' => 42],
    ]);

    expect($request->candidates)->toHaveCount(1)
        ->and($candidate->request->id)->toBe($request->id)
        ->and($candidate->meta)->toBe(['seed' => 42])
        ->and($request->status)->toBe('pending');
});

it('resolves the destination path per asset type', function (string $type, ?string $emote, string $expected) {
    $request = AssetRequest::factory()->make([
        'character_slug' => 'sor-juana', 'type' => $type, 'emote' => $emote,
    ]);

    expect($request->destinationPath())->toBe($expected);
})->with([
    ['sprite', 'happy', 'sprites/sor-juana/happy.png'],
    ['avatar', null, 'avatars/sor-juana/neutral.png'],
    ['background', null, 'backgrounds/sor-juana.png'],
]);

it('resolves target dimensions per asset type', function () {
    $sprite = AssetRequest::factory()->make(['type' => 'sprite', 'emote' => 'neutral']);
    $avatar = AssetRequest::factory()->make(['type' => 'avatar', 'emote' => null]);

    expect($sprite->targetDimensions())->toBe([1024, 1536])
        ->and($avatar->targetDimensions())->toBe([1024, 1024]);
});
