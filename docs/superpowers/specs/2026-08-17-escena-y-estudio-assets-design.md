# Escena v1 + Estudio de Assets — Design Spec

> Fecha: 2026-08-17
> Estado: aprobado en sesión de brainstorming (Ric + Mavi)
> Alcance: (1) estandarizar la escena del chat en nivel "escenario simple", (2) construir el Estudio de Assets que produce todos los assets del roster de 14 figuras vía gpt-image en fal.ai.

## 1. Contexto y decisiones lockeadas

- **Roster lockeado en 14 figuras** — ver `docs/saas/02-roster.md`. Faltan por construir 10 figuras (Olas 2 y 3); Frida, Dalí, Beauvoir y Freud ya existen.
- **Escena del chat = nivel "escenario simple" (B)**: sprite pixel-art de cuerpo completo parado sobre su fondo, con sombra y efectos ambient genéricos compartidos. Se descartó para v1 el diorama completo (nivel C: props en capas + efectos custom por personaje, ~15 assets/figura) por costo de producción ×13.
- **Frida conserva su diorama completo** (`resources/js/game/dioramas/frida.ts` + `public/props/frida/` + `public/sprites/frida/`) como figura insignia. Nada de lo suyo se toca ni se regenera.
- **Generación 100% vía gpt-image en fal.ai** (`openai/gpt-image-2`, el default actual de `FalImageService`). Se descartó PixelLab (usado para los sprites originales de Frida): un solo proveedor, la infra ya existe y está probada.
- **Consistencia entre poses por cadena de edición**: el emote `neutral` se genera text-to-image; `happy`/`thinking`/`surprised` se generan con `FalImageService::edit()` tomando el neutral aprobado como imagen fuente. Nunca se generan 4 poses independientes.
- El upgrade B → C por figura es **aditivo**: `DioramaConfig` ya modela el escenario simple como diorama con `layers: []`. Subir una figura a diorama después = agregar props y efectos, sin rehacer sprites ni fondo.

## 2. Especificación de assets por figura

| # | Asset | Archivo destino | Dimensiones | Formato | Generación |
|---|---|---|---|---|---|
| 1 | Sprite cuerpo completo `neutral` | `public/sprites/<slug>/neutral.png` | 1024×1536 (2:3) | PNG **con transparencia** | text-to-image |
| 2-4 | Sprites `happy` / `thinking` / `surprised` | `public/sprites/<slug>/<emote>.png` | 1024×1536 (2:3) | PNG con transparencia | edit sobre el neutral aprobado |
| 5 | Busto `neutral` | `public/avatars/<slug>/neutral.png` | 1024×1024 | PNG | edit sobre el sprite neutral aprobado (reencuadre a busto — misma cara garantizada) |
| 6 | Fondo | `public/backgrounds/<slug>.png` | 1024×1536 (2:3 vertical) | PNG opaco | text-to-image |

**Total por figura nueva: 6 assets.** 10 figuras nuevas = 60 assets, más ~12 sprites para migrar Dalí/Freud/Beauvoir al nivel B (sus bustos existentes sirven como imagen fuente del edit para derivar el cuerpo completo).

Notas de spec:

- **Los sprites NO son de 70×97 px reales** como los de Frida (PixelLab). Son renders de *estilo* pixel-art en alta resolución; el look pixel lo dan el arte + `image-rendering: pixelated`. En el canvas Phaser se escalan por `heightRatio` igual que hoy.
- **El busto se reduce a solo `neutral`.** Las cartas TCG (`CharacterCard` → `PixelAvatar`), las listas de conversación y el roster nunca muestran otros emotes; la emoción en el chat la carga el sprite. Los bustos happy/thinking/surprised existentes de las 4 figuras viejas se quedan (no estorban), pero no se producen para figuras nuevas.
- **Transparencia**: se solicita `background: transparent` en el payload (`opts.extra`). Contingencia documentada: si el endpoint de fal para gpt-image-2 no respeta el parámetro, el pipeline encadena un paso de remove-background con un modelo de fal (ej. `fal-ai/birefnet`) antes de guardar el candidato. La decisión se toma en implementación con una prueba real; ambas rutas viven detrás del mismo job.
- **Estandarización de fondos**: los fondos existentes están inconsistentes (Frida courtyard 1536×1024 horizontal, Dalí 1024×1242). El estándar nuevo es 1024×1536 vertical (la escena del chat y la ventana de arte de la carta son verticales; `cover` recorta menos). Los fondos viejos se regeneran con el Estudio solo si se ven mal en la escena nueva — no es bloqueante.
- Los prompts siempre piden: paleta y grid pixel-art consistentes con el estilo de la casa (guías de los skills `pixel-avatar-prompts` / `pixel-backgrounds` portadas a templates PHP), cuerpo completo de pies a cabeza sin recortes para sprites, y sin texto/marca de agua.

## 3. Escena v1 (frontend)

