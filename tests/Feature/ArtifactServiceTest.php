<?php

use App\Models\Artifact;
use App\Models\Character;
use App\Models\User;
use Database\Seeders\CharacterSeeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

beforeEach(function () {
    $this->seed(CharacterSeeder::class);
});

function seedConversationTurn(int $userId, array $toolResults, ?string $conversationId = null): string
{
    $convId = $conversationId ?? (string) Str::uuid();

    DB::table('agent_conversations')->insertOrIgnore([
        'id' => $convId,
        'user_id' => $userId,
        'title' => 'Test',
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    DB::table('agent_conversation_messages')->insert([
        'id' => (string) Str::uuid(),
        'conversation_id' => $convId,
        'user_id' => $userId,
        'agent' => 'App\\Agents\\FridaAgent',
        'role' => 'assistant',
        'content' => 'Aquí está, escuincle.',
        'attachments' => '[]',
        'tool_calls' => '[]',
        'tool_results' => json_encode($toolResults),
        'usage' => '[]',
        'meta' => '[]',
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    return $convId;
}

it('persists an artifact with json data and relations', function () {
    $user = User::factory()->create();
    $frida = Character::where('slug', 'frida')->firstOrFail();

    $artifact = Artifact::factory()->create([
        'user_id' => $user->id,
        'character_id' => $frida->id,
        'type' => 'receta',
        'title' => 'Mole de olla',
        'data' => ['title' => 'Mole de olla', 'steps' => ['Hierve la carne']],
    ]);

    expect($artifact->fresh()->data['steps'])->toBe(['Hierve la carne'])
        ->and($artifact->character->slug)->toBe('frida')
        ->and($artifact->user->id)->toBe($user->id)
        ->and($artifact->status)->toBe('final');
});

it('persists artifacts from the latest assistant message tool_results', function () {
    $user = User::factory()->create();
    $frida = Character::where('slug', 'frida')->firstOrFail();

    $convId = seedConversationTurn($user->id, [
        ['result' => json_encode([
            'artifact_type' => 'receta',
            'data' => ['title' => 'Mole de olla', 'steps' => ['Hierve']],
        ])],
    ]);

    $count = app(\App\Services\ArtifactService::class)
        ->persistFromConversation($convId, $user->id, $frida);

    expect($count)->toBe(1);

    $artifact = Artifact::sole();
    expect($artifact->type)->toBe('receta')
        ->and($artifact->title)->toBe('Mole de olla')
        ->and($artifact->conversation_id)->toBe($convId)
        ->and($artifact->character_id)->toBe($frida->id)
        ->and($artifact->user_id)->toBe($user->id);
});

it('skips error artifacts and exact duplicates', function () {
    $user = User::factory()->create();
    $frida = Character::where('slug', 'frida')->firstOrFail();

    $convId = seedConversationTurn($user->id, [
        ['result' => json_encode(['artifact_type' => 'error', 'data' => ['message' => 'sin foto']])],
        ['result' => json_encode(['artifact_type' => 'receta', 'data' => ['title' => 'Tamales']])],
    ]);

    $service = app(\App\Services\ArtifactService::class);

    expect($service->persistFromConversation($convId, $user->id, $frida))->toBe(1);
    // Segunda llamada sobre el mismo mensaje: no duplica.
    expect($service->persistFromConversation($convId, $user->id, $frida))->toBe(0)
        ->and(Artifact::count())->toBe(1);
});

it('returns zero when the message has no tool results', function () {
    $user = User::factory()->create();
    $frida = Character::where('slug', 'frida')->firstOrFail();

    $convId = seedConversationTurn($user->id, []);

    expect(app(\App\Services\ArtifactService::class)->persistFromConversation($convId, $user->id, $frida))->toBe(0);
});
