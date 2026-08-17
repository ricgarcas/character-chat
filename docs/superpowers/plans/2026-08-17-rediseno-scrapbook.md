# Rediseño "Scrapbook vivo" — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar el chrome retro/8-bit de toda la app autenticada por el mundo visual "Scrapbook vivo" (papel cálido + stickers + botones caramelo), conservando el pixel art como ilustración y la escena Phaser intacta.

**Architecture:** La paleta y tipografía fluyen por CSS vars (`--bg`, `--ink`, `--font-display`, acentos), así que la Task 1 retokeniza globalmente y las siguientes re-estructuran página por página: shell+nav nuevo, taller (chat), personajes, portafolio, settings-pausa y login. La lógica de streaming/Echo/powerups de `show.tsx` NO se toca — solo su capa de presentación (el JSX del return).

**Tech Stack:** React 19 + Inertia v3 + Tailwind v4 (tokens en `@theme`/`:root`), `@phosphor-icons/react` (weight bold), `canvas-confetti`, Google Fonts (Nunito 800/900 + Outfit 400/600), Phaser (sin cambios).

**Spec:** `docs/superpowers/specs/2026-08-17-rediseno-scrapbook-design.md`

## Global Constraints

- **Emojis SOLO para caritas de emote** (😐 😊 🤔 😮). Todo otro icono: `@phosphor-icons/react` con `weight="bold"`.
- Rotaciones sticker **deterministas** por componente (±1.5° a ±4°), nunca aleatorias.
- Pixel art siempre con `image-rendering: pixelated`, siempre como contenido enmarcado.
- Motion respeta `useReducedMotion()` (`resources/js/hooks/use-reduced-motion.ts`); confetti UNA vez por artifact.
- Fuera de alcance: landing (pausada), `/estudio`, dark mode, sfx (se retiran las llamadas `sfx.*` de pantallas migradas).
- Contraste: `--ink` sobre `--paper` y `--ink-soft` sobre `--paper` ≥ 4.5:1.
- Después de cada task: `npm run build` verde + `php artisan test` verde + commit.
- La lógica de `show.tsx` (hooks, parseo, sendMessage, Echo, powerups) es intocable — solo cambia el JSX.

## Estructura de archivos

```
resources/css/app.css                          — retokenización (Task 1)
resources/views/app.blade.php                  — fuentes Google (Task 1)
resources/js/components/shell/app-shell.tsx    — nav + tab bar móvil (Task 2)
resources/js/components/shell/pause-menu.tsx   — menú de pausa (Task 2)
resources/js/components/taller/diorama-card.tsx    — marco+cinta+sticker emote+caption (Task 3)
resources/js/components/taller/move-menu.tsx       — superpowers como movimientos (Task 3)
resources/js/components/taller/artifact-sticker.tsx — wrapper sticker + confetti (Task 3)
resources/js/lib/emotes.ts                     — emoji+etiqueta por emote (Task 3)
resources/js/lib/powerup-icons.tsx             — mapa key→icono Phosphor (Task 3)
resources/js/pages/chat/show.tsx               — nuevo JSX (Task 3)
resources/js/pages/chat/index.tsx              — grid scrapbook (Task 4)
app/Http/Controllers/ChatController.php        — prop `upcoming` (Task 4)
resources/js/pages/portfolio/index.tsx         — inventario (Task 5)
resources/js/layouts/settings/* + pages        — pausa (Task 6)
resources/js/pages/auth/login.tsx              — bienvenida (Task 6)
resources/js/app.tsx                           — switch de layouts (Tasks 2/6)
```

---

### Task 1: Tokens, fuentes y dependencias

**Files:**
- Modify: `resources/css/app.css` (línea 1 `@import` de fuentes; bloque `@theme` líneas ~12-18; bloque retro `:root` con `--accent-*` ~línea 145-160; revisar clases `.btn-sketch`, `.input-sketch`, `.acotacion-bar`)
- Modify: `resources/views/app.blade.php:54-56` (links de fuentes)
- Modify: `package.json` (deps nuevas)

**Interfaces:**
- Produces: tokens CSS `--paper, --paper-deep, --surface, --ink, --ink-soft, --ink-faint, --line, --candy, --candy-deep, --candy-ink, --shadow-tactile, --shadow-candy, --shadow-sticker, --shadow-diorama`; clases utilitarias `.btn-candy`, `.btn-soft`, `.sticker-tape`; `--font-display` = Nunito y `--font-body` = Outfit (los componentes existentes que usan `font-display`/`font-body` heredan solos).

- [ ] **Step 1: Instalar dependencias**

```bash
npm install @phosphor-icons/react canvas-confetti && npm install -D @types/canvas-confetti
```

- [ ] **Step 2: Cambiar fuentes en `app.blade.php`**

Reemplazar la línea 56 por:

```html
<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&family=Outfit:wght@400;500;600&display=swap" rel="stylesheet" />
```

- [ ] **Step 3: Retokenizar `app.css`**

Línea 1 — reemplazar el `@import url(...)` de Press Start 2P/VT323 por:

```css
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&family=Outfit:wght@400;500;600&display=swap');
```

En `@theme`, reemplazar las tres fuentes:

```css
    --font-sans: 'Outfit', ui-sans-serif, system-ui, sans-serif,
        'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
    --font-display: 'Nunito', ui-sans-serif, system-ui, sans-serif;
    --font-body: 'Outfit', ui-sans-serif, system-ui, sans-serif;
```

En el bloque `:root` donde viven `--accent-dali` etc. (buscar `/* Character accents`), ANTES de los acentos, redefinir la paleta base cálida — estas vars ya las consumen todas las pantallas:

```css
    /* Scrapbook vivo — papel y tinta (spec 2026-08-17-rediseno-scrapbook) */
    --paper: #f9f3e6;
    --paper-deep: #f1e7d0;
    --surface: #ffffff;
    --bg: var(--paper);           /* legacy alias — pantallas aún no migradas */
    --bg-deep: var(--paper-deep); /* legacy alias */
    --bg-tile: #f4ecd9;
    --ink: #3a2c14;
    --ink-light: #6b5b3e;
    --ink-soft: #8a7a5e;
    --ink-faint: #b3a488;
    --line: #ecdfc0;
    --candy: #ff9f43;
    --candy-deep: #d97e20;
    --candy-ink: #4a2c00;
    --pixel-shadow: var(--line);  /* legacy alias */
    --shadow-tactile: 0 3px 0 var(--line);
    --shadow-candy: 0 4px 0 var(--candy-deep);
    --shadow-sticker: 0 8px 18px rgba(90, 66, 20, 0.18);
    --shadow-diorama: 0 10px 24px rgba(90, 66, 20, 0.25);
```