- `DioramaScene` y `useCharacterPhaser` **no cambian de formato**. Las configs stub de Dalí/Freud/Beauvoir (`resources/js/game/dioramas/{dali,freud,beauvoir}.ts`) se actualizan para apuntar a `public/sprites/<slug>/` cuando sus sprites estén aprobados; mientras tanto siguen con bustos (estado actual, no se rompe nada).
- Las 10 figuras nuevas nacen directo en nivel B: config con `background`, `character.sprites` (4), `shadow: true`, `layers: []`.
- **Ambient genérico compartido**: un set pequeño de efectos por código reutilizables (ej. motas de polvo, destellos) aplicable a cualquier figura vía config, sin assets ni efectos custom por personaje. Los efectos ricos por emote/tool quedan reservados al nivel C (hoy: solo Frida).

## 4. Estudio de Assets (`/estudio`)

Herramienta interna, solo entorno local, para producir/revisar/publicar los assets de la sección 2.

### 4.1 Modelo de datos

- `asset_requests`: `id`, `character_slug` (string — las figuras de Olas 2/3 aún no existen en `characters`), `type` enum (`sprite` | `avatar` | `background`), `emote` (nullable; solo `sprite`), `prompt` (texto final usado), `source_candidate_id` (nullable, FK a `asset_candidates` — el neutral aprobado del que deriva un edit), `status` (`pending → generating → ready_for_review → approved | failed`), `error` (nullable), timestamps.
- `asset_candidates`: `id`, `asset_request_id` FK, `path` (staging), `status` (`candidate` | `approved` | `rejected`), `meta` json (respuesta cruda de fal), timestamps.
- Lo publicado queda auditado: cada PNG en `public/` es rastreable al prompt y candidato que lo produjo.

### 4.2 Pipeline de generación

1. `AssetPromptComposer` compone el prompt desde el template del tipo/emote + la ficha de la figura, y la UI lo muestra **editable antes de disparar**.
2. `GenerateAssetCandidatesJob` (queue) llama `FalImageService` y guarda **3 candidatos** por batch en `storage/app/public/asset-staging/<slug>/`; marca `ready_for_review`.
   - `sprite:neutral`, `avatar`, `background` → `generate()` (text-to-image).
   - `sprite:{happy,thinking,surprised}` → `edit()` con el neutral aprobado como fuente. La UI y el job bloquean estos requests hasta que exista un neutral aprobado para el slug. Para Dalí/Freud/Beauvoir, el busto existente puede usarse como fuente del primer neutral de cuerpo completo.
   - Paso opcional de remove-background (ver contingencia de transparencia, sección 2).
3. Único cambio a `FalImageService`: `storeRemoteImage` hoy guarda solo `images[0]`; se extiende para devolver todas las imágenes del batch.

### 4.3 UI

- Páginas Inertia con la estética pixel del app, **vista principal: matriz de producción** — una fila por figura, una columna por slot (neutral, happy, thinking, surprised, busto, fondo), chips de estado (`✓ aprobado`, `● por revisar (n)`, `⟳ generando`, `◌ vacío`, `🔒 bloqueado por cadena`), y un contador global "n por revisar" arriba. Clic en celda → pantalla del request.
- Pantalla de request: candidatos lado a lado sobre fondo de tablero de ajedrez (para ver transparencia), editor de prompt, botones aprobar / rechazar / regenerar (nuevo batch con el prompt editado).
- **Acceso**: rutas registradas siempre pero detrás de un middleware `EnsureLocalEnvironment` (404 fuera de `local`). Registrarlas condicionalmente rompería la generación Wayfinder en el build de prod (mismo problema resuelto con `/register`).

### 4.4 Aprobación y publicación

- `PublishAssetAction`: valida dimensiones/formato del candidato aprobado, recorta/ajusta si hace falta al spec de la sección 2, y escribe al destino en `public/`. Marca request `approved`.
- Aprobar sobre un asset ya publicado lo **reemplaza**, con confirmación en la UI.
- No hay downscale: los archivos se publican a su resolución generada (el pixel look es del arte, no del tamaño).

### 4.5 Errores y testing

- Job fallido → `status: failed` + mensaje visible en la matriz con botón retry. Nada muere en silencio en la queue.
- Tests Pest: `Http::fake()` para fal.ai, `Queue::fake()` para dispatch, fixture PNG para `PublishAssetAction`, test del bloqueo de cadena (emote sin neutral aprobado → 422), y test de que `/estudio` responde 404 fuera de `local`.

## 5. Fuera de alcance v1

- Assets de showcase/og de la landing (pausada) y props/spritesheets de dioramas nivel C.
- Tracking de costos de generación y multi-usuario en el Estudio.
- Regeneración masiva de los assets existentes de Frida.
- Cualquier cambio al layout general del chat más allá de la fuente de sprites de la escena.

## 6. Orden de implementación sugerido

1. Estudio de Assets completo (migraciones → pipeline → UI → publicación).
2. Producir los 6 assets de **una** figura piloto (Sor Juana) y validar en la escena real.
3. Ajustar templates de prompt con lo aprendido; producir el resto del roster por olas.
4. Migrar Dalí/Freud/Beauvoir a sprites de cuerpo completo.
