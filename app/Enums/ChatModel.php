<?php

namespace App\Enums;

enum ChatModel: string
{
    case Haiku = 'haiku';
    case Sonnet = 'sonnet';
    case Opus = 'opus';

    /**
     * Model id for the currently-latest release in each tier. Bump these
     * three lines when Anthropic ships a new generation — nothing else
     * in the app needs to change.
     */
    public function modelId(): string
    {
        return match ($this) {
            self::Haiku => 'claude-haiku-4-5-20251001',
            self::Sonnet => 'claude-sonnet-5',
            self::Opus => 'claude-opus-4-8',
        };
    }

    public static function current(): self
    {
        return self::tryFrom((string) config('chat.model')) ?? self::Sonnet;
    }
}
