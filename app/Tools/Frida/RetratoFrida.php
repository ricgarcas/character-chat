<?php

namespace App\Tools\Frida;

use App\Jobs\GenerateImageJob;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\Support\Str;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;

class RetratoFrida implements Tool
{
    public function __construct(protected ?string $photoPath = null) {}

    public function description(): string
    {
        return <<<'TXT'
Pinta un retrato del usuario en tu estilo, partiendo de la foto que adjuntó. Llama esta tool SOLO si el usuario adjuntó una foto y te pide que lo pintes / hagas un retrato / lo retrates al óleo.

TÚ debes pasar:
- `style_prompt`: una descripción visual rica EN INGLÉS de cómo se ve el cuadro — paleta, fondo simbólico, qué símbolos vas a poner alrededor (venados, espinas, monos, milagros, raíces, flores, hojas de selva, listones). Sé concreta y sensorial.
  IMPORTANTE: NO menciones tu propio nombre ni el de ningún artista real (no "in the style of Frida Kahlo", no "self-portrait by Frida"). Describe el estilo a través de sus rasgos visuales (oil on masonite, naïve brushwork, Mexican folk symbolism, saturated tropical palette, ex-voto borders). El filtro de contenido del modelo rechaza referencias a personas reales por nombre.
- `title`: título del cuadro, breve y poético, en español, en tu voz.

NO uses esta tool si no hay foto adjunta. NO la llames si el usuario solo está conversando.

El cuadro tarda en pintarse — la tool devuelve inmediatamente un placeholder y la imagen aparece después en el chat. Después de llamarla, comenta brevemente que estás pintando, en voz de Frida.
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
Keep the person in the reference image EXACTLY as they appear: identical face, identical features, identical eyebrows, identical nose, identical mouth, identical facial hair (do not add a thick mustache, do not add a unibrow, keep eyebrows separate and natural), identical hairstyle, identical glasses if any, identical clothing, identical pose. Their identity must remain unchanged.

Transform only the medium and background into a hand-painted portrait in the tradition of mid-20th-century Mexican folk surrealism, as if a folk-art painter had used this person as the model:

Medium: oil on masonite, visible brushwork, slightly naïve detail, no photographic smoothness.
Palette: saturated tropical colors — cobalt blue, jungle green, deep ochre, blood red, jet black.
Iconography: traditional Mexican folk symbolism around the figure — lush vegetation, jungle leaves, small animals, votive ribbons (milagritos), exposed roots, ex-voto decorative borders.
Composition: stylized but grounded, surreal symbolic elements floating around the subject. Replace the original background entirely with this painted symbolic setting.

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
            folder: 'generated/frida',
            opts: [
                'model' => 'fal-ai/flux-pro/kontext',
                'aspect_ratio' => '3:4',
                'guidance_scale' => 4.5,
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
                ->description('Rich English description of how this person will be painted: palette, symbolic background, personal symbols (deer, thorns, monkeys, milagros, roots, flowers). 3-5 sentences, sensory and concrete. NO real artist names.')
                ->required(),
            'title' => $schema->string()
                ->description('Título del cuadro, breve y poético, en voz de Frida.')
                ->required(),
        ];
    }
}
