import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Check, X, Edit, Info } from 'lucide-react';

interface Student {
    id: number;
    name: string;
    student_number: string;
}

interface AcademicRecord {
    id: number;
    student: Student;
    marks_obtained: number;
    grade: string;
    teacher_comment?: string;
}

interface ResultSubmission {
    id: number;
    exam: { name: string };
    school_class: { name: string };
    subject: { name: string; code: string };
    academic_term: { name: string };
    teacher: { name: string };
    status: 'pending' | 'approved' | 'rejected';
    remarks?: string;
}

interface GradingScaleGrade {
    min: number;
    max: number;
}

interface Props {
    submission: ResultSubmission;
    records: AcademicRecord[];
    grading_scale: Record<string, GradingScaleGrade>;
}

export default function ResultsApprovalAudit({ submission, records, grading_scale }: Props) {
    const [overrides, setOverrides] = useState<Record<number, number>>(
        records.reduce((acc, rec) => {
            acc[rec.id] = rec.marks_obtained;
            return acc;
        }, {} as Record<number, number>)
    );

    const [rejectionRemarks, setRejectionRemarks] = useState('');
    const [showRejectionForm, setShowRejectionForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const getGradeForMark = (mark: number) => {
        for (const [grade, info] of Object.entries(grading_scale)) {
            if (mark >= info.min && mark <= info.max) {
                return grade;
            }
        }
        return 'F';
    };

    const handleMarkChange = (recordId: number, value: string) => {
        const parsedVal = value === '' ? 0 : Math.min(100, Math.max(0, Number(value)));
        setOverrides({
            ...overrides,
            [recordId]: parsedVal,
        });
    };

    const handleApprove = () => {
        if (window.confirm('Are you sure you want to approve this results sheet? This will lock the marks.')) {
            router.post(`/academic/results-approvals/${submission.id}/approve`, {
                overrides: isEditing ? overrides : undefined,
            });
        }
    };

    const handleReject = (e: React.FormEvent) => {
        e.preventDefault();
        if (rejectionRemarks.trim()) {
            router.post(`/academic/results-approvals/${submission.id}/reject`, {
                remarks: rejectionRemarks,
            });
        }
    };

    return (
        <AppLayout>
            <Head title="Audit Results Sheet" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center space-x-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/academic/results-approvals">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Audit Worksheet</h1>
                        <p className="text-muted-foreground">
                            {submission.exam?.name} &bull; {submission.school_class?.name} &bull; {submission.subject?.name} ({submission.subject?.code})
                        </p>
                    </div>
                </div>

                {submission.status === 'rejected' && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                        <h3 className="text-sm font-bold text-red-800">Sheet Rejected</h3>
                        <p className="text-xs text-red-700 mt-1"><strong>Reason:</strong> {submission.remarks}</p>
                    </div>
                )}

                {submission.status === 'approved' && (
                    <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md flex items-start space-x-2">
                        <Check className="h-5 w-5 text-green-600 mt-0.5" />
                        <div>
                            <h3 className="text-sm font-bold text-green-800">Sheet Verified and Locked</h3>
                            <p className="text-xs text-green-700 mt-1">Grades compiled into student marksheets.</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Main Audit Sheet Table */}
                    <div className="lg:col-span-8 space-y-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Auditing score entries</CardTitle>
                                    <CardDescription>Review student entries. Enable edit to override scores.</CardDescription>
                                </div>
                                {submission.status === 'pending' && (
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={() => setIsEditing(!isEditing)}
                                    >
                                        <Edit className="mr-2 h-4 w-4" /> {isEditing ? 'Cancel Edit' : 'Edit Scores'}
                                    </Button>
                                )}
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Student No.</TableHead>
                                            <TableHead>Name</TableHead>
                                            <TableHead className="w-[120px]">Score (%)</TableHead>
                                            <TableHead className="w-[100px]">Grade</TableHead>
                                            <TableHead>Remarks</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {records.map(rec => (
                                            <TableRow key={rec.id}>
                                                <TableCell className="font-mono text-xs">{rec.student?.student_number}</TableCell>
                                                <TableCell className="font-medium">{rec.student?.name}</TableCell>
                                                <TableCell>
                                                    {isEditing ? (
                                                        <Input 
                                                            type="number"
                                                            value={overrides[rec.id]}
                                                            onChange={e => handleMarkChange(rec.id, e.target.value)}
                                                            className="h-8 py-0 min-w-[70px]"
                                                            min="0"
                                                            max="100"
                                                            step="0.1"
                                                        />
                                                    ) : (
                                                        <span className="font-mono">{overrides[rec.id]}%</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className="font-mono font-bold">
                                                        {getGradeForMark(overrides[rec.id])}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-xs text-muted-foreground italic">
                                                    {rec.teacher_comment || '-'}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Verification Panel */}
                    <div className="lg:col-span-4 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Verification Center</CardTitle>
                                <CardDescription>Decide on grades sheet status</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-1.5 text-sm pb-4 border-b">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Class Stream:</span>
                                        <span className="font-medium">{submission.school_class?.name}</span>
                                    </div>
                                    <div className="flex justify-between mt-1">
                                        <span className="text-muted-foreground">Subject Paper:</span>
                                        <span className="font-medium">{submission.subject?.name}</span>
                                    </div>
                                    <div className="flex justify-between mt-1">
                                        <span className="text-muted-foreground">Submitted By:</span>
                                        <span className="font-medium">{submission.teacher?.name}</span>
                                    </div>
                                    <div className="flex justify-between mt-1">
                                        <span className="text-muted-foreground">Term:</span>
                                        <span className="font-medium">{submission.academic_term?.name}</span>
                                    </div>
                                </div>

                                {submission.status === 'pending' && !showRejectionForm && (
                                    <div className="flex flex-col space-y-2 pt-2">
                                        <Button 
                                            onClick={handleApprove} 
                                            className="w-full bg-green-600 hover:bg-green-700 text-white"
                                        >
                                            <Check className="mr-2 h-4 w-4" /> Verify and Approve Sheet
                                        </Button>
                                        <Button 
                                            variant="destructive"
                                            onClick={() => setShowRejectionForm(true)} 
                                            className="w-full"
                                        >
                                            <X className="mr-2 h-4 w-4" /> Reject Sheet
                                        </Button>
                                    </div>
                                )}

                                {showRejectionForm && (
                                    <form onSubmit={handleReject} className="space-y-4 pt-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="remarks" className="text-red-800 font-bold">Rejection Feedback</Label>
                                            <textarea 
                                                id="remarks"
                                                value={rejectionRemarks}
                                                onChange={e => setRejectionRemarks(e.target.value)}
                                                placeholder="Provide actionable feedback on why this sheet is rejected (e.g. invalid score for student X)"
                                                className="w-full h-24 text-xs border rounded-md p-2 focus:ring-red-500 focus:border-red-500"
                                                required
                                            />
                                        </div>
                                        <div className="flex space-x-2">
                                            <Button type="button" variant="outline" size="sm" onClick={() => setShowRejectionForm(false)}>Cancel</Button>
                                            <Button type="submit" variant="destructive" size="sm">Confirm Rejection</Button>
                                        </div>
                                    </form>
                                )}

                                <div className="bg-blue-50 border border-blue-200 rounded-md p-3 flex space-x-2 text-xs text-blue-800 mt-2">
                                    <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <span>Once approved, positions and averages will compile. Publishing bulk results will unlock student report cards.</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
