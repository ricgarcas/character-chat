import { useSyncExternalStore } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

function subscribe(onChange: () => void) {
    const query = window.matchMedia(QUERY);

    query.addEventListener('change', onChange);

    return () => query.removeEventListener('change', onChange);
}

function getSnapshot() {
    return window.matchMedia(QUERY).matches;
}

/** En SSR no hay `window`; asumimos que sí hay movimiento y el cliente corrige al hidratar. */
function getServerSnapshot() {
    return false;
}

/**
 * `true` cuando el sistema pide menos movimiento. Toda animación de la
 * landing se apaga con esto — la página debe leerse completa sin una
 * sola animación.
 */
export function useReducedMotion(): boolean {
    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
