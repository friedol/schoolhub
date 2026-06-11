import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
    ArrowLeft, 
    Edit, 
    BookOpen, 
    Calendar, 
    DollarSign, 
    MapPin, 
    User, 
    Building, 
    Hash, 
    FileText,
    Copy,
    Eye,
    AlertCircle,
    CheckCircle,
    Clock,
    XCircle
} from 'lucide-react';

interface BookCopy {
    id: number;
    accession_number: string;
    barcode: string;
    status: 'available' | 'issued' | 'lost' | 'damaged' | 'under_repair';
    shelf_location: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

interface Book {
    id: number;
    title: string;
    author: string;
    publisher: string;
    publication_year: number;
    edition: string;
    isbn: string;
    issn: string;
    dewey_decimal_number: string;
    library_of_congress_number: string;
    subject_category: string;
    target_audience: string;
    language: string;
    number_of_pages: number;
    book_type: string;
    acquisition_date: string;
    cost: number;
    supplier: string;
    shelf_location: string;
    cover_image: string;
    description: string;
    keywords: string[];
    total_copies: number;
    available_copies: number;
    copies: BookCopy[];
    created_at: string;
    updated_at: string;
}

interface Props {
    book: Book;
}

export default function ShowBook({ book }: Props) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'available':
                return 'bg-green-100 text-green-800';
            case 'issued':
                return 'bg-blue-100 text-blue-800';
            case 'lost':
                return 'bg-red-100 text-red-800';
            case 'damaged':
                return 'bg-orange-100 text-orange-800';
            case 'under_repair':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'available':
                return <CheckCircle className="w-4 h-4" />;
            case 'issued':
                return <Eye className="w-4 h-4" />;
            case 'lost':
                return <XCircle className="w-4 h-4" />;
            case 'damaged':
                return <AlertCircle className="w-4 h-4" />;
            case 'under_repair':
                return <Clock className="w-4 h-4" />;
            default:
                return <AlertCircle className="w-4 h-4" />;
        }
    };

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

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-TZ', {
            style: 'currency',
            currency: 'TZS',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-TZ', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <AppLayout>
            <Head title={`${book.title} - Book Details`} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/library/books">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Books
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{book.title}</h1>
                            <p className="text-gray-600">by {book.author}</p>
                        </div>
                    </div>
                    <Link href={`/library/books/${book.id}/edit`}>
                        <Button>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Book
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Book Information */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <BookOpen className="w-5 h-5 mr-2" />
                                    Book Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-sm font-medium text-gray-500">Publisher</div>
                                        <div className="text-lg">{book.publisher || 'Not specified'}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-gray-500">Publication Year</div>
                                        <div className="text-lg">{book.publication_year || 'Not specified'}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-gray-500">Edition</div>
                                        <div className="text-lg">{book.edition || 'Not specified'}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-gray-500">Number of Pages</div>
                                        <div className="text-lg">{book.number_of_pages || 'Not specified'}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-gray-500">ISBN</div>
                                        <div className="text-lg font-mono">{book.isbn || 'Not specified'}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-gray-500">ISSN</div>
                                        <div className="text-lg font-mono">{book.issn || 'Not specified'}</div>
                                    </div>
                                </div>

                                {book.description && (
                                    <>
                                        <Separator />
                                        <div>
                                            <div className="text-sm font-medium text-gray-500 mb-2">Description</div>
                                            <p className="text-gray-700">{book.description}</p>
                                        </div>
                                    </>
                                )}

                                {book.keywords && book.keywords.length > 0 && (
                                    <>
                                        <Separator />
                                        <div>
                                            <div className="text-sm font-medium text-gray-500 mb-2">Keywords</div>
                                            <div className="flex flex-wrap gap-2">
                                                {book.keywords.map((keyword) => (
                                                    <Badge key={keyword} variant="outline">
                                                        {keyword}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Hash className="w-5 h-5 mr-2" />
                                    Classification
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-sm font-medium text-gray-500">Subject Category</div>
                                        <Badge className={getCategoryColor(book.subject_category)}>
                                            {book.subject_category.replace('_', ' ')}
                                        </Badge>
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-gray-500">Target Audience</div>
                                        <Badge variant="outline">
                                            {book.target_audience.replace('_', ' ')}
                                        </Badge>
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-gray-500">Language</div>
                                        <div className="text-lg capitalize">{book.language}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-gray-500">Book Type</div>
                                        <div className="text-lg capitalize">{book.book_type}</div>
                                    </div>
                                    {book.dewey_decimal_number && (
                                        <div>
                                            <div className="text-sm font-medium text-gray-500">Dewey Decimal</div>
                                            <div className="text-lg font-mono">{book.dewey_decimal_number}</div>
                                        </div>
                                    )}
                                    {book.library_of_congress_number && (
                                        <div>
                                            <div className="text-sm font-medium text-gray-500">Library of Congress</div>
                                            <div className="text-lg font-mono">{book.library_of_congress_number}</div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Copy className="w-5 h-5 mr-2" />
                                    Book Copies ({book.total_copies})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {book.copies.map((copy) => (
                                        <div key={copy.id} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div className="flex items-center space-x-3">
                                                <div className="flex items-center space-x-2">
                                                    {getStatusIcon(copy.status)}
                                                    <Badge className={getStatusColor(copy.status)}>
                                                        {copy.status.replace('_', ' ')}
                                                    </Badge>
                                                </div>
                                                <div>
                                                    <div className="font-medium">Accession: {copy.accession_number}</div>
                                                    <div className="text-sm text-gray-500">
                                                        Barcode: {copy.barcode}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {copy.shelf_location}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Cover Image */}
                        {book.cover_image && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Cover Image</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <img
                                        src={book.cover_image}
                                        alt={`${book.title} cover`}
                                        className="w-full h-64 object-cover rounded-lg"
                                    />
                                </CardContent>
                            </Card>
                        )}

                        {/* Acquisition Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Calendar className="w-5 h-5 mr-2" />
                                    Acquisition Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <div className="text-sm font-medium text-gray-500">Acquisition Date</div>
                                    <div className="text-lg">{formatDate(book.acquisition_date)}</div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-gray-500">Cost</div>
                                    <div className="text-lg font-semibold text-green-600">
                                        {formatCurrency(book.cost)}
                                    </div>
                                </div>
                                {book.supplier && (
                                    <div>
                                        <div className="text-sm font-medium text-gray-500">Supplier</div>
                                        <div className="text-lg">{book.supplier}</div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Location & Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <MapPin className="w-5 h-5 mr-2" />
                                    Location & Status
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <div className="text-sm font-medium text-gray-500">Shelf Location</div>
                                    <div className="text-lg font-mono">{book.shelf_location || 'Not set'}</div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-gray-500">Total Copies</div>
                                    <div className="text-lg font-semibold">{book.total_copies}</div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-gray-500">Available Copies</div>
                                    <div className="text-lg font-semibold text-green-600">{book.available_copies}</div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-gray-500">Issued Copies</div>
                                    <div className="text-lg font-semibold text-blue-600">
                                        {book.total_copies - book.available_copies}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button className="w-full" variant="outline">
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Issuance History
                                </Button>
                                <Button className="w-full" variant="outline">
                                    <Copy className="w-4 h-4 mr-2" />
                                    Add More Copies
                                </Button>
                                <Button className="w-full" variant="outline">
                                    <FileText className="w-4 h-4 mr-2" />
                                    Generate Report
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}



