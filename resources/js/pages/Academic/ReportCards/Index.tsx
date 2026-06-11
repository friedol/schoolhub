import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Eye, Search, Users, TrendingUp, BookOpen, Award } from 'lucide-react';

interface ReportCard {
    id: number; student_id: number; student_name: string; student_number: string;
    class_name: string; term_name: string; academic_term_id: number;
    total_marks: number; average_marks: number; grade: string; ranking: number;
    is_published: boolean; created_at: string;
}
interface Props { reportCards: { data: ReportCard[] } }

const gradeColor = (g: string) => {
    if (g === 'A') return 'bg-emerald-100 text-emerald-700';
    if (g === 'B') return 'bg-blue-100 text-blue-700';
    if (g === 'C') return 'bg-cyan-100 text-cyan-700';
    if (g === 'D') return 'bg-amber-100 text-amber-700';
    return 'bg-red-100 text-red-700';
};

export default function ReportCardsIndex({ reportCards }: Props) {
    const [search, setSearch] = useState('');

    const filtered = reportCards.data.filter(r =>
        r.student_name.toLowerCase().includes(search.toLowerCase()) ||
        r.student_number.toLowerCase().includes(search.toLowerCase()) ||
        r.class_name.toLowerCase().includes(search.toLowerCase())
    );

    const published = reportCards.data.filter(r => r.is_published).length;
    const avgMark = reportCards.data.length > 0
        ? (reportCards.data.reduce((s, r) => s + (Number(r.average_marks ?? 0)), 0) / reportCards.data.length).toFixed(1)
        : '—';

    return (
        <AppLayout>
            <Head title="Report Cards" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Report Cards</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">View and distribute student academic performance reports</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {[
                        { label: 'Total Cards', value: reportCards.data.length, icon: FileText, color: 'text-blue-600 bg-blue-50' },
                        { label: 'Published', value: published, icon: BookOpen, color: 'text-emerald-600 bg-emerald-50' },
                        { label: 'Drafts', value: reportCards.data.length - published, icon: Users, color: 'text-amber-600 bg-amber-50' },
                        { label: 'Class Average', value: `${avgMark}%`, icon: TrendingUp, color: 'text-blue-600 bg-blue-50' },
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
                        <div className="flex items-center justify-between gap-3">
                            <CardTitle className="text-base">Student Reports</CardTitle>
                            <div className="relative w-64">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 text-sm" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/40">
                                    <TableHead className="pl-6">Student</TableHead>
                                    <TableHead>Adm No.</TableHead>
                                    <TableHead>Class</TableHead>
                                    <TableHead>Term</TableHead>
                                    <TableHead>Average</TableHead>
                                    <TableHead>Grade</TableHead>
                                    <TableHead>Position</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right pr-6">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map(card => (
                                    <TableRow key={card.id} className="hover:bg-muted/30">
                                        <TableCell className="pl-6 font-medium text-sm">{card.student_name}</TableCell>
                                        <TableCell className="font-mono text-xs text-muted-foreground">{card.student_number}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{card.class_name}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{card.term_name}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-sm font-medium">{(Number(card.average_marks ?? 0)).toFixed(1)}%</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ${gradeColor(card.grade)}`}>{card.grade}</span>
                                        </TableCell>
                                        <TableCell>
                                            {card.ranking > 0 && (
                                                <div className="flex items-center gap-1.5">
                                                    {card.ranking <= 3 && <Award className="h-3.5 w-3.5 text-amber-500" />}
                                                    <Badge variant="outline" className="text-xs font-medium">#{card.ranking}</Badge>
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {card.is_published
                                                ? <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">Published</Badge>
                                                : <Badge variant="secondary" className="text-xs">Draft</Badge>}
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            <Button variant="ghost" size="sm" asChild className="h-7 text-xs">
                                                <Link href={`/academic/report-cards/${card.student_id}/${card.academic_term_id}`}>
                                                    <Eye className="mr-1.5 h-3.5 w-3.5" />View
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        {filtered.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <FileText className="h-10 w-10 text-muted-foreground/50 mb-3" />
                                <p className="text-sm font-medium">{search ? 'No report cards match' : 'No report cards yet'}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {search ? 'Try a different search' : 'Report cards appear after marks are entered and approved'}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
