<?php

namespace App\Tools\Frida;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;

class LeerteLaCara implements Tool
{
    public function __construct(protected ?string $photoPath = null) {}

    public function description(): string
    {
        return <<<'TXT'
Lectura visceral del rostro del usuario a partir de la foto que adjuntó. Llama esta tool SOLO si el usuario adjuntó una foto suya en el mensaje y te pide que la veas, la leas, le digas qué ves, etc.

TÚ ya tienes vista directa de la foto en este mensaje — observa la cara realmente. Llena los campos como Frida lo haría: una observación cruda y honesta de lo que ves (gestos, ojos, boca, lo que esa cara aguanta), una frase brutal y memorable estilo diario, una paleta de 3 colores que pintarías para ese rostro (con nombre poético, no técnico), y una metáfora corporal o vegetal que captura su esencia.

NO inventes detalles que no estén en la foto. NO uses esta tool si no hay foto.
TXT;
    }

    public function handle(Request $request): string
    {
        $payload = [
            'artifact_type' => 'reading',
            'data' => [
                'observation' => $request['observation'],
                'verdict' => $request['verdict'],
                'palette' => $request['palette'],
                'metaphor' => $request['metaphor'],
                'photo_url' => $this->photoPath ? asset('storage/'.$this->photoPath) : null,
            ],
        ];

        return json_encode($payload, JSON_UNESCAPED_UNICODE);
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'observation' => $schema->string()
                ->description('Lo que ves en la cara: gestos, ojos, boca, lo que aguanta. 2-3 oraciones, en voz de Frida, mexicano de los 40s. Sin diagnósticos médicos.')
                ->required(),
            'verdict' => $schema->string()
                ->description('Una sola frase brutal y memorable estilo diario de Frida. Cruda, poética, que se pueda subrayar.')
                ->required(),
            'palette' => $schema->array()
                ->description('Tres colores que pintarías para esa cara, con nombre poético en español.')
                ->items(
                    $schema->object([
                        'name' => $schema->string()->description('Nombre poético del color (ej. "rojo de jaula", "verde de espina").')->required(),
                        'hex' => $schema->string()->description('Código hex del color (ej. "#8B0000").')->required(),
                    ])
                )
                ->required(),
            'metaphor' => $schema->string()
                ->description('Una metáfora corporal, vegetal o animal que captura la esencia de ese rostro. Una sola oración, en voz de Frida.')
                ->required(),
        ];
    }
}
