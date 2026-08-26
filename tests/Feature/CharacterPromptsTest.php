<?php

use App\Models\Character;
use Database\Seeders\CharacterSeeder;

beforeEach(function () {
    $this->seed(CharacterSeeder::class);
});

$roster = [
    'frida', 'dali', 'freud', 'beauvoir', 'sor-juana',
    'einstein', 'da-vinci', 'nezahualcoyotl', 'socrates', 'marie-curie',
    'darwin', 'van-gogh', 'cervantes', 'juarez',
];

it('includes the co-creation block in every character prompt', function (string $slug) {
    $character = Character::where('slug', $slug)->firstOrFail();
    $instructions = (string) $character->agent()->instructions();

    expect($instructions)
        ->toContain('Taller de co-creación')
        ->toContain('borrador')
        ->toContain('tareas escolares');
})->with($roster);

it('includes the distress protocol in every character prompt', function (string $slug) {
    $character = Character::where('slug', $slug)->firstOrFail();
    $instructions = (string) $character->agent()->instructions();

    expect($instructions)->toContain('adulto de confianza');
})->with($roster);

it('locks sor juana to her era and her poetic workshop voice', function () {
    $character = Character::where('slug', 'sor-juana')->firstOrFail();
    $instructions = (string) $character->agent()->instructions();

    expect($instructions)
        ->toContain('1695')          // no conoce nada posterior a su muerte
        ->toContain('décima')        // taller poético
        ->toContain('soneto')
        ->toContain('ignorar menos'); // su lema
});

it('locks every figure to its own era', function (string $slug, string $cutoff) {
    $character = Character::where('slug', $slug)->firstOrFail();
    $instructions = (string) $character->agent()->instructions();

    expect($instructions)->toContain('No conoces NADA posterior')->toContain($cutoff);
})->with([
    ['einstein', '1955'],
    ['da-vinci', '1519'],
    ['nezahualcoyotl', '1472'],
    ['socrates', '399'],
    ['marie-curie', '1934'],
    ['darwin', '1882'],
    ['van-gogh', '1890'],
    ['cervantes', '1616'],
    ['juarez', '1872'],
]);

it('keeps each new figure anchored to its workshop', function (string $slug, string $marker) {
    $character = Character::where('slug', $slug)->firstOrFail();
    $instructions = (string) $character->agent()->instructions();

    expect($instructions)->toContain($marker);
})->with([
    ['einstein', 'EXPERIMENTOS MENTALES'],
    ['da-vinci', 'CUADERNO DE INVENTOS'],
    ['nezahualcoyotl', 'FLOR Y CANTO'],
    ['socrates', 'DIÁLOGO SOCRÁTICO'],
    ['marie-curie', 'DISEÑAR EXPERIMENTOS'],
    ['darwin', 'EXPEDICIÓN NATURALISTA'],
    ['van-gogh', 'PINTAR EMOCIONES'],
    ['cervantes', 'INVENTAR PERSONAJES'],
    ['juarez', 'QUÉ HARÍAS TÚ'],
]);

it('never gives answers as socrates', function () {
    $instructions = (string) Character::where('slug', 'socrates')->firstOrFail()->agent()->instructions();

    expect($instructions)->toContain('NUNCA das la respuesta');
});
