<?php

use App\Models\Artifact;
use App\Models\Character;
use App\Models\User;
use Database\Seeders\CharacterSeeder;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\get;

beforeEach(function () {
    $this->seed(CharacterSeeder::class);
    $this->withoutVite();
});

it('shares the portfolio count with authenticated pages', function () {
    $user = User::factory()->create();
    Artifact::factory()->count(3)->create([
        'user_id' => $user->id,
        'character_id' => Character::where('slug', 'frida')->first()->id,
    ]);

    actingAs($user)->get('/chat')->assertInertia(fn ($page) => $page
        ->where('portfolioCount', 3));
});

it('shares zero for guests', function () {
    get('/login')->assertInertia(fn ($page) => $page->where('portfolioCount', 0));
});
