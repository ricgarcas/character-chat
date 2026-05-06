<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Laravel\Ai\Contracts\Agent;

class Character extends Model
{
    protected $fillable = [
        'slug',
        'name',
        'tagline',
        'description',
        'avatar',
        'agent_class',
        'model',
        'active',
        'superpowers',
    ];

    protected $casts = [
        'active' => 'boolean',
        'superpowers' => 'array',
    ];

    public function agent(?string $photoPath = null, ?string $userMessage = null): Agent
    {
        return new ($this->agent_class)($this, $photoPath, $userMessage);
    }
}
