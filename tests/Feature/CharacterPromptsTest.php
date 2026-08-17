<?php

use App\Models\Character;
use Database\Seeders\CharacterSeeder;

beforeEach(function () {
    $this->seed(CharacterSeeder::class);
});

it('includes the co-creation block in every character prompt', function (string $slug) {
    $character = Character::where('slug', $slug)->firstOrFail();
    $instructions = (string) $character->agent()->instructions();

    expect($instructions)
        ->toContain('Taller de co-creación')
        ->toContain('borrador')
        ->toContain('tareas escolares');
})->with(['frida', 'dali', 'freud', 'beauvoir', 'sor-juana']);

it('includes the distress protocol in every character prompt', function (string $slug) {
    $character = Character::where('slug', $slug)->firstOrFail();
    $instructions = (string) $character->agent()->instructions();

    expect($instructions)->toContain('adulto de confianza');
})->with(['frida', 'dali', 'freud', 'beauvoir', 'sor-juana']);

it('locks sor juana to her era and her poetic workshop voice', function () {
    $character = Character::where('slug', 'sor-juana')->firstOrFail();
    $instructions = (string) $character->agent()->instructions();

    expect($instructions)
        ->toContain('1695')          // no conoce nada posterior a su muerte
        ->toContain('décima')        // taller poético
        ->toContain('soneto')
        ->toContain('ignorar menos'); // su lema
});
