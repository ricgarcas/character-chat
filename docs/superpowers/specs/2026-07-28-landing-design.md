# Landing Page — Design Spec

> Fecha: 2026-07-28
> Estado: aprobado, pendiente de plan de implementación
> Contexto: `docs/saas/00-vision.md` (audiencia, pricing), `docs/saas/02-roster.md` (curaduría), `docs/superpowers/specs/2026-07-10-taller-portafolio-design.md` (loop taller/portafolio).

## Objetivo

Reemplazar el `redirect('/chat')` de `/` por una landing pública que convierta visitantes en usuarios registrados.

**Audiencia:** teen-first en el hero (10-16 años), papá convencido más abajo. El teen es quien comparte y trae tráfico orgánico; el papá se convence con scroll.

**Conversión objetivo:** click en `Empieza gratis` → `/register` → `/chat`. No hay billing ni demo sin registro; la landing no promete ninguno de los dos.

### Nota de secuencia

`docs/saas/01-roadmap.md` ubica la landing en Fase 3, "con datos, no con suposiciones". Se construye antes a propósito. La consecuencia de diseño es que **todo el copy vive en config**, no incrustado en componentes: cuando lleguen datos reales de uso, reescribirla debe costar editar un archivo PHP, no refactorizar React.

## Decisiones tomadas

| Decisión | Elección |
|---|---|
| Audiencia del hero | Teen primero; sección "para papás" más abajo |
| CTA principal | Registro → `/chat` (único flujo que hoy funciona end-to-end) |
| Precios | Sí se muestran; tiers pagados con badge `PRONTO` y botón inerte |
| Ambición visual | Escena viva: personaje animado, parallax, tilt cards, scroll-reveal |
| Roster mostrado | 3 jugables + 3 bloqueadas "próximamente"; Freud excluido |
| Prueba social | Portafolio real de artefactos co-creados, no testimonios |
| Sonido | Sin sfx en la landing |

**Freud queda fuera de la landing** por consistencia con la curaduría teen-first de `02-roster.md`. Sigue disponible en `/chat`; no se borra nada.

## Estructura de la página

Orden de scroll, fijo:

1. **Hero** — Balatro de fondo + background pixel de Frida en parallax suave; Frida animada ciclando emotes (`neutral → thinking → happy`). Titular teen-first. CTA primario `Empieza gratis`, secundario `Ya tengo cuenta`.
2. **Anti-tarea** — el diferenciador más filoso va temprano, antes del roster. Tres beats: te preguntan antes de responder / lo primero que sale es un borrador / lo terminas tú.
3. **Roster** — cartas TCG. Tres jugables (Frida, Dalí, Beauvoir) enlazan a `/chat/{slug}`; tres bloqueadas (Sor Juana, Einstein, Da Vinci) en silueta con etiqueta `PRÓXIMAMENTE`, sin enlace.
4. **Cómo funciona** — el loop del taller en cuatro pasos: pides → te sacan una mejor pregunta → borrador → iteras → queda en tu portafolio.
5. **Portafolio como prueba** — galería de artefactos reales co-creados con los personajes.
6. **Para papás** — registro visual deliberadamente más calmado que el resto (menos arcade, más aire). La pedagogía explícita, el anti-tarea como antídoto al pánico de "IA en el aula = trampa", curaduría en vez de filtros.
7. **Precios** — tres tiers según `00-vision.md`: Gratis $0, Curioso ~$99 MXN, Erudito ~$199 MXN.
8. **CTA final + footer.**

## Arquitectura

### Backend

- `Route::get('/', [LandingController::class, 'index'])->name('home')` — **pública**, sin middleware `auth`.
- Usuario autenticado que visita `/` → `redirect('/chat')`. Conserva el comportamiento actual para quien ya tiene cuenta y evita servirle marketing a un cliente.
- `LandingController@index` renderiza el componente Inertia `landing` con props:
  - `featured` — modelos `Character` cargados por los slugs de config, en el orden de config.
  - `upcoming` — arreglo de config (nombre, tagline, ruta de avatar).
  - `showcase` — arreglo de config (título, personaje, tipo, ruta de imagen).
  - `pricing` — arreglo de config (nombre, precio, features, `available: bool`).

