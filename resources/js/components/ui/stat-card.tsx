import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

type Color = 'blue' | 'green' | 'rose' | 'red' | 'amber' | 'orange' | 'purple' | 'indigo' | 'cyan' | 'teal' | 'fuchsia' | 'sky' | 'slate' | 'emerald' | 'violet' | 'pink';
type Trend = 'up' | 'down' | 'stable';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ComponentType<{ className?: string }>;
    color?: Color;
    trend?: Trend;
    trendLabel?: string;
    subtitle?: string;
    className?: string;
}

const colorMap: Record<Color, {
    card: string;
    border: string;
    iconBg: string;
    iconText: string;
    valueText: string;
    trendUp: string;
    trendDown: string;
}> = {
    blue:    { card: 'bg-blue-50/60',    border: 'border-blue-200',    iconBg: 'bg-blue-100',    iconText: 'text-blue-600',    valueText: 'text-blue-900',    trendUp: 'text-blue-600',    trendDown: 'text-red-500' },
    green:   { card: 'bg-green-50/60',   border: 'border-green-200',   iconBg: 'bg-green-100',   iconText: 'text-green-600',   valueText: 'text-green-900',   trendUp: 'text-green-600',   trendDown: 'text-red-500' },
    emerald: { card: 'bg-emerald-50/60', border: 'border-emerald-200', iconBg: 'bg-emerald-100', iconText: 'text-emerald-600', valueText: 'text-emerald-900', trendUp: 'text-emerald-600', trendDown: 'text-red-500' },
    rose:    { card: 'bg-rose-50/60',    border: 'border-rose-200',    iconBg: 'bg-rose-100',    iconText: 'text-rose-600',    valueText: 'text-rose-900',    trendUp: 'text-green-600',   trendDown: 'text-rose-600' },
    red:     { card: 'bg-red-50/60',     border: 'border-red-200',     iconBg: 'bg-red-100',     iconText: 'text-red-600',     valueText: 'text-red-900',     trendUp: 'text-green-600',   trendDown: 'text-red-600' },
    amber:   { card: 'bg-amber-50/60',   border: 'border-amber-200',   iconBg: 'bg-amber-100',   iconText: 'text-amber-600',   valueText: 'text-amber-900',   trendUp: 'text-green-600',   trendDown: 'text-red-500' },
    orange:  { card: 'bg-orange-50/60',  border: 'border-orange-200',  iconBg: 'bg-orange-100',  iconText: 'text-orange-600',  valueText: 'text-orange-900',  trendUp: 'text-green-600',   trendDown: 'text-red-500' },
    purple:  { card: 'bg-purple-50/60',  border: 'border-purple-200',  iconBg: 'bg-purple-100',  iconText: 'text-purple-600',  valueText: 'text-purple-900',  trendUp: 'text-green-600',   trendDown: 'text-red-500' },
    indigo:  { card: 'bg-indigo-50/60',  border: 'border-indigo-200',  iconBg: 'bg-indigo-100',  iconText: 'text-indigo-600',  valueText: 'text-indigo-900',  trendUp: 'text-green-600',   trendDown: 'text-red-500' },
    violet:  { card: 'bg-violet-50/60',  border: 'border-violet-200',  iconBg: 'bg-violet-100',  iconText: 'text-violet-600',  valueText: 'text-violet-900',  trendUp: 'text-green-600',   trendDown: 'text-red-500' },
    cyan:    { card: 'bg-cyan-50/60',    border: 'border-cyan-200',    iconBg: 'bg-cyan-100',    iconText: 'text-cyan-600',    valueText: 'text-cyan-900',    trendUp: 'text-green-600',   trendDown: 'text-red-500' },
    teal:    { card: 'bg-teal-50/60',    border: 'border-teal-200',    iconBg: 'bg-teal-100',    iconText: 'text-teal-600',    valueText: 'text-teal-900',    trendUp: 'text-green-600',   trendDown: 'text-red-500' },
    sky:     { card: 'bg-sky-50/60',     border: 'border-sky-200',     iconBg: 'bg-sky-100',     iconText: 'text-sky-600',     valueText: 'text-sky-900',     trendUp: 'text-green-600',   trendDown: 'text-red-500' },
    fuchsia: { card: 'bg-fuchsia-50/60', border: 'border-fuchsia-200', iconBg: 'bg-fuchsia-100', iconText: 'text-fuchsia-600', valueText: 'text-fuchsia-900', trendUp: 'text-green-600',   trendDown: 'text-red-500' },
    pink:    { card: 'bg-pink-50/60',    border: 'border-pink-200',    iconBg: 'bg-pink-100',    iconText: 'text-pink-600',    valueText: 'text-pink-900',    trendUp: 'text-green-600',   trendDown: 'text-red-500' },
    slate:   { card: 'bg-slate-50/60',   border: 'border-slate-200',   iconBg: 'bg-slate-100',   iconText: 'text-slate-600',   valueText: 'text-slate-900',   trendUp: 'text-green-600',   trendDown: 'text-red-500' },
};

export function StatCard({ title, value, icon: Icon, color = 'blue', trend = 'stable', trendLabel, subtitle, className }: StatCardProps) {
    const c = colorMap[color];

    const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
    const trendColor = trend === 'up' ? c.trendUp : trend === 'down' ? c.trendDown : 'text-slate-400';
    const trendText = trendLabel ?? (trend === 'stable' ? 'Stable' : trend === 'up' ? 'Up' : 'Down');

    return (
        <div className={cn(
            'flex flex-col gap-2 rounded-xl border p-3.5 transition-shadow hover:shadow-md',
            c.card,
            c.border,
            className,
        )}>
            {/* Top row: icon + trend */}
            <div className="flex items-center justify-between">
                <span className={cn('flex h-8 w-8 items-center justify-center rounded-lg', c.iconBg)}>
                    <Icon className={cn('h-4 w-4', c.iconText)} />
                </span>
                <span className={cn('flex items-center gap-1 text-[11px] font-medium', trendColor)}>
                    <TrendIcon className="h-3 w-3" />
                    {trendText}
                </span>
            </div>

            {/* Value + title */}
            <div className="min-w-0">
                <p className={cn('text-xl font-bold leading-tight truncate', c.valueText)}>
                    {typeof value === 'number' ? value.toLocaleString() : value}
                </p>
                <p className="mt-0.5 text-[12px] text-slate-500 truncate">{title}</p>
                {subtitle && (
                    <p className="text-[11px] text-slate-400 truncate">{subtitle}</p>
                )}
            </div>
        </div>
    );
}

/** Responsive grid wrapper — 2 cols on mobile, up to 6 on xl */
export function StatGrid({ children, cols = 4 }: { children: React.ReactNode; cols?: 2 | 3 | 4 | 5 | 6 | 8 }) {
    const colClass: Record<number, string> = {
        2: 'grid-cols-1 sm:grid-cols-2',
        3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-4',
        5: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5',
        6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6',
        8: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8',
    };
    return (
        <div className={cn('grid gap-3', colClass[cols])}>
            {children}
        </div>
    );
}
