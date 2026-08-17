<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\AssetRequest>
 */
class AssetRequestFactory extends Factory
{
    public function definition(): array
    {
        return [
            'character_slug' => 'sor-juana',
            'type' => 'sprite',
            'emote' => 'neutral',
            'prompt' => 'test prompt',
            'status' => 'pending',
        ];
    }
}
