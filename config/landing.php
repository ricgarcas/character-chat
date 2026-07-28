<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Personajes destacados
    |--------------------------------------------------------------------------
    |
    | Slugs de personajes jugables que se muestran en el roster de la landing,
    | en este orden. Un slug que no exista en la base se omite en silencio:
    | un seeder desincronizado no debe tumbar la página de marketing.
    |
    | Freud queda fuera a propósito (ver docs/saas/02-roster.md, curaduría
    | teen-first). Sigue disponible dentro de /chat.
    */

    'featured' => ['frida', 'dali', 'beauvoir'],

    /*
    |--------------------------------------------------------------------------
    | Próximamente
    |--------------------------------------------------------------------------
    |
    | Figuras aún no construidas. Se muestran como cartas bloqueadas.
    | No tienen avatar todavía: la carta bloqueada dibuja una silueta.
    */

    'upcoming' => [
        ['slug' => 'sor-juana', 'name' => 'Sor Juana', 'role' => 'POETA', 'teaser' => 'Taller de verso y argumento'],
        ['slug' => 'einstein', 'name' => 'Einstein', 'role' => 'FÍSICO', 'teaser' => 'Experimentos mentales'],
        ['slug' => 'da-vinci', 'name' => 'Da Vinci', 'role' => 'INVENTOR', 'teaser' => 'Cuaderno de inventos'],
    ],

    /*
    |--------------------------------------------------------------------------
    | Showcase
    |--------------------------------------------------------------------------
    |
    | Artefactos reales co-creados con los personajes. Las imágenes de abajo
    | son PLACEHOLDERS apuntando a arte existente del repo; sustituir los
    | archivos en public/showcase/ llena la sección sin tocar código.
    */

    'showcase' => [
        ['title' => 'Raíz y vuelo', 'character' => 'frida', 'kind' => 'Retrato', 'image' => '/showcase/retrato-frida.png'],
        ['title' => 'El reloj que llegó tarde', 'character' => 'dali', 'kind' => 'Objeto surrealista', 'image' => '/showcase/objeto-dali.png'],
        ['title' => 'Carta a los diecisiete', 'character' => 'beauvoir', 'kind' => 'Ensayo breve', 'image' => '/showcase/ensayo-beauvoir.png'],
        ['title' => 'Autorretrato con antenas', 'character' => 'frida', 'kind' => 'Retrato', 'image' => '/showcase/retrato-antenas.png'],
    ],

    /*
    |--------------------------------------------------------------------------
    | Precios
    |--------------------------------------------------------------------------
    |
    | Ver docs/saas/00-vision.md. Los tiers con available => false se
    | renderizan con badge PRONTO y botón inerte: todavía no hay billing.
    */

    'pricing' => [
        [
            'name' => 'Gratis',
            'price' => '$0',
            'period' => 'para siempre',
            'available' => true,
            'features' => ['10 mensajes al día', '3 personajes', 'Tu portafolio'],
        ],
        [
            'name' => 'Curioso',
            'price' => '$99',
            'period' => 'MXN al mes',
            'available' => false,
            'features' => ['100 mensajes al día', 'Todos los personajes', '5 imágenes al día', 'Historial completo'],
        ],
        [
            'name' => 'Erudito',
            'price' => '$199',
            'period' => 'MXN al mes',
            'available' => false,
            'features' => ['500 mensajes al día', 'Imágenes sin límite razonable', 'Modo profundo siempre activo'],
        ],
    ],

];
