<?php

namespace Database\Factories;

use App\Models\Character;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\Artifact>
 */
class ArtifactFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'character_id' => Character::query()->inRandomOrder()->value('id') ?? 1,
            'conversation_id' => $this->faker->uuid(),
            'type' => 'receta',
            'title' => $this->faker->sentence(3),
            'data' => ['title' => $this->faker->sentence(3)],
            'status' => 'final',
        ];
    }
}
