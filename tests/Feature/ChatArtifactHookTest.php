<?php

use App\Agents\FridaAgent;
use App\Services\ArtifactService;
use App\Models\User;
use Database\Seeders\CharacterSeeder;

beforeEach(function () {
    $this->seed(CharacterSeeder::class);
});

it('invokes the artifact hook when the streamed chat turn completes', function () {
    FridaAgent::fake(['¡Hola, escuincle!']);

    $spy = Mockery::spy(ArtifactService::class);
    app()->instance(ArtifactService::class, $spy);

    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('chat.send', 'frida'), [
        'message' => 'Hola Frida',
    ]);

    $response->assertSuccessful();

    // Drive the stream body so the closure (and the hook) executes. The closure
    // drains every output buffer down to level 0 (real-world FPM flushing), which
    // would also close PHPUnit's own buffer. Capture the level first and restore
    // it afterwards so PHPUnit doesn't flag the test as risky.
    $bufferLevel = ob_get_level();
    ob_start();
    $response->baseResponse->sendContent();
    while (ob_get_level() < $bufferLevel) {
        ob_start();
    }

    $spy->shouldHaveReceived('persistFromConversation');
});
