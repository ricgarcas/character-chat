# Rediseño "Scrapbook vivo" — Design Spec

> Fecha: 2026-08-17
> Estado: aprobado en sesión de brainstorming visual (Ric + Mavi, companion con mockups sobre assets reales de Sor Juana)
> Reemplaza el mundo visual retro/8-bit del hackathon en toda la app autenticada.

## 1. La decisión

**Qué muere:** el chrome retro — Press Start 2P/VT323, bordes pixel, marcos de gabinete arcade, fondo espiral, chat-terminal, "INSERT COIN", `pixelarticons` como sistema de iconos. La UI ya no finge ser un videojuego de 8 bits.

**Qué vive:** el pixel art de los personajes (sprites, fondos, bustos del Estudio) como **ilustración enmarcada** — contenido, nunca sistema de UI. La escena Phaser (DioramaScene, emotes, ambient) se conserva intacta dentro del nuevo marco.

**La identidad nueva — "Scrapbook vivo":** el cuaderno de un teen. Base de papel cálido, elementos "pegados" (cinta, rotaciones ligeras, stickers), botones caramelo táctiles que se hunden al presionar, y celebración explícita cuando una pieza entra a la colección. Estructura de webapp (nav, grids, URLs, tipografía legible); vestuario de cuaderno, no de consola.

Decisiones de layout ya lockeadas en sesión: **B** (diorama izquierda + conversación protagonista), superpowers como **menú de movimientos bajo el diorama**, **nav superior delgada** (tab bar inferior en móvil).

## 2. Tokens del mundo visual

Reemplazan el bloque retro de `resources/css/app.css`. Un solo tema (cálido claro); dark mode fuera de alcance v1.

```css
/* Papel y tinta */
--paper: #f9f3e6;          /* fondo de app */
--paper-deep: #f1e7d0;     /* zonas hundidas (input, wells) */
--surface: #ffffff;        /* tarjetas y burbujas */
--ink: #3a2c14;            /* texto principal */
--ink-soft: #8a7a5e;       /* secundario — NUNCA gris frío */
--ink-faint: #b3a488;      /* placeholders */
--line: #ecdfc0;           /* bordes/sombra táctil suave */

/* Caramelo (acción primaria) */
--candy: #ff9f43;
--candy-deep: #d97e20;     /* sombra dura inferior */
--candy-ink: #4a2c00;      /* texto sobre caramelo */

/* Sombras */
--shadow-tactile: 0 3px 0 var(--line);           /* tarjetas/inputs */
--shadow-candy: 0 4px 0 var(--candy-deep);       /* botones primarios */
--shadow-sticker: 0 8px 18px rgba(90,66,20,.18); /* elementos "pegados" */
--shadow-diorama: 0 10px 24px rgba(90,66,20,.25);
```

- **Auras por personaje** (se conservan los actuales, funcionan sobre crema): `--accent-frida #ff5252`, `--accent-dali #ffb84a`, `--accent-beauvoir #8e7cc3`, `--accent-freud #a47148`, `--accent-sor-juana #d9a441`. El aura pinta: nombre del personaje en burbujas, borde/glow sutil del diorama, y un `radial-gradient` tenue de ambiente en la esquina superior de la pantalla del taller.
- **Radios:** tarjeta/burbuja 14px, botón 12px, píldora (input, chips) 20px, diorama 14px. Nada cuadrado, nada circular salvo avatares.
- **Rotaciones sticker:** ±1.5° a ±4°, **deterministas por componente** (el artifact card siempre 1.5°, el sticker de emote siempre 4°) — nunca aleatorias, para que la UI no "baile" entre renders.
- **Tipografía:** display y botones `Nunito` (800/900, redonda y gorda); cuerpo `Outfit` (400/600). Google Fonts reemplaza a Press Start 2P/VT323 en `app.blade.php` y `app.css`. `--font-display` pasa a Nunito para no tocar cada componente.
- **Iconografía:** `@phosphor-icons/react`, peso `bold`, tamaño base 20. **Emojis SOLO para caritas de emote**: 😐 neutral · 😊 happy · 🤔 thinking · 😮 surprised. Todo lo demás (enviar, borrar, ajustes, portafolio, candado, flechas) es Phosphor. `pixelarticons` y `components/icons/retro` se retiran de las pantallas rediseñadas.

## 3. Shell y navegación

- Componente nuevo `AppShellScrapbook` (`resources/js/components/shell/`): nav superior delgada sobre `--paper` — logo "muni" (Nunito 900, tinta), links `Personajes` y `Portafolio ✦n` (contador de artifacts, píldora con `Sparkle` de Phosphor), y menú de avatar a la derecha que abre el **menú de pausa** (settings + salir).
- **Móvil (<768px):** la nav se vuelve tab bar inferior con iconos Phosphor (`ChatCircle`, `UsersThree`, `Package`), etiquetas cortas.
- El layout de `app.tsx` monta este shell en chat, personajes, portafolio y settings. Login queda standalone. Estudio (interno) no se toca.

## 4. Pantallas

