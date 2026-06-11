import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard, StatGrid } from '@/components/ui/stat-card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
    GraduationCap, 
    ArrowLeft, 
    TrendingUp, 
    Award, 
    Users, 
    BookOpen, 
    Percent, 
    Sparkles, 
    Info, 
    BarChart3, 
    Medal,
    Trophy
} from 'lucide-react';

interface Examination {
    id: number;
    name: string;
    exam_type: string;
    start_date: string;
    end_date: string;
}

interface GradeDist {
    grade: string;
    count: number;
    percentage: number;
}

interface ClassComp {
    className: string;
    average: number;
    passRate: number;
}

interface SubjectAnal {
    subjectName: string;
    code: string;
    average: number;
    highest: number;
    lowest: number;
}

interface TopPerf {
    rank: number;
    name: string;
    class: string;
    average: number;
    division: string;
}

interface Props {
    examinations: Examination[];
    selectedExamId: string;
    gradeDistribution: GradeDist[];
    classComparison: ClassComp[];
    subjectAnalysis: SubjectAnal[];
    topPerformers: TopPerf[];
    currentSchool: {
        id: number;
        name: string;
    };
    stats: {
        totalStudents: number;
        averageScore: number;
        overallPassRate: number;
        topGradeCount: number;
    };
}

const getBezierPath = (points: { x: number; y: number }[]) => {
    if (points.length === 0) return '';
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
    
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i];
        const p1 = points[i + 1];
        const cpX1 = p0.x + (p1.x - p0.x) / 3;
        const cpY1 = p0.y;
        const cpX2 = p0.x + 2 * (p1.x - p0.x) / 3;
        const cpY2 = p1.y;
        d += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
    }
    return d;
};

const getAreaPath = (points: { x: number; y: number }[]) => {
    if (points.length === 0) return '';
    const splineD = getBezierPath(points);
    return `${splineD} L ${points[points.length - 1].x} 210 L ${points[0].x} 210 Z`;
};

