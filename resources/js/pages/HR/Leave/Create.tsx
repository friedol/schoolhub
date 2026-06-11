import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Save, Upload, AlertCircle, CheckCircle } from 'lucide-react';

interface LeaveType {
    id: number;
    name: string;
    max_days_per_year: number;
    max_days_per_request: number;
    requires_approval: boolean;
    requires_documentation: boolean;
    is_paid: boolean;
}

interface Props {
    leaveTypes: LeaveType[];
    staff: {
        id: number;
        name: string;
        employee_id: string;
        role: string;
    };
}

export default function CreateLeaveApplication({ leaveTypes, staff }: Props) {
    const [selectedLeaveType, setSelectedLeaveType] = useState<LeaveType | null>(null);
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [totalDays, setTotalDays] = useState<number>(0);

    const { data, setData, post, processing, errors } = useForm({
        leave_type_id: '',
        start_date: '',
        end_date: '',
        total_days: 0,
        reason: '',
        document_path: null as File | null,
    });

    const calculateDays = (start: string, end: string) => {
        if (!start || !end) return 0;
        const startDate = new Date(start);
        const endDate = new Date(end);
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
        return diffDays;
    };

    const handleStartDateChange = (date: string) => {
        setStartDate(date);
        setData('start_date', date);
        if (endDate) {
            const days = calculateDays(date, endDate);
            setTotalDays(days);
            setData('total_days', days);
        }
    };

    const handleEndDateChange = (date: string) => {
        setEndDate(date);
        setData('end_date', date);
        if (startDate) {
            const days = calculateDays(startDate, date);
            setTotalDays(days);
            setData('total_days', days);
        }
    };

    const handleLeaveTypeChange = (leaveTypeId: string) => {
        const leaveType = leaveTypes.find(lt => lt.id.toString() === leaveTypeId);
        setSelectedLeaveType(leaveType || null);
        setData('leave_type_id', leaveTypeId);
    };

    const validateApplication = () => {
        if (!selectedLeaveType) return false;
        if (totalDays > selectedLeaveType.max_days_per_request) return false;
        if (totalDays <= 0) return false;
        return true;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateApplication()) return;
        post('/hr/leave');
    };

    return (
        <AppLayout>
            <Head title="Apply for Leave" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Apply for Leave</h1>
                    <p className="text-gray-600">Submit a new leave application</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Staff Information</CardTitle>
                            <CardDescription>
                                Your current staff information
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <Label>Name</Label>
                                    <Input value={staff.name} disabled />
                                </div>
                                <div>
                                    <Label>Employee ID</Label>
                                    <Input value={staff.employee_id} disabled />
                                </div>
                                <div>
                                    <Label>Role</Label>
                                    <Input value={staff.role} disabled />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Leave Application Details</CardTitle>
                            <CardDescription>
                                Provide details for your leave application
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="leave_type_id">Leave Type</Label>
                                <Select
                                    value={data.leave_type_id}
                                    onValueChange={handleLeaveTypeChange}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select leave type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {leaveTypes.map((leaveType) => (
                                            <SelectItem key={leaveType.id} value={leaveType.id.toString()}>
                                                <div className="flex items-center justify-between w-full">
                                                    <span>{leaveType.name}</span>
                                                    <div className="flex items-center space-x-2 ml-4">
                                                        <span className="text-xs text-gray-500">
                                                            Max: {leaveType.max_days_per_request} days
                                                        </span>
                                                        {leaveType.is_paid && (
                                                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                                                Paid
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.leave_type_id && <p className="text-red-500 text-sm">{errors.leave_type_id}</p>}
                                
                                {selectedLeaveType && (
                                    <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                                        <div className="text-sm">
                                            <div className="font-medium">{selectedLeaveType.name} Details:</div>
                                            <ul className="mt-1 space-y-1 text-gray-600">
                                                <li>• Maximum days per request: {selectedLeaveType.max_days_per_request}</li>
                                                <li>• Maximum days per year: {selectedLeaveType.max_days_per_year}</li>
                                                <li>• Requires approval: {selectedLeaveType.requires_approval ? 'Yes' : 'No'}</li>
                                                <li>• Requires documentation: {selectedLeaveType.requires_documentation ? 'Yes' : 'No'}</li>
                                                <li>• Paid leave: {selectedLeaveType.is_paid ? 'Yes' : 'No'}</li>
                                            </ul>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="start_date">Start Date</Label>
                                    <Input
                                        id="start_date"
                                        type="date"
                                        value={data.start_date}
                                        onChange={(e) => handleStartDateChange(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                        className={errors.start_date ? 'border-red-500' : ''}
                                    />
                                    {errors.start_date && <p className="text-red-500 text-sm">{errors.start_date}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="end_date">End Date</Label>
                                    <Input
                                        id="end_date"
                                        type="date"
                                        value={data.end_date}
                                        onChange={(e) => handleEndDateChange(e.target.value)}
                                        min={data.start_date || new Date().toISOString().split('T')[0]}
                                        className={errors.end_date ? 'border-red-500' : ''}
                                    />
                                    {errors.end_date && <p className="text-red-500 text-sm">{errors.end_date}</p>}
                                </div>
                            </div>

                            <div>
                                <Label>Total Days</Label>
                                <Input
                                    value={totalDays}
                                    disabled
                                    className="bg-gray-50"
                                />
                                {selectedLeaveType && totalDays > selectedLeaveType.max_days_per_request && (
                                    <p className="text-red-500 text-sm mt-1">
                                        Exceeds maximum days allowed for this leave type
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="reason">Reason for Leave</Label>
                                <Textarea
                                    id="reason"
                                    value={data.reason}
                                    onChange={(e) => setData('reason', e.target.value)}
                                    placeholder="Please provide a detailed reason for your leave request"
                                    rows={4}
                                    className={errors.reason ? 'border-red-500' : ''}
                                />
                                {errors.reason && <p className="text-red-500 text-sm">{errors.reason}</p>}
                            </div>

                            {selectedLeaveType?.requires_documentation && (
                                <div>
                                    <Label htmlFor="document">Supporting Document</Label>
                                    <Input
                                        id="document"
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) setData('document_path', file);
                                        }}
                                        className="cursor-pointer"
                                    />
                                    <p className="text-sm text-gray-500 mt-1">
                                        Upload supporting documents (e.g., medical certificate, invitation letter)
                                    </p>
                                    {errors.document_path && <p className="text-red-500 text-sm">{errors.document_path}</p>}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Application Summary</CardTitle>
                            <CardDescription>
                                Review your leave application before submitting
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <div className="text-sm font-medium text-gray-600">Staff Member</div>
                                        <div className="text-lg font-semibold">{staff.name}</div>
                                        <div className="text-sm text-gray-500">{staff.employee_id}</div>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <div className="text-sm font-medium text-gray-600">Leave Type</div>
                                        <div className="text-lg font-semibold">
                                            {selectedLeaveType?.name || 'Not selected'}
                                        </div>
                                        {selectedLeaveType && (
                                            <div className="text-sm text-gray-500">
                                                {selectedLeaveType.is_paid ? 'Paid Leave' : 'Unpaid Leave'}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <div className="text-sm font-medium text-gray-600">Duration</div>
                                        <div className="text-lg font-semibold">
                                            {data.start_date && data.end_date ? (
                                                <>
                                                    {new Date(data.start_date).toLocaleDateString()} - {new Date(data.end_date).toLocaleDateString()}
                                                </>
                                            ) : (
                                                'Not specified'
                                            )}
                                        </div>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <div className="text-sm font-medium text-gray-600">Total Days</div>
                                        <div className="text-lg font-semibold">{totalDays} days</div>
                                    </div>
                                </div>

                                {data.reason && (
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <div className="text-sm font-medium text-gray-600">Reason</div>
                                        <div className="text-sm">{data.reason}</div>
                                    </div>
                                )}

                                <div className="flex items-center space-x-2 p-4 bg-blue-50 rounded-lg">
                                    {validateApplication() ? (
                                        <>
                                            <CheckCircle className="w-5 h-5 text-green-600" />
                                            <span className="text-green-600 font-medium">Application is valid and ready to submit</span>
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
                            disabled={processing || !validateApplication()}
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {processing ? 'Submitting...' : 'Submit Application'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}



