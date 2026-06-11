import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Save, Calendar, DollarSign, User, FileText, Clock, CheckCircle } from 'lucide-react';

interface Student {
    id: number;
    first_name: string;
    last_name: string;
    student_number: string;
    current_class: {
        name: string;
        level: string;
    } | null;
}

interface Invoice {
    id: number;
    invoice_number: string;
    total_amount: number;
    paid_amount: number;
    balance_amount: number;
    due_date: string;
    status: string;
}

interface Props {
    students: Student[];
    invoices: Invoice[];
}

export default function CreatePaymentPlan({ students, invoices }: Props) {
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [installmentCount, setInstallmentCount] = useState<number>(1);
    const [frequency, setFrequency] = useState<string>('monthly');

    const { data, setData, post, processing, errors } = useForm({
        student_id: '',
        invoice_id: '',
        plan_name: '',
        total_amount: '',
        installment_count: 1,
        installment_amount: '',
        start_date: '',
        end_date: '',
        frequency: 'monthly',
        notes: '',
    });

    const frequencies = [
        { value: 'weekly', label: 'Weekly' },
        { value: 'monthly', label: 'Monthly' },
        { value: 'termly', label: 'Termly' },
    ];

    const handleStudentChange = (studentId: string) => {
        const student = students.find(s => s.id.toString() === studentId);
        setSelectedStudent(student || null);
        setData('student_id', studentId);
        setSelectedInvoice(null);
        setData('invoice_id', '');
    };

    const handleInvoiceChange = (invoiceId: string) => {
        const invoice = invoices.find(i => i.id.toString() === invoiceId);
        setSelectedInvoice(invoice || null);
        setData('invoice_id', invoiceId);
        if (invoice) {
            setData('total_amount', invoice.balance_amount.toString());
            setData('plan_name', `Payment Plan for ${invoice.invoice_number}`);
        }
    };

    const handleInstallmentCountChange = (count: number) => {
        setInstallmentCount(count);
        setData('installment_count', count);
        if (selectedInvoice) {
            const installmentAmount = selectedInvoice.balance_amount / count;
            setData('installment_amount', installmentAmount.toString());
        }
    };

    const handleFrequencyChange = (freq: string) => {
        setFrequency(freq);
        setData('frequency', freq);
    };

    const calculateEndDate = (startDate: string, count: number, freq: string) => {
        if (!startDate) return '';
        
        const start = new Date(startDate);
        let end = new Date(start);
        
        switch (freq) {
            case 'weekly':
                end.setDate(start.getDate() + (count * 7));
                break;
            case 'monthly':
                end.setMonth(start.getMonth() + count);
                break;
            case 'termly':
                end.setMonth(start.getMonth() + (count * 3));
                break;
        }
        
        return end.toISOString().split('T')[0];
    };

    const handleStartDateChange = (date: string) => {
        setData('start_date', date);
        const endDate = calculateEndDate(date, installmentCount, frequency);
        setData('end_date', endDate);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/finance/payment-plans');
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'draft':
                return 'bg-gray-100 text-gray-800';
            case 'sent':
                return 'bg-blue-100 text-blue-800';
            case 'partial':
                return 'bg-yellow-100 text-yellow-800';
            case 'paid':
                return 'bg-green-100 text-green-800';
            case 'overdue':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const studentInvoices = selectedStudent ? 
        invoices.filter(invoice => invoice.id.toString() === data.invoice_id) : 
        [];

    return (
        <AppLayout>
            <Head title="Create Payment Plan" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Create Payment Plan</h1>
                    <p className="text-gray-600">Set up an installment payment plan for a student</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Plan Information</CardTitle>
                            <CardDescription>
                                Select the student and invoice for this payment plan
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="student_id">Student</Label>
                                    <Select
                                        value={data.student_id}
                                        onValueChange={handleStudentChange}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select student" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {students.map((student) => (
                                                <SelectItem key={student.id} value={student.id.toString()}>
                                                    <div>
                                                        <div className="font-medium">
                                                            {student.first_name} {student.last_name}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {student.student_number}{student.current_class ? ` • ${student.current_class.name}` : ''}
                                                        </div>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.student_id && <p className="text-red-500 text-sm">{errors.student_id}</p>}
                                    
                                    {selectedStudent && (
                                        <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                                            <div className="text-sm">
                                                <div className="font-medium">Student Details:</div>
                                                <ul className="mt-1 space-y-1 text-gray-600">
                                                    <li>• Name: {selectedStudent.first_name} {selectedStudent.last_name}</li>
                                                    <li>• Student Number: {selectedStudent.student_number}</li>
                                                    <li>• Class: {selectedStudent.current_class?.name ?? 'Unassigned'} {selectedStudent.current_class?.level ? `(${selectedStudent.current_class.level})` : ''}</li>
                                                </ul>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="invoice_id">Invoice</Label>
                                    <Select
                                        value={data.invoice_id}
                                        onValueChange={handleInvoiceChange}
                                        disabled={!selectedStudent}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select invoice" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {studentInvoices.map((invoice) => (
                                                <SelectItem key={invoice.id} value={invoice.id.toString()}>
                                                    <div>
                                                        <div className="font-medium">{invoice.invoice_number}</div>
                                                        <div className="text-sm text-gray-500">
                                                            Balance: TZS {invoice.balance_amount.toLocaleString()}
                                                        </div>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.invoice_id && <p className="text-red-500 text-sm">{errors.invoice_id}</p>}
                                    
                                    {selectedInvoice && (
                                        <div className="mt-2 p-3 bg-green-50 rounded-lg">
                                            <div className="text-sm">
                                                <div className="font-medium">Invoice Details:</div>
                                                <ul className="mt-1 space-y-1 text-gray-600">
                                                    <li>• Invoice: {selectedInvoice.invoice_number}</li>
                                                    <li>• Total Amount: TZS {selectedInvoice.total_amount.toLocaleString()}</li>
                                                    <li>• Paid Amount: TZS {selectedInvoice.paid_amount.toLocaleString()}</li>
                                                    <li>• Balance: TZS {selectedInvoice.balance_amount.toLocaleString()}</li>
                                                    <li>• Due Date: {new Date(selectedInvoice.due_date).toLocaleDateString()}</li>
                                                    <li>• Status: <Badge className={getStatusColor(selectedInvoice.status)}>{selectedInvoice.status.toUpperCase()}</Badge></li>
                                                </ul>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="plan_name">Plan Name</Label>
                                <Input
                                    id="plan_name"
                                    value={data.plan_name}
                                    onChange={(e) => setData('plan_name', e.target.value)}
                                    placeholder="Enter a descriptive name for this payment plan"
                                    className={errors.plan_name ? 'border-red-500' : ''}
                                />
                                {errors.plan_name && <p className="text-red-500 text-sm">{errors.plan_name}</p>}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Schedule</CardTitle>
                            <CardDescription>
                                Set up the payment schedule and amounts
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="total_amount">Total Amount (TZS)</Label>
                                    <Input
                                        id="total_amount"
                                        type="number"
                                        value={data.total_amount}
                                        onChange={(e) => setData('total_amount', e.target.value)}
                                        placeholder="0"
                                        className={errors.total_amount ? 'border-red-500' : ''}
                                    />
                                    {errors.total_amount && <p className="text-red-500 text-sm">{errors.total_amount}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="installment_count">Number of Installments</Label>
                                    <Input
                                        id="installment_count"
                                        type="number"
                                        value={data.installment_count}
                                        onChange={(e) => handleInstallmentCountChange(parseInt(e.target.value) || 1)}
                                        placeholder="1"
                                        min="1"
                                        className={errors.installment_count ? 'border-red-500' : ''}
                                    />
                                    {errors.installment_count && <p className="text-red-500 text-sm">{errors.installment_count}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="installment_amount">Installment Amount (TZS)</Label>
                                    <Input
                                        id="installment_amount"
                                        type="number"
                                        value={data.installment_amount}
                                        onChange={(e) => setData('installment_amount', e.target.value)}
                                        placeholder="0"
                                        className={errors.installment_amount ? 'border-red-500' : ''}
                                    />
                                    {errors.installment_amount && <p className="text-red-500 text-sm">{errors.installment_amount}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="frequency">Payment Frequency</Label>
                                    <Select
                                        value={data.frequency}
                                        onValueChange={handleFrequencyChange}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {frequencies.map((freq) => (
                                                <SelectItem key={freq.value} value={freq.value}>
                                                    {freq.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.frequency && <p className="text-red-500 text-sm">{errors.frequency}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="start_date">Start Date</Label>
                                    <Input
                                        id="start_date"
                                        type="date"
                                        value={data.start_date}
                                        onChange={(e) => handleStartDateChange(e.target.value)}
                                        className={errors.start_date ? 'border-red-500' : ''}
                                    />
                                    {errors.start_date && <p className="text-red-500 text-sm">{errors.start_date}</p>}
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="end_date">End Date</Label>
                                <Input
                                    id="end_date"
                                    type="date"
                                    value={data.end_date}
                                    onChange={(e) => setData('end_date', e.target.value)}
                                    className={errors.end_date ? 'border-red-500' : ''}
                                />
                                {errors.end_date && <p className="text-red-500 text-sm">{errors.end_date}</p>}
                            </div>

                            <div>
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="Additional notes about this payment plan..."
                                    rows={3}
                                />
                                {errors.notes && <p className="text-red-500 text-sm">{errors.notes}</p>}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Plan Summary</CardTitle>
                            <CardDescription>
                                Review the payment plan details before creating
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <div className="text-sm font-medium text-gray-600">Student</div>
                                        <div className="text-lg font-semibold">
                                            {selectedStudent?.first_name} {selectedStudent?.last_name}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {selectedStudent?.student_number}{selectedStudent?.current_class ? ` • ${selectedStudent.current_class.name}` : ''}
                                        </div>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <div className="text-sm font-medium text-gray-600">Invoice</div>
                                        <div className="text-lg font-semibold">
                                            {selectedInvoice?.invoice_number || 'Not selected'}
                                        </div>
                                        {selectedInvoice && (
                                            <div className="text-sm text-gray-500">
                                                Balance: TZS {selectedInvoice.balance_amount.toLocaleString()}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="p-4 bg-blue-50 rounded-lg">
                                        <div className="text-sm font-medium text-blue-600">Total Amount</div>
                                        <div className="text-lg font-semibold text-blue-600">
                                            TZS {data.total_amount ? parseFloat(data.total_amount).toLocaleString() : '0'}
                                        </div>
                                    </div>
                                    <div className="p-4 bg-green-50 rounded-lg">
                                        <div className="text-sm font-medium text-green-600">Installments</div>
                                        <div className="text-lg font-semibold text-green-600">
                                            {data.installment_count}
                                        </div>
                                    </div>
                                    <div className="p-4 bg-purple-50 rounded-lg">
                                        <div className="text-sm font-medium text-purple-600">Per Installment</div>
                                        <div className="text-lg font-semibold text-purple-600">
                                            TZS {data.installment_amount ? parseFloat(data.installment_amount).toLocaleString() : '0'}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <div className="text-sm font-medium text-gray-600">Payment Frequency</div>
                                        <div className="text-lg font-semibold">
                                            {frequencies.find(f => f.value === data.frequency)?.label || 'Not selected'}
                                        </div>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <div className="text-sm font-medium text-gray-600">Payment Period</div>
                                        <div className="text-lg font-semibold">
                                            {data.start_date ? new Date(data.start_date).toLocaleDateString() : 'Not set'}
                                        </div>
                                        {data.end_date && (
                                            <div className="text-sm text-gray-500">
                                                to {new Date(data.end_date).toLocaleDateString()}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="p-4 bg-yellow-50 rounded-lg">
                                    <div className="text-sm font-medium text-yellow-600">Payment Schedule Preview</div>
                                    <div className="mt-2 space-y-1">
                                        {Array.from({ length: Math.min(data.installment_count, 5) }, (_, i) => {
                                            const installmentDate = new Date(data.start_date);
                                            switch (data.frequency) {
                                                case 'weekly':
                                                    installmentDate.setDate(installmentDate.getDate() + (i * 7));
                                                    break;
                                                case 'monthly':
                                                    installmentDate.setMonth(installmentDate.getMonth() + i);
                                                    break;
                                                case 'termly':
                                                    installmentDate.setMonth(installmentDate.getMonth() + (i * 3));
                                                    break;
                                            }
                                            return (
                                                <div key={i} className="text-sm">
                                                    Installment {i + 1}: TZS {data.installment_amount ? parseFloat(data.installment_amount).toLocaleString() : '0'} 
                                                    - {installmentDate.toLocaleDateString()}
                                                </div>
                                            );
                                        })}
                                        {data.installment_count > 5 && (
                                            <div className="text-sm text-gray-500">
                                                ... and {data.installment_count - 5} more installments
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end space-x-4">
                        <Button type="button" variant="outline">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing || !selectedStudent || !selectedInvoice}>
                            <Save className="w-4 h-4 mr-2" />
                            {processing ? 'Creating...' : 'Create Payment Plan'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}



