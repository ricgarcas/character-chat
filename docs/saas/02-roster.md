# Roster — Curaduría de Personajes

> Última actualización: 2026-08-17
> Estado: **LOCKED — 14 figuras** (sesión de curaduría Ric + Mavi). Cambios al roster requieren decisión explícita, no se agrega/quita al vuelo.

## Criterio de selección
1. **Reconocimiento universal** en el mundo hispanohablante.
2. **Voz distintiva** que se pueda capturar en prompts (no genérica).
3. **Diversidad temática**: arte, ciencia, filosofía, literatura, historia LatAm.
4. **Diversidad demográfica**: género, geografía, época.
5. **Material disponible**: cartas, ensayos, biografías que permitan voz fiel.
6. **Aptitud teen**: temas y temperamento que funcionan con un usuario de 10-16 sin capa de seguridad extra. La seguridad se resuelve por curaduría, no por filtros.
7. **Potencial de taller**: ¿qué puede *crear* el teen con esta figura?

## El roster final (14)

### Ola 1 — construidos (4)

| Figura | Dominio | Taller | Nota |
|---|---|---|---|
| Frida Kahlo | Arte MX | Retratos, leer tu cara, receta de Coyoacán | teen-first ✓ |
| Salvador Dalí | Arte surrealista | Pintar surreal, método paranoico-crítico | teen-first ✓ |
| Simone de Beauvoir | Filosofía | Ensayo, argumentos | teen-first ✓ |
| Sigmund Freud | Psicología | Análisis de sueños, mecanismos de defensa | **Solo segmento adulto** — despriorizado del roster destacado teen; no se borra |

### Ola 2 — siguientes (3)

| Figura | Dominio | Taller | Argumento |
|---|---|---|---|
| **Sor Juana Inés de la Cruz** | Letras / poesía barroca | Taller poético: soneto, ingenio, rima | Currículo SEP, el papá la reconoce; mujer, MX |
| **Albert Einstein** | Ciencia | Experimentos mentales | `app/Tools/Einstein/` ya existe esperándolo |
| **Leonardo da Vinci** | Arte + ciencia | Cuaderno de inventos | Energía maker; el más teen de todos |

### Ola 3 — cierre del roster (7)

| Figura | Dominio | Taller | Argumento |
|---|---|---|---|
| **Nezahualcóyotl** | Poesía / filosofía náhuatl + ingeniería | Flor y canto (verso libre, lo efímero, naturaleza) + diseña tu invento hidráulico | Billete de 100, SEP; raíz prehispánica; taller doble único (crossover natural con Da Vinci); cero carga de conquista |
| **Sócrates** | Filosofía | Diálogo socrático, torneo de preguntas | La encarnación del anti-tarea: no da respuestas, interroga |
| **Marie Curie** | Ciencia | Diseñar experimentos, bitácora de laboratorio | Mujer en ciencia, reconocimiento universal |
| **Charles Darwin** | Ciencia | Expedición naturalista: observar, clasificar, hipotetizar | A los 10-13 les encantan los animales; taller fortísimo |
| **Van Gogh** | Arte | Pintar emociones, cartas a Theo | Resonancia emocional teen enorme; el protocolo de angustia aquí brilla |
| **Miguel de Cervantes** | Literatura | Inventar personajes y aventuras | Taller de historias; español-first de nacimiento; más seguro que García Márquez (estate vivo) |
| **Benito Juárez** | Historia MX | Debates, "¿qué harías tú?", derecho y justicia | El papá mexicano lo venera; ancla SEP de historia |

**Balance:** 4 arte · 3 ciencia · 3 filosofía · 3 letras/poesía · 1 historia — 5 mujeres de 14 — 5 figuras MX/hispanas (Frida, Sor Juana, Neza, Juárez, Cervantes) + Dalí.

### Diferenciación de overlaps
- **Sor Juana vs Nezahualcóyotl** (ambos poesía): ella = soneto barroco, ingenio, rima; él = verso libre, filosofía de lo efímero, naturaleza. Registros opuestos.
- **Da Vinci vs Nezahualcóyotl** (ambos inventos): Da Vinci = máquinas, anatomía, vuelo; Neza = ingeniería hidráulica y urbana. Crossover potencial, no redundancia.
- **Frida vs Van Gogh vs Dalí** (pintores): retrato emocional MX / color y emoción cruda / surrealismo y provocación.

## Descartados y por qué
- **Diego Rivera** — redundante con Frida en dominio (posible invitado futuro; sinergia con proyecto Rivera Capitolini).
- **Picasso** — Dalí ya cubre esa energía.
- **Nietzsche, Kant, Marx** — no teen-safe o demasiado densos a los 12.
- **Borges, Octavio Paz** — demasiado cerebrales para 10-16.
- **Shakespeare** — producto español-first; Cervantes cubre.
- **García Márquez** — estate vivo y litigioso; Cervantes es la jugada segura.
- **Hipatia, Remedios Varo** — el papá no las reconoce (criterio 1).
- **Bolívar, Zapata, Eva Perón** — Juárez cubre historia con menos carga política.
- **Moctezuma, Cuauhtémoc** — sin taller y su arco es la caída de Tenochtitlan; **Malinche** — post-contacto y campo minado; **Pacal, Tlacaélel** — sin reconocimiento del papá.

## Pendiente por figura (Olas 2 y 3 — 10 figuras)
- [ ] Ficha de voz + 1-3 superpowers.
- [ ] Agent class siguiendo patrón de `FridaAgent` + tests Pest del contrato.
- [ ] Pixel art: 4 emotes (`public/avatars/<slug>/`) — skill `pixel-avatar-prompts`.
- [ ] Background (`public/backgrounds/<slug>.png`) — skill `pixel-backgrounds`.
- [ ] Seeder actualizado.
- [ ] QA: 30+ conversaciones de Ric contra checklist de co-creación.

> La generación y gestión de assets se moverá al sistema de multimedia (en diseño — ver specs futuros en `docs/superpowers/specs/`).
