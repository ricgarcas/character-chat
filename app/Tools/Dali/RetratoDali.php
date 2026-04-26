<?php

namespace App\Tools\Dali;

use App\Jobs\GenerateImageJob;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\Support\Str;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;

class RetratoDali implements Tool
{
    public function __construct(protected ?string $photoPath = null) {}

    public function description(): string
    {
        return <<<'TXT'
Pinta un retrato del usuario al óleo surrealista a partir de la foto que adjuntó. Llama esta tool SOLO si el usuario adjuntó una foto y te pide que lo pintes / hagas un retrato suyo / lo metas en uno de tus cuadros.

TÚ debes pasar:
- `style_prompt`: descripción visual rica EN INGLÉS de qué símbolos surrealistas pondrás alrededor del sujeto, qué hace el paisaje, qué objetos imposibles flotan. 3-5 oraciones, sensorial y concreta. Piensa en relojes derretidos, hormigas, costas catalanas vacías, sombras alargadas, huevos, muletas — pero úsalos con criterio.
  IMPORTANTE: NO menciones tu propio nombre ni el de ningún artista real (no "in the style of Salvador Dalí", no "a Dalí painting"). Describe el estilo SOLO a través de sus rasgos visuales (hyperreal Old-Master oil technique, dry Catalan coastline, melting biomorphic forms, ants, elongated shadows). El nombrarte hace que el modelo te ponga TUS rasgos físicos al usuario — bigote, cara — y arruina el retrato.
- `title`: título del cuadro, breve y enigmático, en español, en tu voz teatral.

NO uses esta tool si no hay foto adjunta. NO la llames si el usuario solo está conversando.

El cuadro tarda en pintarse — la tool devuelve inmediatamente un placeholder y la imagen aparece después en el chat. Después de llamarla, comenta brevemente en voz de Dalí que la tela ya está siendo invadida.
TXT;
    }

    public function handle(Request $request): string
    {
        if (! $this->photoPath) {
            return json_encode([
                'artifact_type' => 'error',
                'data' => ['message' => 'No hay foto adjunta — pídele al usuario que suba una.'],
            ], JSON_UNESCAPED_UNICODE);
        }

        $userId = auth()->id();
        if (! $userId) {
            return json_encode([
                'artifact_type' => 'error',
                'data' => ['message' => 'No hay usuario autenticado.'],
            ], JSON_UNESCAPED_UNICODE);
        }

        $stylePrompt = (string) $request['style_prompt'];
        $title = (string) $request['title'];
        $jobId = (string) Str::uuid();

        $fullPrompt = <<<PROMPT
Keep the person in the reference image EXACTLY as they appear: identical face, identical features, identical eyebrows, identical nose, identical mouth, identical facial hair only as already present in the photo (do NOT add a curled handlebar mustache, do NOT add any thick mustache, do NOT add a soul patch or goatee, do NOT change their hairstyle, do NOT add jewelry or accessories), identical glasses if any, identical clothing, identical pose. Their identity must remain absolutely unchanged.

Transform only the medium and background into a meticulously painted hyperreal oil painting in the tradition of mid-20th-century Mediterranean surrealism:

Medium: oil on canvas, smooth Old-Master technique, no visible brushwork, photographic precision in the rendering.
Setting: behind the subject, replace the original background with a vast empty plain or shallow bay along an arid Catalan coastline — dry rocks, deep recessional perspective, low horizon, late-afternoon light casting very long shadows.
Palette: burnt umber, ochre, sandstone, Mediterranean sky blue gradient to deep cobalt, with isolated saturated reds.
Iconography: dreamlike incongruities placed sparingly around the subject — soft melting biomorphic forms, distorted clocks dripping over a barren leafless tree branch, tiny black ants, isolated symbolic objects (eggs, crutches, ornate drawers, levitating spheres) — never crowded.
Tone: silent, theatrical, slightly menacing, scientifically precise yet impossible.

Specific direction for this portrait:
{$stylePrompt}

Painting title: "{$title}"
PROMPT;

        GenerateImageJob::dispatch(
            userId: $userId,
            jobId: $jobId,
            kind: 'portrait',
            title: $title,
            prompt: $fullPrompt,
            sourcePhotoPath: $this->photoPath,
            folder: 'generated/dali',
            opts: [
                'model' => 'fal-ai/flux-pro/kontext',
                'aspect_ratio' => '3:4',
                'guidance_scale' => 3.0,
                'output_format' => 'jpeg',
            ],
        );

        return json_encode([
            'artifact_type' => 'image_pending',
            'data' => [
                'job_id' => $jobId,
                'kind' => 'portrait',
                'title' => $title,
            ],
        ], JSON_UNESCAPED_UNICODE);
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'style_prompt' => $schema->string()
                ->description('Rich English description of the surrealist symbols, landscape, and impossible objects around the subject. 3-5 sensory, concrete sentences. NO real artist names — describe only visual traits.')
                ->required(),
            'title' => $schema->string()
                ->description('Título del cuadro, breve y enigmático, en voz teatral de Dalí.')
                ->required(),
        ];
    }
}
