# Roster — Curaduría de Personajes

> Última actualización: 2026-07-10
> Estado: pendiente de curar · criterios teen-first añadidos

## Criterio de selección
1. **Reconocimiento universal** en el mundo hispanohablante.
2. **Voz distintiva** que se pueda capturar en prompts (no genérica).
3. **Diversidad temática**: arte, ciencia, filosofía, literatura, historia LatAm.
4. **Diversidad demográfica**: género, geografía, época.
5. **Material disponible**: cartas, ensayos, biografías que permitan voz fiel.
6. **Aptitud teen** *(nuevo)*: temas y temperamento que funcionan con un usuario de 10-16 sin capa de seguridad extra. La seguridad se resuelve por curaduría, no por filtros.
7. **Potencial de taller** *(nuevo)*: ¿qué puede *crear* el teen con esta figura? (poema, experimento mental, invento, retrato, interpretación).

## Ya construidos (4)
- Frida Kahlo — teen-first ✓
- Salvador Dalí — teen-first ✓
- Simone de Beauvoir — teen-first ✓
- Sigmund Freud — **despriorizado del roster destacado teen** (análisis de sueños y sexualidad infantil es justo lo que la curaduría filtra). Se mantiene disponible para el segmento adulto; no se borra.

## Próximas adiciones (teen-first, material ya en vault/repo)
- **Sor Juana Inés de la Cruz** — taller poético; además currículo SEP, el papá la reconoce.
- **Albert Einstein** — experimentos mentales; `app/Tools/Einstein/` ya existe (vacío, esperándolo).
- **Leonardo da Vinci** — cuaderno de inventos; energía maker.

> Las sesiones iterativas arrancan con ~6 figuras; el resto llega cuando el loop taller/portafolio esté validado.

## Candidatos a curar (lluvia inicial — para filtrar a 6-11 más)

### Arte
- Leonardo da Vinci
- Pablo Picasso
- Van Gogh
- Diego Rivera
- Remedios Varo
- Sor Juana Inés de la Cruz (también literatura)

### Ciencia
- Albert Einstein (tools ya iniciados en `app/Tools/Einstein/`)
- Marie Curie
- Charles Darwin
- Isaac Newton
- Stephen Hawking
- Hipatia de Alejandría

### Filosofía
- Sócrates
- Friedrich Nietzsche
- Immanuel Kant
- Hannah Arendt
- Karl Marx

### Literatura
- Jorge Luis Borges
- Miguel de Cervantes
- Gabriel García Márquez
- Octavio Paz
- William Shakespeare

### Historia LatAm
- Simón Bolívar
- Benito Juárez
- José Martí
- Eva Perón
- Emiliano Zapata

## Pendiente
- [ ] Sesión de curaduría conjunta para elegir 10-15 finales con balance temático.
- [ ] Por cada uno: ficha de voz + 1-3 superpowers.
- [ ] Generar pixel art (4 emotes c/u) — usar skill `pixel-avatar-prompts`.
- [ ] Generar background — usar skill `pixel-backgrounds`.
- [ ] Construir agent class siguiendo patrón de `FridaAgent`.
