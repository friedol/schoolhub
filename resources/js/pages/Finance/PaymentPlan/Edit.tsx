import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface Student {
    id: number;
    first_name: string;
    last_name: string;
    student_number: string;
    current_class: { name: string; level: string } | null;
}

interface PaymentPlan {
    id: number;
    plan_name: string;
    student_id: number;
    invoice_id: number | null;
    total_amount: number;
    installment_count: number;
    installment_amount: number;
    start_date: string;
    end_date: string;
    frequency: string;
    status: string;
}

interface Props {
    paymentPlan: PaymentPlan;
    students: Student[];
}

export default function EditPaymentPlan({ paymentPlan, students }: Props) {
    const frequencies = [
        { value: 'weekly', label: 'Weekly' },
        { value: 'monthly', label: 'Monthly' },
        { value: 'termly', label: 'Termly' },
        { value: 'custom', label: 'Custom' },
    ];

    const { data, setData, put, processing, errors } = useForm({
        student_id: paymentPlan.student_id.toString(),
        invoice_id: paymentPlan.invoice_id?.toString() ?? '',
        name: paymentPlan.plan_name,
        total_amount: paymentPlan.total_amount.toString(),
        installment_count: paymentPlan.installment_count,
        installment_amount: paymentPlan.installment_amount.toString(),
        start_date: paymentPlan.start_date,
        end_date: paymentPlan.end_date,
        frequency: paymentPlan.frequency,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/finance/payment-plans/${paymentPlan.id}`);
    };

    return (
        <AppLayout>
            <Head title="Edit Payment Plan" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Edit Payment Plan</h1>
                        <p className="text-gray-600">Update the payment plan details</p>
                    </div>
                    <Link href="/finance/payment-plans">
                        <Button variant="outline">Cancel</Button>
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Plan Information</CardTitle>
                            <CardDescription>Update the plan details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="student_id">Student</Label>
                                    <Select
                                        value={data.student_id}
                                        onValueChange={(v) => setData('student_id', v)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select student" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {students.map((student) => (
                                                <SelectItem key={student.id} value={student.id.toString()}>
                                                    {student.first_name} {student.last_name} ({student.student_number}){student.current_class ? ` • ${student.current_class.name}` : ''}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.student_id && <p className="text-red-500 text-sm">{errors.student_id}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="name">Plan Name</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Payment plan name"
                                        className={errors.name ? 'border-red-500' : ''}
                                    />
                                    {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Schedule</CardTitle>
                            <CardDescription>Update the payment schedule</CardDescription>
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
                                        onChange={(e) => setData('installment_count', parseInt(e.target.value) || 1)}
                                        min="1"
                                        className={errors.installment_count ? 'border-red-500' : ''}
                                    />
                                    {errors.installment_count && <p className="text-red-500 text-sm">{errors.installment_count}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="installment_amount">Amount per Installment (TZS)</Label>
                                    <Input
                                        id="installment_amount"
                                        type="number"
                                        value={data.installment_amount}
                                        onChange={(e) => setData('installment_amount', e.target.value)}
                                        className={errors.installment_amount ? 'border-red-500' : ''}
                                    />
                                    {errors.installment_amount && <p className="text-red-500 text-sm">{errors.installment_amount}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="frequency">Frequency</Label>
                                    <Select
                                        value={data.frequency}
                                        onValueChange={(v) => setData('frequency', v)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {frequencies.map((f) => (
                                                <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="start_date">Start Date</Label>
                                    <Input
                                        id="start_date"
                                        type="date"
                                        value={data.start_date}
                                        onChange={(e) => setData('start_date', e.target.value)}
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
                                        onChange={(e) => setData('end_date', e.target.value)}
                                        className={errors.end_date ? 'border-red-500' : ''}
                                    />
                                    {errors.end_date && <p className="text-red-500 text-sm">{errors.end_date}</p>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end space-x-4">
                        <Link href="/finance/payment-plans">
                            <Button type="button" variant="outline">Cancel</Button>
                        </Link>
                        <Button type="submit" disabled={processing}>
                            <Save className="w-4 h-4 mr-2" />
                            {processing ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
