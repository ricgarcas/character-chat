# Taller + Portafolio — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Artifacts como entidad de primera clase + bloque de co-creación en los agents + página `/portafolio`, según el spec `docs/superpowers/specs/2026-07-10-taller-portafolio-design.md`.

**Architecture:** Los tools siguen devolviendo JSON al stream sin cambios. Después de cada turno, `ArtifactService::persistFromConversation()` lee los `tool_results` del último mensaje assistant y crea filas en `artifacts`. `GenerateImageJob` resuelve los `image_pending` por `job_id`. El portafolio es una página Inertia que reusa las tarjetas React existentes.

**Tech Stack:** Laravel 13, Pest, Inertia v3 + React 19, Tailwind v4, Wayfinder, laravel/ai SDK.

## Global Constraints

- Todo el copy de UI en español, vía `useT()` + `lang/es.json` (claves planas tipo `'nav.chat'`).
- Los agents solo se modifican en bloques compartidos de `CharacterAgent` + una línea de interpolación por agent; `guardrailBlock`, `languageDirective` y `stageDirectionBlock` existentes NO se reescriben.
- Estilo pixel-art existente: bordes `border-2 border-[var(--ink)]`, sombras `boxShadow: 3px 3px 0 0 <accent>`, fuentes `font-display`/`font-body`.
- Tests Feature usan `RefreshDatabase` (ya global en `tests/Pest.php`).
- Commits frecuentes, mensajes en el estilo del repo (imperativo, español o inglés corto).

## Desviaciones del spec (decididas al planear, con razón)

1. **Punto de persistencia**: el spec decía "los tools llaman `ArtifactService::persist()` en `handle()`". Al planear se encontró que `conversation_id` NO existe durante la ejecución del tool en conversaciones nuevas (el SDK lo crea post-stream, ver `ChatController::send` → `$agent->currentConversation()`). La persistencia se mueve al cierre del stream en `ChatController`, donde user + character + conversation son todos conocidos. Cumple mejor el requisito real del spec ("un solo punto de integración") y no toca los 9 tools.
2. **Sin columna `image_path`**: las tarjetas existentes leen `data.image_url` (URL remota de fal). `GenerateImageJob` resuelve el artifact actualizando `type` y `data`. Una columna paralela sería peso muerto.
3. **Test de completitud type→componente**: se cubre con el type-check de `npm run build` — el union `Artifact` en `resources/js/types/chat.ts` ya obliga a que todo tipo tenga rama de render. No se inventa un test PHP para un mapa de React.

## Fuera de este plan

- **Agents nuevos (Sor Juana, Einstein, Da Vinci)**: es trabajo de contenido + assets (pixel art manual vía skills `pixel-avatar-prompts`/`pixel-backgrounds`) — plan aparte cuando este loop esté verde.
- Talleres guiados (camino B), compartibles, billing.

## File Structure

```
database/migrations/2026_07_10_000001_create_artifacts_table.php   (nueva)
app/Models/Artifact.php                                            (nuevo)
database/factories/ArtifactFactory.php                             (nueva)
app/Services/ArtifactService.php                                   (nuevo — persistencia + resolución de imágenes)
app/Jobs/GenerateImageJob.php                                      (modificar — llamar resolveImage en éxito)
app/Http/Controllers/ChatController.php                            (modificar — hook post-stream)
app/Agents/CharacterAgent.php                                      (modificar — coCreationBlock + protocolo de angustia)
app/Agents/{Frida,Dali,Freud,Beauvoir}Agent.php                    (modificar — 1 línea de interpolación c/u)
app/Http/Controllers/PortfolioController.php                       (nuevo)
routes/web.php                                                     (modificar — ruta portafolio)
resources/js/lib/accents.ts                                        (nuevo — mapa slug→accent extraído de show.tsx)
resources/js/components/artifacts/InfoArtifactRenderer.tsx         (nuevo — extraído de ToolBadge.tsx)
resources/js/components/artifacts/ToolBadge.tsx                    (modificar — usa el renderer extraído)
resources/js/pages/portfolio/index.tsx                             (nueva)
resources/js/components/app-header.tsx                             (modificar — link nav)
resources/js/pages/chat/show.tsx                                   (modificar — import accents + caption portafolio)
lang/es.json                                                       (modificar — claves nuevas)
tests/Feature/ArtifactServiceTest.php                              (nuevo)
tests/Feature/CharacterPromptsTest.php                             (nuevo)
tests/Feature/PortfolioTest.php                                    (nuevo)
docs/saas/*.md                                                     (modificar — impacto del pivote)
```

---

### Task 1: Migración + modelo `Artifact` + factory

**Files:**
- Create: `database/migrations/2026_07_10_000001_create_artifacts_table.php`
- Create: `app/Models/Artifact.php`
- Create: `database/factories/ArtifactFactory.php`
- Test: `tests/Feature/ArtifactServiceTest.php` (primer test del archivo)

**Interfaces:**
- Produces: modelo `App\Models\Artifact` con `casts: data → array`, relaciones `user()`, `character()`, y `HasFactory`. Columnas: `user_id`, `character_id`, `conversation_id` (string 36 nullable), `type`, `title` (nullable), `data` (json), `status` (default `'final'`), `parent_id` (nullable), `taller_key` (nullable).

