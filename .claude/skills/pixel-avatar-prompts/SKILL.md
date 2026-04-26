---
name: pixel-avatar-prompts
description: ACTIVATE cuando el usuario quiera generar prompts para crear avatares pixel-art de los personajes de character-chat usando una herramienta de IA externa (ChatGPT, Midjourney, DALL·E, Recraft, SDXL pixel models, etc). Cubre los 4 emotes canónicos (neutral, happy, thinking, surprised) por personaje. El output del skill son prompts en inglés listos para pegar — el skill NO genera imágenes ni edita código, solo emite texto. Activar cuando el usuario diga "dame el prompt para X", "genera prompts de los emotes", "crea las caras de Y", "necesito un prompt pixel art para Z", o se refiera a public/avatars/<slug>/<emote>.png. Los PNGs resultantes se guardan manualmente en public/avatars/<slug>/{neutral,happy,thinking,surprised}.png con resolución 64×96.
---

# Pixel Avatar Prompts

Skill para emitir prompts en inglés que generen avatares pixel-art de los personajes de **character-chat** en herramientas externas (ChatGPT/DALL·E, Midjourney, Recraft, SDXL pixel models).

## Output del skill

**SOLO texto.** El skill NO toca código, NO genera imágenes, NO crea archivos. Devuelve uno o varios prompts listos para pegar en el chat de la IA generadora. El usuario corre los prompts, descarga los PNGs y los coloca en `public/avatars/<slug>/<emote>.png`.

## Emotes canónicos (4)

| Key | Cómo se lee en la cara |
|---|---|
| `neutral` | mirada al frente, boca recta, expresión base |
| `happy` | sonrisa visible, ojos arqueados o entornados |
| `thinking` | una ceja levantada, mirada al lado o arriba, dedo cerca del mentón opcional |
| `surprised` | ojos muy abiertos, boca redonda abierta, cejas arriba |

## Especificaciones técnicas (constantes en TODOS los prompts)

- **Lienzo**: 64 px ancho × 96 px alto, formato retrato vertical
- **Estilo**: NES/SNES cross-stitch pixel art, crisp 1-pixel edges, no anti-aliasing, no gradients, no dithering
- **Encuadre**: bust-up frontal, cabeza centrada, hombros y prenda visibles
- **Fondo**: transparente
- **Paleta**: limitada a 16 colores (lista abajo)
- **Sombreado**: 2 tonos por superficie (base + sombra)

### Paleta de 16 colores (NO añadir colores nuevos)

```
#000000 #1a1a2e #e6e6fa #ffffff #ff5252 #ffb84a #ffd966 #a47148
#5b3a1f #8e7cc3 #4a3859 #3aa9ff #1f4068 #5cb85c #f6c1b1 #c98b6b
```

## Template de prompt (rellenar bloques `{{...}}`)

```
Pixel art portrait of {{CHARACTER_NAME}}, 64×96 vertical canvas, NES/SNES
cross-stitch style, strict 16-color limited palette. Bust-up frontal view,
transparent background.

Iconic features (must be visible at first glance):
- {{ICONIC_FEATURE_1}}
- {{ICONIC_FEATURE_2}}
- {{ICONIC_FEATURE_3}}

Face: {{SKIN_DESCRIPTION}}. {{EYEBROWS}}. {{NOSE}}.
{{MOUTH_FOR_THIS_EMOTE}}.

Outfit: {{GARMENT}}.

Emotion to express ({{EMOTE_KEY}}): {{EMOTION_INSTRUCTIONS}}.

Palette (exact 16 colors, do not introduce new ones):
#000000 #1a1a2e #e6e6fa #ffffff #ff5252 #ffb84a #ffd966 #a47148
#5b3a1f #8e7cc3 #4a3859 #3aa9ff #1f4068 #5cb85c #f6c1b1 #c98b6b

Hard rules:
- crisp 1-pixel edges, no anti-aliasing, no gradients, no dithering
- portrait orientation, head occupies upper 50%, shoulders/jacket fill lower 50%
- neck connects head to shoulders (no floating gap)
- maximum 6–7 active colors total
- 2-tone shading: skin base + skin shadow, hair base + hair highlight
- transparent background outside the figure

Negative: {{NEGATIVE_LIST}}, no painted background, no anti-aliasing,
no 3D shading, no realism, no extra accessories not listed above.
```

## Fichas de personaje (rellenar el template)

### Salvador Dalí (`dali`)

