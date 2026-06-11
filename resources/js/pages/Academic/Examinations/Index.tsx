import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, Eye, Edit, Trash2, MoreHorizontal, GraduationCap, CalendarDays, Sliders, ClipboardList, FileText, ShieldCheck, BarChart3, BookOpen, CheckSquare } from 'lucide-react';
import { StatCard, StatGrid } from '@/components/ui/stat-card';
import Swal from 'sweetalert2';

interface Examination {
    id: number; name: string; type: string; start_date: string; end_date: string;
    status: string; classes: string[]; created_at: string;
}
interface Props { examinations: { data: Examination[]; links: any[]; meta: any } }

const statusConfig: Record<string, string> = {
    'Scheduled':   'bg-blue-100 text-blue-700',
    'Planned':     'bg-slate-100 text-slate-600',
    'In Progress': 'bg-amber-100 text-amber-700',
    'Completed':   'bg-emerald-100 text-emerald-700',
};
const typeConfig: Record<string, string> = {
    'Internal': 'bg-cyan-100 text-cyan-700',
    'External': 'bg-blue-100 text-blue-700',
    'NECTA':    'bg-red-100 text-red-700',
};

export default function ExaminationsIndex({ examinations }: Props) {
    const handleDelete = (exam: Examination) => {
        Swal.fire({ title: 'Delete examination?', text: `"${exam.name}" will be permanently removed.`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', confirmButtonText: 'Delete' })
            .then(r => r.isConfirmed && router.delete(`/academic/examinations/${exam.id}`));
    };

    const scheduled = examinations.data.filter(e => e.status === 'Scheduled').length;
    const inProgress = examinations.data.filter(e => e.status === 'In Progress').length;
    const completed = examinations.data.filter(e => e.status === 'Completed').length;

    const quickLinks = [
        { label: 'Grading Scales', href: '/academic/grading-scales', icon: Sliders, color: 'text-cyan-600 bg-cyan-50 border-cyan-200' },
        { label: 'Marks Entry', href: '/academic/marks-entry', icon: ClipboardList, color: 'text-blue-600 bg-blue-50 border-blue-200' },
        { label: 'Results Approval', href: '/academic/results-approvals', icon: ShieldCheck, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
        { label: 'Report Cards', href: '/academic/report-cards', icon: FileText, color: 'text-amber-600 bg-amber-50 border-amber-200' },
    ];

    return (
        <AppLayout>
            <Head title="Examinations" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Examinations</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">Manage exams, results and reports</p>
                    </div>
                    <Button size="sm" asChild>
                        <Link href="/academic/examinations/create"><Plus className="mr-2 h-4 w-4" />Schedule Exam</Link>
                    </Button>
                </div>

                {/* Stats */}
                <StatGrid cols={4}>
                    <StatCard
                        title="Total Exams"
                        value={examinations.data.length}
                        icon={GraduationCap}
                        color="blue"
                        trend="stable"
                        trendLabel="Total"
                    />
                    <StatCard
                        title="Scheduled"
                        value={scheduled}
                        icon={CalendarDays}
                        color="blue"
                        trend="stable"
                        trendLabel="Upcoming"
                    />
                    <StatCard
                        title="In Progress"
                        value={inProgress}
                        icon={BookOpen}
                        color="amber"
                        trend="stable"
                        trendLabel="Active"
                    />
                    <StatCard
                        title="Completed"
                        value={completed}
                        icon={CheckSquare}
                        color="emerald"
                        trend="stable"
                        trendLabel="Finished"
                    />
                </StatGrid>

                {/* Quick Links */}
                <div className="flex flex-wrap items-center gap-3">
                    {quickLinks.map(({ label, href, icon: Icon, color }) => (
                        <Button key={href} variant="outline" className="h-auto py-2 shadow-sm" asChild>
                            <Link href={href}>
                                <Icon className={`mr-2 h-4 w-4 ${color.split(' ')[0]}`} />
                                {label}
                            </Link>
                        </Button>
                    ))}
                </div>

                {/* Table */}
                <Card className="border shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Examination Schedule</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/40">
                                    <TableHead className="pl-6">Examination</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Start Date</TableHead>
                                    <TableHead>End Date</TableHead>
                                    <TableHead>Classes</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right pr-6">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {examinations.data.map(exam => (
                                    <TableRow key={exam.id} className="hover:bg-muted/30">
                                        <TableCell className="pl-6 font-medium text-sm">{exam.name}</TableCell>
                                        <TableCell>
                                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${typeConfig[exam.type] || 'bg-slate-100 text-slate-600'}`}>{exam.type}</span>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{exam.start_date ? new Date(exam.start_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{exam.end_date ? new Date(exam.end_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</TableCell>
                                        <TableCell>
                                            {exam.classes?.length > 0
                                                ? <div className="flex flex-wrap gap-1">{exam.classes.slice(0, 3).map((c, i) => <Badge key={i} variant="outline" className="text-xs">{c}</Badge>)}{exam.classes.length > 3 && <Badge variant="secondary" className="text-xs">+{exam.classes.length - 3}</Badge>}</div>
                                                : <span className="text-muted-foreground text-xs">All Classes</span>}
                                        </TableCell>
                                        <TableCell>
                                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusConfig[exam.status] || 'bg-slate-100 text-slate-600'}`}>{exam.status}</span>
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild><Link href={`/academic/examinations/${exam.id}`}><Eye className="mr-2 h-4 w-4" />View</Link></DropdownMenuItem>
                                                    <DropdownMenuItem asChild><Link href={`/academic/examinations/${exam.id}/edit`}><Edit className="mr-2 h-4 w-4" />Edit</Link></DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDelete(exam)} className="text-red-600"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        {examinations.data.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <GraduationCap className="h-10 w-10 text-muted-foreground/50 mb-3" />
                                <p className="text-sm font-medium">No examinations scheduled</p>
                                <p className="text-xs text-muted-foreground mt-1 mb-4">Schedule your first examination</p>
                                <Button size="sm" asChild><Link href="/academic/examinations/create"><Plus className="mr-2 h-4 w-4" />Schedule Exam</Link></Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
