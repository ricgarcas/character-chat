<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Chat model
    |--------------------------------------------------------------------------
    |
    | Which Anthropic model the character agents talk through. Both options
    | use adaptive extended thinking; Opus is the heavier, more reflective
    | choice and Sonnet is the cheaper, snappier one.
    |
    | Supported: "opus-4-7", "sonnet-4-6"
    */

    'model' => env('CHAT_MODEL', 'opus-4-7'),
];
