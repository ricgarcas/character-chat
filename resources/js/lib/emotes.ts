import type { EmoteKey } from '@/types/chat';

/**
 * Emojis SOLO aquí: son las caritas de emote del personaje.
 * Cualquier otro icono de la app viene de @phosphor-icons/react.
 */
export const EMOTE_STICKER: Record<EmoteKey, { emoji: string; label: string }> = {
    neutral: { emoji: '😐', label: 'en calma' },
    happy: { emoji: '😊', label: 'feliz' },
    thinking: { emoji: '🤔', label: 'pensando' },
    surprised: { emoji: '😮', label: 'sorpresa' },
};
