import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus, Save, DollarSign, Calendar, User, FileText } from 'lucide-react';

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

interface FeeItem {
    id: number;
    name: string;
    category: string;
    is_mandatory: boolean;
    is_taxable: boolean;
    tax_rate: number;
}

interface FeeStructure {
    id: number;
    fee_item: FeeItem;
    amount: number;
    day_student_amount: number;
    boarding_student_amount: number;
}

interface InvoiceItem {
    fee_item_id: number;
    description: string;
    quantity: number;
    unit_price: number;
    total_amount: number;
    tax_rate: number;
    tax_amount: number;
    discount_rate: number;
    discount_amount: number;
    net_amount: number;
}

interface Props {
    students: Student[];
    feeItems: FeeItem[];
    feeStructures: FeeStructure[];
}

export default function CreateInvoice({ students, feeItems, feeStructures }: Props) {
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
    const [showFeeStructures, setShowFeeStructures] = useState<boolean>(false);

    const { data, setData, post, processing, errors } = useForm({
        student_id: '',
        academic_year: new Date().getFullYear().toString(),
        term: 'first',
        due_date: '',
        payment_terms: '',
        notes: '',
        send_immediately: false,
    });

    const terms = [
        { value: 'first', label: 'First Term' },
        { value: 'second', label: 'Second Term' },
        { value: 'third', label: 'Third Term' },
        { value: 'annual', label: 'Annual' },
    ];

    const handleStudentChange = (studentId: string) => {
        const student = students.find(s => s.id.toString() === studentId);
        setSelectedStudent(student || null);
        setData('student_id', studentId);
        
        // Load fee structures for the student's class
        if (student) {
            setShowFeeStructures(true);
        }
    };

    const addInvoiceItem = (feeStructure: FeeStructure) => {
        const existingItem = invoiceItems.find(item => item.fee_item_id === feeStructure.fee_item.id);
        if (existingItem) {
            return; // Item already exists
        }

        const newItem: InvoiceItem = {
            fee_item_id: feeStructure.fee_item.id,
            description: feeStructure.fee_item.name,
            quantity: 1,
            unit_price: feeStructure.amount,
            total_amount: feeStructure.amount,
            tax_rate: feeStructure.fee_item.is_taxable ? feeStructure.fee_item.tax_rate : 0,
            tax_amount: feeStructure.fee_item.is_taxable ? (feeStructure.amount * feeStructure.fee_item.tax_rate / 100) : 0,
            discount_rate: 0,
            discount_amount: 0,
            net_amount: feeStructure.amount + (feeStructure.fee_item.is_taxable ? (feeStructure.amount * feeStructure.fee_item.tax_rate / 100) : 0),
        };

        setInvoiceItems([...invoiceItems, newItem]);
    };

    const removeInvoiceItem = (index: number) => {
        setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
    };

    const updateInvoiceItem = (index: number, field: keyof InvoiceItem, value: any) => {
        const updatedItems = [...invoiceItems];
        updatedItems[index] = { ...updatedItems[index], [field]: value };
        
        // Recalculate amounts
        const item = updatedItems[index];
        item.total_amount = item.quantity * item.unit_price;
        item.tax_amount = (item.total_amount * item.tax_rate) / 100;
        item.discount_amount = (item.total_amount * item.discount_rate) / 100;
        item.net_amount = item.total_amount + item.tax_amount - item.discount_amount;
        
        setInvoiceItems(updatedItems);
    };

    const getTotalAmount = () => {
        return invoiceItems.reduce((sum, item) => sum + item.net_amount, 0);
    };

    const getTotalTax = () => {
        return invoiceItems.reduce((sum, item) => sum + item.tax_amount, 0);
    };

    const getTotalDiscount = () => {
        return invoiceItems.reduce((sum, item) => sum + item.discount_amount, 0);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/finance/invoice', {
            data: {
                ...data,
                invoice_items: invoiceItems,
            }
        });
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'tuition':
                return 'bg-blue-100 text-blue-800';
            case 'development':
                return 'bg-green-100 text-green-800';
            case 'laboratory':
                return 'bg-purple-100 text-purple-800';
            case 'library':
                return 'bg-orange-100 text-orange-800';
            case 'sports':
                return 'bg-pink-100 text-pink-800';
            case 'examination':
                return 'bg-red-100 text-red-800';
            case 'hostel':
                return 'bg-indigo-100 text-indigo-800';
            case 'transport':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <AppLayout>
            <Head title="Create Invoice" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Create Invoice</h1>
                    <p className="text-gray-600">Generate a new fee invoice for a student</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Invoice Information</CardTitle>
                            <CardDescription>
                                Select the student and set invoice details
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
                                    <Label htmlFor="academic_year">Academic Year</Label>
                                    <Input
                                        id="academic_year"
                                        value={data.academic_year}
                                        onChange={(e) => setData('academic_year', e.target.value)}
                                        placeholder="e.g., 2024"
                                    />
                                    {errors.academic_year && <p className="text-red-500 text-sm">{errors.academic_year}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="term">Term</Label>
                                    <Select
                                        value={data.term}
                                        onValueChange={(value) => setData('term', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {terms.map((term) => (
                                                <SelectItem key={term.value} value={term.value}>
                                                    {term.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.term && <p className="text-red-500 text-sm">{errors.term}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="due_date">Due Date</Label>
                                    <Input
                                        id="due_date"
                                        type="date"
                                        value={data.due_date}
                                        onChange={(e) => setData('due_date', e.target.value)}
                                        className={errors.due_date ? 'border-red-500' : ''}
                                    />
                                    {errors.due_date && <p className="text-red-500 text-sm">{errors.due_date}</p>}
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="payment_terms">Payment Terms</Label>
                                <Textarea
                                    id="payment_terms"
                                    value={data.payment_terms}
                                    onChange={(e) => setData('payment_terms', e.target.value)}
                                    placeholder="Enter payment terms and instructions..."
                                    rows={3}
                                />
                                {errors.payment_terms && <p className="text-red-500 text-sm">{errors.payment_terms}</p>}
                            </div>

                            <div>
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="Additional notes for the invoice..."
                                    rows={2}
                                />
                                {errors.notes && <p className="text-red-500 text-sm">{errors.notes}</p>}
                            </div>
                        </CardContent>
                    </Card>

                    {showFeeStructures && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Available Fee Structures</CardTitle>
                                <CardDescription>
                                    Select fee items to include in this invoice
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {feeStructures.map((structure) => (
                                        <div key={structure.id} className="p-4 border rounded-lg">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="font-medium">{structure.fee_item.name}</div>
                                                    <div className="flex items-center space-x-2 mt-1">
                                                        <Badge className={getCategoryColor(structure.fee_item.category)}>
                                                            {structure.fee_item.category.replace('_', ' ')}
                                                        </Badge>
                                                        {structure.fee_item.is_mandatory && (
                                                            <Badge variant="outline" className="text-blue-600">
                                                                Mandatory
                                                            </Badge>
                                                        )}
                                                        {structure.fee_item.is_taxable && (
                                                            <Badge variant="outline" className="text-red-600">
                                                                Taxable ({structure.fee_item.tax_rate}%)
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="text-sm text-gray-600 mt-2">
                                                        Amount: TZS {structure.amount.toLocaleString()}
                                                    </div>
                                                </div>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    onClick={() => addInvoiceItem(structure)}
                                                    disabled={invoiceItems.some(item => item.fee_item_id === structure.fee_item.id)}
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {invoiceItems.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Invoice Items</CardTitle>
                                <CardDescription>
                                    Review and adjust the invoice items
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {invoiceItems.map((item, index) => (
                                        <div key={index} className="p-4 border rounded-lg">
                                            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                                                <div className="md:col-span-2">
                                                    <Label>Description</Label>
                                                    <Input
                                                        value={item.description}
                                                        onChange={(e) => updateInvoiceItem(index, 'description', e.target.value)}
                                                    />
                                                </div>
                                                <div>
                                                    <Label>Quantity</Label>
                                                    <Input
                                                        type="number"
                                                        value={item.quantity}
                                                        onChange={(e) => updateInvoiceItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                                                    />
                                                </div>
                                                <div>
                                                    <Label>Unit Price</Label>
                                                    <Input
                                                        type="number"
                                                        value={item.unit_price}
                                                        onChange={(e) => updateInvoiceItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                                                    />
                                                </div>
                                                <div>
                                                    <Label>Discount %</Label>
                                                    <Input
                                                        type="number"
                                                        value={item.discount_rate}
                                                        onChange={(e) => updateInvoiceItem(index, 'discount_rate', parseFloat(e.target.value) || 0)}
                                                    />
                                                </div>
                                                <div className="flex items-end space-x-2">
                                                    <div className="flex-1">
                                                        <Label>Net Amount</Label>
                                                        <div className="p-2 bg-gray-50 rounded text-sm font-medium">
                                                            TZS {item.net_amount.toLocaleString()}
                                                        </div>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => removeInvoiceItem(index)}
                                                    >
                                                        <Minus className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {invoiceItems.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Invoice Summary</CardTitle>
                                <CardDescription>
                                    Review the invoice totals before creating
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
                                            <div className="text-sm font-medium text-gray-600">Academic Period</div>
                                            <div className="text-lg font-semibold">
                                                {data.academic_year} • {data.term.replace('_', ' ')}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                Due: {data.due_date ? new Date(data.due_date).toLocaleDateString() : 'Not set'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border-t pt-4">
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span>Subtotal:</span>
                                                <span>TZS {getTotalAmount().toLocaleString()}</span>
                                            </div>
                                            {getTotalTax() > 0 && (
                                                <div className="flex justify-between">
                                                    <span>Tax:</span>
                                                    <span>TZS {getTotalTax().toLocaleString()}</span>
                                                </div>
                                            )}
                                            {getTotalDiscount() > 0 && (
                                                <div className="flex justify-between">
                                                    <span>Discount:</span>
                                                    <span>-TZS {getTotalDiscount().toLocaleString()}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between font-bold text-lg border-t pt-2">
                                                <span>Total Amount:</span>
                                                <span>TZS {getTotalAmount().toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <div className="flex justify-end space-x-4">
                        <Button type="button" variant="outline">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing || invoiceItems.length === 0}>
                            <Save className="w-4 h-4 mr-2" />
                            {processing ? 'Creating...' : 'Create Invoice'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}



