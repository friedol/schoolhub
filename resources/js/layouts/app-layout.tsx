import { ReactNode, useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import Sidebar from '@/components/navigation/sidebar';
import { BreadcrumbItem, SharedData } from '@/types';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { useAppearance } from '@/hooks/use-appearance';
import { usePage } from '@inertiajs/react';
import { Bell, Search, Settings, LogOut, Menu, PanelLeftClose, PanelLeftOpen, Sun, Moon, Monitor, X, Calendar, ChevronDown, Target, MessageSquare, BarChart3, Maximize } from 'lucide-react';
import SchoolContextIndicator from '@/components/SchoolContextIndicator';
import SweetAlert from '@/components/SweetAlert';

interface AppLayoutProps {
    children: ReactNode;
    title?: string;
    breadcrumbs?: BreadcrumbItem[];
}

export default function AppLayout({ children, title, breadcrumbs = [] }: AppLayoutProps) {
    const { props } = usePage<SharedData>();
    const user = props.auth.user;
    const getInitials = useInitials();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const { appearance, updateAppearance } = useAppearance();

    // Check if device is mobile
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Close mobile sidebar when screen becomes desktop
    useEffect(() => {
        if (!isMobile) {
            setIsMobileSidebarOpen(false);
        }
    }, [isMobile]);

    // Prevent body scroll when mobile sidebar is open
    useEffect(() => {
        if (isMobile && isMobileSidebarOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMobile, isMobileSidebarOpen]);

    const getCurrentThemeIcon = () => {
        switch (appearance) {
            case 'dark':
                return <Moon className="h-4 w-4" />;
            case 'light':
                return <Sun className="h-4 w-4" />;
            default:
                return <Monitor className="h-4 w-4" />;
        }
    };

    const cycleTheme = () => {
        switch (appearance) {
            case 'light':
                updateAppearance('dark');
                break;
            case 'dark':
                updateAppearance('system');
                break;
            default:
                updateAppearance('light');
                break;
        }
    };

    return (
        <div className="flex h-screen bg-background">
            <Head title={title} />
            
            {/* Desktop Sidebar */}
            {!isMobile && (
                <Sidebar
                    className={`${isSidebarCollapsed ? 'w-16' : 'w-52'} shrink-0 transition-all duration-300`}
                    isCollapsed={isSidebarCollapsed}
                    onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                />
            )}
            
            {/* Mobile Sidebar Overlay */}
            {isMobile && isMobileSidebarOpen && (
                <div 
                    className="fixed inset-0 z-40 bg-transparent"
                    onClick={() => setIsMobileSidebarOpen(false)}
                />
            )}
            
            {/* Mobile Sidebar */}
            {isMobile && (
                <div className={`fixed inset-y-0 left-0 z-50 w-52 transform transition-transform duration-300 ${
                    isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>
                    <div className="relative w-full h-full">
                        {/* Close Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-4 right-4 z-10 bg-background/80 backdrop-blur-sm"
                            onClick={() => setIsMobileSidebarOpen(false)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                        
                        <Sidebar 
                            className="w-full h-full"
                            isCollapsed={false}
                            onMobileClose={() => setIsMobileSidebarOpen(false)}
                        />
                    </div>
                </div>
            )}
            
            {/* Main Content */}
            <div className="flex flex-1 flex-col min-h-0">
                {/* Header */}
                <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 px-6">
                    {/* Left side - Search and collapse toggle */}
                    <div className="flex items-center space-x-4">
                        {/* Sidebar Toggle (only when collapsed or on mobile) */}
                        {(isMobile || isSidebarCollapsed) && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                    if (isMobile) {
                                        setIsMobileSidebarOpen(!isMobileSidebarOpen);
                                    } else {
                                        setIsSidebarCollapsed(false);
                                    }
                                }}
                            >
                                <Menu className="h-5 w-5 text-slate-500" />
                            </Button>
                        )}

                        {/* Search Input Box */}
                        <div className="relative w-64 select-none hidden sm:block">
                            <input
                                type="text"
                                placeholder="Search"
                                className="w-full h-9 pl-9 pr-8 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white dark:bg-zinc-900/60 dark:border-zinc-800 dark:focus:border-indigo-400 transition-all text-slate-800 dark:text-slate-200"
                            />
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <kbd className="absolute right-2 top-2 h-5 select-none items-center gap-0.5 rounded border border-slate-200 bg-white px-1.5 text-[9px] font-medium text-slate-400 opacity-100 flex dark:border-zinc-800 dark:bg-zinc-950">
                                <span>⌘</span><span>K</span>
                            </kbd>
                        </div>
                    </div>

                    {/* Right side - Header Actions */}
                    <div className="flex items-center space-x-2 md:space-x-4">
                        {/* Academic Year Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center gap-1.5 h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 shadow-sm">
                                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                    <span className="hidden md:inline">Academic Year : 2024 / 2025</span>
                                    <span className="inline md:hidden">2024 / 2025</span>
                                    <ChevronDown className="h-3 w-3 text-slate-400" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-48" align="end">
                                <DropdownMenuLabel className="text-xs text-slate-400 font-normal">Select Academic Year</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-xs font-semibold cursor-pointer">Academic Year : 2024 / 2025</DropdownMenuItem>
                                <DropdownMenuItem className="text-xs font-semibold cursor-pointer">Academic Year : 2023 / 2024</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* US Flag / Language Selector */}
                        <button className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors">
                            <span className="text-base select-none">🇺🇸</span>
                        </button>

                        {/* Target/Bullseye Icon */}
                        <button className="hidden sm:flex h-9 w-9 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-500 dark:text-zinc-400 transition-colors">
                            <Target className="h-4.5 w-4.5" />
                        </button>

                        {/* Theme Toggle Button */}
                        <button 
                            onClick={cycleTheme}
                            className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-500 dark:text-zinc-400 transition-colors"
                            title={`Current theme: ${appearance}. Click to cycle through themes.`}
                        >
                            {getCurrentThemeIcon()}
                        </button>

                        {/* Notifications */}
                        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-500 dark:text-zinc-400 transition-colors">
                            <Bell className="h-4.5 w-4.5" />
                            <span className="absolute top-2 right-2 flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                            </span>
                        </button>

                        {/* Chat/Message Icon */}
                        <button className="hidden sm:flex h-9 w-9 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-500 dark:text-zinc-400 transition-colors">
                            <MessageSquare className="h-4.5 w-4.5" />
                        </button>

                        {/* Graph/Chart Icon */}
                        <button className="hidden sm:flex h-9 w-9 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-500 dark:text-zinc-400 transition-colors">
                            <BarChart3 className="h-4.5 w-4.5" />
                        </button>

                        {/* Fullscreen Toggle */}
                        <button 
                            onClick={() => {
                                if (!document.fullscreenElement) {
                                    document.documentElement.requestFullscreen();
                                } else if (document.exitFullscreen) {
                                    document.exitFullscreen();
                                }
                            }}
                            className="hidden sm:flex h-9 w-9 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-500 dark:text-zinc-400 transition-colors"
                        >
                            <Maximize className="h-4.5 w-4.5" />
                        </button>

                        {/* User Menu */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage src={user.avatar} alt={user.name} />
                                        <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                            {getInitials(user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end">
                                <UserMenuContent user={user} />
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>
                
                {/* Page Content */}
                <main className="flex-1 overflow-auto">
                    {children}
                </main>
            </div>
            
            {/* Global SweetAlert */}
            <SweetAlert />
        </div>
    );
}