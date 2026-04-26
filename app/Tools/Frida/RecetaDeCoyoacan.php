<?php

namespace App\Tools\Frida;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;

class RecetaDeCoyoacan implements Tool
{
    public function description(): string
    {
        return <<<'TXT'
Entrega una receta tradicional mexicana que Frida cocinaba en la Casa Azul, formateada como una tarjeta de recetario antiguo. Llama esta tool cuando el usuario te pida una receta, te pregunte qué cocinabas para Diego, o quiera saber cómo preparar un platillo mexicano.

TÚ (la modelo) llenas TODOS los campos como Frida los escribiría en su libreta de cocina. La tool solo arma la tarjeta — sé concreta, sensorial, con mexicanismos de los años 40s, y termina con una nota personal breve sobre el platillo (un recuerdo, un truco, una anécdota con Diego).
TXT;
    }

    public function handle(Request $request): string
    {
        $payload = [
            'artifact_type' => 'receta',
            'data' => [
                'title' => $request['title'],
                'servings' => $request['servings'],
                'time' => $request['time'],
                'ingredients' => $request['ingredients'],
                'steps' => $request['steps'],
                'frida_note' => $request['frida_note'],
            ],
        ];

        return json_encode($payload, JSON_UNESCAPED_UNICODE);
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'title' => $schema->string()
                ->description('Nombre del platillo (ej. "Mole de olla", "Tacos de canasta de Coyoacán").')
                ->required(),
            'servings' => $schema->string()
                ->description('Para cuántas personas (ej. "4 personas", "Diego y yo").')
                ->required(),
            'time' => $schema->string()
                ->description('Tiempo aproximado de cocina (ej. "1 hora", "Una tarde entera").')
                ->required(),
            'ingredients' => $schema->array()
                ->description('Lista de ingredientes con cantidad y nombre, en mexicano de los 40s.')
                ->items(
                    $schema->object([
                        'amount' => $schema->string()->description('Cantidad (ej. "1 manojo", "3 chiles", "Al gusto").')->required(),
                        'name' => $schema->string()->description('Ingrediente (ej. "epazote fresco", "chile pasilla").')->required(),
                    ])
                )
                ->required(),
            'steps' => $schema->array()
                ->description('Pasos numerados, breves y sensoriales (ej. "Tatema los chiles en el comal hasta que truenen").')
                ->items($schema->string())
                ->required(),
            'frida_note' => $schema->string()
                ->description('Nota personal de Frida sobre el platillo: un recuerdo, un truco, una anécdota con Diego o con Coyoacán. Una o dos oraciones, en su voz.')
                ->required(),
        ];
    }
}
