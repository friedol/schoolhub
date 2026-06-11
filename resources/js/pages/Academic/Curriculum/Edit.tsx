import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';

interface Subject {
    id: number;
    name: string;
    code: string;
    necta_code: string;
}

interface Class {
    id: number;
    name: string;
    level: string;
    stream: string;
}

interface CurriculumSubject {
    id: number;
    subject_id: number;
    is_core: boolean;
    is_elective: boolean;
    is_compulsory: boolean;
    credits: number;
    weekly_periods: number;
    passing_grade: number;
    subject: Subject;
}

interface Curriculum {
    id: number;
    name: string;
    code: string;
    description: string;
    level: string;
    academic_year: string;
    is_necta_curriculum: boolean;
    subjects: CurriculumSubject[];
}

interface Props {
    curriculum: Curriculum;
    subjects: Subject[];
    classes: Class[];
}

export default function EditCurriculum({ curriculum, subjects, classes }: Props) {
    const [selectedSubjects, setSelectedSubjects] = useState<Array<{
        subject_id: number;
        is_core: boolean;
        is_elective: boolean;
        is_compulsory: boolean;
        credits: number;
        weekly_periods: number;
        passing_grade: number;
    }>>([]);

    const { data, setData, put, processing, errors } = useForm({
        name: curriculum.name,
        code: curriculum.code,
        description: curriculum.description || '',
        level: curriculum.level,
        academic_year: curriculum.academic_year,
        is_necta_curriculum: curriculum.is_necta_curriculum,
        subjects: [] as any[],
    });

    useEffect(() => {
        // Initialize selected subjects from curriculum
        const initialSubjects = curriculum.subjects.map(cs => ({
            subject_id: cs.subject_id,
            is_core: cs.is_core,
            is_elective: cs.is_elective,
            is_compulsory: cs.is_compulsory,
            credits: cs.credits || 1,
            weekly_periods: cs.weekly_periods || 1,
            passing_grade: cs.passing_grade || 50,
        }));
        setSelectedSubjects(initialSubjects);
    }, [curriculum]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setData('subjects', selectedSubjects);
        put(`/academic/curriculum/${curriculum.id}`);
    };

    const addSubject = () => {
        setSelectedSubjects([...selectedSubjects, {
            subject_id: 0,
            is_core: true,
            is_elective: false,
            is_compulsory: true,
            credits: 1,
            weekly_periods: 1,
            passing_grade: 50,
        }]);
    };

    const removeSubject = (index: number) => {
        setSelectedSubjects(selectedSubjects.filter((_, i) => i !== index));
    };

    const updateSubject = (index: number, field: string, value: any) => {
        const updated = [...selectedSubjects];
        updated[index] = { ...updated[index], [field]: value };
        setSelectedSubjects(updated);
    };

    return (
        <AppLayout>
            <Head title={`Edit Curriculum: ${curriculum.name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Edit Curriculum</h1>
                        <p className="text-gray-600">Update curriculum information</p>
                    </div>
                    <div className="flex space-x-2">
                        <Link href="/academic/curriculum">
                            <Button variant="outline">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Curricula
                            </Button>
                        </Link>
                        <Link href={`/academic/curriculum/${curriculum.id}`}>
                            <Button variant="outline">
                                View Details
                            </Button>
                        </Link>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Curriculum Information</CardTitle>
                            <CardDescription>
                                Basic information about the curriculum
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Curriculum Name *</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="e.g., Form 1 Curriculum"
                                        className={errors.name ? 'border-red-500' : ''}
                                    />
                                    {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="code">Curriculum Code *</Label>
                                    <Input
                                        id="code"
                                        value={data.code}
                                        onChange={(e) => setData('code', e.target.value)}
                                        placeholder="e.g., F1"
                                        className={errors.code ? 'border-red-500' : ''}
                                    />
                                    {errors.code && <p className="text-sm text-red-500">{errors.code}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="level">Level *</Label>
                                    <Select value={data.level} onValueChange={(value) => setData('level', value)}>
                                        <SelectTrigger className={errors.level ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Select level" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="nursery">Nursery</SelectItem>
                                            <SelectItem value="primary">Primary</SelectItem>
                                            <SelectItem value="secondary">Secondary</SelectItem>
                                            <SelectItem value="advanced">Advanced Level</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.level && <p className="text-sm text-red-500">{errors.level}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="academic_year">Academic Year *</Label>
                                    <Input
                                        id="academic_year"
                                        value={data.academic_year}
                                        onChange={(e) => setData('academic_year', e.target.value)}
                                        placeholder="e.g., 2024/2025"
                                        className={errors.academic_year ? 'border-red-500' : ''}
                                    />
                                    {errors.academic_year && <p className="text-sm text-red-500">{errors.academic_year}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Describe the curriculum..."
                                    rows={3}
                                />
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="is_necta_curriculum"
                                    checked={data.is_necta_curriculum}
                                    onCheckedChange={(checked) => setData('is_necta_curriculum', checked as boolean)}
                                />
                                <Label htmlFor="is_necta_curriculum">NECTA Compliant Curriculum</Label>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Subjects</CardTitle>
                            <CardDescription>
                                Manage subjects in this curriculum
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Button type="button" onClick={addSubject} variant="outline">
                                <Plus className="w-4 h-4 mr-2" />
                                Add Subject
                            </Button>

                            {selectedSubjects.map((subject, index) => (
                                <div key={index} className="border rounded-lg p-4 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-medium">Subject {index + 1}</h4>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => removeSubject(index)}
                                            className="text-red-600"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label>Subject *</Label>
                                            <Select
                                                value={subject.subject_id.toString()}
                                                onValueChange={(value) => updateSubject(index, 'subject_id', parseInt(value))}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select subject" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {subjects.map((subj) => (
                                                        <SelectItem key={subj.id} value={subj.id.toString()}>
                                                            {subj.name} ({subj.code})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Credits</Label>
                                            <Input
                                                type="number"
                                                min="1"
                                                value={subject.credits}
                                                onChange={(e) => updateSubject(index, 'credits', parseInt(e.target.value) || 1)}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Weekly Periods</Label>
                                            <Input
                                                type="number"
                                                min="1"
                                                value={subject.weekly_periods}
                                                onChange={(e) => updateSubject(index, 'weekly_periods', parseInt(e.target.value) || 1)}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                checked={subject.is_core}
                                                onCheckedChange={(checked) => updateSubject(index, 'is_core', checked)}
                                            />
                                            <Label>Core Subject</Label>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                checked={subject.is_elective}
                                                onCheckedChange={(checked) => updateSubject(index, 'is_elective', checked)}
                                            />
                                            <Label>Elective Subject</Label>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                checked={subject.is_compulsory}
                                                onCheckedChange={(checked) => updateSubject(index, 'is_compulsory', checked)}
                                            />
                                            <Label>Compulsory</Label>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Passing Grade (%)</Label>
                                        <Input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={subject.passing_grade}
                                            onChange={(e) => updateSubject(index, 'passing_grade', parseInt(e.target.value) || 50)}
                                        />
                                    </div>
                                </div>
                            ))}

                            {selectedSubjects.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    <p>No subjects added yet. Click "Add Subject" to get started.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="flex justify-end space-x-4">
                        <Link href="/academic/curriculum">
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </Link>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Updating...' : 'Update Curriculum'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}



