import { Link, usePage } from '@inertiajs/react';
import { Package, Pause, Sparkle, UsersThree } from '@phosphor-icons/react';
import { type ReactNode, useState } from 'react';
import PauseMenu from '@/components/shell/pause-menu';
import { index as chatIndex } from '@/routes/chat';
import { index as portfolioIndex } from '@/routes/portfolio';

export default function AppShellScrapbook({ children }: { children: ReactNode }) {
    const page = usePage<{ portfolioCount?: number }>();
    const portfolioCount = page.props.portfolioCount ?? 0;
    const current = page.url;
    const [pauseOpen, setPauseOpen] = useState(false);

    const onCharacters = current.startsWith('/chat');
    const onPortfolio = current.startsWith('/portafolio');

    return (
        <div className="min-h-svh bg-[var(--paper)] font-body text-[var(--ink)]">
            <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--paper)]/95 backdrop-blur-sm">
                <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-4">
                    <Link href={chatIndex.url()} className="mr-2 font-display text-xl font-black tracking-tight">
                        muni
                    </Link>

                    <nav className="hidden items-center gap-1 sm:flex">
                        <Link
                            href={chatIndex.url()}
                            className={`rounded-full px-4 py-1.5 font-display text-sm font-extrabold transition ${
                                onCharacters
                                    ? 'bg-[var(--paper-deep)] text-[var(--ink)]'
                                    : 'text-[var(--ink-soft)] hover:text-[var(--ink)]'
                            }`}
                        >
                            Personajes
                        </Link>
                        <Link
                            href={portfolioIndex.url()}
                            className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 font-display text-sm font-extrabold transition ${
                                onPortfolio
                                    ? 'bg-[var(--paper-deep)] text-[var(--ink)]'
                                    : 'text-[var(--ink-soft)] hover:text-[var(--ink)]'
                            }`}
                        >
                            Portafolio
                            <span className="flex items-center gap-0.5 rounded-full bg-[var(--candy)] px-2 py-0.5 text-xs font-black text-[var(--candy-ink)]">
                                <Sparkle size={11} weight="fill" />
                                {portfolioCount}
                            </span>
                        </Link>
                    </nav>

                    <button
                        type="button"
                        onClick={() => setPauseOpen(true)}
                        aria-label="Pausa"
                        className="btn-soft ml-auto flex h-9 w-9 items-center justify-center"
                    >
                        <Pause size={18} weight="bold" />
                    </button>
                </div>
            </header>

            <main className="pb-20 sm:pb-0">{children}</main>

            <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-[var(--line)] bg-[var(--surface)] sm:hidden">
                {[
                    { href: chatIndex.url(), label: 'Personajes', icon: UsersThree, active: onCharacters },
                    { href: portfolioIndex.url(), label: 'Portafolio', icon: Package, active: onPortfolio },
                ].map(({ href, label, icon: Icon, active }) => (
                    <Link
                        key={href}
                        href={href}
                        className={`flex flex-1 flex-col items-center gap-0.5 py-2 font-display text-[11px] font-extrabold ${
                            active ? 'text-[var(--candy-deep)]' : 'text-[var(--ink-soft)]'
                        }`}
                    >
                        <Icon size={20} weight="bold" />
                        {label}
                    </Link>
                ))}
            </nav>

            <PauseMenu open={pauseOpen} onClose={() => setPauseOpen(false)} />
        </div>
    );
}
