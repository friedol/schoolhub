import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save } from 'lucide-react';

interface Category {
    id: number;
    name: string;
}

interface Supplier {
    id: number;
    name: string;
}

interface Props {
    categories: Category[];
    suppliers: Supplier[];
    unitOptions: Record<string, string>;
    itemTypeOptions: Record<string, string>;
}

export default function Create({ categories, suppliers, unitOptions, itemTypeOptions }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        category_id: '',
        name: '',
        description: '',
        item_type: 'consumable',
        manufacturer: '',
        model: '',
        serial_number: '',
        unit_of_measure: 'each',
        cost_price: '',
        replacement_value: '',
        supplier_id: '',
        current_stock: '',
        min_stock_level: '',
        reorder_level: '',
        max_stock_level: '',
        location: '',
        shelf_location: '',
        barcode: '',
        batch_number: '',
        expiry_date: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/inventory/items');
    };

    return (
        <AuthenticatedLayout>
            <Head title="Add Inventory Item" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="flex items-center gap-4 mb-6">
                                <Link href="/inventory/items">
                                    <Button variant="outline" size="sm">
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Back
                                    </Button>
                                </Link>
                                <h2 className="text-2xl font-bold">Add New Inventory Item</h2>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Basic Information */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Basic Information</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div>
                                                <Label htmlFor="category_id">Category *</Label>
                                                <Select value={data.category_id} onValueChange={(value) => setData('category_id', value)}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select Category" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {categories.map((category) => (
                                                            <SelectItem key={category.id} value={category.id.toString()}>
                                                                {category.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors.category_id && (
                                                    <p className="text-sm text-red-600 mt-1">{errors.category_id}</p>
                                                )}
                                            </div>

                                            <div>
                                                <Label htmlFor="name">Item Name *</Label>
                                                <Input
                                                    id="name"
                                                    value={data.name}
                                                    onChange={(e) => setData('name', e.target.value)}
                                                    placeholder="Enter item name"
                                                />
                                                {errors.name && (
                                                    <p className="text-sm text-red-600 mt-1">{errors.name}</p>
                                                )}
                                            </div>

                                            <div>
                                                <Label htmlFor="description">Description</Label>
                                                <Textarea
                                                    id="description"
                                                    value={data.description}
                                                    onChange={(e) => setData('description', e.target.value)}
                                                    placeholder="Enter item description"
                                                    rows={3}
                                                />
                                                {errors.description && (
                                                    <p className="text-sm text-red-600 mt-1">{errors.description}</p>
                                                )}
                                            </div>

                                            <div>
                                                <Label htmlFor="item_type">Item Type *</Label>
                                                <Select value={data.item_type} onValueChange={(value) => setData('item_type', value)}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select Item Type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {Object.entries(itemTypeOptions).map(([key, value]) => (
                                                            <SelectItem key={key} value={key}>
                                                                {value}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors.item_type && (
                                                    <p className="text-sm text-red-600 mt-1">{errors.item_type}</p>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Technical Details */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Technical Details</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div>
                                                <Label htmlFor="manufacturer">Manufacturer</Label>
                                                <Input
                                                    id="manufacturer"
                                                    value={data.manufacturer}
                                                    onChange={(e) => setData('manufacturer', e.target.value)}
                                                    placeholder="Enter manufacturer"
                                                />
                                                {errors.manufacturer && (
                                                    <p className="text-sm text-red-600 mt-1">{errors.manufacturer}</p>
                                                )}
                                            </div>

                                            <div>
                                                <Label htmlFor="model">Model</Label>
                                                <Input
                                                    id="model"
                                                    value={data.model}
                                                    onChange={(e) => setData('model', e.target.value)}
                                                    placeholder="Enter model"
                                                />
                                                {errors.model && (
                                                    <p className="text-sm text-red-600 mt-1">{errors.model}</p>
                                                )}
                                            </div>

                                            <div>
                                                <Label htmlFor="serial_number">Serial Number</Label>
                                                <Input
                                                    id="serial_number"
                                                    value={data.serial_number}
                                                    onChange={(e) => setData('serial_number', e.target.value)}
                                                    placeholder="Enter serial number"
                                                />
                                                {errors.serial_number && (
                                                    <p className="text-sm text-red-600 mt-1">{errors.serial_number}</p>
                                                )}
                                            </div>

                                            <div>
                                                <Label htmlFor="unit_of_measure">Unit of Measure *</Label>
                                                <Select value={data.unit_of_measure} onValueChange={(value) => setData('unit_of_measure', value)}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select Unit" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {Object.entries(unitOptions).map(([key, value]) => (
                                                            <SelectItem key={key} value={key}>
                                                                {value}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors.unit_of_measure && (
                                                    <p className="text-sm text-red-600 mt-1">{errors.unit_of_measure}</p>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Financial Information */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Financial Information</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div>
                                                <Label htmlFor="cost_price">Cost Price (TZS) *</Label>
                                                <Input
                                                    id="cost_price"
                                                    type="number"
                                                    step="0.01"
                                                    value={data.cost_price}
                                                    onChange={(e) => setData('cost_price', e.target.value)}
                                                    placeholder="0.00"
                                                />
                                                {errors.cost_price && (
                                                    <p className="text-sm text-red-600 mt-1">{errors.cost_price}</p>
                                                )}
                                            </div>

                                            <div>
                                                <Label htmlFor="replacement_value">Replacement Value (TZS)</Label>
                                                <Input
                                                    id="replacement_value"
                                                    type="number"
                                                    step="0.01"
                                                    value={data.replacement_value}
                                                    onChange={(e) => setData('replacement_value', e.target.value)}
                                                    placeholder="0.00"
                                                />
                                                {errors.replacement_value && (
                                                    <p className="text-sm text-red-600 mt-1">{errors.replacement_value}</p>
                                                )}
                                            </div>

                                            <div>
                                                <Label htmlFor="supplier_id">Supplier</Label>
                                                <Select value={data.supplier_id} onValueChange={(value) => setData('supplier_id', value)}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select Supplier" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">No Supplier</SelectItem>
                                                        {suppliers.map((supplier) => (
                                                            <SelectItem key={supplier.id} value={supplier.id.toString()}>
                                                                {supplier.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors.supplier_id && (
                                                    <p className="text-sm text-red-600 mt-1">{errors.supplier_id}</p>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Stock Information */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Stock Information</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div>
                                                <Label htmlFor="current_stock">Current Stock *</Label>
                                                <Input
                                                    id="current_stock"
                                                    type="number"
                                                    value={data.current_stock}
                                                    onChange={(e) => setData('current_stock', e.target.value)}
                                                    placeholder="0"
                                                />
                                                {errors.current_stock && (
                                                    <p className="text-sm text-red-600 mt-1">{errors.current_stock}</p>
                                                )}
                                            </div>

                                            <div>
                                                <Label htmlFor="min_stock_level">Minimum Stock Level *</Label>
                                                <Input
                                                    id="min_stock_level"
                                                    type="number"
                                                    value={data.min_stock_level}
                                                    onChange={(e) => setData('min_stock_level', e.target.value)}
                                                    placeholder="0"
                                                />
                                                {errors.min_stock_level && (
                                                    <p className="text-sm text-red-600 mt-1">{errors.min_stock_level}</p>
                                                )}
                                            </div>

                                            <div>
                                                <Label htmlFor="reorder_level">Reorder Level *</Label>
                                                <Input
                                                    id="reorder_level"
                                                    type="number"
                                                    value={data.reorder_level}
                                                    onChange={(e) => setData('reorder_level', e.target.value)}
                                                    placeholder="0"
                                                />
                                                {errors.reorder_level && (
                                                    <p className="text-sm text-red-600 mt-1">{errors.reorder_level}</p>
                                                )}
                                            </div>

                                            <div>
                                                <Label htmlFor="max_stock_level">Maximum Stock Level</Label>
                                                <Input
                                                    id="max_stock_level"
                                                    type="number"
                                                    value={data.max_stock_level}
                                                    onChange={(e) => setData('max_stock_level', e.target.value)}
                                                    placeholder="0"
                                                />
                                                {errors.max_stock_level && (
                                                    <p className="text-sm text-red-600 mt-1">{errors.max_stock_level}</p>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Location Information */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Location Information</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div>
                                                <Label htmlFor="location">Location</Label>
                                                <Input
                                                    id="location"
                                                    value={data.location}
                                                    onChange={(e) => setData('location', e.target.value)}
                                                    placeholder="e.g., Main Store, Lab Store"
                                                />
                                                {errors.location && (
                                                    <p className="text-sm text-red-600 mt-1">{errors.location}</p>
                                                )}
                                            </div>

                                            <div>
                                                <Label htmlFor="shelf_location">Shelf Location</Label>
                                                <Input
                                                    id="shelf_location"
                                                    value={data.shelf_location}
                                                    onChange={(e) => setData('shelf_location', e.target.value)}
                                                    placeholder="e.g., A-1-B"
                                                />
                                                {errors.shelf_location && (
                                                    <p className="text-sm text-red-600 mt-1">{errors.shelf_location}</p>
                                                )}
                                            </div>

                                            <div>
                                                <Label htmlFor="barcode">Barcode</Label>
                                                <Input
                                                    id="barcode"
                                                    value={data.barcode}
                                                    onChange={(e) => setData('barcode', e.target.value)}
                                                    placeholder="Enter barcode"
                                                />
                                                {errors.barcode && (
                                                    <p className="text-sm text-red-600 mt-1">{errors.barcode}</p>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Additional Information */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Additional Information</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div>
                                                <Label htmlFor="batch_number">Batch Number</Label>
                                                <Input
                                                    id="batch_number"
                                                    value={data.batch_number}
                                                    onChange={(e) => setData('batch_number', e.target.value)}
                                                    placeholder="Enter batch number"
                                                />
                                                {errors.batch_number && (
                                                    <p className="text-sm text-red-600 mt-1">{errors.batch_number}</p>
                                                )}
                                            </div>

                                            <div>
                                                <Label htmlFor="expiry_date">Expiry Date</Label>
                                                <Input
                                                    id="expiry_date"
                                                    type="date"
                                                    value={data.expiry_date}
                                                    onChange={(e) => setData('expiry_date', e.target.value)}
                                                />
                                                {errors.expiry_date && (
                                                    <p className="text-sm text-red-600 mt-1">{errors.expiry_date}</p>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                <div className="flex justify-end gap-4">
                                    <Link href="/inventory/items">
                                        <Button variant="outline">Cancel</Button>
                                    </Link>
                                    <Button type="submit" disabled={processing}>
                                        <Save className="w-4 h-4 mr-2" />
                                        {processing ? 'Saving...' : 'Save Item'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                
            </div>
        </AuthenticatedLayout>
    );
}



