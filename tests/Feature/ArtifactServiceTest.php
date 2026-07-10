<?php

use App\Models\Artifact;
use App\Models\Character;
use App\Models\User;
use Database\Seeders\CharacterSeeder;

beforeEach(function () {
    $this->seed(CharacterSeeder::class);
});

it('persists an artifact with json data and relations', function () {
    $user = User::factory()->create();
    $frida = Character::where('slug', 'frida')->firstOrFail();

    $artifact = Artifact::factory()->create([
        'user_id' => $user->id,
        'character_id' => $frida->id,
        'type' => 'receta',
        'title' => 'Mole de olla',
        'data' => ['title' => 'Mole de olla', 'steps' => ['Hierve la carne']],
    ]);

    expect($artifact->fresh()->data['steps'])->toBe(['Hierve la carne'])
        ->and($artifact->character->slug)->toBe('frida')
        ->and($artifact->user->id)->toBe($user->id)
        ->and($artifact->status)->toBe('final');
});