(Si ya existen definiciones de `--bg/--ink/...` en ese bloque, se REEMPLAZAN sus valores — no duplicar declaraciones.)

Al final del archivo, añadir las utilidades:

```css
/* ── Scrapbook vivo ───────────────────────────────────────────── */
.btn-candy {
    background: var(--candy);
    color: var(--candy-ink);
    border-radius: 12px;
    box-shadow: var(--shadow-candy);
    font-family: var(--font-display);
    font-weight: 800;
    transition: transform 80ms ease-out, box-shadow 80ms ease-out;
}
.btn-candy:not(:disabled):active {
    transform: translateY(2px);
    box-shadow: 0 1px 0 var(--candy-deep);
}
.btn-soft {
    background: var(--surface);
    color: var(--ink);
    border-radius: 12px;
    box-shadow: var(--shadow-tactile);
    font-family: var(--font-display);
    font-weight: 800;
    transition: transform 80ms ease-out, box-shadow 80ms ease-out;
}
.btn-soft:not(:disabled):active {
    transform: translateY(2px);
    box-shadow: 0 1px 0 var(--line);
}
.sticker-tape { position: relative; }
.sticker-tape::before {
    content: '';
    position: absolute;
    top: -9px;
    left: 50%;
    width: 44%;
    height: 18px;
    transform: translateX(-50%) rotate(2deg);
    background: rgba(255, 224, 150, 0.85);
    border-radius: 2px;
    z-index: 3;
}
:focus-visible { outline: 2px solid var(--candy); outline-offset: 2px; }
```

- [ ] **Step 4: Build + tests + revisión visual rápida**

Run: `npm run build && php artisan test` — verdes. Abrir `https://muni.test/chat/sor-juana`: se verá "raro" (layout retro con paleta cálida) — esperado hasta Task 3; lo que NO debe haber es texto ilegible o build roto.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json resources/css/app.css resources/views/app.blade.php
git commit -m "feat(ui): tokens Scrapbook vivo — papel/tinta/caramelo, Nunito+Outfit, phosphor y confetti instalados"
```

---

### Task 2: Shell — nav superior, tab bar móvil y menú de pausa

**Files:**
- Create: `resources/js/components/shell/app-shell.tsx`
- Create: `resources/js/components/shell/pause-menu.tsx`
- Modify: `resources/js/app.tsx` (switch de layouts)
- Modify: `app/Http/Middleware/HandleInertiaRequests.php` (compartir `portfolioCount`)
- Test: `tests/Feature/ShellSharedPropsTest.php`

**Interfaces:**
- Consumes: tokens Task 1; rutas Wayfinder `@/routes/chat` (`index`), `@/routes/portfolio` (`index`), `@/routes` (`logout` — verificar nombre real en `resources/js/routes/index.ts` al implementar).
- Produces: `AppShellScrapbook({ children })` default export de `app-shell.tsx` — nav con Personajes/Portafolio ✦n/avatar-pausa, tab bar móvil; `PauseMenu({ open, onClose })` de `pause-menu.tsx`. Prop Inertia compartida `portfolioCount: number`.

- [ ] **Step 1: Test del prop compartido**

```php
<?php
// tests/Feature/ShellSharedPropsTest.php

use App\Models\Artifact;
use App\Models\Character;
use App\Models\User;
use Database\Seeders\CharacterSeeder;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\get;

beforeEach(function () {
    $this->seed(CharacterSeeder::class);
    $this->withoutVite();
});

it('shares the portfolio count with authenticated pages', function () {
    $user = User::factory()->create();
    Artifact::factory()->count(3)->create([
        'user_id' => $user->id,
        'character_id' => Character::where('slug', 'frida')->first()->id,
    ]);

    actingAs($user)->get('/chat')->assertInertia(fn ($page) => $page
        ->where('portfolioCount', 3));
});

it('shares zero for guests', function () {
    get('/login')->assertInertia(fn ($page) => $page->where('portfolioCount', 0));
});
```

- [ ] **Step 2: Run — FAIL** (`portfolioCount` no existe). Nota: si `ArtifactFactory` no existe, revisar `database/factories/ArtifactFactory.php`; existe desde el feature de artifacts.

- [ ] **Step 3: Compartir el contador en `HandleInertiaRequests::share()`**

```php
'portfolioCount' => fn () => $request->user()
    ? \App\Models\Artifact::where('user_id', $request->user()->id)
        ->whereNotIn('type', ['image_pending', 'error'])->count()
    : 0,
```

- [ ] **Step 4: Crear `app-shell.tsx`**

```tsx
import { Link, router, usePage } from '@inertiajs/react';
import { ChatCircle, Package, Pause, UsersThree, Sparkle } from '@phosphor-icons/react';
import { type ReactNode, useState } from 'react';
import PauseMenu from '@/components/shell/pause-menu';
import { index as chatIndex } from '@/routes/chat';
import { index as portfolioIndex } from '@/routes/portfolio';

