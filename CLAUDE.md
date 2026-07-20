# Character Chat — Project Notes

Pixel-art chat with historical figures (Frida Kahlo, Sigmund Freud, Simone de Beauvoir, Salvador Dalí). Born at the **Built with 4.7 Hackathon** (Cerebral Valley, April 2026), now being turned into a Spanish-language **edutainment SaaS for teens** (co-creation *taller* + *portafolio*).

> **Product/business docs live in `docs/`, not here:**
> - `docs/saas/` — vision, roadmap, roster curation, feature backlog, locked decisions (audience, pricing, payments, prod DB).
> - `docs/superpowers/specs/2026-07-10-taller-portafolio-design.md` — design spec for the teen-first pivot.
> - `docs/superpowers/plans/2026-07-10-taller-portafolio.md` — TDD implementation plan.
>
> This file documents **how the code works**; those docs cover **where the product is going**. The app is Spanish-only.

## Stack
- Laravel 13 + Inertia v3 + React 19 + Tailwind v4
- `laravel/ai` SDK with Anthropic provider
- **Model is tier-based, not version-pinned.** `App\Enums\ChatModel` has three cases — `Haiku`, `Sonnet`, `Opus` — each mapping to whatever the current latest release is (`claude-sonnet-5`, `claude-opus-4-8`, ...). Bump a version by editing `modelId()` in that enum only; nothing else needs to change. `CHAT_MODEL` (`config/chat.php`, default `sonnet`) picks the default tier for reflex/considered turns; `CharacterAgent::model()` always escalates `deep`-tier turns to `Opus` regardless of that setting. All tiers use adaptive thinking.
- SSE streaming via `Agent::stream()`; conversation persistence via `RemembersConversations`
- Pixel-art avatars (`public/avatars/<slug>/{neutral,happy,thinking,surprised}.png`) + per-character backgrounds (`public/backgrounds/<slug>.png`)

## Adaptive Extended Thinking
Each character is a `CharacterAgent` (see `app/Agents/CharacterAgent.php`). `adaptiveThinking()` classifies the incoming message into a tier and maps it to an Anthropic **effort** level; `providerOptions()` then sends `thinking => ['type' => 'adaptive']` + `output_config => ['effort' => ...]` (temperature forced to `1.0`, which adaptive thinking requires):

| Tier | Trigger | `effort` | Model |
|---|---|---|---|
| `reflex` | `<60` chars, ≤1 question mark, no deep keywords | `low` | `Sonnet` (default tier) |
| `considered` | medium length or one strong cue (default) | `medium` | `Sonnet` (default tier) |
| `deep` | ≥2 deep keywords, >280 chars, or ≥3 question marks | `high` | `Opus` (forced) |

`reflex` keeps small talk fast and cheap on Sonnet. `deep` both raises thinking effort *and* escalates to Opus, so philosophical questions ("¿qué es el sufrimiento en el arte?") get the smartest model, not just more tokens from the default one.

## Character pipeline
1. `Character::agent($photoPath, $userMessage)` instantiates the right agent subclass.
2. `CharacterAgent::instructions()` (per character) + shared blocks:
   - `guardrailBlock` — stay in-persona, refuse modern/tech topics.
   - `coCreationBlock` — **taller de co-creación**: the character acts as a workshop master, not a vending machine (ask sharpening questions, treat first output as a draft, invite iteration). Includes the **anti-tarea** rule: refuse school assignments in-persona and redirect to co-creating something original.
   - `languageDirective` — locks every response (and stage directions) to **Spanish**, preserving proper nouns.
   - `stageDirectionBlock` — theatrical scene + emote tag.
3. Responses always begin with:
   ```
   ---ESCENA---
   <stage direction>
   ---FIN_ESCENA---
   ---EMOTE: neutral|happy|thinking|surprised---
   ```
   The frontend parses these markers to swap the avatar emote.

## Artifacts & portfolio (teen-first loop)
Everything a teen co-creates is a first-class **artifact**, so the *taller* has a lasting output.
- `app/Models/Artifact.php` + `database/migrations/2026_07_10_000001_create_artifacts_table.php`.
- `app/Services/ArtifactService.php` persists artifacts from tool results at the end of each chat turn. Image artifacts start `image_pending` and are resolved by `GenerateImageJob` (via `job_id`).
- `/portafolio` (`PortfolioController@index`, `resources/js/pages/portfolio/index.tsx`) is the pixel-art gallery of everything the teen made.

## Per-character tools
Characters expose their own `laravel/ai` tools under `app/Tools/<Character>/` — e.g. `Frida/{RetratoFrida,LeerteLaCara,RecetaDeCoyoacan}`, `Dali/{RetratoDali,PintarSurreal,MetodoParanoicoCritico}`, `Freud/{RostroInconsciente,AnalisisSueno,MecanismosDefensa}`. Image tools go through `app/Services/ImageGeneration`.

## Where things live
- Agents: `app/Agents/{Frida,Freud,Beauvoir,Dali}Agent.php` (shared base: `CharacterAgent.php`)
- Model enum: `app/Enums/ChatModel.php` · chat config: `config/chat.php`
- Chat controller: `app/Http/Controllers/ChatController.php` (`send` streams SSE)
- Portfolio controller: `app/Http/Controllers/PortfolioController.php`
- Artifacts: `app/Models/Artifact.php`, `app/Services/ArtifactService.php`
- Per-character tools: `app/Tools/<Character>/`
- React pages: `resources/js/pages/chat/show.tsx`, `resources/js/pages/portfolio/index.tsx`
- Routes: `routes/web.php`
- Seeder (canonical character data): `database/seeders/CharacterSeeder.php`
