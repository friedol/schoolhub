import type { ReactNode } from 'react';
import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface AuthLayoutProps {
    title: string;
    description: string;
    children?: ReactNode;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    role?: string;
    school_id?: number;
    platform_id?: number;
    [key: string]: unknown; // This allows for additional properties...
}

export interface Platform {
    id: number;
    name: string;
    description?: string;
    contact_email: string;
    contact_phone: string;
    address: string;
    region: string;
    district: string;
    subscription_plan: 'basic' | 'premium' | 'enterprise';
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface School {
    id: number;
    name: string;
    description?: string;
    motto?: string;
    contact_email: string;
    contact_phone: string;
    address: string;
    region: string;
    district: string;
    ward?: string;
    registration_number?: string;
    necta_number?: string;
    school_level: string;
    is_active: boolean;
    platform_id: number;
    created_at: string;
    updated_at: string;
}
