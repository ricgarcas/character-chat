<?php

use App\Models\User;
use Database\Seeders\CharacterSeeder;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    $this->seed(CharacterSeeder::class);
    $this->withoutVite();
});

it('lists roster figures not yet built as upcoming', function () {
    actingAs(User::factory()->create())->get('/chat')->assertInertia(fn ($page) => $page
        ->has('characters')
        ->has('upcoming')
        // einstein vive en config('estudio.figures') pero no en el seeder
        ->where('upcoming', fn ($upcoming) => collect($upcoming)->pluck('slug')->contains('einstein')
            && ! collect($upcoming)->pluck('slug')->contains('frida')));
});
