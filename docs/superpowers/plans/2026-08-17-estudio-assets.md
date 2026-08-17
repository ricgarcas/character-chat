# Estudio de Assets — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir `/estudio`, la herramienta interna (solo entorno local) que genera vía gpt-image-2 en fal.ai, deja revisar en galería y publica a `public/` los 6 assets por figura del roster de 14 (4 sprites de cuerpo completo, 1 busto, 1 fondo).

**Architecture:** Dos tablas (`asset_requests` + `asset_candidates`) modelan cada pedido de generación y sus 3 candidatos. Un job de queue llama `FalImageService` (extendido para batches): text-to-image para `sprite:neutral`/`background`, y edit-encadenado desde el neutral aprobado para los demás emotes y el busto (consistencia de personaje). Una matriz Inertia figura×slot muestra el estado; aprobar un candidato lo normaliza con GD y lo escribe al destino en `public/` (assets versionados en git).

**Tech Stack:** Laravel 13, Pest, queue (`redis` local), Inertia v3 + React 19 + Tailwind v4, Wayfinder, fal.ai (`openai/gpt-image-2`, fallback remove-bg `fal-ai/birefnet`), GD.

**Spec:** `docs/superpowers/specs/2026-08-17-escena-y-estudio-assets-design.md`

## Global Constraints

- Rutas del Estudio **siempre registradas**, protegidas por middleware `EnsureLocalEnvironment` (404 fuera de `local`). NUNCA registrar rutas condicionalmente — rompe Wayfinder en el build de prod.
- Specs de assets exactos (spec §2): sprites `1024×1536` PNG transparente en `public/sprites/<slug>/<emote>.png`; busto `1024×1024` PNG en `public/avatars/<slug>/neutral.png`; fondo `1024×1536` PNG en `public/backgrounds/<slug>.png`.
- Emotes canónicos, en este orden: `neutral`, `happy`, `thinking`, `surprised`.
- 3 candidatos por batch. Staging en disco `public`, carpeta `asset-staging/`.
- Los assets de Frida NO se tocan (sprites/props/fondo existentes = figura insignia).
- Feature tests usan `RefreshDatabase` (ya global en `tests/Pest.php`). Nunca llamar la red real en tests: `Http::fake()` + `Queue::fake()` + `Storage::fake()`.
- UI del Estudio en español, strings hardcodeados en los componentes (herramienta interna, sin copy de marketing — no va a `lang/es.json`).
- Después de tocar `routes/web.php` correr `php artisan wayfinder:generate` antes de trabajar frontend.
- Commit al final de cada task.

---

### Task 1: Migración + modelos `AssetRequest` y `AssetCandidate`

**Files:**
- Create: `database/migrations/2026_08_17_000001_create_asset_requests_table.php`
- Create: `database/migrations/2026_08_17_000002_create_asset_candidates_table.php`
- Create: `app/Models/AssetRequest.php`
- Create: `app/Models/AssetCandidate.php`
- Create: `database/factories/AssetRequestFactory.php`
- Create: `database/factories/AssetCandidateFactory.php`
- Test: `tests/Feature/Estudio/AssetModelsTest.php`

**Interfaces:**
- Produces: `AssetRequest` (fillable: `character_slug, type, emote, prompt, source_candidate_id, source_path, status, error`; métodos `candidates(): HasMany`, `destinationPath(): string`, `targetDimensions(): array{int,int}`); `AssetCandidate` (fillable: `asset_request_id, path, status, meta`; cast `meta: array`; método `request(): BelongsTo`). Status strings de request: `pending|generating|ready_for_review|approved|failed`; de candidato: `candidate|approved|rejected`.

- [ ] **Step 1: Write the failing test**

```php
<?php
// tests/Feature/Estudio/AssetModelsTest.php

use App\Models\AssetCandidate;
use App\Models\AssetRequest;

it('creates a request with its candidates', function () {
    $request = AssetRequest::factory()->create([
        'character_slug' => 'sor-juana',
        'type' => 'sprite',
        'emote' => 'neutral',
    ]);

    $candidate = AssetCandidate::factory()->for($request, 'request')->create([
        'meta' => ['seed' => 42],
    ]);

    expect($request->candidates)->toHaveCount(1)
        ->and($candidate->request->id)->toBe($request->id)
        ->and($candidate->meta)->toBe(['seed' => 42])
        ->and($request->status)->toBe('pending');
});

it('resolves the destination path per asset type', function (string $type, ?string $emote, string $expected) {
    $request = AssetRequest::factory()->make([
        'character_slug' => 'sor-juana', 'type' => $type, 'emote' => $emote,
    ]);

    expect($request->destinationPath())->toBe($expected);
})->with([
    ['sprite', 'happy', 'sprites/sor-juana/happy.png'],
    ['avatar', null, 'avatars/sor-juana/neutral.png'],
    ['background', null, 'backgrounds/sor-juana.png'],
]);

it('resolves target dimensions per asset type', function () {
    $sprite = AssetRequest::factory()->make(['type' => 'sprite', 'emote' => 'neutral']);
    $avatar = AssetRequest::factory()->make(['type' => 'avatar', 'emote' => null]);

    expect($sprite->targetDimensions())->toBe([1024, 1536])
        ->and($avatar->targetDimensions())->toBe([1024, 1024]);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `php artisan test tests/Feature/Estudio/AssetModelsTest.php`
Expected: FAIL — `Class "App\Models\AssetRequest" not found`.

- [ ] **Step 3: Write migrations, models, factories**

```php
<?php
// database/migrations/2026_08_17_000001_create_asset_requests_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('asset_requests', function (Blueprint $table) {
            $table->id();
            $table->string('character_slug')->index();
            $table->string('type', 12); // sprite|avatar|background
            $table->string('emote', 12)->nullable(); // solo sprite: neutral|happy|thinking|surprised
            $table->text('prompt');
            $table->foreignId('source_candidate_id')->nullable(); // auditoría: de qué candidato deriva un edit
            $table->string('source_path')->nullable(); // path en disco public usado como fuente del edit
            $table->string('status', 20)->default('pending'); // pending|generating|ready_for_review|approved|failed
            $table->text('error')->nullable();
            $table->timestamps();

            $table->index(['character_slug', 'type', 'emote']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('asset_requests');
    }
};
```

```php
<?php
// database/migrations/2026_08_17_000002_create_asset_candidates_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('asset_candidates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asset_request_id')->constrained()->cascadeOnDelete();
            $table->string('path'); // staging, disco public
            $table->string('status', 12)->default('candidate'); // candidate|approved|rejected
            $table->json('meta')->nullable(); // respuesta cruda de fal
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('asset_candidates');
    }
};
```

```php
<?php
// app/Models/AssetRequest.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AssetRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'character_slug', 'type', 'emote', 'prompt',
        'source_candidate_id', 'source_path', 'status', 'error',
    ];

    public function candidates(): HasMany
    {
        return $this->hasMany(AssetCandidate::class);
    }

    /** Destino relativo a public/ (assets versionados en git). */
    public function destinationPath(): string
    {
        return match ($this->type) {
            'sprite' => "sprites/{$this->character_slug}/{$this->emote}.png",
            'avatar' => "avatars/{$this->character_slug}/neutral.png",
            'background' => "backgrounds/{$this->character_slug}.png",
        };
    }

    /** @return array{int,int} [ancho, alto] según spec §2 */
    public function targetDimensions(): array
    {
        return match ($this->type) {
            'sprite', 'background' => [1024, 1536],
            'avatar' => [1024, 1024],
        };
    }
}
```

```php
<?php
// app/Models/AssetCandidate.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AssetCandidate extends Model
{
    use HasFactory;

    protected $fillable = ['asset_request_id', 'path', 'status', 'meta'];

    protected function casts(): array
    {
        return ['meta' => 'array'];
    }

    public function request(): BelongsTo
    {
        return $this->belongsTo(AssetRequest::class, 'asset_request_id');
    }
}
```

```php
<?php
// database/factories/AssetRequestFactory.php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class AssetRequestFactory extends Factory
{
    public function definition(): array
    {
        return [
            'character_slug' => 'sor-juana',
            'type' => 'sprite',
            'emote' => 'neutral',
            'prompt' => 'test prompt',
            'status' => 'pending',
        ];
    }
}
```

```php
<?php
// database/factories/AssetCandidateFactory.php

namespace Database\Factories;

