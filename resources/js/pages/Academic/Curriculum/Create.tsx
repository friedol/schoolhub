import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Plus, Trash2, X, Save } from 'lucide-react';
import Swal from 'sweetalert2';

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

interface Props {
    subjects: Subject[];
    classes: Class[];
}

export default function CreateCurriculum({ subjects, classes }: Props) {
    const [selectedSubjects, setSelectedSubjects] = useState<Array<{
        subject_id: number;
        is_core: boolean;
        is_elective: boolean;
        is_compulsory: boolean;
        credits: number;
        weekly_periods: number;
        passing_grade: number;
    }>>([]);

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        code: '',
        description: '',
        level: '',
        academic_year: '2024/2025',
        is_necta_curriculum: false,
        subjects: [] as any[],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setData('subjects', selectedSubjects);
        post('/academic/curriculum', {
            onSuccess: () => {
                Swal.fire({
                    title: 'Success!',
                    text: 'Curriculum created successfully.',
                    icon: 'success',
                    timer: 3000,
                    showConfirmButton: false,
                    toast: true,
                    position: 'top-end',
                });
                router.visit('/academic/curriculum');
            },
            onError: () => {
                Swal.fire({
                    title: 'Error!',
                    text: 'Failed to create curriculum. Please try again.',
                    icon: 'error',
                    timer: 3000,
                    showConfirmButton: false,
                    toast: true,
                    position: 'top-end',
                });
            }
        });
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
            <Head title="Create Curriculum" />

            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-transparent z-40 transition-opacity"
                onClick={() => router.visit('/academic/curriculum')}
            />
            
            {/* Slide Panel */}
            <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out">
                <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Create New Curriculum</h2>
                            <p className="text-sm text-gray-500 mt-1">Add a new curriculum to the system</p>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.visit('/academic/curriculum')}
                            className="h-8 w-8 p-0"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Curriculum Information */}
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Curriculum Information</h3>
                                    <p className="text-sm text-gray-500 mb-4">Basic information about the curriculum</p>
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="text-sm font-medium text-gray-700">Curriculum Name *</Label>
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
                                        <Label htmlFor="code" className="text-sm font-medium text-gray-700">Curriculum Code *</Label>
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
                                        <Label htmlFor="level" className="text-sm font-medium text-gray-700">Level *</Label>
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
                                        <Label htmlFor="academic_year" className="text-sm font-medium text-gray-700">Academic Year *</Label>
                                        <Select value={data.academic_year} onValueChange={(value) => setData('academic_year', value)}>
                                            <SelectTrigger className={errors.academic_year ? 'border-red-500' : ''}>
                                                <SelectValue placeholder="Select academic year" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="2023/2024">2023/2024</SelectItem>
                                                <SelectItem value="2024/2025">2024/2025</SelectItem>
                                                <SelectItem value="2025/2026">2025/2026</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.academic_year && <p className="text-sm text-red-500">{errors.academic_year}</p>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description" className="text-sm font-medium text-gray-700">Description</Label>
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
                                    <Label htmlFor="is_necta_curriculum" className="text-sm font-medium text-gray-700">NECTA Compliant Curriculum</Label>
                                </div>
                            </div>

                            {/* Subjects Section */}
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Subjects</h3>
                                    <p className="text-sm text-gray-500 mb-4">Add subjects to this curriculum</p>
                                </div>
                                
                                <Button type="button" onClick={addSubject} variant="outline" className="w-full">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Subject
                                </Button>

                                {selectedSubjects.map((subject, index) => (
                                    <div key={index} className="border rounded-lg p-4 space-y-4 bg-gray-50">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-medium text-gray-900">Subject {index + 1}</h4>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => removeSubject(index)}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium text-gray-700">Subject *</Label>
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

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium text-gray-700">Credits</Label>
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        value={subject.credits}
                                                        onChange={(e) => updateSubject(index, 'credits', parseInt(e.target.value) || 1)}
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium text-gray-700">Weekly Periods</Label>
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        value={subject.weekly_periods}
                                                        onChange={(e) => updateSubject(index, 'weekly_periods', parseInt(e.target.value) || 1)}
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        checked={subject.is_core}
                                                        onCheckedChange={(checked) => updateSubject(index, 'is_core', checked)}
                                                    />
                                                    <Label className="text-sm font-medium text-gray-700">Core Subject</Label>
                                                </div>

                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        checked={subject.is_elective}
                                                        onCheckedChange={(checked) => updateSubject(index, 'is_elective', checked)}
                                                    />
                                                    <Label className="text-sm font-medium text-gray-700">Elective Subject</Label>
                                                </div>

                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        checked={subject.is_compulsory}
                                                        onCheckedChange={(checked) => updateSubject(index, 'is_compulsory', checked)}
                                                    />
                                                    <Label className="text-sm font-medium text-gray-700">Compulsory</Label>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium text-gray-700">Passing Grade (%)</Label>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    value={subject.passing_grade}
                                                    onChange={(e) => updateSubject(index, 'passing_grade', parseInt(e.target.value) || 50)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {selectedSubjects.length === 0 && (
                                    <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                                        <p className="text-sm">No subjects added yet. Click "Add Subject" to get started.</p>
                                    </div>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-200 p-6">
                        <div className="flex space-x-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.visit('/academic/curriculum')}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing}
                                onClick={handleSubmit}
                                className="flex-1"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                {processing ? 'Creating...' : 'Create Curriculum'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}