<?php

use App\Models\User;
use App\Tools\Frida\LeerteLaCara;
use App\Tools\Frida\RecetaDeCoyoacan;
use App\Tools\Frida\RetratoFrida;
use Database\Seeders\CharacterSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Ai\Image;
use Laravel\Ai\Tools\Request;

beforeEach(function () {
    $this->seed(CharacterSeeder::class);
});

it('returns receta artifact JSON with all expected fields', function () {
    $tool = new RecetaDeCoyoacan;

    $result = $tool->handle(new Request([
        'title' => 'Mole de olla',
        'servings' => '4 personas',
        'time' => '1 hora',
        'ingredients' => [
            ['amount' => '500g', 'name' => 'falda de res'],
            ['amount' => '1 manojo', 'name' => 'epazote fresco'],
        ],
        'steps' => ['Hierve la carne', 'Tatema los chiles'],
        'frida_note' => 'Este lo hacía cuando Diego volvía con hambre.',
    ]));

    $payload = json_decode($result, true);

    expect($payload['artifact_type'])->toBe('receta')
        ->and($payload['data']['title'])->toBe('Mole de olla')
        ->and($payload['data']['ingredients'])->toHaveCount(2)
        ->and($payload['data']['steps'])->toHaveCount(2)
        ->and($payload['data']['frida_note'])->toContain('Diego');
});

it('returns reading artifact with photo URL when path provided', function () {
    Storage::fake('public');
    Storage::disk('public')->put('uploads/1/test.jpg', 'fake-bytes');

    $tool = new LeerteLaCara('uploads/1/test.jpg');

    $result = $tool->handle(new Request([
        'observation' => 'Tienes los ojos de quien aguanta.',
        'verdict' => 'Esa boca calla un grito.',
        'palette' => [
            ['name' => 'rojo de jaula', 'hex' => '#8B0000'],
            ['name' => 'verde de espina', 'hex' => '#2F4F2F'],
            ['name' => 'azul de noche', 'hex' => '#0E1E3F'],
        ],
        'metaphor' => 'Una rama de mezquite en el desierto.',
    ]));

    $payload = json_decode($result, true);

    expect($payload['artifact_type'])->toBe('reading')
        ->and($payload['data']['palette'])->toHaveCount(3)
        ->and($payload['data']['photo_url'])->toContain('uploads/1/test.jpg');
});

it('retrato tool returns error artifact when no photo is attached', function () {
    $tool = new RetratoFrida(null);

    $result = $tool->handle(new Request([
        'style_prompt' => 'paleta cálida, fondo selvático',
        'title' => 'Raíz y vuelo',
    ]));

    $payload = json_decode($result, true);

    expect($payload['artifact_type'])->toBe('error')
        ->and($payload['data']['message'])->toContain('foto');
});

it('retrato tool generates a portrait when a photo is attached', function () {
    Storage::fake('public');
    Storage::disk('public')->put('uploads/1/me.jpg', 'fake-photo-bytes');

    Image::fake([base64_encode('fake-png-bytes')]);

    $tool = new RetratoFrida('uploads/1/me.jpg');

    $result = $tool->handle(new Request([
        'style_prompt' => 'paleta cálida, espinas, fondo selvático',
        'title' => 'Raíz y vuelo',
    ]));

    $payload = json_decode($result, true);

    expect($payload['artifact_type'])->toBe('portrait')
        ->and($payload['data']['title'])->toBe('Raíz y vuelo')
        ->and($payload['data']['image_url'])->toContain('storage/generated/frida/');

    Image::assertGenerated(fn ($prompt) => $prompt->contains('Frida Kahlo'));
});

it('chat send endpoint stores uploaded image on the public disk', function () {
    Storage::fake('public');

    $user = User::factory()->create();

    $this->actingAs($user)->post(route('chat.send', 'frida'), [
        'message' => 'Mírame',
        'image' => UploadedFile::fake()->image('me.jpg', 200, 200),
    ])->assertSuccessful();

    expect(Storage::disk('public')->allFiles("uploads/{$user->id}"))->not->toBeEmpty();
});