### Config

`config/landing.php` es la única fuente de verdad editorial:

```php
return [
    'featured' => ['frida', 'dali', 'beauvoir'],
    'upcoming' => [ /* nombre, tagline, avatar */ ],
    'showcase' => [ /* título, personaje, tipo, imagen */ ],
    'pricing'  => [ /* nombre, precio, features, available */ ],
];
```

Si un slug de `featured` no existe en la DB, se omite en silencio en lugar de reventar la página — la landing nunca debe caerse por un seeder desincronizado.

### Frontend

- `resources/js/pages/landing.tsx` — solo composición: monta las secciones en orden y pasa props.
- `resources/js/components/landing/` — una sección por archivo (`hero.tsx`, `anti-tarea.tsx`, `roster.tsx`, `como-funciona.tsx`, `showcase.tsx`, `para-padres.tsx`, `pricing.tsx`, `final-cta.tsx`). Objetivo ~80-150 líneas cada uno. Ningún archivo monolítico.

## Refactor compartido

La carta TCG de `resources/js/pages/chat/index.tsx` es el mejor activo visual del producto. La landing la reusa en lugar de reimplementarla; eso requiere extraerla primero. El refactor es puro: **ningún cambio de comportamiento en `/chat`**.

Se extrae de `chat/index.tsx`:

| Nuevo archivo | Contenido |
|---|---|
| `components/tilt-card.tsx` | `TiltCard`, sin cambios |
| `components/character-card.tsx` | La carta TCG completa, con prop `variant: 'playable' \| 'locked'` |
| `lib/character-meta.ts` | `characterAccent`, `characterMeta`, `roleIcon`, `superpowerIcon` |

`chat/index.tsx` queda importando lo que hoy define. La suite actual (60 pasando, 8 skipped al 2026-07-28) es la red de seguridad del refactor.

La variante `locked` renderiza la misma silueta de carta con el avatar oscurecido y la banda inferior reemplazada por `PRÓXIMAMENTE`; no recibe handler de click.

## Movimiento y accesibilidad

- Toda animación (parallax, ciclo de emotes, scroll-reveal, tilt) se desactiva bajo `prefers-reduced-motion: reduce`. La página debe ser legible y completa sin una sola animación.
- **Sin sfx en la landing.** Los navegadores bloquean autoplay de audio sin interacción previa, y un sonido al primer scroll es hostil. Los sonidos siguen viviendo dentro del producto.
- Las cartas bloqueadas no son focusables por teclado (no son interactivas).
- Contraste de texto sobre las escenas pixeladas: capa de oscurecimiento sobre los backgrounds, como ya hace `chat/index.tsx`.

## Assets pendientes (bloqueados en Ricardo)

La sección de showcase y la imagen de compartir necesitan material que aún no existe. Ambas se construyen **data-driven contra config apuntando a `public/showcase/`**, con placeholders pixelados decentes; sustituir los PNGs llena las secciones sin tocar código.

- 4-6 artefactos reales co-creados (un retrato de Frida, un poema, un objeto surrealista de Dalí, un invento).
- `public/og.png` — imagen de compartir en redes.

## SEO

`<Head>` con título, meta description y tags Open Graph / Twitter card apuntando a `public/og.png`. La landing es la única página del producto que necesita indexarse.

## Testing

Pest feature (`tests/Feature/LandingTest.php`):

- Un invitado que visita `/` recibe 200 y el componente Inertia `landing`.
- Un usuario autenticado que visita `/` es redirigido a `/chat`.
- Los props `featured` traen exactamente los personajes de `config('landing.featured')`, en ese orden.
- Un slug de `featured` inexistente en la DB no rompe la página (200, ese personaje ausente).

Regresión: la suite existente (60 pasando, 8 skipped) debe seguir verde tras la extracción de componentes.

## Fuera de alcance

- Demo sin registro (3 mensajes con Frida sin cuenta) — Fase 3 del roadmap, requiere sesión anónima + rate limiting.
- Cualquier checkout funcional. Los tiers pagados no son clickeables.
- Landing separada `/padres` — la sección para papás vive dentro de la misma página.
- Analytics / PostHog — se instrumenta después, con el resto del funnel.
- Captura de emails / waitlist.
