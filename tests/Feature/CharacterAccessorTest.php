<?php

use App\Models\Character;

it('returns the active locale string for tagline and description', function (): void {
    $character = new Character([
        'slug' => 'test',
        'name' => 'Test',
        'tagline' => ['en' => 'Hello', 'es' => 'Hola'],
        'description' => ['en' => 'A test', 'es' => 'Una prueba'],
        'agent_class' => 'App\\Agents\\FreudAgent',
        'model' => 'claude-opus-4-6',
        'active' => true,
        'superpowers' => [
            ['key' => 'k', 'name' => ['en' => 'Power', 'es' => 'Poder'], 'icon' => '⚡'],
        ],
    ]);

    app()->setLocale('en');
    expect($character->tagline)->toBe('Hello')
        ->and($character->description)->toBe('A test')
        ->and($character->superpowers[0]['name'])->toBe('Power');

    app()->setLocale('es');
    expect($character->tagline)->toBe('Hola')
        ->and($character->description)->toBe('Una prueba')
        ->and($character->superpowers[0]['name'])->toBe('Poder');
});

it('falls back to english when the active locale is missing', function (): void {
    $character = new Character([
        'slug' => 'test',
        'name' => 'Test',
        'tagline' => ['en' => 'Hello'],
        'description' => ['en' => 'A test'],
        'agent_class' => 'App\\Agents\\FreudAgent',
        'model' => 'claude-opus-4-6',
        'active' => true,
        'superpowers' => [],
    ]);

    app()->setLocale('zz');
    expect($character->tagline)->toBe('Hello');
});
