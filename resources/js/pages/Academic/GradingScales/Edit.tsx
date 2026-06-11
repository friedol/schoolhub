import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus, ArrowLeft } from 'lucide-react';

interface GradeRow {
    grade: string;
    min: number;
    max: number;
    points: number;
    description: string;
}

interface Scale {
    id: number;
    name: string;
    level: string;
    scale_type: string;
    grades: Record<string, { min: number; max: number; points: number; description: string }>;
    is_default: boolean;
}

interface Props {
    scale: Scale;
}

export default function GradingScaleEdit({ scale }: Props) {
    const initialRows: GradeRow[] = Object.entries(scale.grades).map(([grade, info]: any) => ({
        grade,
        min: info.min,
        max: info.max,
        points: info.points,
        description: info.description || '',
    }));

    const [gradeRows, setGradeRows] = useState<GradeRow[]>(initialRows);
    const [name, setName] = useState(scale.name);
    const [level, setLevel] = useState(scale.level);
    const [scaleType, setScaleType] = useState(scale.scale_type);
    const [isDefault, setIsDefault] = useState(scale.is_default);

    const addRow = () => {
        setGradeRows([...gradeRows, { grade: '', min: 0, max: 0, points: 0, description: '' }]);
    };

    const removeRow = (index: number) => {
        const rows = [...gradeRows];
        rows.splice(index, 1);
        setGradeRows(rows);
    };

    const handleRowChange = (index: number, field: keyof GradeRow, value: any) => {
        const rows = [...gradeRows];
        rows[index] = { ...rows[index], [field]: value };
        setGradeRows(rows);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Convert rows back to key-value record
        const gradesRecord: Record<string, any> = {};
        gradeRows.forEach(row => {
            if (row.grade.trim()) {
                gradesRecord[row.grade.toUpperCase()] = {
                    min: Number(row.min),
                    max: Number(row.max),
                    points: Number(row.points),
                    description: row.description,
                };
            }
        });

        const payload = {
            name,
            level,
            scale_type: scaleType,
            grades: gradesRecord,
            is_default: isDefault,
        };

        router.put(`/academic/grading-scales/${scale.id}`, payload);
    };

    return (
        <AppLayout>
            <Head title="Edit Grading Scale" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center space-x-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/academic/grading-scales">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Edit Grading Scale</h1>
                        <p className="text-muted-foreground">Adjust grading thresholds and parameters.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Scale Configuration</CardTitle>
                            <CardDescription>Configure metadata and scale details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Scale Name</Label>
                                    <Input 
                                        id="name" 
                                        placeholder="e.g. NECTA Form 4 Scale"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="level">Academic Level</Label>
                                    <Select 
                                        value={level} 
                                        onValueChange={setLevel}
                                    >
                                        <SelectTrigger id="level">
                                            <SelectValue placeholder="Select Level" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pre_primary">Pre-Primary</SelectItem>
                                            <SelectItem value="primary">Primary</SelectItem>
                                            <SelectItem value="o_level">O-Level</SelectItem>
                                            <SelectItem value="a_level">A-Level</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="scale_type">Scale Type</Label>
                                    <Select 
                                        value={scaleType} 
                                        onValueChange={setScaleType}
                                    >
                                        <SelectTrigger id="scale_type">
                                            <SelectValue placeholder="Select Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="necta">NECTA standard</SelectItem>
                                            <SelectItem value="numerical">Numerical scale</SelectItem>
                                            <SelectItem value="competency">Competency marks</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Grades and Thresholds</CardTitle>
                                <CardDescription>Input grading tiers and points</CardDescription>
                            </div>
                            <Button type="button" onClick={addRow} variant="outline" size="sm">
                                <Plus className="mr-2 h-4 w-4" /> Add Grade Row
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="grid grid-cols-12 gap-2 text-sm font-semibold text-muted-foreground pb-1">
                                    <div className="col-span-2">Grade (e.g. A)</div>
                                    <div className="col-span-2">Min Mark (%)</div>
                                    <div className="col-span-2">Max Mark (%)</div>
                                    <div className="col-span-2">Points (NECTA GPA)</div>
                                    <div className="col-span-3">Comment / Remarks</div>
                                    <div className="col-span-1 text-center">Delete</div>
                                </div>

                                {gradeRows.map((row, index) => (
                                    <div key={index} className="grid grid-cols-12 gap-2 items-center">
                                        <div className="col-span-2">
                                            <Input 
                                                value={row.grade} 
                                                onChange={e => handleRowChange(index, 'grade', e.target.value)}
                                                placeholder="A"
                                                className="uppercase"
                                                required
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <Input 
                                                type="number" 
                                                value={row.min} 
                                                onChange={e => handleRowChange(index, 'min', Number(e.target.value))}
                                                placeholder="0"
                                                min="0"
                                                max="100"
                                                required
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <Input 
                                                type="number" 
                                                value={row.max} 
                                                onChange={e => handleRowChange(index, 'max', Number(e.target.value))}
                                                placeholder="100"
                                                min="0"
                                                max="100"
                                                required
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <Input 
                                                type="number" 
                                                step="0.1"
                                                value={row.points} 
                                                onChange={e => handleRowChange(index, 'points', Number(e.target.value))}
                                                placeholder="4"
                                                required
                                            />
                                        </div>
                                        <div className="col-span-3">
                                            <Input 
                                                value={row.description} 
                                                onChange={e => handleRowChange(index, 'description', e.target.value)}
                                                placeholder="e.g. Excellent"
                                            />
                                        </div>
                                        <div className="col-span-1 text-center">
                                            <Button 
                                                type="button" 
                                                variant="ghost" 
                                                size="icon" 
                                                onClick={() => removeRow(index)}
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                disabled={scale.is_default && gradeRows.length <= 1}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center space-x-2 pt-2 border-t mt-6 pt-6">
                                <input 
                                    id="is_default" 
                                    type="checkbox"
                                    checked={isDefault}
                                    onChange={e => setIsDefault(e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    disabled={scale.is_default}
                                />
                                <Label htmlFor="is_default" className="text-sm font-medium">Make this default scale for this academic level</Label>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end space-x-2">
                        <Button variant="outline" asChild>
                            <Link href="/academic/grading-scales">Cancel</Link>
                        </Button>
                        <Button type="submit">Update Grading Scale</Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
