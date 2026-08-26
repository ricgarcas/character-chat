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

        Character::updateOrCreate(['slug' => 'einstein'], [
            'name' => 'Albert Einstein',
            'tagline' => 'Físico, soñador profesional, enemigo de la solemnidad',
            'description' => 'El hombre que reinventó el universo montado en un rayo de luz imaginario. Juguetón, curioso sin remedio y alérgico a la autoridad. Piensa en imágenes y pregunta "¿qué pasaría si…?" antes que cualquier fórmula.',
            'agent_class' => 'App\\Agents\\EinsteinAgent',
            'model' => \App\Enums\ChatModel::current()->modelId(),
            'active' => true,
            'superpowers' => [
                ['key' => 'experimento_mental', 'name' => 'Experimento Mental', 'icon' => '🚂'],
                ['key' => 'caza_paradojas', 'name' => 'Caza de Paradojas', 'icon' => '🌀'],
                ['key' => 'fisica_cotidiana', 'name' => 'Física de lo Cotidiano', 'icon' => '🧭'],
            ],
        ]);

        Character::updateOrCreate(['slug' => 'da-vinci'], [
            'name' => 'Leonardo da Vinci',
            'tagline' => 'Inventor, pintor, anatomista — se niega a elegir',
            'description' => 'El maestro del cuaderno infinito: máquinas voladoras, escritura en espejo y mil proyectos empezados. Aprende de la experiencia, no de los libros, y convierte cualquier pregunta en un boceto.',
            'agent_class' => 'App\\Agents\\DaVinciAgent',
            'model' => \App\Enums\ChatModel::current()->modelId(),
            'active' => true,
            'superpowers' => [
                ['key' => 'cuaderno_inventos', 'name' => 'Cuaderno de Inventos', 'icon' => '📓'],
                ['key' => 'maquinas_imposibles', 'name' => 'Máquinas Imposibles', 'icon' => '⚙️'],
                ['key' => 'escritura_espejo', 'name' => 'Escritura Espejo', 'icon' => '🪞'],
            ],
        ]);

        Character::updateOrCreate(['slug' => 'nezahualcoyotl'], [
            'name' => 'Nezahualcóyotl',
            'tagline' => 'Poeta rey de Texcoco, ingeniero del agua',
            'description' => 'El Coyote que Ayuna: perdió su reino a los quince y volvió a ganarlo. Canta a lo que se acaba, construye acueductos que permanecen. Poesía sin rima e ingeniería con alma — el único con taller doble.',
            'agent_class' => 'App\\Agents\\NezahualcoyotlAgent',
            'model' => \App\Enums\ChatModel::current()->modelId(),
            'active' => true,
            'superpowers' => [
                ['key' => 'flor_y_canto', 'name' => 'Flor y Canto', 'icon' => '🌸'],
                ['key' => 'ingenieria_del_agua', 'name' => 'Ingeniería del Agua', 'icon' => '💧'],
                ['key' => 'filosofia_efimera', 'name' => 'Filosofía de lo Efímero', 'icon' => '🍃'],
            ],
        ]);

        Character::updateOrCreate(['slug' => 'socrates'], [
            'name' => 'Sócrates',
            'tagline' => 'Filósofo callejero, partero de ideas, tábano de Atenas',
            'description' => 'Nunca da respuestas: las devuelve convertidas en mejores preguntas. Descalzo, irónico y encantado de que lo refuten. La encarnación del anti-tarea — contigo las ideas nacen tuyas.',
            'agent_class' => 'App\\Agents\\SocratesAgent',
            'model' => \App\Enums\ChatModel::current()->modelId(),
            'active' => true,
            'superpowers' => [
                ['key' => 'dialogo_socratico', 'name' => 'Diálogo Socrático', 'icon' => '💬'],
                ['key' => 'torneo_preguntas', 'name' => 'Torneo de Preguntas', 'icon' => '❓'],
                ['key' => 'mayeutica', 'name' => 'Mayéutica', 'icon' => '🐣'],
            ],
        ]);

        Character::updateOrCreate(['slug' => 'marie-curie'], [
            'name' => 'Marie Curie',
            'tagline' => 'Dos veces Nobel, cazadora de lo invisible',
            'description' => 'Estudió a escondidas, procesó toneladas de mineral en un cobertizo y le puso nombre a dos elementos. Precisa, serena y obstinada: nada debe ser temido, solamente comprendido.',
            'agent_class' => 'App\\Agents\\MarieCurieAgent',
            'model' => \App\Enums\ChatModel::current()->modelId(),
            'active' => true,
            'superpowers' => [
                ['key' => 'diseno_experimentos', 'name' => 'Diseña tu Experimento', 'icon' => '🧪'],
                ['key' => 'bitacora_laboratorio', 'name' => 'Bitácora de Laboratorio', 'icon' => '📔'],
                ['key' => 'perseverancia_radiante', 'name' => 'Perseverancia Radiante', 'icon' => '✨'],
            ],
        ]);

        Character::updateOrCreate(['slug' => 'darwin'], [
            'name' => 'Charles Darwin',
            'tagline' => 'Naturalista del Beagle, paciente profesional',
            'description' => 'Dio la vuelta al mundo coleccionando pistas y tardó veinte años en contar lo que descubrió. Amable, curioso y honesto hasta con sus propias dudas. Tu patio es su próximo Galápagos.',
            'agent_class' => 'App\\Agents\\DarwinAgent',
            'model' => \App\Enums\ChatModel::current()->modelId(),
            'active' => true,
            'superpowers' => [
                ['key' => 'expedicion_naturalista', 'name' => 'Expedición Naturalista', 'icon' => '🗺️'],
                ['key' => 'clasificar_criaturas', 'name' => 'Clasificador de Criaturas', 'icon' => '🐦'],
                ['key' => 'arbol_de_la_vida', 'name' => 'Árbol de la Vida', 'icon' => '🌳'],
            ],
        ]);

        Character::updateOrCreate(['slug' => 'van-gogh'], [
            'name' => 'Vincent van Gogh',
            'tagline' => 'Pintor de emociones, hermano de cartas',
            'description' => 'Empezó a pintar a los 27 y en diez años lo dio todo: girasoles, noches estrelladas y cartas que son literatura. Intenso, cálido, cero cinismo. Contigo el color se vuelve idioma.',
            'agent_class' => 'App\\Agents\\VanGoghAgent',
            'model' => \App\Enums\ChatModel::current()->modelId(),
            'active' => true,
            'superpowers' => [
                ['key' => 'pintar_emociones', 'name' => 'Pintar Emociones', 'icon' => '🎨'],
                ['key' => 'carta_a_theo', 'name' => 'Carta a Theo', 'icon' => '✉️'],
                ['key' => 'ver_el_color', 'name' => 'Ver el Color', 'icon' => '🌻'],
            ],
        ]);

        Character::updateOrCreate(['slug' => 'cervantes'], [
            'name' => 'Miguel de Cervantes',
            'tagline' => 'Soldado, cautivo, inventor de la novela moderna',
            'description' => 'Su vida es más novelesca que sus libros: Lepanto, Argel, la cárcel donde nació Don Quijote. Irónico y compasivo, responde con historias y convierte cualquier idea en aventura por capítulos.',
            'agent_class' => 'App\\Agents\\CervantesAgent',
            'model' => \App\Enums\ChatModel::current()->modelId(),
            'active' => true,
            'superpowers' => [
                ['key' => 'inventar_personajes', 'name' => 'Inventor de Personajes', 'icon' => '🎭'],
                ['key' => 'aventuras_por_capitulos', 'name' => 'Aventuras por Capítulos', 'icon' => '📜'],
                ['key' => 'duelo_de_refranes', 'name' => 'Duelo de Refranes', 'icon' => '🗡️'],
            ],
        ]);

        Character::updateOrCreate(['slug' => 'juarez'], [
            'name' => 'Benito Juárez',
            'tagline' => 'El pastor que llegó a presidente, la ley como brújula',
            'description' => 'De Guelatao al carruaje que cargó la República entera. Sobrio, firme y justo: plantea dilemas de verdad, te hace defender los dos lados y te trata como ciudadano, no como niño.',
            'agent_class' => 'App\\Agents\\JuarezAgent',
            'model' => \App\Enums\ChatModel::current()->modelId(),
            'active' => true,
            'superpowers' => [
                ['key' => 'debate_justo', 'name' => 'Debate Justo', 'icon' => '⚖️'],
                ['key' => 'que_harias_tu', 'name' => '¿Qué Harías Tú?', 'icon' => '🤔'],
                ['key' => 'leyes_para_todos', 'name' => 'Leyes para Todos', 'icon' => '📜'],
            ],
        ]);
    }
}
