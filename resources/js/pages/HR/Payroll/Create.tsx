import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Save, Users, DollarSign, Calculator, AlertCircle, CheckCircle } from 'lucide-react';

interface Staff {
    id: number;
    name: string;
    employee_id: string;
    role: string;
    salary_structure: {
        name: string;
        basic_salary: number;
        house_allowance: number;
        transport_allowance: number;
        risk_allowance: number;
        medical_allowance: number;
        other_allowances: number;
        nssf_percentage: number;
        paye_rate: number;
        sdl_percentage: number;
    };
    attendance_days: number;
    working_days: number;
    leave_days: number;
    absent_days: number;
}

interface Props {
    staff: Staff[];
    currentMonth: number;
    currentYear: number;
}

export default function CreatePayroll({ staff, currentMonth, currentYear }: Props) {
    const [selectedStaff, setSelectedStaff] = useState<number[]>([]);
    const [adjustments, setAdjustments] = useState<Record<number, {
        overtime_pay: number;
        bonus: number;
        advance_payment: number;
        loan_deduction: number;
        insurance_deduction: number;
        other_deductions: number;
    }>>({});

    const { data, setData, post, processing, errors } = useForm({
        month: currentMonth,
        year: currentYear,
        notes: '',
        staff_ids: selectedStaff,
        adjustments: adjustments,
    });

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const calculateGrossPay = (member: Staff) => {
        const structure = member.salary_structure;
        const attendanceRatio = member.working_days > 0 ? member.attendance_days / member.working_days : 0;
        
        const basicSalary = structure.basic_salary * attendanceRatio;
        const allowances = (structure.house_allowance + structure.transport_allowance + 
                          structure.risk_allowance + structure.medical_allowance + 
                          structure.other_allowances) * attendanceRatio;
        
        const adjustment = adjustments[member.id] || {};
        const overtimePay = adjustment.overtime_pay || 0;
        const bonus = adjustment.bonus || 0;
        const advancePayment = adjustment.advance_payment || 0;
        
        return basicSalary + allowances + overtimePay + bonus - advancePayment;
    };

    const calculateDeductions = (member: Staff) => {
        const structure = member.salary_structure;
        const grossPay = calculateGrossPay(member);
        
        const nssfDeduction = (structure.basic_salary * structure.nssf_percentage) / 100;
        const payeDeduction = (structure.basic_salary * structure.paye_rate) / 100;
        const sdlDeduction = (structure.basic_salary * structure.sdl_percentage) / 100;
        
        const adjustment = adjustments[member.id] || {};
        const loanDeduction = adjustment.loan_deduction || 0;
        const insuranceDeduction = adjustment.insurance_deduction || 0;
        const otherDeductions = adjustment.other_deductions || 0;
        
        return nssfDeduction + payeDeduction + sdlDeduction + loanDeduction + insuranceDeduction + otherDeductions;
    };

    const calculateNetPay = (member: Staff) => {
        return calculateGrossPay(member) - calculateDeductions(member);
    };

    const toggleStaffSelection = (staffId: number) => {
        if (selectedStaff.includes(staffId)) {
            setSelectedStaff(selectedStaff.filter(id => id !== staffId));
        } else {
            setSelectedStaff([...selectedStaff, staffId]);
        }
    };

    const selectAllStaff = () => {
        setSelectedStaff(staff.map(s => s.id));
    };

    const deselectAllStaff = () => {
        setSelectedStaff([]);
    };

    const updateAdjustment = (staffId: number, field: string, value: number) => {
        setAdjustments({
            ...adjustments,
            [staffId]: {
                ...adjustments[staffId],
                [field]: value,
            }
        });
    };

    const totalStats = {
        grossPay: selectedStaff.reduce((sum, id) => {
            const member = staff.find(s => s.id === id);
            return sum + (member ? calculateGrossPay(member) : 0);
        }, 0),
        deductions: selectedStaff.reduce((sum, id) => {
            const member = staff.find(s => s.id === id);
            return sum + (member ? calculateDeductions(member) : 0);
        }, 0),
        netPay: selectedStaff.reduce((sum, id) => {
            const member = staff.find(s => s.id === id);
            return sum + (member ? calculateNetPay(member) : 0);
        }, 0),
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setData('staff_ids', selectedStaff);
        setData('adjustments', adjustments);
        post('/hr/payroll');
    };

    return (
        <AppLayout>
            <Head title="Process Payroll" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Process Payroll</h1>
                    <p className="text-gray-600">Create payroll for {months[currentMonth - 1]} {currentYear}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Payroll Period</CardTitle>
                            <CardDescription>
                                Select the payroll period and add notes
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="month">Month</Label>
                                    <Select
                                        value={data.month.toString()}
                                        onValueChange={(value) => setData('month', parseInt(value))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {months.map((month, index) => (
                                                <SelectItem key={index + 1} value={(index + 1).toString()}>
                                                    {month}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.month && <p className="text-red-500 text-sm">{errors.month}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="year">Year</Label>
                                    <Input
                                        id="year"
                                        type="number"
                                        value={data.year}
                                        onChange={(e) => setData('year', parseInt(e.target.value))}
                                        min="2020"
                                        max="2030"
                                    />
                                    {errors.year && <p className="text-red-500 text-sm">{errors.year}</p>}
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="notes">Notes</Label>
                                <Input
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="Add any notes for this payroll period"
                                />
                                {errors.notes && <p className="text-red-500 text-sm">{errors.notes}</p>}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>Staff Selection</CardTitle>
                                    <CardDescription>
                                        Select staff members to include in this payroll
                                    </CardDescription>
                                </div>
                                <div className="flex space-x-2">
                                    <Button type="button" onClick={selectAllStaff} variant="outline">
                                        Select All
                                    </Button>
                                    <Button type="button" onClick={deselectAllStaff} variant="outline">
                                        Deselect All
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">
                                            <Checkbox
                                                checked={selectedStaff.length === staff.length}
                                                onCheckedChange={(checked) => {
                                                    if (checked) selectAllStaff();
                                                    else deselectAllStaff();
                                                }}
                                            />
                                        </TableHead>
                                        <TableHead>Staff Member</TableHead>
                                        <TableHead>Basic Salary</TableHead>
                                        <TableHead>Allowances</TableHead>
                                        <TableHead>Attendance</TableHead>
                                        <TableHead>Gross Pay</TableHead>
                                        <TableHead>Deductions</TableHead>
                                        <TableHead>Net Pay</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {staff.map((member) => (
                                        <TableRow key={member.id}>
                                            <TableCell>
                                                <Checkbox
                                                    checked={selectedStaff.includes(member.id)}
                                                    onCheckedChange={() => toggleStaffSelection(member.id)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{member.name}</div>
                                                    <div className="text-sm text-gray-500">{member.employee_id}</div>
                                                    <div className="text-sm text-gray-500">{member.role}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                TZS {member.salary_structure.basic_salary.toLocaleString()}
                                            </TableCell>
                                            <TableCell>
                                                TZS {(member.salary_structure.house_allowance + 
                                                     member.salary_structure.transport_allowance + 
                                                     member.salary_structure.risk_allowance + 
                                                     member.salary_structure.medical_allowance + 
                                                     member.salary_structure.other_allowances).toLocaleString()}
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    <div>{member.attendance_days}/{member.working_days} days</div>
                                                    <div className="text-gray-500">
                                                        {member.working_days > 0 ? 
                                                            Math.round((member.attendance_days / member.working_days) * 100) : 0}%
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">
                                                    TZS {calculateGrossPay(member).toLocaleString()}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-red-600">
                                                    TZS {calculateDeductions(member).toLocaleString()}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium text-green-600">
                                                    TZS {calculateNetPay(member).toLocaleString()}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Payroll Adjustments</CardTitle>
                            <CardDescription>
                                Add any adjustments for individual staff members
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {selectedStaff.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <AlertCircle className="w-12 h-12 mx-auto mb-4" />
                                    <p>Select staff members to add adjustments</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {selectedStaff.map(staffId => {
                                        const member = staff.find(s => s.id === staffId);
                                        if (!member) return null;
                                        
                                        const adjustment = adjustments[staffId] || {
                                            overtime_pay: 0,
                                            bonus: 0,
                                            advance_payment: 0,
                                            loan_deduction: 0,
                                            insurance_deduction: 0,
                                            other_deductions: 0,
                                        };

                                        return (
                                            <div key={staffId} className="p-4 border rounded-lg">
                                                <h4 className="font-medium mb-4">{member.name}</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div>
                                                        <Label>Overtime Pay</Label>
                                                        <Input
                                                            type="number"
                                                            value={adjustment.overtime_pay}
                                                            onChange={(e) => updateAdjustment(staffId, 'overtime_pay', parseFloat(e.target.value) || 0)}
                                                            placeholder="0"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label>Bonus</Label>
                                                        <Input
                                                            type="number"
                                                            value={adjustment.bonus}
                                                            onChange={(e) => updateAdjustment(staffId, 'bonus', parseFloat(e.target.value) || 0)}
                                                            placeholder="0"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label>Advance Payment</Label>
                                                        <Input
                                                            type="number"
                                                            value={adjustment.advance_payment}
                                                            onChange={(e) => updateAdjustment(staffId, 'advance_payment', parseFloat(e.target.value) || 0)}
                                                            placeholder="0"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label>Loan Deduction</Label>
                                                        <Input
                                                            type="number"
                                                            value={adjustment.loan_deduction}
                                                            onChange={(e) => updateAdjustment(staffId, 'loan_deduction', parseFloat(e.target.value) || 0)}
                                                            placeholder="0"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label>Insurance Deduction</Label>
                                                        <Input
                                                            type="number"
                                                            value={adjustment.insurance_deduction}
                                                            onChange={(e) => updateAdjustment(staffId, 'insurance_deduction', parseFloat(e.target.value) || 0)}
                                                            placeholder="0"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label>Other Deductions</Label>
                                                        <Input
                                                            type="number"
                                                            value={adjustment.other_deductions}
                                                            onChange={(e) => updateAdjustment(staffId, 'other_deductions', parseFloat(e.target.value) || 0)}
                                                            placeholder="0"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Payroll Summary</CardTitle>
                            <CardDescription>
                                Review the payroll totals before processing
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="text-center p-4 bg-blue-50 rounded-lg">
                                    <Users className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                                    <div className="text-2xl font-bold text-blue-600">{selectedStaff.length}</div>
                                    <div className="text-sm text-gray-600">Staff Members</div>
                                </div>
                                <div className="text-center p-4 bg-green-50 rounded-lg">
                                    <DollarSign className="w-8 h-8 mx-auto mb-2 text-green-600" />
                                    <div className="text-2xl font-bold text-green-600">
                                        TZS {totalStats.grossPay.toLocaleString()}
                                    </div>
                                    <div className="text-sm text-gray-600">Total Gross Pay</div>
                                </div>
                                <div className="text-center p-4 bg-red-50 rounded-lg">
                                    <Calculator className="w-8 h-8 mx-auto mb-2 text-red-600" />
                                    <div className="text-2xl font-bold text-red-600">
                                        TZS {totalStats.deductions.toLocaleString()}
                                    </div>
                                    <div className="text-sm text-gray-600">Total Deductions</div>
                                </div>
                            </div>
                            <div className="mt-6 p-4 bg-emerald-50 rounded-lg text-center">
                                <div className="text-3xl font-bold text-emerald-600">
                                    TZS {totalStats.netPay.toLocaleString()}
                                </div>
                                <div className="text-lg text-gray-600">Total Net Pay</div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end space-x-4">
                        <Button type="button" variant="outline">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing || selectedStaff.length === 0}>
                            <Save className="w-4 h-4 mr-2" />
                            {processing ? 'Processing...' : 'Process Payroll'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}



