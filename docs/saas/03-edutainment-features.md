# Features Edutainment — Más allá del chat

> Última actualización: 2026-07-10

> **Nota de pivote (2026-07-10):** el loop base **taller de co-creación + portafolio** ya está construido (ver spec `docs/superpowers/specs/2026-07-10-taller-portafolio-design.md` y plan `docs/superpowers/plans/2026-07-10-taller-portafolio.md`). Los "cursos / rutas guiadas" de abajo se redefinen como **talleres guiados (camino B)**: se montan sobre el scaffolding de `artifacts` (columna `taller_key` ya existe) — catálogo en config + un bloque de prompt por taller, sin motor nuevo. La pedagogía de colaborar-con-IA es transversal (invisible en producto, explícita en marketing), no un curso aparte de "AI literacy".

## Tesis
**El chat solo es contenido, no aprendizaje.** Para que padres y curiosos paguen $99-199 MXN/mes en LatAm, necesitamos justificación emocional + retención + diferenciación clara vs. ChatGPT/Character.AI.

Las features se dividen en 4 ejes:

1. **Retención** (que vuelvan mañana)
2. **Aprendizaje** (que sientan que ganan algo)
3. **Diferenciación** (que no sea ChatGPT con disfraz)
4. **Adquisición viral** (que traigan amigos solos)

---

## ⭐ Top 4 — Las que más mueven la aguja

### 1. Daily quest / Racha · RETENCIÓN
Modelo Duolingo, adaptado:
- Cada día un personaje rota como "anfitrión del día" con una pregunta-anzuelo: *"Frida tiene una pregunta para ti hoy"*.
- Push/email a las 9am (configurable).
- Streak counter visible. Romper la racha duele (sunk-cost emocional).
- Premio simbólico: badge de constancia, desbloqueo temporal de personaje "vip".

**Por qué funciona**: convierte uso esporádico en hábito → LTV se dispara → tier pagado se siente justificado.

### 2. Cursos / Rutas guiadas · APRENDIZAJE
En vez de chat libre, "rutas" estructuradas de 5-10 conversaciones sobre un tema.
- *"Frida te enseña sobre el surrealismo mexicano"* (5 sesiones).
- *"Beauvoir y los cimientos del feminismo"* (8 sesiones).
- *"Einstein: del fotón a la relatividad"* (10 sesiones).
- Cada sesión: chat con objetivo + checkpoint (mini-quiz o reflexión escrita) + takeaway visual (pixel art card compartible).

**Por qué funciona**: lo que justifica que un papá pague. "Mi hija está tomando un curso con Beauvoir" suena mil veces mejor que "mi hija chatea con un bot".

### 3. Mini-games por personaje (vibe-coded) · DIFERENCIACIÓN
Pequeños juegos JS embebidos en el chat, en estilo pixel art consistente. **Esta es la feature que hace al producto único**.

Ideas iniciales:
- **Frida** — *Completa el autorretrato*: rellena los píxeles correctos de un cuadro famoso. Cada acierto, ella reacciona.
- **Dalí** — *Sueño paranoico-crítico*: arrastra elementos surrealistas (relojes, elefantes, hormigas) a un escenario; él interpreta lo que creaste.
- **Da Vinci** — *Sketchbook*: dibujas en grid, él "anota" en su cuaderno qué invento podrías estar perfilando.
- **Einstein** — *Carrera de fotones*: timing puzzle de relatividad simplificada.
- **Sor Juana** — *Versifica*: completa una redondilla con la palabra correcta, ella reacciona con humor culteranista.
- **Borges** — *Laberinto*: navega un grid-maze con bifurcaciones; cada ruta es un cuento corto.
- **Newton** — *Cae la manzana*: física básica, ajustar gravedad para acertar trayectorias.
- **Sócrates** — *Diálogo socrático*: él te hace preguntas, tú escoges respuestas; te lleva a contradecirte (mayéutica gamificada).

