<?php

namespace Database\Seeders;

use App\Models\Character;
use Illuminate\Database\Seeder;

class CharacterSeeder extends Seeder
{
    public function run(): void
    {
        Character::updateOrCreate(['slug' => 'dali'], [
            'name' => 'Salvador Dalí',
            'tagline' => 'Surrealista, provocador, genio paranoico-crítico',
            'description' => 'El bigote más famoso del siglo XX. Habla de sí mismo en tercera persona, mezcla técnica clásica con delirios calculados. Extravagante con propósito.',
            'agent_class' => 'App\\Agents\\DaliAgent',
            'model' => \App\Enums\ChatModel::current()->modelId(),
            'active' => true,
            'superpowers' => [
                ['key' => 'paranoid_critical', 'name' => 'Método Paranoico-Crítico', 'icon' => '🧠'],
                ['key' => 'pintar_surreal', 'name' => 'Pintar Surreal', 'icon' => '🥚'],
                ['key' => 'retrato_dali', 'name' => 'Retrato Dalí', 'icon' => '🖌️'],
            ],
        ]);

        Character::updateOrCreate(['slug' => 'frida'], [
            'name' => 'Frida Kahlo',
            'tagline' => 'Pintora, rebelde, mexicana hasta los huesos',
            'description' => 'La artista que transformó el dolor en arte. Cruda, honesta, con humor negro y mexicanismos que cortan.',
            'agent_class' => 'App\\Agents\\FridaAgent',
            'model' => \App\Enums\ChatModel::current()->modelId(),
            'active' => true,
            'superpowers' => [
                ['key' => 'coyoacan_recipe', 'name' => 'Receta de Coyoacán', 'icon' => '📔'],
                ['key' => 'face_reading', 'name' => 'Leerte la Cara', 'icon' => '👁️'],
                ['key' => 'frida_portrait', 'name' => 'Retrato Frida', 'icon' => '🎨'],
            ],
        ]);

        Character::updateOrCreate(['slug' => 'beauvoir'], [
            'name' => 'Simone de Beauvoir',
            'tagline' => 'Filósofa existencialista, fundadora del feminismo moderno',
            'description' => 'Lucidez cortante y honestidad brutal. Analiza estructuras de poder con precisión clínica y calor literario. "No se nace mujer: se llega a serlo."',
            'agent_class' => 'App\\Agents\\BeauvoirAgent',
            'model' => \App\Enums\ChatModel::current()->modelId(),
            'active' => true,
            'superpowers' => [
                ['key' => 'existential_analysis', 'name' => 'Análisis Existencial', 'icon' => '🗝️'],
                ['key' => 'feminist_critique', 'name' => 'Crítica Feminista', 'icon' => '♀️'],
                ['key' => 'philosophical_debate', 'name' => 'Debate Filosófico', 'icon' => '⚖️'],
            ],
        ]);

        Character::updateOrCreate(['slug' => 'freud'], [
            'name' => 'Sigmund Freud',
            'tagline' => 'Padre del psicoanálisis, explorador del inconsciente',
            'description' => 'El arqueólogo de la mente. Te guía por los laberintos del inconsciente con preguntas incómodas y análisis brillantes.',
            'agent_class' => 'App\\Agents\\FreudAgent',
            'model' => \App\Enums\ChatModel::current()->modelId(),
            'active' => true,
            'superpowers' => [
                ['key' => 'dream_analysis', 'name' => 'Análisis de Sueños', 'icon' => '🌙'],
                ['key' => 'defenses', 'name' => 'Mecanismos de Defensa', 'icon' => '🛡️'],
                ['key' => 'unconscious_face', 'name' => 'Lo Que el Rostro Delata', 'icon' => '👁️'],
            ],
        ]);

        Character::updateOrCreate(['slug' => 'sor-juana'], [
            'name' => 'Sor Juana Inés de la Cruz',
            'tagline' => 'La Décima Musa, poeta y defensora del derecho a aprender',
            'description' => 'La niña que quiso ir a la universidad disfrazada de hombre y convirtió su celda en la biblioteca más grande de América. Ingenio barroco, rimas como acertijos y cero paciencia para quien le diga que no puede.',
            'agent_class' => 'App\\Agents\\SorJuanaAgent',
            'model' => \App\Enums\ChatModel::current()->modelId(),
            'active' => true,
            'superpowers' => [
                ['key' => 'taller_poetico', 'name' => 'Taller Poético', 'icon' => '✒️'],
                ['key' => 'duelo_de_ingenio', 'name' => 'Duelo de Ingenio', 'icon' => '⚡'],
                ['key' => 'biblioteca_infinita', 'name' => 'Biblioteca Infinita', 'icon' => '📚'],
            ],
        ]);
    }
}
