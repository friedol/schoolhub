import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
    BookOpen, 
    User, 
    Calendar, 
    AlertTriangle, 
    CheckCircle, 
    Search,
    ArrowLeft,
    Scan,
    Clock,
    Info
} from 'lucide-react';

interface BookCopy {
    id: number;
    accession_number: string;
    barcode: string;
    status: string;
    book: {
        id: number;
        title: string;
        author: string;
        cover_image: string;
        subject_category: string;
        target_audience: string;
    };
}

interface Borrower {
    id: number;
    name: string;
    student_number?: string;
    employee_id?: string;
    role: string;
    email: string;
    phone: string;
    current_borrowed_books: number;
    max_borrow_limit: number;
    has_overdue_books: boolean;
    total_fines: number;
}

interface Props {
    availableBooks: BookCopy[];
    borrowers: Borrower[];
    libraryConfig: {
        max_borrow_days_student: number;
        max_borrow_days_staff: number;
        max_books_student: number;
        max_books_staff: number;
        fine_grace_period_days: number;
        daily_fine_rate: number;
    };
}

export default function IssueBook({ availableBooks, borrowers, libraryConfig }: Props) {
    const [selectedBorrower, setSelectedBorrower] = useState<Borrower | null>(null);
    const [selectedBook, setSelectedBook] = useState<BookCopy | null>(null);
    const [searchBorrower, setSearchBorrower] = useState('');
    const [searchBook, setSearchBook] = useState('');

    const { data, setData, post, processing, errors } = useForm({
        borrower_id: '',
        book_copy_id: '',
        issue_date: new Date().toISOString().split('T')[0],
        due_date: '',
        notes: '',
    });

    const handleBorrowerSelect = (borrowerId: string) => {
        const borrower = borrowers.find(b => b.id.toString() === borrowerId);
        setSelectedBorrower(borrower || null);
        setData('borrower_id', borrowerId);
        
        if (borrower) {
            const maxDays = borrower.role === 'student' 
                ? libraryConfig.max_borrow_days_student 
                : libraryConfig.max_borrow_days_staff;
            
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + maxDays);
            setData('due_date', dueDate.toISOString().split('T')[0]);
        }
    };

    const handleBookSelect = (bookCopyId: string) => {
        const book = availableBooks.find(b => b.id.toString() === bookCopyId);
        setSelectedBook(book || null);
        setData('book_copy_id', bookCopyId);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/library/circulation/issue');
    };

    const filteredBorrowers = borrowers.filter(borrower =>
        borrower.name.toLowerCase().includes(searchBorrower.toLowerCase()) ||
        (borrower.student_number && borrower.student_number.toLowerCase().includes(searchBorrower.toLowerCase())) ||
        (borrower.employee_id && borrower.employee_id.toLowerCase().includes(searchBorrower.toLowerCase()))
    );

    const filteredBooks = availableBooks.filter(book =>
        book.book.title.toLowerCase().includes(searchBook.toLowerCase()) ||
        book.book.author.toLowerCase().includes(searchBook.toLowerCase()) ||
        book.accession_number.toLowerCase().includes(searchBook.toLowerCase())
    );

    const getBorrowerStatus = (borrower: Borrower) => {
        if (borrower.has_overdue_books) {
            return { status: 'overdue', color: 'bg-red-100 text-red-800', icon: AlertTriangle };
        }
        if (borrower.current_borrowed_books >= borrower.max_borrow_limit) {
            return { status: 'limit_reached', color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle };
        }
        if (borrower.total_fines > 0) {
            return { status: 'has_fines', color: 'bg-orange-100 text-orange-800', icon: Info };
        }
        return { status: 'eligible', color: 'bg-green-100 text-green-800', icon: CheckCircle };
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-TZ', {
            style: 'currency',
            currency: 'TZS',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <AppLayout>
            <Head title="Issue Book" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                <div className="flex items-center space-x-4">
                    <Button variant="outline" size="sm">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Circulation
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Issue Book</h1>
                        <p className="text-gray-600">Issue a book to a borrower</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Borrower Selection */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <User className="w-5 h-5 mr-2" />
                                    Select Borrower
                                </CardTitle>
                                <CardDescription>
                                    Choose the person who will borrow the book
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="search-borrower">Search Borrower</Label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="search-borrower"
                                            placeholder="Search by name, student number, or employee ID..."
                                            value={searchBorrower}
                                            onChange={(e) => setSearchBorrower(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="borrower_id">Borrower *</Label>
                                    <Select
                                        value={data.borrower_id}
                                        onValueChange={handleBorrowerSelect}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a borrower" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {filteredBorrowers.map((borrower) => {
                                                const status = getBorrowerStatus(borrower);
                                                const StatusIcon = status.icon;
                                                return (
                                                    <SelectItem key={borrower.id} value={borrower.id.toString()}>
                                                        <div className="flex items-center space-x-2">
                                                            <StatusIcon className="w-4 h-4" />
                                                            <span>{borrower.name}</span>
                                                            <span className="text-gray-500">
                                                                ({borrower.student_number || borrower.employee_id})
                                                            </span>
                                                        </div>
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectContent>
                                    </Select>
                                    {errors.borrower_id && <p className="text-red-500 text-sm">{errors.borrower_id}</p>}
                                </div>

                                {selectedBorrower && (
                                    <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="font-medium">{selectedBorrower.name}</div>
                                                <div className="text-sm text-gray-500">
                                                    {selectedBorrower.student_number || selectedBorrower.employee_id}
                                                </div>
                                                <div className="text-sm text-gray-500 capitalize">
                                                    {selectedBorrower.role}
                                                </div>
                                            </div>
                                            <Badge className={getBorrowerStatus(selectedBorrower).color}>
                                                {getBorrowerStatus(selectedBorrower).status.replace('_', ' ')}
                                            </Badge>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <div className="text-gray-500">Current Books</div>
                                                <div className="font-medium">
                                                    {selectedBorrower.current_borrowed_books} / {selectedBorrower.max_borrow_limit}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-gray-500">Total Fines</div>
                                                <div className="font-medium text-red-600">
                                                    {formatCurrency(selectedBorrower.total_fines)}
                                                </div>
                                            </div>
                                        </div>

                                        {selectedBorrower.has_overdue_books && (
                                            <Alert>
                                                <AlertTriangle className="h-4 w-4" />
                                                <AlertDescription>
                                                    This borrower has overdue books. Please collect them before issuing new books.
                                                </AlertDescription>
                                            </Alert>
                                        )}

                                        {selectedBorrower.current_borrowed_books >= selectedBorrower.max_borrow_limit && (
                                            <Alert>
                                                <AlertTriangle className="h-4 w-4" />
                                                <AlertDescription>
                                                    This borrower has reached their borrowing limit.
                                                </AlertDescription>
                                            </Alert>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Book Selection */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <BookOpen className="w-5 h-5 mr-2" />
                                    Select Book
                                </CardTitle>
                                <CardDescription>
                                    Choose the book to be issued
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="search-book">Search Book</Label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="search-book"
                                            placeholder="Search by title, author, or accession number..."
                                            value={searchBook}
                                            onChange={(e) => setSearchBook(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="book_copy_id">Book Copy *</Label>
                                    <Select
                                        value={data.book_copy_id}
                                        onValueChange={handleBookSelect}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a book copy" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {filteredBooks.map((book) => (
                                                <SelectItem key={book.id} value={book.id.toString()}>
                                                    <div className="flex items-center space-x-2">
                                                        <BookOpen className="w-4 h-4" />
                                                        <span>{book.book.title}</span>
                                                        <span className="text-gray-500">
                                                            ({book.accession_number})
                                                        </span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.book_copy_id && <p className="text-red-500 text-sm">{errors.book_copy_id}</p>}
                                </div>

                                {selectedBook && (
                                    <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-12 h-16 bg-gray-200 rounded flex items-center justify-center">
                                                {selectedBook.book.cover_image ? (
                                                    <img
                                                        src={selectedBook.book.cover_image}
                                                        alt="Book cover"
                                                        className="w-full h-full object-cover rounded"
                                                    />
                                                ) : (
                                                    <BookOpen className="w-6 h-6 text-gray-400" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-medium">{selectedBook.book.title}</div>
                                                <div className="text-sm text-gray-500">by {selectedBook.book.author}</div>
                                                <div className="text-sm text-gray-500">
                                                    Accession: {selectedBook.accession_number}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <div className="text-gray-500">Category</div>
                                                <div className="font-medium capitalize">
                                                    {selectedBook.book.subject_category.replace('_', ' ')}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-gray-500">Target Audience</div>
                                                <div className="font-medium capitalize">
                                                    {selectedBook.book.target_audience.replace('_', ' ')}
                                                </div>
                                            </div>
                                        </div>

                                        <Badge className="bg-green-100 text-green-800">
                                            <CheckCircle className="w-3 h-3 mr-1" />
                                            Available
                                        </Badge>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Issue Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Calendar className="w-5 h-5 mr-2" />
                                Issue Details
                            </CardTitle>
                            <CardDescription>
                                Set the issue date and due date for the book
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="issue_date">Issue Date *</Label>
                                    <Input
                                        id="issue_date"
                                        type="date"
                                        value={data.issue_date}
                                        onChange={(e) => setData('issue_date', e.target.value)}
                                        className={errors.issue_date ? 'border-red-500' : ''}
                                    />
                                    {errors.issue_date && <p className="text-red-500 text-sm">{errors.issue_date}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="due_date">Due Date *</Label>
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
                                <Label htmlFor="notes">Notes (Optional)</Label>
                                <Input
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="Add any special notes or conditions..."
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Issue Summary */}
                    {selectedBorrower && selectedBook && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Issue Summary</CardTitle>
                                <CardDescription>
                                    Review the details before issuing the book
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="p-4 bg-blue-50 rounded-lg">
                                        <div className="text-sm font-medium text-blue-600 mb-2">Borrower</div>
                                        <div className="font-medium">{selectedBorrower.name}</div>
                                        <div className="text-sm text-gray-500">
                                            {selectedBorrower.student_number || selectedBorrower.employee_id}
                                        </div>
                                        <div className="text-sm text-gray-500 capitalize">
                                            {selectedBorrower.role}
                                        </div>
                                    </div>
                                    <div className="p-4 bg-green-50 rounded-lg">
                                        <div className="text-sm font-medium text-green-600 mb-2">Book</div>
                                        <div className="font-medium">{selectedBook.book.title}</div>
                                        <div className="text-sm text-gray-500">by {selectedBook.book.author}</div>
                                        <div className="text-sm text-gray-500">
                                            Accession: {selectedBook.accession_number}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <div className="text-gray-500">Issue Date</div>
                                            <div className="font-medium">{data.issue_date}</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-500">Due Date</div>
                                            <div className="font-medium">{data.due_date}</div>
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
                        <Button 
                            type="submit" 
                            disabled={processing || !selectedBorrower || !selectedBook}
                        >
                            <BookOpen className="w-4 h-4 mr-2" />
                            {processing ? 'Issuing...' : 'Issue Book'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}



