<?php

use App\Models\Character;
use App\Models\User;
use Database\Seeders\CharacterSeeder;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    $this->seed(CharacterSeeder::class);
    $this->withoutVite();
});

it('lists roster figures not yet built as upcoming', function () {
    // Con el roster completo ya no hay figuras pendientes; desactivamos una
    // para verificar que el mecanismo de cartas bloqueadas sigue funcionando.
    Character::where('slug', 'einstein')->update(['active' => false]);

    actingAs(User::factory()->create())->get('/chat')->assertInertia(fn ($page) => $page
        ->has('characters')
        ->has('upcoming')
        ->where('upcoming', fn ($upcoming) => collect($upcoming)->pluck('slug')->contains('einstein')
            && ! collect($upcoming)->pluck('slug')->contains('frida')));
});

it('shows no upcoming figures when the full roster is built', function () {
    actingAs(User::factory()->create())->get('/chat')->assertInertia(fn ($page) => $page
        ->has('characters', 14)
        ->where('upcoming', fn ($upcoming) => collect($upcoming)->isEmpty()));
});