### 4.1 Taller (chat) — `resources/js/pages/chat/show.tsx`
- Contenido con `max-width: 1200px` centrado. Dos columnas: diorama 32% / conversación resto. Móvil: diorama arriba colapsable a banda.
- **DioramaCard** (componente nuevo): la escena Phaser dentro de marco redondeado 14px con `--shadow-diorama`, "cinta" semitransparente arriba-centro (pseudo-elemento), rotación -1.5°. **Sticker de emote** en esquina inferior derecha: píldora blanca con el emoji de la carita + etiqueta ("😊 contenta"), rota 4°, se actualiza con el emote parseado.
- La **acotación de escena** (`---ESCENA---`) va debajo del diorama como caption manuscrita (Outfit italic, `--ink-soft`), ya no dentro del hilo.
- **Movimientos** (superpowers): grid 2×2 bajo el caption. Botón caramelo el primario del personaje, blancos los demás; icono Phosphor por superpower (mapa nuevo en `character-meta.ts` sustituyendo pixelarticons), `--shadow-candy`/`--shadow-tactile`, y al presionar `translateY(2px)` + sombra a 1px (el "hundimiento" táctil). Disparan el mismo `handlePowerup` de hoy.
- **Conversación:** burbujas — personaje: `--surface`, radio 14px con esquina inferior-izquierda 4px, nombre en su aura; usuario: ámbar claro (`#ffe3b3`), esquina inferior-derecha 4px, alineada derecha con margen izquierdo 22%. Tipografía Outfit 15px/1.6. Sin scanlines, sin monospace.
- **ArtifactCard sticker:** cuando un artifact se persiste, la carta aparece en el hilo — `--surface`, borde 2px dashed `#ecca8a`, rotación 1.5°, `--shadow-sticker`, título + "✦ ¡Nueva pieza en tu colección!" en `--candy-deep`. **Celebración:** una ráfaga breve de confetti (librería `canvas-confetti`, colores del aura + caramelo) UNA vez por artifact, omitida si `useReducedMotion`.
- **Input:** píldora blanca 20px con `--shadow-tactile`, botón enviar caramelo cuadrado-redondeado con `PaperPlaneRight` (Phosphor).

### 4.2 Personajes — `chat/index` (selección de jugador)
- Grid de cartas scrapbook: busto (`avatars/<slug>/neutral.png`, `image-rendering: pixelated`) en marco blanco con cinta, nombre Nunito 900, chip de rol en el aura, rotaciones alternadas ±2°.
- Figuras del roster aún no construidas: carta bloqueada con silueta `?` y `Lock` de Phosphor — la colección incompleta genera deseo. (Deriva de `LockedCharacterCard`, re-vestida.)

### 4.3 Portafolio — inventario
- Encabezado "Tu colección — n piezas". Grid de piezas como stickers (rotaciones alternadas), cada una con el chip del personaje co-autor. Filtro por personaje con chips píldora.
- Último slot: tarjeta punteada "+ siguiente pieza" que linkea a Personajes.

### 4.4 Settings — menú de pausa
- Las pantallas de settings existentes (Fortify) se re-visten: se montan dentro del shell con una columna centrada de opciones tipo move-button (Mi cuenta, Contraseña, 2FA, Salir), título "— PAUSA —" en Nunito 900. Los formularios internos solo cambian tokens (heredan del css), no estructura.
- Entrada "Zona de papás" visible pero deshabilitada con chip "pronto" (puerta al dashboard parental futuro).

### 4.5 Login
- Muere "INSERT COIN". Tarjeta blanca centrada sobre papel con glow ámbar tenue, "Bienvenido al taller" (Nunito 900), campos píldora, botón caramelo. Sin registro (pausado).

## 5. Motion y accesibilidad

- Press táctil en TODO botón caramelo/blanco: `transform: translateY(2px)` + sombra reducida, 80ms ease-out.
- Confetti solo al guardar artifact; entrada de burbujas con fade+4px rise; el sticker de emote hace un "pop" (scale 1.06→1) al cambiar de carita. Todo respeta `useReducedMotion` (hook existente).
- Contraste: `--ink` sobre `--paper` ≈ 9:1; `--ink-soft` sobre `--paper` ≥ 4.5:1; verificar `--candy-ink` sobre `--candy`.
- Focus rings: 2px `--candy` offset 2px, global.

## 6. Fuera de alcance v1

- Landing pública (pausada) y Estudio (herramienta interna, se queda retro-funcional).
- Dark mode, sonido/sfx, dashboard parental real.
- Cambios al motor Phaser (solo se re-enmarca; el fix de escala del sprite `heightRatio` va aparte y ya está en curso).

## 7. Orden de implementación sugerido

1. Tokens + fuentes + dependencias (`@phosphor-icons/react`, `canvas-confetti`) — el css nuevo con compat mínima para no romper pantallas aún no migradas.
2. Shell + nav + menú de pausa.
3. Taller completo (DioramaCard, movimientos, burbujas, artifact sticker + confetti, input).
4. Personajes + Portafolio.
5. Settings re-vestidos + Login.
6. Barrido final: retirar Press Start 2P/VT323, pixelarticons e iconos retro de las pantallas migradas; smoke browser.
