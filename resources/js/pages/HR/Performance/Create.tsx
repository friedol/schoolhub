import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Target, Save, Calendar, User, AlertCircle } from 'lucide-react';

interface AppraisalCycle {
    id: number;
    name: string;
    appraisal_type: string;
    start_date: string;
    end_date: string;
    status: string;
}

interface Staff {
    id: number;
    name: string;
    employee_id: string;
    role: string;
}

interface Props {
    appraisalCycles: AppraisalCycle[];
    staff: Staff[];
    appraisers: Staff[];
}

export default function CreatePerformanceAppraisal({ appraisalCycles, staff, appraisers }: Props) {
    const [selectedCycle, setSelectedCycle] = useState<AppraisalCycle | null>(null);
    const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
    const [goals, setGoals] = useState<Array<{
        goal_title: string;
        goal_description: string;
        target_date: string;
        success_criteria: string;
        weight: number;
    }>>([]);

    const { data, setData, post, processing, errors } = useForm({
        appraisal_cycle_id: '',
        staff_id: '',
        appraiser_id: '',
        goals: goals,
        meeting_date: '',
        notes: '',
    });

    const addGoal = () => {
        setGoals([...goals, {
            goal_title: '',
            goal_description: '',
            target_date: '',
            success_criteria: '',
            weight: 0,
        }]);
    };

    const removeGoal = (index: number) => {
        setGoals(goals.filter((_, i) => i !== index));
    };

    const updateGoal = (index: number, field: string, value: string | number) => {
        const updated = [...goals];
        updated[index] = { ...updated[index], [field]: value };
        setGoals(updated);
        setData('goals', updated);
    };

    const handleCycleChange = (cycleId: string) => {
        const cycle = appraisalCycles.find(c => c.id.toString() === cycleId);
        setSelectedCycle(cycle || null);
        setData('appraisal_cycle_id', cycleId);
    };

    const handleStaffChange = (staffId: string) => {
        const staffMember = staff.find(s => s.id.toString() === staffId);
        setSelectedStaff(staffMember || null);
        setData('staff_id', staffId);
    };

    const validateForm = () => {
        if (!data.appraisal_cycle_id) return false;
        if (!data.staff_id) return false;
        if (!data.appraiser_id) return false;
        if (goals.length === 0) return false;
        return true;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setData('goals', goals);
        post('/hr/performance');
    };

    return (
        <AppLayout>
            <Head title="Start Performance Appraisal" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Start Performance Appraisal</h1>
                    <p className="text-gray-600">Create a new performance appraisal for a staff member</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Appraisal Setup</CardTitle>
                            <CardDescription>
                                Select the appraisal cycle and participants
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="appraisal_cycle_id">Appraisal Cycle</Label>
                                    <Select
                                        value={data.appraisal_cycle_id}
                                        onValueChange={handleCycleChange}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select appraisal cycle" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {appraisalCycles.map((cycle) => (
                                                <SelectItem key={cycle.id} value={cycle.id.toString()}>
                                                    <div className="flex items-center justify-between w-full">
                                                        <span>{cycle.name}</span>
                                                        <div className="flex items-center space-x-2 ml-4">
                                                            <span className="text-xs text-gray-500">
                                                                {cycle.appraisal_type.replace('_', ' ')}
                                                            </span>
                                                            <span className={`text-xs px-2 py-1 rounded ${
                                                                cycle.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                            }`}>
                                                                {cycle.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.appraisal_cycle_id && <p className="text-red-500 text-sm">{errors.appraisal_cycle_id}</p>}
                                    
                                    {selectedCycle && (
                                        <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                                            <div className="text-sm">
                                                <div className="font-medium">{selectedCycle.name} Details:</div>
                                                <ul className="mt-1 space-y-1 text-gray-600">
                                                    <li>• Type: {selectedCycle.appraisal_type.replace('_', ' ')}</li>
                                                    <li>• Period: {new Date(selectedCycle.start_date).toLocaleDateString()} - {new Date(selectedCycle.end_date).toLocaleDateString()}</li>
                                                    <li>• Status: {selectedCycle.status}</li>
                                                </ul>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="staff_id">Staff Member</Label>
                                    <Select
                                        value={data.staff_id}
                                        onValueChange={handleStaffChange}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select staff member" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {staff.map((member) => (
                                                <SelectItem key={member.id} value={member.id.toString()}>
                                                    <div>
                                                        <div className="font-medium">{member.name}</div>
                                                        <div className="text-sm text-gray-500">{member.employee_id} - {member.role}</div>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.staff_id && <p className="text-red-500 text-sm">{errors.staff_id}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="appraiser_id">Appraiser</Label>
                                    <Select
                                        value={data.appraiser_id}
                                        onValueChange={(value) => setData('appraiser_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select appraiser" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {appraisers.map((appraiser) => (
                                                <SelectItem key={appraiser.id} value={appraiser.id.toString()}>
                                                    <div>
                                                        <div className="font-medium">{appraiser.name}</div>
                                                        <div className="text-sm text-gray-500">{appraiser.employee_id} - {appraiser.role}</div>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.appraiser_id && <p className="text-red-500 text-sm">{errors.appraiser_id}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="meeting_date">Meeting Date</Label>
                                    <Input
                                        id="meeting_date"
                                        type="date"
                                        value={data.meeting_date}
                                        onChange={(e) => setData('meeting_date', e.target.value)}
                                        min={selectedCycle ? new Date(selectedCycle.start_date).toISOString().split('T')[0] : undefined}
                                        max={selectedCycle ? new Date(selectedCycle.end_date).toISOString().split('T')[0] : undefined}
                                    />
                                    {errors.meeting_date && <p className="text-red-500 text-sm">{errors.meeting_date}</p>}
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="Add any notes for this appraisal"
                                    rows={3}
                                />
                                {errors.notes && <p className="text-red-500 text-sm">{errors.notes}</p>}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>Performance Goals</CardTitle>
                                    <CardDescription>
                                        Set SMART goals for the appraisal period
                                    </CardDescription>
                                </div>
                                <Button type="button" onClick={addGoal} variant="outline">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Goal
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {goals.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <Target className="w-12 h-12 mx-auto mb-4" />
                                    <p>No goals added yet. Click "Add Goal" to get started.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {goals.map((goal, index) => (
                                        <div key={index} className="p-4 border rounded-lg">
                                            <div className="flex justify-between items-center mb-4">
                                                <h4 className="font-medium">Goal {index + 1}</h4>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => removeGoal(index)}
                                                    className="text-red-600"
                                                >
                                                    Remove
                                                </Button>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="md:col-span-2">
                                                    <Label>Goal Title</Label>
                                                    <Input
                                                        value={goal.goal_title}
                                                        onChange={(e) => updateGoal(index, 'goal_title', e.target.value)}
                                                        placeholder="e.g., Improve student performance in Mathematics"
                                                    />
                                                </div>
                                                <div className="md:col-span-2">
                                                    <Label>Goal Description</Label>
                                                    <Textarea
                                                        value={goal.goal_description}
                                                        onChange={(e) => updateGoal(index, 'goal_description', e.target.value)}
                                                        placeholder="Detailed description of the goal"
                                                        rows={3}
                                                    />
                                                </div>
                                                <div>
                                                    <Label>Target Date</Label>
                                                    <Input
                                                        type="date"
                                                        value={goal.target_date}
                                                        onChange={(e) => updateGoal(index, 'target_date', e.target.value)}
                                                        min={selectedCycle ? new Date(selectedCycle.start_date).toISOString().split('T')[0] : undefined}
                                                        max={selectedCycle ? new Date(selectedCycle.end_date).toISOString().split('T')[0] : undefined}
                                                    />
                                                </div>
                                                <div>
                                                    <Label>Weight (%)</Label>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        max="100"
                                                        value={goal.weight}
                                                        onChange={(e) => updateGoal(index, 'weight', parseFloat(e.target.value) || 0)}
                                                        placeholder="0"
                                                    />
                                                </div>
                                                <div className="md:col-span-2">
                                                    <Label>Success Criteria</Label>
                                                    <Textarea
                                                        value={goal.success_criteria}
                                                        onChange={(e) => updateGoal(index, 'success_criteria', e.target.value)}
                                                        placeholder="How will success be measured?"
                                                        rows={2}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Appraisal Summary</CardTitle>
                            <CardDescription>
                                Review the appraisal setup before starting
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <div className="text-sm font-medium text-gray-600">Appraisal Cycle</div>
                                        <div className="text-lg font-semibold">
                                            {selectedCycle?.name || 'Not selected'}
                                        </div>
                                        {selectedCycle && (
                                            <div className="text-sm text-gray-500">
                                                {selectedCycle.appraisal_type.replace('_', ' ')} • {selectedCycle.status}
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <div className="text-sm font-medium text-gray-600">Staff Member</div>
                                        <div className="text-lg font-semibold">
                                            {selectedStaff?.name || 'Not selected'}
                                        </div>
                                        {selectedStaff && (
                                            <div className="text-sm text-gray-500">
                                                {selectedStaff.employee_id} • {selectedStaff.role}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <div className="text-sm font-medium text-gray-600">Goals Set</div>
                                        <div className="text-lg font-semibold">{goals.length} goals</div>
                                        <div className="text-sm text-gray-500">
                                            Total weight: {goals.reduce((sum, goal) => sum + goal.weight, 0)}%
                                        </div>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <div className="text-sm font-medium text-gray-600">Meeting Date</div>
                                        <div className="text-lg font-semibold">
                                            {data.meeting_date ? new Date(data.meeting_date).toLocaleDateString() : 'Not scheduled'}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2 p-4 bg-blue-50 rounded-lg">
                                    {validateForm() ? (
                                        <>
                                            <Target className="w-5 h-5 text-green-600" />
                                            <span className="text-green-600 font-medium">Appraisal is ready to start</span>
                                        </>
                                    ) : (
                                        <>
                                            <AlertCircle className="w-5 h-5 text-yellow-600" />
                                            <span className="text-yellow-600 font-medium">Please complete all required fields</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end space-x-4">
                        <Button type="button" variant="outline">
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={processing || !validateForm()}
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {processing ? 'Creating...' : 'Start Appraisal'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}



