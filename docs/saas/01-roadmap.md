# Roadmap — De Hackathon a SaaS

> Última actualización: 2026-05-06

Cinco fases. Cada una entrega valor real; nada de "construir todo y luego lanzar".

---

## Fase 0 — Limpieza pre-SaaS · 1-2 días
- [x] Quitar i18n EN, dejar solo `es`. Limpiar `CharacterAgent::languageDirective()`, modelo `Character` (campos JSON `{en,es}` → strings), borrar `LocaleController` y middleware de locale.
- [ ] Decidir nombre/dominio definitivo (pendiente — se resuelve antes de subir a producción).
- [x] Decidir DB de producción: **MySQL** (por ahora; revisar si dolor real en escala). Local sigue SQLite para velocidad de dev.
- [ ] Configurar variables de entorno separadas (local / staging / prod).

### Lo que se hizo en Fase 0 (sesión 2026-05-06)
**Backend eliminado**: `app/Http/Middleware/SetLocale.php`, `app/Http/Controllers/LocaleController.php`, `lang/en.json`, columna `users.locale` (vía migración), tests obsoletos (`LocaleTest`, `CharacterAccessorTest`, `CharacterAgentLanguageTest`).

**Backend modificado**: `CharacterAgent::languageDirective()` lockeado a español (firma intacta para no churnar agents); `Character` model sin accessors localizados, `superpowers` sigue array cast pero con `name` plano; `HandleInertiaRequests` ya no comparte `locale`/`translations`; `bootstrap/app.php` sin middleware ni cookie de locale; `config/app.php` → `es`/`es_MX`; ruta `POST /locale` borrada de `routes/web.php`.

**Migraciones nuevas**:
- `2026_05_06_120000_flatten_character_locale_fields.php` — aplana `tagline`/`description`/`superpowers[].name` de `{en,es}` JSON a strings es-only.
- `2026_05_06_120100_drop_locale_from_users_table.php` — drop columna `users.locale`.

**Seeder**: `database/seeders/CharacterSeeder.php` reescrito sin estructura locale.

**Frontend**: `resources/js/lib/i18n.ts` simplificado — importa `lang/es.json` directo, mantiene API `useT()` estable. Eliminados: `components/locale-toggle.tsx`, `routes/locale/`, `actions/App/Http/Controllers/LocaleController.ts`. `<LocaleToggle>` retirado de `auth/login`, `auth/register`, `chat/index`, `chat/show`, `app-header`. `types/global.d.ts` sin props locale. Build OK; 43 tests verdes.

## Fase 1 — Roster + calidad · 1-2 semanas
**Antes de monetizar, el producto tiene que estar bueno.**
- [ ] Definir las 10-15 figuras finales (ver `02-roster.md`).
- [ ] Por cada personaje: agent class con voz, guardrails, 1-3 superpowers, pixel art (4 emotes) y background.
- [ ] Compartir superpowers cuando aplique (ej. "pintar tu retrato" para todos los pintores).
- [ ] QA de calidad: jugar 30+ conversaciones por personaje, ajustar prompts.
- [ ] Tests Pest para que cada agent class siga el contrato.

## Fase 2 — Infraestructura SaaS · 2-3 semanas (core)

**Orden de ataque recomendado** (no construir en paralelo — cada paso desbloquea al siguiente):

### 2.1 Usage tracking *(empezar por aquí — sin métricas todo lo demás es ciego)*
- [ ] Tabla `usage_events` (`user_id`, `type`, `character_id`, `tokens_in`, `tokens_out`, `cost_estimate`, `created_at`).
- [ ] Hook en `ChatController::send` que registre cada turno (tokens in/out + costo estimado por modelo).
- [ ] Hook en `GenerateImageJob` que registre cada imagen.
- [ ] Comando artisan / dashboard interno simple para ver gasto diario por usuario.

### 2.2 Cost guardrails *(antes de billing — protege la tarjeta de Ric)*
- [ ] Kill switch global: si Anthropic API spend del día rebasa umbral X, los chats devuelven mensaje de mantenimiento.
- [ ] Alertas Slack/email cuando un usuario individual gasta > Y en un día.
- [ ] Dashboard interno de costos diarios (puede ser simple Filament o vista privada).

### 2.3 Plans + rate limiting
- [ ] Enum `plan` en `users` (`free` / `curioso` / `erudito`).
- [ ] Middleware que cuenta uso del día contra cuota del plan y bloquea.
- [ ] Reset diario (cron) + caché Redis para conteo en caliente.

### 2.4 Paywall UI
- [ ] Modal cuando se topa límite ("se acabaron tus 10 de hoy, upgrade a Curioso").
- [ ] Página `/planes` con comparativo y CTA.
- [ ] Estados visuales en el chat: contador de mensajes restantes hoy.

### 2.5 Billing
- [ ] Laravel Cashier (Stripe) primero — mercado internacional + tarjeta MX.
- [ ] Tabla `subscriptions` (Cashier la maneja).
- [ ] Webhooks Stripe para upgrade/downgrade/cancel.
- [ ] **Después** integración MercadoPago (OXXO/SPEI/débito MX) — más complejo, dejar para cuando Stripe esté sólido.

## Fase 3 — Funnel de adquisición · 1-2 semanas
- [ ] Landing en `/` (no redirect a `/chat`): hero animado de un personaje, propuesta de valor, CTA "habla gratis con Frida".
- [ ] Onboarding sin fricción: probar Frida con 3 mensajes sin registrarse, luego "regístrate para seguir".
- [ ] Email de bienvenida + drip simple (Resend).
- [ ] Analytics: PostHog o Plausible. Funnel: registro → primer mensaje → segunda sesión (D1, D7, D30) → conversión a pago.

## Fase 4 — Lanzamiento suave · 1 semana
- [ ] Beta cerrada: 50-100 usuarios (red, AI Builders MX, Twitter).
- [ ] Iterar feedback rápido (1 sprint).
- [ ] Public launch: Product Hunt LatAm, Twitter, TikTok (clips pixel art = contenido viral natural).

## Fase 5+ — Crecer · continuo
- Más personajes (votación de comunidad).
- Features edutainment (ver `03-edutainment-features.md`): mini-games, cursos guiados, daily streak, audio/TTS, dashboard de padres.
- B2C2B escuelas como expansión natural cuando haya tracción.