export default function AppShellScrapbook({ children }: { children: ReactNode }) {
    const { portfolioCount, url } = usePage<{ portfolioCount: number }>().props as {
        portfolioCount: number;
    } & { url?: string };
    const current = usePage().url;
    const [pauseOpen, setPauseOpen] = useState(false);

    const navLink = (href: string, label: string, active: boolean) => (
        <Link
            href={href}
            className={`rounded-full px-4 py-1.5 font-display text-sm font-extrabold transition ${
                active ? 'bg-[var(--paper-deep)] text-[var(--ink)]' : 'text-[var(--ink-soft)] hover:text-[var(--ink)]'
            }`}
        >
            {label}
        </Link>
    );

    return (
        <div className="min-h-svh bg-[var(--paper)] font-body text-[var(--ink)]">
            <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--paper)]/95 backdrop-blur-sm">
                <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-4">
                    <Link href={chatIndex.url()} className="mr-2 font-display text-xl font-black tracking-tight">
                        muni
                    </Link>
                    <nav className="hidden items-center gap-1 sm:flex">
                        {navLink(chatIndex.url(), 'Personajes', current.startsWith('/chat'))}
                        <Link
                            href={portfolioIndex.url()}
                            className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 font-display text-sm font-extrabold transition ${
                                current.startsWith('/portafolio')
                                    ? 'bg-[var(--paper-deep)] text-[var(--ink)]'
                                    : 'text-[var(--ink-soft)] hover:text-[var(--ink)]'
                            }`}
                        >
                            Portafolio
                            <span className="flex items-center gap-0.5 rounded-full bg-[var(--candy)] px-2 py-0.5 text-xs font-black text-[var(--candy-ink)]">
                                <Sparkle size={11} weight="bold" />
                                {portfolioCount}
                            </span>
                        </Link>
                    </nav>
                    <button
                        type="button"
                        onClick={() => setPauseOpen(true)}
                        aria-label="Pausa"
                        className="btn-soft ml-auto flex h-9 w-9 items-center justify-center"
                    >
                        <Pause size={18} weight="bold" />
                    </button>
                </div>
            </header>

            <main className="pb-20 sm:pb-0">{children}</main>

            {/* Tab bar móvil */}
            <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-[var(--line)] bg-[var(--surface)] sm:hidden">
                {[
                    { href: chatIndex.url(), label: 'Personajes', icon: UsersThree, active: current.startsWith('/chat') },
                    { href: portfolioIndex.url(), label: 'Portafolio', icon: Package, active: current.startsWith('/portafolio') },
                ].map(({ href, label, icon: Icon, active }) => (
                    <Link
                        key={href}
                        href={href}
                        className={`flex flex-1 flex-col items-center gap-0.5 py-2 font-display text-[11px] font-extrabold ${
                            active ? 'text-[var(--candy-deep)]' : 'text-[var(--ink-soft)]'
                        }`}
                    >
                        <Icon size={20} weight="bold" />
                        {label}
                    </Link>
                ))}
            </nav>

            <PauseMenu open={pauseOpen} onClose={() => setPauseOpen(false)} />
        </div>
    );
}
```

Nota Wayfinder: `ChatCircle` queda importado solo si se usa; si el linter acusa import sin uso, quitarlo.

- [ ] **Step 5: Crear `pause-menu.tsx`**

```tsx
import { Link, router } from '@inertiajs/react';
import { Lock, Power, ShieldCheck, User, UsersFour, X } from '@phosphor-icons/react';

export default function PauseMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(58,44,20,0.45)] p-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="w-full max-w-xs rounded-2xl bg-[var(--surface)] p-6 shadow-[var(--shadow-sticker)]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="font-display text-lg font-black tracking-wide text-[var(--ink)]">— PAUSA —</h2>
                    <button type="button" onClick={onClose} aria-label="Cerrar" className="text-[var(--ink-soft)]">
                        <X size={18} weight="bold" />
                    </button>
                </div>
                <div className="flex flex-col gap-2.5">
                    <Link href="/settings/profile" className="btn-soft flex items-center gap-2.5 px-4 py-2.5 text-sm">
                        <User size={18} weight="bold" /> Mi cuenta
                    </Link>
                    <Link href="/settings/security" className="btn-soft flex items-center gap-2.5 px-4 py-2.5 text-sm">
                        <ShieldCheck size={18} weight="bold" /> Seguridad
                    </Link>
                    <div className="btn-soft flex items-center gap-2.5 px-4 py-2.5 text-sm opacity-50" aria-disabled>
                        <UsersFour size={18} weight="bold" /> Zona de papás
                        <span className="ml-auto flex items-center gap-1 rounded-full bg-[var(--paper-deep)] px-2 py-0.5 text-[10px] font-extrabold text-[var(--ink-soft)]">
                            <Lock size={10} weight="bold" /> pronto
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={() => router.post('/logout')}
                        className="btn-candy flex items-center gap-2.5 px-4 py-2.5 text-sm"
                    >
                        <Power size={18} weight="bold" /> Salir
                    </button>
                </div>
            </div>
        </div>
    );
}
```

(Verificar las rutas reales de settings en `routes/settings.php` al implementar; ajustar los `href` si difieren.)

- [ ] **Step 6: Montar el shell en `app.tsx`**

En el switch de layouts: los casos `name.startsWith('chat/')` y el default para `portfolio/` pasan a usar el shell. Reemplazar el switch por:

```tsx
        switch (true) {
            case name === 'auth/login':
            case name === 'landing':
            case name.startsWith('estudio/'):
                return null;
            case name.startsWith('chat/'):
            case name.startsWith('portfolio/'):
                return (page: ReactNode) => <AppShellScrapbook>{page}</AppShellScrapbook>;
            case name.startsWith('auth/'):
                return AuthLayout;
            case name.startsWith('settings/'):
                return [AppLayout, SettingsLayout];
            default:
                return AppLayout;
        }
```

con `import AppShellScrapbook from '@/components/shell/app-shell';` arriba. (La forma exacta de devolver un layout-función depende de cómo `app.tsx` aplica los layouts — mirar cómo consume el `layout` actual y adaptar: si espera componentes, exportar el shell como componente que recibe `children` ya funciona con `return AppShellScrapbook;`.)

- [ ] **Step 7: Verificar**

Run: `php artisan test tests/Feature/ShellSharedPropsTest.php && npm run build && php artisan test`
Expected: todo verde. Abrir `/chat` — nav visible arriba.

- [ ] **Step 8: Commit**

```bash
git add resources/js/components/shell app/Http/Middleware/HandleInertiaRequests.php resources/js/app.tsx tests/Feature/ShellSharedPropsTest.php
git commit -m "feat(ui): shell scrapbook — nav, tab bar móvil y menú de pausa"
```

---

### Task 3: El Taller — chat rediseñado

**Files:**
- Create: `resources/js/lib/emotes.ts`
- Create: `resources/js/lib/powerup-icons.tsx`
- Create: `resources/js/components/taller/diorama-card.tsx`
- Create: `resources/js/components/taller/move-menu.tsx`
- Create: `resources/js/components/taller/artifact-sticker.tsx`
- Modify: `resources/js/pages/chat/show.tsx` (imports + TODO el JSX del return, líneas ~534-971; la lógica 1-533 se conserva)

**Interfaces:**
- Consumes: shell (Task 2, vía app.tsx), tokens (Task 1), `useCharacterPhaser`, `PowerupModal`, `MarkdownMessage`, `ArtifactCard`, `ToolBadge` existentes.
- Produces: `EMOTE_STICKER: Record<EmoteKey, { emoji, label }>`; `powerupIcon(key: string): ReactNode` (Phosphor bold 22); `DioramaCard({ sceneRef, escena, emote })`; `MoveMenu({ powerups, disabled, onLaunch })`; `ArtifactSticker({ children, celebrate, accent })`.

- [ ] **Step 1: `lib/emotes.ts`** — la ÚNICA fuente de emojis permitidos:

