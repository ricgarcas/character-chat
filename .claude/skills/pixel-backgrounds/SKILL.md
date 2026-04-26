---
name: pixel-backgrounds
description: ACTIVATE cuando el usuario quiera generar prompts para crear backgrounds pixel-art temáticos por personaje en character-chat (los fondos del sidebar derecho del chat, donde vive el avatar). Cada personaje tiene su mundo propio (Dalí=costa catalana surrealista, Frida=Casa Azul, Beauvoir=café parisino, Freud=estudio vienés). El output del skill son prompts en inglés listos para pegar en ChatGPT/Midjourney/DALL·E — el skill NO genera imágenes ni edita código. Activar cuando el usuario diga "dame el prompt del fondo de X", "genera background para Y", "necesito el escenario de Z", o se refiera a public/backgrounds/<slug>.png.
---

# Pixel Backgrounds

Skill hermano de `pixel-avatar-prompts`. Mientras aquel emite prompts de retratos, este emite prompts de **escenarios temáticos** que viven detrás del avatar en el sidebar derecho del chat.

## Output del skill

**SOLO texto.** El skill NO toca código, NO genera imágenes, NO crea archivos. Devuelve uno o varios prompts listos para pegar. El usuario corre los prompts, descarga los PNGs y los coloca en `public/backgrounds/<slug>.png`.

## Especificaciones técnicas (constantes)

- **Aspect ratio**: vertical / portrait. El sidebar mide ~300×900 px en pantalla, así que pide `1024×1536` (vertical 2:3, lo que ChatGPT/DALL·E entrega bien).
- **Estilo**: NES/SNES 16-bit JRPG backdrop, pixel art crisp, no anti-aliasing, no gradients suaves (usa bandas escalonadas para skies si quieres degradado).
- **Composición**: el avatar del personaje (~140–160 px) flotará centrado en el tercio superior del sidebar. **DEJAR la zona central-superior con menos detalle / más cielo / atmósfera plana** para que el personaje destaque encima. La acción visual va en la parte inferior y los lados.
- **Paleta**: limitada (16–24 colores) para look retro coherente. NO uses la paleta restringida de los avatares — los backgrounds necesitan más rango cromático para skies y volumen.
- **Sin texto, sin watermarks, sin UI elements, sin personajes humanos en el bg** (el avatar es el único humano visible).

## Template (rellenar `{{...}}`)

```
Pixel art background scene for a video game UI sidebar, vertical portrait
canvas 1024×1536 (2:3 ratio). NES/SNES 16-bit JRPG backdrop style: crisp
1-pixel edges, no anti-aliasing, no soft gradients (use stepped color bands
for skies), limited 16–24 color palette, stylized retro look.

Scene: {{SCENE_DESCRIPTION}}.

Composition rule: KEEP THE UPPER-CENTER THIRD of the canvas relatively empty
or atmospherically plain (open sky, soft horizon, flat wall) — a character
portrait will be overlaid there. Push all visual detail and focal elements
toward the LOWER HALF and LEFT/RIGHT EDGES so they frame the character
without competing with it.

Iconic visual elements (must appear, distributed AROUND the empty center):
- {{ELEMENT_1}}
- {{ELEMENT_2}}
- {{ELEMENT_3}}
- {{ELEMENT_4}}

Mood: {{MOOD}}.
Time of day: {{TIME_OF_DAY}}.
Dominant palette: {{PALETTE_DESCRIPTION}}.

Hard rules:
- crisp 1-pixel edges, no anti-aliasing, no smooth gradients (banded skies only)
- 16–24 active colors maximum
- no text, no watermarks, no UI overlays, no logos
- no humans, no faces, no characters in the scene (the foreground is empty)
- vertical 2:3 portrait orientation, full bleed (no border, no frame)
- atmospheric depth via 2–3 parallax layers (foreground, midground, sky)

Negative: no anti-aliasing, no realism, no 3D shading, no photorealistic
textures, no soft blur, no painted/illustrative style, no lens flare,
no FREEPIK watermark, no signature, no border.
```

## Fichas por personaje

### Salvador Dalí (`dali`)

