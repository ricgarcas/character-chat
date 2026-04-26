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
            'tagline' => [
                'en' => 'Surrealist, provocateur, paranoid-critical genius',
                'es' => 'Surrealista, provocador, genio paranoico-crítico',
            ],
            'description' => [
                'en' => 'The most famous mustache of the 20th century. Speaks of himself in the third person and blends classical technique with calculated delirium. Extravagant on purpose.',
                'es' => 'El bigote más famoso del siglo XX. Habla de sí mismo en tercera persona, mezcla técnica clásica con delirios calculados. Extravagante con propósito.',
            ],
            'agent_class' => 'App\\Agents\\DaliAgent',
            'model' => 'claude-opus-4-6',
            'active' => true,
            'superpowers' => [
                ['key' => 'paranoid_critical', 'name' => ['en' => 'Paranoid-Critical Method', 'es' => 'Método Paranoico-Crítico'], 'icon' => '🧠'],
                ['key' => 'pintar_surreal', 'name' => ['en' => 'Surreal Painting', 'es' => 'Pintar Surreal'], 'icon' => '🥚'],
                ['key' => 'retrato_dali', 'name' => ['en' => 'Dalí Portrait', 'es' => 'Retrato Dalí'], 'icon' => '🖌️'],
            ],
        ]);

        Character::updateOrCreate(['slug' => 'frida'], [
            'name' => 'Frida Kahlo',
            'tagline' => [
                'en' => 'Painter, rebel, Mexican to the bone',
                'es' => 'Pintora, rebelde, mexicana hasta los huesos',
            ],
            'description' => [
                'en' => 'The artist who turned pain into art. Raw, honest, with dark humor and Mexican slang that cuts.',
                'es' => 'La artista que transformó el dolor en arte. Cruda, honesta, con humor negro y mexicanismos que cortan.',
            ],
            'agent_class' => 'App\\Agents\\FridaAgent',
            'model' => 'claude-opus-4-6',
            'active' => true,
            'superpowers' => [
                ['key' => 'coyoacan_recipe', 'name' => ['en' => 'Coyoacán Recipe', 'es' => 'Receta de Coyoacán'], 'icon' => '📔'],
                ['key' => 'face_reading', 'name' => ['en' => 'Read Your Face', 'es' => 'Leerte la Cara'], 'icon' => '👁️'],
                ['key' => 'frida_portrait', 'name' => ['en' => 'Frida Portrait', 'es' => 'Retrato Frida'], 'icon' => '🎨'],
            ],
        ]);

        Character::updateOrCreate(['slug' => 'beauvoir'], [
            'name' => 'Simone de Beauvoir',
            'tagline' => [
                'en' => 'Existentialist philosopher, founder of modern feminism',
                'es' => 'Filósofa existencialista, fundadora del feminismo moderno',
            ],
            'description' => [
                'en' => 'Cutting lucidity and brutal honesty. Analyzes power structures with clinical precision and literary warmth. "One is not born, but rather becomes, a woman."',
                'es' => 'Lucidez cortante y honestidad brutal. Analiza estructuras de poder con precisión clínica y calor literario. "No se nace mujer: se llega a serlo."',
            ],
            'agent_class' => 'App\\Agents\\BeauvoirAgent',
            'model' => 'claude-opus-4-6',
            'active' => false,
            'superpowers' => [
                ['key' => 'existential_analysis', 'name' => ['en' => 'Existential Analysis', 'es' => 'Análisis Existencial'], 'icon' => '🗝️'],
                ['key' => 'feminist_critique', 'name' => ['en' => 'Feminist Critique', 'es' => 'Crítica Feminista'], 'icon' => '♀️'],
                ['key' => 'philosophical_debate', 'name' => ['en' => 'Philosophical Debate', 'es' => 'Debate Filosófico'], 'icon' => '⚖️'],
            ],
        ]);

        Character::updateOrCreate(['slug' => 'freud'], [
            'name' => 'Sigmund Freud',
            'tagline' => [
                'en' => 'Father of psychoanalysis, explorer of the unconscious',
                'es' => 'Padre del psicoanálisis, explorador del inconsciente',
            ],
            'description' => [
                'en' => 'The archaeologist of the mind. Guides you through the labyrinths of the unconscious with uncomfortable questions and brilliant analyses.',
                'es' => 'El arqueólogo de la mente. Te guía por los laberintos del inconsciente con preguntas incómodas y análisis brillantes.',
            ],
            'agent_class' => 'App\\Agents\\FreudAgent',
            'model' => 'claude-opus-4-6',
            'active' => true,
            'superpowers' => [
                ['key' => 'dream_analysis', 'name' => ['en' => 'Dream Analysis', 'es' => 'Análisis de Sueños'], 'icon' => '🌙'],
                ['key' => 'defenses', 'name' => ['en' => 'Defense Mechanisms', 'es' => 'Mecanismos de Defensa'], 'icon' => '🛡️'],
                ['key' => 'unconscious_face', 'name' => ['en' => 'What the Face Betrays', 'es' => 'Lo Que el Rostro Delata'], 'icon' => '👁️'],
            ],
        ]);
    }
}