```ts
import type { EmoteKey } from '@/types/chat';

/** Emojis SOLO aquí: son las caritas de emote (regla del spec). */
export const EMOTE_STICKER: Record<EmoteKey, { emoji: string; label: string }> = {
    neutral: { emoji: '😐', label: 'en calma' },
    happy: { emoji: '😊', label: 'feliz' },
    thinking: { emoji: '🤔', label: 'pensando' },
    surprised: { emoji: '😮', label: 'sorpresa' },
};
```

- [ ] **Step 2: `lib/powerup-icons.tsx`** — Phosphor reemplaza pixelarticons/retro:

```tsx
import {
    BookOpen, Brain, CookingPot, Egg, Eye, GenderFemale, MoonStars,
    PaintBrush, PenNib, Scales, Shield, Sparkle,
} from '@phosphor-icons/react';
import type { ReactNode } from 'react';

const ICONS: Record<string, ReactNode> = {
    receta: <CookingPot size={22} weight="bold" />,
    cara: <Eye size={22} weight="bold" />,
    retrato: <PaintBrush size={22} weight="bold" />,
    paranoide: <Brain size={22} weight="bold" />,
    huevo: <Egg size={22} weight="bold" />,
    analiza: <Scales size={22} weight="bold" />,
    critica: <GenderFemale size={22} weight="bold" />,
    lectura: <BookOpen size={22} weight="bold" />,
    sueno: <MoonStars size={22} weight="bold" />,
    defensas: <Shield size={22} weight="bold" />,
    rostro: <Eye size={22} weight="bold" />,
    taller: <PenNib size={22} weight="bold" />,
};

export function powerupIcon(key: string): ReactNode {
    return ICONS[key] ?? <Sparkle size={22} weight="bold" />;
}
```

- [ ] **Step 3: `taller/diorama-card.tsx`**

```tsx
import type { EmoteKey } from '@/types/chat';
import { EMOTE_STICKER } from '@/lib/emotes';
import type { RefObject } from 'react';

interface Props {
    sceneRef: RefObject<HTMLDivElement | null>;
    escena: string | null;
    emote: EmoteKey;
}

export default function DioramaCard({ sceneRef, escena, emote }: Props) {
    const sticker = EMOTE_STICKER[emote];

    return (
        <div>
            <div className="sticker-tape relative -rotate-[1.5deg] overflow-hidden rounded-[14px] shadow-[var(--shadow-diorama)]">
                <div className="relative aspect-[2/3] w-full">
                    <div ref={sceneRef} className="absolute inset-0" />
                </div>
                <div
                    key={emote}
                    className="absolute right-2.5 bottom-2.5 z-10 flex rotate-[4deg] animate-[emote-pop_180ms_ease-out] items-center gap-1.5 rounded-full bg-[var(--surface)] px-2.5 py-1 font-display text-xs font-extrabold text-[var(--ink)] shadow-[var(--shadow-sticker)]"
                >
                    <span aria-hidden>{sticker.emoji}</span>
                    {sticker.label}
                </div>
            </div>
            {escena && (
                <p className="mt-2.5 px-1 font-body text-sm italic leading-snug text-[var(--ink-soft)]">{escena}</p>
            )}
        </div>
    );
}
```

Y en `app.css` (folded aquí porque solo este componente la usa):

```css
@keyframes emote-pop { from { transform: rotate(4deg) scale(1.12); } to { transform: rotate(4deg) scale(1); } }
```

- [ ] **Step 4: `taller/move-menu.tsx`** — reemplaza el posicionamiento de `PowerupBar` (el componente viejo queda sin uso en el chat):

```tsx
import type { Powerup } from '@/components/PowerupBar';
import { powerupIcon } from '@/lib/powerup-icons';

interface Props {
    powerups: Powerup[];
    disabled: boolean;
    onLaunch: (p: Powerup) => void;
}

export default function MoveMenu({ powerups, disabled, onLaunch }: Props) {
    if (powerups.length === 0) return null;

    return (
        <div className="mt-3 grid grid-cols-2 gap-2">
            {powerups.map((p, i) => (
                <button
                    key={p.key}
                    type="button"
                    disabled={disabled}
                    onClick={() => onLaunch(p)}
                    className={`${i === 0 ? 'btn-candy' : 'btn-soft'} flex items-center gap-2 px-3 py-2.5 text-left text-[13px] leading-tight disabled:opacity-50`}
                >
                    {powerupIcon(p.key)}
                    <span className="min-w-0 flex-1 truncate">{p.label}</span>
                </button>
            ))}
        </div>
    );
}
```

(El icono del `Powerup` sigue llegando en `p.icon` para el `PowerupModal`; el menú usa el mapa nuevo por `key` — en el paso 6, los `POWERUPS_BY_CHARACTER` cambian sus `icon:` a `powerupIcon(key)` para que el modal también sea Phosphor.)

- [ ] **Step 5: `taller/artifact-sticker.tsx`** — wrapper con celebración:

```tsx
import confetti from 'canvas-confetti';
import { type ReactNode, useEffect, useRef } from 'react';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

interface Props {
    children: ReactNode;
    /** true solo cuando el artifact acaba de llegar en vivo (no en historial) */
    celebrate: boolean;
    accent: string;
}

export default function ArtifactSticker({ children, celebrate, accent }: Props) {
    const reduced = useReducedMotion();
    const fired = useRef(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!celebrate || reduced || fired.current) return;
        fired.current = true;
        const rect = ref.current?.getBoundingClientRect();
        confetti({
            particleCount: 60,
            spread: 55,
            startVelocity: 22,
            colors: [accent, '#ff9f43', '#ffe3b3'],
            origin: rect
                ? { x: (rect.left + rect.width / 2) / window.innerWidth, y: rect.top / window.innerHeight }
                : { y: 0.6 },
        });
    }, [celebrate, reduced, accent]);

    return (
        <div ref={ref} className="rotate-[1.5deg] rounded-[10px] border-2 border-dashed border-[#ecca8a] bg-[var(--surface)] p-2 shadow-[var(--shadow-sticker)]">
            {children}
        </div>
    );
}
```

- [ ] **Step 6: Reescribir la presentación de `show.tsx`**

Cambios de imports (arriba del archivo):
- Quitar: todos los de `pixelarticons/react`, los de `@/components/icons/retro`, `Balatro`, `PowerOffButton`, `PowerupBar` (dejar solo `type { Powerup }`).
- Añadir: `import { ArrowLeft, PaperPlaneRight, Trash, X, ClockCounterClockwise } from '@phosphor-icons/react';`, `DioramaCard`, `MoveMenu`, `ArtifactSticker`, `powerupIcon`.
- En `POWERUPS_BY_CHARACTER`, cada `icon: <CookingPot .../>` etc. se convierte en `icon: powerupIcon('receta')` (mismo key que el objeto).

