<?php

use App\Jobs\GenerateAssetCandidatesJob;
use App\Models\AssetCandidate;
use App\Models\AssetRequest;
use Illuminate\Support\Facades\Queue;

use function Pest\Laravel\get;
use function Pest\Laravel\post;

beforeEach(function () {
    $this->withoutVite();
    Queue::fake();
});

it('creates a draft request with a composed prompt WITHOUT dispatching', function () {
    // Figura ficticia sin assets publicados: las reales acumulan archivos en
    // public/ que se vuelven fuente legada y cambian el source_path esperado.
    config(['estudio.figures.test-flow' => ['name' => 'Figura Flow', 'visual' => 'x', 'scene' => 'y']]);

    post(route('estudio.requests.store'), [
        'character_slug' => 'test-flow', 'type' => 'sprite', 'emote' => 'neutral',
    ])->assertRedirect();

    $request = AssetRequest::sole();
    expect($request->prompt)->toContain('Figura Flow')
        ->and($request->status)->toBe('pending')
        ->and($request->source_path)->toBeNull();

    // Spec §4.2: el prompt se revisa/edita en el detalle; el batch se dispara aparte.
    Queue::assertNothingPushed();
});

it('blocks emote sprites without an approved neutral source (kontext chain)', function () {
    // Figura ficticia: las reales del roster van acumulando assets publicados
    // en public/ y dejarían de estar "sin fuente".
    config(['estudio.figures.test-flow' => ['name' => 'Figura Flow', 'visual' => 'x', 'scene' => 'y']]);

    post(route('estudio.requests.store'), [
        'character_slug' => 'test-flow', 'type' => 'sprite', 'emote' => 'happy',
    ])->assertSessionHasErrors('emote');

    expect(AssetRequest::count())->toBe(0);
});

it('uses the approved neutral candidate as edit source for emotes', function () {
    $neutral = AssetRequest::factory()->create([
        'character_slug' => 'sor-juana', 'type' => 'sprite',
        'emote' => 'neutral', 'status' => 'approved',
    ]);
    $approved = AssetCandidate::factory()->for($neutral, 'request')->create(['status' => 'approved']);

    post(route('estudio.requests.store'), [
        'character_slug' => 'sor-juana', 'type' => 'sprite', 'emote' => 'happy',
    ])->assertRedirect();

    $request = AssetRequest::query()->where('emote', 'happy')->sole();
    expect($request->source_path)->toBe($approved->path)
        ->and($request->source_candidate_id)->toBe($approved->id);
});

it('fires the batch with the edited prompt', function () {
    $request = AssetRequest::factory()->create(['status' => 'ready_for_review']);

    post(route('estudio.requests.regenerate', $request), ['prompt' => 'nuevo prompt editado'])
        ->assertRedirect();

    expect($request->fresh())
        ->prompt->toBe('nuevo prompt editado')
        ->status->toBe('pending');

    Queue::assertPushed(GenerateAssetCandidatesJob::class);
});

it('shows the request with its candidates', function () {
    $request = AssetRequest::factory()->create(['status' => 'ready_for_review']);
    AssetCandidate::factory()->for($request, 'request')->count(3)->create();

    get(route('estudio.requests.show', $request))->assertInertia(fn ($page) => $page
        ->component('estudio/request')
        ->where('request.id', $request->id)
        ->has('candidates', 3));
});
