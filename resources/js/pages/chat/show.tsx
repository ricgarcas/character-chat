import { Head, router, usePage } from '@inertiajs/react';
import { useEcho } from '@laravel/echo-react';
import { send } from '@/routes/chat';
import type { Artifact, Character, ChatMessage, EmoteKey } from '@/types/chat';
import { FormEvent, useEffect, useRef, useState } from 'react';
import {
    ArrowLeft,
    Send,
    Potion as CookingPot,
    Eye,
    Moon,
    Lightbulb as Brain,
    Scale as Scales,
    BookOpen,
    Shield,
} from 'pixelarticons/react';
import {
    Notebook as ScrollText,
    X,
    PaintBrush,
    Egg,
    VenusSymbol as GenderFemale,
} from '@/components/icons/retro';
import PixelAvatar from '@/components/pixel-avatar';
import ArtifactCard from '@/components/artifacts/ArtifactCard';
import ToolBadge, { infoTypeFromToolName } from '@/components/artifacts/ToolBadge';
import PowerupBar, { type Powerup } from '@/components/PowerupBar';
import PowerupModal from '@/components/PowerupModal';
import { useT } from '@/lib/i18n';
import { LocaleToggle } from '@/components/locale-toggle';
import { debugLog } from '@/lib/debug-log';
import { Reload as Trash } from 'pixelarticons/react';
import Balatro from '@/components/Balatro';
import { MarkdownMessage } from '@/components/chat/markdown-message';

interface Props {
    character: Character;
    conversation: string | null;
    messages: ChatMessage[];
}

interface DisplayMessage extends ChatMessage {
    escena?: string | null;
    emote?: EmoteKey | null;
}

function tryParseArtifact(raw: string): Artifact | null {
    try {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object' && 'artifact_type' in parsed && 'data' in parsed) {
            return parsed as Artifact;
        }
    } catch {
        // not JSON
    }
    return null;
}

const characterAccent: Record<string, string> = {
    dali: 'var(--accent-dali)',
    freud: 'var(--accent-freud)',
    frida: 'var(--accent-frida)',
    beauvoir: 'var(--accent-beauvoir)',
};

const characterAccentInk: Record<string, string> = {
    dali: 'var(--bg)',
    freud: 'var(--ink)',
    frida: 'var(--ink)',
    beauvoir: 'var(--ink)',
};

const VALID_EMOTES: ReadonlyArray<EmoteKey> = ['neutral', 'happy', 'thinking', 'surprised'];

