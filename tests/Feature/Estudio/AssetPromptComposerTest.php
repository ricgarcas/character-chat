<?php

use App\Services\Estudio\AssetPromptComposer;

it('composes a full-body neutral sprite prompt with the figure brief', function () {
    $prompt = app(AssetPromptComposer::class)->compose('sor-juana', 'sprite', 'neutral');

    expect($prompt)
        ->toContain('Sor Juana')
        ->toContain('Full-body')
        ->toContain('transparent background')
        ->toContain('pixel art');
});

it('composes emote edits as change-only instructions', function () {
    $prompt = app(AssetPromptComposer::class)->compose('sor-juana', 'sprite', 'happy');

    expect($prompt)
        ->toContain('Same exact character')
        ->toContain('joyful open smile') // el emote se expande a su dirección
        ->not->toContain('Full-body');   // los edits no re-describen al personaje
});

it('composes background prompts without people', function () {
    $prompt = app(AssetPromptComposer::class)->compose('nezahualcoyotl', 'background', null);

    expect($prompt)->toContain('no people')->toContain('Vertical 2:3');
});

it('has the 14 locked roster figures configured', function () {
    expect(config('estudio.figures'))->toHaveCount(14)
        ->toHaveKeys(['frida', 'dali', 'freud', 'beauvoir', 'sor-juana', 'einstein',
            'da-vinci', 'nezahualcoyotl', 'socrates', 'marie-curie', 'darwin',
            'van-gogh', 'cervantes', 'juarez']);
});
