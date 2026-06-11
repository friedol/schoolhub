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
import { Plus, Eye, Edit, Trash2, QrCode, BookOpen, AlertTriangle, CheckCircle, Library } from 'lucide-react';

interface Book {
    id: number;
    accession_number: string;
    title: string;
    author: string;
    publisher: string;
    publication_year: number;
    isbn: string;
    subject_category: string;
    target_audience: string;
    language: string;
    book_type: string;
    shelf_location: string;
    cover_image_path: string;
    total_copies: number;
    available_copies: number;
    issued_copies: number;
    created_by: {
        first_name: string;
        last_name: string;
    };
    created_at: string;
}

interface Props {
    books: {
        data: Book[];
        links: any[];
        meta: any;
    };
    filters: {
        search: string;
        subject_category: string;
        target_audience: string;
        language: string;
        availability: string;
    };
    subjectCategories: Array<{ value: string; label: string }>;
    targetAudiences: Array<{ value: string; label: string }>;
    languages: Array<{ value: string; label: string }>;
}

export default function BooksIndex({ books, filters, subjectCategories, targetAudiences, languages }: Props) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [subjectFilter, setSubjectFilter] = useState(filters.subject_category || '');
    const [audienceFilter, setAudienceFilter] = useState(filters.target_audience || '');
    const [languageFilter, setLanguageFilter] = useState(filters.language || '');
    const [availabilityFilter, setAvailabilityFilter] = useState(filters.availability || '');

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'fiction':
                return 'bg-purple-100 text-purple-800';
            case 'non_fiction':
                return 'bg-blue-100 text-blue-800';
            case 'science':
                return 'bg-green-100 text-green-800';
            case 'mathematics':
                return 'bg-orange-100 text-orange-800';
            case 'history':
                return 'bg-yellow-100 text-yellow-800';
            case 'kiswahili_literature':
                return 'bg-red-100 text-red-800';
            case 'english_literature':
                return 'bg-indigo-100 text-indigo-800';
            case 'reference':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getAudienceColor = (audience: string) => {
        switch (audience) {
            case 'pre_primary':
                return 'bg-pink-100 text-pink-800';
            case 'lower_primary':
                return 'bg-blue-100 text-blue-800';
            case 'upper_primary':
                return 'bg-green-100 text-green-800';
            case 'o_level':
                return 'bg-orange-100 text-orange-800';
            case 'a_level':
                return 'bg-purple-100 text-purple-800';
            case 'teacher_reference':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getLanguageColor = (language: string) => {
        switch (language) {
            case 'english':
                return 'bg-blue-100 text-blue-800';
            case 'kiswahili':
                return 'bg-green-100 text-green-800';
            case 'arabic':
                return 'bg-orange-100 text-orange-800';
            case 'french':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getAvailabilityStatus = (book: Book) => {
        if (book.available_copies > 0) {
            return { status: 'Available', color: 'bg-green-100 text-green-800' };
        } else if (book.issued_copies > 0) {
            return { status: 'Issued', color: 'bg-orange-100 text-orange-800' };
        } else {
            return { status: 'Unavailable', color: 'bg-gray-100 text-gray-800' };
        }
    };

    const totalBooks = books.data.reduce((sum, b) => sum + b.total_copies, 0);
    const totalAvailable = books.data.reduce((sum, b) => sum + b.available_copies, 0);
    const totalIssued = books.data.reduce((sum, b) => sum + b.issued_copies, 0);
    // Overdue: books where issued_copies > 0 and available_copies === 0 (proxy — real overdue needs backend)
    const overdueCount = books.data.filter(
        (b) => b.available_copies === 0 && b.issued_copies > 0,
    ).length;

    return (
        <AppLayout>
            <Head title="Book Catalog" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-base font-semibold text-gray-900">Book Catalog</h1>
                        <p className="text-sm text-gray-600">Manage your library book collection</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline">
                            <QrCode className="w-4 h-4 mr-2" />
                            Generate Barcodes
                        </Button>
                        <Link href="/library/books/create">
                            <Button>
                                <Plus className="w-4 h-4 mr-2" />
                                Add Book
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Stats */}
                <StatGrid cols={4}>
                    <StatCard
                        title="Total Books"
                        value={totalBooks}
                        icon={Library}
                        color="purple"
                        trendLabel="Total copies"
                    />
                    <StatCard
                        title="Available"
                        value={totalAvailable}
                        icon={CheckCircle}
                        color="green"
                        trendLabel="Ready to borrow"
                    />
                    <StatCard
                        title="Issued"
                        value={totalIssued}
                        icon={BookOpen}
                        color="blue"
                        trendLabel="Currently borrowed"
                    />
                    <StatCard
                        title="Overdue"
                        value={overdueCount}
                        icon={AlertTriangle}
                        color="red"
                        trendLabel="Fully issued titles"
                    />
                </StatGrid>

                <Card>
                    <CardHeader>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <CardTitle className="text-sm font-semibold">Books</CardTitle>
                                <CardDescription className="text-xs">
                                    Browse and manage your book collection
                                </CardDescription>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <Input
                                    placeholder="Search books..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-48"
                                />
                                <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue placeholder="All subjects" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Subjects</SelectItem>
                                        {subjectCategories.map((category) => (
                                            <SelectItem key={category.value} value={category.value}>
                                                {category.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select value={audienceFilter} onValueChange={setAudienceFilter}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue placeholder="All audiences" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Audiences</SelectItem>
                                        {targetAudiences.map((audience) => (
                                            <SelectItem key={audience.value} value={audience.value}>
                                                {audience.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select value={languageFilter} onValueChange={setLanguageFilter}>
                                    <SelectTrigger className="w-32">
                                        <SelectValue placeholder="All languages" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Languages</SelectItem>
                                        {languages.map((language) => (
                                            <SelectItem key={language.value} value={language.value}>
                                                {language.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                                    <SelectTrigger className="w-32">
                                        <SelectValue placeholder="All" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        <SelectItem value="available">Available</SelectItem>
                                        <SelectItem value="issued">Issued</SelectItem>
                                        <SelectItem value="unavailable">Unavailable</SelectItem>
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
                                    <TableHead>Book Details</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Audience</TableHead>
                                    <TableHead>Language</TableHead>
                                    <TableHead>Copies</TableHead>
                                    <TableHead>Availability</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {books.data.map((book) => {
                                    const availability = getAvailabilityStatus(book);
                                    return (
                                        <TableRow key={book.id}>
                                            <TableCell>
                                                <div className="flex items-center space-x-3">
                                                    {book.cover_image_path ? (
                                                        <img
                                                            src={`/storage/${book.cover_image_path}`}
                                                            alt={book.title}
                                                            className="w-12 h-16 object-cover rounded"
                                                        />
                                                    ) : (
                                                        <div className="w-12 h-16 bg-gray-200 rounded flex items-center justify-center">
                                                            <BookOpen className="w-6 h-6 text-gray-400" />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="font-medium">{book.title}</div>
                                                        <div className="text-sm text-gray-500">
                                                            by {book.author}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {book.publisher} • {book.publication_year}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {book.accession_number}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={getCategoryColor(book.subject_category)}>
                                                    {book.subject_category.replace('_', ' ')}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={getAudienceColor(book.target_audience)}>
                                                    {book.target_audience.replace('_', ' ')}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={getLanguageColor(book.language)}>
                                                    {book.language.charAt(0).toUpperCase() + book.language.slice(1)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <div className="text-sm">
                                                        <span className="font-medium">Total:</span> {book.total_copies}
                                                    </div>
                                                    <div className="text-sm text-green-600">
                                                        <span className="font-medium">Available:</span> {book.available_copies}
                                                    </div>
                                                    <div className="text-sm text-orange-600">
                                                        <span className="font-medium">Issued:</span> {book.issued_copies}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={availability.color}>
                                                    {availability.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    <div className="font-medium">{book.shelf_location || 'Not set'}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end space-x-2">
                                                    <Link href={`/library/books/${book.id}`}>
                                                        <Button variant="outline" size="sm">
                                                            <Eye className="w-4 h-4" />
                                                        </Button>
                                                    </Link>
                                                    <Link href={`/library/books/${book.id}/edit`}>
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
                                    );
                                })}
                            </TableBody>
                        </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}



