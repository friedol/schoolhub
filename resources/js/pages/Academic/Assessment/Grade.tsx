import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Save, Users, TrendingUp, CheckCircle, Clock } from 'lucide-react';

interface Assessment {
    id: number; name: string; type: string; total_marks: number; weight: number; date: string;
    class: { id: number; name: string } | null;
    subject: { id: number; name: string } | null;
    teacher: { id: number; name: string } | null;
}
interface Student { id: number; name: string; student_number: string }
interface AssessmentResult {
    id: number; student_id: number; marks: number | null; comment: string | null;
    is_submitted: boolean; graded_at: string | null; student: Student;
}
interface Props { assessment: Assessment; results: AssessmentResult[] }

function getGrade(marks: number, total: number): { grade: string; color: string } {
    const pct = (marks / total) * 100;
    if (pct >= 75) return { grade: 'A', color: 'bg-emerald-100 text-emerald-700' };
    if (pct >= 65) return { grade: 'B', color: 'bg-blue-100 text-blue-700' };
    if (pct >= 55) return { grade: 'C', color: 'bg-cyan-100 text-cyan-700' };
    if (pct >= 45) return { grade: 'D', color: 'bg-amber-100 text-amber-700' };
    return { grade: 'F', color: 'bg-red-100 text-red-700' };
}

export default function GradeAssessment({ assessment, results }: Props) {
    const [entries, setEntries] = useState<Record<number, { marks: string; comment: string }>>(
        Object.fromEntries(results.map(r => [r.student_id, { marks: r.marks?.toString() ?? '', comment: r.comment ?? '' }]))
    );
    const [saving, setSaving] = useState(false);

    const setEntry = (studentId: number, field: 'marks' | 'comment', value: string) => {
        setEntries(prev => ({ ...prev, [studentId]: { ...prev[studentId], [field]: value } }));
    };

    const handleSave = () => {
        setSaving(true);
        const payload = results.map(r => ({
            student_id: r.student_id,
            marks: parseFloat(entries[r.student_id]?.marks) || null,
            comment: entries[r.student_id]?.comment || null,
        }));
        (useForm as any);
        fetch(`/academic/assessments/${assessment.id}/grade`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': (document.querySelector('meta[name=csrf-token]') as any)?.content },
            body: JSON.stringify({ results: payload }),
        }).finally(() => setSaving(false));
    };

    const graded = results.filter(r => entries[r.student_id]?.marks !== '').length;
    const total = results.length;
    const avgMarks = results.reduce((sum, r) => {
        const m = parseFloat(entries[r.student_id]?.marks);
        return isNaN(m) ? sum : sum + m;
    }, 0) / (graded || 1);

    return (
        <AppLayout>
            <Head title={`Grade — ${assessment.name}`} />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                            <Link href="/academic/assessments"><ArrowLeft className="h-4 w-4" /></Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">{assessment.name}</h1>
                            <p className="text-sm text-muted-foreground mt-0.5">
                                {assessment.class?.name ?? '—'} · {assessment.subject?.name ?? '—'} · {assessment.total_marks} marks
                            </p>
                        </div>
                    </div>
                    <Button size="sm" onClick={handleSave} disabled={saving}>
                        <Save className="mr-2 h-4 w-4" />{saving ? 'Saving...' : 'Save Grades'}
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {[
                        { label: 'Total Students', value: total, icon: Users, color: 'text-blue-600 bg-blue-50' },
                        { label: 'Graded', value: graded, icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50' },
                        { label: 'Pending', value: total - graded, icon: Clock, color: 'text-amber-600 bg-amber-50' },
                        { label: 'Class Average', value: graded > 0 ? `${avgMarks.toFixed(1)}` : '—', icon: TrendingUp, color: 'text-blue-600 bg-blue-50' },
                    ].map(s => (
                        <Card key={s.label} className="border shadow-sm">
                            <CardContent className="p-4 flex items-center gap-3">
                                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${s.color}`}><s.icon className="h-5 w-5" /></div>
                                <div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-xl font-bold">{s.value}</p></div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Progress bar */}
                {total > 0 && (
                    <div className="space-y-1.5">
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Grading progress</span>
                            <span>{graded}/{total} students graded</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                            <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${(graded / total) * 100}%` }} />
                        </div>
                    </div>
                )}

                {/* Grading Table */}
                <Card className="border shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Student Grades</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/40">
                                    <TableHead className="pl-6 w-8">#</TableHead>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Adm No.</TableHead>
                                    <TableHead className="w-36">Marks / {assessment.total_marks}</TableHead>
                                    <TableHead className="w-16">Grade</TableHead>
                                    <TableHead className="w-16">%</TableHead>
                                    <TableHead>Comment</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {results.map((r, idx) => {
                                    const marksVal = parseFloat(entries[r.student_id]?.marks);
                                    const hasMarks = !isNaN(marksVal);
                                    const gradeInfo = hasMarks ? getGrade(marksVal, assessment.total_marks) : null;
                                    const pct = hasMarks ? ((marksVal / assessment.total_marks) * 100).toFixed(0) : '';
                                    const invalid = hasMarks && (marksVal < 0 || marksVal > assessment.total_marks);

                                    return (
                                        <TableRow key={r.student_id} className={`hover:bg-muted/30 ${invalid ? 'bg-red-50' : ''}`}>
                                            <TableCell className="pl-6 text-muted-foreground text-sm">{idx + 1}</TableCell>
                                            <TableCell className="font-medium text-sm">{r.student.name}</TableCell>
                                            <TableCell className="text-muted-foreground text-sm font-mono">{r.student.student_number}</TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number" min={0} max={assessment.total_marks} step="0.5"
                                                    value={entries[r.student_id]?.marks ?? ''}
                                                    onChange={e => setEntry(r.student_id, 'marks', e.target.value)}
                                                    placeholder="—"
                                                    className={`h-8 w-28 text-sm ${invalid ? 'border-red-400 focus-visible:ring-red-400' : ''}`}
                                                />
                                                {invalid && <p className="text-xs text-red-500 mt-0.5">Max {assessment.total_marks}</p>}
                                            </TableCell>
                                            <TableCell>
                                                {gradeInfo
                                                    ? <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ${gradeInfo.color}`}>{gradeInfo.grade}</span>
                                                    : <span className="text-muted-foreground text-xs">—</span>}
                                            </TableCell>
                                            <TableCell className="text-sm font-medium">{pct ? `${pct}%` : '—'}</TableCell>
                                            <TableCell>
                                                <Input
                                                    value={entries[r.student_id]?.comment ?? ''}
                                                    onChange={e => setEntry(r.student_id, 'comment', e.target.value)}
                                                    placeholder="Optional comment..."
                                                    className="h-8 text-sm"
                                                />
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                        {results.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-16">
                                <Users className="h-10 w-10 text-muted-foreground/50 mb-3" />
                                <p className="text-sm text-muted-foreground">No students found for this class</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {results.length > 0 && (
                    <div className="flex justify-end gap-3">
                        <Button variant="outline" asChild><Link href="/academic/assessments">Cancel</Link></Button>
                        <Button onClick={handleSave} disabled={saving}><Save className="mr-2 h-4 w-4" />{saving ? 'Saving...' : 'Save All Grades'}</Button>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
