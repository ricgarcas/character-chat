<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Batch de candidatos
    |--------------------------------------------------------------------------
    |
    | Cuántas imágenes pide el Estudio por generación. Se revisan lado a lado
    | y sólo una se aprueba y publica.
    */

    'candidates_per_batch' => env('ESTUDIO_CANDIDATES', 1),

    'models' => [
        'default' => 'openai/gpt-image-2',
        // El path base es text-to-image e IGNORA image_urls sin error;
        // las ediciones (emotes, busto) van al path /edit.
        'edit' => 'openai/gpt-image-2/edit',
        'rembg' => 'fal-ai/birefnet',
    ],

    /*
    |--------------------------------------------------------------------------
    | Transparencia de sprites
    |--------------------------------------------------------------------------
    |
    | 'native' pide background transparente directo a gpt-image; 'rembg'
    | encadena remove-background después de generar (contingencia del spec §2,
    | por si el endpoint de fal ignora el parámetro).
    */

    'transparency_mode' => env('ESTUDIO_TRANSPARENCY', 'native'),

    /*
    |--------------------------------------------------------------------------
    | Roster
    |--------------------------------------------------------------------------
    |
    | Las 14 figuras lockeadas — ver docs/saas/02-roster.md. 'visual' describe
    | a la figura para prompts de sprite/busto; 'scene' describe su mundo para
    | el fondo. El orden manda el orden de la matriz del Estudio.
    */

    'figures' => [
        'frida' => [
            'name' => 'Frida Kahlo',
            'visual' => 'Mexican painter with braided hair crowned with flowers, colorful huipil and rebozo, bold unibrow',
            'scene' => 'Casa Azul courtyard in Coyoacán, cobalt blue walls, cacti and bougainvillea',
        ],
        'dali' => [
            'name' => 'Salvador Dalí',
            'visual' => 'Surrealist painter with iconic upturned mustache, wide theatrical eyes, elegant suit',
            'scene' => 'surreal Catalan coast at golden hour, melting clocks, long shadows',
        ],
        'freud' => [
            'name' => 'Sigmund Freud',
            'visual' => 'Viennese psychoanalyst with white beard, round glasses, three-piece tweed suit, cigar',
            'scene' => 'Vienna study with the famous couch, oriental rugs, antiquities on shelves',
        ],
        'beauvoir' => [
            'name' => 'Simone de Beauvoir',
            'visual' => 'French philosopher with hair in an elegant updo wrapped in a turban, tailored blouse',
            'scene' => 'Parisian café terrace with marble tables, notebooks and coffee',
        ],
        'sor-juana' => [
            'name' => 'Sor Juana Inés de la Cruz',
            'visual' => 'Novohispanic nun poet in black-and-white habit with a large escudo de monja medallion, serene intelligent gaze',
            'scene' => 'colonial convent library cell with quill, desk, shelves of leather books, candlelight',
        ],
        'einstein' => [
            'name' => 'Albert Einstein',
            'visual' => 'physicist with wild white hair and mustache, cozy sweater, playful eyes',
            'scene' => 'chalkboard-filled study with equations, telescope by the window, papers everywhere',
        ],
        'da-vinci' => [
            'name' => 'Leonardo da Vinci',
            'visual' => 'Renaissance master with long beard, rose tunic and cap, curious expression',
            'scene' => 'Renaissance workshop with flying machine sketches, gears, anatomical drawings',
        ],
        'nezahualcoyotl' => [
            'name' => 'Nezahualcóyotl',
            'visual' => 'Acolhua poet-king with jade and gold headdress with quetzal feathers, embroidered tilmatli cloak',
            // Sin negativos explícitos, gpt-image resuelve "aqueduct" con arcos
            // romanos y cipreses — sale villa novohispana en vez de Texcotzingo.
            'scene' => 'pre-Hispanic Mesoamerican royal gardens of Texcotzingo circa 1460: stepped stone terraces carved into the hillside, straight open water channels and small carved rock pools fed by canals, cempasuchil marigolds and ahuehuete trees, stepped-fret grecas carved in stone, view of Lake Texcoco and distant volcanoes at dusk. Aztec/Acolhua architecture only: post-and-lintel stonework, NO arches of any kind, no Roman or colonial columns, no European buildings, no cypress trees, no terracotta flower pots',
        ],
        'socrates' => [
            'name' => 'Sócrates',
            'visual' => 'Greek philosopher, bald with a full grey beard, simple himation robe, amused knowing look',
            'scene' => 'Athenian agora with marble columns, olive tree, morning light',
        ],
        'marie-curie' => [
            'name' => 'Marie Curie',
            'visual' => 'physicist in a dark Edwardian dress, hair in a bun, holding a glowing vial',
            // Sin el anclaje temporal explícito, gpt-image deriva a taller de
            // alquimista medieval en vez de laboratorio de principios del XX.
            'scene' => 'turn-of-the-century Parisian physics laboratory circa 1900: tall iron-framed windows, wooden lab benches with electrometers and brass instruments, racks of test tubes and glass beakers, softly glowing green radium vials, stacked notebooks. Modern scientific equipment, not a medieval alchemist workshop, no cauldrons, no stone dungeon',
        ],
        'darwin' => [
            'name' => 'Charles Darwin',
            'visual' => 'naturalist with a great white beard, dark Victorian coat, gentle observant eyes',
            'scene' => 'naturalist cabin aboard the Beagle, specimen jars, maps, finches at the window',
        ],
        'van-gogh' => [
            'name' => 'Vincent van Gogh',
            'visual' => 'red-haired painter with a straw hat, paint-stained blue smock, intense kind eyes',
            'scene' => 'Provence wheat field under a swirling starry sky, cypress tree, small easel',
        ],
        'cervantes' => [
            'name' => 'Miguel de Cervantes',
            'visual' => 'Golden Age writer with a pointed beard and ruff collar, quill in hand, wry smile',
            'scene' => 'La Mancha plain with windmills at sunset, dusty road, distant inn',
        ],
        'juarez' => [
            'name' => 'Benito Juárez',
            'visual' => 'Mexican statesman in a solemn black suit with high collar, holding a law book, dignified posture',
            'scene' => 'republican study with the Mexican flag, leather-bound law tomes, oil lamp',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Plantillas de prompt
    |--------------------------------------------------------------------------
    |
    | Portadas de los skills pixel-avatar-prompts / pixel-backgrounds. Los
    | emotes NO re-describen al personaje: se generan editando el neutral
    | aprobado, así que sólo piden el cambio de pose y expresión.
    */

    'prompts' => [
        'base' => 'Detailed 16-bit pixel art, crisp pixel grid, warm limited palette, clean silhouette, no text, no watermark, no frame.',
        'sprite_neutral' => 'Full-body pixel art character of {name}: {visual}. Standing pose facing the viewer, neutral calm expression, complete figure head to toe with margin around it, isolated on a fully transparent background. {base}',
        'sprite_emote' => 'Same exact character, identical outfit, colors and pixel style. Change only the pose and expression to: {emote_direction}. Keep the fully transparent background and the same scale.',
        'avatar' => 'Reframe to a square bust portrait of the same exact character: head and shoulders centered, same pixel style and palette, simple dark backdrop with a subtle glow.',
        'background' => 'Empty pixel art scene, no people, no characters: {scene}. Vertical 2:3 composition with an open floor area in the lower third where a character can stand. {base}',
    ],

    'emote_directions' => [
        'happy' => 'joyful open smile, bright energetic posture, arms slightly raised',
        'thinking' => 'pensive expression, hand on chin, weight shifted, gaze up and away',
        'surprised' => 'wide eyes, open mouth, startled posture leaning slightly back',
    ],
];
