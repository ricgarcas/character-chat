# Taller + Portafolio — Diseño del pivote teen-first

> Fecha: 2026-07-10
> Estado: aprobado en brainstorming, pendiente de plan de implementación
> Complementa (y en partes reemplaza) a `docs/saas/00-vision.md` y `03-edutainment-features.md`

## Decisiones lockeadas en esta sesión

1. **Pedagogía explícita solo en marketing.** El pitch al pagador dice "tu hijo aprende a pensar y crear con IA". Dentro del producto los personajes jamás hablan de IA ni de época moderna — `guardrailBlock` queda intacto.
2. **Teens (10-16, vía padres) son la audiencia primaria.** El pagador es el papá; el usuario es el hijo. Curiosos adultos siguen siendo bienvenidos pero dejan de dirigir las decisiones de producto. Esto actualiza `00-vision.md`.
3. **Vehículo: proyectos con artefactos.** El teen crea cosas reales con los personajes (soneto, experimento mental, retrato, receta) iterando hasta que queden bien. El chat libre es el lienzo; el artefacto es el resultado.
4. **Prueba de valor para el pagador: el portafolio.** Galería de todo lo que el hijo creó. No hay dashboard de padres en v1.
5. **Seguridad vía curaduría de roster, sin capa de edad.** Se eligen figuras naturalmente aptas para teens. Única adición: protocolo de angustia de 3 líneas (ver Prompts).
6. **El MVP se redefine.** Producto primero, marketing al final. Desarrollo por sesiones iterativas personales de Ric → amigos cercanos → capa de marketing con datos reales. Semanas, no días.
7. **Camino A ahora (artefacto-primero), B después (talleres guiados), C solo cuando duela (proyectos como entidad).** Como en Lovable: lienzo libre para quien sabe qué quiere, plantillas para quien no — ambos caminos producen lo mismo por debajo. El scaffolding garantiza que B y C se monten sin tirar nada.

## El producto (MVP)

**Una línea:** un taller creativo donde teens crean cosas reales *con* maestros históricos — y cada cosa creada vive en su portafolio.

Loop:
1. Chat libre con un personaje (como hoy).
2. El personaje, por el nuevo bloque de co-creación, no complace: pregunta, exige precisión, propone e itera — mayéutica en la voz de cada quien. Aquí vive la pedagogía invisible (criterio, precisión, iteración, decisión).
3. Cuando producen algo juntos, el artefacto se guarda solo en el Portafolio.
4. El Portafolio es una galería pixel-art: prueba para el papá, orgullo del teen, semilla de compartibles virales.

**Fuera del MVP** (con hueco reservado): talleres guiados (B), proyectos multi-sesión (C), dashboard de padres, billing/planes, compartibles virales.

## Scaffolding — modelo de datos

La decisión estructural: **el artefacto es entidad de primera clase.** Todo lo demás cuelga de él.

```
artifacts
  id
  user_id          → quién lo creó
  character_id     → con qué maestro
  conversation_id  → de qué charla salió (nullable)
  type             → 'receta' | 'retrato' | 'soneto' | ... (los artifact_type actuales)
  title            → para la galería
  data             → JSON (el payload que ya construyen los tools, tal cual)
  image_path       → nullable (los generados por GenerateImageJob)
  status           → 'draft' | 'final'
  parent_id        → nullable, self-ref — cadena de iteraciones (v2; columna barata hoy)
  taller_key       → nullable — cuando llegue B, marca de qué taller salió
  timestamps
```

- `project_id` NO existe aún; C la agrega con una migración trivial cuando llegue.
- **Un solo punto de integración: `ArtifactService::persist()`.** Los tools se instancian con contexto (user, character, conversation — mismo patrón que hoy `photoPath`) y llaman al servicio dentro de `handle()`. El servicio guarda y devuelve el payload con `artifact_id`. El streaming no se toca.
- Camino B se monta encima con tres piezas: catálogo de talleres en config PHP (no DB), un bloque de prompt extra por taller, y `taller_key` en la conversación. Cero motor nuevo.
- `GenerateImageJob` actualiza `image_path` del artefacto cuando la imagen termina.

## Arquitectura de prompts

`guardrailBlock`, `languageDirective` y `stageDirectionBlock` quedan intactos. Cambios:

### Nuevo: `coCreationBlock()` (compartido en `CharacterAgent`)

Reglas, ejecutadas con el temperamento de cada personaje:

