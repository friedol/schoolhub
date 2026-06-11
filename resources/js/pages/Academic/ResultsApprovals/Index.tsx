import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ShieldCheck, Clock, CheckCircle, XCircle, FileSearch, User, Calendar } from 'lucide-react';

interface ResultSubmission {
    id: number;
    exam: { name: string } | null;
    school_class: { name: string } | null;
    subject: { name: string; code: string } | null;
    academic_term: { name: string } | null;
    teacher: { name: string } | null;
    status: 'pending' | 'approved' | 'rejected';
    submitted_at: string;
}
interface Props { submissions: { data: ResultSubmission[] } }

const statusConfig = {
    pending:  { label: 'Pending',  color: 'bg-amber-100 text-amber-700',   icon: Clock },
    approved: { label: 'Approved', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
    rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700',        icon: XCircle },
};

export default function ResultsApprovalsIndex({ submissions }: Props) {
    const pending  = submissions.data.filter(s => s.status === 'pending').length;
    const approved = submissions.data.filter(s => s.status === 'approved').length;
    const rejected = submissions.data.filter(s => s.status === 'rejected').length;

    return (
        <AppLayout>
            <Head title="Results Approvals" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">

                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Results Approvals</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">Audit, approve or reject teacher-submitted subject score sheets</p>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {[
                        { label: 'Total', value: submissions.data.length, icon: ShieldCheck, color: 'text-blue-600 bg-blue-50' },
                        { label: 'Pending', value: pending, icon: Clock, color: 'text-amber-600 bg-amber-50' },
                        { label: 'Approved', value: approved, icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50' },
                        { label: 'Rejected', value: rejected, icon: XCircle, color: 'text-red-600 bg-red-50' },
                    ].map(s => (
                        <Card key={s.label} className="border shadow-sm">
                            <CardContent className="p-4 flex items-center gap-3">
                                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${s.color}`}><s.icon className="h-5 w-5" /></div>
                                <div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-xl font-bold">{s.value}</p></div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Card className="border shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Submissions</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/40">
                                    <TableHead className="pl-6">Examination</TableHead>
                                    <TableHead>Class</TableHead>
                                    <TableHead>Subject</TableHead>
                                    <TableHead>Teacher</TableHead>
                                    <TableHead>Submitted</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right pr-6">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {submissions.data.map(sub => {
                                    const cfg = statusConfig[sub.status] || statusConfig.pending;
                                    const StatusIcon = cfg.icon;
                                    return (
                                        <TableRow key={sub.id} className="hover:bg-muted/30">
                                            <TableCell className="pl-6 text-sm font-medium">{sub.exam?.name ?? '—'}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground">{sub.school_class?.name ?? '—'}</TableCell>
                                            <TableCell>
                                                {sub.subject ? (
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-sm">{sub.subject.name}</span>
                                                        <Badge variant="outline" className="text-xs font-mono">{sub.subject.code}</Badge>
                                                    </div>
                                                ) : <span className="text-muted-foreground text-sm">—</span>}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                                    <User className="h-3.5 w-3.5" />
                                                    {sub.teacher?.name ?? '—'}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    {sub.submitted_at ? new Date(sub.submitted_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${cfg.color}`}>
                                                    <StatusIcon className="h-3 w-3" />{cfg.label}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right pr-6">
                                                <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
                                                    <Link href={`/academic/results-approvals/${sub.id}`}>
                                                        <FileSearch className="mr-1.5 h-3.5 w-3.5" />Audit
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                        {submissions.data.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <ShieldCheck className="h-10 w-10 text-muted-foreground/50 mb-3" />
                                <p className="text-sm font-medium">No submissions yet</p>
                                <p className="text-xs text-muted-foreground mt-1">Score sheets submitted by teachers will appear here</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