El JSX del return (líneas ~534-971) se reemplaza por esta estructura (misma lógica, mismos handlers, mismos estados):

```tsx
    return (
        <>
            <Head title={`Chat with ${character.name}`} />

            <div className="mx-auto max-w-6xl px-4 py-6">
                {/* encabezado de la sesión */}
                <div className="mb-4 flex items-center gap-3">
                    <Link href="/chat" aria-label={t('chat.show.back')} className="btn-soft flex h-9 w-9 items-center justify-center">
                        <ArrowLeft size={18} weight="bold" />
                    </Link>
                    <h1 className="font-display text-2xl font-black text-[var(--ink)]">{character.name}</h1>
                    <span className="rounded-full px-3 py-1 font-display text-xs font-extrabold" style={{ backgroundColor: `color-mix(in srgb, ${accent} 18%, white)`, color: accent }}>
                        {t('chat.show.taller_badge', { defaultValue: 'taller' })}
                    </span>
                    <div className="ml-auto flex items-center gap-2">
                        {messages.length > 0 && (
                            <button onClick={() => setHistoryOpen(true)} className="btn-soft flex items-center gap-1.5 px-3 py-2 text-xs">
                                <ClockCounterClockwise size={16} weight="bold" /> {messages.length}
                            </button>
                        )}
                        <button onClick={() => setClearOpen(true)} disabled={isStreaming} aria-label={t('chat.show.clear')} className="btn-soft flex h-9 w-9 items-center justify-center disabled:opacity-50">
                            <Trash size={16} weight="bold" />
                        </button>
                    </div>
                </div>

                <div className="flex flex-col gap-6 lg:flex-row">
                    {/* diorama + movimientos */}
                    <aside className="w-full max-w-sm lg:w-[32%] lg:shrink-0">
                        <div className="lg:sticky lg:top-20">
                            <DioramaCard sceneRef={sceneRef} escena={isStreaming ? streamingEscena : (lastAssistant?.escena ?? null)} emote={lastEmote} />
                            <MoveMenu powerups={characterPowerups} disabled={isStreaming} onLaunch={handlePowerup} />
                        </div>
                    </aside>

                    {/* conversación */}
                    <section className="flex min-h-0 flex-1 flex-col">
                        <div ref={threadRef} className="flex max-h-[calc(100svh-16rem)] min-h-[24rem] flex-col gap-4 overflow-y-auto pr-1">
                            {messages.length === 0 && !isStreaming && (
                                <p className="font-body text-base italic text-[var(--ink-faint)]">{t('chat.show.say_hi', { name: character.name })}</p>
                            )}

                            {messages.map((msg) =>
                                msg.role === 'user' ? (
                                    <div key={msg.id} className="ml-[18%] self-end rounded-[14px] rounded-br-[4px] bg-[#ffe3b3] px-4 py-2.5 shadow-[0_3px_0_#ecca8a]">
                                        {msg.image_url && (
                                            <img src={msg.image_url} alt={t('chat.show.your_photo')} className="mb-2 h-14 w-14 rounded-lg object-cover" />
                                        )}
                                        <p className="whitespace-pre-wrap font-body text-[15px] leading-relaxed text-[#4a3812]">{msg.content}</p>
                                    </div>
                                ) : (
                                    <div key={msg.id} className="max-w-[88%] rounded-[14px] rounded-bl-[4px] bg-[var(--surface)] px-4 py-3 shadow-[var(--shadow-tactile)]">
                                        <p className="mb-1 font-display text-xs font-extrabold" style={{ color: accent }}>{character.name}</p>
                                        <MarkdownMessage className="font-body text-[15px] leading-relaxed text-[var(--ink)]" accent={accent}>
                                            {msg.content}
                                        </MarkdownMessage>
                                        {msg.artifacts && msg.artifacts.length > 0 && (
                                            <div className="mt-3 space-y-3">
                                                {msg.artifacts.map((artifact, i) => (
                                                    <ArtifactSticker key={i} celebrate={false} accent={accent}>
                                                        <ArtifactCard artifact={artifact} accent={accent} characterName={character.name} characterSlug={character.slug} />
                                                        {artifact.artifact_type !== 'image_pending' && artifact.artifact_type !== 'error' && (
                                                            <Link href={portfolioIndex.url()} className="mt-1 inline-block font-display text-[11px] font-extrabold uppercase tracking-wide text-[var(--candy-deep)]">
                                                                {t('chat.artifact_saved')}
                                                            </Link>
                                                        )}
                                                    </ArtifactSticker>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ),
                            )}

                            {isStreaming && (
                                <div className="max-w-[88%] rounded-[14px] rounded-bl-[4px] bg-[var(--surface)] px-4 py-3 shadow-[var(--shadow-tactile)]">
                                    <p className="mb-1 font-display text-xs font-extrabold" style={{ color: accent }}>{character.name}</p>
                                    {streamingDialogo ? (
                                        <MarkdownMessage className="font-body text-[15px] leading-relaxed text-[var(--ink)]" streaming accent={accent}>
                                            {streamingDialogo}
                                        </MarkdownMessage>
                                    ) : (
                                        <p className="animate-pulse font-body text-[15px] italic text-[var(--ink-faint)]">
                                            {streamingToolName === 'retrato_frida' ? t('chat.show.painting', { name: character.name })
                                                : streamingToolName === 'receta_de_coyoacan' ? t('chat.show.writing_receta', { name: character.name })
                                                : streamingToolName ? t('chat.show.preparing', { name: character.name })
                                                : t('chat.show.thinking', { name: character.name })}
                                        </p>
                                    )}
                                    {(() => {
                                        const streamingType = infoTypeFromToolName(streamingToolName);
                                        const alreadyHasType = streamingType && streamingArtifacts.some((a) => a.artifact_type === streamingType);
                                        const showBadge = streamingType && !alreadyHasType;
                                        if (streamingArtifacts.length === 0 && !showBadge) return null;
                                        return (
                                            <div className="mt-3 space-y-3">
                                                {streamingArtifacts.map((artifact, i) => (
                                                    <ArtifactSticker key={i} celebrate={artifact.artifact_type !== 'image_pending'} accent={accent}>
                                                        <ArtifactCard artifact={artifact} accent={accent} characterName={character.name} characterSlug={character.slug} />
                                                    </ArtifactSticker>
                                                ))}
                                                {showBadge && streamingType && <ToolBadge mode="streaming" artifactType={streamingType} accent={accent} />}
                                            </div>
                                        );
                                    })()}
                                </div>
                            )}
                        </div>

                        {/* input */}
                        <form onSubmit={handleSubmit} className="mt-4 flex items-end gap-2">
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={t('chat.show.placeholder', { name: character.name })}
                                rows={1}
                                disabled={isStreaming}
                                className="h-12 flex-1 resize-none rounded-[20px] bg-[var(--surface)] px-5 py-3 font-body text-[15px] text-[var(--ink)] placeholder-[var(--ink-faint)] shadow-[var(--shadow-tactile)] focus:outline-2 focus:outline-[var(--candy)] disabled:opacity-50"
                            />
                            <button type="submit" disabled={isStreaming || !input.trim()} aria-label="Enviar" className="btn-candy flex h-12 w-12 items-center justify-center disabled:opacity-50">
                                <PaperPlaneRight size={20} weight="bold" />
                            </button>
                        </form>
                    </section>
                </div>
            </div>

            {/* modales: clear / powerup / history — misma lógica, contenedores re-vestidos */}
            {clearOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[rgba(58,44,20,0.45)] p-4 backdrop-blur-sm" onClick={() => setClearOpen(false)}>
                    <div className="w-full max-w-sm rounded-2xl bg-[var(--surface)] p-6 shadow-[var(--shadow-sticker)]" onClick={(e) => e.stopPropagation()}>
                        <h2 className="font-display text-lg font-black text-[var(--ink)]">{t('chat.show.clear_title')}</h2>
                        <p className="mt-2 font-body text-sm leading-relaxed text-[var(--ink-soft)]">{t('chat.show.clear_description')}</p>
                        <div className="mt-5 flex gap-2.5">
                            <button onClick={() => setClearOpen(false)} className="btn-soft flex-1 px-4 py-2.5 text-sm">{t('chat.show.clear_cancel')}</button>
                            <button
                                onClick={() => {
                                    setClearOpen(false);
                                    router.delete(`/chat/${character.slug}/conversation`, {
                                        onSuccess: () => {
                                            setMessages([]); setStreamingContent(''); setStreamingArtifacts([]);
                                            setStreamingToolName(null); setConversationId(null); setIsStreaming(false);
                                            window.history.replaceState({}, '', `/chat/${character.slug}`);
                                        },
                                    });
                                }}
                                className="btn-candy flex-1 px-4 py-2.5 text-sm"
                            >
                                {t('chat.show.clear_confirm')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {activePowerup && (
                <PowerupModal
                    title={activePowerup.label}
                    description={activePowerup.description}
                    icon={activePowerup.icon}
                    accent={accent}
                    requiresPhoto={activePowerup.requiresPhoto}
                    photoPreview={pendingImagePreview}
                    onSelectPhoto={handleFileSelect}
                    onClearPhoto={clearPendingImage}
                    onClose={() => setActivePowerup(null)}
                    onAccept={acceptPowerup}
                />
            )}

            {historyOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(58,44,20,0.45)] p-4 backdrop-blur-sm" onClick={() => setHistoryOpen(false)}>
                    <div className="flex max-h-[80vh] w-full max-w-2xl flex-col rounded-2xl bg-[var(--surface)] shadow-[var(--shadow-sticker)]" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-3.5">
                            <h2 className="font-display text-base font-black text-[var(--ink)]">{t('chat.show.dialog_log')}</h2>
                            <button onClick={() => setHistoryOpen(false)} aria-label={t('chat.show.close')} className="text-[var(--ink-soft)]"><X size={18} weight="bold" /></button>
                        </div>
                        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
                            {messages.length === 0 ? (
                                <p className="text-center font-body text-sm italic text-[var(--ink-faint)]">{t('chat.show.no_dialog')}</p>
                            ) : (
                                messages.map((msg) => (
                                    <div key={msg.id}>
                                        {msg.role === 'assistant' && msg.escena && (
                                            <p className="mb-1 font-body text-xs italic text-[var(--ink-soft)]">{msg.escena}</p>
                                        )}
                                        <p className="font-display text-[11px] font-extrabold uppercase tracking-wide" style={{ color: msg.role === 'user' ? 'var(--ink-faint)' : accent }}>
                                            {msg.role === 'user' ? t('chat.show.you') : character.name}
                                        </p>
                                        {msg.role === 'assistant' ? (
                                            <MarkdownMessage className="font-body text-sm leading-relaxed text-[var(--ink)]" accent={accent}>{msg.content}</MarkdownMessage>
                                        ) : (
                                            <p className="whitespace-pre-wrap font-body text-sm leading-relaxed text-[var(--ink)]">{msg.content}</p>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
```

