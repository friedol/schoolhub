import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Printer, Award, BookOpen, TrendingUp } from 'lucide-react';

interface Subject {
    name: string;
    code: string;
}

interface ReportCardSubject {
    id: number;
    subject: Subject;
    marks: number;
    grade: string;
    points: number;
    position: number;
    total_students: number;
    teacher_comment?: string;
}

interface Student {
    id: number;
    name: string;
    student_number: string;
}

interface SchoolClass {
    id: number;
    name: string;
}

interface AcademicTerm {
    id: number;
    name: string;
}

interface ReportCard {
    id: number;
    student: Student;
    schoolClass: SchoolClass;
    academicTerm: AcademicTerm;
    total_marks: number;
    average_marks: number;
    grade: string;
    ranking: number;
    published_at: string;
    reportCardSubjects: ReportCardSubject[];
}

interface Props {
    reportCard: ReportCard;
    division: string;
    totalPoints: number;
    classAverage: number;
    totalStudents: number;
}

export default function ReportCardShow({ reportCard, division, totalPoints, classAverage, totalStudents }: Props) {
    const handlePrint = () => {
        window.print();
    };

    return (
        <AppLayout>
            <Head title={`Report Card - ${reportCard.student?.name}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-6 print:p-0 print:bg-white">
                
                {/* Actions Header (hidden on print) */}
                <div className="flex items-center justify-between print:hidden">
                    <div className="flex items-center space-x-4">
                        <Button variant="outline" size="icon" asChild>
                            <Link href="/academic/report-cards">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Report Card / Ripoti</h1>
                            <p className="text-muted-foreground">NECTA Bilingual Student Marks Statement</p>
                        </div>
                    </div>
                    <Button onClick={handlePrint}>
                        <Printer className="mr-2 h-4 w-4" /> Print / Pakua PDF
                    </Button>
                </div>

                {/* Printable Report Card Area */}
                <div className="space-y-6 print:space-y-4">
                    {/* School Header Banner */}
                    <div className="bg-gradient-to-r from-slate-900 to-blue-950 text-white rounded-xl p-8 shadow-md border border-blue-900 flex flex-col md:flex-row justify-between items-center md:items-start print:border-black print:text-black print:from-white print:to-white print:shadow-none print:p-4">
                        <div className="space-y-2 text-center md:text-left">
                            <h2 className="text-2xl font-bold tracking-tight text-blue-400 print:text-black">EDUTZ SEMINARY & HIGH SCHOOL</h2>
                            <p className="text-sm text-slate-300 print:text-black">P.O Box 1234, Dar es Salaam, Tanzania &bull; Info@edutz.ac.tz</p>
                            <h3 className="text-md font-bold text-slate-100 uppercase tracking-widest pt-2 print:text-black">
                                Terminal Report Card / Ripoti ya Maendeleo ya Mwanafunzi
                            </h3>
                        </div>
                        <div className="mt-4 md:mt-0 bg-blue-900/40 print:bg-white border border-blue-800 p-4 rounded-lg flex flex-col items-center">
                            <Award className="h-8 w-8 text-blue-400 mb-1" />
                            <span className="text-xs uppercase tracking-widest text-slate-300">NECTA DIVISION</span>
                            <span className="text-2xl font-extrabold text-white font-mono mt-1">{division}</span>
                        </div>
                    </div>

                    {/* Metadata grids */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:grid-cols-3">
                        <Card className="print:shadow-none print:border-black">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-muted-foreground uppercase tracking-widest">Student Information / Taarifa za Mwanafunzi</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-1 text-sm font-medium">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Name / Jina:</span>
                                    <span>{reportCard.student?.name}</span>
                                </div>
                                <div className="flex justify-between mt-1">
                                    <span className="text-muted-foreground">ID No / Namba:</span>
                                    <span className="font-mono">{reportCard.student?.student_number}</span>
                                </div>
                                <div className="flex justify-between mt-1">
                                    <span className="text-muted-foreground">Class / Darasa:</span>
                                    <span>{reportCard.schoolClass?.name}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="print:shadow-none print:border-black">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-muted-foreground uppercase tracking-widest">Academic Term / Muhula wa Masomo</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-1 text-sm font-medium">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Term / Muhula:</span>
                                    <span>{reportCard.academicTerm?.name}</span>
                                </div>
                                <div className="flex justify-between mt-1">
                                    <span className="text-muted-foreground">Published / Tarehe:</span>
                                    <span>{new Date(reportCard.published_at).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between mt-1">
                                    <span className="text-muted-foreground">Total Score / Jumla:</span>
                                    <span className="font-mono">{reportCard.total_marks} / {reportCard.reportCardSubjects.length * 100}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="print:shadow-none print:border-black">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-muted-foreground uppercase tracking-widest">Summary / Nafasi & Wastani</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-1 text-sm font-medium">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Average / Wastani:</span>
                                    <span className="font-mono">{reportCard.average_marks}%</span>
                                </div>
                                <div className="flex justify-between mt-1">
                                    <span className="text-muted-foreground">Position / Nafasi:</span>
                                    <span className="font-semibold text-blue-600">No. {reportCard.ranking} of {totalStudents}</span>
                                </div>
                                <div className="flex justify-between mt-1">
                                    <span className="text-muted-foreground">Scale Points / Pointi:</span>
                                    <span className="font-mono font-bold">{totalPoints} pts</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Subjects Marks Breakdowns */}
                    <Card className="print:shadow-none print:border-black">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <BookOpen className="h-5 w-5 text-blue-600 print:text-black" />
                                <span>Subject Analysis / Mchanganuo wa Masomo</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Code / Namba</TableHead>
                                        <TableHead>Subject Name / Jina la Somo</TableHead>
                                        <TableHead>Score / Alama</TableHead>
                                        <TableHead>Grade / Daraja</TableHead>
                                        <TableHead>Points / Pointi</TableHead>
                                        <TableHead>Rank / Nafasi</TableHead>
                                        <TableHead>Teacher's Comments / Maoni ya Mwalimu</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {reportCard.reportCardSubjects.map(sub => (
                                        <TableRow key={sub.id}>
                                            <TableCell className="font-mono text-xs">{sub.subject?.code}</TableCell>
                                            <TableCell className="font-medium">{sub.subject?.name}</TableCell>
                                            <TableCell className="font-mono">{sub.marks}%</TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="font-bold">{sub.grade}</Badge>
                                            </TableCell>
                                            <TableCell className="font-mono">{sub.points}</TableCell>
                                            <TableCell>No. {sub.position} of {sub.total_students}</TableCell>
                                            <TableCell className="text-xs italic text-muted-foreground">{sub.teacher_comment || 'Satisfactory progress'}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Footer Signature */}
                    <div className="grid grid-cols-2 gap-12 pt-12 text-center text-sm font-semibold print:pt-6">
                        <div className="space-y-4">
                            <div className="border-b border-dashed border-slate-400 h-10 w-48 mx-auto"></div>
                            <p className="text-slate-600 print:text-black">Class Teacher's Signature / Sahihi ya Mwalimu</p>
                        </div>
                        <div className="space-y-4">
                            <div className="border-b border-dashed border-slate-400 h-10 w-48 mx-auto"></div>
                            <p className="text-slate-600 print:text-black">Headteacher's Seal & Signature / Muhuri na Sahihi ya Mkuu</p>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
