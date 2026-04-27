<?php

namespace App\Enums;

enum ChatModel: string
{
    case Opus47 = 'opus-4-7';
    case Sonnet46 = 'sonnet-4-6';

    public function modelId(): string
    {
        return match ($this) {
            self::Opus47 => 'claude-opus-4-7',
            self::Sonnet46 => 'claude-sonnet-4-6',
        };
    }

    public static function current(): self
    {
        return self::tryFrom((string) config('chat.model')) ?? self::Opus47;
    }
}