Notas de implementación: `escena` del diorama viene ahora de `lastAssistant?.escena` (persistida) o del streaming — las acotaciones salen del hilo (spec §4.1); la clave `chat.show.taller_badge` se añade a `lang/es.json` con valor `"taller"` (el helper `t()` con defaultValue no existe en este proyecto — verificar firma de `useT` y, si no soporta default, añadir la clave al JSON y llamar simple).

- [ ] **Step 7: Verificar**

Run: `npm run build && php artisan test`
Expected: verdes. Abrir `https://muni.test/chat/sor-juana`: diorama con cinta y sticker de emote, movimientos 2×2, burbujas cálidas, input píldora. Mandar un mensaje: streaming en burbuja, emote cambia el sticker con pop.

- [ ] **Step 8: Commit**

```bash
git add resources/js/lib/emotes.ts resources/js/lib/powerup-icons.tsx resources/js/components/taller resources/js/pages/chat/show.tsx resources/css/app.css lang/es.json
git commit -m "feat(ui): el taller scrapbook — diorama con sticker de emote, movimientos, burbujas y confetti"
```

---

### Task 4: Personajes — grid de cartas pegadas

**Files:**
- Modify: `app/Http/Controllers/ChatController.php` (método `index`)
- Modify: `resources/js/pages/chat/index.tsx` (reescritura completa)
- Test: `tests/Feature/ChatIndexUpcomingTest.php`

**Interfaces:**
- Consumes: shell (Task 2), tokens, `config('estudio.figures')` (fuente del roster lockeado).
- Produces: prop Inertia `upcoming: {slug: string, name: string}[]` (figuras del roster sin registro activo en DB); página con grid de cartas + bloqueadas.

- [ ] **Step 1: Test del prop `upcoming`**

