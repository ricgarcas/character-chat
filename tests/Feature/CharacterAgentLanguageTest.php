<?php

use App\Agents\FreudAgent;
use App\Models\Character;

it('appends the english language directive to instructions when locale is en', function (): void {
    app()->setLocale('en');

    $character = new Character([
        'slug' => 'freud',
        'name' => 'Sigmund Freud',
        'tagline' => ['en' => 'x', 'es' => 'x'],
        'description' => ['en' => 'x', 'es' => 'x'],
        'agent_class' => FreudAgent::class,
        'model' => 'claude-opus-4-6',
        'active' => true,
        'superpowers' => [],
    ]);

    $instructions = (string) (new FreudAgent($character))->instructions();

    expect($instructions)->toContain('Respond ENTIRELY in English');
});

it('appends the spanish language directive when locale is es', function (): void {
    app()->setLocale('es');

    $character = new Character([
        'slug' => 'freud',
        'name' => 'Sigmund Freud',
        'tagline' => ['en' => 'x', 'es' => 'x'],
        'description' => ['en' => 'x', 'es' => 'x'],
        'agent_class' => FreudAgent::class,
        'model' => 'claude-opus-4-6',
        'active' => true,
        'superpowers' => [],
    ]);

    $instructions = (string) (new FreudAgent($character))->instructions();

    expect($instructions)->toContain('Responde ENTERAMENTE en español');
});
