import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Save, Plus, DollarSign, Calendar, GraduationCap } from 'lucide-react';

interface FeeItem {
    id: number;
    name: string;
    category: string;
    is_mandatory: boolean;
    is_taxable: boolean;
    tax_rate: number;
}

interface SchoolClass {
    id: number;
    name: string;
    level: string;
}

interface Props {
    feeItems: FeeItem[];
    classes: SchoolClass[];
}

export default function CreateFeeStructure({ feeItems, classes }: Props) {
    const [selectedFeeItem, setSelectedFeeItem] = useState<FeeItem | null>(null);
    const [hasDifferentAmounts, setHasDifferentAmounts] = useState<boolean>(false);

    const { data, setData, post, processing, errors } = useForm({
        fee_item_id: '',
        school_class_id: '',
        academic_year: new Date().getFullYear().toString(),
        term: 'first',
        amount: '',
        day_student_amount: '',
        boarding_student_amount: '',
        stream_specific_amount: '',
        transport_route_specific_amount: '',
        effective_date: '',
        expiry_date: '',
        is_active: true,
    });

    const terms = [
        { value: 'first', label: 'First Term' },
        { value: 'second', label: 'Second Term' },
        { value: 'third', label: 'Third Term' },
        { value: 'annual', label: 'Annual' },
    ];

    const handleFeeItemChange = (feeItemId: string) => {
        const feeItem = feeItems.find(item => item.id.toString() === feeItemId);
        setSelectedFeeItem(feeItem || null);
        setData('fee_item_id', feeItemId);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/finance/fee-structure');
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
            <Head title="Create Fee Structure" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Create Fee Structure</h1>
                    <p className="text-gray-600">Set up fee structure for a specific class and term</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                            <CardDescription>
                                Select the fee item and class for this structure
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="fee_item_id">Fee Item</Label>
                                    <Select
                                        value={data.fee_item_id}
                                        onValueChange={handleFeeItemChange}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select fee item" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {feeItems.map((item) => (
                                                <SelectItem key={item.id} value={item.id.toString()}>
                                                    <div className="flex items-center justify-between w-full">
                                                        <span>{item.name}</span>
                                                        <div className="flex items-center space-x-2 ml-4">
                                                            <span className={`text-xs px-2 py-1 rounded ${getCategoryColor(item.category)}`}>
                                                                {item.category.replace('_', ' ')}
                                                            </span>
                                                            {item.is_mandatory && (
                                                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                                    Mandatory
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.fee_item_id && <p className="text-red-500 text-sm">{errors.fee_item_id}</p>}
                                    
                                    {selectedFeeItem && (
                                        <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                                            <div className="text-sm">
                                                <div className="font-medium">{selectedFeeItem.name} Details:</div>
                                                <ul className="mt-1 space-y-1 text-gray-600">
                                                    <li>• Category: {selectedFeeItem.category.replace('_', ' ')}</li>
                                                    <li>• Mandatory: {selectedFeeItem.is_mandatory ? 'Yes' : 'No'}</li>
                                                    <li>• Taxable: {selectedFeeItem.is_taxable ? `Yes (${selectedFeeItem.tax_rate}%)` : 'No'}</li>
                                                </ul>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="school_class_id">Class</Label>
                                    <Select
                                        value={data.school_class_id}
                                        onValueChange={(value) => setData('school_class_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select class" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {classes.map((cls) => (
                                                <SelectItem key={cls.id} value={cls.id.toString()}>
                                                    <div>
                                                        <div className="font-medium">{cls.name}</div>
                                                        <div className="text-sm text-gray-500">{cls.level}</div>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.school_class_id && <p className="text-red-500 text-sm">{errors.school_class_id}</p>}
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
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Fee Amounts</CardTitle>
                            <CardDescription>
                                Set the fee amounts for different student types
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="amount">Base Amount (TZS)</Label>
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

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="has_different_amounts"
                                    checked={hasDifferentAmounts}
                                    onCheckedChange={setHasDifferentAmounts}
                                />
                                <Label htmlFor="has_different_amounts">
                                    Set different amounts for day and boarding students
                                </Label>
                            </div>

                            {hasDifferentAmounts && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="day_student_amount">Day Student Amount (TZS)</Label>
                                        <Input
                                            id="day_student_amount"
                                            type="number"
                                            value={data.day_student_amount}
                                            onChange={(e) => setData('day_student_amount', e.target.value)}
                                            placeholder="0"
                                        />
                                        {errors.day_student_amount && <p className="text-red-500 text-sm">{errors.day_student_amount}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="boarding_student_amount">Boarding Student Amount (TZS)</Label>
                                        <Input
                                            id="boarding_student_amount"
                                            type="number"
                                            value={data.boarding_student_amount}
                                            onChange={(e) => setData('boarding_student_amount', e.target.value)}
                                            placeholder="0"
                                        />
                                        {errors.boarding_student_amount && <p className="text-red-500 text-sm">{errors.boarding_student_amount}</p>}
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="stream_specific_amount">Stream Specific Amount (TZS)</Label>
                                    <Input
                                        id="stream_specific_amount"
                                        type="number"
                                        value={data.stream_specific_amount}
                                        onChange={(e) => setData('stream_specific_amount', e.target.value)}
                                        placeholder="0 (optional)"
                                    />
                                    <p className="text-sm text-gray-500">Additional amount for specific streams (e.g., Science)</p>
                                </div>

                                <div>
                                    <Label htmlFor="transport_route_specific_amount">Transport Route Amount (TZS)</Label>
                                    <Input
                                        id="transport_route_specific_amount"
                                        type="number"
                                        value={data.transport_route_specific_amount}
                                        onChange={(e) => setData('transport_route_specific_amount', e.target.value)}
                                        placeholder="0 (optional)"
                                    />
                                    <p className="text-sm text-gray-500">Additional amount for specific transport routes</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Effective Period</CardTitle>
                            <CardDescription>
                                Set when this fee structure becomes effective
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="effective_date">Effective Date</Label>
                                    <Input
                                        id="effective_date"
                                        type="date"
                                        value={data.effective_date}
                                        onChange={(e) => setData('effective_date', e.target.value)}
                                        className={errors.effective_date ? 'border-red-500' : ''}
                                    />
                                    {errors.effective_date && <p className="text-red-500 text-sm">{errors.effective_date}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="expiry_date">Expiry Date (Optional)</Label>
                                    <Input
                                        id="expiry_date"
                                        type="date"
                                        value={data.expiry_date}
                                        onChange={(e) => setData('expiry_date', e.target.value)}
                                    />
                                    <p className="text-sm text-gray-500">Leave empty for no expiry</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="is_active"
                                    checked={data.is_active}
                                    onCheckedChange={(checked) => setData('is_active', checked as boolean)}
                                />
                                <Label htmlFor="is_active">
                                    Activate this fee structure immediately
                                </Label>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Fee Structure Summary</CardTitle>
                            <CardDescription>
                                Review the fee structure before creating
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <div className="text-sm font-medium text-gray-600">Fee Item</div>
                                        <div className="text-lg font-semibold">
                                            {selectedFeeItem?.name || 'Not selected'}
                                        </div>
                                        {selectedFeeItem && (
                                            <div className="text-sm text-gray-500">
                                                {selectedFeeItem.category.replace('_', ' ')} • {selectedFeeItem.is_mandatory ? 'Mandatory' : 'Optional'}
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <div className="text-sm font-medium text-gray-600">Class & Term</div>
                                        <div className="text-lg font-semibold">
                                            {classes.find(c => c.id.toString() === data.school_class_id)?.name || 'Not selected'} • {data.term.replace('_', ' ')}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            Academic Year: {data.academic_year}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <div className="text-sm font-medium text-gray-600">Base Amount</div>
                                        <div className="text-lg font-semibold">
                                            TZS {data.amount ? parseFloat(data.amount).toLocaleString() : '0'}
                                        </div>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <div className="text-sm font-medium text-gray-600">Effective Period</div>
                                        <div className="text-lg font-semibold">
                                            {data.effective_date ? new Date(data.effective_date).toLocaleDateString() : 'Not set'}
                                        </div>
                                        {data.expiry_date && (
                                            <div className="text-sm text-gray-500">
                                                to {new Date(data.expiry_date).toLocaleDateString()}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {hasDifferentAmounts && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-4 bg-blue-50 rounded-lg">
                                            <div className="text-sm font-medium text-blue-600">Day Student Amount</div>
                                            <div className="text-lg font-semibold text-blue-600">
                                                TZS {data.day_student_amount ? parseFloat(data.day_student_amount).toLocaleString() : '0'}
                                            </div>
                                        </div>
                                        <div className="p-4 bg-green-50 rounded-lg">
                                            <div className="text-sm font-medium text-green-600">Boarding Student Amount</div>
                                            <div className="text-lg font-semibold text-green-600">
                                                TZS {data.boarding_student_amount ? parseFloat(data.boarding_student_amount).toLocaleString() : '0'}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end space-x-4">
                        <Button type="button" variant="outline">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            <Save className="w-4 h-4 mr-2" />
                            {processing ? 'Creating...' : 'Create Fee Structure'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}