```php
<?php
// tests/Feature/ChatIndexUpcomingTest.php

use App\Models\User;
use Database\Seeders\CharacterSeeder;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    $this->seed(CharacterSeeder::class);
    $this->withoutVite();
});

it('lists roster figures not yet built as upcoming', function () {
    actingAs(User::factory()->create())->get('/chat')->assertInertia(fn ($page) => $page
        ->has('characters')
        ->has('upcoming')
        // einstein está en config('estudio.figures') pero no en el seeder
        ->where('upcoming', fn ($upcoming) => collect($upcoming)->pluck('slug')->contains('einstein')
            && ! collect($upcoming)->pluck('slug')->contains('frida')));
});
```

- [ ] **Step 2: Run — FAIL** (`upcoming` no existe).

- [ ] **Step 3: En `ChatController@index`**, junto a `characters`:

```php
$activeSlugs = $characters->pluck('slug');

$upcoming = collect(config('estudio.figures'))
    ->reject(fn ($figure, $slug) => $activeSlugs->contains($slug))
    ->map(fn ($figure, $slug) => ['slug' => $slug, 'name' => $figure['name']])
    ->values();
```

y pasarlo al render. (Leer el método actual primero; `characters` puede llamarse distinto — adaptar sin cambiar lo existente.)

- [ ] **Step 4: Reescribir `chat/index.tsx`**

Sustituir el carrusel 3D/Balatro/sfx por el grid (archivo completo):

```tsx
import { Head, router } from '@inertiajs/react';
import { Lock } from '@phosphor-icons/react';
import { accentFor } from '@/lib/accents';
import { characterMeta } from '@/lib/character-meta';
import { useT } from '@/lib/i18n';
import { create } from '@/routes/chat';
import type { Character } from '@/types';

interface Upcoming { slug: string; name: string }

const TILTS = ['-rotate-2', 'rotate-1', 'rotate-2', '-rotate-1'];

export default function ChatIndex({ characters, upcoming }: { characters: Character[]; upcoming: Upcoming[] }) {
    const t = useT();

    return (
        <>
            <Head title={t('chat.index.title')} />
            <div className="mx-auto max-w-5xl px-4 py-8">
                <h1 className="font-display text-3xl font-black text-[var(--ink)]">{t('chat.index.title')}</h1>
                <p className="mt-1 font-body text-base text-[var(--ink-soft)]">{t('chat.index.subtitle', { defaultValue: 'Elige con quién crear hoy.' })}</p>

                <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
                    {characters.map((character, i) => {
                        const accent = accentFor(character.slug);
                        const meta = characterMeta[character.slug];
                        return (
                            <button
                                key={character.slug}
                                type="button"
                                onClick={() => router.visit(create.url(character.slug))}
                                className={`sticker-tape group text-left transition hover:-translate-y-1 ${TILTS[i % TILTS.length]}`}
                            >
                                <div className="overflow-hidden rounded-[14px] bg-[var(--surface)] p-2.5 pb-3 shadow-[var(--shadow-sticker)]">
                                    <img
                                        src={`/avatars/${character.slug}/neutral.png`}
                                        alt={character.name}
                                        className="aspect-square w-full rounded-[10px] object-cover"
                                        style={{ imageRendering: 'pixelated' }}
                                    />
                                    <p className="mt-2.5 font-display text-base font-black leading-tight text-[var(--ink)]">{character.name}</p>
                                    {meta && (
                                        <span className="mt-1 inline-block rounded-full px-2.5 py-0.5 font-display text-[11px] font-extrabold" style={{ backgroundColor: `color-mix(in srgb, ${accent} 18%, white)`, color: accent }}>
                                            {meta.role}
                                        </span>
                                    )}
                                </div>
                            </button>
                        );
                    })}

                    {upcoming.map((figure, i) => (
                        <div key={figure.slug} className={`${TILTS[(characters.length + i) % TILTS.length]} rounded-[14px] bg-[var(--paper-deep)] p-2.5 pb-3 opacity-70`}>
                            <div className="flex aspect-square w-full items-center justify-center rounded-[10px] bg-[var(--line)]/50 font-display text-4xl font-black text-[var(--ink-faint)]">?</div>
                            <p className="mt-2.5 font-display text-base font-black leading-tight text-[var(--ink-soft)]">{figure.name}</p>
                            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-[var(--surface)] px-2.5 py-0.5 font-display text-[11px] font-extrabold text-[var(--ink-faint)]">
                                <Lock size={10} weight="bold" /> pronto
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
```

(`chat.index.subtitle` se añade a `lang/es.json`; misma nota de `defaultValue` que en Task 3.)

- [ ] **Step 5: Verificar** — `php artisan test tests/Feature/ChatIndexUpcomingTest.php && npm run build && php artisan test` verdes; `/chat` muestra 5 cartas activas + 9 bloqueadas.

- [ ] **Step 6: Commit**

```bash
git add app/Http/Controllers/ChatController.php resources/js/pages/chat/index.tsx tests/Feature/ChatIndexUpcomingTest.php lang/es.json
git commit -m "feat(ui): personajes como cartas pegadas + roster bloqueado con candado"
```

---

### Task 5: Portafolio — inventario

**Files:**
- Modify: `resources/js/pages/portfolio/index.tsx`

**Interfaces:**
- Consumes: shell, tokens, `chatIndex` route; los renderers de artifacts existentes no cambian.
- Produces: página inventario con stickers rotados, chips píldora y slot "+ siguiente pieza".

- [ ] **Step 1: Re-vestir el archivo** — cambios concretos sobre el existente:
  - Título: `<h1 className="font-display text-3xl font-black text-[var(--ink)]">{t('portfolio.title')} — {artifacts.length} piezas</h1>` (si `artifacts.length === 1`, "pieza"; usar ternario).
  - `FilterChip`: reemplazar clases por píldoras: activo `bg-[var(--ink)] text-[var(--paper)] rounded-full px-4 py-1.5 font-display text-xs font-extrabold`; inactivo `btn-soft rounded-full px-4 py-1.5 text-xs`.
  - Cada pieza del grid se envuelve: `<div className={\`${i % 2 === 0 ? 'rotate-1' : '-rotate-1'} rounded-[12px] bg-[var(--surface)] p-2 shadow-[var(--shadow-sticker)]\`}>` con el pie `«con {a.character.name}»` en `font-body text-xs text-[var(--ink-soft)]`.
  - Al final del grid, SIEMPRE, el slot:

