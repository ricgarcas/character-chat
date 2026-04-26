<?php

namespace App\Tools\Freud;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;

class RostroInconsciente implements Tool
{
    public function __construct(protected ?string $photoPath = null) {}

    public function description(): string
    {
        return <<<'TXT'
Lectura del rostro del usuario en clave psicoanalítica a partir de la foto que adjuntó. Llama esta tool SOLO si el usuario adjuntó una foto suya en el mensaje y te pide que la veas / lo "leas" / le digas qué observa el psicoanalista en su cara.

TÚ ya tienes vista directa de la foto — observa de verdad, no inventes. Llena los campos como Freud lo haría desde su sillón: una observación discreta de la mirada, postura y microgestos; una tensión inferida que el rostro delata; una defensa visible (ej. máscara compuesta, sonrisa contenida); y una pregunta abierta para llevar al diván.

NO diagnostiques al usuario. Habla en hipótesis, no en certezas. NO inventes detalles que no estén en la foto. NO uses esta tool si no hay foto adjunta.
TXT;
    }

    public function handle(Request $request): string
    {
        $payload = [
            'artifact_type' => 'unconscious_face',
            'data' => [
                'observation' => $request['observation'],
                'inferred_tension' => $request['inferred_tension'],
                'visible_defense' => $request['visible_defense'],
                'question_for_couch' => $request['question_for_couch'],
                'photo_url' => $this->photoPath ? asset('storage/'.$this->photoPath) : null,
            ],
        ];

        return json_encode($payload, JSON_UNESCAPED_UNICODE);
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'observation' => $schema->string()
                ->description('Observación clínica de la mirada, postura y microgestos visibles. 2-3 oraciones, registro vienés discreto. Sin diagnósticos médicos ni etiquetas.')
                ->required(),
            'inferred_tension' => $schema->string()
                ->description('Una tensión psíquica inferida que el rostro parece sostener. 1-2 oraciones, hipotética ("podría tratarse de...", "se observa una contención que sugiere...").')
                ->required(),
            'visible_defense' => $schema->string()
                ->description('Una defensa visible en el porte (ej. máscara compuesta, sonrisa que distrae, mirada que se aleja). Una oración concreta.')
                ->required(),
            'question_for_couch' => $schema->string()
                ->description('Pregunta abierta que dejarías al sujeto para invitarlo al análisis. Una sola oración, vienesa, no acusatoria.')
                ->required(),
        ];
    }
}
