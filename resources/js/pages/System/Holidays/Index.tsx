import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '@/components/ui/table';
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';
import { 
    Calendar, 
    Plus, 
    Search, 
    MoreHorizontal, 
    Edit, 
    Trash2, 
    Download,
    Upload,
    RotateCcw,
    CheckCircle,
    XCircle,
    AlertCircle,
    Clock,
    Repeat
} from 'lucide-react';

interface Holiday {
    id: number;
    name: string;
    start_date: string;
    end_date: string;
    type: string;
    description?: string;
    is_recurring: boolean;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

interface Statistics {
    total_holidays: number;
    current_year_holidays: number;
    active_holidays: number;
    upcoming_holidays: Holiday[];
}

interface Props {
    holidays: {
        data: Holiday[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    statistics: Statistics;
    filters: {
        type?: string;
        year?: number;
        is_active?: boolean;
        is_recurring?: boolean;
    };
    holidayTypes: Record<string, string>;
    years: number[];
}

export default function HolidaysIndex({ holidays, statistics, filters, holidayTypes, years }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [isImporting, setIsImporting] = useState(false);

    const handleFilterChange = (key: string, value: string | number | boolean) => {
        const newFilters = { ...filters, [key]: value };
        router.get('/system/holidays', newFilters, {
            preserveState: true,
            replace: true
        });
    };

    const handleDelete = async (holiday: Holiday) => {
        if (confirm(`Are you sure you want to delete the holiday "${holiday.name}"?`)) {
            try {
                await router.delete(`/system/holidays/${holiday.id}`, {
                    onSuccess: () => {
                        setMessage({ type: 'success', text: 'Holiday deleted successfully.' });
                    },
                    onError: (errors) => {
                        setMessage({ type: 'error', text: Object.values(errors)[0] as string });
                    }
                });
            } catch (error) {
                setMessage({ type: 'error', text: 'Failed to delete holiday.' });
            }
        }
    };

    const handleToggleStatus = async (holiday: Holiday) => {
        try {
            await router.post(`/system/holidays/${holiday.id}/toggle-status`, {}, {
                onSuccess: () => {
                    setMessage({ type: 'success', text: 'Holiday status updated successfully.' });
                },
                onError: (errors) => {
                    setMessage({ type: 'error', text: Object.values(errors)[0] as string });
                }
            });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update holiday status.' });
        }
    };

    const handleImportPublicHolidays = async () => {
        const year = new Date().getFullYear();
        if (confirm(`Import Tanzanian public holidays for ${year}?`)) {
            setIsImporting(true);
            try {
                await router.post('/system/holidays/import-public', {
                    year: year,
                    overwrite_existing: false
                }, {
                    onSuccess: () => {
                        setMessage({ type: 'success', text: 'Public holidays imported successfully.' });
                    },
                    onError: (errors) => {
                        setMessage({ type: 'error', text: Object.values(errors)[0] as string });
                    }
                });
            } catch (error) {
                setMessage({ type: 'error', text: 'Failed to import public holidays.' });
            } finally {
                setIsImporting(false);
            }
        }
    };

    const handleGenerateRecurring = async () => {
        const year = new Date().getFullYear() + 1;
        if (confirm(`Generate recurring holidays for ${year}?`)) {
            try {
                await router.post('/system/holidays/generate-recurring', {
                    year: year,
                    confirm: true
                }, {
                    onSuccess: () => {
                        setMessage({ type: 'success', text: 'Recurring holidays generated successfully.' });
                    },
                    onError: (errors) => {
                        setMessage({ type: 'error', text: Object.values(errors)[0] as string });
                    }
                });
            } catch (error) {
                setMessage({ type: 'error', text: 'Failed to generate recurring holidays.' });
            }
        }
    };

    const getTypeBadge = (type: string) => {
        const typeColors: Record<string, string> = {
            'public_holiday': 'bg-red-100 text-red-800',
            'school_holiday': 'bg-green-100 text-green-800',
            'academic_break': 'bg-blue-100 text-blue-800',
            'religious_holiday': 'bg-purple-100 text-purple-800',
            'national_holiday': 'bg-orange-100 text-orange-800',
        };

        const colorClass = typeColors[type] || 'bg-gray-100 text-gray-800';
        return <Badge className={colorClass}>{holidayTypes[type] || type}</Badge>;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getDuration = (startDate: string, endDate: string) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return diffDays === 1 ? '1 day' : `${diffDays} days`;
    };

    const isUpcoming = (holiday: Holiday) => {
        const today = new Date();
        const startDate = new Date(holiday.start_date);
        return startDate >= today;
    };

    const filteredHolidays = holidays.data.filter(holiday =>
        holiday.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        holiday.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        holiday.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AppLayout title="Holidays">
            <Head title="Holidays" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                                        <Calendar className="h-8 w-8 mr-3 text-blue-600" />
                                        Holidays
                                    </h2>
                                    <p className="text-gray-600">Manage school holidays and academic calendar</p>
                                </div>
                                <div className="flex space-x-2">
                                    <Button onClick={handleImportPublicHolidays} variant="outline" disabled={isImporting}>
                                        <Upload className="h-4 w-4 mr-2" />
                                        {isImporting ? 'Importing...' : 'Import Public'}
                                    </Button>
                                    <Button onClick={handleGenerateRecurring} variant="outline">
                                        <RotateCcw className="h-4 w-4 mr-2" />
                                        Generate Recurring
                                    </Button>
                                    <Link href="/system/holidays/create">
                                        <Button>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Holiday
                                        </Button>
                                    </Link>
                                </div>
                            </div>

                            {message && (
                                <Alert className={`mb-6 ${message.type === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
                                    {message.type === 'error' ? (
                                        <AlertCircle className="h-4 w-4 text-red-600" />
                                    ) : (
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                    )}
                                    <AlertDescription className={message.type === 'error' ? 'text-red-800' : 'text-green-800'}>
                                        {message.text}
                                    </AlertDescription>
                                </Alert>
                            )}

                            {/* Statistics Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                <Card>
                                    <CardContent className="p-4">
                                        <div className="flex items-center">
                                            <Calendar className="h-8 w-8 text-blue-600 mr-3" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Total Holidays</p>
                                                <p className="text-2xl font-bold">{statistics.total_holidays}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-4">
                                        <div className="flex items-center">
                                            <Clock className="h-8 w-8 text-green-600 mr-3" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">This Year</p>
                                                <p className="text-2xl font-bold">{statistics.current_year_holidays}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-4">
                                        <div className="flex items-center">
                                            <CheckCircle className="h-8 w-8 text-purple-600 mr-3" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Active</p>
                                                <p className="text-2xl font-bold">{statistics.active_holidays}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-4">
                                        <div className="flex items-center">
                                            <Repeat className="h-8 w-8 text-orange-600 mr-3" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Upcoming</p>
                                                <p className="text-2xl font-bold">{statistics.upcoming_holidays.length}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle>Holidays ({holidays.total})</CardTitle>
                                            <CardDescription>
                                                Manage school holidays and academic calendar dates
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {/* Filters */}
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                        <div>
                                            <label className="text-sm font-medium mb-2 block">Type</label>
                                            <Select
                                                value={filters.type || ''}
                                                onValueChange={(value) => handleFilterChange('type', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="All types" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All types</SelectItem>
                                                    {Object.entries(holidayTypes).map(([key, label]) => (
                                                        <SelectItem key={key} value={key}>
                                                            {label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium mb-2 block">Year</label>
                                            <Select
                                                value={filters.year?.toString() || ''}
                                                onValueChange={(value) => handleFilterChange('year', parseInt(value))}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="All years" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All years</SelectItem>
                                                    {years.map((year) => (
                                                        <SelectItem key={year} value={year.toString()}>
                                                            {year}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium mb-2 block">Status</label>
                                            <Select
                                                value={filters.is_active?.toString() || ''}
                                                onValueChange={(value) => handleFilterChange('is_active', value === 'true')}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="All statuses" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All statuses</SelectItem>
                                                    <SelectItem value="true">Active</SelectItem>
                                                    <SelectItem value="false">Inactive</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium mb-2 block">Recurring</label>
                                            <Select
                                                value={filters.is_recurring?.toString() || ''}
                                                onValueChange={(value) => handleFilterChange('is_recurring', value === 'true')}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="All" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All</SelectItem>
                                                    <SelectItem value="true">Recurring</SelectItem>
                                                    <SelectItem value="false">One-time</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Search */}
                                    <div className="relative mb-6">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            placeholder="Search holidays..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>

                                    <div className="rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Holiday</TableHead>
                                                    <TableHead>Type</TableHead>
                                                    <TableHead>Date Range</TableHead>
                                                    <TableHead>Duration</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead>Recurring</TableHead>
                                                    <TableHead className="w-[50px]"></TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {filteredHolidays.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={7} className="text-center py-8">
                                                            <div className="flex flex-col items-center">
                                                                <Calendar className="h-12 w-12 text-gray-400 mb-4" />
                                                                <p className="text-gray-500">No holidays found</p>
                                                                <Link href="/system/holidays/create" className="mt-2">
                                                                    <Button variant="outline" size="sm">
                                                                        <Plus className="h-4 w-4 mr-2" />
                                                                        Add your first holiday
                                                                    </Button>
                                                                </Link>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    filteredHolidays.map((holiday) => (
                                                        <TableRow key={holiday.id}>
                                                            <TableCell>
                                                                <div>
                                                                    <div className="font-medium">{holiday.name}</div>
                                                                    {holiday.description && (
                                                                        <div className="text-sm text-gray-500 max-w-xs truncate">
                                                                            {holiday.description}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                {getTypeBadge(holiday.type)}
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="text-sm">
                                                                    <div>{formatDate(holiday.start_date)}</div>
                                                                    {holiday.start_date !== holiday.end_date && (
                                                                        <div className="text-gray-500">
                                                                            to {formatDate(holiday.end_date)}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                {getDuration(holiday.start_date, holiday.end_date)}
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex items-center">
                                                                    {holiday.is_active ? (
                                                                        <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                                                                    ) : (
                                                                        <XCircle className="h-4 w-4 text-red-500 mr-1" />
                                                                    )}
                                                                    <span className={holiday.is_active ? 'text-green-700' : 'text-red-700'}>
                                                                        {holiday.is_active ? 'Active' : 'Inactive'}
                                                                    </span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                {holiday.is_recurring ? (
                                                                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                                                        <Repeat className="h-3 w-3 mr-1" />
                                                                        Recurring
                                                                    </Badge>
                                                                ) : (
                                                                    <span className="text-gray-400">One-time</span>
                                                                )}
                                                            </TableCell>
                                                            <TableCell>
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <Button variant="ghost" size="sm">
                                                                            <MoreHorizontal className="h-4 w-4" />
                                                                        </Button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent align="end">
                                                                        <DropdownMenuItem asChild>
                                                                            <Link href={`/system/holidays/${holiday.id}`}>
                                                                                View Details
                                                                            </Link>
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem asChild>
                                                                            <Link href={`/system/holidays/${holiday.id}/edit`}>
                                                                                <Edit className="h-4 w-4 mr-2" />
                                                                                Edit
                                                                            </Link>
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem onClick={() => handleToggleStatus(holiday)}>
                                                                            {holiday.is_active ? (
                                                                                <>
                                                                                    <XCircle className="h-4 w-4 mr-2" />
                                                                                    Deactivate
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <CheckCircle className="h-4 w-4 mr-2" />
                                                                                    Activate
                                                                                </>
                                                                            )}
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem 
                                                                            onClick={() => handleDelete(holiday)}
                                                                            className="text-red-600"
                                                                        >
                                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                                            Delete
                                                                        </DropdownMenuItem>
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>

                                    {/* Pagination */}
                                    {holidays.last_page > 1 && (
                                        <div className="flex items-center justify-between mt-4">
                                            <div className="text-sm text-gray-500">
                                                Showing {((holidays.current_page - 1) * holidays.per_page) + 1} to{' '}
                                                {Math.min(holidays.current_page * holidays.per_page, holidays.total)} of{' '}
                                                {holidays.total} results
                                            </div>
                                            <div className="flex space-x-2">
                                                {holidays.current_page > 1 && (
                                                    <Link
                                                        href={`/system/holidays?page=${holidays.current_page - 1}`}
                                                        className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
                                                    >
                                                        Previous
                                                    </Link>
                                                )}
                                                {holidays.current_page < holidays.last_page && (
                                                    <Link
                                                        href={`/system/holidays?page=${holidays.current_page + 1}`}
                                                        className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
                                                    >
                                                        Next
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                
            </div>
        </AppLayout>
    );
}
