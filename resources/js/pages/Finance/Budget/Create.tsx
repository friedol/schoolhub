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
import { Plus, Minus, Save, DollarSign, Calendar, Building, Target } from 'lucide-react';

interface BudgetItem {
    category: string;
    description: string;
    budgeted_amount: number;
    actual_amount: number;
}

interface Props {
    departments: Array<{ value: string; label: string }>;
    budgetTypes: Array<{ value: string; label: string }>;
}

export default function CreateBudget({ departments, budgetTypes }: Props) {
    const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);

    const { data, setData, post, processing, errors } = useForm({
        academic_year: new Date().getFullYear().toString(),
        budget_name: '',
        department: '',
        budget_type: '',
        start_date: '',
        end_date: '',
        notes: '',
    });

    const categories = [
        'salaries',
        'utilities',
        'maintenance',
        'teaching_materials',
        'sports_equipment',
        'library_books',
        'laboratory_supplies',
        'transport',
        'hostel_maintenance',
        'administrative',
        'other'
    ];

    const addBudgetItem = () => {
        const newItem: BudgetItem = {
            category: '',
            description: '',
            budgeted_amount: 0,
            actual_amount: 0,
        };
        setBudgetItems([...budgetItems, newItem]);
    };

    const removeBudgetItem = (index: number) => {
        setBudgetItems(budgetItems.filter((_, i) => i !== index));
    };

    const updateBudgetItem = (index: number, field: keyof BudgetItem, value: any) => {
        const updatedItems = [...budgetItems];
        updatedItems[index] = { ...updatedItems[index], [field]: value };
        setBudgetItems(updatedItems);
    };

    const getTotalBudgeted = () => {
        return budgetItems.reduce((sum, item) => sum + item.budgeted_amount, 0);
    };

    const getTotalActual = () => {
        return budgetItems.reduce((sum, item) => sum + item.actual_amount, 0);
    };

    const getVariance = () => {
        return getTotalActual() - getTotalBudgeted();
    };

    const getVariancePercentage = () => {
        if (getTotalBudgeted() === 0) return 0;
        return (getVariance() / getTotalBudgeted()) * 100;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/finance/budget', {
            data: {
                ...data,
                budget_items: budgetItems,
            }
        });
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'salaries':
                return 'bg-blue-100 text-blue-800';
            case 'utilities':
                return 'bg-green-100 text-green-800';
            case 'maintenance':
                return 'bg-orange-100 text-orange-800';
            case 'teaching_materials':
                return 'bg-purple-100 text-purple-800';
            case 'sports_equipment':
                return 'bg-pink-100 text-pink-800';
            case 'library_books':
                return 'bg-indigo-100 text-indigo-800';
            case 'laboratory_supplies':
                return 'bg-red-100 text-red-800';
            case 'transport':
                return 'bg-yellow-100 text-yellow-800';
            case 'hostel_maintenance':
                return 'bg-teal-100 text-teal-800';
            case 'administrative':
                return 'bg-gray-100 text-gray-800';
            case 'other':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <AppLayout>
            <Head title="Create Budget" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Create Budget</h1>
                    <p className="text-gray-600">Create a new budget for a department or project</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Budget Information</CardTitle>
                            <CardDescription>
                                Set up the basic budget information
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="budget_name">Budget Name</Label>
                                    <Input
                                        id="budget_name"
                                        value={data.budget_name}
                                        onChange={(e) => setData('budget_name', e.target.value)}
                                        placeholder="e.g., Academic Department Budget 2024"
                                        className={errors.budget_name ? 'border-red-500' : ''}
                                    />
                                    {errors.budget_name && <p className="text-red-500 text-sm">{errors.budget_name}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="academic_year">Academic Year</Label>
                                    <Input
                                        id="academic_year"
                                        value={data.academic_year}
                                        onChange={(e) => setData('academic_year', e.target.value)}
                                        placeholder="e.g., 2024"
                                        className={errors.academic_year ? 'border-red-500' : ''}
                                    />
                                    {errors.academic_year && <p className="text-red-500 text-sm">{errors.academic_year}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="department">Department</Label>
                                    <Select
                                        value={data.department}
                                        onValueChange={(value) => setData('department', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select department" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {departments.map((dept) => (
                                                <SelectItem key={dept.value} value={dept.value}>
                                                    {dept.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.department && <p className="text-red-500 text-sm">{errors.department}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="budget_type">Budget Type</Label>
                                    <Select
                                        value={data.budget_type}
                                        onValueChange={(value) => setData('budget_type', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select budget type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {budgetTypes.map((type) => (
                                                <SelectItem key={type.value} value={type.value}>
                                                    {type.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.budget_type && <p className="text-red-500 text-sm">{errors.budget_type}</p>}
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

                            <div>
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="Additional notes about this budget..."
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
                                    <CardTitle>Budget Items</CardTitle>
                                    <CardDescription>
                                        Add budget line items with amounts
                                    </CardDescription>
                                </div>
                                <Button type="button" onClick={addBudgetItem}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Item
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {budgetItems.map((item, index) => (
                                    <div key={index} className="p-4 border rounded-lg">
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                            <div>
                                                <Label>Category</Label>
                                                <Select
                                                    value={item.category}
                                                    onValueChange={(value) => updateBudgetItem(index, 'category', value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select category" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {categories.map((category) => (
                                                            <SelectItem key={category} value={category}>
                                                                {category.replace('_', ' ').toUpperCase()}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label>Description</Label>
                                                <Input
                                                    value={item.description}
                                                    onChange={(e) => updateBudgetItem(index, 'description', e.target.value)}
                                                    placeholder="Item description"
                                                />
                                            </div>
                                            <div>
                                                <Label>Budgeted Amount (TZS)</Label>
                                                <Input
                                                    type="number"
                                                    value={item.budgeted_amount}
                                                    onChange={(e) => updateBudgetItem(index, 'budgeted_amount', parseFloat(e.target.value) || 0)}
                                                    placeholder="0"
                                                />
                                            </div>
                                            <div className="flex items-end space-x-2">
                                                <div className="flex-1">
                                                    <Label>Actual Amount (TZS)</Label>
                                                    <Input
                                                        type="number"
                                                        value={item.actual_amount}
                                                        onChange={(e) => updateBudgetItem(index, 'actual_amount', parseFloat(e.target.value) || 0)}
                                                        placeholder="0"
                                                    />
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => removeBudgetItem(index)}
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {budgetItems.length === 0 && (
                                    <div className="text-center py-8 text-gray-500">
                                        <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                        <p>No budget items added yet.</p>
                                        <p className="text-sm">Click "Add Item" to start building your budget.</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {budgetItems.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Budget Summary</CardTitle>
                                <CardDescription>
                                    Review the budget totals and variance
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-4 bg-gray-50 rounded-lg">
                                            <div className="text-sm font-medium text-gray-600">Budget Information</div>
                                            <div className="text-lg font-semibold">{data.budget_name}</div>
                                            <div className="text-sm text-gray-500">
                                                {departments.find(d => d.value === data.department)?.label} • {budgetTypes.find(t => t.value === data.budget_type)?.label}
                                            </div>
                                        </div>
                                        <div className="p-4 bg-gray-50 rounded-lg">
                                            <div className="text-sm font-medium text-gray-600">Academic Period</div>
                                            <div className="text-lg font-semibold">{data.academic_year}</div>
                                            <div className="text-sm text-gray-500">
                                                {data.start_date ? new Date(data.start_date).toLocaleDateString() : 'Not set'} to {data.end_date ? new Date(data.end_date).toLocaleDateString() : 'Not set'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="p-4 bg-blue-50 rounded-lg">
                                            <div className="text-sm font-medium text-blue-600">Total Budgeted</div>
                                            <div className="text-2xl font-bold text-blue-600">
                                                TZS {getTotalBudgeted().toLocaleString()}
                                            </div>
                                        </div>
                                        <div className="p-4 bg-green-50 rounded-lg">
                                            <div className="text-sm font-medium text-green-600">Total Actual</div>
                                            <div className="text-2xl font-bold text-green-600">
                                                TZS {getTotalActual().toLocaleString()}
                                            </div>
                                        </div>
                                        <div className={`p-4 rounded-lg ${getVariance() >= 0 ? 'bg-red-50' : 'bg-green-50'}`}>
                                            <div className={`text-sm font-medium ${getVariance() >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                Variance
                                            </div>
                                            <div className={`text-2xl font-bold ${getVariance() >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                TZS {getVariance().toLocaleString()}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                ({getVariancePercentage().toFixed(1)}%)
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border-t pt-4">
                                        <div className="text-sm font-medium text-gray-600 mb-2">Budget Items Summary</div>
                                        <div className="space-y-2">
                                            {budgetItems.map((item, index) => (
                                                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                                    <div className="flex items-center space-x-2">
                                                        <Badge className={getCategoryColor(item.category)}>
                                                            {item.category.replace('_', ' ').toUpperCase()}
                                                        </Badge>
                                                        <span className="text-sm">{item.description}</span>
                                                    </div>
                                                    <div className="text-sm font-medium">
                                                        TZS {item.budgeted_amount.toLocaleString()}
                                                    </div>
                                                </div>
                                            ))}
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
                        <Button type="submit" disabled={processing || budgetItems.length === 0}>
                            <Save className="w-4 h-4 mr-2" />
                            {processing ? 'Creating...' : 'Create Budget'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}



