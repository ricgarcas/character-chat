<?php

use App\Models\AssetRequest;

use function Pest\Laravel\get;

beforeEach(fn () => $this->withoutVite());

it('is not found outside the local environment', function () {
    $this->app['env'] = 'production';

    get('/estudio')->assertNotFound();
});

it('renders the production matrix with the 14 figures', function () {
    get('/estudio')->assertOk()->assertInertia(fn ($page) => $page
        ->component('estudio/index')
        ->has('figures', 14)
        ->where('figures.0.slug', 'frida')
        // Frida tiene sprites/avatars/backgrounds legado en public/ → approved
        ->where('figures.0.slots.sprite_neutral.status', 'approved')
        ->where('figures.0.slots.background.status', 'approved'));
});

it('derives slot statuses from requests and the kontext chain', function () {
    // Figura ficticia: las reales del roster van acumulando assets publicados
    // en public/ y sus estados dejarían de ser deterministas en tests.
    config(['estudio.figures' => [
        'test-x' => ['name' => 'Figura X', 'visual' => 'x', 'scene' => 'y'],
    ]]);

    AssetRequest::factory()->create([
        'character_slug' => 'test-x', 'type' => 'sprite',
        'emote' => 'neutral', 'status' => 'ready_for_review',
    ]);

    get('/estudio')->assertInertia(fn ($page) => $page
        ->component('estudio/index')
        ->where('figures.0.slug', 'test-x')
        ->where('figures.0.slots.sprite_neutral.status', 'review')
        // sin neutral aprobado, los emotes están bloqueados
        ->where('figures.0.slots.sprite_happy.status', 'blocked')
        ->where('figures.0.slots.background.status', 'empty'));
});