**Implementación**: canvas/p5.js o React simple, pixel art con la misma paleta. Cada juego es ~200-500 líneas JS. Vibe-codeable en una tarde por juego.

**Por qué funciona**: ChatGPT no puede replicar esto. Es la "moat" lúdica.

### 4. Compartibles virales · ADQUISICIÓN
Cada conversación memorable / cuadro generado / partida de mini-juego puede convertirse en una "card" compartible:
- Pixel art frame con la cita o imagen.
- Marca de agua sutil con dominio.
- Optimizada para vertical (TikTok/Reels) y cuadrado (Insta/Twitter).
- Botón "compartir" visible siempre.

**Por qué funciona**: pixel art + frase histórica + estética nostálgica = formato muy compartible. Adquisición orgánica casi gratis.

---

## Tier 2 — Importantes pero no urgentes

### Cuaderno / Diario del usuario
Repositorio personal de:
- Citas memorables que el usuario "guardó".
- Cuadros / imágenes que generó.
- Scores de mini-juegos.
- Conversaciones favoritas marcadas.

Genera sentimiento de progreso y "patrimonio digital" que cuesta abandonar (otro lock-in suave).

### Multi-character: el aula virtual
Sienta a 2-3 personajes a debatir entre ellos sobre un tema que tú propones.
- *"Marx y Beauvoir: ¿es posible emancipación femenina sin emancipación de clase?"*
- Súper compartible.
- Feature premium (caro de generar — cada turno son 2-3 llamadas de Opus). **Solo Erudito**.

### Audio / TTS por personaje
Cada figura con voz distintiva (ElevenLabs).
- Accesibilidad (niños, gente mayor, multitarea).
- Feature ALTA conversión emocional, pero costo $$$.
- Cuota mensual estricta incluso en Erudito.

### Dashboard de padres
Para cuentas familiares: papá ve qué temas exploró el hijo, cuántas sesiones, qué cursos completó.
- Justifica la suscripción ante el pagador.
- Solo en plan **Familiar** (futuro tier $299 MXN para 4 perfiles).

### Logros / Badges
- "Conociste a 5 filósofos"
- "20 conversaciones con Frida"
- "Maestro del surrealismo" (completaste curso Dalí)
- Dopamina barata, alta retención.

### Foto integrada (ya iniciado)
`GenerateImageJob` ya existe. Expandir:
- Subes selfie → personaje "te pinta" en su estilo.
- Skill `paint-my-photo` ya documentado en memoria.
- Excelente compartible viral.

---

## Tier 3 — Largo plazo / experimentación

- **Suscripción regalo** (tarjeta digital para regalar 3 meses).
- **Modo "salón de clase"**: profesor crea código, alumnos entran y trabajan ruta guiada con seguimiento. Esto es el caballo de Troya hacia escuelas en año 2-3.
- **API pública** para creadores de contenido educativo.
- **AR / cámara**: personaje aparece en tu cuarto vía cámara del cel.
- **Integración con podcasts**: cada episodio de un podcast histórico desbloquea conversación con esa figura.

---

## Priorización para Fase 1-2

Si pudiéramos meter **una sola** feature edutainment al MVP de pago, sería **Daily quest / racha** — la que más afecta retención y por tanto LTV. Sin retención, los demás features no importan.

Orden recomendado:
1. **Daily quest** (Fase 2, mete cuotas de uso de paso)
2. **Compartibles virales** (Fase 3, alimenta el funnel orgánico)
3. **1-2 mini-games piloto** (Fase 4, prueba el formato con beta users)
4. **Curso guiado piloto** (1 ruta de prueba, post-launch)
5. Multi-character / TTS / Dashboard padres → solo después de validar retención.

---

## Notas / preguntas abiertas
- ¿Vale la pena un tier "Familiar" desde día 1, o es complicación innecesaria?
- ¿Los mini-games los hacemos in-house o abrimos un programa de "creadores" que aporten juegos verificados?
- ¿Qué tanto invertir en producción de cursos? Cada uno requiere guion + QA pesado.
