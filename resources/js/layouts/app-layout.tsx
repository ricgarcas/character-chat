import { PowerOffButton } from '@/components/power-off-button';
import AppLayoutTemplate from '@/layouts/app/app-header-layout';
import type { BreadcrumbItem } from '@/types';

export default function AppLayout({
    breadcrumbs = [],
    children,
}: {
    breadcrumbs?: BreadcrumbItem[];
    children: React.ReactNode;
}) {
    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs}>
            {children}
            <PowerOffButton />
        </AppLayoutTemplate>
    );
}
