export function debugLog(tag: string, message: string, payload?: unknown): void {
    try {
        const csrfToken =
            document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';

        void fetch('/debug/log', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken,
                Accept: 'application/json',
            },
            body: JSON.stringify({ tag, message, payload }),
            keepalive: true,
        });
    } catch {
        // logging must never throw
    }
}
