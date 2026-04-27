import { router, usePage } from '@inertiajs/react';
import { Power } from 'pixelarticons/react';
import { useState } from 'react';
import { useT } from '@/lib/i18n';
import { logout } from '@/routes';

export function PowerOffButton() {
    const t = useT();
    const [open, setOpen] = useState(false);
    const { auth } = usePage().props as { auth?: { user?: unknown } };

    if (!auth?.user) return null;

    const accent = 'var(--accent-frida)';

    const confirm = () => {
        setOpen(false);
        router.flushAll();
        router.post(logout().url);
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                aria-label={t('nav.power_off')}
                title={t('nav.power_off')}
                className="fixed top-4 left-4 z-50 inline-flex items-center justify-center border-2 border-[var(--ink)] bg-[var(--bg-deep)] p-2 text-[var(--ink-faint)] transition hover:text-[var(--ink)]"
                style={{ boxShadow: `3px 3px 0 0 ${accent}` }}
            >
                <Power className="h-4 w-4" />
            </button>

            {open && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
                    onClick={() => setOpen(false)}
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
                            <span className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--bg)]">
                                ⏻ {t('nav.power_off_title')}
                            </span>
                        </div>
                        <div className="px-5 py-5">
                            <p className="text-center font-body text-sm leading-snug text-[var(--ink)]">
                                {t('nav.power_off_description')}
                            </p>
                        </div>
                        <div className="flex border-t-2 border-[var(--ink)]">
                            <button
                                onClick={() => setOpen(false)}
                                className="flex flex-1 items-center justify-center gap-1.5 border-r border-[var(--ink)] bg-[var(--bg)] py-2.5 font-display text-[10px] uppercase tracking-widest text-[var(--ink-faint)] transition hover:bg-[var(--bg-tile)] hover:text-[var(--ink)]"
                            >
                                {t('nav.power_off_cancel')}
                            </button>
                            <button
                                onClick={confirm}
                                className="flex flex-1 items-center justify-center gap-1.5 py-2.5 font-display text-[10px] font-bold uppercase tracking-widest transition hover:translate-y-[-1px]"
                                style={{ backgroundColor: accent, color: 'var(--bg)' }}
                            >
                                {t('nav.power_off_confirm')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
