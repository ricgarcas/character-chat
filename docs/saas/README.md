# SaaS Planning — Character Chat

Plan vivo para convertir el proyecto de hackathon en un SaaS de edutainment hispanohablante.

## Documentos
1. [`00-vision.md`](./00-vision.md) — audiencia, posicionamiento, pricing, diferenciadores
2. [`01-roadmap.md`](./01-roadmap.md) — 5 fases de Hackathon → SaaS lanzado
3. [`02-roster.md`](./02-roster.md) — curaduría de personajes (10-15 finales)
4. [`03-edutainment-features.md`](./03-edutainment-features.md) — features más allá del chat

## Decisiones lockeadas
- **Audiencia**: B2C edutainment teen-first (padre paga, hijo 10-16 usa), no escuelas en v1.
- **Pedagogía**: colaborar-con-IA (criterio, no "prompt engineering") — explícita en marketing, invisible en producto. Ver spec `docs/superpowers/specs/2026-07-10-taller-portafolio-design.md`.
- **Vehículo**: taller de co-creación + portafolio (loop base ya construido).
- **Seguridad**: por curaduría de roster + protocolo de angustia, sin capa de edad.
- **Proceso**: producto primero (sesiones iterativas Ric → amigos), marketing al final con datos.
- **Idioma**: español-only (mercado: MX + LatAm + España).
- **Catálogo**: curado, 10-15 figuras al lanzar, sin UGC.
- **Pricing**: Gratis (10 msg/día) · Curioso $99 MXN · Erudito $199 MXN.
- **Pagos**: Stripe + MercadoPago (OXXO/SPEI/débito).
- **DB producción**: MySQL.

## Decisiones pendientes
- Nombre/dominio definitivo (antes de prod).
- Lista final de los 6-11 personajes a sumar a los 4 existentes.
- ¿Tier "Familiar" desde día 1?
- ¿Qué mini-game pilotar primero?
