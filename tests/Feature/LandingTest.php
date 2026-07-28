<?php

use App\Models\User;
use Database\Seeders\CharacterSeeder;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\get;

beforeEach(function () {
    $this->seed(CharacterSeeder::class);
    // La página React se crea en la Task 3; sin build no está en el manifest de Vite.
    $this->withoutVite();
});

it('is public and renders the landing page for guests', function () {
    get('/')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('landing'));
});

it('redirects authenticated users straight to the chat', function () {
    actingAs(User::factory()->create())
        ->get('/')
        ->assertRedirect('/chat');
});

it('passes the featured characters from config, in config order', function () {
    config()->set('landing.featured', ['dali', 'frida']);

    get('/')->assertInertia(fn ($page) => $page
        ->has('featured', 2)
        ->where('featured.0.slug', 'dali')
        ->where('featured.1.slug', 'frida')
        ->has('featured.0.superpowers')
    );
});

it('silently skips featured slugs that do not exist in the database', function () {
    config()->set('landing.featured', ['frida', 'no-existe']);

    get('/')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->has('featured', 1)->where('featured.0.slug', 'frida'));
});

it('passes upcoming, showcase and pricing from config', function () {
    get('/')->assertInertia(fn ($page) => $page
        ->has('upcoming')
        ->has('showcase')
        ->has('pricing', 3)
        ->where('pricing.0.available', true)
        ->where('pricing.1.available', false)
    );
});