function parseStageDirection(text: string): { escena: string | null; emote: EmoteKey | null; dialogo: string } {
    const sceneRegex = /---ESCENA---([\s\S]*?)---FIN_ESCENA---/i;
    const emoteRegex = /---EMOTE:\s*(\w+)\s*---/i;
    const orphanStart = /---ESCENA---/gi;
    const orphanEnd = /---FIN_ESCENA---/gi;

    let escena: string | null = null;
    const sceneMatch = text.match(sceneRegex);
    if (sceneMatch) {
        escena = sceneMatch[1].trim().replace(/^[*"'_~]+|[*"'_~]+$/g, '').trim();
        if (escena === '') escena = null;
    }

    let emote: EmoteKey | null = null;
    const emoteMatch = text.match(emoteRegex);
    if (emoteMatch) {
        const candidate = emoteMatch[1].toLowerCase() as EmoteKey;
        if (VALID_EMOTES.includes(candidate)) {
            emote = candidate;
        }
    }

    // Streaming buffer: if an ESCENA block has opened but not closed yet, hide
    // everything from ---ESCENA--- onward so the description doesn't leak into
    // the dialog box until the scene completes on the next tick.
    const hasOpen = /---ESCENA---/i.test(text);
    const hasClose = /---FIN_ESCENA---/i.test(text);
    let working = text;
    if (hasOpen && !hasClose) {
        working = working.replace(/---ESCENA---[\s\S]*$/i, '');
    }

    let dialogo = working
        .replace(sceneRegex, '')
        .replace(orphanStart, '')
        .replace(orphanEnd, '')
        .replace(/---EMOTE:\s*\w+\s*---/gi, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim();

    // Also buffer a trailing partial marker (e.g. "---", "---EMOTE: hap") so
    // half-streamed tags don't flash in the dialog box.
    dialogo = dialogo.replace(/-{2,}[A-Z_]*:?\s*\w*\s*-*$/i, '').trimEnd();

    return { escena, emote, dialogo };
}

function hydrateMessages(msgs: ChatMessage[]): DisplayMessage[] {
    return msgs.map((msg) => {
        if (msg.role !== 'assistant') return msg;
        const { escena, emote, dialogo } = parseStageDirection(msg.content);
        return {
            ...msg,
            content: dialogo || msg.content,
            escena,
            emote,
        };
    });
}

export default function ChatShow({ character, conversation, messages: initialMessages }: Props) {
    const t = useT();
    const page = usePage<{ auth: { user: { id: number } | null } }>();
    const userId = page.props.auth?.user?.id ?? null;
    const [messages, setMessages] = useState<DisplayMessage[]>(() => hydrateMessages(initialMessages));
    const [input, setInput] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const [streamingContent, setStreamingContent] = useState('');
    const [streamingArtifacts, setStreamingArtifacts] = useState<Artifact[]>([]);
    const [streamingToolName, setStreamingToolName] = useState<string | null>(null);
    const [conversationId, setConversationId] = useState<string | null>(conversation);
    const [moodPulse, setMoodPulse] = useState(0);
    const [historyOpen, setHistoryOpen] = useState(false);
    const [pendingImage, setPendingImage] = useState<File | null>(null);
    const [pendingImagePreview, setPendingImagePreview] = useState<string | null>(null);
    const [pendingIntent, setPendingIntent] = useState<string | null>(null);
    const [activePowerup, setActivePowerup] = useState<Powerup | null>(null);
    const [clearOpen, setClearOpen] = useState(false);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const accent = characterAccent[character.slug] ?? 'var(--ink)';
    const accentInk = characterAccentInk[character.slug] ?? 'var(--ink)';

    useEffect(() => { inputRef.current?.focus(); }, []);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                router.visit('/chat');
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    useEcho<{
        job_id: string;
        kind: 'portrait' | 'painting';
        title: string;
        image_url: string | null;
        error: string | null;
    }>(
        userId ? `chat.user.${userId}` : '',
        'ImageReady',
        (payload) => {
            const swap = (artifact: Artifact): Artifact => {
                if (artifact.artifact_type !== 'image_pending') return artifact;
                if (artifact.data.job_id !== payload.job_id) return artifact;
                if (payload.error || !payload.image_url) {
                    return {
                        artifact_type: 'image_pending',
                        data: { ...artifact.data, error: payload.error ?? 'unknown error' },
                    };
                }
                return {
                    artifact_type: payload.kind,
                    data: { title: payload.title, image_url: payload.image_url },
                } as Artifact;
            };
            setMessages((prev) =>
                prev.map((m) =>
                    m.artifacts ? { ...m, artifacts: m.artifacts.map(swap) } : m,
                ),
            );
            setStreamingArtifacts((prev) => prev.map(swap));
        },
        [userId],
    );

    const parsed = parseStageDirection(streamingContent);
    const streamingEscena = parsed.escena;
    const streamingEmote = parsed.emote;
    const streamingDialogo = parsed.dialogo;

    const lastAssistant = [...messages].reverse().find((m) => m.role === 'assistant');
    const lastUser = [...messages].reverse().find((m) => m.role === 'user');

    const lastEmote: EmoteKey =
        streamingToolName ? 'thinking' :
        streamingEmote ??
        lastAssistant?.emote ??
        'neutral';

    const currentEscena = isStreaming ? streamingEscena : lastAssistant?.escena ?? null;
    const currentDialog = isStreaming ? streamingDialogo : lastAssistant?.content ?? null;

    useEffect(() => {
        setMoodPulse((p) => p + 1);
    }, [lastEmote]);

    const handleFileSelect = (file: File | null) => {
        if (!file) return;
        if (!file.type.startsWith('image/')) return;
        if (file.size > 8 * 1024 * 1024) return;
        if (pendingImagePreview) URL.revokeObjectURL(pendingImagePreview);
        setPendingImage(file);
        setPendingImagePreview(URL.createObjectURL(file));
        if (pendingIntent) {
            setInput(pendingIntent);
            setPendingIntent(null);
            setTimeout(() => inputRef.current?.focus(), 0);
        }
    };

    const handlePowerup = (p: Powerup) => {
        setActivePowerup(p);
    };

    const acceptPowerup = async () => {
        if (!activePowerup) return;
        const p = activePowerup;
        if (p.requiresPhoto && !pendingImage) return;
        const imageToSend = p.requiresPhoto ? pendingImage : null;
        const previewUrl = pendingImagePreview;
        setActivePowerup(null);
        if (p.requiresPhoto) {
            setPendingImage(null);
            setPendingImagePreview(null);
            }
        await sendMessage(p.prompt, imageToSend, { previewUrl, hideUserBubble: true });
    };

    const POWERUP_ICON_PROPS = { width: 22, height: 22 };

    const pw = (slug: string, key: string) => ({
        label: t(`powerup.${slug}.${key}.label`),
        description: t(`powerup.${slug}.${key}.description`),
        prompt: t(`powerup.${slug}.${key}.prompt`),
    });

    const POWERUPS_BY_CHARACTER: Record<string, Powerup[]> = {
        frida: [
            {
                key: 'receta',
                icon: <CookingPot {...POWERUP_ICON_PROPS} />,
                ...pw('frida', 'receta'),
                requiresPhoto: false,
            },
            {
                key: 'cara',
                icon: <Eye {...POWERUP_ICON_PROPS} />,
                ...pw('frida', 'cara'),
                requiresPhoto: true,
            },
            {
                key: 'retrato',
                icon: <PaintBrush {...POWERUP_ICON_PROPS} />,
                ...pw('frida', 'retrato'),
                requiresPhoto: true,
            },
        ],
        dali: [
            {
                key: 'paranoide',
                icon: <Brain {...POWERUP_ICON_PROPS} />,
                ...pw('dali', 'paranoide'),
                requiresPhoto: false,
            },
            {
                key: 'huevo',
                icon: <Egg {...POWERUP_ICON_PROPS} />,
                ...pw('dali', 'huevo'),
                requiresPhoto: false,
            },
            {
                key: 'retrato',
                icon: <PaintBrush {...POWERUP_ICON_PROPS} />,
                ...pw('dali', 'retrato'),
                requiresPhoto: true,
            },
        ],
        beauvoir: [
            {
                key: 'analiza',
                icon: <Scales {...POWERUP_ICON_PROPS} />,
                ...pw('beauvoir', 'analiza'),
                requiresPhoto: false,
            },
            {
                key: 'critica',
                icon: <GenderFemale {...POWERUP_ICON_PROPS} />,
                ...pw('beauvoir', 'critica'),
                requiresPhoto: false,
            },
            {
                key: 'lectura',
                icon: <BookOpen {...POWERUP_ICON_PROPS} />,
                ...pw('beauvoir', 'lectura'),
                requiresPhoto: false,
            },
        ],
        freud: [
            {
                key: 'sueno',
                icon: <Moon {...POWERUP_ICON_PROPS} />,
                ...pw('freud', 'sueno'),
                requiresPhoto: false,
            },
            {
                key: 'defensas',
                icon: <Shield {...POWERUP_ICON_PROPS} />,
                ...pw('freud', 'defensas'),
                requiresPhoto: false,
            },
            {
                key: 'rostro',
                icon: <Eye {...POWERUP_ICON_PROPS} />,
                ...pw('freud', 'rostro'),
                requiresPhoto: true,
            },
        ],
    };

    const characterPowerups = POWERUPS_BY_CHARACTER[character.slug] ?? [];
    const showPowerups = characterPowerups.length > 0;

    const clearPendingImage = () => {
        if (pendingImagePreview) URL.revokeObjectURL(pendingImagePreview);
        setPendingImage(null);
        setPendingImagePreview(null);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const message = input.trim();
        if (!message || isStreaming) return;

        const imageToSend = pendingImage;
        const previewUrl = pendingImagePreview;
        setInput('');
        setPendingImage(null);
        setPendingImagePreview(null);
        await sendMessage(message, imageToSend, { previewUrl });
    };

    const sendMessage = async (
        message: string,
        imageToSend: File | null,
        opts: { previewUrl?: string | null; hideUserBubble?: boolean } = {},
    ) => {
        if (isStreaming) return;

        if (!opts.hideUserBubble) {
            const userMsg: DisplayMessage = {
                id: `temp-${Date.now()}`,
                role: 'user',
                content: message,
                image_url: opts.previewUrl ?? null,
                created_at: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, userMsg]);
        }
        setIsStreaming(true);
        setStreamingContent('');
        setStreamingArtifacts([]);
        setStreamingToolName(null);

        try {
            const url = send.url(character.slug);
            const csrfToken = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';

            const formData = new FormData();
            formData.append('message', message);
            if (conversationId) formData.append('conversation_id', conversationId);
            if (imageToSend) formData.append('image', imageToSend);

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': csrfToken,
                    Accept: 'text/event-stream',
                },
                body: formData,
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let fullContent = '';
            const collectedArtifacts: Artifact[] = [];

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });
                    const lines = chunk.split('\n');

                    for (const line of lines) {
                        if (!line.startsWith('data: ')) continue;
                        const data = line.slice(6);
                        if (data === '[DONE]') continue;

                        try {
                            const event = JSON.parse(data);
                            if (event.type === 'text' || event.type === 'text_delta') {
                                fullContent += event.text ?? event.delta ?? '';
                                setStreamingContent(fullContent);
                            }
                            if (event.type === 'tool_call') {
                                setStreamingToolName(event.tool_name ?? null);
                            }
                            if (event.type === 'tool_result' && typeof event.result === 'string') {
                                const artifact = tryParseArtifact(event.result);
                                if (artifact) {
                                    collectedArtifacts.push(artifact);
                                    setStreamingArtifacts([...collectedArtifacts]);
                                }
                                setStreamingToolName(null);
                            }
                            if (event.conversation_id && !conversationId) {
                                setConversationId(event.conversation_id);
                                window.history.replaceState(
                                    {},
                                    '',
                                    `/chat/${character.slug}/${event.conversation_id}`,
                                );
                            }
                        } catch {
                            fullContent += data;
                            setStreamingContent(fullContent);
                        }
                    }
                }
            }

            const final = parseStageDirection(fullContent);
            const dialogoText = final.dialogo || fullContent;

            debugLog('chat.turn', `assistant reply for ${character.slug}`, {
                user_message: message,
                raw_content: fullContent,
                parsed_escena: final.escena,
                parsed_emote: final.emote,
                parsed_dialogo: final.dialogo,
                fallback_used: !final.dialogo,
                artifacts: collectedArtifacts.map((a) => ({ type: (a as { artifact_type?: string }).artifact_type })),
            });

            if (dialogoText || collectedArtifacts.length > 0) {
                setMessages((prev) => [
                    ...prev,
                    {
                        id: `assistant-${Date.now()}`,
                        role: 'assistant',
                        content: dialogoText,
                        escena: final.escena,
                        emote: final.emote,
                        artifacts: collectedArtifacts.length > 0 ? collectedArtifacts : undefined,
                        created_at: new Date().toISOString(),
                    },
                ]);
            }
        } catch (err) {
            console.error('Stream error:', err);
            debugLog('chat.error', `stream error for ${character.slug}`, {
                user_message: message,
                error: err instanceof Error ? { name: err.name, message: err.message, stack: err.stack } : String(err),
            });
            setMessages((prev) => [
                ...prev,
                {
                    id: `error-${Date.now()}`,
                    role: 'assistant',
                    content: t('chat.show.error_retry'),
                    created_at: new Date().toISOString(),
                },
            ]);
        } finally {
            setIsStreaming(false);
            setStreamingContent('');
            setStreamingArtifacts([]);
            setStreamingToolName(null);
            inputRef.current?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <>
            <Head title={`> CHAT // ${character.name}`} />

            <LocaleToggle fixed accent={accent} />

            <div className="relative min-h-screen flex items-center justify-center px-4 py-12 sm:px-6 sm:py-16">
                <div className="fixed inset-0 z-0">
                    <Balatro
                        spinRotation={0}
                        spinSpeed={2}
                        color1="#bfc7c4"
                        color2="#828587"
                        color3="#0e0e0e"
                        contrast={5.5}
                        lighting={0.4}
                        spinAmount={0.45}
                        pixelFilter={500}
                    />
                    <div className="absolute inset-0 bg-black/80" />
                </div>
                <div className="relative z-10 w-full flex items-center justify-center">
                <div
                    className="relative flex w-full max-w-lg flex-col overflow-hidden"
                    style={{
                        height: 'min(85vh, 960px)',
                        backgroundColor: 'var(--bg-deep)',
                        border: '3px solid var(--ink)',
                        boxShadow: `0 0 0 2px var(--bg-deep), 8px 8px 0 0 ${accent}`,
                    }}
                >
                    {/* TOP BAR */}
                    <div className="flex items-center justify-between border-b-2 border-[var(--ink)] bg-[var(--bg)] px-4 py-2 z-10">
                        <a
                            href="/chat"
                            className="flex items-center gap-1.5 font-display text-[10px] uppercase tracking-widest text-[var(--ink-faint)] transition hover:text-[var(--ink)]"
                        >
                            <ArrowLeft className="h-3 w-3" />
                            {t('chat.show.back')}
                        </a>
                        <h1
                            className="font-display text-[11px] sm:text-xs uppercase font-bold tracking-[0.2em] px-3 py-1 border-2 border-[var(--ink)]"
                            style={{
                                backgroundColor: accent,
                                color: 'var(--bg)',
                                boxShadow: '2px 2px 0 0 var(--ink)',
                            }}
                        >
                            {character.name}
                        </h1>
                        {messages.length > 0 ? (
                            <button
                                onClick={() => setHistoryOpen(true)}
                                className="flex items-center gap-1.5 border-2 border-[var(--ink)] bg-[var(--bg-deep)] px-2.5 py-1 font-display text-[9px] uppercase tracking-widest text-[var(--ink)] transition hover:translate-y-[-1px]"
                                style={{ boxShadow: `2px 2px 0 0 ${accent}` }}
                            >
                                <ScrollText className="h-3 w-3" />
                                {t('chat.show.log')} · {messages.length}
                            </button>
                        ) : (
                            <span className="w-10" />
                        )}
                    </div>

                    {/* SCENE — fixed height so dialog/artifacts scroll independently */}
                    <div
                        className="relative flex h-[420px] flex-shrink-0 flex-col items-center justify-end overflow-hidden"
                        style={{
                            backgroundImage: `url(/backgrounds/${character.slug}.png)`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center bottom',
                            imageRendering: 'pixelated',
                        }}
                    >
                        {/* Bottom-up dissolve */}
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[var(--bg-deep)] via-black/40 to-transparent" />

                        {/* Acotación ribbon — top-center */}
                        {currentEscena && (
                            <div className="animate-fade-in-up absolute top-4 left-1/2 z-10 w-[90%] max-w-xl -translate-x-1/2">
                                <div className="acotacion-bar px-4 py-2">
                                    <p className="text-center font-body text-base leading-[1.05] italic text-[var(--ink)]">
                                        ~ {currentEscena} ~
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Character */}
                        <div
                            key={moodPulse}
                            className="animate-mood-bounce relative z-0"
                        >
                            <div className="animate-idle-wiggle">
                                <PixelAvatar character={character} emote={lastEmote} size={340} />
                            </div>
                        </div>

                        {/* POWER-UPS — bottom-right of scene */}
                        {showPowerups && (
                            <PowerupBar
                                powerups={characterPowerups}
                                accent={accent}
                                accentInk={accentInk}
                                hasPhoto={!!pendingImage}
                                disabled={isStreaming}
                                onLaunch={handlePowerup}
                            />
                        )}

                        {/* CLEAR — bottom-left of scene */}
                        <div className="absolute bottom-3 left-3 z-20">
                            <button
                                type="button"
                                onClick={() => setClearOpen(true)}
                                disabled={isStreaming}
                                aria-label={t('chat.show.clear')}
                                style={
                                    {
                                        '--pu-accent': accent,
                                        '--pu-accent-ink': accentInk,
                                        imageRendering: 'pixelated',
                                    } as React.CSSProperties
                                }
                                className="btn-powerup group relative flex h-12 w-12 items-center justify-center bg-[var(--bg-deep)] not-disabled:hover:bg-[var(--pu-accent)] disabled:opacity-50"
                            >
                                <span className="powerup-icon flex h-7 w-7 items-center justify-center text-[var(--ink)] not-disabled:group-hover:text-[var(--pu-accent-ink)]">
                                    <Trash width={22} height={22} />
                                </span>
                                <span
                                    className="pointer-events-none absolute top-1/2 left-full ml-2 -translate-y-1/2 -translate-x-1 border-2 border-[var(--ink)] bg-[var(--bg)] px-2 py-1 font-display text-[9px] whitespace-nowrap text-[var(--ink)] uppercase tracking-widest opacity-0 transition-all duration-100 not-disabled:group-hover:translate-x-0 not-disabled:group-hover:opacity-100"
                                    style={{ boxShadow: `2px 2px 0 0 ${accent}` }}
                                >
                                    {t('chat.show.clear')}
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* DIALOG BOX — flex-1 so this is the only scrolling region */}
                    <div className="relative flex min-h-0 flex-1 flex-col border-t-4 border-[var(--ink)] bg-[var(--bg-deep)]">
                        {/* Last YOU echo bubble — full width, left aligned */}
                        {lastUser && (
                            <div className="px-4 pt-4 pb-2">
                                <div
                                    className="relative flex w-full items-start gap-3 border-2 border-[var(--ink)] bg-[var(--bg)] px-3 py-2"
                                    style={{ boxShadow: '3px 3px 0 0 var(--ink)' }}
                                >
                                    {lastUser.image_url && (
                                        <img
                                            src={lastUser.image_url}
                                            alt={t('chat.show.your_photo')}
                                            className="h-12 w-12 flex-shrink-0 border-2 border-[var(--ink)] object-cover"
                                        />
                                    )}
                                    <div className="min-w-0 flex-1">
                                        <p className="font-display text-[10px] uppercase tracking-widest text-[var(--ink-faint)] mb-1">
                                            {t('chat.show.you')}
                                        </p>
                                        <p className="truncate font-body text-base text-[var(--ink)]">
                                            {lastUser.content}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex-1 min-h-0 overflow-y-auto px-6 pt-5 pb-5">
                            {currentDialog ? (
                                <MarkdownMessage
                                    className="font-body text-lg leading-[1.05] text-[var(--ink)]"
                                    streaming={isStreaming}
                                    accent={accent}
                                >
                                    {currentDialog}
                                </MarkdownMessage>
                            ) : isStreaming ? (
                                <p className="font-body text-lg italic text-[var(--ink-faint)] animate-pulse">
                                    {streamingToolName === 'retrato_frida'
                                        ? t('chat.show.painting', { name: character.name })
                                        : streamingToolName === 'receta_de_coyoacan'
                                          ? t('chat.show.writing_receta', { name: character.name })
                                          : streamingToolName
                                            ? t('chat.show.preparing', { name: character.name })
                                            : t('chat.show.thinking', { name: character.name })}
                                </p>
                            ) : (
                                <p className="font-body text-lg italic text-[var(--ink-faint)]">
                                    {t('chat.show.say_hi', { name: character.name })}
                                </p>
                            )}

                            {/* Artifacts (streaming or last assistant) */}
                            {(() => {
                                const liveArtifacts = isStreaming ? streamingArtifacts : lastAssistant?.artifacts ?? [];
                                const streamingType = isStreaming ? infoTypeFromToolName(streamingToolName) : null;
                                const alreadyHasStreamingType =
                                    streamingType && liveArtifacts.some((a) => a.artifact_type === streamingType);
                                const showStreamingBadge = streamingType && !alreadyHasStreamingType;
                                if (liveArtifacts.length === 0 && !showStreamingBadge) return null;
                                return (
                                    <div className="mt-4 space-y-3">
                                        {liveArtifacts.map((artifact, i) => (
                                            <ArtifactCard
                                                key={i}
                                                artifact={artifact}
                                                accent={accent}
                                                characterName={character.name}
                                                characterSlug={character.slug}
                                            />
                                        ))}
                                        {showStreamingBadge && streamingType && (
                                            <ToolBadge mode="streaming" artifactType={streamingType} accent={accent} />
                                        )}
                                    </div>
                                );
                            })()}
                        </div>
                    </div>

                    {/* INPUT BAR */}
                    <div className="border-t-2 border-[var(--ink)] bg-[var(--bg)] px-4 py-3">
                        <form onSubmit={handleSubmit} className="flex items-stretch gap-2">
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={t('chat.show.placeholder', { name: character.name })}
                                rows={1}
                                disabled={isStreaming}
                                className="input-sketch flex-1 resize-none h-11 px-3 py-2 font-body text-base leading-tight placeholder-[var(--ink-faint)] disabled:opacity-50"
                            />
                            <button
                                type="submit"
                                disabled={isStreaming || !input.trim()}
                                className="btn-sketch flex h-11 w-11 items-center justify-center disabled:opacity-50"
                                style={{ backgroundColor: accent, color: 'var(--bg)' }}
                            >
                                <Send className="h-4 w-4" />
                            </button>
                        </form>
                    </div>
                </div>
                </div>
            </div>

            {/* CLEAR CONFIRM MODAL */}
            {clearOpen && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
                    onClick={() => setClearOpen(false)}
                >
                    <div
                        className="w-full max-w-sm bg-[var(--bg-deep)]"
                        style={{
                            border: '3px solid var(--ink)',
                            boxShadow: `8px 8px 0 0 ${accent}`,
                            imageRendering: 'pixelated',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div
                            className="border-b-2 border-[var(--ink)] px-3 py-1.5"
                            style={{ backgroundColor: accent }}
                        >
                            <span className="font-display text-[10px] uppercase font-bold tracking-[0.2em] text-[var(--bg)]">
                                ⚠ {t('chat.show.clear_title')}
                            </span>
                        </div>
                        <div className="px-5 py-5">
                            <p className="text-center font-body text-sm leading-snug text-[var(--ink)]">
                                {t('chat.show.clear_description')}
                            </p>
                        </div>
                        <div className="flex border-t-2 border-[var(--ink)]">
                            <button
                                onClick={() => setClearOpen(false)}
                                className="flex flex-1 items-center justify-center gap-1.5 border-r border-[var(--ink)] bg-[var(--bg)] py-2.5 font-display text-[10px] uppercase tracking-widest text-[var(--ink-faint)] transition hover:bg-[var(--bg-tile)] hover:text-[var(--ink)]"
                            >
                                {t('chat.show.clear_cancel')}
                            </button>
                            <button
                                onClick={() => {
                                    setClearOpen(false);
                                    router.delete(`/chat/${character.slug}/conversation`, {
                                        onSuccess: () => {
                                            setMessages([]);
                                            setStreamingContent('');
                                            setStreamingArtifacts([]);
                                            setStreamingToolName(null);
                                            setConversationId(null);
                                            setIsStreaming(false);
                                            window.history.replaceState({}, '', `/chat/${character.slug}`);
                                        },
                                    });
                                }}
                                className="flex flex-1 items-center justify-center gap-1.5 py-2.5 font-display text-[10px] uppercase font-bold tracking-widest transition hover:translate-y-[-1px]"
                                style={{ backgroundColor: accent, color: 'var(--bg)' }}
                            >
                                {t('chat.show.clear_confirm')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* POWER-UP MODAL */}
            {activePowerup && (
                <PowerupModal
                    title={activePowerup.label}
                    description={activePowerup.description}
                    icon={activePowerup.icon}
                    accent={accent}
                    requiresPhoto={activePowerup.requiresPhoto}
                    photoPreview={pendingImagePreview}
                    onSelectPhoto={handleFileSelect}
                    onClearPhoto={clearPendingImage}
                    onClose={() => setActivePowerup(null)}
                    onAccept={acceptPowerup}
                />
            )}

            {/* HISTORY OVERLAY */}
            {historyOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
                    onClick={() => setHistoryOpen(false)}
                >
                    <div
                        className="flex w-full max-w-2xl flex-col bg-[var(--bg-deep)]"
                        style={{
                            maxHeight: '80vh',
                            border: '3px solid var(--ink)',
                            boxShadow: `8px 8px 0 0 ${accent}`,
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b-2 border-[var(--ink)] bg-[var(--bg)] px-4 py-2">
                            <h2 className="font-display text-xs uppercase font-bold tracking-[0.2em] text-[var(--ink)]">
                                {t('chat.show.dialog_log')}
                            </h2>
                            <button
                                onClick={() => setHistoryOpen(false)}
                                className="font-display text-[10px] uppercase tracking-widest text-[var(--ink-faint)] hover:text-[var(--ink)] flex items-center gap-1"
                            >
                                <X className="h-3 w-3" />
                                {t('chat.show.close')}
                            </button>
                        </div>
                        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
                            {messages.length === 0 ? (
                                <p className="font-body text-sm italic text-[var(--ink-faint)] text-center">
                                    {t('chat.show.no_dialog')}
                                </p>
                            ) : (
                                messages.map((msg) => (
                                    <div key={msg.id}>
                                        {msg.role === 'assistant' && msg.escena && (
                                            <p className="mb-1 font-body text-xs italic text-[var(--ink-faint)]">
                                                ~ {msg.escena} ~
                                            </p>
                                        )}
                                        <p
                                            className="font-display text-[9px] uppercase tracking-widest"
                                            style={{ color: msg.role === 'user' ? 'var(--ink-faint)' : accent }}
                                        >
                                            {msg.role === 'user' ? t('chat.show.you') : `> ${character.name}`}
                                        </p>
                                        {msg.role === 'assistant' ? (
                                            <MarkdownMessage
                                                className="font-body text-sm leading-relaxed text-[var(--ink)]"
                                                accent={accent}
                                            >
                                                {msg.content}
                                            </MarkdownMessage>
                                        ) : (
                                            <p className="font-body text-sm leading-relaxed text-[var(--ink)] whitespace-pre-wrap">
                                                {msg.content}
                                            </p>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