use App\Models\AssetRequest;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class AssetCandidateFactory extends Factory
{
    public function definition(): array
    {
        return [
            'asset_request_id' => AssetRequest::factory(),
            'path' => 'asset-staging/sor-juana/'.Str::uuid().'.png',
            'status' => 'candidate',
            'meta' => null,
        ];
    }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `php artisan test tests/Feature/Estudio/AssetModelsTest.php`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add database/migrations/2026_08_17_* app/Models/Asset*.php database/factories/Asset*.php tests/Feature/Estudio/AssetModelsTest.php
git commit -m "feat(estudio): asset_requests y asset_candidates como entidades base"
```

---

### Task 2: `config/estudio.php` + `AssetPromptComposer`

**Files:**
- Create: `config/estudio.php`
- Create: `app/Services/Estudio/AssetPromptComposer.php`
- Test: `tests/Unit/AssetPromptComposerTest.php`

**Interfaces:**
- Consumes: nada de tasks anteriores.
- Produces: `config('estudio.figures')` (mapa slug → `['name' => string, 'visual' => string, 'scene' => string]`, 14 entradas); `config('estudio.candidates_per_batch')` (int 3); `config('estudio.models.default')`, `config('estudio.models.rembg')`, `config('estudio.transparency_mode')` (`native|rembg`); `AssetPromptComposer::compose(string $slug, string $type, ?string $emote): string`.

- [ ] **Step 1: Write the failing test**

```php
<?php
// tests/Unit/AssetPromptComposerTest.php

use App\Services\Estudio\AssetPromptComposer;

it('composes a full-body neutral sprite prompt with the figure brief', function () {
    $prompt = app(AssetPromptComposer::class)->compose('sor-juana', 'sprite', 'neutral');

    expect($prompt)
        ->toContain('Sor Juana')             // nombre de la figura
        ->toContain('full-body')             // cuerpo completo
        ->toContain('transparent background') // transparencia
        ->toContain('pixel art');            // estilo de la casa
});

it('composes emote edits as change-only instructions', function () {
    $prompt = app(AssetPromptComposer::class)->compose('sor-juana', 'sprite', 'happy');

    expect($prompt)
        ->toContain('Same exact character')
        ->toContain('happy')
        ->not->toContain('full-body'); // los edits no re-describen al personaje
});

it('composes background prompts without people', function () {
    $prompt = app(AssetPromptComposer::class)->compose('nezahualcoyotl', 'background', null);

    expect($prompt)->toContain('no people')->toContain('vertical');
});

it('has the 14 locked roster figures configured', function () {
    expect(config('estudio.figures'))->toHaveCount(14)
        ->toHaveKeys(['frida', 'dali', 'freud', 'beauvoir', 'sor-juana', 'einstein',
            'da-vinci', 'nezahualcoyotl', 'socrates', 'marie-curie', 'darwin',
            'van-gogh', 'cervantes', 'juarez']);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `php artisan test tests/Unit/AssetPromptComposerTest.php`
Expected: FAIL — `Class "App\Services\Estudio\AssetPromptComposer" not found`.

- [ ] **Step 3: Write config and composer**

```php
<?php
// config/estudio.php

return [

    'candidates_per_batch' => 3,

    'models' => [
        'default' => 'openai/gpt-image-2',
        'rembg' => 'fal-ai/birefnet',
    ],

    // 'native' pide background transparente a gpt-image; 'rembg' encadena
    // remove-background después de generar (contingencia del spec §2).
    'transparency_mode' => env('ESTUDIO_TRANSPARENCY', 'native'),

    // Roster lockeado — docs/saas/02-roster.md. 'visual' describe a la figura
    // para prompts de sprite/busto; 'scene' describe su mundo para el fondo.
    'figures' => [
        'frida' => ['name' => 'Frida Kahlo', 'visual' => 'Mexican painter with braided hair crowned with flowers, colorful huipil and rebozo, bold unibrow', 'scene' => 'Casa Azul courtyard in Coyoacán, cobalt walls, cacti and bougainvillea'],
        'dali' => ['name' => 'Salvador Dalí', 'visual' => 'Surrealist painter with iconic upturned mustache, wide theatrical eyes, elegant suit', 'scene' => 'surreal Catalan coast at golden hour, melting clocks, long shadows'],
        'freud' => ['name' => 'Sigmund Freud', 'visual' => 'Viennese psychoanalyst with white beard, round glasses, three-piece tweed suit, cigar', 'scene' => 'Vienna study with famous couch, oriental rugs, antiquities on shelves'],
        'beauvoir' => ['name' => 'Simone de Beauvoir', 'visual' => 'French philosopher with hair in an elegant updo wrapped in a turban, tailored blouse', 'scene' => 'Parisian café terrace with marble tables, notebooks and coffee'],
        'sor-juana' => ['name' => 'Sor Juana Inés de la Cruz', 'visual' => 'Novohispanic nun poet in black-and-white habit with large escudo de monja medallion, serene intelligent gaze', 'scene' => 'colonial convent library cell with quill, desk, shelves of leather books, candlelight'],
        'einstein' => ['name' => 'Albert Einstein', 'visual' => 'physicist with wild white hair and mustache, cozy sweater, playful eyes', 'scene' => 'chalkboard-filled study with equations, telescope by the window, papers everywhere'],
        'da-vinci' => ['name' => 'Leonardo da Vinci', 'visual' => 'Renaissance master with long beard, rose tunic and cap, curious expression', 'scene' => 'Renaissance workshop with flying machine sketches, gears, anatomical drawings'],
        'nezahualcoyotl' => ['name' => 'Nezahualcóyotl', 'visual' => 'Acolhua poet-king with jade and gold headdress with quetzal feathers, embroidered tilmatli cloak', 'scene' => 'Texcotzingo gardens with stone aqueduct, flowering terraces, lake vista at dusk'],
        'socrates' => ['name' => 'Sócrates', 'visual' => 'Greek philosopher, bald with full grey beard, simple himation robe, amused knowing look', 'scene' => 'Athenian agora with marble columns, olive tree, morning light'],
        'marie-curie' => ['name' => 'Marie Curie', 'visual' => 'physicist in dark Edwardian dress, hair in a bun, holding a glowing vial', 'scene' => 'laboratory with glassware, notebooks, softly glowing green vials on wooden benches'],
        'darwin' => ['name' => 'Charles Darwin', 'visual' => 'naturalist with great white beard, dark Victorian coat, gentle observant eyes', 'scene' => 'naturalist cabin aboard the Beagle, specimen jars, maps, finches at the window'],
        'van-gogh' => ['name' => 'Vincent van Gogh', 'visual' => 'red-haired painter with straw hat, paint-stained blue smock, intense kind eyes', 'scene' => 'Provence wheat field under swirling starry sky, cypress tree, small easel'],
        'cervantes' => ['name' => 'Miguel de Cervantes', 'visual' => 'Golden Age writer with pointed beard and ruff collar, quill in hand, wry smile', 'scene' => 'La Mancha plain with windmills at sunset, dusty road, distant inn'],
        'juarez' => ['name' => 'Benito Juárez', 'visual' => 'Mexican statesman in solemn black suit with high collar, holding a law book, dignified posture', 'scene' => 'republican study with Mexican flag, leather-bound law tomes, oil lamp'],
    ],

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
```

```php
<?php
// app/Services/Estudio/AssetPromptComposer.php

namespace App\Services\Estudio;

use InvalidArgumentException;

class AssetPromptComposer
{
    public function compose(string $slug, string $type, ?string $emote): string
    {
        $figure = config("estudio.figures.{$slug}")
            ?? throw new InvalidArgumentException("Figura desconocida: {$slug}");

        $prompts = config('estudio.prompts');

        $template = match (true) {
            $type === 'sprite' && $emote === 'neutral' => $prompts['sprite_neutral'],
            $type === 'sprite' => $prompts['sprite_emote'],
            $type === 'avatar' => $prompts['avatar'],
            $type === 'background' => $prompts['background'],
            default => throw new InvalidArgumentException("Tipo desconocido: {$type}"),
        };

        return strtr($template, [
            '{name}' => $figure['name'],
            '{visual}' => $figure['visual'],
            '{scene}' => $figure['scene'],
            '{base}' => $prompts['base'],
            '{emote_direction}' => $emote ? (config("estudio.emote_directions.{$emote}") ?? $emote) : '',
        ]);
    }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `php artisan test tests/Unit/AssetPromptComposerTest.php`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add config/estudio.php app/Services/Estudio/AssetPromptComposer.php tests/Unit/AssetPromptComposerTest.php
git commit -m "feat(estudio): config del roster + compositor de prompts"
```

---

### Task 3: Batches en `FalImageService`

**Files:**
- Modify: `app/Services/ImageGeneration/FalImageService.php` (métodos `run`/`storeRemoteImage`, ~líneas 105-177)
- Test: `tests/Feature/Estudio/FalBatchTest.php`

**Interfaces:**
- Consumes: `FalImageService::generate()/edit()` existentes (NO cambian su firma ni comportamiento — devuelven la primera imagen).
- Produces: `FalImageService::generateBatch(string $prompt, array $opts): array` y `editBatch(string $prompt, string $sourcePath, array $opts): array` — cada una devuelve `list<array{path: string, url: string, raw: array}>` con TODAS las imágenes del batch guardadas en disco.

- [ ] **Step 1: Write the failing test**

```php
<?php
// tests/Feature/Estudio/FalBatchTest.php

use App\Services\ImageGeneration\FalImageService;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake('public');
    config(['services.fal.key' => 'test-key']);
});

it('stores every image of a batch', function () {
    Http::fake([
        'fal.run/*' => Http::response([
            'images' => [
                ['url' => 'https://fal.media/a.png'],
                ['url' => 'https://fal.media/b.png'],
                ['url' => 'https://fal.media/c.png'],
            ],
        ]),
        'fal.media/*' => Http::response('png-bytes'),
    ]);

    $results = app(FalImageService::class)->generateBatch('a prompt', [
        'num_images' => 3,
        'folder' => 'asset-staging/sor-juana',
    ]);

    expect($results)->toHaveCount(3);
    foreach ($results as $result) {
        Storage::disk('public')->assertExists($result['path']);
        expect($result['path'])->toStartWith('asset-staging/sor-juana/');
    }
});

it('keeps the single-image API intact', function () {
    Http::fake([
        'fal.run/*' => Http::response(['images' => [['url' => 'https://fal.media/a.png']]]),
        'fal.media/*' => Http::response('png-bytes'),
    ]);

    $result = app(FalImageService::class)->generate('a prompt', ['folder' => 'generated']);

    expect($result)->toHaveKeys(['path', 'url', 'raw']);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `php artisan test tests/Feature/Estudio/FalBatchTest.php`
Expected: FAIL — `Call to undefined method ... generateBatch()`.

- [ ] **Step 3: Implement batch methods**

En `FalImageService`, refactorizar sin romper la API existente:

```php
// Nuevos métodos públicos:

/** @return list<array{path: string, url: string, raw: array<string,mixed>}> */
public function generateBatch(string $prompt, array $opts = []): array
{
    $payload = [
        'prompt' => $prompt,
        'quality' => $opts['quality'] ?? 'high',
        'output_format' => $opts['output_format'] ?? 'png',
        'num_images' => $opts['num_images'] ?? 1,
    ];

    if (isset($opts['image_size'])) {
        $payload['image_size'] = $opts['image_size'];
    }

    if (isset($opts['extra']) && is_array($opts['extra'])) {
        $payload = array_merge($payload, $opts['extra']);
    }

    return $this->runBatch($opts['model'] ?? 'openai/gpt-image-2', $payload, $opts);
}

/** @return list<array{path: string, url: string, raw: array<string,mixed>}> */
public function editBatch(string $prompt, string $sourcePhotoPath, array $opts = []): array
{
    // Mismo armado de payload que edit() (reusar extrayendo un helper
    // protected buildEditPayload(string $prompt, string $imageDataUri, array $opts): array
    // que edit() también llama), pero terminando en runBatch().
    $disk = $opts['disk'] ?? 'public';
    $imageDataUri = $this->fileToDataUri($sourcePhotoPath, $disk);
    $model = $opts['model'] ?? 'openai/gpt-image-2';
    $payload = $this->buildEditPayload($prompt, $imageDataUri, array_merge($opts, ['model' => $model]));

    return $this->runBatch($model, $payload, $opts);
}

// runBatch() es run() pero recorriendo $body['images'] completo:
/** @return list<array{path: string, url: string, raw: array<string,mixed>}> */
protected function runBatch(string $model, array $payload, array $opts): array
{
    // ... misma validación de apiKey, POST y manejo de error que run() ...
    $body = $response->json();
    $images = $body['images'] ?? [];

    if ($images === []) {
        throw new RuntimeException('fal.ai response missing images: '.$response->body());
    }

    return array_map(
        fn (array $img) => $this->storeRemoteImage($img['url'], $body, $opts),
        array_values($images),
    );
}
```

Y `run()` se reescribe como `return $this->runBatch($model, $payload, $opts)[0];` para no duplicar el HTTP. `edit()` usa el helper `buildEditPayload()` extraído (el mismo branching Kontext/gpt-image que ya tiene).

- [ ] **Step 4: Run ALL image tests to verify no regression**

Run: `php artisan test tests/Feature/Estudio/FalBatchTest.php && php artisan test --parallel`
Expected: PASS los nuevos y la suite completa sigue verde.

- [ ] **Step 5: Commit**

```bash
git add app/Services/ImageGeneration/FalImageService.php tests/Feature/Estudio/FalBatchTest.php
git commit -m "feat(estudio): batches multi-imagen en FalImageService"
```

---

### Task 4: `GenerateAssetCandidatesJob`

**Files:**
- Create: `app/Jobs/GenerateAssetCandidatesJob.php`
- Test: `tests/Feature/Estudio/GenerateAssetCandidatesJobTest.php`

**Interfaces:**
- Consumes: `AssetRequest`/`AssetCandidate` (Task 1), `config('estudio.*')` (Task 2), `FalImageService::generateBatch()/editBatch()` (Task 3).
- Produces: `GenerateAssetCandidatesJob` con constructor `(public int $assetRequestId)`. Al terminar: request `ready_for_review` con N `AssetCandidate` en staging, o `failed` con `error`.

- [ ] **Step 1: Write the failing test**

```php
<?php
// tests/Feature/Estudio/GenerateAssetCandidatesJobTest.php

use App\Jobs\GenerateAssetCandidatesJob;
use App\Models\AssetRequest;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake('public');
    config(['services.fal.key' => 'test-key']);
});

function fakeFalBatch(): void
{
    Http::fake([
        'fal.run/*' => Http::response([
            'images' => [
                ['url' => 'https://fal.media/a.png'],
                ['url' => 'https://fal.media/b.png'],
                ['url' => 'https://fal.media/c.png'],
            ],
        ]),
        'fal.media/*' => Http::response('png-bytes'),
    ]);
}

it('generates candidates via text-to-image for a neutral sprite', function () {
    fakeFalBatch();

    $request = AssetRequest::factory()->create(['type' => 'sprite', 'emote' => 'neutral']);

    (new GenerateAssetCandidatesJob($request->id))->handle();

    expect($request->fresh())
        ->status->toBe('ready_for_review')
        ->candidates->toHaveCount(3);

    // text-to-image: el payload NO lleva imagen fuente
    Http::assertSent(fn ($req) => str_contains($req->url(), 'fal.run')
        && ! isset($req['image_urls']) && ! isset($req['image_url']));
});

it('generates emote sprites as edits of the source image', function () {
    fakeFalBatch();
    Storage::disk('public')->put('asset-staging/sor-juana/neutral-approved.png', 'png');

    $request = AssetRequest::factory()->create([
        'type' => 'sprite', 'emote' => 'happy',
        'source_path' => 'asset-staging/sor-juana/neutral-approved.png',
    ]);

    (new GenerateAssetCandidatesJob($request->id))->handle();

    expect($request->fresh())->status->toBe('ready_for_review');

    Http::assertSent(fn ($req) => str_contains($req->url(), 'fal.run')
        && (isset($req['image_urls']) || isset($req['image_url'])));
});

it('marks the request failed when fal errors', function () {
    Http::fake(['fal.run/*' => Http::response('boom', 500)]);

    $request = AssetRequest::factory()->create(['type' => 'background', 'emote' => null]);

    (new GenerateAssetCandidatesJob($request->id))->handle();

    expect($request->fresh())
        ->status->toBe('failed')
        ->error->not->toBeNull();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `php artisan test tests/Feature/Estudio/GenerateAssetCandidatesJobTest.php`
Expected: FAIL — clase no existe.

- [ ] **Step 3: Implement the job**

```php
<?php
// app/Jobs/GenerateAssetCandidatesJob.php

namespace App\Jobs;

use App\Models\AssetRequest;
use App\Services\ImageGeneration\FalImageService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Throwable;

class GenerateAssetCandidatesJob implements ShouldQueue
{
    use Queueable;

    public int $timeout = 300;

    public int $tries = 1;

    public function __construct(public int $assetRequestId) {}

    public function handle(): void
    {
        $request = AssetRequest::findOrFail($this->assetRequestId);
        $request->update(['status' => 'generating', 'error' => null]);

        try {
            $fal = app(FalImageService::class);

            $opts = [
                'model' => config('estudio.models.default'),
                'num_images' => config('estudio.candidates_per_batch'),
                'folder' => "asset-staging/{$request->character_slug}",
                'output_format' => 'png',
                'image_size' => $request->type === 'avatar' ? '1024x1024' : '1024x1536',
            ];

            // Sprites llevan transparencia nativa (contingencia rembg: Task 5).
            if ($request->type === 'sprite' && config('estudio.transparency_mode') === 'native') {
                $opts['extra'] = ['background' => 'transparent'];
            }

            $results = $request->source_path
                ? $fal->editBatch($request->prompt, $request->source_path, $opts)
                : $fal->generateBatch($request->prompt, $opts);

            foreach ($results as $result) {
                $request->candidates()->create([
                    'path' => $result['path'],
                    'meta' => ['url' => $result['url']],
                ]);
            }

            $request->update(['status' => 'ready_for_review']);
        } catch (Throwable $e) {
            Log::error('GenerateAssetCandidatesJob failed', [
                'asset_request_id' => $request->id,
                'error' => $e->getMessage(),
            ]);
            $request->update(['status' => 'failed', 'error' => $e->getMessage()]);
        }
    }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `php artisan test tests/Feature/Estudio/GenerateAssetCandidatesJobTest.php`
Expected: PASS (3 tests).

- [ ] **Step 5: Verify storage symlink exists for local use**

Run: `php artisan storage:link` (idempotente — necesario para que la UI muestre `/storage/asset-staging/...`).

- [ ] **Step 6: Commit**

```bash
git add app/Jobs/GenerateAssetCandidatesJob.php tests/Feature/Estudio/GenerateAssetCandidatesJobTest.php
git commit -m "feat(estudio): job de generación de candidatos"
```

---

### Task 5: Contingencia de transparencia (remove-bg encadenado)

**Files:**
- Modify: `app/Jobs/GenerateAssetCandidatesJob.php`
- Test: `tests/Feature/Estudio/GenerateAssetCandidatesJobTest.php` (agregar caso)

**Interfaces:**
- Consumes: `config('estudio.transparency_mode')` y `config('estudio.models.rembg')` (Task 2), `FalImageService::editBatch()` (Task 3).
- Produces: cuando `transparency_mode === 'rembg'`, cada candidato sprite pasa por el modelo rembg antes de persistirse. Sin cambios de interfaz pública.

- [ ] **Step 1: Write the failing test** (agregar al archivo del job)

```php
it('chains remove-background per sprite candidate when mode is rembg', function () {
    config(['estudio.transparency_mode' => 'rembg']);
    fakeFalBatch();

    $request = AssetRequest::factory()->create(['type' => 'sprite', 'emote' => 'neutral']);

    (new GenerateAssetCandidatesJob($request->id))->handle();

    expect($request->fresh())->status->toBe('ready_for_review');

    Http::assertSent(fn ($req) => str_contains($req->url(), 'birefnet'));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `php artisan test tests/Feature/Estudio/GenerateAssetCandidatesJobTest.php`
Expected: FAIL — nunca se llamó birefnet.

- [ ] **Step 3: Implement the rembg branch**

En el job, después de obtener `$results` y solo si `$request->type === 'sprite' && config('estudio.transparency_mode') === 'rembg'`:

```php
$results = array_map(function (array $result) use ($fal, $request) {
    return $fal->editBatch(
        prompt: 'remove background', // birefnet ignora el prompt; se manda por contrato de editBatch
        sourcePhotoPath: $result['path'],
        opts: [
            'model' => config('estudio.models.rembg'),
            'num_images' => 1,
            'folder' => "asset-staging/{$request->character_slug}",
            'output_format' => 'png',
        ],
    )[0];
}, $results);
```

Y el bloque `if (... 'native')` de Task 4 queda como está (los dos modos son excluyentes).

- [ ] **Step 4: Run test to verify it passes**

Run: `php artisan test tests/Feature/Estudio/GenerateAssetCandidatesJobTest.php`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add app/Jobs/GenerateAssetCandidatesJob.php tests/Feature/Estudio/GenerateAssetCandidatesJobTest.php
git commit -m "feat(estudio): fallback rembg para transparencia de sprites"
```

---

### Task 6: Middleware local-only + rutas + matriz (`EstudioController@index`)

**Files:**
- Create: `app/Http/Middleware/EnsureLocalEnvironment.php`
- Create: `app/Http/Controllers/Estudio/EstudioController.php`
- Modify: `routes/web.php` (agregar grupo al final, antes del `require`)
- Test: `tests/Feature/Estudio/EstudioAccessTest.php`

**Interfaces:**
- Consumes: `AssetRequest` (Task 1), `config('estudio.figures')` (Task 2).
- Produces: rutas nombradas `estudio.index` (GET `/estudio`); prop Inertia `figures`: lista de 14 items `{slug, name, slots}` donde `slots` es un mapa de las 6 llaves `sprite.neutral|sprite.happy|sprite.thinking|sprite.surprised|avatar|background` a `{status: string, request_id: int|null, pending_candidates: int}`. Status posibles de slot: `approved|review|generating|failed|blocked|empty` (`approved` incluye archivos legado ya presentes en `public/`).

- [ ] **Step 1: Write the failing test**

```php
<?php
// tests/Feature/Estudio/EstudioAccessTest.php

use App\Models\AssetRequest;

use function Pest\Laravel\get;

beforeEach(fn () => $this->withoutVite());

it('is not found outside the local environment', function () {
    $this->app['env'] = 'production';

    get('/estudio')->assertNotFound();
});

it('renders the production matrix with the 14 figures', function () {
    get('/estudio')->assertOk()->assertInertia(fn ($page) => $page
        ->component('estudio/index')
        ->has('figures', 14)
        ->where('figures.0.slug', 'frida')
        // Frida tiene sprites/avatars/backgrounds legado en public/ → approved
        ->where('figures.0.slots.sprite\.neutral.status', 'approved')
        ->where('figures.0.slots.background.status', 'approved'));
});

it('derives slot statuses from requests and the kontext chain', function () {
    AssetRequest::factory()->create([
        'character_slug' => 'sor-juana', 'type' => 'sprite',
        'emote' => 'neutral', 'status' => 'ready_for_review',
    ]);

    get('/estudio')->assertInertia(fn ($page) => $page
        ->component('estudio/index')
        ->where('figures.4.slug', 'sor-juana')
        ->where('figures.4.slots.sprite\.neutral.status', 'review')
        // sin neutral aprobado, los emotes están bloqueados
        ->where('figures.4.slots.sprite\.happy.status', 'blocked')
        ->where('figures.4.slots.background.status', 'empty'));
});
```

Nota: el orden de `figures` sigue el orden de inserción de `config('estudio.figures')` — frida index 0, sor-juana index 4. Las llaves de slot usan punto literal, por eso el escape `sprite\.neutral` en las aserciones.

- [ ] **Step 2: Run test to verify it fails**

Run: `php artisan test tests/Feature/Estudio/EstudioAccessTest.php`
Expected: FAIL — 404 en todas (la ruta no existe).

- [ ] **Step 3: Implement middleware, route, controller**

```php
<?php
// app/Http/Middleware/EnsureLocalEnvironment.php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureLocalEnvironment
{
    public function handle(Request $request, Closure $next): Response
    {
        abort_unless(app()->environment('local'), 404);

        return $next($request);
    }
}
```

En `routes/web.php`, antes del `require __DIR__.'/settings.php';`:

```php
use App\Http\Controllers\Estudio\EstudioController;
use App\Http\Middleware\EnsureLocalEnvironment;

// Estudio de Assets — herramienta interna. Rutas SIEMPRE registradas
// (Wayfinder las necesita en el build); el middleware las esconde fuera de local.
Route::middleware([EnsureLocalEnvironment::class])->prefix('estudio')->name('estudio.')->group(function () {
    Route::get('/', [EstudioController::class, 'index'])->name('index');
});
```

```php
<?php
// app/Http/Controllers/Estudio/EstudioController.php

namespace App\Http\Controllers\Estudio;

use App\Http\Controllers\Controller;
use App\Models\AssetRequest;
use Inertia\Inertia;
use Inertia\Response;

class EstudioController extends Controller
{
    private const EMOTES = ['neutral', 'happy', 'thinking', 'surprised'];

    public function index(): Response
    {
        $requests = AssetRequest::query()
            ->with('candidates')
            ->latest()
            ->get()
            ->groupBy(fn (AssetRequest $r) => "{$r->character_slug}|{$r->type}|{$r->emote}");

        $figures = collect(config('estudio.figures'))->map(function (array $figure, string $slug) use ($requests) {
            $slots = [];

            foreach (self::EMOTES as $emote) {
                $slots["sprite.{$emote}"] = $this->slotState($requests, $slug, 'sprite', $emote);
            }
            $slots['avatar'] = $this->slotState($requests, $slug, 'avatar', null);
            $slots['background'] = $this->slotState($requests, $slug, 'background', null);

            return ['slug' => $slug, 'name' => $figure['name'], 'slots' => $slots];
        })->values();

        return Inertia::render('estudio/index', ['figures' => $figures]);
    }

    /** @return array{status: string, request_id: int|null, pending_candidates: int} */
    private function slotState($requests, string $slug, string $type, ?string $emote): array
    {
        $latest = $requests->get("{$slug}|{$type}|{$emote}")?->first();

        $destination = match ($type) {
            'sprite' => public_path("sprites/{$slug}/{$emote}.png"),
            'avatar' => public_path("avatars/{$slug}/neutral.png"),
            'background' => public_path("backgrounds/{$slug}.png"),
        };

        $status = match (true) {
            $latest?->status === 'approved' || file_exists($destination) => 'approved',
            $latest?->status === 'ready_for_review' => 'review',
            $latest?->status === 'pending' => 'draft', // creado, prompt editable, aún sin disparar
            $latest?->status === 'generating' => 'generating',
            $latest?->status === 'failed' => 'failed',
            $type === 'sprite' && $emote !== 'neutral' && ! $this->hasNeutralSource($requests, $slug) => 'blocked',
            default => 'empty',
        };

        return [
            'status' => $status,
            'request_id' => $latest?->id,
            'pending_candidates' => $latest?->candidates->where('status', 'candidate')->count() ?? 0,
        ];
    }

    /** Hay fuente para la cadena: neutral aprobado en el Estudio o sprite/busto legado en public/. */
    private function hasNeutralSource($requests, string $slug): bool
    {
        return $requests->get("{$slug}|sprite|neutral")?->first()?->status === 'approved'
            || file_exists(public_path("sprites/{$slug}/neutral.png"))
            || file_exists(public_path("avatars/{$slug}/neutral.png"));
    }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `php artisan test tests/Feature/Estudio/EstudioAccessTest.php`
Expected: PASS (3 tests). Ojo: el segundo test pasa porque Dalí/Freud/Beauvoir tienen bustos legado → `hasNeutralSource` true → sus emotes NO están `blocked`; Sor Juana no tiene nada → `blocked`. Si `figures.4` no es sor-juana, revisar el orden del config, no el controller.

- [ ] **Step 5: Regenerate Wayfinder and commit**

```bash
php artisan wayfinder:generate
git add app/Http/Middleware/EnsureLocalEnvironment.php app/Http/Controllers/Estudio/ routes/web.php resources/js/routes resources/js/actions tests/Feature/Estudio/EstudioAccessTest.php
git commit -m "feat(estudio): matriz de producción local-only"
```

---

### Task 7: Crear/regenerar requests + detalle (`AssetRequestController`)

**Files:**
- Create: `app/Http/Controllers/Estudio/AssetRequestController.php`
- Modify: `routes/web.php` (dentro del grupo `estudio.`)
- Test: `tests/Feature/Estudio/AssetRequestFlowTest.php`

**Interfaces:**
- Consumes: modelos (Task 1), `AssetPromptComposer::compose()` (Task 2), `GenerateAssetCandidatesJob` (Task 4), grupo de rutas (Task 6).
- Produces: rutas `estudio.requests.store` (POST `/estudio/requests`, body `{character_slug, type, emote?, prompt?}`), `estudio.requests.show` (GET `/estudio/requests/{assetRequest}`), `estudio.requests.regenerate` (POST `/estudio/requests/{assetRequest}/regenerate`, body `{prompt}`). `show` renderiza `estudio/request` con props `request` (`{id, character_slug, character_name, type, emote, prompt, status, error, destination_url}`) y `candidates` (lista `{id, url, status}`).

- [ ] **Step 1: Write the failing test**

```php
<?php
// tests/Feature/Estudio/AssetRequestFlowTest.php

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

it('creates a draft request with a composed prompt WITHOUT dispatching (prompt editable antes de disparar)', function () {
    post(route('estudio.requests.store'), [
        'character_slug' => 'sor-juana', 'type' => 'sprite', 'emote' => 'neutral',
    ])->assertRedirect();

    $request = AssetRequest::sole();
    expect($request->prompt)->toContain('Sor Juana')
        ->and($request->status)->toBe('pending')
        ->and($request->source_path)->toBeNull();

    // Spec §4.2: el prompt se revisa/edita en el detalle; el batch se dispara con regenerate.
    Queue::assertNothingPushed();
});

it('blocks emote sprites without an approved neutral source (kontext chain)', function () {
    post(route('estudio.requests.store'), [
        'character_slug' => 'sor-juana', 'type' => 'sprite', 'emote' => 'happy',
    ])->assertSessionHasErrors('emote');

    expect(AssetRequest::count())->toBe(0);
    Queue::assertNothingPushed();
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

it('fires the batch (first time or regenerate) with the edited prompt', function () {
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `php artisan test tests/Feature/Estudio/AssetRequestFlowTest.php`
Expected: FAIL — ruta `estudio.requests.store` no definida.

- [ ] **Step 3: Implement routes and controller**

Rutas (dentro del grupo `estudio.` de Task 6):

```php
Route::post('requests', [AssetRequestController::class, 'store'])->name('requests.store');
Route::get('requests/{assetRequest}', [AssetRequestController::class, 'show'])->name('requests.show');
Route::post('requests/{assetRequest}/regenerate', [AssetRequestController::class, 'regenerate'])->name('requests.regenerate');
```

```php
<?php
// app/Http/Controllers/Estudio/AssetRequestController.php

namespace App\Http\Controllers\Estudio;

use App\Http\Controllers\Controller;
use App\Jobs\GenerateAssetCandidatesJob;
use App\Models\AssetCandidate;
use App\Models\AssetRequest;
use App\Services\Estudio\AssetPromptComposer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AssetRequestController extends Controller
{
    public function store(Request $request, AssetPromptComposer $composer): RedirectResponse
    {
        $data = $request->validate([
            'character_slug' => ['required', Rule::in(array_keys(config('estudio.figures')))],
            'type' => ['required', Rule::in(['sprite', 'avatar', 'background'])],
            'emote' => ['nullable', 'required_if:type,sprite', Rule::in(['neutral', 'happy', 'thinking', 'surprised'])],
            'prompt' => ['nullable', 'string', 'max:4000'],
        ]);

        $emote = $data['type'] === 'sprite' ? $data['emote'] : null;

        [$sourcePath, $sourceCandidateId] = $this->resolveSource($data['character_slug'], $data['type'], $emote);

        $assetRequest = AssetRequest::create([
            'character_slug' => $data['character_slug'],
            'type' => $data['type'],
            'emote' => $emote,
            'prompt' => $data['prompt'] ?? $composer->compose($data['character_slug'], $data['type'], $emote),
            'source_path' => $sourcePath,
            'source_candidate_id' => $sourceCandidateId,
        ]);

        // NO se despacha aquí: el request nace como borrador y el detalle
        // muestra el prompt editable; "Generar batch" llama regenerate (spec §4.2).
        return redirect()->route('estudio.requests.show', $assetRequest);
    }

    public function show(AssetRequest $assetRequest): Response
    {
        return Inertia::render('estudio/request', [
            'request' => [
                'id' => $assetRequest->id,
                'character_slug' => $assetRequest->character_slug,
                'character_name' => config("estudio.figures.{$assetRequest->character_slug}.name"),
                'type' => $assetRequest->type,
                'emote' => $assetRequest->emote,
                'prompt' => $assetRequest->prompt,
                'status' => $assetRequest->status,
                'error' => $assetRequest->error,
                'destination_url' => '/'.$assetRequest->destinationPath(),
            ],
            'candidates' => $assetRequest->candidates->map(fn (AssetCandidate $c) => [
                'id' => $c->id,
                'url' => Storage::disk('public')->url($c->path),
                'status' => $c->status,
            ])->values(),
        ]);
    }

    public function regenerate(Request $request, AssetRequest $assetRequest): RedirectResponse
    {
        $data = $request->validate(['prompt' => ['required', 'string', 'max:4000']]);

        $assetRequest->update(['prompt' => $data['prompt'], 'status' => 'pending', 'error' => null]);

        GenerateAssetCandidatesJob::dispatch($assetRequest->id);

        return redirect()->route('estudio.requests.show', $assetRequest);
    }

    /**
     * Cadena Kontext + fuente del busto (spec §4.2).
     *
     * @return array{string|null, int|null} [source_path, source_candidate_id]
     */
    private function resolveSource(string $slug, string $type, ?string $emote): array
    {
        $needsSource = ($type === 'sprite' && $emote !== 'neutral') || $type === 'avatar';

        if (! $needsSource) {
            // Primer neutral de una figura legado: usar su busto como fuente si existe.
            if ($type === 'sprite' && $emote === 'neutral') {
                return [$this->stageLegacyFile("avatars/{$slug}/neutral.png", $slug), null];
            }

            return [null, null];
        }

        $approvedNeutral = AssetCandidate::query()
            ->where('status', 'approved')
            ->whereHas('request', fn ($q) => $q->where([
                'character_slug' => $slug, 'type' => 'sprite', 'emote' => 'neutral', 'status' => 'approved',
            ]))
            ->latest()
            ->first();

        if ($approvedNeutral) {
            return [$approvedNeutral->path, $approvedNeutral->id];
        }

        // Sprite neutral publicado directo en public/ (ej. Frida) también sirve de fuente.
        if ($staged = $this->stageLegacyFile("sprites/{$slug}/neutral.png", $slug)) {
            return [$staged, null];
        }

        throw ValidationException::withMessages([
            'emote' => 'Primero aprueba el sprite neutral de esta figura (cadena de consistencia).',
        ]);
    }

    /** Copia un archivo de public/ al staging (disco public) para poder usarlo como fuente de edit. */
    private function stageLegacyFile(string $publicRelative, string $slug): ?string
    {
        $absolute = public_path($publicRelative);

        if (! file_exists($absolute)) {
            return null;
        }

        $staged = "asset-staging/{$slug}/source-".basename($publicRelative);
        Storage::disk('public')->put($staged, (string) file_get_contents($absolute));

        return $staged;
    }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `php artisan test tests/Feature/Estudio/AssetRequestFlowTest.php`
Expected: PASS (5 tests).

- [ ] **Step 5: Regenerate Wayfinder and commit**

```bash
php artisan wayfinder:generate
git add app/Http/Controllers/Estudio/AssetRequestController.php routes/web.php resources/js/routes resources/js/actions tests/Feature/Estudio/AssetRequestFlowTest.php
git commit -m "feat(estudio): crear, regenerar y ver requests con cadena de consistencia"
```

---

### Task 8: Aprobar/rechazar + `PublishAssetAction`

**Files:**
- Create: `app/Actions/Estudio/PublishAssetAction.php`
- Create: `app/Http/Controllers/Estudio/AssetCandidateController.php`
- Modify: `routes/web.php` (grupo `estudio.`)
- Test: `tests/Feature/Estudio/PublishAssetTest.php`

**Interfaces:**
- Consumes: modelos (Task 1), rutas (Task 6).
- Produces: rutas `estudio.candidates.approve` (POST `/estudio/candidates/{assetCandidate}/approve`), `estudio.candidates.reject` (POST `/estudio/candidates/{assetCandidate}/reject`); `PublishAssetAction::publish(AssetCandidate $candidate): string` (devuelve el path publicado relativo a `public/`, normalizado a las dimensiones target con GD preservando alpha).

- [ ] **Step 1: Write the failing test**

```php
<?php
// tests/Feature/Estudio/PublishAssetTest.php

use App\Models\AssetCandidate;
use App\Models\AssetRequest;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

use function Pest\Laravel\post;

beforeEach(function () {
    $this->withoutVite();
    Storage::fake('public');
});

afterEach(function () {
    File::deleteDirectory(public_path('sprites/test-fixture'));
});

/** Crea un PNG real en staging con las dimensiones dadas. */
function stagePng(AssetRequest $request, int $w, int $h): AssetCandidate
{
    $img = imagecreatetruecolor($w, $h);
    imagesavealpha($img, true);
    imagefill($img, 0, 0, imagecolorallocatealpha($img, 255, 0, 0, 60));
    ob_start();
    imagepng($img);
    $bytes = ob_get_clean();

    $path = "asset-staging/{$request->character_slug}/candidate.png";
    Storage::disk('public')->put($path, $bytes);

    return AssetCandidate::factory()->for($request, 'request')->create(['path' => $path]);
}

it('publishes the approved candidate normalized to spec dimensions', function () {
    $request = AssetRequest::factory()->create([
        'character_slug' => 'test-fixture', 'type' => 'sprite',
        'emote' => 'neutral', 'status' => 'ready_for_review',
    ]);
    $candidate = stagePng($request, 512, 512); // dimensiones incorrectas a propósito
    $sibling = AssetCandidate::factory()->for($request, 'request')->create();

    post(route('estudio.candidates.approve', $candidate))->assertRedirect();

    expect($request->fresh())->status->toBe('approved')
        ->and($candidate->fresh())->status->toBe('approved')
        ->and($sibling->fresh())->status->toBe('rejected');

    $published = public_path('sprites/test-fixture/neutral.png');
    expect(file_exists($published))->toBeTrue();
    [$w, $h] = getimagesize($published);
    expect([$w, $h])->toBe([1024, 1536]); // normalizado al spec
});

it('rejects a candidate without touching the request status', function () {
    $request = AssetRequest::factory()->create(['status' => 'ready_for_review']);
    $candidate = AssetCandidate::factory()->for($request, 'request')->create();

    post(route('estudio.candidates.reject', $candidate))->assertRedirect();

    expect($candidate->fresh())->status->toBe('rejected')
        ->and($request->fresh())->status->toBe('ready_for_review');
});
```

Nota: `test-fixture` no está en `config('estudio.figures')` y no importa — publish opera sobre el request, no valida el roster (eso es del store). El `afterEach` limpia `public/sprites/test-fixture/`.

- [ ] **Step 2: Run test to verify it fails**

Run: `php artisan test tests/Feature/Estudio/PublishAssetTest.php`
Expected: FAIL — ruta no definida.

- [ ] **Step 3: Implement action, controller, routes**

Rutas (grupo `estudio.`):

```php
Route::post('candidates/{assetCandidate}/approve', [AssetCandidateController::class, 'approve'])->name('candidates.approve');
Route::post('candidates/{assetCandidate}/reject', [AssetCandidateController::class, 'reject'])->name('candidates.reject');
```

```php
<?php
// app/Actions/Estudio/PublishAssetAction.php

namespace App\Actions\Estudio;

use App\Models\AssetCandidate;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

class PublishAssetAction
{
    /** Normaliza el candidato al spec y lo escribe en public/. Devuelve el path relativo publicado. */
    public function publish(AssetCandidate $candidate): string
    {
        $request = $candidate->request;
        [$targetW, $targetH] = $request->targetDimensions();

        $bytes = Storage::disk('public')->get($candidate->path)
            ?? throw new RuntimeException("Candidato sin archivo en staging: {$candidate->path}");

        $src = imagecreatefromstring($bytes);
        if ($src === false) {
            throw new RuntimeException('El candidato no es una imagen válida.');
        }

        [$w, $h] = [imagesx($src), imagesy($src)];

        if ($w !== $targetW || $h !== $targetH) {
            $dst = imagecreatetruecolor($targetW, $targetH);
            imagealphablending($dst, false);
            imagesavealpha($dst, true);
            imagefill($dst, 0, 0, imagecolorallocatealpha($dst, 0, 0, 0, 127));

            // Cover: escala llenando el target y recorta centrado.
            $scale = max($targetW / $w, $targetH / $h);
            $cropW = (int) round($targetW / $scale);
            $cropH = (int) round($targetH / $scale);
            $cropX = (int) (($w - $cropW) / 2);
            $cropY = (int) (($h - $cropH) / 2);

            imagecopyresampled($dst, $src, 0, 0, $cropX, $cropY, $targetW, $targetH, $cropW, $cropH);
            $src = $dst;
        } else {
            imagesavealpha($src, true);
        }

        $destination = public_path($request->destinationPath());
        File::ensureDirectoryExists(dirname($destination));
        imagepng($src, $destination);

        return $request->destinationPath();
    }
}
```

```php
<?php
// app/Http/Controllers/Estudio/AssetCandidateController.php

namespace App\Http\Controllers\Estudio;

use App\Actions\Estudio\PublishAssetAction;
use App\Http\Controllers\Controller;
use App\Models\AssetCandidate;
use Illuminate\Http\RedirectResponse;

class AssetCandidateController extends Controller
{
    public function approve(AssetCandidate $assetCandidate, PublishAssetAction $publisher): RedirectResponse
    {
        $publisher->publish($assetCandidate);

        $assetCandidate->update(['status' => 'approved']);
        $assetCandidate->request->candidates()
            ->whereKeyNot($assetCandidate->id)
            ->where('status', 'candidate')
            ->update(['status' => 'rejected']);
        $assetCandidate->request->update(['status' => 'approved']);

        return redirect()->route('estudio.requests.show', $assetCandidate->request);
    }

    public function reject(AssetCandidate $assetCandidate): RedirectResponse
    {
        $assetCandidate->update(['status' => 'rejected']);

        return redirect()->route('estudio.requests.show', $assetCandidate->request);
    }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `php artisan test tests/Feature/Estudio/PublishAssetTest.php`
Expected: PASS (2 tests).

- [ ] **Step 5: Regenerate Wayfinder and commit**

```bash
php artisan wayfinder:generate
git add app/Actions/Estudio/ app/Http/Controllers/Estudio/AssetCandidateController.php routes/web.php resources/js/routes resources/js/actions tests/Feature/Estudio/PublishAssetTest.php
git commit -m "feat(estudio): aprobar candidatos y publicar normalizado a public/"
```

---

### Task 9: Frontend — matriz (`estudio/index.tsx`)

**Files:**
- Create: `resources/js/pages/estudio/index.tsx`
- Modify: `resources/js/app.tsx` (agregar caso `name.startsWith('estudio/')` → `return null;` junto a los casos de `auth/login`/`landing`)
- Test: build + los asserts de componente de Task 6 ya cubren props.

**Interfaces:**
- Consumes: props de `EstudioController@index` (Task 6): `figures: {slug, name, slots}[]`; ruta Wayfinder `store` de `@/actions/App/Http/Controllers/Estudio/AssetRequestController` y `show` de requests.
- Produces: página `estudio/index` (sin layout de app — herramienta interna standalone).

- [ ] **Step 1: Write the page**

```tsx
// resources/js/pages/estudio/index.tsx
import { Head, router } from '@inertiajs/react';
import { store } from '@/actions/App/Http/Controllers/Estudio/AssetRequestController';
import { show } from '@/routes/estudio/requests';

type Slot = { status: string; request_id: number | null; pending_candidates: number };
type Figure = { slug: string; name: string; slots: Record<string, Slot> };

const SLOT_KEYS = ['sprite.neutral', 'sprite.happy', 'sprite.thinking', 'sprite.surprised', 'avatar', 'background'] as const;
const SLOT_LABELS: Record<string, string> = {
    'sprite.neutral': 'Neutral', 'sprite.happy': 'Happy', 'sprite.thinking': 'Thinking',
    'sprite.surprised': 'Surprised', avatar: 'Busto', background: 'Fondo',
};

const CHIP: Record<string, { label: string; cls: string }> = {
    approved: { label: '✓', cls: 'bg-green-300 text-green-950' },
    review: { label: '● revisar', cls: 'bg-yellow-300 text-yellow-950' },
    draft: { label: '✎ borrador', cls: 'bg-purple-300 text-purple-950' },
    generating: { label: '⟳', cls: 'bg-blue-300 text-blue-950 animate-pulse' },
    failed: { label: '✗ error', cls: 'bg-red-300 text-red-950' },
    blocked: { label: '🔒', cls: 'bg-neutral-200 text-neutral-400' },
    empty: { label: '◌', cls: 'bg-neutral-100 text-neutral-500' },
};

function slotPayload(slug: string, key: string) {
    const [type, emote] = key.startsWith('sprite.') ? ['sprite', key.split('.')[1]] : [key, null];
    return { character_slug: slug, type, emote };
}

export default function EstudioIndex({ figures }: { figures: Figure[] }) {
    const pendingReview = figures.reduce(
        (n, f) => n + Object.values(f.slots).filter((s) => s.status === 'review').length, 0);

    const onCell = (figure: Figure, key: string) => {
        const slot = figure.slots[key];
        if (slot.status === 'blocked') return;
        if (slot.request_id) {
            router.visit(show({ assetRequest: slot.request_id }).url);
        } else {
            router.post(store().url, slotPayload(figure.slug, key));
        }
    };

    return (
        <div className="min-h-svh bg-neutral-900 p-8 font-mono text-neutral-100">
            <Head title="Estudio de Assets" />
            <header className="mb-6 flex items-baseline justify-between">
                <h1 className="text-xl font-bold">🎨 Estudio de Assets</h1>
                <span className="text-sm text-yellow-300">{pendingReview} por revisar</span>
            </header>

            <table className="w-full border-collapse text-sm">
                <thead>
                    <tr>
                        <th className="border border-neutral-700 p-2 text-left">Figura</th>
                        {SLOT_KEYS.map((key) => (
                            <th key={key} className="border border-neutral-700 p-2">{SLOT_LABELS[key]}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {figures.map((figure) => (
                        <tr key={figure.slug}>
                            <td className="border border-neutral-700 p-2 font-bold">{figure.name}</td>
                            {SLOT_KEYS.map((key) => {
                                const slot = figure.slots[key];
                                const chip = CHIP[slot.status] ?? CHIP.empty;
                                return (
                                    <td key={key} className="border border-neutral-700 p-1 text-center">
                                        <button
                                            type="button"
                                            onClick={() => onCell(figure, key)}
                                            disabled={slot.status === 'blocked'}
                                            className={`w-full px-2 py-1 text-xs ${chip.cls} ${slot.status !== 'blocked' ? 'cursor-pointer hover:opacity-80' : 'cursor-not-allowed'}`}
                                        >
                                            {chip.label}
                                            {slot.status === 'review' && ` (${slot.pending_candidates})`}
                                        </button>
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
            <p className="mt-4 text-xs text-neutral-500">
                Celda vacía = dispara generación · 🔒 = aprueba primero el sprite neutral · herramienta local, los PNG publicados se commitean a git.
            </p>
        </div>
    );
}
```

Nota para el implementador: verifica las rutas de import de Wayfinder con lo que realmente generó `php artisan wayfinder:generate` (mira `resources/js/actions/App/Http/Controllers/Estudio/` y `resources/js/routes/estudio/`). Si el nombre difiere, ajusta el import — no inventes el path.

- [ ] **Step 2: Add the layout case in `app.tsx`**

En el `switch` de layout, junto a `case name === 'landing':`, agregar `case name.startsWith('estudio/'):` (devuelven `null` — página standalone).

- [ ] **Step 3: Build and run backend tests**

Run: `npm run build && php artisan test tests/Feature/Estudio/`
Expected: build OK, tests verdes (los asserts de `component('estudio/index')` de Task 6 ahora resuelven contra una página real).

- [ ] **Step 4: Commit**

```bash
git add resources/js/pages/estudio/index.tsx resources/js/app.tsx
git commit -m "feat(estudio): pagina de matriz de produccion"
```

---

### Task 10: Frontend — galería de candidatos (`estudio/request.tsx`)

**Files:**
- Create: `resources/js/pages/estudio/request.tsx`
- Test: build + asserts de Task 7.

**Interfaces:**
- Consumes: props de `AssetRequestController@show` (Task 7): `request` y `candidates`; rutas Wayfinder `approve`/`reject` de `AssetCandidateController` y `regenerate` de `AssetRequestController`; ruta `estudio.index`.
- Produces: página `estudio/request`.

- [ ] **Step 1: Write the page**

```tsx
// resources/js/pages/estudio/request.tsx
import { Head, Link, router, useForm } from '@inertiajs/react';
import { approve, reject } from '@/actions/App/Http/Controllers/Estudio/AssetCandidateController';
import { regenerate } from '@/actions/App/Http/Controllers/Estudio/AssetRequestController';
import { index } from '@/routes/estudio';

type Candidate = { id: number; url: string; status: string };
type AssetReq = {
    id: number; character_slug: string; character_name: string; type: string;
    emote: string | null; prompt: string; status: string; error: string | null;
    destination_url: string;
};

// Fondo ajedrez para ver transparencias (spec §4.3).
const CHECKER: React.CSSProperties = {
    backgroundImage:
        'linear-gradient(45deg,#333 25%,transparent 25%),linear-gradient(-45deg,#333 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#333 75%),linear-gradient(-45deg,transparent 75%,#333 75%)',
    backgroundSize: '16px 16px',
    backgroundPosition: '0 0,0 8px,8px -8px,-8px 0',
    backgroundColor: '#222',
};

export default function EstudioRequest({ request, candidates }: { request: AssetReq; candidates: Candidate[] }) {
    const form = useForm({ prompt: request.prompt });
    const title = `${request.character_name} · ${request.type}${request.emote ? `:${request.emote}` : ''}`;

    return (
        <div className="min-h-svh bg-neutral-900 p-8 font-mono text-neutral-100">
            <Head title={title} />
            <header className="mb-6">
                <Link href={index().url} className="text-xs text-neutral-400 hover:text-white">← matriz</Link>
                <h1 className="mt-1 text-xl font-bold">{title}</h1>
                <p className="text-xs text-neutral-500">estado: {request.status} · destino: {request.destination_url}</p>
                {request.error && <p className="mt-2 bg-red-950 p-2 text-xs text-red-300">{request.error}</p>}
            </header>

            {request.status === 'generating' && (
                <p className="mb-6 animate-pulse text-blue-300">⟳ Generando candidatos… recarga en unos segundos.</p>
            )}

            <div className="mb-8 grid grid-cols-3 gap-4">
                {candidates.map((candidate) => (
                    <figure key={candidate.id} className={`border-2 p-2 ${candidate.status === 'approved' ? 'border-green-400' : candidate.status === 'rejected' ? 'border-neutral-800 opacity-40' : 'border-neutral-600'}`}>
                        <div style={CHECKER} className="flex items-center justify-center">
                            <img src={candidate.url} alt="" className="max-h-96 w-full object-contain" style={{ imageRendering: 'pixelated' }} />
                        </div>
                        {candidate.status === 'candidate' && (
                            <figcaption className="mt-2 flex gap-2">
                                <button type="button" onClick={() => router.post(approve({ assetCandidate: candidate.id }).url)} className="flex-1 bg-green-400 px-2 py-1 text-xs font-bold text-green-950 hover:opacity-80">✓ Aprobar y publicar</button>
                                <button type="button" onClick={() => router.post(reject({ assetCandidate: candidate.id }).url)} className="bg-neutral-700 px-2 py-1 text-xs hover:opacity-80">✗</button>
                            </figcaption>
                        )}
                    </figure>
                ))}
            </div>

            <form
                onSubmit={(e) => { e.preventDefault(); form.post(regenerate({ assetRequest: request.id }).url); }}
                className="max-w-2xl"
            >
                <label className="mb-1 block text-xs uppercase text-neutral-400">Prompt (editable antes de regenerar)</label>
                <textarea
                    value={form.data.prompt}
                    onChange={(e) => form.setData('prompt', e.target.value)}
                    rows={5}
                    className="w-full border border-neutral-600 bg-neutral-800 p-2 text-sm"
                />
                <button type="submit" disabled={form.processing || request.status === 'generating'} className="mt-2 bg-blue-400 px-4 py-2 text-sm font-bold text-blue-950 hover:opacity-80 disabled:opacity-50">
                    ⟳ {request.status === 'pending' ? 'Generar batch' : 'Regenerar batch'}
                </button>
            </form>
        </div>
    );
}
```

Misma nota de Task 9: confirmar los paths de import de Wayfinder contra lo generado. Al aprobar sobre un asset ya publicado, la publicación reemplaza el PNG (spec §4.4) — la UI de la matriz ya mostró `approved`, y volver a entrar al request permite re-aprobar otro candidato: esa es la confirmación implícita de reemplazo en v1.

- [ ] **Step 2: Build and run the whole suite**

Run: `npm run build && php artisan test --parallel`
Expected: build OK, suite completa verde.

- [ ] **Step 3: Commit**

```bash
git add resources/js/pages/estudio/request.tsx
git commit -m "feat(estudio): galeria de candidatos con aprobacion y regeneracion"
```

---

### Task 11: Smoke E2E + documentación

**Files:**
- Create: `tests/Feature/Estudio/EstudioEndToEndTest.php`
- Modify: `CLAUDE.md` (sección nueva breve)
- Modify: `docs/saas/02-roster.md` (última línea: apuntar al spec ya existente)

**Interfaces:**
- Consumes: todo lo anterior.
- Produces: prueba de flujo completo y documentación del sistema.

- [ ] **Step 1: Write the end-to-end test**

```php
<?php
// tests/Feature/Estudio/EstudioEndToEndTest.php

use App\Jobs\GenerateAssetCandidatesJob;
use App\Models\AssetRequest;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

use function Pest\Laravel\post;

beforeEach(function () {
    $this->withoutVite();
    Storage::fake('public');
    config(['services.fal.key' => 'test-key', 'estudio.figures.test-e2e' => [
        'name' => 'Figura E2E', 'visual' => 'test figure', 'scene' => 'test scene',
    ]]);
});

afterEach(fn () => File::deleteDirectory(public_path('sprites/test-e2e')));

it('runs the full flow: request → job → review → approve → published png', function () {
    // PNG real de 100×150 como respuesta de fal
    $img = imagecreatetruecolor(100, 150);
    imagesavealpha($img, true);
    ob_start();
    imagepng($img);
    $png = ob_get_clean();

    Http::fake([
        'fal.run/*' => Http::response(['images' => [['url' => 'https://fal.media/a.png']]]),
        'fal.media/*' => Http::response($png),
    ]);

    // 1. Crear request (nace borrador, sin dispatch)
    post(route('estudio.requests.store'), [
        'character_slug' => 'test-e2e', 'type' => 'sprite', 'emote' => 'neutral',
    ]);

    $request = AssetRequest::sole();
    expect($request->status)->toBe('pending');

    // 2. Disparar el batch con el prompt (queue síncrona en tests → el job corre inline)
    post(route('estudio.requests.regenerate', $request), ['prompt' => $request->prompt]);

    expect($request->fresh()->status)->toBe('ready_for_review')
        ->and($request->fresh()->candidates)->toHaveCount(1);

    // 3. Aprobar el candidato
    post(route('estudio.candidates.approve', $request->fresh()->candidates->first()));

    // 4. PNG publicado y normalizado
    $published = public_path('sprites/test-e2e/neutral.png');
    expect(file_exists($published))->toBeTrue();
    [$w, $h] = getimagesize($published);
    expect([$w, $h])->toBe([1024, 1536])
        ->and($request->fresh()->status)->toBe('approved');
});
```

Nota: sin `Queue::fake()`, la conexión de queue en tests es `sync` (default de Laravel testing), así que `dispatch()` ejecuta el job inline — eso es lo que este smoke quiere.

- [ ] **Step 2: Run the test and the full suite**

Run: `php artisan test tests/Feature/Estudio/EstudioEndToEndTest.php && php artisan test --parallel`
Expected: PASS todo.

- [ ] **Step 3: Document in CLAUDE.md**

Agregar sección después de "## Componentes de carta compartidos":

```markdown
## Estudio de Assets (`/estudio`, solo local)
Herramienta interna para generar/revisar/publicar los assets del roster (spec: `docs/superpowers/specs/2026-08-17-escena-y-estudio-assets-design.md`).
- Rutas siempre registradas tras `EnsureLocalEnvironment` (404 fuera de local) — no condicionar rutas por env, rompe Wayfinder.
- Pipeline: `AssetRequest` → `GenerateAssetCandidatesJob` (gpt-image-2 en fal; emotes/busto = edit del neutral aprobado) → galería → `PublishAssetAction` normaliza con GD y escribe a `public/` (los PNG publicados se commitean).
- Config editorial (figuras, prompts, dimensiones): `config/estudio.php`. Specs: sprites 1024×1536 transparentes, busto 1024×1024, fondo 1024×1536.
```

En `docs/saas/02-roster.md`, reemplazar la última línea (`> La generación y gestión de assets se moverá...`) por:

```markdown
> Los assets se producen con el Estudio (`/estudio`, solo local) — spec: `docs/superpowers/specs/2026-08-17-escena-y-estudio-assets-design.md`.
```

- [ ] **Step 4: Commit**

```bash
git add tests/Feature/Estudio/EstudioEndToEndTest.php CLAUDE.md docs/saas/02-roster.md
git commit -m "test(estudio): smoke e2e del flujo completo + docs"
```

---

## Después del plan (manual, fuera de scope de código)

1. **Piloto Sor Juana**: con `queue:work` corriendo, generar sus 6 assets reales en `/estudio`, validar transparencia nativa de gpt-image-2 (si falla → `ESTUDIO_TRANSPARENCY=rembg` en `.env`) y ver el resultado en la escena real.
2. Ajustar templates de `config/estudio.php` con lo aprendido; producir el resto por olas.
3. Plan aparte (chico): ambient genérico compartido + migrar configs de dioramas de Dalí/Freud/Beauvoir a sprites de cuerpo completo cuando existan.
