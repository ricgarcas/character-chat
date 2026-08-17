<?php

namespace Database\Factories;

use App\Models\AssetRequest;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\AssetCandidate>
 */
class AssetCandidateFactory extends Factory
{
    public function definition(): array
    {
        return [
            'asset_request_id' => AssetRequest::factory(),
            'path' => 'asset-staging/sor-juana/'.Str::uuid().'.png',
            'status' => 'candidate',
            'meta' => null,
        ];
    }
}
