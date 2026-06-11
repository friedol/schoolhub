import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, ClipboardList, CheckCircle } from 'lucide-react';

interface DropdownItem { id: number; name: string }
interface Props { exams: DropdownItem[]; classes: DropdownItem[]; subjects: DropdownItem[]; terms: DropdownItem[] }

export default function MarksEntryIndex({ exams, classes, subjects, terms }: Props) {
    const [examId, setExamId] = useState('');
    const [classId, setClassId] = useState('');
    const [subjectId, setSubjectId] = useState('');
    const [termId, setTermId] = useState('');

    const canProceed = examId && classId && subjectId && termId;

    const handleProceed = (e: React.FormEvent) => {
        e.preventDefault();
        if (canProceed) {
            router.get('/academic/marks-entry/input', { exam_id: examId, school_class_id: classId, subject_id: subjectId, academic_term_id: termId });
        }
    };

    const steps = [
        { label: 'Select Examination', value: examId, items: exams, set: setExamId, placeholder: 'Choose examination' },
        { label: 'Select Term', value: termId, items: terms, set: setTermId, placeholder: 'Choose academic term' },
        { label: 'Select Class', value: classId, items: classes, set: setClassId, placeholder: 'Choose class' },
        { label: 'Select Subject', value: subjectId, items: subjects, set: setSubjectId, placeholder: 'Choose subject' },
    ];

    const completedSteps = steps.filter(s => s.value).length;

    return (
        <AppLayout>
            <Head title="Marks Entry" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">

                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Marks Entry</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">Select the examination, term, class and subject to begin entering marks</p>
                </div>

                <div className="mx-auto w-full max-w-lg">
                    <Card className="border shadow-sm">
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base">Setup Marks Entry</CardTitle>
                                <span className="text-xs text-muted-foreground">{completedSteps}/4 selected</span>
                            </div>
                            {/* Progress */}
                            <div className="flex gap-1 mt-2">
                                {steps.map((_, i) => (
                                    <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i < completedSteps ? 'bg-primary' : 'bg-muted'}`} />
                                ))}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleProceed} className="space-y-4">
                                {steps.map((step, i) => (
                                    <div key={step.label} className="space-y-1.5">
                                        <div className="flex items-center gap-2">
                                            <div className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-medium ${step.value ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                                                {step.value ? <CheckCircle className="h-3.5 w-3.5" /> : i + 1}
                                            </div>
                                            <label className="text-sm font-medium">{step.label}</label>
                                        </div>
                                        <Select value={step.value || 'none'} onValueChange={v => step.set(v === 'none' ? '' : v)}>
                                            <SelectTrigger className={`h-9 ${step.value ? 'border-primary/50' : ''}`}>
                                                <SelectValue placeholder={step.placeholder} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">{step.placeholder}</SelectItem>
                                                {step.items.map(item => <SelectItem key={item.id} value={String(item.id)}>{item.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                ))}

                                <Button type="submit" className="w-full mt-2" disabled={!canProceed}>
                                    {canProceed ? (
                                        <>Start Marks Entry <ArrowRight className="ml-2 h-4 w-4" /></>
                                    ) : (
                                        <><ClipboardList className="mr-2 h-4 w-4" />Select all 4 options above</>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