```tsx
<Link
    href={chatIndex.url()}
    className="flex min-h-40 flex-col items-center justify-center gap-1 rounded-[12px] border-2 border-dashed border-[var(--line)] font-display text-sm font-extrabold text-[var(--ink-faint)] transition hover:border-[var(--candy)] hover:text-[var(--candy-deep)]"
>
    <Plus size={22} weight="bold" />
    siguiente pieza
</Link>
```

  con `import { Plus } from '@phosphor-icons/react';`. El estado vacío existente se re-viste igual (rounded-2xl, `--surface`, botón `btn-candy`).

- [ ] **Step 2: Verificar** — build + tests verdes; `/portafolio` con y sin piezas se ve scrapbook.

- [ ] **Step 3: Commit**

```bash
git add resources/js/pages/portfolio/index.tsx
git commit -m "feat(ui): portafolio como inventario de stickers con slot siguiente-pieza"
```

---

### Task 6: Settings-pausa y Login

**Files:**
- Modify: `resources/js/layouts/settings/*` (leer primero; el layout de settings lista las secciones — re-vestirlo como columna PAUSA con `.btn-soft`)
- Modify: `resources/js/pages/auth/login.tsx`
- Modify: `resources/js/layouts/auth-layout.tsx` (si pinta fondo retro, simplificar a papel)

**Interfaces:**
- Consumes: tokens, shell (settings ya montan `[AppLayout, SettingsLayout]` — se conserva esa cadena; los tokens re-visten AppLayout solo parcialmente y ESO ES ACEPTABLE v1: la pantalla queda cálida aunque el sidebar de AppLayout no sea perfecto).
- Produces: login "Bienvenido al taller"; settings legibles en el mundo nuevo.

- [ ] **Step 1: Login** — reemplazar el contenido visual conservando el `<Form>` de Fortify tal cual (action/método/campos/errores). Estructura nueva del contenedor:

```tsx
<div className="flex min-h-svh items-center justify-center bg-[var(--paper)] p-6" style={{ backgroundImage: 'radial-gradient(circle at 80% 10%, #ffe9c4 0%, transparent 45%)' }}>
    <div className="w-full max-w-sm rounded-2xl bg-[var(--surface)] p-8 shadow-[var(--shadow-sticker)]">
        <h1 className="font-display text-2xl font-black text-[var(--ink)]">Bienvenido al taller</h1>
        <p className="mt-1 font-body text-sm text-[var(--ink-soft)]">Entra para seguir creando.</p>
        {/* <Form> existente aquí; inputs con clase:
            rounded-[14px] bg-[var(--paper-deep)] px-4 py-3 font-body text-[15px] text-[var(--ink)]
            placeholder-[var(--ink-faint)] focus:outline-2 focus:outline-[var(--candy)]
            y el submit: btn-candy w-full py-3 text-base */}
    </div>
</div>
```

Textos "INSERT COIN"/"elige tu personaje" de `lang/es.json` (`auth.login.*`) se actualizan: `title: "Bienvenido al taller"`, `subtitle: "Entra para seguir creando."` — usar las claves existentes en vez de hardcodear si ya pasan por `t()`.

- [ ] **Step 2: Settings** — leer `resources/js/layouts/settings/` y aplicar: encabezado `— PAUSA —` (font-display text-2xl font-black, centrado), la lista de navegación de secciones como `.btn-soft` verticales con iconos Phosphor (`User`, `ShieldCheck`, `PaintRoller` para appearance), y añadir el item deshabilitado "Zona de papás · pronto" idéntico al de `pause-menu.tsx`.

- [ ] **Step 3: Verificar** — build + tests verdes (los tests de Auth usan las páginas: `php artisan test tests/Feature/Auth/` explícito). Revisar `/login` y `/settings/profile` en browser.

- [ ] **Step 4: Commit**

```bash
git add resources/js/pages/auth/login.tsx resources/js/layouts lang/es.json
git commit -m "feat(ui): login bienvenida al taller + settings como menú de pausa"
```

---

### Task 7: Barrido final y verificación

**Files:**
- Modify: `resources/views/app.blade.php` (quitar preconnect/link sobrantes si quedaron), `CLAUDE.md`
- Posible eliminación de usos: `Balatro`, `PowerOffButton`, `sfx`, `PowerupBar` (el componente), `TiltCard`/`CharacterCard` quedan (los usa la landing pausada) — NO borrar archivos compartidos, solo imports muertos en pantallas migradas.

- [ ] **Step 1: Caza de imports muertos** — `npx tsc --noEmit` y `npm run build`; eliminar imports sin uso que acusen las pantallas migradas. Verificar que ninguna pantalla migrada importe `pixelarticons` ni `components/icons/retro`:

```bash
/usr/bin/grep -rn "pixelarticons\|icons/retro" resources/js/pages/chat resources/js/pages/portfolio resources/js/pages/auth/login.tsx resources/js/components/shell resources/js/components/taller
```

Expected: sin resultados.

- [ ] **Step 2: Detector mecánico de diseño**

```bash
node /Users/vellent/.agents/skills/impeccable/scripts/detect.mjs --json resources/js/pages/chat/show.tsx resources/js/pages/chat/index.tsx resources/js/pages/portfolio/index.tsx resources/js/components/shell/app-shell.tsx resources/js/components/taller/diorama-card.tsx
```

Corregir findings mecánicos (contraste, sombras cero-offset, tracking) en un solo batch.

- [ ] **Step 3: Suite completa + smoke browser** — `php artisan test` verde; recorrer en Chrome: `/login → /chat → /chat/sor-juana (mandar mensaje) → /portafolio → settings` y capturar pantalla de cada una (desktop + móvil 390px) en UNA ronda; corregir defectos en un batch; máximo una ronda de confirmación (regla del skill de diseño).

- [ ] **Step 4: Actualizar `CLAUDE.md`** — en la sección de stack, reemplazar la línea de "Pixel-art avatars…" y añadir:

```markdown
## Mundo visual — "Scrapbook vivo"
Spec: `docs/superpowers/specs/2026-08-17-rediseno-scrapbook-design.md`. Papel cálido + stickers + botones caramelo (`.btn-candy`/`.btn-soft`); Nunito display, Outfit body. El pixel art (sprites/fondos/bustos) es ilustración enmarcada — nunca chrome de UI. Iconos: `@phosphor-icons/react` weight bold; **emojis solo para caritas de emote** (`lib/emotes.ts`). Rotaciones sticker deterministas. Shell: `components/shell/app-shell.tsx` (nav + tab bar móvil + pausa). La landing (pausada) y `/estudio` conservan el estilo viejo hasta nuevo aviso.
```

- [ ] **Step 5: Commit final**

```bash
git add -A
git commit -m "feat(ui): barrido final del rediseño scrapbook + docs"
```
