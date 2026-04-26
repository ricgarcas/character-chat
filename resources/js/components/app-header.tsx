import { Link, usePage } from '@inertiajs/react';
import { Message as MessageCircle, SettingsCog as Settings } from 'pixelarticons/react';
import AppLogo from '@/components/app-logo';
import { LocaleToggle } from '@/components/locale-toggle';
import { useT } from '@/lib/i18n';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { index as chatIndex } from '@/routes/chat';
import type { BreadcrumbItem } from '@/types';

type Props = {
    breadcrumbs?: BreadcrumbItem[];
};

export function AppHeader({ breadcrumbs = [] }: Props) {
    const page = usePage();
    const { auth } = page.props;
    const getInitials = useInitials();
    const t = useT();

    return (
        <div className="border-b border-neutral-800 bg-neutral-950">
            <div className="mx-auto flex h-14 items-center justify-between px-4 md:max-w-7xl">
                {/* Left: Logo + Nav */}
                <div className="flex items-center gap-6">
                    <Link href={chatIndex.url()} className="flex items-center gap-2">
                        <AppLogo />
                    </Link>
                    <nav className="flex items-center gap-1">
                        <Link
                            href={chatIndex.url()}
                            className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-neutral-400 transition hover:bg-neutral-800 hover:text-white"
                        >
                            <MessageCircle className="h-4 w-4" />
                            {t('nav.chat')}
                        </Link>
                    </nav>
                </div>

                {/* Right: Locale + User */}
                <div className="flex items-center gap-3">
                <LocaleToggle />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex h-8 w-8 items-center justify-center rounded-full ring-1 ring-neutral-700 transition hover:ring-neutral-500">
                            <Avatar className="h-7 w-7 overflow-hidden rounded-full">
                                <AvatarImage src={auth.user?.avatar} alt={auth.user?.name} />
                                <AvatarFallback className="bg-neutral-800 text-xs text-white">
                                    {getInitials(auth.user?.name ?? '')}
                                </AvatarFallback>
                            </Avatar>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end">
                        {auth.user && <UserMenuContent user={auth.user} />}
                    </DropdownMenuContent>
                </DropdownMenu>
                </div>
            </div>
        </div>
    );
}
