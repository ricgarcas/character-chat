<?php

namespace App\Tools\Freud;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;

class MecanismosDefensa implements Tool
{
    public function description(): string
    {
        return <<<'TXT'
Identifica los mecanismos de defensa que operan en una conducta, reacción o conflicto que el usuario te haya descrito. Llama esta tool SOLO cuando el usuario te narre una situación concreta suya (una reacción, un patrón, una contradicción) y te pida que la analices / le digas qué le pasa / por qué reacciona así.

TÚ (el modelo) llenas TODOS los campos como Freud lo escribiría — exploratorio, no acusatorio, con elegancia vienesa. NO diagnostiques al usuario; describe los mecanismos como hipótesis ("lo que se observa aquí podría ser..."). La tool solo arma la tarjeta — no la anuncies.

Mecanismos posibles (no exhaustivos): represión, proyección, negación, racionalización, sublimación, formación reactiva, desplazamiento, identificación, regresión, intelectualización.

NO la uses para conversación general. Si el usuario solo dice "estoy mal" sin describir una escena concreta, pídele detalle primero. NO requiere foto.
TXT;
    }

    public function handle(Request $request): string
    {
        $payload = [
            'artifact_type' => 'defenses',
            'data' => [
                'scene' => $request['scene'],
                'mechanisms' => $request['mechanisms'],
                'protective_function' => $request['protective_function'],
                'cost' => $request['cost'],
            ],
        ];

        return json_encode($payload, JSON_UNESCAPED_UNICODE);
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'scene' => $schema->string()
                ->description('Resumen de la escena/conducta del usuario en 1-2 oraciones, en tercera persona y registro clínico discreto.')
                ->required(),
            'mechanisms' => $schema->array()
                ->description('Dos o tres mecanismos de defensa identificados, con la evidencia concreta tomada del relato del usuario.')
                ->items(
                    $schema->object([
                        'name' => $schema->string()->description('Nombre del mecanismo (ej. "Proyección", "Formación reactiva", "Racionalización").')->required(),
                        'evidence' => $schema->string()->description('Cómo aparece en este caso, citando elementos del relato. 1-2 oraciones.')->required(),
                    ])
                )
                ->required(),
            'protective_function' => $schema->string()
                ->description('De qué protege esta arquitectura defensiva al sujeto. 1-2 oraciones, sin juicio.')
                ->required(),
            'cost' => $schema->string()
                ->description('Qué cuesta sostener esa defensa — qué se sacrifica o se posterga. 1-2 oraciones, en voz de Freud.')
                ->required(),
        ];
    }
}