- [ ] **Step 1: Write the failing test**

```php
<?php
// tests/Feature/ArtifactServiceTest.php

use App\Models\Artifact;
use App\Models\Character;
use App\Models\User;
use Database\Seeders\CharacterSeeder;

beforeEach(function () {
    $this->seed(CharacterSeeder::class);
});

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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `php artisan test --filter="persists an artifact"`
Expected: FAIL — `Class "App\Models\Artifact" not found`

- [ ] **Step 3: Write migration, model and factory**

```php
<?php
// database/migrations/2026_07_10_000001_create_artifacts_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('artifacts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('character_id')->constrained()->cascadeOnDelete();
            $table->string('conversation_id', 36)->nullable()->index();
            $table->string('type')->index();
            $table->string('title')->nullable();
            $table->json('data');
            $table->string('status', 10)->default('final'); // draft|final — draft reservado para iteración v2
            $table->foreignId('parent_id')->nullable()->constrained('artifacts')->nullOnDelete(); // cadena de iteraciones v2
            $table->string('taller_key')->nullable(); // camino B (talleres guiados)
            $table->timestamps();

            $table->index(['user_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('artifacts');
    }
};
```

```php
<?php
// app/Models/Artifact.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Artifact extends Model
{
    /** @use HasFactory<\Database\Factories\ArtifactFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id', 'character_id', 'conversation_id', 'type',
        'title', 'data', 'status', 'parent_id', 'taller_key',
    ];

    protected function casts(): array
    {
        return [
            'data' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function character(): BelongsTo
    {
        return $this->belongsTo(Character::class);
    }
}
```

```php
<?php
// database/factories/ArtifactFactory.php

namespace Database\Factories;

use App\Models\Character;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\Artifact>
 */
class ArtifactFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'character_id' => Character::query()->inRandomOrder()->value('id') ?? 1,
            'conversation_id' => $this->faker->uuid(),
            'type' => 'receta',
            'title' => $this->faker->sentence(3),
            'data' => ['title' => $this->faker->sentence(3)],
            'status' => 'final',
        ];
    }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `php artisan test --filter="persists an artifact"`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add database/migrations/2026_07_10_000001_create_artifacts_table.php app/Models/Artifact.php database/factories/ArtifactFactory.php tests/Feature/ArtifactServiceTest.php
git commit -m "feat: artifacts como entidad de primera clase (migración + modelo + factory)"
```

---

### Task 2: `ArtifactService::persistFromConversation()`

**Files:**
- Create: `app/Services/ArtifactService.php`
- Test: `tests/Feature/ArtifactServiceTest.php` (agregar tests)

**Interfaces:**
- Consumes: modelo `Artifact` (Task 1).
- Produces: `ArtifactService::persistFromConversation(string $conversationId, int $userId, \App\Models\Character $character): int` — lee el último mensaje `assistant` de la conversación, decodifica `tool_results` (mismo formato que `ChatController::loadMessages`, líneas 87-101), crea una fila por payload con `artifact_type` + `data`, y devuelve cuántas creó. Salta `artifact_type === 'error'` y duplicados exactos (misma conversación + mismo JSON de data).

**Helper de test** (agregar arriba del archivo de test, después del `beforeEach`):

```php
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

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
```

- [ ] **Step 1: Write the failing tests**

```php
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `php artisan test --filter=ArtifactServiceTest`
Expected: FAIL — `Class "App\Services\ArtifactService" not found` (el test de Task 1 sigue en verde)

- [ ] **Step 3: Write the service**

```php
<?php
// app/Services/ArtifactService.php

namespace App\Services;

use App\Models\Artifact;
use App\Models\Character;
use Illuminate\Support\Facades\DB;

class ArtifactService
{
    /**
     * Persiste como Artifact cada payload de tool_results del último
     * mensaje assistant de la conversación. Devuelve cuántos creó.
     */
    public function persistFromConversation(string $conversationId, int $userId, Character $character): int
    {
        $message = DB::table('agent_conversation_messages')
            ->where('conversation_id', $conversationId)
            ->where('role', 'assistant')
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->first(['tool_results']);

        if (! $message) {
            return 0;
        }

        $toolResults = json_decode($message->tool_results ?? '[]', true) ?: [];
        $created = 0;

        foreach ($toolResults as $result) {
            if (! is_array($result) || ! isset($result['result'])) {
                continue;
            }

            $decoded = json_decode((string) $result['result'], true);

            if (! is_array($decoded) || ! isset($decoded['artifact_type'], $decoded['data'])) {
                continue;
            }

            if ($decoded['artifact_type'] === 'error') {
                continue;
            }

            $data = $decoded['data'];

            $alreadyExists = Artifact::query()
                ->where('conversation_id', $conversationId)
                ->where('type', $decoded['artifact_type'])
                ->whereRaw('json_extract(data, "$") = ?', [json_encode($data)])
                ->exists();

            if ($alreadyExists) {
                continue;
            }

            Artifact::create([
                'user_id' => $userId,
                'character_id' => $character->id,
                'conversation_id' => $conversationId,
                'type' => $decoded['artifact_type'],
                'title' => is_string($data['title'] ?? null) ? $data['title'] : null,
                'data' => $data,
            ]);

            $created++;
        }

        return $created;
    }
}
```

