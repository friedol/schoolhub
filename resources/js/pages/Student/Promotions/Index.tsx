import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { GraduationCap, Users, TrendingUp, Calendar, ArrowRight, CheckCircle, AlertTriangle } from 'lucide-react';

interface SchoolClass {
    id: number;
    name: string;
    level: string;
    students_count: number;
}

interface Student {
    id: number;
    name: string;
    student_number: string;
    student_profile?: {
        school_class: {
            name: string;
            level: string;
        };
    };
}

interface Promotion {
    id: number;
    student: Student;
    from_class: {
        name: string;
        level: string;
    };
    to_class: {
        name: string;
        level: string;
    };
    promotion_type: string;
    promotion_date: string;
    promoted_by: {
        name: string;
    };
}

interface Props {
    classes: SchoolClass[];
    students: Student[];
    recentPromotions: Promotion[];
    currentYear: number;
}

export default function PromotionIndex({ classes, students, recentPromotions, currentYear }: Props) {
    const [selectedClass, setSelectedClass] = useState<number | null>(null);
    const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
    const [promotionType, setPromotionType] = useState<string>('regular');
    const [targetClass, setTargetClass] = useState<string>('none');

    const getPromotionTypeColor = (type: string) => {
        switch (type) {
            case 'regular':
                return 'bg-green-100 text-green-800';
            case 'repeat':
                return 'bg-yellow-100 text-yellow-800';
            case 'accelerated':
                return 'bg-blue-100 text-blue-800';
            case 'transfer':
                return 'bg-purple-100 text-purple-800';
            case 'graduation':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getNextLevel = (currentLevel: string) => {
        const levelMap: Record<string, string> = {
            'Baby Class': 'Middle Class',
            'Middle Class': 'Top Class',
            'Top Class': 'Standard I',
            'Standard I': 'Standard II',
            'Standard II': 'Standard III',
            'Standard III': 'Standard IV',
            'Standard IV': 'Standard V',
            'Standard V': 'Standard VI',
            'Standard VI': 'Standard VII',
            'Standard VII': 'Form I',
            'Form I': 'Form II',
            'Form II': 'Form III',
            'Form III': 'Form IV',
            'Form IV': 'Form V',
            'Form V': 'Form VI',
        };
        return levelMap[currentLevel] || currentLevel;
    };

    const getTargetClasses = () => {
        if (!selectedClass) return [];
        const currentClass = classes.find(c => c.id === selectedClass);
        if (!currentClass) return [];
        
        const nextLevel = getNextLevel(currentClass.level);
        return classes.filter(c => c.level === nextLevel);
    };

    const handleStudentSelect = (studentId: number, checked: boolean) => {
        if (checked) {
            setSelectedStudents([...selectedStudents, studentId]);
        } else {
            setSelectedStudents(selectedStudents.filter(id => id !== studentId));
        }
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            const classStudents = students.filter(s => 
                s.student_profile?.school_class.id === selectedClass
            );
            setSelectedStudents(classStudents.map(s => s.id));
        } else {
            setSelectedStudents([]);
        }
    };

    const classStudents = students.filter(s => 
        s.student_profile?.school_class.id === selectedClass
    );

    const isGraduatingClass = (classId: number) => {
        const cls = classes.find(c => c.id === classId);
        return cls && ['Standard VII', 'Form IV', 'Form VI'].includes(cls.level);
    };

    return (
        <AppLayout>
            <Head title="Promotion Management" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Promotion Management</h1>
                        <p className="text-gray-600">Manage student promotions and graduations</p>
                    </div>
                    <div className="flex space-x-2">
                        <Link href="/student/graduations">
                            <Button variant="outline">
                                <GraduationCap className="w-4 h-4 mr-2" />
                                Graduations
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{classes.length}</div>
                            <p className="text-xs text-muted-foreground">
                                Active classes
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                            <Users className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">
                                {classes.reduce((sum, c) => sum + c.students_count, 0)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Across all classes
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Recent Promotions</CardTitle>
                            <TrendingUp className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{recentPromotions.length}</div>
                            <p className="text-xs text-muted-foreground">
                                This academic year
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Academic Year</CardTitle>
                            <Calendar className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-600">{currentYear}</div>
                            <p className="text-xs text-muted-foreground">
                                Current year
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Select Class for Promotion</CardTitle>
                            <CardDescription>
                                Choose a class to view students and manage promotions
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">Select Class</label>
                                <Select value={selectedClass?.toString() ?? undefined} onValueChange={(value) => {
                                    setSelectedClass(parseInt(value));
                                    setSelectedStudents([]);
                                    setTargetClass('none');
                                }}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose a class" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {classes.map((cls) => (
                                            <SelectItem key={cls.id} value={cls.id.toString()}>
                                                {cls.name} ({cls.level}) - {cls.students_count} students
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {selectedClass && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-medium">
                                            Students in {classes.find(c => c.id === selectedClass)?.name}
                                        </h3>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="select-all"
                                                checked={selectedStudents.length === classStudents.length && classStudents.length > 0}
                                                onCheckedChange={handleSelectAll}
                                            />
                                            <label htmlFor="select-all" className="text-sm">
                                                Select All
                                            </label>
                                        </div>
                                    </div>

                                    <div className="max-h-64 overflow-y-auto space-y-2">
                                        {classStudents.map((student) => (
                                            <div key={student.id} className="flex items-center space-x-3 p-2 border rounded">
                                                <Checkbox
                                                    checked={selectedStudents.includes(student.id)}
                                                    onCheckedChange={(checked) => handleStudentSelect(student.id, checked as boolean)}
                                                />
                                                <div className="flex-1">
                                                    <div className="font-medium">{student.name}</div>
                                                    <div className="text-sm text-gray-500">{student.student_number}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {selectedStudents.length > 0 && (
                                        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                                            <div>
                                                <label className="text-sm font-medium">Promotion Type</label>
                                                <Select value={promotionType} onValueChange={setPromotionType}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="regular">Regular Promotion</SelectItem>
                                                        <SelectItem value="repeat">Repeat Class</SelectItem>
                                                        <SelectItem value="accelerated">Accelerated Promotion</SelectItem>
                                                        <SelectItem value="transfer">Transfer</SelectItem>
                                                        {isGraduatingClass(selectedClass) && (
                                                            <SelectItem value="graduation">Graduation</SelectItem>
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {promotionType !== 'graduation' && (
                                                <div>
                                                    <label className="text-sm font-medium">Target Class</label>
                                                    <Select value={targetClass} onValueChange={setTargetClass}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select target class" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="none" disabled>Select target class</SelectItem>
                                                            {getTargetClasses().map((cls) => (
                                                                <SelectItem key={cls.id} value={cls.id.toString()}>
                                                                    {cls.name} ({cls.level})
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            )}

                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">
                                                    {selectedStudents.length} student(s) selected
                                                </span>
                                                <Button 
                                                    disabled={!targetClass && promotionType !== 'graduation'}
                                                    className="bg-green-600 hover:bg-green-700"
                                                >
                                                    <ArrowRight className="w-4 h-4 mr-2" />
                                                    {promotionType === 'graduation' ? 'Process Graduation' : 'Promote Students'}
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Promotions</CardTitle>
                            <CardDescription>
                                Latest promotion activities
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {recentPromotions.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <TrendingUp className="w-12 h-12 mx-auto mb-4" />
                                    <p>No recent promotions</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {recentPromotions.map((promotion) => (
                                        <div key={promotion.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                                            <div className="flex-shrink-0">
                                                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                                    <span className="text-sm font-medium">
                                                        {promotion.student.name.charAt(0)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-medium">{promotion.student.name}</div>
                                                <div className="text-sm text-gray-500">
                                                    {promotion.from_class.name} → {promotion.to_class.name}
                                                </div>
                                                <div className="text-xs text-gray-400">
                                                    {new Date(promotion.promotion_date).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <div className="flex-shrink-0">
                                                <Badge className={getPromotionTypeColor(promotion.promotion_type)}>
                                                    {promotion.promotion_type}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}



