import { Link, router } from '@inertiajs/react';
import { Lock, Power, ShieldCheck, User, UsersFour, X } from '@phosphor-icons/react';
import { logout } from '@/routes';
import { edit as profileEdit } from '@/routes/profile';
import { edit as securityEdit } from '@/routes/security';

export default function PauseMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(58,44,20,0.45)] p-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="w-full max-w-xs rounded-2xl bg-[var(--surface)] p-6 shadow-[var(--shadow-sticker)]"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="font-display text-lg font-black tracking-wide text-[var(--ink)]">— PAUSA —</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Cerrar"
                        className="text-[var(--ink-soft)] transition hover:text-[var(--ink)]"
                    >
                        <X size={18} weight="bold" />
                    </button>
                </div>

                <div className="flex flex-col gap-2.5">
                    <Link href={profileEdit.url()} className="btn-soft flex items-center gap-2.5 px-4 py-2.5 text-sm">
                        <User size={18} weight="bold" /> Mi cuenta
                    </Link>
                    <Link href={securityEdit.url()} className="btn-soft flex items-center gap-2.5 px-4 py-2.5 text-sm">
                        <ShieldCheck size={18} weight="bold" /> Seguridad
                    </Link>
                    <div
                        className="btn-soft flex items-center gap-2.5 px-4 py-2.5 text-sm opacity-50"
                        aria-disabled="true"
                    >
                        <UsersFour size={18} weight="bold" /> Zona de papás
                        <span className="ml-auto flex items-center gap-1 rounded-full bg-[var(--paper-deep)] px-2 py-0.5 text-[10px] font-extrabold text-[var(--ink-soft)]">
                            <Lock size={10} weight="bold" /> pronto
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={() => router.post(logout.url())}
                        className="btn-candy mt-1 flex items-center gap-2.5 px-4 py-2.5 text-sm"
                    >
                        <Power size={18} weight="bold" /> Salir
                    </button>
                </div>
            </div>
        </div>
    );
}