Nota: `json_extract` existe en SQLite y MySQL — la comparación de duplicados funciona en ambos.

- [ ] **Step 4: Run tests to verify they pass**

Run: `php artisan test --filter=ArtifactServiceTest`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add app/Services/ArtifactService.php tests/Feature/ArtifactServiceTest.php
git commit -m "feat: ArtifactService persiste artefactos desde tool_results"
```

---

### Task 3: `ArtifactService::resolveImage()` + integración en `GenerateImageJob`

**Files:**
- Modify: `app/Services/ArtifactService.php`
- Modify: `app/Jobs/GenerateImageJob.php:50-64` (rama de éxito del `handle`)
- Test: `tests/Feature/ArtifactServiceTest.php` (agregar test)

**Interfaces:**
- Produces: `ArtifactService::resolveImage(string $jobId, string $kind, string $title, string $imageUrl): void` — busca artifacts `type = 'image_pending'` cuyo `data->job_id` sea `$jobId` y los actualiza a `type = $kind`, `title = $title`, `data = ['title' => ..., 'image_url' => ...]`.

- [ ] **Step 1: Write the failing test**

```php
it('resolves a pending image artifact by job id', function () {
    $user = User::factory()->create();
    $frida = Character::where('slug', 'frida')->firstOrFail();

    $pending = Artifact::factory()->create([
        'user_id' => $user->id,
        'character_id' => $frida->id,
        'type' => 'image_pending',
        'title' => 'Raíz y vuelo',
        'data' => ['job_id' => 'job-123', 'kind' => 'portrait', 'title' => 'Raíz y vuelo'],
    ]);

    app(\App\Services\ArtifactService::class)
        ->resolveImage('job-123', 'portrait', 'Raíz y vuelo', 'https://fal.example/img.jpg');

    $resolved = $pending->fresh();
    expect($resolved->type)->toBe('portrait')
        ->and($resolved->data['image_url'])->toBe('https://fal.example/img.jpg');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `php artisan test --filter="resolves a pending image"`
Expected: FAIL — `Call to undefined method ... resolveImage()`

- [ ] **Step 3: Implement resolveImage and wire the job**

Agregar al final de `ArtifactService`:

```php
    /**
     * Convierte un artifact image_pending en su tipo final cuando la imagen terminó.
     */
    public function resolveImage(string $jobId, string $kind, string $title, string $imageUrl): void
    {
        Artifact::query()
            ->where('type', 'image_pending')
            ->where('data->job_id', $jobId)
            ->get()
            ->each(fn (Artifact $artifact) => $artifact->update([
                'type' => $kind,
                'title' => $title,
                'data' => ['title' => $title, 'image_url' => $imageUrl],
            ]));
    }
```

En `GenerateImageJob::handle`, dentro del `try`, justo después del `$this->persistArtifact([...])` de éxito (línea ~56) y antes del `event(new ImageReady(...))`:

```php
            app(\App\Services\ArtifactService::class)->resolveImage(
                jobId: $this->jobId,
                kind: $this->kind,
                title: $this->title,
                imageUrl: $result['url'],
            );
```

(La rama de fallo no se toca: el artifact queda `image_pending` y el portafolio lo excluye.)

- [ ] **Step 4: Run tests to verify they pass**

Run: `php artisan test --filter=ArtifactServiceTest`
Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add app/Services/ArtifactService.php app/Jobs/GenerateImageJob.php tests/Feature/ArtifactServiceTest.php
git commit -m "feat: GenerateImageJob resuelve artifacts image_pending por job_id"
```

---

### Task 4: Hook post-stream en `ChatController::send`

**Files:**
- Modify: `app/Http/Controllers/ChatController.php:162-189` (closure del stream)
- Test: `tests/Feature/ArtifactServiceTest.php` (agregar test)

**Interfaces:**
- Consumes: `ArtifactService::persistFromConversation()` (Task 2).

- [ ] **Step 1: Write the failing test**

Usa el fake del SDK (`Promptable::fake(array $responses)`, disponible como `FridaAgent::fake([...])`). Sin tool calls, el hook debe correr sin crear nada ni romper el stream:

```php
use App\Agents\FridaAgent;

it('runs the artifact hook after streaming without breaking the response', function () {
    FridaAgent::fake(['¡Hola, escuincle!']);

    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('chat.send', 'frida'), [
        'message' => 'Hola Frida',
    ]);

    $response->assertSuccessful();
    $response->streamedContent(); // consume el stream — ejecuta el closure y el hook

    expect(Artifact::count())->toBe(0); // sin tools no hay artefactos, y nada explotó
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `php artisan test --filter="artifact hook after streaming"`
Expected: PASS o FAIL según el estado — si PASA antes de implementar es porque aún no hay hook que pueda fallar; el valor del test es de regresión. Ejecútalo, anota el resultado, y continúa. (Si `FridaAgent::fake` requiere otra forma de respuesta, revisa `vendor/laravel/ai/src/Promptable.php:fake` y la clase `FakeTextGateway`.)

- [ ] **Step 3: Wire the hook**

En `ChatController::send`, el closure del stream (línea 162) captura también `$request`:

```php
        return response()->stream(function () use ($agentResponse, $agent, $isNewConversation, $character, $request) {
```

Y dentro del `if ($convId)` existente (línea 176), después del `update` de `character_slug` y antes del `echo` del `conversation_id`:

```php
                app(\App\Services\ArtifactService::class)->persistFromConversation(
                    conversationId: $convId,
                    userId: $request->user()->id,
                    character: $character,
                );
```

- [ ] **Step 4: Run the full suite**

Run: `php artisan test`
Expected: PASS — todos los tests existentes (incluido `FridaToolsTest`) siguen verdes.

- [ ] **Step 5: Commit**

```bash
git add app/Http/Controllers/ChatController.php tests/Feature/ArtifactServiceTest.php
git commit -m "feat: persistir artefactos al cierre de cada turno de chat"
```

---

### Task 5: `coCreationBlock()` + protocolo de angustia

**Files:**
- Modify: `app/Agents/CharacterAgent.php` (nuevo método + adición al final de `guardrailBlock`)
- Modify: `app/Agents/FridaAgent.php:63-65`, `app/Agents/DaliAgent.php`, `app/Agents/FreudAgent.php`, `app/Agents/BeauvoirAgent.php` (línea de interpolación en cada `instructions()`)
- Test: `tests/Feature/CharacterPromptsTest.php`

**Interfaces:**
- Produces: `CharacterAgent::coCreationBlock(): string` (protected), interpolado en los 4 agents junto a los bloques existentes.

- [ ] **Step 1: Write the failing test**

```php
<?php
// tests/Feature/CharacterPromptsTest.php

use App\Models\Character;
use Database\Seeders\CharacterSeeder;

beforeEach(function () {
    $this->seed(CharacterSeeder::class);
});

it('includes the co-creation block in every character prompt', function (string $slug) {
    $character = Character::where('slug', $slug)->firstOrFail();
    $instructions = (string) $character->agent()->instructions();

    expect($instructions)
        ->toContain('Taller de co-creación')
        ->toContain('borrador')
        ->toContain('tareas escolares');
})->with(['frida', 'dali', 'freud', 'beauvoir']);

it('includes the distress protocol in every character prompt', function (string $slug) {
    $character = Character::where('slug', $slug)->firstOrFail();
    $instructions = (string) $character->agent()->instructions();

    expect($instructions)->toContain('adulto de confianza');
})->with(['frida', 'dali', 'freud', 'beauvoir']);
```

- [ ] **Step 2: Run test to verify it fails**

Run: `php artisan test --filter=CharacterPromptsTest`
Expected: FAIL — los prompts no contienen 'Taller de co-creación'

- [ ] **Step 3: Implement the blocks**

Agregar a `CharacterAgent` (después de `guardrailBlock`, línea ~112):

```php
    /**
     * Co-creation directives: the character is a workshop master, not a vending machine.
     */
    protected function coCreationBlock(): string
    {
        return <<<'BLOCK'

## Taller de co-creación
Cuando el usuario quiera crear algo contigo (un poema, una receta, un retrato, una interpretación, una idea), trabajas como maestro de taller, no como máquina expendedora:

1. **Nunca entregues la obra terminada a la primera.** Antes de crear, haz 1 o 2 preguntas que afilen la idea: ¿para quién es? ¿qué debe sentir quien lo vea o lo lea? Pregunta como tú lo harías, con tu temperamento.
2. **Todo primer resultado es un borrador.** Al entregarlo, señala UNA cosa que tú cambiarías y pregunta qué cambiaría el usuario. Invita a iterar antes de darlo por terminado.
3. **El usuario decide.** Ofrece opciones concretas ("¿más oscuro o más luminoso?") en vez de decidir por él. Cuando pida algo específico y preciso, celébralo — la precisión es señal de buen ojo.
4. **No haces tareas escolares, haces obras.** Si detectas que te piden resolver un deber de escuela (ensayo, resumen, cuestionario, tarea), niégate con gracia y en personaje, y transfórmalo en co-creación: tú no trabajas por encargo ajeno, pero juntos pueden crear algo propio y mejor que lo que les pidieron.
BLOCK;
    }
```

Y al final del heredoc de `guardrailBlock()` (antes del `BLOCK;` de cierre, después de la línea del ejemplo de Python):

```
**Protocolo de angustia (prioridad máxima):**
Si el usuario expresa autolesión, abuso o angustia real, suaviza el juego teatral: responde con calidez humana sin salir de tu voz, sugiérele hablar con un adulto de confianza, y no hagas de terapeuta ni indagues en el tema. Una respuesta breve, cálida y humana vale más que cualquier personaje.
```

En cada uno de los 4 agents, agregar la interpolación junto a las existentes. En `FridaAgent.php` (líneas 63-65) queda:

```php
{$this->guardrailBlock()}
{$this->coCreationBlock()}
{$this->stageDirectionBlock()}
{$this->languageDirective()}
```

(Mismo patrón en `DaliAgent`, `FreudAgent`, `BeauvoirAgent` — localizar el grupo de interpolaciones al final de cada `instructions()` y añadir la línea en la misma posición.)

- [ ] **Step 4: Run tests to verify they pass**

Run: `php artisan test --filter=CharacterPromptsTest`
Expected: PASS (8 tests con datasets)

- [ ] **Step 5: Commit**

```bash
git add app/Agents/ tests/Feature/CharacterPromptsTest.php
git commit -m "feat: bloque de co-creación + protocolo de angustia en todos los agents"
```

---

### Task 6: Ruta + `PortfolioController`

**Files:**
- Create: `app/Http/Controllers/PortfolioController.php`
- Modify: `routes/web.php:11-17` (grupo auth)
- Test: `tests/Feature/PortfolioTest.php`

**Interfaces:**
- Produces: ruta GET `portafolio` → name `portfolio.index` → Inertia page `portfolio/index` con prop `artifacts`: array de `{id, type, title, data, created_at, character: {slug, name}}`, orden descendente por fecha, excluyendo `image_pending` y `error`, solo del usuario autenticado.

- [ ] **Step 1: Write the failing tests**

```php
<?php
// tests/Feature/PortfolioTest.php

use App\Models\Artifact;
use App\Models\Character;
use App\Models\User;
use Database\Seeders\CharacterSeeder;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\get;

beforeEach(function () {
    $this->seed(CharacterSeeder::class);
});

it('requires authentication', function () {
    get(route('portfolio.index'))->assertRedirect(route('login'));
});

it('shows only the authenticated user\'s finished artifacts, newest first', function () {
    $user = User::factory()->create();
    $other = User::factory()->create();
    $frida = Character::where('slug', 'frida')->firstOrFail();

    $old = Artifact::factory()->create([
        'user_id' => $user->id, 'character_id' => $frida->id,
        'type' => 'receta', 'title' => 'Tamales', 'created_at' => now()->subDay(),
    ]);
    $new = Artifact::factory()->create([
        'user_id' => $user->id, 'character_id' => $frida->id,
        'type' => 'portrait', 'title' => 'Raíz y vuelo',
        'data' => ['title' => 'Raíz y vuelo', 'image_url' => 'https://fal.example/i.jpg'],
    ]);
    Artifact::factory()->create([ // pendiente: excluido
        'user_id' => $user->id, 'character_id' => $frida->id, 'type' => 'image_pending',
    ]);
    Artifact::factory()->create([ // de otro usuario: excluido
        'user_id' => $other->id, 'character_id' => $frida->id, 'type' => 'receta',
    ]);

    actingAs($user)->get(route('portfolio.index'))
        ->assertInertia(fn ($page) => $page
            ->component('portfolio/index')
            ->has('artifacts', 2)
            ->where('artifacts.0.id', $new->id)
            ->where('artifacts.0.character.slug', 'frida')
            ->where('artifacts.1.id', $old->id)
        );
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `php artisan test --filter=PortfolioTest`
Expected: FAIL — `Route [portfolio.index] not defined`

- [ ] **Step 3: Implement controller and route**

```php
<?php
// app/Http/Controllers/PortfolioController.php

namespace App\Http\Controllers;

use App\Models\Artifact;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PortfolioController extends Controller
{
    public function index(Request $request)
    {
        $artifacts = Artifact::query()
            ->where('user_id', $request->user()->id)
            ->whereNotIn('type', ['image_pending', 'error'])
            ->with('character:id,slug,name')
            ->latest()
            ->latest('id')
            ->get()
            ->map(fn (Artifact $a) => [
                'id' => $a->id,
                'type' => $a->type,
                'title' => $a->title,
                'data' => $a->data,
                'created_at' => $a->created_at->format('Y-m-d'),
                'character' => [
                    'slug' => $a->character->slug,
                    'name' => $a->character->name,
                ],
            ]);

        return Inertia::render('portfolio/index', [
            'artifacts' => $artifacts,
        ]);
    }
}
```

En `routes/web.php`, dentro del grupo `auth` (después de la línea de `chat.clear`):

```php
    Route::get('portafolio', [PortfolioController::class, 'index'])->name('portfolio.index');
```

(Agregar `use App\Http\Controllers\PortfolioController;` arriba.)

- [ ] **Step 4: Run tests, regenerate Wayfinder**

Run: `php artisan test --filter=PortfolioTest`
Expected: PASS

Run: `php artisan wayfinder:generate`
Expected: genera `resources/js/routes/portfolio/index.ts` (o equivalente) — verificar con `ls resources/js/routes/`

- [ ] **Step 5: Commit**

```bash
git add app/Http/Controllers/PortfolioController.php routes/web.php tests/Feature/PortfolioTest.php resources/js/routes/ resources/js/actions/
git commit -m "feat: ruta y controller del portafolio"
```

---

### Task 7: Frontend compartido — `accents.ts` + `InfoArtifactRenderer`

**Files:**
- Create: `resources/js/lib/accents.ts`
- Create: `resources/js/components/artifacts/InfoArtifactRenderer.tsx`
- Modify: `resources/js/components/artifacts/ToolBadge.tsx:146-154` (borrar `ArtifactRenderer` local, importar el nuevo)
- Modify: `resources/js/pages/chat/show.tsx:59-64` (importar el mapa desde lib en vez de definirlo)

**Interfaces:**
- Produces: `characterAccent: Record<string, string>` y `accentFor(slug: string): string` en `@/lib/accents`; `<InfoArtifactRenderer artifact accent />` en `@/components/artifacts/InfoArtifactRenderer` que renderiza los 6 tipos info (receta, reading, dream_analysis, defenses, unconscious_face, paranoid_critical).

- [ ] **Step 1: Create `resources/js/lib/accents.ts`**

Mover el contenido de los mapas de `show.tsx` (líneas 59-64 aprox — copiar los valores EXACTOS del archivo real, incluye `characterAccent` y `characterAccentInk`):

```ts
export const characterAccent: Record<string, string> = {
    dali: 'var(--accent-dali)',
    freud: 'var(--accent-freud)',
    frida: 'var(--accent-frida)',
    beauvoir: 'var(--accent-beauvoir)',
};

// characterAccentInk: copiar tal cual de show.tsx

export function accentFor(slug: string): string {
    return characterAccent[slug] ?? 'var(--ink)';
}
```

- [ ] **Step 2: Create `InfoArtifactRenderer.tsx`**

Extraer la función `ArtifactRenderer` de `ToolBadge.tsx` (líneas 146-154) a su propio archivo, exportada como default, junto con el type `InfoArtifact` y el type guard:

```tsx
// resources/js/components/artifacts/InfoArtifactRenderer.tsx
import type {
    Artifact,
    DefensesArtifact,
    DreamAnalysisArtifact,
    ParanoidCriticalArtifact,
    ReadingArtifact,
    RecetaArtifact,
    UnconsciousFaceArtifact,
} from '@/types/chat';
import RecetaCard from './RecetaCard';
import ReadingCard from './ReadingCard';
import DreamAnalysisCard from './DreamAnalysisCard';
import DefensesCard from './DefensesCard';
import UnconsciousFaceCard from './UnconsciousFaceCard';
import ParanoidCriticalCard from './ParanoidCriticalCard';

export type InfoArtifact =
    | RecetaArtifact
    | ReadingArtifact
    | DreamAnalysisArtifact
    | DefensesArtifact
    | UnconsciousFaceArtifact
    | ParanoidCriticalArtifact;

const INFO_TYPES: InfoArtifact['artifact_type'][] = [
    'receta', 'reading', 'dream_analysis', 'defenses', 'unconscious_face', 'paranoid_critical',
];

export function isInfoType(type: string): type is InfoArtifact['artifact_type'] {
    return (INFO_TYPES as string[]).includes(type);
}

export default function InfoArtifactRenderer({ artifact, accent }: { artifact: InfoArtifact; accent: string }) {
    if (artifact.artifact_type === 'receta') return <RecetaCard data={artifact.data} accent={accent} />;
    if (artifact.artifact_type === 'reading') return <ReadingCard data={artifact.data} accent={accent} />;
    if (artifact.artifact_type === 'dream_analysis') return <DreamAnalysisCard data={artifact.data} accent={accent} />;
    if (artifact.artifact_type === 'defenses') return <DefensesCard data={artifact.data} accent={accent} />;
    if (artifact.artifact_type === 'unconscious_face') return <UnconsciousFaceCard data={artifact.data} accent={accent} />;
    if (artifact.artifact_type === 'paranoid_critical') return <ParanoidCriticalCard data={artifact.data} accent={accent} />;
    return null;
}
```

En `ToolBadge.tsx`: borrar la función local `ArtifactRenderer` y sus imports de tarjetas ahora sin uso, importar `InfoArtifactRenderer` y usarlo en la línea 138 (`<InfoArtifactRenderer artifact={props.artifact} accent={props.accent} />`). El type `InfoArtifact` local se importa desde el archivo nuevo. En `show.tsx`: reemplazar la definición de los mapas por `import { characterAccent, characterAccentInk } from '@/lib/accents';` (exportar ambos desde lib).

- [ ] **Step 3: Verify with build**

Run: `npm run build`
Expected: build OK, sin errores de TypeScript (esto ES el test de completitud type→componente)

- [ ] **Step 4: Run the suite**

Run: `php artisan test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add resources/js/lib/accents.ts resources/js/components/artifacts/InfoArtifactRenderer.tsx resources/js/components/artifacts/ToolBadge.tsx resources/js/pages/chat/show.tsx
git commit -m "refactor: extraer accents y renderer de artefactos info para reuso"
```

---

### Task 8: Página `/portafolio` + nav + i18n + caption en chat

**Files:**
- Create: `resources/js/pages/portfolio/index.tsx`
- Modify: `resources/js/components/app-header.tsx:34-42` (nav)
- Modify: `lang/es.json` (claves nuevas)
- Modify: `resources/js/pages/chat/show.tsx:720-724` (caption bajo artefactos)

**Interfaces:**
- Consumes: prop `artifacts` del controller (Task 6), `InfoArtifactRenderer`/`isInfoType`/`accentFor` (Task 7), tarjetas `PortraitCard`/`PaintingCard` existentes.

- [ ] **Step 1: Add i18n keys**

En `lang/es.json` (claves planas, junto a las `nav.*` existentes):

```json
"nav.portfolio": "Portafolio",
"portfolio.title": "Mi portafolio",
"portfolio.subtitle": "Todo lo que has creado con tus maestros",
"portfolio.empty_title": "Tu taller está vacío",
"portfolio.empty_body": "Frida tiene un caballete esperándote.",
"portfolio.empty_cta": "Ir al taller",
"portfolio.filter_all": "Todos",
"chat.artifact_saved": "En tu portafolio"
```

- [ ] **Step 2: Create the page**

```tsx
// resources/js/pages/portfolio/index.tsx
import { Head, Link } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import AppHeaderLayout from '@/layouts/app/app-header-layout';
import InfoArtifactRenderer, { isInfoType, type InfoArtifact } from '@/components/artifacts/InfoArtifactRenderer';
import PortraitCard from '@/components/artifacts/PortraitCard';
import PaintingCard from '@/components/artifacts/PaintingCard';
import { accentFor } from '@/lib/accents';
import { useT } from '@/lib/i18n';
import { index as chatIndex } from '@/routes/chat';

interface PortfolioArtifact {
    id: number;
    type: string;
    title: string | null;
    data: Record<string, unknown>;
    created_at: string;
    character: { slug: string; name: string };
}

export default function PortfolioIndex({ artifacts }: { artifacts: PortfolioArtifact[] }) {
    const t = useT();
    const [filter, setFilter] = useState<string>('all');

    const characters = useMemo(() => {
        const seen = new Map<string, string>();
        artifacts.forEach((a) => seen.set(a.character.slug, a.character.name));
        return [...seen.entries()];
    }, [artifacts]);

    const visible = filter === 'all' ? artifacts : artifacts.filter((a) => a.character.slug === filter);

    return (
        <AppHeaderLayout>
            <Head title={t('portfolio.title')} />
            <div className="mx-auto max-w-5xl px-4 py-8">
                <h1 className="font-display text-lg uppercase tracking-widest text-[var(--ink)]">
                    {t('portfolio.title')}
                </h1>
                <p className="mt-1 font-body text-sm text-[var(--ink)]/70">{t('portfolio.subtitle')}</p>

                {characters.length > 1 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                        <FilterChip active={filter === 'all'} accent="var(--ink)" onClick={() => setFilter('all')}>
                            {t('portfolio.filter_all')}
                        </FilterChip>
                        {characters.map(([slug, name]) => (
                            <FilterChip key={slug} active={filter === slug} accent={accentFor(slug)} onClick={() => setFilter(slug)}>
                                {name}
                            </FilterChip>
                        ))}
                    </div>
                )}

                {visible.length === 0 ? (
                    <div
                        className="mt-10 border-2 border-[var(--ink)] bg-[var(--bg-deep)] p-10 text-center"
                        style={{ boxShadow: '4px 4px 0 0 var(--ink)' }}
                    >
                        <p className="font-display text-sm uppercase tracking-widest text-[var(--ink)]">
                            {t('portfolio.empty_title')}
                        </p>
                        <p className="mt-2 font-body text-sm text-[var(--ink)]/70">{t('portfolio.empty_body')}</p>
                        <Link
                            href={chatIndex.url()}
                            className="mt-6 inline-block border-2 border-[var(--ink)] bg-[var(--bg)] px-4 py-2 font-display text-[10px] uppercase tracking-widest text-[var(--ink)] transition hover:translate-y-[-1px]"
                            style={{ boxShadow: '3px 3px 0 0 var(--ink)' }}
                        >
                            {t('portfolio.empty_cta')} →
                        </Link>
                    </div>
                ) : (
                    <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                        {visible.map((a) => (
                            <div key={a.id} className="min-w-0">
                                <ArtifactByType artifact={a} />
                                <p className="mt-1 font-display text-[9px] uppercase tracking-widest text-[var(--ink)]/50">
                                    {a.character.name} · {a.created_at}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AppHeaderLayout>
    );
}

function ArtifactByType({ artifact }: { artifact: PortfolioArtifact }) {
    const accent = accentFor(artifact.character.slug);
    const payload = { artifact_type: artifact.type, data: artifact.data };

    if (isInfoType(artifact.type)) {
        return <InfoArtifactRenderer artifact={payload as InfoArtifact} accent={accent} />;
    }
    if (artifact.type === 'portrait') {
        return <PortraitCard data={artifact.data as never} accent={accent} characterSlug={artifact.character.slug} />;
    }
    if (artifact.type === 'painting') {
        return <PaintingCard data={artifact.data as never} accent={accent} characterSlug={artifact.character.slug} />;
    }
    return null;
}

function FilterChip({ active, accent, onClick, children }: {
    active: boolean; accent: string; onClick: () => void; children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`border-2 border-[var(--ink)] px-3 py-1 font-display text-[9px] uppercase tracking-widest transition ${
                active ? 'bg-[var(--ink)] text-[var(--bg)]' : 'bg-[var(--bg-deep)] text-[var(--ink)] hover:translate-y-[-1px]'
            }`}
            style={{ boxShadow: active ? 'none' : `2px 2px 0 0 ${accent}` }}
        >
            {children}
        </button>
    );
}
```

Notas para el ejecutor:
- Verificar el layout real: si `chat/index.tsx` no usa `AppHeaderLayout` sino otro wrapper, usar el MISMO que la página de selección de personajes para que el header con nav aparezca. Revisar `resources/js/pages/chat/index.tsx` primero.
- El import de la ruta wayfinder puede ser `@/routes/chat` (patrón confirmado en `app-header.tsx:13`).

- [ ] **Step 3: Add nav link + chat caption**

En `app-header.tsx`, dentro del `<nav>` (línea 34), después del link de chat, siguiendo su mismo className:

```tsx
<Link
    href={portfolioIndex.url()}
    className={/* mismo className que el Link de chat existente */}
>
    {t('nav.portfolio')}
</Link>
```

(con `import { index as portfolioIndex } from '@/routes/portfolio';`)

En `chat/show.tsx`, donde se mapean los artefactos del mensaje (línea ~722), envolver cada `ArtifactCard` para añadir el caption cuando el artefacto ya está en el portafolio (ni pendiente ni error):

```tsx
{msg.artifacts.map((artifact, i) => (
    <div key={i}>
        <ArtifactCard
            artifact={artifact}
            accent={accent}
            characterName={character.name}
            characterSlug={character.slug}
        />
        {artifact.artifact_type !== 'image_pending' && artifact.artifact_type !== 'error' && (
            <Link
                href={portfolioIndex.url()}
                className="mt-1 inline-block font-display text-[9px] uppercase tracking-widest text-[var(--ink)]/50 hover:text-[var(--ink)]"
            >
                ✦ {t('chat.artifact_saved')}
            </Link>
        )}
    </div>
))}
```

(Copiar los props EXACTOS del `ArtifactCard` existente en esa línea — no inventar; solo se agrega el wrapper y el caption. Hay un segundo uso de `ArtifactCard` cerca de la línea 782 — revisar si es el estado streaming y aplicar el caption solo donde el artefacto ya está completo.)

- [ ] **Step 4: Build + suite**

Run: `npm run build && php artisan test`
Expected: build OK, tests PASS

- [ ] **Step 5: Smoke test manual**

Run: `php artisan serve` (o el dev server que esté corriendo) y visitar `/portafolio` logueado.
Expected: empty state con CTA al chat; tras generar una receta con Frida en el chat, la tarjeta aparece en el portafolio y el caption "✦ En tu portafolio" aparece bajo la tarjeta en el chat.

- [ ] **Step 6: Commit**

```bash
git add resources/js/pages/portfolio/ resources/js/components/app-header.tsx resources/js/pages/chat/show.tsx lang/es.json
git commit -m "feat: página /portafolio + nav + caption de guardado en chat"
```

---

### Task 9: Actualizar docs del pivote

**Files:**
- Modify: `docs/saas/00-vision.md` — audiencia: teens (10-16, vía padres) al centro; curiosos adultos pasan a secundario. Diferenciadores: agregar "anti-tarea" (co-creación, no resolver deberes) y "portafolio como prueba de valor".
- Modify: `docs/saas/01-roadmap.md` — Fase 1 pasa a "roster teen-first + loop taller/portafolio (hecho en plan 2026-07-10)"; marketing/funnel (Fase 3) se mueve explícitamente detrás de las sesiones iterativas de producto.
- Modify: `docs/saas/02-roster.md` — agregar criterios "aptitud teen" y "potencial de taller"; marcar Freud como despriorizado del roster destacado teen (disponible para segmento adulto); marcar Sor Juana, Einstein y Da Vinci como próximas adiciones.
- Modify: `docs/saas/03-edutainment-features.md` — nota al inicio: "cursos/rutas guiadas" se redefinen como talleres (camino B) sobre el scaffolding de artifacts; referencia al spec.

**Interfaces:** ninguna — solo documentación, consistente con `docs/superpowers/specs/2026-07-10-taller-portafolio-design.md`.

- [ ] **Step 1: Edit the four docs** según lo listado arriba (redacción libre, tono de los docs existentes, actualizar la línea "Última actualización" a 2026-07-10).

- [ ] **Step 2: Commit**

```bash
git add docs/saas/
git commit -m "docs: actualizar plan SaaS al pivote teen-first (taller + portafolio)"
```

---

## Self-review (hecho al escribir)

- **Cobertura del spec**: entidad artifacts ✓ (T1), ArtifactService punto único ✓ (T2-T4, con desviación documentada), coCreationBlock ✓ (T5), protocolo de angustia ✓ (T5), /portafolio + empty state + caption ✓ (T6-T8), reuso de 11 tarjetas ✓ (T7-T8), tests Pest del spec ✓ (T1-T6; completitud vía type-check, documentado), docs ✓ (T9). Roster nuevo (Sor Juana/Einstein/Da Vinci) → plan aparte, declarado.
- **Columnas scaffolding** (`status`, `parent_id`, `taller_key`): presentes desde T1, sin lógica — exactamente lo que el spec pidió.
- **Tipos consistentes**: `persistFromConversation(string, int, Character): int` usado igual en T2 y T4; `resolveImage(string, string, string, string): void` igual en T3.
