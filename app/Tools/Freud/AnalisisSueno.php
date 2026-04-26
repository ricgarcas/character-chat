<?php

namespace App\Tools\Freud;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;

class AnalisisSueno implements Tool
{
    public function description(): string
    {
        return <<<'TXT'
Analiza un sueño que el usuario te haya contado, descomponiéndolo en contenido manifiesto, contenido latente y símbolos. Llama esta tool SOLO cuando el usuario te haya narrado un sueño concreto y te pida que lo interpretes / lo analices / le digas qué significa.

TÚ (el modelo) llenas TODOS los campos como Freud lo escribiría en su consultorio de Berggasse 19 — narrativo, con elegancia vienesa, vocabulario psicoanalítico explicado al pasar, sin dogmatismo. La tool solo arma la tarjeta — no la anuncies, simplemente entrégala tras dejar caer una observación breve.

NO la uses para conversación general. Si el usuario menciona "tuve un sueño" pero no lo cuenta, pídele que lo describa primero. NO requiere foto.
TXT;
    }

    public function handle(Request $request): string
    {
        $payload = [
            'artifact_type' => 'dream_analysis',
            'data' => [
                'manifest_content' => $request['manifest_content'],
                'latent_content' => $request['latent_content'],
                'symbols' => $request['symbols'],
                'interpretation' => $request['interpretation'],
                'question_for_couch' => $request['question_for_couch'],
            ],
        ];

        return json_encode($payload, JSON_UNESCAPED_UNICODE);
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'manifest_content' => $schema->string()
                ->description('El sueño tal como lo recuerda el soñante, resumido en 1-2 oraciones. Lo aparente, lo narrado.')
                ->required(),
            'latent_content' => $schema->string()
                ->description('El contenido latente: el deseo o conflicto inconsciente que el sueño está disfrazando. 2-3 oraciones, en voz de Freud, sin dogmatismo.')
                ->required(),
            'symbols' => $schema->array()
                ->description('Tres a cinco símbolos clave del sueño con su significación posible. No diccionario rígido — interpretación contextualizada.')
                ->items(
                    $schema->object([
                        'image' => $schema->string()->description('Elemento del sueño (ej. "el río", "la puerta cerrada", "el tren que parte").')->required(),
                        'meaning' => $schema->string()->description('Lo que esa imagen sugiere en este sueño concreto. Una oración.')->required(),
                    ])
                )
                ->required(),
            'interpretation' => $schema->string()
                ->description('Interpretación final hilando contenido latente y símbolos. 2-3 oraciones, exploratoria, evita "usted es X" — sugiere, no diagnostica.')
                ->required(),
            'question_for_couch' => $schema->string()
                ->description('Una pregunta abierta que dejarías al soñante para llevar al diván. Una sola oración, vienesa, abierta.')
                ->required(),
        ];
    }
}
