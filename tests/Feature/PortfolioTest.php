<?php

use App\Models\Artifact;
use App\Models\Character;
use App\Models\User;
use Database\Seeders\CharacterSeeder;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\get;

beforeEach(function () {
    $this->seed(CharacterSeeder::class);
    // La página React se crea en la Task 8; sin build no está en el manifest de Vite.
    $this->withoutVite();
});

it('requires authentication', function () {
    get(route('portfolio.index'))->assertRedirect(route('login'));
});

it('shows only the authenticated user\'s finished artifacts, newest first', function () {
    $user = User::factory()->create();
    $other = User::factory()->create();
    $frida = Character::where('slug', 'frida')->firstOrFail();

    $old = Artifact::factory()->create([
        'user_id' => $user->id, 'character_id' => $frida->id,
        'type' => 'receta', 'title' => 'Tamales', 'created_at' => now()->subDay(),
    ]);
    $new = Artifact::factory()->create([
        'user_id' => $user->id, 'character_id' => $frida->id,
        'type' => 'portrait', 'title' => 'Raíz y vuelo',
        'data' => ['title' => 'Raíz y vuelo', 'image_url' => 'https://fal.example/i.jpg'],
    ]);
    Artifact::factory()->create([ // pendiente: excluido
        'user_id' => $user->id, 'character_id' => $frida->id, 'type' => 'image_pending',
    ]);
    Artifact::factory()->create([ // de otro usuario: excluido
        'user_id' => $other->id, 'character_id' => $frida->id, 'type' => 'receta',
    ]);

    actingAs($user)->get(route('portfolio.index'))
        ->assertInertia(fn ($page) => $page
            ->component('portfolio/index')
            ->has('artifacts', 2)
            ->where('artifacts.0.id', $new->id)
            ->where('artifacts.0.character.slug', 'frida')
            ->where('artifacts.1.id', $old->id)
        );
});