export default function ExaminationsAnalytics({
    examinations,
    selectedExamId: initialSelectedExamId,
    gradeDistribution,
    classComparison,
    subjectAnalysis,
    topPerformers,
    currentSchool,
    stats
}: Props) {
    const [selectedExamId, setSelectedExamId] = useState<string>(initialSelectedExamId || 'all');
    const [hoveredGrade, setHoveredGrade] = useState<string | null>(null);

    // Dynamic stats that update or simulate data based on selected exam
    const getActiveExamName = () => {
        if (selectedExamId === 'all') return 'All Scheduled Exams';
        const exam = examinations.find(e => e.id.toString() === selectedExamId);
        return exam ? exam.name : 'Selected Exam';
    };

    const handleExamChange = (val: string) => {
        setSelectedExamId(val);
        router.get('/academic/examinations/analytics', { exam_id: val }, { preserveState: true, replace: true });
    };

    const { totalStudents, averageScore, overallPassRate, topGradeCount } = stats;

    // SVG Chart coordinate calculations
    const maxVal = Math.max(...gradeDistribution.map(g => g.percentage), 20);
    const paddingLeft = 40;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 40;
    const width = 500 - paddingLeft - paddingRight;
    const height = 240 - paddingTop - paddingBottom;
    const bottomY = 210;
    const xSpacing = width / gradeDistribution.length;

    const points = gradeDistribution.map((gd, i) => {
        const cx = paddingLeft + (i + 0.5) * xSpacing;
        const cy = bottomY - (gd.percentage / maxVal) * height;
        return { x: cx, y: cy, gd };
    });

    const activeIndex = gradeDistribution.findIndex(g => g.grade === hoveredGrade);
    const activePt = activeIndex !== -1 ? points[activeIndex] : null;

    return (
        <AppLayout>
            <Head title="Examination Performance Analytics" />
            
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                
                {/* Header Section */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                            Performance Analytics
                        </h1>
                    </div>

                    {/* Filter Selector with Elegant Dropdown */}
                    <div className="flex items-center space-x-3 bg-white dark:bg-slate-900/60 p-2 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 pl-2">
                            Filter Exam:
                        </label>
                        <Select 
                            value={selectedExamId} 
                            onValueChange={handleExamChange}
                        >
                            <SelectTrigger className="w-[230px] border-none bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800 focus:ring-0">
                                <SelectValue placeholder="Choose examination" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Examinations</SelectItem>
                                {examinations.map((exam) => (
                                    <SelectItem key={exam.id} value={exam.id.toString()}>
                                        {exam.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Stat Cards */}
                <StatGrid cols={4}>
                    <StatCard
                        title="School Average"
                        value={`${averageScore}%`}
                        icon={TrendingUp}
                        color="blue"
                        trend="up"
                        trendLabel="+2.4% vs last term"
                    />
                    <StatCard
                        title="Overall Pass Rate"
                        value={`${overallPassRate}%`}
                        icon={Percent}
                        color="emerald"
                        trend="up"
                        trendLabel="Target: 95.0% threshold"
                    />
                    <StatCard
                        title="Top Grade (A) Count"
                        value={topGradeCount}
                        icon={Award}
                        color="amber"
                        trend="stable"
                        trendLabel={`${((topGradeCount / totalStudents) * 100).toFixed(1)}% candidates`}
                    />
                    <StatCard
                        title="Registered Candidates"
                        value={totalStudents}
                        icon={Users}
                        color="cyan"
                        trend="stable"
                        trendLabel="Active student body"
                    />
                </StatGrid>

                {/* Primary Visualizations Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Grade Distribution - SVG / HTML Custom Bar Chart */}
                    <Card className="lg:col-span-2 border-slate-100 shadow-sm dark:border-slate-800">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg">Grade Distribution</CardTitle>
                                    <CardDescription>Visual stats for the selected exam ({getActiveExamName()})</CardDescription>
                                </div>
                                <Badge variant="outline" className="text-xs bg-slate-50 border-slate-200 dark:bg-slate-900 dark:border-slate-800">
                                    Total: {gradeDistribution.reduce((acc, curr) => acc + curr.count, 0)} papers
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="mt-4 h-[300px] bg-slate-50/50 dark:bg-slate-900/40 rounded-xl p-4 border border-slate-100 dark:border-slate-800 relative select-none">
                                {/* HTML Floating Tooltip */}
                                {activePt && (
                                    <div 
                                        style={{ 
                                            left: `${(activePt.x / 500) * 100}%`, 
                                            top: `${((activePt.y - 12) / 240) * 100}%`,
                                            transform: 'translate(-50%, -100%)'
                                        }}
                                        className="absolute z-30 transition-all duration-300 ease-out bg-slate-950 text-white dark:bg-white dark:text-slate-950 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xl flex flex-col items-center pointer-events-none"
                                    >
                                        <span>{activePt.gd.count} Papers</span>
                                        <span className="text-[10px] text-slate-400 dark:text-slate-500">{activePt.gd.percentage}% of class</span>
                                        <div className="w-2 h-2 bg-slate-950 dark:bg-white rotate-45 mt-1 -mb-1"></div>
                                    </div>
                                )}

                                <svg 
                                    viewBox="0 0 500 240" 
                                    className="w-full h-full"
                                    preserveAspectRatio="none"
                                >
                                    <defs>
                                        {/* Glow filter */}
                                        <filter id="chart-glow" x="-20%" y="-20%" width="140%" height="140%">
                                            <feGaussianBlur stdDeviation="3" result="blur" />
                                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                        </filter>
                                        
                                        {/* Bar gradient standard */}
                                        <linearGradient id="bar-gradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.85" />
                                            <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.85" />
                                        </linearGradient>
                                        
                                        {/* Bar gradient hovered */}
                                        <linearGradient id="bar-gradient-hover" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#60a5fa" stopOpacity="1" />
                                            <stop offset="100%" stopColor="#2563eb" stopOpacity="1" />
                                        </linearGradient>
                                        
                                        {/* Trend line gradient */}
                                        <linearGradient id="line-gradient" x1="0" y1="0" x2="1" y2="0">
                                            <stop offset="0%" stopColor="#a855f7" />
                                            <stop offset="50%" stopColor="#ec4899" />
                                            <stop offset="100%" stopColor="#f43f5e" />
                                        </linearGradient>

                                        {/* Trend line fill gradient */}
                                        <linearGradient id="area-gradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#ec4899" stopOpacity="0.12" />
                                            <stop offset="100%" stopColor="#ec4899" stopOpacity="0.0" />
                                        </linearGradient>
                                    </defs>

                                    {/* Grid Lines */}
                                    {[0, 0.25, 0.5, 0.75, 1.0].map((tick, i) => {
                                        const val = maxVal * tick;
                                        const y = bottomY - tick * height;
                                        return (
                                            <g key={i} className="opacity-40">
                                                <line 
                                                    x1={paddingLeft} 
                                                    y1={y} 
                                                    x2={500 - paddingRight} 
                                                    y2={y} 
                                                    stroke="currentColor" 
                                                    className="text-slate-200 dark:text-slate-800" 
                                                    strokeDasharray="4 4" 
                                                    strokeWidth="1"
                                                />
                                                <text 
                                                    x={paddingLeft - 8} 
                                                    y={y + 3} 
                                                    textAnchor="end" 
                                                    className="text-[9px] fill-slate-400 font-medium font-mono"
                                                >
                                                    {Math.round(val)}%
                                                </text>
                                            </g>
                                        );
                                    })}

                                    {/* Trend Area under the curve */}
                                    <path 
                                        d={getAreaPath(points)} 
                                        fill="url(#area-gradient)" 
                                        className="pointer-events-none" 
                                    />

                                    {/* Render rounded bars */}
                                    {points.map((pt, i) => {
                                        const barWidth = 28;
                                        const r = 6;
                                        const actualR = Math.min(r, Math.max(0, bottomY - pt.y));
                                        
                                        // Path drawing bar with rounded top corners
                                        const pathD = `
                                            M ${pt.x - barWidth / 2} ${bottomY}
                                            L ${pt.x - barWidth / 2} ${pt.y + actualR}
                                            A ${actualR} ${actualR} 0 0 1 ${pt.x - barWidth / 2 + actualR} ${pt.y}
                                            L ${pt.x + barWidth / 2 - actualR} ${pt.y}
                                            A ${actualR} ${actualR} 0 0 1 ${pt.x + barWidth / 2} ${pt.y + actualR}
                                            L ${pt.x + barWidth / 2} ${bottomY}
                                            Z
                                        `;
                                        
                                        const isHovered = hoveredGrade === pt.gd.grade;
                                        
                                        return (
                                            <path
                                                key={pt.gd.grade}
                                                d={pathD}
                                                fill={isHovered ? 'url(#bar-gradient-hover)' : 'url(#bar-gradient)'}
                                                className="transition-all duration-300"
                                                filter={isHovered ? 'url(#chart-glow)' : 'none'}
                                            />
                                        );
                                    })}

                                    {/* Trend line spline */}
                                    <path 
                                        d={getBezierPath(points)} 
                                        fill="none" 
                                        stroke="url(#line-gradient)" 
                                        strokeWidth="3.5" 
                                        strokeLinecap="round"
                                        className="pointer-events-none" 
                                    />

                                    {/* Trend line circle points */}
                                    {points.map((pt, i) => {
                                        const isHovered = hoveredGrade === pt.gd.grade;
                                        return (
                                            <g key={i} className="pointer-events-none">
                                                {isHovered && (
                                                    <circle
                                                        cx={pt.x}
                                                        cy={pt.y}
                                                        r={8}
                                                        fill="#ec4899"
                                                        opacity="0.3"
                                                        className="animate-ping"
                                                    />
                                                )}
                                                <circle
                                                    cx={pt.x}
                                                    cy={pt.y}
                                                    r={isHovered ? 6 : 4.5}
                                                    fill={isHovered ? '#ffffff' : '#ec4899'}
                                                    stroke={isHovered ? '#ec4899' : '#ffffff'}
                                                    strokeWidth={isHovered ? 3.5 : 2}
                                                    className="transition-all duration-300"
                                                    filter={isHovered ? 'url(#chart-glow)' : 'none'}
                                                />
                                            </g>
                                        );
                                    })}

                                    {/* X Axis Labels */}
                                    {points.map((pt, i) => (
                                        <g key={i}>
                                            <text 
                                                x={pt.x} 
                                                y={bottomY + 16} 
                                                textAnchor="middle" 
                                                className="text-[11px] font-bold fill-slate-700 dark:fill-slate-300"
                                            >
                                                Grade {pt.gd.grade}
                                            </text>
                                            <text 
                                                x={pt.x} 
                                                y={bottomY + 28} 
                                                textAnchor="middle" 
                                                className="text-[9px] font-medium fill-slate-400 dark:fill-slate-500"
                                            >
                                                {pt.gd.count} papers
                                            </text>
                                        </g>
                                    ))}

                                    {/* Invisible Hover overlay for easy target matching */}
                                    {points.map((pt, i) => (
                                        <rect
                                            key={i}
                                            x={pt.x - xSpacing / 2}
                                            y={paddingTop}
                                            width={xSpacing}
                                            height={height + paddingBottom}
                                            fill="transparent"
                                            className="cursor-pointer"
                                            onMouseEnter={() => setHoveredGrade(pt.gd.grade)}
                                            onMouseLeave={() => setHoveredGrade(null)}
                                        />
                                    ))}
                                </svg>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Class Comparison Gauges */}
                    <Card className="border-slate-100 shadow-sm dark:border-slate-800">
                        <CardHeader>
                            <CardTitle className="text-lg">Class Comparison</CardTitle>
                            <CardDescription>Average performance & pass rate comparison</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                                {classComparison.map((cc, i) => (
                                    <div key={i} className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 transition-all duration-300">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                                {cc.className}
                                            </span>
                                            <div className="flex items-center space-x-2">
                                                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded">
                                                    Avg: {cc.average}%
                                                </span>
                                                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                                                    Pass: {cc.passRate}%
                                                </span>
                                            </div>
                                        </div>
                                        
                                        {/* Dual Gauge Bar */}
                                        <div className="space-y-1">
                                            {/* Average score indicator (Blue) */}
                                            <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                                <div 
                                                    className="bg-blue-600 h-full rounded-full transition-all duration-500" 
                                                    style={{ width: `${cc.average}%` }} 
                                                />
                                            </div>
                                            {/* Pass rate indicator */}
                                            <div className="w-full bg-slate-200 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                                                <div 
                                                    className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                                                    style={{ width: `${cc.passRate}%` }} 
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Secondary Row: Subject Performance & Leaderboard */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Subject Analysis Grid */}
                    <Card className="lg:col-span-2 border-slate-100 shadow-sm dark:border-slate-800">
                        <CardHeader>
                            <CardTitle className="text-lg">Subject Performance</CardTitle>
                            <CardDescription>Detailed statistics for core subjects scheduled</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent border-slate-100 dark:border-slate-800">
                                        <TableHead>Subject</TableHead>
                                        <TableHead>Code</TableHead>
                                        <TableHead className="w-[180px]">Class Average</TableHead>
                                        <TableHead className="text-center">Highest</TableHead>
                                        <TableHead className="text-center">Lowest</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {subjectAnalysis.map((sub, i) => (
                                        <TableRow key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 border-slate-100 dark:border-slate-800">
                                            <TableCell className="font-bold text-slate-800 dark:text-slate-200">
                                                {sub.subjectName}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="font-mono text-xs text-slate-500 dark:text-slate-400">
                                                    {sub.code}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex justify-between items-center text-xs font-semibold">
                                                        <span>{sub.average}%</span>
                                                    </div>
                                                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                                        <div 
                                                            className={`h-full rounded-full transition-all duration-500 ${
                                                                sub.average >= 75 ? 'bg-emerald-500' :
                                                                sub.average >= 60 ? 'bg-blue-500' : 'bg-amber-500'
                                                            }`}
                                                            style={{ width: `${sub.average}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center font-bold text-emerald-600 dark:text-emerald-400">
                                                {sub.highest}%
                                            </TableCell>
                                            <TableCell className="text-center font-bold text-rose-600 dark:text-rose-400">
                                                {sub.lowest}%
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Top Performers Podium */}
                    <Card className="border-slate-100 shadow-sm dark:border-slate-800 flex flex-col">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Trophy className="h-5 w-5 text-amber-500" />
                                Top Performers
                            </CardTitle>
                            <CardDescription>Academic honors leaderboard based on average GPA</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col justify-between">
                            
                            {/* Podium Section */}
                            <div className="flex items-end justify-center gap-2 py-6 border-b border-slate-100 dark:border-slate-800 mb-6 bg-slate-50/50 dark:bg-slate-900/20 rounded-2xl p-4">
                                
                                {/* 2nd Place */}
                                {topPerformers[1] && (
                                    <div className="flex flex-col items-center">
                                        <div className="relative">
                                            <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center border-2 border-slate-300 dark:border-slate-600 font-bold text-sm text-slate-800 dark:text-slate-200">
                                                {topPerformers[1].name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <span className="absolute -top-2 -right-1 bg-slate-400 text-white rounded-full text-[9px] w-5 h-5 flex items-center justify-center font-bold border border-white">
                                                2
                                            </span>
                                        </div>
                                        <div className="bg-slate-100 dark:bg-slate-800 border-x border-t border-slate-200 dark:border-slate-700 w-20 h-16 mt-2 rounded-t-lg flex flex-col items-center justify-center p-1 text-center shadow-sm">
                                            <span className="text-[10px] font-bold truncate w-full text-slate-700 dark:text-slate-300">
                                                {topPerformers[1].name.split(' ')[0]}
                                            </span>
                                            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
                                                {topPerformers[1].average}%
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* 1st Place */}
                                {topPerformers[0] && (
                                    <div className="flex flex-col items-center -translate-y-2">
                                        <div className="relative">
                                            <div className="w-14 h-14 rounded-full bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center border-2 border-amber-400 font-bold text-sm text-slate-900 dark:text-white relative ring-4 ring-amber-400/10">
                                                {topPerformers[0].name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-amber-500 animate-bounce">
                                                <Medal className="h-5 w-5 fill-amber-400" />
                                            </div>
                                        </div>
                                        <div className="bg-gradient-to-b from-amber-500 to-amber-600 border border-amber-600 w-24 h-20 mt-2 rounded-t-lg flex flex-col items-center justify-center p-1 text-center shadow-md">
                                            <span className="text-[10px] font-bold text-white truncate w-full">
                                                {topPerformers[0].name.split(' ')[0]}
                                            </span>
                                            <span className="text-[11px] font-extrabold text-white">
                                                {topPerformers[0].average}%
                                            </span>
                                            <span className="text-[8px] bg-white/20 text-white px-1.5 py-0.5 rounded-full mt-1 font-semibold">
                                                Div {topPerformers[0].division}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* 3rd Place */}
                                {topPerformers[2] && (
                                    <div className="flex flex-col items-center">
                                        <div className="relative">
                                            <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center border-2 border-amber-700/50 font-bold text-sm text-slate-800 dark:text-slate-200">
                                                {topPerformers[2].name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <span className="absolute -top-2 -right-1 bg-amber-700 text-white rounded-full text-[9px] w-5 h-5 flex items-center justify-center font-bold border border-white">
                                                3
                                            </span>
                                        </div>
                                        <div className="bg-slate-100 dark:bg-slate-800 border-x border-t border-slate-200 dark:border-slate-700 w-20 h-12 mt-2 rounded-t-lg flex flex-col items-center justify-center p-1 text-center shadow-sm">
                                            <span className="text-[10px] font-bold truncate w-full text-slate-700 dark:text-slate-300">
                                                {topPerformers[2].name.split(' ')[0]}
                                            </span>
                                            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
                                                {topPerformers[2].average}%
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Rest of Leaderboard */}
                            <div className="space-y-3.5 flex-1">
                                {topPerformers.slice(3).map((tp) => (
                                    <div key={tp.rank} className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800">
                                        <div className="flex items-center space-x-3">
                                            <span className="text-xs font-extrabold text-slate-400 w-4">
                                                #{tp.rank}
                                            </span>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                                    {tp.name}
                                                </span>
                                                <span className="text-[10px] text-slate-400">
                                                    {tp.class}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded">
                                                Avg: {tp.average}%
                                            </span>
                                            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                                                Div {tp.division}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tanzanian O-Level NECTA Division Guidelines */}
                <Card className="bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800">
                    <CardContent className="py-3 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                            <Info className="h-4 w-4 text-blue-500 shrink-0" />
                            <span>
                                <strong>NECTA Points:</strong> A=1, B=2, C=3, D=4, F=5. Division calculated using best 7 subjects:
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Badge variant="outline" className="bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800">
                                Div I: 7-17 pts
                            </Badge>
                            <Badge variant="outline" className="bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800">
                                Div II: 18-21 pts
                            </Badge>
                            <Badge variant="outline" className="bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800">
                                Div III: 22-25 pts
                            </Badge>
                            <Badge variant="outline" className="bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800">
                                Div IV: 26-34 pts
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
