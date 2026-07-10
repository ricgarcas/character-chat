<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Artifact extends Model
{
    /** @use HasFactory<\Database\Factories\ArtifactFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id', 'character_id', 'conversation_id', 'type',
        'title', 'data', 'status', 'parent_id', 'taller_key',
    ];

    protected function casts(): array
    {
        return [
            'data' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function character(): BelongsTo
    {
        return $this->belongsTo(Character::class);
    }
}