1. **Nunca entregar el artefacto terminado a la primera.** Antes de crear, 1-2 preguntas que afilen la idea (¿para quién es? ¿qué debe sentir quien lo vea?).
2. **Todo primer resultado es borrador.** Al entregarlo, el personaje señala una cosa que él cambiaría y pregunta qué cambiaría el usuario. Invita a iterar antes de dar por terminado (`status: draft → final`).
3. **El usuario decide.** Ofrecer opciones, nunca decidir por él. Elogiar la precisión cuando pide algo específico.
4. **No hace tareas, hace obras.** Si huele a "hazme el ensayo de la escuela", el personaje se niega con gracia y lo convierte en co-creación. Es el anti-"ChatGPT me hace la tarea", en persona.

### Adición a `guardrailBlock`: protocolo de angustia (3 líneas)

Si el usuario expresa autolesión, abuso o angustia real: el personaje suaviza el juego teatral, responde con calidez humana en persona, sugiere hablar con un adulto de confianza, y no juega al terapeuta ni hurga en el tema.

### Tools nuevos

Siguen el patrón `RecetaDeCoyoacan` (el modelo llena el schema, la tool arma la tarjeta) pero orientados a **crear con** el usuario: el schema incluye campos que solo pueden llenarse con lo que el usuario aportó en la conversación.

## Portafolio (frontend)

- Ruta `/portafolio`, página Inertia, entrada en el header.
- Grid pixel-art de tarjetas **reusando los 11 componentes existentes** de `resources/js/components/artifacts/` vía el mismo mapa `type → componente` del chat. Cero tarjetas nuevas.
- Filtros por personaje y tipo. Click → detalle (patrón `EaselModal`).
- Empty state con alma: "Tu taller está vacío. Frida tiene un caballete esperándote."
- En el chat: al persistir un artefacto, toast discreto "✦ Guardado en tu portafolio". Sin botón, sin fricción.
- Cada tarjeta reserva espacio para el botón compartir (compartibles virales de Fase 3 se enchufan aquí después).

## Roster teen-first

Criterios nuevos que se suman a `02-roster.md`:
- **Aptitud teen**: temas y temperamento que funcionan con un usuario de 12 años sin capa de seguridad extra.
- **Potencial de taller**: qué puede *crear* el teen con esta figura.

Estado de los 4 actuales: **Frida, Dalí y Beauvoir pasan. Freud se despriorizará** del roster destacado teen (análisis de sueños y sexualidad es justo lo que la curaduría filtra); queda disponible para el segmento adulto, no se borra.

Primeras adiciones (material ya existente en vault/repo):
- **Sor Juana** — taller poético; currículo SEP, el papá la reconoce.
- **Einstein** — experimentos mentales; `app/Tools/Einstein/` ya existe vacío.
- **Da Vinci** — cuaderno de inventos; energía maker.

Las sesiones iterativas arrancan con ~6 figuras. El resto llega cuando el loop esté validado.

## Pruebas

**Pest (código):**
- `ArtifactService` persiste y asocia user/character/conversation correctamente.
- Cada tool con artefacto crea su fila.
- `/portafolio` solo muestra artefactos del usuario autenticado.
- Test de completitud: todo `artifact_type` emitible tiene componente React en el mapa.

**QA de comportamiento (sesiones de Ric):**
Guion por personaje — checklist de 5 conductas × ~30 conversaciones:
1. ¿Preguntó antes de crear?
2. ¿Trató el primer resultado como borrador e invitó a iterar?
3. ¿Ofreció opciones en vez de decidir?
4. ¿Se negó a la tarea escolar con gracia y la convirtió en co-creación?
5. ¿El protocolo de angustia dispara con calidez sin volverse terapeuta?

Lo que falle se arregla en el prompt, no en el código.

## Impacto en docs existentes

- `docs/saas/00-vision.md` — actualizar audiencia (teens al centro) y diferenciadores (anti-tarea, portafolio).
- `docs/saas/02-roster.md` — sumar criterios teen + potencial de taller; marcar Freud.
- `docs/saas/03-edutainment-features.md` — los "cursos/rutas guiadas" se redefinen como talleres (camino B) sobre este scaffolding.
- `docs/saas/01-roadmap.md` — Fase 1 pasa a ser "roster teen-first + loop taller/portafolio"; marketing (Fase 3) se mueve al final, post sesiones iterativas.
