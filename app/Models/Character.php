<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
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
        'tagline' => 'array',
        'description' => 'array',
        'superpowers' => 'array',
    ];

    public function agent(?string $photoPath = null, ?string $userMessage = null): Agent
    {
        return new ($this->agent_class)($this, $photoPath, $userMessage);
    }

    protected function tagline(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => $this->localizedString($value),
        );
    }

    protected function description(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => $this->localizedString($value),
        );
    }

    protected function superpowers(): Attribute
    {
        return Attribute::make(
            get: function ($value) {
                $list = is_string($value) ? json_decode($value, true) : $value;

                if (! is_array($list)) {
                    return null;
                }

                return array_map(function (array $sp): array {
                    $sp['name'] = $this->localizedString($sp['name'] ?? null);

                    return $sp;
                }, $list);
            },
        );
    }

    /**
     * Resolve a possibly-localized value to a plain string for the active locale.
     * Accepts ['en' => '...', 'es' => '...'] or a raw string.
     */
    private function localizedString(mixed $value): ?string
    {
        if ($value === null) {
            return null;
        }

        if (is_string($value)) {
            $decoded = json_decode($value, true);
            $value = is_array($decoded) ? $decoded : $value;
        }

        if (is_string($value)) {
            return $value;
        }

        if (is_array($value)) {
            $locale = app()->getLocale();

            return $value[$locale] ?? $value['en'] ?? $value[array_key_first($value)] ?? null;
        }

        return null;
    }
}
