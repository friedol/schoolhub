import { useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { SharedData } from '@/types';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Building2,
    ChevronDown,
    ChevronRight,
    Home,
    Users,
    GraduationCap,
    BookOpen,
    Calculator,
    Library,
    Package,
    Bus,
    Building,
    MessageSquare,
    BarChart3,
    Settings,
    User,
    School,
    Layers,
    ClipboardList,
    Calendar,
    FileText,
    CreditCard,
    Book,
    Truck,
    Bed,
    Bell,
    PieChart,
    Shield,
    LogOut,
    Database,
    DollarSign,
    Lightbulb,
    StickyNote,
    Megaphone,
    IdCard,
    UserCheck,
    Wrench,
    Menu,
} from 'lucide-react';

type LucideIcon = React.ComponentType<{ className?: string }>;

interface NavChild {
    name: string;
    href: string;
    icon: LucideIcon;
    children?: NavChild[];
}

interface NavGroup {
    name: string;
    icon: LucideIcon;
    roles: string[];
    /** Tailwind classes: bg + text for the header icon pill */
    pill: string;
    /** Tailwind text class for child icons */
    iconColor: string;
    /** Tailwind classes for the active child item background */
    activeBg: string;
    /** Tailwind text class for the active child item */
    activeText: string;
    children: NavChild[];
}

interface SidebarProps {
    className?: string;
    isCollapsed?: boolean;
    onMobileClose?: () => void;
    onToggleCollapse?: () => void;
}

