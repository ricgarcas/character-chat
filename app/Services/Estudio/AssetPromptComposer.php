<?php

namespace App\Services\Estudio;

use InvalidArgumentException;

class AssetPromptComposer
{
    /**
     * Compone el prompt de un asset a partir de la ficha de la figura.
     * El resultado es un borrador editable: el Estudio lo muestra antes de disparar.
     */
    public function compose(string $slug, string $type, ?string $emote): string
    {
        $figure = config("estudio.figures.{$slug}")
            ?? throw new InvalidArgumentException("Figura desconocida: {$slug}");

        $prompts = config('estudio.prompts');

        $template = match (true) {
            $type === 'sprite' && $emote === 'neutral' => $prompts['sprite_neutral'],
            $type === 'sprite' => $prompts['sprite_emote'],
            $type === 'avatar' => $prompts['avatar'],
            $type === 'background' => $prompts['background'],
            default => throw new InvalidArgumentException("Tipo desconocido: {$type}"),
        };

        return strtr($template, [
            '{name}' => $figure['name'],
            '{visual}' => $figure['visual'],
            '{scene}' => $figure['scene'],
            '{base}' => $prompts['base'],
            '{emote_direction}' => $emote ? (config("estudio.emote_directions.{$emote}") ?? $emote) : '',
        ]);
    }
}