- ICONIC_FEATURE_1: long thin gold mustache curling sharply upward at the tips like antennas (#ffb84a)
- ICONIC_FEATURE_2: wide open eyes with white sclera, small black pupils centered, single highlight pixel
- ICONIC_FEATURE_3: slick short black hair, high uncovered forehead, brown highlight on top
- SKIN_DESCRIPTION: light skin (#f6c1b1) with #c98b6b shadow on right cheek and under chin
- EYEBROWS: thin arched black eyebrows
- NOSE: subtle nose shadow ridge centered
- MOUTH_FOR_THIS_EMOTE (varía por emote — ver abajo)
- GARMENT: solid black formal jacket on shoulders, small red bowtie at the collar with a black knot
- NEGATIVE_LIST: no glasses, no beret, no hat, no facial hair other than the gold curled mustache

### Frida Kahlo (`frida`)

- ICONIC_FEATURE_1: thick dark unibrow connecting both eyebrows (#5b3a1f)
- ICONIC_FEATURE_2: bright red flower crown on top of head (#ff5252 with #5cb85c green leaves)
- ICONIC_FEATURE_3: black hair parted in the middle, falling on both sides
- SKIN_DESCRIPTION: medium skin (#c98b6b) with #a47148 shadow
- EYEBROWS: the unibrow IS the eyebrow line
- NOSE: small centered shadow
- MOUTH_FOR_THIS_EMOTE (varía)
- GARMENT: white embroidered blouse with red and green floral details on collar
- NEGATIVE_LIST: no Western dress, no glasses, no hat replacing the flower crown

### Simone de Beauvoir (`beauvoir`)

- ICONIC_FEATURE_1: tall lilac turban-style updo covering the top of the head (#8e7cc3 with #4a3859 shadow)
- ICONIC_FEATURE_2: serene almond eyes, black pupils, subtle eyeliner
- ICONIC_FEATURE_3: small gold dangling earrings (#ffb84a)
- SKIN_DESCRIPTION: light skin (#f6c1b1) with #c98b6b shadow
- EYEBROWS: thin brown arched (#5b3a1f)
- NOSE: subtle straight ridge
- MOUTH_FOR_THIS_EMOTE (varía)
- GARMENT: dark navy blouse with white collar peeking
- NEGATIVE_LIST: no hair visible (turban covers it all), no glasses, no jewelry beyond earrings

### Sigmund Freud (`freud`)

- ICONIC_FEATURE_1: round wire-rim gold glasses (#ffb84a circles with thin bridge)
- ICONIC_FEATURE_2: full short gray-brown beard covering jaw and upper lip (#a47148 base + #5b3a1f shadow)
- ICONIC_FEATURE_3: short receding gray hair (#a47148 with #5b3a1f shadow)
- SKIN_DESCRIPTION: light skin (#f6c1b1) with #c98b6b shadow on the small visible cheek area above the beard
- EYEBROWS: thick gray-brown straight (#5b3a1f)
- NOSE: shadow ridge above mustache area
- MOUTH_FOR_THIS_EMOTE: mostly hidden by beard — interpret emotion via eyes and brows
- GARMENT: dark navy three-piece suit, white collar, dark tie
- NEGATIVE_LIST: no hat, no cigar in mouth (keep mouth area clean), no modern glasses

## Modificadores por emote (sustituir `MOUTH_FOR_THIS_EMOTE` y `EMOTION_INSTRUCTIONS`)

### `neutral`
- MOUTH: a small straight horizontal line in skin-shadow tone, no smile
- EMOTION_INSTRUCTIONS: calm baseline expression, looking forward, no tension in face

### `happy`
- MOUTH: visible smile curving upward, lips slightly parted, optional tooth highlight in white
- EMOTION_INSTRUCTIONS: clear positive expression, eyes slightly arched/squinted with joy, cheeks lifted (sombra mejilla más marcada)

### `thinking`
- MOUTH: closed mouth with one corner slightly higher than the other (pensive smirk)
- EMOTION_INSTRUCTIONS: one eyebrow raised higher than the other (asymmetry), gaze drifting up-left or up-right, fingers near chin if visible without breaking the frame

### `surprised`
- MOUTH: small round open "O" shape in dark tone
- EMOTION_INSTRUCTIONS: eyes wide open with extra sclera visible, both eyebrows raised high, slight cheek lift

## Cómo invocar el skill

Cuando el usuario pida prompts:
1. Pregunta qué personaje y qué emote(s) si no es claro.
2. Rellena el template con la ficha del personaje + el modificador del emote.
3. Devuelve el bloque ```...``` listo para copiar.
4. Si pide los 4 a la vez, devuelve 4 bloques separados (uno por emote) — NO uno consolidado, las herramientas de IA generan mejor con prompts atómicos.

## Después de generar las imágenes

El usuario debe colocar los PNGs en:
```
public/avatars/<slug>/neutral.png
public/avatars/<slug>/happy.png
public/avatars/<slug>/thinking.png
public/avatars/<slug>/surprised.png
```

El componente `resources/js/components/pixel-avatar.tsx` los renderiza con `image-rendering: pixelated`. Si falta un emote, hace fallback a `neutral.png`.

## No hacer

- NO ofrecer pintar el avatar tú mismo (Claude/Mavi). Tu trabajo es el prompt; quien genera la imagen es la herramienta externa.
- NO inventar fichas para personajes que no estén listados arriba sin pedir al usuario los rasgos icónicos primero.
- NO devolver prompts en español (las IAs de imagen funcionan mejor en inglés).
- NO añadir colores fuera de la paleta de 16, ni siquiera "muy parecidos".
