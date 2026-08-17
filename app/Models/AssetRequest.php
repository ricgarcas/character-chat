<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AssetRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'character_slug', 'type', 'emote', 'prompt',
        'source_candidate_id', 'source_path', 'status', 'error',
    ];

    public function candidates(): HasMany
    {
        return $this->hasMany(AssetCandidate::class);
    }

    /** Destino relativo a public/ (assets versionados en git). */
    public function destinationPath(): string
    {
        return match ($this->type) {
            'sprite' => "sprites/{$this->character_slug}/{$this->emote}.png",
            'avatar' => "avatars/{$this->character_slug}/neutral.png",
            'background' => "backgrounds/{$this->character_slug}.png",
        };
    }

    /**
     * Dimensiones objetivo según spec §2.
     *
     * @return array{int,int} [ancho, alto]
     */
    public function targetDimensions(): array
    {
        return match ($this->type) {
            'sprite', 'background' => [1024, 1536],
            'avatar' => [1024, 1024],
        };
    }
}
