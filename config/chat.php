<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Chat model
    |--------------------------------------------------------------------------
    |
    | Which model tier the character agents talk through by default for
    | reflex/considered turns. "deep" turns always escalate to the "opus"
    | tier regardless of this setting (see CharacterAgent::model()).
    |
    | Tiers map to concrete model ids in App\Enums\ChatModel — bump the
    | version there when Anthropic ships a new generation, not here.
    |
    | Supported: "haiku", "sonnet", "opus"
    */

    'model' => env('CHAT_MODEL', 'sonnet'),
];
