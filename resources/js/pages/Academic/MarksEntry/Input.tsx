import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, HelpCircle, CheckCircle } from 'lucide-react';

interface Student {
    id: number;
    name: string;
    student_number: string;
    marks_obtained?: number;
    teacher_comment?: string;
}

interface GradingScaleGrade {
    min: number;
    max: number;
    points: number;
    description: string;
}

interface Props {
    students: Student[];
    exam: { id: number; name: string };
    class: { id: number; name: string };
    subject: { id: number; name: string; code: string };
    academic_term_id: number;
    grading_scale: Record<string, GradingScaleGrade>;
    submission?: { status: 'pending' | 'approved' | 'rejected'; remarks?: string };
}

export default function MarksInputView({ students, exam, class: classItem, subject, academic_term_id, grading_scale, submission }: Props) {
    const [marks, setMarks] = useState<Record<number, { marks_obtained: number | ''; teacher_comment: string }>>(
        students.reduce((acc, stu) => {
            acc[stu.id] = {
                marks_obtained: stu.marks_obtained !== undefined && stu.marks_obtained !== null ? stu.marks_obtained : '',
                teacher_comment: stu.teacher_comment || '',
            };
            return acc;
        }, {} as Record<number, { marks_obtained: number | ''; teacher_comment: string }>)
    );

    const getGradePreview = (mark: number | '') => {
        if (mark === '' || isNaN(mark)) return '-';
        for (const [grade, info] of Object.entries(grading_scale)) {
            if (mark >= info.min && mark <= info.max) {
                return grade;
            }
        }
        return 'F';
    };

    const handleMarkChange = (studentId: number, value: string) => {
        const parsedVal = value === '' ? '' : Math.min(100, Math.max(0, Number(value)));
        setMarks({
            ...marks,
            [studentId]: {
                ...marks[studentId],
                marks_obtained: parsedVal,
            },
        });
    };

    const handleCommentChange = (studentId: number, value: string) => {
        setMarks({
            ...marks,
            [studentId]: {
                ...marks[studentId],
                teacher_comment: value,
            },
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/academic/marks-entry', {
            exam_id: exam.id,
            school_class_id: classItem.id,
            subject_id: subject.id,
            academic_term_id,
            marks,
        });
    };

    return (
        <AppLayout>
            <Head title="Grade Student Scores" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center space-x-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/academic/marks-entry">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Key In Grades Sheet</h1>
                        <p className="text-muted-foreground">
                            {exam.name} &bull; {classItem.name} &bull; {subject.name} ({subject.code})
                        </p>
                    </div>
                </div>

                {submission && submission.status === 'rejected' && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                        <h3 className="text-sm font-bold text-red-800">Grades Sheet Rejected</h3>
                        <p className="text-xs text-red-700 mt-1"><strong>Feedback:</strong> {submission.remarks}</p>
                    </div>
                )}

                {submission && submission.status === 'approved' && (
                    <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md flex items-start space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                        <div>
                            <h3 className="text-sm font-bold text-green-800">Grades Sheet Approved</h3>
                            <p className="text-xs text-green-700 mt-1">This grades sheet is approved and locked. Overrides can only be performed by administrators.</p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Worksheet</CardTitle>
                                <CardDescription>Key in scores out of 100%</CardDescription>
                            </div>
                            <div className="flex space-x-2">
                                <Button 
                                    type="submit" 
                                    disabled={submission?.status === 'approved'}
                                >
                                    <Save className="mr-2 h-4 w-4" /> Submit Grades Sheet
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Student No.</TableHead>
                                        <TableHead>Student Name</TableHead>
                                        <TableHead className="w-[150px]">Score Obtained (%)</TableHead>
                                        <TableHead className="w-[100px]">Grade Preview</TableHead>
                                        <TableHead>Teacher Remarks</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {students.map(student => (
                                        <TableRow key={student.id}>
                                            <TableCell className="font-mono text-xs">{student.student_number}</TableCell>
                                            <TableCell className="font-medium">{student.name}</TableCell>
                                            <TableCell>
                                                <Input 
                                                    type="number"
                                                    value={marks[student.id]?.marks_obtained}
                                                    onChange={e => handleMarkChange(student.id, e.target.value)}
                                                    placeholder="0-100"
                                                    min="0"
                                                    max="100"
                                                    step="0.1"
                                                    disabled={submission?.status === 'approved'}
                                                    required
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="text-sm font-mono font-bold w-8 justify-center">
                                                    {getGradePreview(marks[student.id]?.marks_obtained)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Input 
                                                    value={marks[student.id]?.teacher_comment}
                                                    onChange={e => handleCommentChange(student.id, e.target.value)}
                                                    placeholder="e.g. Excellent work"
                                                    disabled={submission?.status === 'approved'}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}