/* ─── colour palette per domain ─────────────────────────────────── */
const NAV_GROUPS: NavGroup[] = [
    /* ── Super-admin ─────────────────────────────────── */
    {
        name: 'Platform',
        icon: Building2,
        roles: ['super_admin'],
        pill: 'bg-violet-100 text-violet-600',
        iconColor: 'text-violet-500',
        activeBg: 'bg-violet-50',
        activeText: 'text-violet-700',
        children: [
            { name: 'Overview',   href: '/super-admin/dashboard', icon: PieChart },
            { name: 'Schools',    href: '/super-admin/schools',   icon: School },
            { name: 'Analytics',  href: '/super-admin/analytics', icon: BarChart3 },
            { name: 'Settings',   href: '/super-admin/settings',  icon: Settings },
        ],
    },


    /* ── Academic ────────────────────────────────────── */
    {
        name: 'Academic',
        icon: GraduationCap,
        roles: ['school_admin', 'headteacher', 'teacher', 'academic_master'],
        pill: 'bg-indigo-100 text-indigo-600',
        iconColor: 'text-indigo-500',
        activeBg: 'bg-indigo-50',
        activeText: 'text-indigo-700',
        children: [
            { name: 'Curriculum',   href: '/academic/curriculum',    icon: BookOpen },
            {
                name: 'Classes', href: '/academic/classes', icon: Users,
                children: [
                    { name: 'All Classes', href: '/academic/classes',          icon: Users },
                    { name: 'Schedule',    href: '/academic/classes/schedule', icon: Calendar },
                ],
            },
            { name: 'Sections',     href: '/academic/sections',       icon: Layers },
            { name: 'Class Rooms', href: '/academic/rooms', icon: Building },
            { name: 'Subjects',     href: '/academic/subjects',       icon: Book },
            { name: 'Timetable',    href: '/academic/timetable',      icon: Calendar },
            { name: 'Class Routine', href: '/academic/class-routine', icon: Calendar },
            { name: 'Assessments',  href: '/academic/assessments',    icon: ClipboardList },
        ],
    },

    /* ── Examinations ─────────────────────────────────── */
    {
        name: 'Examinations',
        icon: ClipboardList,
        roles: ['school_admin', 'headteacher', 'teacher', 'academic_master'],
        pill: 'bg-violet-100 text-violet-600',
        iconColor: 'text-violet-500',
        activeBg: 'bg-violet-50',
        activeText: 'text-violet-700',
        children: [
            { name: 'Examination Timetable', href: '/academic/examinations/routine', icon: Calendar },
            { name: 'Exam Result',           href: '/academic/exam-results',          icon: BarChart3 },
            { name: 'Sitting Plan Generator', href: '/academic/sitting-plans/generator', icon: Settings },
            { name: 'Seat Allocation', href: '/academic/sitting-plans/allocations', icon: Users },
            { name: 'Student Sitting Plan', href: '/academic/sitting-plans/student', icon: User },
            { name: 'Room Candidate List', href: '/academic/sitting-plans/candidate-list', icon: FileText },
            { name: 'Invigilator Assignment', href: '/academic/sitting-plans/invigilators', icon: UserCheck },
            { name: 'Attendance Sheets', href: '/academic/sitting-plans/attendance-sheets', icon: ClipboardList },
            { name: 'Sitting Plan Reports', href: '/academic/sitting-plans/reports', icon: BarChart3 },
        ],
    },

    /* ── Results ──────────────────────────────────────── */
    {
        name: 'Results',
        icon: Shield,
        roles: ['school_admin', 'headteacher', 'teacher', 'academic_master'],
        pill: 'bg-rose-100 text-rose-600',
        iconColor: 'text-rose-500',
        activeBg: 'bg-rose-50',
        activeText: 'text-rose-700',
        children: [
            { name: 'Report Cards', href: '/academic/report-cards',   icon: FileText },
            { name: 'Marks Entry', href: '/academic/marks-entry', icon: ClipboardList },
            { name: 'Results Approvals', href: '/academic/results-approvals', icon: Shield },
            { name: 'Grading Scales', href: '/academic/grading-scales', icon: Settings },
        ],
    },

    /* ── Students ────────────────────────────────────── */
    {
        name: 'Students',
        icon: Users,
        roles: ['school_admin', 'headteacher', 'teacher', 'academic_master'],
        pill: 'bg-emerald-100 text-emerald-600',
        iconColor: 'text-emerald-500',
        activeBg: 'bg-emerald-50',
        activeText: 'text-emerald-700',
        children: [
            { name: 'Student List',          href: '/students/profiles',          icon: UserCheck },
            { name: 'Attendance',        href: '/students/attendance',        icon: Calendar },
            { name: 'Mark Attendance',   href: '/students/attendance/mark',   icon: ClipboardList },
            { name: 'Parents & Guardians', href: '/students/parents',         icon: Users },
            { name: 'Promotions',        href: '/students/promotions',        icon: GraduationCap },
            { name: 'Alumni',            href: '/students/alumni',            icon: Users },
        ],
    },

    /* ── Staff & HR ──────────────────────────────────── */
    {
        name: 'Staff & HR',
        icon: Users,
        roles: ['school_admin', 'headteacher', 'academic_master'],
        pill: 'bg-amber-100 text-amber-600',
        iconColor: 'text-amber-500',
        activeBg: 'bg-amber-50',
        activeText: 'text-amber-700',
        children: [
            { name: 'Teachers',    href: '/school-admin/teachers', icon: GraduationCap },
            { name: 'Staff',       href: '/hr/staff',              icon: User },
            { name: 'Payroll',     href: '/hr/payroll',            icon: CreditCard },
            { name: 'Leave',       href: '/hr/leave',              icon: Calendar },
            { name: 'Performance', href: '/hr/performance',        icon: BarChart3 },
            { name: 'Attendance',  href: '/hr/attendance',         icon: Calendar },
        ],
    },

    /* ── Finance ─────────────────────────────────────── */
    {
        name: 'Finance',
        icon: DollarSign,
        roles: ['school_admin', 'headteacher', 'bursar', 'academic_master'],
        pill: 'bg-green-100 text-green-600',
        iconColor: 'text-green-500',
        activeBg: 'bg-green-50',
        activeText: 'text-green-700',
        children: [
            { name: 'Overview',       href: '/finance/dashboard',       icon: PieChart },
            {
                name: 'Fees Collection', href: '/finance/fees-collection/fees-group', icon: CreditCard,
                children: [
                    { name: 'Fees Group',  href: '/finance/fees-collection/fees-group',  icon: Layers },
                    { name: 'Fees Type',   href: '/finance/fees-collection/fees-type',   icon: Book },
                    { name: 'Fees Master', href: '/finance/fees-collection/fees-master', icon: FileText },
                ],
            },
            { name: 'Fee Structure',  href: '/finance/fee-categories',  icon: DollarSign },
            { name: 'Student Fees',   href: '/finance/student-fees',    icon: FileText },
            { name: 'Payments',       href: '/finance/payments',        icon: CreditCard },
            { name: 'Payment Plans',  href: '/finance/payment-plans',   icon: FileText },
            { name: 'Budget',         href: '/finance/budget',          icon: BarChart3 },
            { name: 'Reports',        href: '/finance/reports',         icon: BarChart3 },
            { name: 'Transactions',   href: '/finance/transactions',    icon: Calculator },
        ],
    },

    /* ── Library ─────────────────────────────────────── */
    {
        name: 'Library',
        icon: Library,
        roles: ['school_admin', 'headteacher', 'teacher', 'librarian', 'academic_master'],
        pill: 'bg-purple-100 text-purple-600',
        iconColor: 'text-purple-500',
        activeBg: 'bg-purple-50',
        activeText: 'text-purple-700',
        children: [
            { name: 'Overview',     href: '/library/dashboard', icon: Home },
            { name: 'Books',        href: '/library/books',     icon: Book },
            { name: 'Circulation',  href: '/library/issuance',  icon: BookOpen },
            { name: 'Fines',        href: '/library/fines',     icon: CreditCard },
            { name: 'Reports',      href: '/library/reports',   icon: BarChart3 },
        ],
    },

    /* ── Inventory ───────────────────────────────────── */
    {
        name: 'Inventory',
        icon: Package,
        roles: ['school_admin', 'headteacher', 'academic_master'],
        pill: 'bg-orange-100 text-orange-600',
        iconColor: 'text-orange-500',
        activeBg: 'bg-orange-50',
        activeText: 'text-orange-700',
        children: [
            { name: 'Items',           href: '/inventory/items',           icon: Package },
            { name: 'Purchase Orders', href: '/inventory/purchase-orders', icon: FileText },
            { name: 'Transactions',    href: '/inventory/transactions',    icon: Calculator },
            { name: 'Asset Assign.',   href: '/inventory/assignments',     icon: Users },
            { name: 'Reports',         href: '/inventory/reports',         icon: BarChart3 },
        ],
    },

    /* ── Transport ───────────────────────────────────── */
    {
        name: 'Transport',
        icon: Bus,
        roles: ['school_admin', 'headteacher', 'academic_master'],
        pill: 'bg-cyan-100 text-cyan-600',
        iconColor: 'text-cyan-500',
        activeBg: 'bg-cyan-50',
        activeText: 'text-cyan-700',
        children: [
            { name: 'Overview',     href: '/transport/dashboard',    icon: Home },
            { name: 'Vehicles',     href: '/transport/vehicles',     icon: Truck },
            { name: 'Routes',       href: '/transport/routes',       icon: Bus },
            { name: 'Assignments',  href: '/transport/assignments',  icon: Users },
            { name: 'Trips',        href: '/transport/trips',        icon: Calendar },
            { name: 'Maintenance',  href: '/transport/maintenance',  icon: Wrench },
        ],
    },

    /* ── Hostel ──────────────────────────────────────── */
    {
        name: 'Hostel',
        icon: Building,
        roles: ['school_admin', 'headteacher', 'dormitory_manager', 'academic_master'],
        pill: 'bg-rose-100 text-rose-600',
        iconColor: 'text-rose-500',
        activeBg: 'bg-rose-50',
        activeText: 'text-rose-700',
        children: [
            { name: 'Overview',      href: '/hostel/dashboard',     icon: Home },
            { name: 'Hostels',       href: '/hostel/hostels',       icon: Building },
            { name: 'Residents',     href: '/hostel/residents',     icon: Users },
            { name: 'Leave Records', href: '/hostel/leave-records', icon: Calendar },
            { name: 'Inventory',     href: '/hostel/inventory',     icon: Package },
            { name: 'Maintenance',   href: '/hostel/maintenance',   icon: Wrench },
            { name: 'Reports',       href: '/hostel/reports',       icon: BarChart3 },
        ],
    },

    /* ── Communication ───────────────────────────────── */
    {
        name: 'Communication',
        icon: MessageSquare,
        roles: ['school_admin', 'headteacher', 'teacher', 'academic_master'],
        pill: 'bg-sky-100 text-sky-600',
        iconColor: 'text-sky-500',
        activeBg: 'bg-sky-50',
        activeText: 'text-sky-700',
        children: [
            { name: 'Messages',      href: '/communication/messages',       icon: MessageSquare },
            { name: 'Announcements', href: '/communication/announcements',   icon: Megaphone },
            { name: 'Notice Board',  href: '/communication/notice-board',    icon: StickyNote },
            { name: 'Suggestions',   href: '/communication/suggestions',     icon: Lightbulb },
            { name: 'Events',        href: '/communication/events',          icon: Calendar },
            { name: 'Meetings',      href: '/communication/meeting-requests',icon: Users },
            { name: 'SMS',           href: '/communication/sms',             icon: MessageSquare },
        ],
    },

    /* ── Reports ─────────────────────────────────────── */
    {
        name: 'Reports',
        icon: BarChart3,
        roles: ['school_admin', 'headteacher', 'bursar', 'teacher', 'academic_master'],
        pill: 'bg-teal-100 text-teal-600',
        iconColor: 'text-teal-500',
        activeBg: 'bg-teal-50',
        activeText: 'text-teal-700',
        children: [
            { name: 'Academic',     href: '/reports/academic',    icon: GraduationCap },
            { name: 'Financial',    href: '/reports/financial',   icon: DollarSign },
            { name: 'Attendance',   href: '/reports/attendance',  icon: Calendar },
            { name: 'Custom',       href: '/reports/custom',      icon: BarChart3 },
        ],
    },

    /* ── ID Cards ────────────────────────────────────── */
    {
        name: 'ID Cards',
        icon: IdCard,
        roles: ['school_admin', 'headteacher'],
        pill: 'bg-fuchsia-100 text-fuchsia-600',
        iconColor: 'text-fuchsia-500',
        activeBg: 'bg-fuchsia-50',
        activeText: 'text-fuchsia-700',
        children: [
            { name: 'All Cards',     href: '/id-cards',          icon: IdCard },
            { name: 'Print Card',    href: '/id-cards',          icon: FileText },
        ],
    },

    /* ── System ──────────────────────────────────────── */
    {
        name: 'System',
        icon: Settings,
        roles: ['school_admin', 'headteacher', 'super_admin', 'academic_master'],
        pill: 'bg-slate-100 text-slate-600',
        iconColor: 'text-slate-500',
        activeBg: 'bg-slate-100',
        activeText: 'text-slate-700',
        children: [
            { name: 'Roles',          href: '/system/roles',           icon: Shield },
            { name: 'Audit Logs',     href: '/system/audit-logs',      icon: FileText },
            { name: 'Backups',        href: '/system/backups',         icon: Database },
            { name: 'Holidays',       href: '/system/holidays',        icon: Calendar },
            { name: 'Configuration',  href: '/system/configurations',  icon: Settings },
        ],
    },

    /* ── Student self ────────────────────────────────── */
    {
        name: 'My Academics',
        icon: GraduationCap,
        roles: ['student'],
        pill: 'bg-indigo-100 text-indigo-600',
        iconColor: 'text-indigo-500',
        activeBg: 'bg-indigo-50',
        activeText: 'text-indigo-700',
        children: [
            { name: 'My Results',     href: '/student/results',     icon: FileText },
            { name: 'Timetable',      href: '/student/timetable',   icon: Calendar },
            { name: 'Attendance',     href: '/student/attendance',  icon: Calendar },
            { name: 'Assignments',    href: '/student/assignments', icon: ClipboardList },
        ],
    },
    {
        name: 'Library',
        icon: Library,
        roles: ['student'],
        pill: 'bg-purple-100 text-purple-600',
        iconColor: 'text-purple-500',
        activeBg: 'bg-purple-50',
        activeText: 'text-purple-700',
        children: [
            { name: 'Borrowed Books', href: '/student/borrowed-books', icon: Book },
            { name: 'Books',          href: '/student/book-catalog',   icon: BookOpen },
            { name: 'Fines',          href: '/student/fines',          icon: CreditCard },
        ],
    },
    {
        name: 'Communication',
        icon: MessageSquare,
        roles: ['student'],
        pill: 'bg-sky-100 text-sky-600',
        iconColor: 'text-sky-500',
        activeBg: 'bg-sky-50',
        activeText: 'text-sky-700',
        children: [
            { name: 'Messages',     href: '/communication/messages',      icon: MessageSquare },
            { name: 'Notice Board', href: '/communication/notice-board',  icon: StickyNote },
        ],
    },

    /* ── Parent ──────────────────────────────────────── */
    {
        name: 'My Children',
        icon: Users,
        roles: ['parent'],
        pill: 'bg-amber-100 text-amber-600',
        iconColor: 'text-amber-500',
        activeBg: 'bg-amber-50',
        activeText: 'text-amber-700',
        children: [
            { name: 'Profiles',         href: '/parent/children',          icon: User },
            { name: 'Progress',         href: '/parent/academic-progress', icon: GraduationCap },
            { name: 'Attendance',       href: '/parent/attendance',        icon: Calendar },
            { name: 'Fee Payments',     href: '/parent/fee-payments',      icon: CreditCard },
        ],
    },
    {
        name: 'Communication',
        icon: MessageSquare,
        roles: ['parent'],
        pill: 'bg-sky-100 text-sky-600',
        iconColor: 'text-sky-500',
        activeBg: 'bg-sky-50',
        activeText: 'text-sky-700',
        children: [
            { name: 'Messages',       href: '/parent/messages',       icon: MessageSquare },
            { name: 'Announcements',  href: '/parent/announcements',  icon: Bell },
        ],
    },

    /* ── Bursar ──────────────────────────────────────── */
    {
        name: 'Finance',
        icon: DollarSign,
        roles: ['bursar'],
        pill: 'bg-green-100 text-green-600',
        iconColor: 'text-green-500',
        activeBg: 'bg-green-50',
        activeText: 'text-green-700',
        children: [
            { name: 'Overview',      href: '/bursar/dashboard',      icon: PieChart },
            {
                name: 'Fees Collection', href: '/finance/fees-collection/fees-group', icon: CreditCard,
                children: [
                    { name: 'Fees Group',  href: '/finance/fees-collection/fees-group',  icon: Layers },
                    { name: 'Fees Type',   href: '/finance/fees-collection/fees-type',   icon: Book },
                    { name: 'Fees Master', href: '/finance/fees-collection/fees-master', icon: FileText },
                ],
            },
            { name: 'Fee Structure', href: '/finance/fee-categories', icon: DollarSign },
            { name: 'Student Fees',  href: '/finance/student-fees',   icon: FileText },
            { name: 'Payments',      href: '/finance/payments',       icon: CreditCard },
            { name: 'Payment Plans', href: '/finance/payment-plans',  icon: FileText },
            { name: 'Budget',        href: '/finance/budget',         icon: BarChart3 },
            { name: 'Reports',       href: '/finance/reports',        icon: BarChart3 },
        ],
    },
];