- SCENE_DESCRIPTION: surreal Catalan coastline at golden hour — eroded rock formations of Cap de Creus rising from a calm Mediterranean sea, distant Cadaqués village on the right cliff, a single melting clock half-buried in the rocks at the bottom-left as a subtle Dalí reference, long shadows
- ELEMENT_1: jagged eroded rock cliffs framing the left and right edges (warm ochre #c08040 + shadow #6e3a1f)
- ELEMENT_2: calm Mediterranean sea horizon line in the lower third (deep navy #1f4068 with cyan reflections)
- ELEMENT_3: a small melting pocket-watch resting on a rock at bottom-left (gold #ffb84a with shadow), tiny but visible
- ELEMENT_4: a flock of distant birds as small pixels in the sky, scattered to the right edge
- MOOD: dreamlike, theatrical, vast, slightly uncanny
- TIME_OF_DAY: late afternoon golden hour, sun low on the right
- PALETTE_DESCRIPTION: warm ochres, gold, terracotta, deep mediterranean navy, soft peach sky banded into 4 stepped colors

### Frida Kahlo (`frida`)

- SCENE_DESCRIPTION: courtyard of Casa Azul in Coyoacán — cobalt-blue adobe wall covering most of the background, lush tropical garden in the foreground with cacti and bougainvillea, papel picado banners hanging across the top
- ELEMENT_1: tall cobalt-blue adobe wall (#1565c0 base + #0d47a1 shadow) covering the upper background, with hand-painted texture (subtle pixel noise)
- ELEMENT_2: a row of green organ-pipe cacti on the lower-left corner (#2e7d32 + #1b5e20 shadow) with small white flowers
- ELEMENT_3: bright magenta and pink bougainvillea cascading from the upper-right corner over the wall (#e91e63 + #ad1457)
- ELEMENT_4: papel picado paper banners strung horizontally across the very top, in red, yellow and green, with cut-out patterns
- MOOD: warm, vibrant, alive, intimate
- TIME_OF_DAY: bright midday Mexican sun, hard shadows
- PALETTE_DESCRIPTION: cobalt blue dominant, hot magenta pink, warm green foliage, terracotta floor tiles peeking at bottom, sunlit yellow accents

### Simone de Beauvoir (`beauvoir`)

- SCENE_DESCRIPTION: interior of Café de Flore in Saint-Germain-des-Prés, Paris, viewed from a corner table — tall arched window dominating the upper-center showing Haussmann rooftops and zinc chimneys at dusk, marble round table at the very bottom with an espresso cup, an open notebook and a fountain pen, brass railings, mirrored walls
- ELEMENT_1: tall arched café window in the upper-center showing Parisian Haussmann rooftops with zinc chimneys silhouetted against dusk sky (banded sky: deep blue → lavender → soft peach)
- ELEMENT_2: white marble round bistro table edge at the very bottom (#e0e0e0 base + #9e9e9e veins) with an espresso cup, an open lined notebook and a black fountain pen resting on it
- ELEMENT_3: brass / dark wood paneling lining the side walls (#5d4037 wood + #ffb84a brass trim)
- ELEMENT_4: a single suspended pendant lamp glowing warm yellow on the upper-right edge (#ffd966 with halo)
- MOOD: contemplative, literary, warm interior against cool dusk window
- TIME_OF_DAY: late dusk / blue hour, lamp lit indoors
- PALETTE_DESCRIPTION: warm browns and brass for interior, cool dusk blues and lavender outside, single warm yellow lamp accent, white marble

### Sigmund Freud (`freud`)

- SCENE_DESCRIPTION: Freud's study at Berggasse 19, Vienna — the famous psychoanalytic couch on the lower-right covered with an oriental rug, walls lined with bookshelves full of leather-bound volumes, antiquities (small ancient figurines) on a desk, a green-shaded brass desk lamp casting warm light, a single tall window on the left with Vienna night sky outside
- ELEMENT_1: the iconic psychoanalysis couch on the lower-right edge, covered with a deep red and ochre Persian rug with intricate geometric pattern (#8e1a1a + #c98b6b + #1f4068 details)
- ELEMENT_2: dark wood bookshelves filling the left wall and the right side of the back wall, packed with leather-bound books in burgundy, forest green and dark brown, gold-stamped spines glinting (#3e2723 wood + multicolor book spines)
- ELEMENT_3: a single tall arched window in the upper-left showing Vienna night sky with a few stars and a sliver of moon over distant rooftops (deep navy #1a1a2e banded)
- ELEMENT_4: a green-shaded brass banker's desk lamp on the lower-left casting a warm yellow circle of light onto the wooden desk (#0f5132 shade + #ffb84a brass + warm light pool)
- MOOD: scholarly, intimate, slightly mysterious, sepia-warm interior
- TIME_OF_DAY: late evening, lamps lit
- PALETTE_DESCRIPTION: warm sepia and burgundy interior, deep wood browns, brass and warm lamp yellow, a single cool deep navy patch in the window for contrast

## Modificadores de mood (opcional, ajustar TIME_OF_DAY)

Si el usuario pide variantes (ej. "dame Frida nocturna"):
- `dawn`: pale gradient sky, long blue shadows, low warm sun
- `noon`: hard shadows, saturated colors, no sky banding (single flat color)
- `dusk`: banded gradient navy → lavender → peach, first stars appearing
- `night`: starfield, moon, dim warm interior light spilling out, cool blues dominant

## Cómo invocar el skill

Cuando el usuario pida un background:
1. Identifica qué personaje (`dali` / `frida` / `beauvoir` / `freud`).
2. Si pide variante de mood, sustituye TIME_OF_DAY y ajusta PALETTE_DESCRIPTION.
3. Rellena el template con la ficha + modificador.
4. Devuelve UN bloque ```...``` listo para copiar.
5. Si pide los 4, devuelve 4 bloques separados.

## Después de generar las imágenes

El usuario coloca los PNGs en:
```
public/backgrounds/dali.png
public/backgrounds/frida.png
public/backgrounds/beauvoir.png
public/backgrounds/freud.png
```

Implementación frontend pendiente (no la hagas tú desde el skill, solo emite prompts):
- Aplicar `background-image: url('/backgrounds/<slug>.png')` al `<aside>` del sidebar en `resources/js/pages/chat/show.tsx`
- Asegurar `image-rendering: pixelated` y `background-size: cover`
- Posiblemente un overlay sutil (rgba black 10–20%) para que el avatar y el texto sigan legibles

## No hacer

- NO sugerir poner el bg en `index.tsx` (la grilla de selección de personajes); este skill es solo para el sidebar de `chat/show.tsx`.
- NO usar la paleta restringida de los avatares — los backgrounds necesitan más rango.
- NO incluir personas/caras en el bg (solo el avatar es humano).
- NO devolver prompts en español.
- NO ofrecer pintar tú el background — quien lo genera es la herramienta externa.
