import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { StatCard, StatGrid } from '@/components/ui/stat-card';
import { BookOpen, Users, Search, UserCheck, CheckCircle2, AlertCircle, Loader2, Save, Sparkles } from 'lucide-react';
import Swal from 'sweetalert2';
import axios from 'axios';

interface SchoolClass {
    id: number;
    name: string;
    level: string;
}

interface Subject {
    id: number;
    name: string;
    code: string;
}

interface Student {
    id: number;
    name: string;
    student_number: string;
    class_name: string;
    class_id: number;
}

interface Props {
    classes: SchoolClass[];
    electiveSubjects: Subject[];
}

export default function SetOptional({ classes, electiveSubjects }: Props) {
    const [searchId, setSearchId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    const [studentInfo, setStudentInfo] = useState<Student | null>(null);
    const [classElectives, setClassElectives] = useState<Subject[]>([]);
    const [selectedSubjects, setSelectedSubjects] = useState<number[]>([]);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchId.trim()) return;

        setIsLoading(true);
        setErrorMsg(null);
        setStudentInfo(null);

        try {
            const response = await axios.get(`/academic/subjects/student-info`, {
                params: { student_id: searchId.trim() }
            });

            if (response.data.success) {
                setStudentInfo(response.data.student);
                setClassElectives(response.data.classElectives || []);
                setSelectedSubjects(response.data.selectedSubjectIds || []);
            } else {
                setErrorMsg(response.data.message || 'Failed to fetch student details.');
            }
        } catch (err: any) {
            console.error(err);
            const msg = err.response?.data?.message || 'Student not found. Please verify the ID.';
            setErrorMsg(msg);
            
            Swal.fire({
                title: 'Not Found',
                text: msg,
                icon: 'warning',
                confirmButtonColor: '#3b82f6',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubjectToggle = (subjectId: number, checked: boolean) => {
        if (checked) {
            setSelectedSubjects([...selectedSubjects, subjectId]);
        } else {
            setSelectedSubjects(selectedSubjects.filter(id => id !== subjectId));
        }
    };

    const handleSave = () => {
        if (!studentInfo) return;

        setIsSaving(true);
        router.post('/academic/subjects/set-optional', {
            student_id: studentInfo.id,
            subject_ids: selectedSubjects,
        }, {
            onSuccess: () => {
                setIsSaving(false);
                Swal.fire({
                    title: 'Wamehifadhiwa!',
                    text: 'Optional subjects assigned successfully.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                    position: 'top-end',
                    toast: true,
                });
            },
            onError: (errors) => {
                setIsSaving(false);
                Swal.fire({
                    title: 'Error',
                    text: 'Failed to assign optional subjects.',
                    icon: 'error',
                });
            }
        });
    };

    return (
        <AppLayout>
            <Head title="Assign Optional Subjects" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Title & Description */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                                Optional Subjects
                            </h1>
                            <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                                Masomo ya Hiari
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                            Assign and manage elective subjects for students based on their class level.
                        </p>
                    </div>
                </div>

                {/* Stats */}
                <StatGrid cols={3}>
                    <StatCard
                        title="Available Electives"
                        value={electiveSubjects.length}
                        icon={BookOpen}
                        color="blue"
                        trendLabel="Active elective subjects"
                    />
                    <StatCard
                        title="Configured Classes"
                        value={classes.length}
                        icon={Users}
                        color="emerald"
                        trendLabel="Classes offering electives"
                    />
                    <StatCard
                        title="Tanzanian Syllabus"
                        value="NECTA"
                        icon={Sparkles}
                        color="amber"
                        trendLabel="Bilingual Elective Mapping"
                    />
                </StatGrid>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Form Panel: Search Student */}
                    <Card className="lg:col-span-1 border-slate-100 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <Search className="w-4 h-4 text-blue-600" />
                                Search Student / Tafuta Mwanafunzi
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Enter Student ID or Admission Number to load profile.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSearch} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="student_id" className="text-xs font-semibold text-slate-700">
                                        Student ID / Admission Number
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="student_id"
                                            value={searchId}
                                            onChange={(e) => setSearchId(e.target.value)}
                                            placeholder="e.g. SCH-001 or ST001"
                                            className="pr-10 border-slate-200 focus-visible:ring-blue-500"
                                        />
                                        <Button
                                            type="submit"
                                            size="sm"
                                            variant="ghost"
                                            className="absolute right-0 top-0 h-full px-3 text-slate-500 hover:text-blue-600"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? (
                                                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                                            ) : (
                                                <Search className="w-4 h-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                <Button 
                                    type="submit" 
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium animate-none"
                                    disabled={isLoading}
                                >
                                    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    Search Student
                                </Button>
                            </form>

                            {errorMsg && (
                                <div className="mt-4 p-3 bg-red-50 border border-red-100 text-red-700 rounded-lg text-xs flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                    <span>{errorMsg}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Right Panel: Student Info & Subjects List */}
                    <Card className="lg:col-span-2 border-slate-100 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <UserCheck className="w-4 h-4 text-emerald-600" />
                                Subject Assignment / Masomo ya Hiari
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Configure elective subjects for the selected student.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="min-h-[280px] flex flex-col justify-between">
                            {!studentInfo ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                                    <BookOpen className="w-12 h-12 text-slate-300 mb-3" />
                                    <h3 className="text-sm font-semibold text-slate-700">No Student Loaded</h3>
                                    <p className="text-xs text-slate-500 max-w-xs mt-1">
                                        Please search for a student on the left panel to assign elective subjects.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-6 flex-1">
                                    {/* Student details header card */}
                                    <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100/50 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                                        <div>
                                            <div className="text-xs font-semibold text-blue-600 tracking-wide uppercase">
                                                Active Student Profile
                                            </div>
                                            <div className="text-base font-bold text-slate-900 mt-0.5">
                                                {studentInfo.name}
                                            </div>
                                            <div className="text-xs text-slate-500 mt-0.5">
                                                ID: {studentInfo.student_number}
                                            </div>
                                        </div>
                                        <div>
                                            <Badge variant="outline" className="bg-blue-100/30 text-blue-700 border-blue-200">
                                                Class: {studentInfo.class_name}
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Elective subjects checkboxes */}
                                    <div className="space-y-3">
                                        <h3 className="text-xs font-bold text-slate-700 tracking-wide uppercase flex items-center gap-2">
                                            Available Electives for Class Level
                                            <span className="text-[10px] lowercase text-slate-500 font-normal">
                                                ({classElectives.length} subjects found)
                                            </span>
                                        </h3>

                                        {classElectives.length === 0 ? (
                                            <div className="p-4 bg-slate-50 border border-dashed rounded-lg text-center text-xs text-slate-500">
                                                No active elective subjects have been assigned to this class level.
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[220px] overflow-y-auto pr-2">
                                                {classElectives.map((subject) => {
                                                    const isChecked = selectedSubjects.includes(subject.id);
                                                    return (
                                                        <div 
                                                            key={subject.id}
                                                            className={`flex items-center space-x-3 p-3 border rounded-xl transition-all cursor-pointer hover:bg-slate-50
                                                                ${isChecked 
                                                                    ? 'border-blue-200 bg-blue-50/20 shadow-sm' 
                                                                    : 'border-slate-100'
                                                                }`}
                                                            onClick={() => handleSubjectToggle(subject.id, !isChecked)}
                                                        >
                                                            <Checkbox
                                                                id={`sub-${subject.id}`}
                                                                checked={isChecked}
                                                                onCheckedChange={(checked) => handleSubjectToggle(subject.id, checked as boolean)}
                                                                onClick={(e) => e.stopPropagation()}
                                                            />
                                                            <div className="flex-1 min-w-0">
                                                                <Label 
                                                                    htmlFor={`sub-${subject.id}`}
                                                                    className="text-xs font-semibold text-slate-900 cursor-pointer block truncate"
                                                                >
                                                                    {subject.name}
                                                                </Label>
                                                                <span className="text-[10px] text-slate-500 font-mono">
                                                                    {subject.code}
                                                                </span>
                                                            </div>
                                                            {isChecked && (
                                                                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>

                                    {/* Action button */}
                                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                                        <div className="text-xs text-slate-500">
                                            Selected: <span className="font-bold text-blue-600">{selectedSubjects.length}</span> subject(s)
                                        </div>
                                        <Button
                                            onClick={handleSave}
                                            disabled={isSaving}
                                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
                                        >
                                            {isSaving ? (
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            ) : (
                                                <Save className="w-4 h-4 mr-2" />
                                            )}
                                            Save Optional Subjects
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