/* ─── Nested sub-item (item with its own children) ──────────────── */
function NavSubGroup({
    child,
    currentUrl,
    group,
    onMobileClose,
}: {
    child: NavChild;
    currentUrl: string;
    group: NavGroup;
    onMobileClose?: () => void;
}) {
    const isAnySubActive = child.children?.some(c => currentUrl.startsWith(c.href)) ?? false;
    const [open, setOpen] = useState(isAnySubActive);

    return (
        <div>
            <button
                onClick={() => setOpen(!open)}
                className={cn(
                    'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[12px] font-medium transition-colors',
                    isAnySubActive
                        ? cn(group.activeBg, group.activeText)
                        : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground',
                )}
            >
                <child.icon className={cn('h-3.5 w-3.5 shrink-0', isAnySubActive ? group.activeText : group.iconColor)} />
                <span className="flex-1 text-left truncate">{child.name}</span>
                {open
                    ? <ChevronDown className="h-3 w-3 shrink-0 opacity-40" />
                    : <ChevronRight className="h-3 w-3 shrink-0 opacity-40" />
                }
            </button>
            {open && (
                <div className="ml-4 mt-0.5 border-l border-sidebar-border pl-2 space-y-0.5">
                    {child.children?.map(sub => {
                        const active = currentUrl === sub.href || currentUrl.startsWith(sub.href + '/');
                        return (
                            <Link
                                key={sub.href}
                                href={sub.href}
                                onClick={onMobileClose}
                                className={cn(
                                    'flex items-center gap-2 rounded-md px-2 py-1.5 text-[12px] font-medium transition-colors',
                                    active
                                        ? cn(group.activeBg, group.activeText)
                                        : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground',
                                )}
                            >
                                <sub.icon className={cn('h-3 w-3 shrink-0', active ? group.activeText : group.iconColor)} />
                                <span className="truncate">{sub.name}</span>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

/* ─── Collapsible group component ───────────────────────────────── */
function NavGroupSection({
    group,
    currentUrl,
    isCollapsed,
    onMobileClose,
}: {
    group: NavGroup;
    currentUrl: string;
    isCollapsed: boolean;
    onMobileClose?: () => void;
}) {
    const isAnyChildActive = group.children.some(c =>
        c.children
            ? c.children.some(sub => currentUrl.startsWith(sub.href))
            : currentUrl.startsWith(c.href)
    );
    const [open, setOpen] = useState(isAnyChildActive);

    if (isCollapsed) {
        /* collapsed: show only the icon pill, tooltip via title */
        return (
            <div className="flex flex-col items-center gap-0.5 py-0.5">
                <button
                    title={group.name}
                    onClick={() => setOpen(!open)}
                    className={cn(
                        'flex h-9 w-9 items-center justify-center rounded-lg transition-colors',
                        isAnyChildActive ? group.activeBg : 'hover:bg-sidebar-accent',
                    )}
                >
                    <span className={cn('flex h-7 w-7 items-center justify-center rounded-md', group.pill)}>
                        <group.icon className="h-4 w-4" />
                    </span>
                </button>
            </div>
        );
    }

    return (
        <div className="mb-0.5">
            {/* Group header */}
            <button
                onClick={() => setOpen(!open)}
                className={cn(
                    'flex w-full items-center gap-2 rounded-lg px-2 py-1.5 transition-colors',
                    isAnyChildActive
                        ? 'bg-sidebar-accent'
                        : 'hover:bg-sidebar-accent/60',
                )}
            >
                {/* Coloured icon pill */}
                <span className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-md',
                    group.pill,
                )}>
                    <group.icon className="h-3.5 w-3.5" />
                </span>

                <span className="flex-1 text-left text-[12px] font-semibold tracking-wide text-sidebar-foreground/80 truncate">
                    {group.name}
                </span>

                {open
                    ? <ChevronDown className="h-3 w-3 shrink-0 text-sidebar-foreground/40" />
                    : <ChevronRight className="h-3 w-3 shrink-0 text-sidebar-foreground/40" />
                }
            </button>

            {/* Children */}
            {open && (
                <div className="ml-3 mt-0.5 border-l-2 border-sidebar-border pl-2 space-y-0.5">
                    {group.children.map((child) => {
                        if (child.children?.length) {
                            return (
                                <NavSubGroup
                                    key={child.href}
                                    child={child}
                                    currentUrl={currentUrl}
                                    group={group}
                                    onMobileClose={onMobileClose}
                                />
                            );
                        }
                        const active = currentUrl === child.href || currentUrl.startsWith(child.href + '/');
                        return (
                            <Link
                                key={child.href}
                                href={child.href}
                                onClick={onMobileClose}
                                className={cn(
                                    'flex items-center gap-2 rounded-md px-2 py-1.5 text-[12px] font-medium transition-colors',
                                    active
                                        ? cn(group.activeBg, group.activeText)
                                        : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground',
                                )}
                            >
                                <child.icon className={cn(
                                    'h-3.5 w-3.5 shrink-0',
                                    active ? group.activeText : group.iconColor,
                                )} />
                                <span className="truncate">{child.name}</span>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

/* ─── Sidebar shell ──────────────────────────────────────────────── */
export default function Sidebar({ className, isCollapsed = false, onMobileClose, onToggleCollapse }: SidebarProps) {
    const { props } = usePage<SharedData>();
    const user = props.auth.user;
    const currentUrl = window.location.pathname;
    
    // Get current school and available schools from shared props
    const currentSchool = props.currentSchool as any;
    const schoolsList = props.schools as any[];

    const visibleGroups = NAV_GROUPS.filter(g => g.roles.includes(user.role as string));

    const roleLabel: Record<string, string> = {
        super_admin: 'Super Admin',
        school_admin: 'School Admin',
        headteacher: 'Head Teacher',
        bursar: 'Bursar',
        teacher: 'Teacher',
        student: 'Student',
        parent: 'Parent',
        librarian: 'Librarian',
        dormitory_manager: 'Dorm. Manager',
        academic_master: 'Academic Master',
    };

    const switchSchool = (schoolCode: string) => {
        const hostname = window.location.hostname;
        const protocol = window.location.protocol;
        let port = '8000';
        if (schoolCode === 'SMSS') port = '8001';
        if (schoolCode === 'KIS') port = '8002';
        window.location.href = `${protocol}//${hostname}:${port}/school-admin/dashboard`;
    };

    return (
        <div className={cn(
            'flex h-full flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground bg-white dark:bg-zinc-950',
            className,
        )}>
            {/* ── Logo header ───────────────────────────────── */}
            <div className={cn(
                'flex h-14 shrink-0 items-center border-b border-sidebar-border px-3',
                isCollapsed ? 'justify-center' : 'justify-between',
            )}>
                <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-md">
                        <GraduationCap className="h-5 w-5" />
                    </div>
                    {!isCollapsed && (
                        <div className="flex items-center min-w-0 select-none">
                            <span className="text-lg font-normal text-slate-800 dark:text-slate-100">Pre</span>
                            <span className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400">Skool</span>
                        </div>
                    )}
                </div>
                {!isCollapsed && onToggleCollapse && (
                    <button
                        onClick={onToggleCollapse}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-900"
                    >
                        <Menu className="h-4.5 w-4.5" />
                    </button>
                )}
            </div>

            {/* ── School Selector Dropdown ─────────────────── */}
            <div className="px-3 pt-3">
                {isCollapsed ? (
                    <div className="flex justify-center">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50 border border-slate-200 text-slate-600 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 shadow-sm" title={currentSchool?.name || 'Global International'}>
                            <School className="h-4.5 w-4.5 text-indigo-500" />
                        </div>
                    </div>
                ) : (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-white p-2 text-left shadow-sm hover:bg-slate-50 transition-all dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800/80">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                                    <School className="h-4.5 w-4.5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[12px] font-bold text-slate-800 dark:text-slate-200 leading-tight truncate">
                                        {currentSchool?.name || 'Global International'}
                                    </p>
                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-none truncate">
                                        {currentSchool?.code || 'Platform'}
                                    </p>
                                </div>
                                <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="start">
                            <DropdownMenuLabel className="text-xs text-slate-400 font-normal">Switch School</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {schoolsList && schoolsList.length > 0 ? (
                                schoolsList.map((sch: any) => (
                                    <DropdownMenuItem 
                                        key={sch.id} 
                                        onClick={() => switchSchool(sch.code)}
                                        className={cn(
                                            "flex flex-col items-start gap-0.5 cursor-pointer py-1.5 px-2.5",
                                            currentSchool?.id === sch.id && "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-300"
                                        )}
                                    >
                                        <span className="font-semibold text-xs">{sch.name}</span>
                                        <span className="text-[10px] text-slate-400 dark:text-slate-500">{sch.code}</span>
                                    </DropdownMenuItem>
                                ))
                            ) : (
                                <DropdownMenuItem disabled className="text-xs">No other schools</DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>

            {/* ── Dashboard shortcut ────────────────────────── */}
            <div className={cn('px-2 pt-2', isCollapsed && 'flex justify-center')}>
                <Link
                    href="/dashboard"
                    onClick={onMobileClose}
                    className={cn(
                        'flex items-center gap-2 rounded-lg px-2 py-1.5 text-[12px] font-semibold transition-colors',
                        currentUrl === '/dashboard'
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground',
                        isCollapsed && 'justify-center',
                    )}
                    title="Dashboard"
                >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-blue-100 text-blue-600">
                        <Home className="h-3.5 w-3.5" />
                    </span>
                    {!isCollapsed && <span>Dashboard</span>}
                </Link>
            </div>

            {/* ── Navigation groups ─────────────────────────── */}
            <ScrollArea className="flex-1 px-2 py-1">
                <div className={cn('space-y-0.5', isCollapsed && 'flex flex-col items-center')}>
                    {visibleGroups.map((group) => (
                        <NavGroupSection
                            key={group.name + group.roles.join(',')}
                            group={group}
                            currentUrl={currentUrl}
                            isCollapsed={isCollapsed}
                            onMobileClose={onMobileClose}
                        />
                    ))}
                </div>
            </ScrollArea>

            {/* ── Logout ────────────────────────────────────── */}
            <div className={cn(
                'border-t border-sidebar-border p-2',
                isCollapsed ? 'flex justify-center' : '',
            )}>
                <button
                    onClick={() => router.post('/logout')}
                    title="Logout"
                    className={cn(
                        'flex items-center gap-2 rounded-lg px-2 py-1.5 text-[12px] font-medium text-sidebar-foreground/60 hover:bg-rose-50 hover:text-rose-600 transition-colors w-full',
                        isCollapsed && 'justify-center',
                    )}
                >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-rose-100 text-rose-500">
                        <LogOut className="h-3.5 w-3.5" />
                    </span>
                    {!isCollapsed && <span>Logout</span>}
                </button>
            </div>
        </div>
    );
}
