<?php

namespace App\Tools\Dali;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;

class MetodoParanoicoCritico implements Tool
{
    public function description(): string
    {
        return <<<'TXT'
Aplica el método paranoico-crítico de Dalí a un sujeto, objeto, recuerdo, idea o tema cualquiera que el usuario te haya propuesto. Llama esta tool SOLO cuando el usuario te pida explícitamente que lo apliques / lo analices / lo desentrañes con tu método Y ya te haya dicho a qué.

TÚ (el modelo) llenas TODOS los campos como Dalí los escribiría — siempre en tercera persona ("Dalí ve..."), grandilocuente, aforístico, con asociaciones imposibles dichas con total seriedad científica. La tool solo arma la tarjeta — no anuncies que la usas, simplemente entrégala.

NO la uses para conversación general. NO la uses si el usuario solo dice "hola" o sin tema concreto — pídele primero qué quiere desentrañar. NO requiere foto adjunta.
TXT;
    }

    public function handle(Request $request): string
    {
        $payload = [
            'artifact_type' => 'paranoid_critical',
            'data' => [
                'subject' => $request['subject'],
                'apparent' => $request['apparent'],
                'visions' => $request['visions'],
                'synthesis' => $request['synthesis'],
                'signature' => $request['signature'],
            ],
        ];

        return json_encode($payload, JSON_UNESCAPED_UNICODE);
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'subject' => $schema->string()
                ->description('El sujeto, objeto, recuerdo o tema que vas a desentrañar. Breve, en español, en voz teatral de Dalí (ej. "El reloj de tu abuela", "La paranoia del lunes").')
                ->required(),
            'apparent' => $schema->string()
                ->description('Lo que la mente vulgar ve a primera vista — la lectura banal y obvia. 1-2 oraciones, en tercera persona ("Dalí observa que el ojo común..."), tono de desdén culto.')
                ->required(),
            'visions' => $schema->array()
                ->description('Tres lecturas paranoicas simultáneas del mismo sujeto. Cada una es una visión delirante distinta, dicha con seriedad científica. Imágenes concretas, sensoriales, imposibles.')
                ->items(
                    $schema->object([
                        'title' => $schema->string()->description('Título breve y aforístico de la visión, en español (ej. "El huevo dentro del huevo").')->required(),
                        'vision' => $schema->string()->description('La visión desplegada en 2-3 oraciones, en tercera persona, con asociación imposible y precisión visual.')->required(),
                    ])
                )
                ->required(),
            'synthesis' => $schema->string()
                ->description('La verdad secreta que emerge tras superponer las tres visiones. Un solo aforismo brutal y citable, en voz de Dalí, en español.')
                ->required(),
            'signature' => $schema->string()
                ->description('Cierre teatral en voz de Dalí — una sola frase final que firma el análisis, grandilocuente y memorable.')
                ->required(),
        ];
    }
}
