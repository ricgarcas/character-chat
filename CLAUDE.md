# Character Chat — Project Notes

Pixel-art chat with historical figures (Frida Kahlo, Sigmund Freud, Simone de Beauvoir, Salvador Dalí). Built for the **Built with 4.7 Hackathon** (Cerebral Valley, April 2026).

## Stack
- Laravel 13 + Inertia v3 + React 19 + Tailwind v4
- `laravel/ai` SDK with Anthropic provider, model **`claude-opus-4-7`**
- SSE streaming via `Agent::stream()`; conversation persistence via `RemembersConversations`
- Pixel-art avatars (`public/avatars/<slug>/{neutral,happy,thinking,surprised}.png`) + per-character backgrounds (`public/backgrounds/<slug>.png`)

## Opus 4.7 — Adaptive Extended Thinking
Each character is a `CharacterAgent` (see `app/Agents/CharacterAgent.php`). The agent's `providerOptions()` reads the user's incoming message and routes it through `adaptiveThinking()`, which classifies the prompt into three tiers:

| Tier | Trigger | `thinking.budget_tokens` |
|---|---|---|
| `reflex` | short, casual, no philosophical keywords | disabled |
| `considered` | medium length or one strong cue | 2000 |
| `deep` | ≥2 deep keywords, >280 chars, or ≥3 question marks | 6000 |

`reflex` keeps small talk fast and cheap. `deep` unlocks Opus 4.7's extended thinking so philosophical questions ("¿qué es el sufrimiento en el arte?") get a genuinely considered answer instead of a reflex one. When thinking is enabled, `temperature` is forced to `1.0` and `max_tokens` is bumped to fit the budget.

## Character pipeline
1. `Character::agent($photoPath, $userMessage)` instantiates the right agent subclass.
2. `CharacterAgent::instructions()` (per character) + shared blocks: `guardrailBlock` (stay in-persona, refuse modern/tech topics), `languageDirective` (locale-aware EN/ES), `stageDirectionBlock` (theatrical scene + emote tag).
3. Responses always begin with:
   ```
   ---ESCENA---
   <stage direction>
   ---FIN_ESCENA---
   ---EMOTE: neutral|happy|thinking|surprised---
   ```
   The frontend parses these markers to swap the avatar emote.

## Where things live
- Agents: `app/Agents/{Frida,Freud,Beauvoir,Dali}Agent.php`
- Controller: `app/Http/Controllers/ChatController.php` (`send` streams SSE)
- React chat page: `resources/js/pages/chat/show.tsx`
- Seeder (canonical character data): `database/seeders/CharacterSeeder.php`

---

