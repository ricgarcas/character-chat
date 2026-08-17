import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEcho } from '@laravel/echo-react';
import { send } from '@/routes/chat';
import { index as portfolioIndex } from '@/routes/portfolio';
import type { Artifact, Character, ChatMessage, EmoteKey } from '@/types/chat';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ClockCounterClockwise, PaperPlaneRight, Trash, X } from '@phosphor-icons/react';
import { useCharacterPhaser } from '@/hooks/useCharacterPhaser';
import ArtifactCard from '@/components/artifacts/ArtifactCard';
import ToolBadge, { infoTypeFromToolName } from '@/components/artifacts/ToolBadge';
import { type Powerup } from '@/components/PowerupBar';
import PowerupModal from '@/components/PowerupModal';
import DioramaCard from '@/components/taller/diorama-card';
import MoveMenu from '@/components/taller/move-menu';
import ArtifactSticker from '@/components/taller/artifact-sticker';
import { powerupIcon } from '@/lib/powerup-icons';
import { useT } from '@/lib/i18n';
import { characterAccent, characterAccentInk } from '@/lib/accents';
import { debugLog } from '@/lib/debug-log';
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
    const sceneRef = useRef<HTMLDivElement>(null);
    const threadRef = useRef<HTMLDivElement>(null);
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
            if (e.key !== 'Escape') return;
            e.preventDefault();
            if (clearOpen) {
                setClearOpen(false);
                return;
            }
            if (activePowerup) {
                setActivePowerup(null);
                return;
            }
            if (historyOpen) {
                setHistoryOpen(false);
                return;
            }
            router.visit('/chat');
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [clearOpen, activePowerup, historyOpen]);

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

    const lastEmote: EmoteKey =
        streamingToolName ? 'thinking' :
        streamingEmote ??
        lastAssistant?.emote ??
        'neutral';

    useEffect(() => {
        setMoodPulse((p) => p + 1);
    }, [lastEmote]);

    // Keep the novel thread pinned to the latest line
    useEffect(() => {
        const el = threadRef.current;
        if (el) el.scrollTo({ top: el.scrollHeight });
    }, [messages, streamingContent]);

    const phaserRef = useCharacterPhaser(sceneRef, character, lastEmote);

    // Pipe tool activations into Phaser
    useEffect(() => {
        if (streamingToolName) {
            phaserRef.current?.events.emit('tool:active', streamingToolName);
        }
    }, [streamingToolName]);

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


    const pw = (slug: string, key: string) => ({
        label: t(`powerup.${slug}.${key}.label`),
        description: t(`powerup.${slug}.${key}.description`),
        prompt: t(`powerup.${slug}.${key}.prompt`),
    });

    const POWERUPS_BY_CHARACTER: Record<string, Powerup[]> = {
        frida: [
            {
                key: 'receta',
                icon: powerupIcon('receta'),
                ...pw('frida', 'receta'),
                requiresPhoto: false,
            },
            {
                key: 'cara',
                icon: powerupIcon('cara'),
                ...pw('frida', 'cara'),
                requiresPhoto: true,
            },
            {
                key: 'retrato',
                icon: powerupIcon('retrato'),
                ...pw('frida', 'retrato'),
                requiresPhoto: true,
            },
        ],
        dali: [
            {
                key: 'paranoide',
                icon: powerupIcon('paranoide'),
                ...pw('dali', 'paranoide'),
                requiresPhoto: false,
            },
            {
                key: 'huevo',
                icon: powerupIcon('huevo'),
                ...pw('dali', 'huevo'),
                requiresPhoto: false,
            },
            {
                key: 'retrato',
                icon: powerupIcon('retrato'),
                ...pw('dali', 'retrato'),
                requiresPhoto: true,
            },
        ],
        beauvoir: [
            {
                key: 'analiza',
                icon: powerupIcon('analiza'),
                ...pw('beauvoir', 'analiza'),
                requiresPhoto: false,
            },
            {
                key: 'critica',
                icon: powerupIcon('critica'),
                ...pw('beauvoir', 'critica'),
                requiresPhoto: false,
            },
            {
                key: 'lectura',
                icon: powerupIcon('lectura'),
                ...pw('beauvoir', 'lectura'),
                requiresPhoto: false,
            },
        ],
        'sor-juana': [
            {
                key: 'taller',
                icon: powerupIcon('taller'),
                ...pw('sor-juana', 'taller'),
                requiresPhoto: false,
            },
            {
                key: 'duelo',
                icon: powerupIcon('duelo'),
                ...pw('sor-juana', 'duelo'),
                requiresPhoto: false,
            },
            {
                key: 'biblioteca',
                icon: powerupIcon('biblioteca'),
                ...pw('sor-juana', 'biblioteca'),
                requiresPhoto: false,
            },
        ],
        freud: [
            {
                key: 'sueno',
                icon: powerupIcon('sueno'),
                ...pw('freud', 'sueno'),
                requiresPhoto: false,
            },
            {
                key: 'defensas',
                icon: powerupIcon('defensas'),
                ...pw('freud', 'defensas'),
                requiresPhoto: false,
            },
            {
                key: 'rostro',
                icon: powerupIcon('cara'),
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
            <Head title={`Chat with ${character.name}`} />

            <div className="mx-auto max-w-6xl px-4 py-6">
                {/* Encabezado de la sesión */}
                <div className="mb-5 flex items-center gap-3">
                    <Link
                        href="/chat"
                        aria-label={t('chat.show.back')}
                        className="btn-soft flex h-9 w-9 items-center justify-center"
                    >
                        <ArrowLeft size={18} weight="bold" />
                    </Link>
                    <h1 className="font-display text-2xl font-black text-[var(--ink)]">{character.name}</h1>
                    <span
                        className="hidden rounded-full px-3 py-1 font-display text-xs font-extrabold sm:inline"
                        style={{ backgroundColor: `color-mix(in srgb, ${accent} 18%, white)`, color: accent }}
                    >
                        {character.tagline}
                    </span>

                    <div className="ml-auto flex items-center gap-2">
                        {messages.length > 0 && (
                            <button
                                type="button"
                                onClick={() => setHistoryOpen(true)}
                                className="btn-soft flex items-center gap-1.5 px-3 py-2 text-xs"
                            >
                                <ClockCounterClockwise size={16} weight="bold" />
                                {messages.length}
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => setClearOpen(true)}
                            disabled={isStreaming}
                            aria-label={t('chat.show.clear')}
                            className="btn-soft flex h-9 w-9 items-center justify-center disabled:opacity-50"
                        >
                            <Trash size={16} weight="bold" />
                        </button>
                    </div>
                </div>

                <div className="flex flex-col gap-6 lg:flex-row">
                    {/* Diorama + movimientos */}
                    <aside className="mx-auto w-full max-w-xs lg:mx-0 lg:w-[32%] lg:max-w-none lg:shrink-0">
                        <div className="lg:sticky lg:top-20">
                            <DioramaCard
                                sceneRef={sceneRef}
                                escena={isStreaming ? streamingEscena : (lastAssistant?.escena ?? null)}
                                emote={lastEmote}
                            />
                            <MoveMenu
                                powerups={characterPowerups}
                                disabled={isStreaming}
                                onLaunch={handlePowerup}
                            />
                        </div>
                    </aside>

                    {/* Conversación */}
                    <section className="flex min-h-0 flex-1 flex-col">
                        <div
                            ref={threadRef}
                            className="flex max-h-[calc(100svh-17rem)] min-h-[22rem] flex-col gap-4 overflow-y-auto pr-1"
                        >
                            {messages.length === 0 && !isStreaming && (
                                <p className="font-body text-base italic text-[var(--ink-faint)]">
                                    {t('chat.show.say_hi', { name: character.name })}
                                </p>
                            )}

                            {messages.map((msg) =>
                                msg.role === 'user' ? (
                                    <div
                                        key={msg.id}
                                        className="ml-[16%] self-end rounded-[14px] rounded-br-[4px] bg-[#ffe3b3] px-4 py-2.5 shadow-[0_3px_0_#ecca8a]"
                                    >
                                        {msg.image_url && (
                                            <img
                                                src={msg.image_url}
                                                alt={t('chat.show.your_photo')}
                                                className="mb-2 h-14 w-14 rounded-lg object-cover"
                                            />
                                        )}
                                        <p className="font-body text-[15px] leading-relaxed whitespace-pre-wrap text-[#4a3812]">
                                            {msg.content}
                                        </p>
                                    </div>
                                ) : (
                                    <div
                                        key={msg.id}
                                        className="max-w-[92%] rounded-[14px] rounded-bl-[4px] bg-[var(--surface)] px-4 py-3 shadow-[var(--shadow-tactile)]"
                                    >
                                        <p className="mb-1 font-display text-xs font-extrabold" style={{ color: accent }}>
                                            {character.name}
                                        </p>
                                        <MarkdownMessage
                                            className="font-body text-[15px] leading-relaxed text-[var(--ink)]"
                                            accent={accent}
                                        >
                                            {msg.content}
                                        </MarkdownMessage>

                                        {msg.artifacts && msg.artifacts.length > 0 && (
                                            <div className="mt-3 space-y-4">
                                                {msg.artifacts.map((artifact, i) => (
                                                    <ArtifactSticker key={i} celebrate={false} accent={accent}>
                                                        <ArtifactCard
                                                            artifact={artifact}
                                                            accent={accent}
                                                            characterName={character.name}
                                                            characterSlug={character.slug}
                                                        />
                                                        {artifact.artifact_type !== 'image_pending' &&
                                                            artifact.artifact_type !== 'error' && (
                                                                <Link
                                                                    href={portfolioIndex.url()}
                                                                    className="mt-1 inline-block font-display text-[11px] font-extrabold text-[var(--candy-deep)]"
                                                                >
                                                                    {t('chat.artifact_saved')}
                                                                </Link>
                                                            )}
                                                    </ArtifactSticker>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ),
                            )}

                            {isStreaming && (
                                <div className="max-w-[92%] rounded-[14px] rounded-bl-[4px] bg-[var(--surface)] px-4 py-3 shadow-[var(--shadow-tactile)]">
                                    <p className="mb-1 font-display text-xs font-extrabold" style={{ color: accent }}>
                                        {character.name}
                                    </p>

                                    {streamingDialogo ? (
                                        <MarkdownMessage
                                            className="font-body text-[15px] leading-relaxed text-[var(--ink)]"
                                            streaming
                                            accent={accent}
                                        >
                                            {streamingDialogo}
                                        </MarkdownMessage>
                                    ) : (
                                        <p className="animate-pulse font-body text-[15px] italic text-[var(--ink-faint)]">
                                            {streamingToolName === 'retrato_frida'
                                                ? t('chat.show.painting', { name: character.name })
                                                : streamingToolName === 'receta_de_coyoacan'
                                                  ? t('chat.show.writing_receta', { name: character.name })
                                                  : streamingToolName
                                                    ? t('chat.show.preparing', { name: character.name })
                                                    : t('chat.show.thinking', { name: character.name })}
                                        </p>
                                    )}

                                    {(() => {
                                        const streamingType = infoTypeFromToolName(streamingToolName);
                                        const alreadyHasType =
                                            streamingType &&
                                            streamingArtifacts.some((a) => a.artifact_type === streamingType);
                                        const showBadge = streamingType && !alreadyHasType;
                                        if (streamingArtifacts.length === 0 && !showBadge) return null;

                                        return (
                                            <div className="mt-3 space-y-4">
                                                {streamingArtifacts.map((artifact, i) => (
                                                    <ArtifactSticker
                                                        key={i}
                                                        celebrate={artifact.artifact_type !== 'image_pending'}
                                                        accent={accent}
                                                    >
                                                        <ArtifactCard
                                                            artifact={artifact}
                                                            accent={accent}
                                                            characterName={character.name}
                                                            characterSlug={character.slug}
                                                        />
                                                    </ArtifactSticker>
                                                ))}
                                                {showBadge && streamingType && (
                                                    <ToolBadge
                                                        mode="streaming"
                                                        artifactType={streamingType}
                                                        accent={accent}
                                                    />
                                                )}
                                            </div>
                                        );
                                    })()}
                                </div>
                            )}
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSubmit} className="mt-4 flex items-end gap-2">
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={t('chat.show.placeholder', { name: character.name })}
                                rows={1}
                                disabled={isStreaming}
                                className="h-12 flex-1 resize-none rounded-[20px] bg-[var(--surface)] px-5 py-3.5 font-body text-[15px] text-[var(--ink)] placeholder-[var(--ink-faint)] shadow-[var(--shadow-tactile)] disabled:opacity-50"
                            />
                            <button
                                type="submit"
                                disabled={isStreaming || !input.trim()}
                                aria-label={t('chat.show.send', { name: character.name })}
                                className="btn-candy flex h-12 w-12 items-center justify-center disabled:opacity-50"
                            >
                                <PaperPlaneRight size={20} weight="bold" />
                            </button>
                        </form>
                    </section>
                </div>
            </div>

            {/* Confirmar borrado */}
            {clearOpen && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-[rgba(58,44,20,0.45)] p-4 backdrop-blur-sm"
                    onClick={() => setClearOpen(false)}
                >
                    <div
                        className="w-full max-w-sm rounded-2xl bg-[var(--surface)] p-6 shadow-[var(--shadow-sticker)]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="font-display text-lg font-black text-[var(--ink)]">
                            {t('chat.show.clear_title')}
                        </h2>
                        <p className="mt-2 font-body text-sm leading-relaxed text-[var(--ink-soft)]">
                            {t('chat.show.clear_description')}
                        </p>
                        <div className="mt-5 flex gap-2.5">
                            <button
                                type="button"
                                onClick={() => setClearOpen(false)}
                                className="btn-soft flex-1 px-4 py-2.5 text-sm"
                            >
                                {t('chat.show.clear_cancel')}
                            </button>
                            <button
                                type="button"
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
                                className="btn-candy flex-1 px-4 py-2.5 text-sm"
                            >
                                {t('chat.show.clear_confirm')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Movimiento activo */}
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

            {/* Historial */}
            {historyOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(58,44,20,0.45)] p-4 backdrop-blur-sm"
                    onClick={() => setHistoryOpen(false)}
                >
                    <div
                        className="flex max-h-[80vh] w-full max-w-2xl flex-col rounded-2xl bg-[var(--surface)] shadow-[var(--shadow-sticker)]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-3.5">
                            <h2 className="font-display text-base font-black text-[var(--ink)]">
                                {t('chat.show.dialog_log')}
                            </h2>
                            <button
                                type="button"
                                onClick={() => setHistoryOpen(false)}
                                aria-label={t('chat.show.close')}
                                className="text-[var(--ink-soft)] transition hover:text-[var(--ink)]"
                            >
                                <X size={18} weight="bold" />
                            </button>
                        </div>
                        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
                            {messages.length === 0 ? (
                                <p className="text-center font-body text-sm italic text-[var(--ink-faint)]">
                                    {t('chat.show.no_dialog')}
                                </p>
                            ) : (
                                messages.map((msg) => (
                                    <div key={msg.id}>
                                        {msg.role === 'assistant' && msg.escena && (
                                            <p className="mb-1 font-body text-xs italic text-[var(--ink-soft)]">
                                                {msg.escena}
                                            </p>
                                        )}
                                        <p
                                            className="font-display text-[11px] font-extrabold"
                                            style={{ color: msg.role === 'user' ? 'var(--ink-faint)' : accent }}
                                        >
                                            {msg.role === 'user' ? t('chat.show.you') : character.name}
                                        </p>
                                        {msg.role === 'assistant' ? (
                                            <MarkdownMessage
                                                className="font-body text-sm leading-relaxed text-[var(--ink)]"
                                                accent={accent}
                                            >
                                                {msg.content}
                                            </MarkdownMessage>
                                        ) : (
                                            <p className="font-body text-sm leading-relaxed whitespace-pre-wrap text-[var(--ink)]">
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
