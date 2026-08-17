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
    AssetRequest::factory()->create([
        'character_slug' => 'sor-juana', 'type' => 'sprite',
        'emote' => 'neutral', 'status' => 'ready_for_review',
    ]);

    get('/estudio')->assertInertia(fn ($page) => $page
        ->component('estudio/index')
        ->where('figures.4.slug', 'sor-juana')
        ->where('figures.4.slots.sprite_neutral.status', 'review')
        // sin neutral aprobado, los emotes están bloqueados
        ->where('figures.4.slots.sprite_happy.status', 'blocked')
        ->where('figures.4.slots.background.status', 'empty'));
});
