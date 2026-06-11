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
import { Save, DollarSign, Smartphone, CreditCard, User, FileText, Calendar } from 'lucide-react';

interface Student {
    id: number;
    first_name: string;
    last_name: string;
    student_number: string;
    current_class: {
        name: string;
        level: string;
    };
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

export default function CreatePayment({ students, invoices }: Props) {
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<string>('');

    const { data, setData, post, processing, errors } = useForm({
        student_id: '',
        invoice_id: '',
        amount: '',
        payment_method: '',
        payment_date: new Date().toISOString().split('T')[0],
        transaction_reference: '',
        mobile_money_provider: '',
        mobile_money_number: '',
        bank_name: '',
        bank_reference: '',
        notes: '',
    });

    const paymentMethods = [
        { value: 'cash', label: 'Cash', icon: DollarSign },
        { value: 'bank_transfer', label: 'Bank Transfer', icon: CreditCard },
        { value: 'mpesa', label: 'M-Pesa', icon: Smartphone },
        { value: 'tigo_pesa', label: 'Tigo Pesa', icon: Smartphone },
        { value: 'airtel_money', label: 'Airtel Money', icon: Smartphone },
        { value: 'halopesa', label: 'HaloPesa', icon: Smartphone },
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
            setData('amount', invoice.balance_amount.toString());
        }
    };

    const handlePaymentMethodChange = (method: string) => {
        setPaymentMethod(method);
        setData('payment_method', method);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/finance/payment');
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

    const getMethodIcon = (method: string) => {
        const methodConfig = paymentMethods.find(m => m.value === method);
        return methodConfig ? <methodConfig.icon className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />;
    };

    const getMethodColor = (method: string) => {
        switch (method) {
            case 'cash':
                return 'bg-green-100 text-green-800';
            case 'bank_transfer':
                return 'bg-blue-100 text-blue-800';
            case 'mpesa':
                return 'bg-green-100 text-green-800';
            case 'tigo_pesa':
                return 'bg-orange-100 text-orange-800';
            case 'airtel_money':
                return 'bg-red-100 text-red-800';
            case 'halopesa':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const studentInvoices = selectedStudent ? 
        invoices.filter(invoice => invoice.id.toString() === data.invoice_id) : 
        [];

    return (
        <AppLayout>
            <Head title="Record Payment" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Record Payment</h1>
                    <p className="text-gray-600">Record a new payment transaction</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Information</CardTitle>
                            <CardDescription>
                                Select the student and invoice for this payment
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
                                                            {student.student_number} • {student.current_class.name}
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
                                                    <li>• Class: {selectedStudent.current_class.name} ({selectedStudent.current_class.level})</li>
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
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Details</CardTitle>
                            <CardDescription>
                                Enter the payment amount and method
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="amount">Amount (TZS)</Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        value={data.amount}
                                        onChange={(e) => setData('amount', e.target.value)}
                                        placeholder="0"
                                        className={errors.amount ? 'border-red-500' : ''}
                                    />
                                    {errors.amount && <p className="text-red-500 text-sm">{errors.amount}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="payment_date">Payment Date</Label>
                                    <Input
                                        id="payment_date"
                                        type="date"
                                        value={data.payment_date}
                                        onChange={(e) => setData('payment_date', e.target.value)}
                                        className={errors.payment_date ? 'border-red-500' : ''}
                                    />
                                    {errors.payment_date && <p className="text-red-500 text-sm">{errors.payment_date}</p>}
                                </div>
                            </div>

                            <div>
                                <Label>Payment Method</Label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                                    {paymentMethods.map((method) => (
                                        <Button
                                            key={method.value}
                                            type="button"
                                            variant={paymentMethod === method.value ? "default" : "outline"}
                                            className="flex items-center space-x-2 h-auto p-4"
                                            onClick={() => handlePaymentMethodChange(method.value)}
                                        >
                                            <method.icon className="w-5 h-5" />
                                            <span>{method.label}</span>
                                        </Button>
                                    ))}
                                </div>
                                {errors.payment_method && <p className="text-red-500 text-sm">{errors.payment_method}</p>}
                            </div>

                            {paymentMethod === 'cash' && (
                                <div>
                                    <Label htmlFor="transaction_reference">Receipt Number</Label>
                                    <Input
                                        id="transaction_reference"
                                        value={data.transaction_reference}
                                        onChange={(e) => setData('transaction_reference', e.target.value)}
                                        placeholder="Enter receipt number"
                                    />
                                </div>
                            )}

                            {paymentMethod === 'bank_transfer' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="bank_name">Bank Name</Label>
                                        <Input
                                            id="bank_name"
                                            value={data.bank_name}
                                            onChange={(e) => setData('bank_name', e.target.value)}
                                            placeholder="e.g., CRDB Bank"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="bank_reference">Transaction Reference</Label>
                                        <Input
                                            id="bank_reference"
                                            value={data.bank_reference}
                                            onChange={(e) => setData('bank_reference', e.target.value)}
                                            placeholder="Bank transaction reference"
                                        />
                                    </div>
                                </div>
                            )}

                            {(paymentMethod === 'mpesa' || paymentMethod === 'tigo_pesa' || paymentMethod === 'airtel_money' || paymentMethod === 'halopesa') && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="mobile_money_provider">Provider</Label>
                                        <Input
                                            id="mobile_money_provider"
                                            value={data.mobile_money_provider}
                                            onChange={(e) => setData('mobile_money_provider', e.target.value)}
                                            placeholder={paymentMethod.replace('_', ' ')}
                                            disabled
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="mobile_money_number">Phone Number</Label>
                                        <Input
                                            id="mobile_money_number"
                                            value={data.mobile_money_number}
                                            onChange={(e) => setData('mobile_money_number', e.target.value)}
                                            placeholder="e.g., 255712345678"
                                        />
                                    </div>
                                </div>
                            )}

                            <div>
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="Additional notes about this payment..."
                                    rows={3}
                                />
                                {errors.notes && <p className="text-red-500 text-sm">{errors.notes}</p>}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Summary</CardTitle>
                            <CardDescription>
                                Review the payment details before recording
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
                                            {selectedStudent?.student_number} • {selectedStudent?.current_class.name}
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

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 bg-blue-50 rounded-lg">
                                        <div className="text-sm font-medium text-blue-600">Payment Amount</div>
                                        <div className="text-lg font-semibold text-blue-600">
                                            TZS {data.amount ? parseFloat(data.amount).toLocaleString() : '0'}
                                        </div>
                                    </div>
                                    <div className="p-4 bg-green-50 rounded-lg">
                                        <div className="text-sm font-medium text-green-600">Payment Method</div>
                                        <div className="text-lg font-semibold text-green-600 flex items-center space-x-2">
                                            {paymentMethod && getMethodIcon(paymentMethod)}
                                            <span>{paymentMethods.find(m => m.value === paymentMethod)?.label || 'Not selected'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <div className="text-sm font-medium text-gray-600">Payment Date</div>
                                    <div className="text-lg font-semibold">
                                        {data.payment_date ? new Date(data.payment_date).toLocaleDateString() : 'Not set'}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end space-x-4">
                        <Button type="button" variant="outline">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing || !selectedStudent || !selectedInvoice || !paymentMethod}>
                            <Save className="w-4 h-4 mr-2" />
                            {processing ? 'Recording...' : 'Record Payment'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}



