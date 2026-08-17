<?php

use App\Models\User;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\get;

// Landing pública pausada (sin guardrails de costo todavía). Los tests de la
// landing original viven en git — restaurarlos junto con LandingController@index.

it('redirects guests to the login page', function () {
    get('/')->assertRedirect(route('login', absolute: false));
});

it('redirects authenticated users straight to the chat', function () {
    actingAs(User::factory()->create())
        ->get('/')
        ->assertRedirect(route('chat.index', absolute: false));
});

it('does not expose a public registration route', function () {
    get('/register')->assertNotFound();
});
