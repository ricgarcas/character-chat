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
})->with(['frida', 'dali', 'freud', 'beauvoir']);

it('includes the distress protocol in every character prompt', function (string $slug) {
    $character = Character::where('slug', $slug)->firstOrFail();
    $instructions = (string) $character->agent()->instructions();

    expect($instructions)->toContain('adulto de confianza');
})->with(['frida', 'dali', 'freud', 'beauvoir']);
