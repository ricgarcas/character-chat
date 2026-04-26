<?php

namespace App\Tools\Dali;

use App\Jobs\GenerateImageJob;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\Support\Str;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;

class PintarSurreal implements Tool
{
    public function description(): string
    {
        return <<<'TXT'
Pinta un cuadro surreal a partir de un sujeto/objeto/tema que el usuario te haya dado. Llama esta tool SOLO cuando el usuario te pida explícitamente que pintes / inventes / hagas un cuadro surreal Y ya te haya dicho de qué.

TÚ debes pasar:
- `subject`: 1-3 palabras EN INGLÉS sobre el sujeto principal del cuadro (ej: "a piano", "my grandmother's hands", "a desert highway").
- `vision`: descripción visual rica EN INGLÉS de lo que pintas — composición, distorsiones, símbolos que orbitan al sujeto, paleta. 3-5 oraciones, sensorial y concreta.
  IMPORTANTE: NO menciones tu propio nombre ni el de ningún artista real (no "in the style of Salvador Dalí", no "a Dalí painting"). Describe el estilo a través de sus rasgos visuales (hyperreal Mediterranean surrealism, melting biomorphic forms, Old-Master technique, ants and crutches, dry Catalan coastline, burnt umber palette). El filtro de contenido del modelo rechaza referencias a personas reales por nombre.
- `title`: título del cuadro, breve y enigmático, en español, en tu voz teatral.

NO uses esta tool si el usuario no te ha dado un tema. NO la llames mientras solo conversas o cuentas un sueño.

El cuadro tarda en pintarse — la tool devuelve inmediatamente un placeholder y la imagen aparece después en el chat. Después de llamarla, comenta brevemente en voz de Dalí que la tela ya está siendo invadida.
TXT;
    }

    public function handle(Request $request): string
    {
        $userId = auth()->id();
        if (! $userId) {
            return json_encode([
                'artifact_type' => 'error',
                'data' => ['message' => 'No hay usuario autenticado.'],
            ], JSON_UNESCAPED_UNICODE);
        }

        $subject = (string) $request['subject'];
        $vision = (string) $request['vision'];
        $title = (string) $request['title'];
        $jobId = (string) Str::uuid();

        $fullPrompt = <<<PROMPT
A hand-painted oil painting in the style of mid-20th-century hyperrealistic Mediterranean surrealism.

Medium: oil on canvas, smooth Old-Master technique, no visible brushwork, photographic precision in the rendering.
Setting: a vast empty plain or shallow bay along an arid Catalan coastline, dry rocks, deep recessional perspective, low horizon, late-afternoon light casting very long shadows.
Palette: burnt umber, ochre, sandstone, Mediterranean sky blue, with isolated saturated reds.
Iconography: dreamlike incongruities, soft melting biomorphic forms, isolated symbolic objects scattered across the plain — distorted clocks, eggs, ants, crutches, ornate drawers, levitating spheres — used sparingly, never crowded.
Composition: a single primary subject placed deliberately in the foreground or middle ground, surrounded by surreal symbolic elements that comment on it.
Tone: silent, theatrical, slightly menacing, scientifically precise yet impossible.

Primary subject: {$subject}

Specific vision for this painting:
{$vision}

Painting title: "{$title}"
PROMPT;

        GenerateImageJob::dispatch(
            userId: $userId,
            jobId: $jobId,
            kind: 'painting',
            title: $title,
            prompt: $fullPrompt,
            sourcePhotoPath: null,
            folder: 'generated/dali',
            opts: ['image_size' => 'landscape_4_3'],
        );

        return json_encode([
            'artifact_type' => 'image_pending',
            'data' => [
                'job_id' => $jobId,
                'kind' => 'painting',
                'title' => $title,
            ],
        ], JSON_UNESCAPED_UNICODE);
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'subject' => $schema->string()
                ->description('1-3 word English noun phrase for the painting subject (e.g. "a piano", "a desert highway"). Comes from what the user told you.')
                ->required(),
            'vision' => $schema->string()
                ->description('Rich English description of the painting: composition, distortions, symbols around the subject, palette. 3-5 sentences. NO real artist names.')
                ->required(),
            'title' => $schema->string()
                ->description('Título breve y enigmático en voz de Dalí.')
                ->required(),
        ];
    }
}
