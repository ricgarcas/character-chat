import type { InertiaLinkProps } from '@inertiajs/react';
import type { ComponentType, SVGProps } from 'react';

type PhosphorIcon = ComponentType<SVGProps<SVGSVGElement>>;

export type BreadcrumbItem = {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
};

export type NavItem = {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: PhosphorIcon | null;
    isActive?: boolean;
};
