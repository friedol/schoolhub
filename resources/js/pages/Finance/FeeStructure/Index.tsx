import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatCard, StatGrid } from '@/components/ui/stat-card';
import { Plus, DollarSign, GraduationCap, Eye, Edit, Trash2, Settings, TrendingUp, CheckCircle } from 'lucide-react';

interface FeeStructure {
    id: number;
    fee_item: {
        name: string;
        category: string;
        is_mandatory: boolean;
        is_taxable: boolean;
        tax_rate: number;
    };
    school_class: {
        name: string;
        level: string;
    };
    academic_year: string;
    term: string;
    amount: number;
    day_student_amount: number;
    boarding_student_amount: number;
    effective_date: string;
    expiry_date: string;
    is_active: boolean;
}

interface Props {
    feeStructures: {
        data: FeeStructure[];
        links: any[];
        meta: any;
    };
    classes: Array<{ id: number; name: string; level: string }>;
    feeItems: Array<{ id: number; name: string; category: string }>;
}

export default function FeeStructureIndex({ feeStructures, classes, feeItems }: Props) {
    const [classFilter, setClassFilter] = useState<string>('');
    const [itemFilter, setItemFilter] = useState<string>('');
    const [yearFilter, setYearFilter] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');

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

    const filteredStructures = feeStructures.data.filter(structure => {
        if (classFilter && structure.school_class.id.toString() !== classFilter) return false;
        if (itemFilter && structure.fee_item.id.toString() !== itemFilter) return false;
        if (yearFilter && structure.academic_year !== yearFilter) return false;
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            return (
                structure.fee_item.name.toLowerCase().includes(searchLower) ||
                structure.school_class.name.toLowerCase().includes(searchLower) ||
                structure.academic_year.toLowerCase().includes(searchLower)
            );
        }
        return true;
    });

    const stats = {
        total: feeStructures.data.length,
        active: feeStructures.data.filter(s => s.is_active).length,
        mandatory: feeStructures.data.filter(s => s.fee_item.is_mandatory).length,
        taxable: feeStructures.data.filter(s => s.fee_item.is_taxable).length,
        totalAmount: feeStructures.data.reduce((sum, s) => sum + s.amount, 0),
    };

    const years = Array.from(new Set(feeStructures.data.map(s => s.academic_year)));

    const optionalFees = stats.total - stats.mandatory;

    return (
        <AppLayout>
            <Head title="Fee Structure Management" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-base font-semibold text-gray-900">Fee Structure Management</h1>
                        <p className="text-sm text-gray-600">Manage fee structures for different classes and terms</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/finance/fee-structure/reports">
                            <Button variant="outline">
                                <TrendingUp className="w-4 h-4 mr-2" />
                                Reports
                            </Button>
                        </Link>
                        <Link href="/finance/fee-structure/create">
                            <Button>
                                <Plus className="w-4 h-4 mr-2" />
                                Add Fee Structure
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Stats */}
                <StatGrid cols={4}>
                    <StatCard
                        title="Total Fee Items"
                        value={stats.total}
                        icon={Settings}
                        color="blue"
                        trendLabel="Fee structures"
                    />
                    <StatCard
                        title="Mandatory Fees"
                        value={stats.mandatory}
                        icon={GraduationCap}
                        color="green"
                        trendLabel="Required fees"
                    />
                    <StatCard
                        title="Optional Fees"
                        value={optionalFees}
                        icon={CheckCircle}
                        color="amber"
                        trendLabel="Non-mandatory fees"
                    />
                    <StatCard
                        title="Total Amount TZS"
                        value={`TZS ${stats.totalAmount.toLocaleString()}`}
                        icon={DollarSign}
                        color="emerald"
                        trendLabel="Combined fee amount"
                    />
                </StatGrid>

                <Card>
                    <CardHeader>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <CardTitle className="text-sm font-semibold">Fee Structures</CardTitle>
                                <CardDescription className="text-xs">
                                    View and manage all fee structures
                                </CardDescription>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <Input
                                    placeholder="Search structures..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-48"
                                />
                                <Select value={classFilter} onValueChange={setClassFilter}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue placeholder="All classes" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Classes</SelectItem>
                                        {classes.map((cls) => (
                                            <SelectItem key={cls.id} value={cls.id.toString()}>
                                                {cls.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select value={itemFilter} onValueChange={setItemFilter}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue placeholder="All items" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Items</SelectItem>
                                        {feeItems.map((item) => (
                                            <SelectItem key={item.id} value={item.id.toString()}>
                                                {item.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select value={yearFilter} onValueChange={setYearFilter}>
                                    <SelectTrigger className="w-32">
                                        <SelectValue placeholder="All years" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Years</SelectItem>
                                        {years.map((year) => (
                                            <SelectItem key={year} value={year}>
                                                {year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Fee Item</TableHead>
                                    <TableHead>Class</TableHead>
                                    <TableHead>Academic Year</TableHead>
                                    <TableHead>Term</TableHead>
                                    <TableHead>Amounts</TableHead>
                                    <TableHead>Effective Period</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredStructures.map((structure) => (
                                    <TableRow key={structure.id}>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{structure.fee_item.name}</div>
                                                <div className="flex items-center space-x-2 mt-1">
                                                    <Badge className={getCategoryColor(structure.fee_item.category)}>
                                                        {structure.fee_item.category.replace('_', ' ').toUpperCase()}
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
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{structure.school_class.name}</div>
                                                <div className="text-sm text-gray-500">{structure.school_class.level}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {structure.academic_year}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {structure.term.replace('_', ' ').toUpperCase()}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="text-sm">
                                                    <span className="font-medium">Base:</span> TZS {structure.amount.toLocaleString()}
                                                </div>
                                                {structure.day_student_amount && (
                                                    <div className="text-sm text-blue-600">
                                                        <span className="font-medium">Day:</span> TZS {structure.day_student_amount.toLocaleString()}
                                                    </div>
                                                )}
                                                {structure.boarding_student_amount && (
                                                    <div className="text-sm text-green-600">
                                                        <span className="font-medium">Boarding:</span> TZS {structure.boarding_student_amount.toLocaleString()}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                <div className="font-medium">
                                                    {new Date(structure.effective_date).toLocaleDateString()}
                                                </div>
                                                <div className="text-gray-500">
                                                    to {structure.expiry_date ? new Date(structure.expiry_date).toLocaleDateString() : 'No expiry'}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={structure.is_active ? "default" : "secondary"}>
                                                {structure.is_active ? "Active" : "Inactive"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end space-x-2">
                                                <Link href={`/finance/fee-structure/${structure.id}`}>
                                                    <Button variant="outline" size="sm">
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                                <Link href={`/finance/fee-structure/${structure.id}/edit`}>
                                                    <Button variant="outline" size="sm">
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                                <Button variant="outline" size="sm" className="text-red-600">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}



