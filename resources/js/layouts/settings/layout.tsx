import { Link } from '@inertiajs/react';
import { PaintRoller, ShieldCheck, User } from '@phosphor-icons/react';
import type { PropsWithChildren } from 'react';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { toUrl } from '@/lib/utils';
import { edit as editAppearance } from '@/routes/appearance';
import { edit } from '@/routes/profile';
import { edit as editSecurity } from '@/routes/security';

const sections = [
    { title: 'Mi cuenta', href: edit(), icon: User },
    { title: 'Seguridad', href: editSecurity(), icon: ShieldCheck },
    { title: 'Apariencia', href: editAppearance(), icon: PaintRoller },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { isCurrentOrParentUrl } = useCurrentUrl();

    return (
        <div className="mx-auto max-w-4xl px-4 py-8">
            <h1 className="text-center font-display text-2xl font-black tracking-wide text-[var(--ink)]">— PAUSA —</h1>

            <div className="mt-8 flex flex-col gap-8 lg:flex-row">
                <nav className="flex w-full shrink-0 flex-col gap-2.5 lg:w-56" aria-label="Ajustes">
                    {sections.map(({ title, href, icon: Icon }) => {
                        const active = isCurrentOrParentUrl(toUrl(href));

                        return (
                            <Link
                                key={toUrl(href)}
                                href={href}
                                className={`flex items-center gap-2.5 px-4 py-2.5 text-sm ${
                                    active
                                        ? 'rounded-[12px] bg-[var(--ink)] font-display font-extrabold text-[var(--paper)]'
                                        : 'btn-soft'
                                }`}
                            >
                                <Icon size={18} weight="bold" />
                                {title}
                            </Link>
                        );
                    })}
                </nav>

                <div className="min-w-0 flex-1 rounded-2xl bg-[var(--surface)] p-6 shadow-[var(--shadow-tactile)]">
                    {children}
                </div>
            </div>
        </div>
    );
}
