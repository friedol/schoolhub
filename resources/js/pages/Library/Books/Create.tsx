import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Save, Plus, BookOpen, Upload, Info } from 'lucide-react';

interface Props {
    subjectCategories: Array<{ value: string; label: string }>;
    targetAudiences: Array<{ value: string; label: string }>;
    languages: Array<{ value: string; label: string }>;
    bookTypes: Array<{ value: string; label: string }>;
}

export default function CreateBook({ subjectCategories, targetAudiences, languages, bookTypes }: Props) {
    const [coverImage, setCoverImage] = useState<File | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const { data, setData, post, processing, errors } = useForm({
        title: '',
        author: '',
        publisher: '',
        publication_year: '',
        edition: '',
        isbn: '',
        issn: '',
        dewey_decimal_number: '',
        library_of_congress_number: '',
        subject_category: '',
        target_audience: '',
        language: 'english',
        number_of_pages: '',
        book_type: 'paperback',
        acquisition_date: '',
        cost: '',
        supplier: '',
        shelf_location: '',
        cover_image: null as File | null,
        description: '',
        keywords: [] as string[],
        copies_count: 1,
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setCoverImage(file);
            setData('cover_image', file);
            
            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviewImage(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleKeywordAdd = (keyword: string) => {
        if (keyword.trim() && !data.keywords.includes(keyword.trim())) {
            setData('keywords', [...data.keywords, keyword.trim()]);
        }
    };

    const handleKeywordRemove = (keyword: string) => {
        setData('keywords', data.keywords.filter(k => k !== keyword));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/library/books');
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

    return (
        <AppLayout>
            <Head title="Add New Book" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Add New Book</h1>
                    <p className="text-gray-600">Add a new book to your library collection</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                            <CardDescription>
                                Enter the basic details of the book
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="title">Title *</Label>
                                    <Input
                                        id="title"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        placeholder="Enter book title"
                                        className={errors.title ? 'border-red-500' : ''}
                                    />
                                    {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="author">Author *</Label>
                                    <Input
                                        id="author"
                                        value={data.author}
                                        onChange={(e) => setData('author', e.target.value)}
                                        placeholder="Enter author name"
                                        className={errors.author ? 'border-red-500' : ''}
                                    />
                                    {errors.author && <p className="text-red-500 text-sm">{errors.author}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="publisher">Publisher</Label>
                                    <Input
                                        id="publisher"
                                        value={data.publisher}
                                        onChange={(e) => setData('publisher', e.target.value)}
                                        placeholder="Enter publisher name"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="publication_year">Publication Year</Label>
                                    <Input
                                        id="publication_year"
                                        type="number"
                                        value={data.publication_year}
                                        onChange={(e) => setData('publication_year', e.target.value)}
                                        placeholder="e.g., 2024"
                                        min="1800"
                                        max={new Date().getFullYear()}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="edition">Edition</Label>
                                    <Input
                                        id="edition"
                                        value={data.edition}
                                        onChange={(e) => setData('edition', e.target.value)}
                                        placeholder="e.g., 1st Edition"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="isbn">ISBN</Label>
                                    <Input
                                        id="isbn"
                                        value={data.isbn}
                                        onChange={(e) => setData('isbn', e.target.value)}
                                        placeholder="Enter ISBN"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="issn">ISSN</Label>
                                    <Input
                                        id="issn"
                                        value={data.issn}
                                        onChange={(e) => setData('issn', e.target.value)}
                                        placeholder="Enter ISSN"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="number_of_pages">Number of Pages</Label>
                                    <Input
                                        id="number_of_pages"
                                        type="number"
                                        value={data.number_of_pages}
                                        onChange={(e) => setData('number_of_pages', e.target.value)}
                                        placeholder="Enter number of pages"
                                        min="1"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Classification & Categorization</CardTitle>
                            <CardDescription>
                                Classify the book for easy organization
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="dewey_decimal_number">Dewey Decimal Number</Label>
                                    <Input
                                        id="dewey_decimal_number"
                                        value={data.dewey_decimal_number}
                                        onChange={(e) => setData('dewey_decimal_number', e.target.value)}
                                        placeholder="e.g., 823.914"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="library_of_congress_number">Library of Congress Number</Label>
                                    <Input
                                        id="library_of_congress_number"
                                        value={data.library_of_congress_number}
                                        onChange={(e) => setData('library_of_congress_number', e.target.value)}
                                        placeholder="e.g., PR6019.O9 U5 2010"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="subject_category">Subject Category *</Label>
                                    <Select
                                        value={data.subject_category}
                                        onValueChange={(value) => setData('subject_category', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select subject category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {subjectCategories.map((category) => (
                                                <SelectItem key={category.value} value={category.value}>
                                                    {category.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.subject_category && <p className="text-red-500 text-sm">{errors.subject_category}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="target_audience">Target Audience *</Label>
                                    <Select
                                        value={data.target_audience}
                                        onValueChange={(value) => setData('target_audience', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select target audience" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {targetAudiences.map((audience) => (
                                                <SelectItem key={audience.value} value={audience.value}>
                                                    {audience.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.target_audience && <p className="text-red-500 text-sm">{errors.target_audience}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="language">Language *</Label>
                                    <Select
                                        value={data.language}
                                        onValueChange={(value) => setData('language', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {languages.map((language) => (
                                                <SelectItem key={language.value} value={language.value}>
                                                    {language.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.language && <p className="text-red-500 text-sm">{errors.language}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="book_type">Book Type *</Label>
                                    <Select
                                        value={data.book_type}
                                        onValueChange={(value) => setData('book_type', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {bookTypes.map((type) => (
                                                <SelectItem key={type.value} value={type.value}>
                                                    {type.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.book_type && <p className="text-red-500 text-sm">{errors.book_type}</p>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Acquisition & Location</CardTitle>
                            <CardDescription>
                                Information about how the book was acquired and where it's stored
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="acquisition_date">Acquisition Date</Label>
                                    <Input
                                        id="acquisition_date"
                                        type="date"
                                        value={data.acquisition_date}
                                        onChange={(e) => setData('acquisition_date', e.target.value)}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="cost">Cost (TZS)</Label>
                                    <Input
                                        id="cost"
                                        type="number"
                                        value={data.cost}
                                        onChange={(e) => setData('cost', e.target.value)}
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="supplier">Supplier</Label>
                                    <Input
                                        id="supplier"
                                        value={data.supplier}
                                        onChange={(e) => setData('supplier', e.target.value)}
                                        placeholder="Enter supplier name"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="shelf_location">Shelf Location</Label>
                                    <Input
                                        id="shelf_location"
                                        value={data.shelf_location}
                                        onChange={(e) => setData('shelf_location', e.target.value)}
                                        placeholder="e.g., SCI-01-A"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Cover Image & Description</CardTitle>
                            <CardDescription>
                                Upload a cover image and add description
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="cover_image">Cover Image</Label>
                                    <div className="mt-2">
                                        <Input
                                            id="cover_image"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                        />
                                        {previewImage && (
                                            <div className="mt-2">
                                                <img
                                                    src={previewImage}
                                                    alt="Cover preview"
                                                    className="w-32 h-40 object-cover rounded border"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="copies_count">Number of Copies *</Label>
                                    <Input
                                        id="copies_count"
                                        type="number"
                                        value={data.copies_count}
                                        onChange={(e) => setData('copies_count', parseInt(e.target.value) || 1)}
                                        placeholder="1"
                                        min="1"
                                        max="100"
                                        className={errors.copies_count ? 'border-red-500' : ''}
                                    />
                                    {errors.copies_count && <p className="text-red-500 text-sm">{errors.copies_count}</p>}
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Enter book description..."
                                    rows={4}
                                />
                            </div>

                            <div>
                                <Label>Keywords</Label>
                                <div className="mt-2">
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {data.keywords.map((keyword) => (
                                            <Badge key={keyword} variant="outline" className="cursor-pointer">
                                                {keyword}
                                                <button
                                                    type="button"
                                                    onClick={() => handleKeywordRemove(keyword)}
                                                    className="ml-1 text-red-500"
                                                >
                                                    ×
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                    <Input
                                        placeholder="Add keyword and press Enter"
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleKeywordAdd(e.currentTarget.value);
                                                e.currentTarget.value = '';
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Book Summary</CardTitle>
                            <CardDescription>
                                Review the book information before adding
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <div className="text-sm font-medium text-gray-600">Book Details</div>
                                        <div className="text-lg font-semibold">{data.title || 'No title'}</div>
                                        <div className="text-sm text-gray-500">by {data.author || 'No author'}</div>
                                        {data.publisher && (
                                            <div className="text-sm text-gray-500">
                                                {data.publisher} • {data.publication_year}
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <div className="text-sm font-medium text-gray-600">Classification</div>
                                        <div className="space-y-2">
                                            {data.subject_category && (
                                                <Badge className={getCategoryColor(data.subject_category)}>
                                                    {data.subject_category.replace('_', ' ')}
                                                </Badge>
                                            )}
                                            {data.target_audience && (
                                                <Badge variant="outline">
                                                    {data.target_audience.replace('_', ' ')}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 bg-blue-50 rounded-lg">
                                        <div className="text-sm font-medium text-blue-600">Copies</div>
                                        <div className="text-lg font-semibold text-blue-600">
                                            {data.copies_count} copies
                                        </div>
                                    </div>
                                    <div className="p-4 bg-green-50 rounded-lg">
                                        <div className="text-sm font-medium text-green-600">Location</div>
                                        <div className="text-lg font-semibold text-green-600">
                                            {data.shelf_location || 'Not set'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end space-x-4">
                        <Button type="button" variant="outline">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            <Save className="w-4 h-4 mr-2" />
                            {processing ? 'Adding...' : 'Add Book'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}



