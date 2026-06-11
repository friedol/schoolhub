import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { edit as editAppearance } from '@/routes/appearance';
import { edit as editPassword } from '@/routes/password';
import { edit } from '@/routes/profile';
import { show } from '@/routes/two-factor';
import { type NavItem, SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface SettingsLayoutProps extends PropsWithChildren {
    title?: string;
    description?: string;
}

export default function SettingsLayout({ children, title, description }: SettingsLayoutProps) {
    // When server-side rendering, we only render the layout on the client...
    if (typeof window === 'undefined') {
        return null;
    }

    const { props } = usePage<SharedData>();
    const user = props.auth?.user;
    const role = user?.role;

    const sidebarNavItems: NavItem[] = [
        {
            title: 'Profile',
            href: edit(),
            icon: null,
        },
        {
            title: 'Password',
            href: editPassword(),
            icon: null,
        },
        {
            title: 'Two-Factor Auth',
            href: show(),
            icon: null,
        },
        {
            title: 'Appearance',
            href: editAppearance(),
            icon: null,
        },
    ];

    // Append school & system administration menus for school/super admins and headteachers
    if (role === 'school_admin' || role === 'headteacher' || role === 'super_admin') {
        sidebarNavItems.push(
            {
                title: 'School Profile',
                href: '/system/configurations',
                icon: null,
            },
            {
                title: 'Configurations',
                href: '/system/school-configurations',
                icon: null,
            }
        );
    }

    const currentPath = window.location.pathname;

    return (
        <div className="px-4 py-6">
            <Heading
                title={title || 'Settings'}
                description={description || 'Manage your profile and account settings'}
            />

            <div className="flex flex-col lg:flex-row lg:space-x-12">
                <aside className="w-full max-w-xl lg:w-48">
                    <nav className="flex flex-col space-y-1 space-x-0">
                        {sidebarNavItems.map((item, index) => {
                            const isSelected = currentPath === (typeof item.href === 'string' ? item.href : item.href.url);
                            return (
                                <Button
                                    key={`${typeof item.href === 'string' ? item.href : item.href.url}-${index}`}
                                    size="sm"
                                    variant="ghost"
                                    asChild
                                    className={cn('w-full justify-start', {
                                        'bg-muted font-semibold text-blue-600 hover:text-blue-700': isSelected,
                                    })}
                                >
                                    <Link href={item.href}>
                                        {item.icon && (
                                            <item.icon className="h-4 w-4" />
                                        )}
                                        {item.title}
                                    </Link>
                                </Button>
                            );
                        })}
                    </nav>
                </aside>

                <Separator className="my-6 lg:hidden" />

                <div className="flex-1 md:max-w-2xl">
                    <section className="max-w-xl space-y-12">
                        {children}
                    </section>
                </div>
            </div>
        </div>
    );
}
