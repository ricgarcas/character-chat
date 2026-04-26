# Character Chat

> Talk to historical figures. They don't break character — and they think harder when you do.

Built for the **[Built with 4.7 Hackathon](https://cerebralvalley.ai/e/built-with-4-7-hackathon/)** (Cerebral Valley × Anthropic, April 2026).

Pixel-art conversations with **Frida Kahlo**, **Sigmund Freud**, **Simone de Beauvoir** and **Salvador Dalí**, powered by **Claude Opus 4.7** with adaptive extended thinking.

---

## What it does

Pick a character. Chat with them. They reply in-persona, in your language (EN/ES), with a pixel-art emote that matches their reaction (neutral / happy / thinking / surprised) and a tiny stage direction describing the scene.

- **Frida** paints from pain in the Casa Azul.
- **Freud** lights a cigar in his Vienna study and asks about your mother.
- **Beauvoir** sips coffee in a Paris café and dismantles your assumptions about freedom.
- **Dalí** dissolves the conversation into a melting Catalan beach.

Ask any of them about Python. They will refuse — beautifully, in character.

---

## The Opus 4.7 angle: **Adaptive Extended Thinking**

Most "chat with a character" demos either don't use extended thinking at all, or burn a giant thinking budget on every message regardless of context. Both feel wrong:

- **No thinking** → philosophical questions get reflex answers that feel shallow.
- **Always-on thinking** → "hola" makes the model spend 6,000 tokens deliberating before saying hi.

We classify each user turn into a tier and scale Opus 4.7's `thinking.budget_tokens` accordingly:

| Tier | When | `budget_tokens` |
|---|---|---|
| `reflex` | short, casual, no deep cues | **disabled** (fast, cheap) |
| `considered` | medium prompt or one strong cue | **2,000** |
| `deep` | ≥2 deep keywords, >280 chars, or ≥3 question marks | **6,000** |

So "hola Frida" is instant. "¿Qué significa el sufrimiento en el arte? ¿Por qué crear desde el dolor?" makes Frida actually think before she answers — and you can feel it in the depth of the reply.

The implementation is a single method: [`adaptiveThinking()` in `app/Agents/CharacterAgent.php`](app/Agents/CharacterAgent.php). Flowing into Laravel AI SDK's `providerOptions()` for `Lab::Anthropic`:

```php
$options['thinking'] = [
    'type' => 'enabled',
    'budget_tokens' => $thinking['budget'],
];
$options['temperature'] = 1.0; // required when thinking is on
```

### Why it matters
- **Latency where it counts.** Casual chat stays snappy.
- **Depth where it counts.** Philosophical / emotional questions get the full Opus 4.7 reasoning treatment.
- **Cost-aware.** No wasted thinking tokens on greetings.
- **Character-coherent.** The model uses thinking *internally* to consider the persona's biography, era, and worldview before producing the actual reply — which arrives still bookended by stage direction + emote tag.

---

## Stack

- **Backend:** Laravel 13, PHP 8.4
- **AI:** [`laravel/ai`](https://github.com/laravel/ai) SDK (Anthropic provider), `claude-opus-4-7`
- **Frontend:** Inertia v3 + React 19 + Tailwind v4
- **Streaming:** SSE via `Agent::stream()`
- **Memory:** `RemembersConversations` trait (one persistent conversation per user × character)
- **Auth:** Laravel Fortify
- **Art:** Hand-prompted pixel-art avatars (4 emotes per character) and per-character backgrounds

---

## Repo layout

```
app/
├── Agents/
│   ├── CharacterAgent.php      # base — adaptiveThinking(), guardrails, stage directions
│   ├── FridaAgent.php
│   ├── FreudAgent.php
│   ├── BeauvoirAgent.php
│   └── DaliAgent.php
├── Http/Controllers/
│   └── ChatController.php      # SSE streaming endpoint
└── Models/Character.php        # ->agent($photoPath, $userMessage)

database/seeders/CharacterSeeder.php  # canonical character data + Opus 4.7 model

public/
├── avatars/<slug>/{neutral,happy,thinking,surprised}.png
└── backgrounds/<slug>.png

resources/js/pages/chat/show.tsx       # parses ---EMOTE--- markers, swaps avatar
```

---

## Run it locally

```bash
composer install
npm install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
echo "ANTHROPIC_API_KEY=sk-ant-..." >> .env
composer run dev
```

Served by Laravel Herd at `https://character-chat.test`.

---

## License

MIT. The pixel-art avatars are project-specific and not licensed for reuse.
