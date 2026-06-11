import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Eye, Trash2, MessageSquare, Calendar, Filter } from 'lucide-react';

interface Suggestion {
    id: number;
    title: string;
    details: string;
    class_name: string;
    subject_name: string;
    author: {
        name: string;
        role: string;
    };
    created_at: string;
}

interface Props {
    suggestions: {
        data: Suggestion[];
        links: any[];
        meta: any;
    };
    classes: Array<{ id: number; name: string }>;
    subjects: Array<{ id: number; name: string; class_id: number }>;
}

export default function SuggestionsIndex({ suggestions, classes, subjects }: Props) {
    const [classFilter, setClassFilter] = useState('');
    const [subjectFilter, setSubjectFilter] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    const [modalOpen, setModalOpen] = useState(false);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null);

    const [formClass, setFormClass] = useState('');
    const [formSubject, setFormSubject] = useState('');
    const [formTitle, setFormTitle] = useState('');
    const [formDetails, setFormDetails] = useState('');

    const filteredSubjects = subjects.filter(
        (s) => !formClass || s.class_id.toString() === formClass
    );

    const filteredSuggestions = suggestions.data.filter((s) => {
        if (classFilter && s.class_name !== classFilter) return false;
        if (subjectFilter && s.subject_name !== subjectFilter) return false;
        if (dateFrom && new Date(s.created_at) < new Date(dateFrom)) return false;
        if (dateTo && new Date(s.created_at) > new Date(dateTo)) return false;
        return true;
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Form submission handled by Inertia in a real app
        setModalOpen(false);
        setFormClass('');
        setFormSubject('');
        setFormTitle('');
        setFormDetails('');
    };

    const handleView = (suggestion: Suggestion) => {
        setSelectedSuggestion(suggestion);
        setViewModalOpen(true);
    };

    const getRoleColor = (role: string) => {
        switch (role.toLowerCase()) {
            case 'student':
                return 'bg-blue-100 text-blue-800';
            case 'teacher':
                return 'bg-green-100 text-green-800';
            case 'parent':
                return 'bg-orange-100 text-orange-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <AppLayout>
            <Head title="Suggestions & Feedback" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Suggestions & Feedback</h1>
                        <p className="text-gray-600">Collect and manage suggestions from students, teachers, and parents</p>
                    </div>
                    <Button onClick={() => setModalOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Suggestion
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Filter className="w-4 h-4 mr-2" />
                            Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Select value={classFilter} onValueChange={setClassFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All classes" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Classes</SelectItem>
                                    {classes.map((cls) => (
                                        <SelectItem key={cls.id} value={cls.name}>
                                            {cls.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All subjects" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Subjects</SelectItem>
                                    {subjects.map((sub) => (
                                        <SelectItem key={sub.id} value={sub.name}>
                                            {sub.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                                <Input
                                    type="date"
                                    placeholder="From date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                />
                            </div>

                            <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                                <Input
                                    type="date"
                                    placeholder="To date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>Suggestions</CardTitle>
                                <CardDescription>
                                    {filteredSuggestions.length} suggestion{filteredSuggestions.length !== 1 ? 's' : ''} found
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {filteredSuggestions.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                <p>No suggestions found</p>
                                <Button className="mt-4" onClick={() => setModalOpen(true)}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add First Suggestion
                                </Button>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Class</TableHead>
                                        <TableHead>Subject</TableHead>
                                        <TableHead>Author</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredSuggestions.map((suggestion) => (
                                        <TableRow key={suggestion.id}>
                                            <TableCell>
                                                <div className="font-medium">{suggestion.title}</div>
                                                <div className="text-sm text-gray-500 line-clamp-1">
                                                    {suggestion.details}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{suggestion.class_name}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm">{suggestion.subject_name}</span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col space-y-1">
                                                    <span className="text-sm font-medium">{suggestion.author.name}</span>
                                                    <Badge className={`w-fit text-xs ${getRoleColor(suggestion.author.role)}`}>
                                                        {suggestion.author.role}
                                                    </Badge>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm text-gray-600">
                                                    {new Date(suggestion.created_at).toLocaleDateString()}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end space-x-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleView(suggestion)}
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Add Suggestion Modal */}
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Add Suggestion</DialogTitle>
                        <DialogDescription>
                            Submit a new suggestion or feedback for review.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4 py-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="form-class">Class</Label>
                                <Select value={formClass} onValueChange={(v) => { setFormClass(v); setFormSubject(''); }}>
                                    <SelectTrigger id="form-class">
                                        <SelectValue placeholder="Select class" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {classes.map((cls) => (
                                            <SelectItem key={cls.id} value={cls.id.toString()}>
                                                {cls.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="form-subject">Subject</Label>
                                <Select value={formSubject} onValueChange={setFormSubject} disabled={!formClass}>
                                    <SelectTrigger id="form-subject">
                                        <SelectValue placeholder={formClass ? 'Select subject' : 'Select class first'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {filteredSubjects.map((sub) => (
                                            <SelectItem key={sub.id} value={sub.id.toString()}>
                                                {sub.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="form-title">Title</Label>
                                <Input
                                    id="form-title"
                                    placeholder="Enter suggestion title"
                                    value={formTitle}
                                    onChange={(e) => setFormTitle(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="form-details">Suggestion Details</Label>
                                <Textarea
                                    id="form-details"
                                    placeholder="Describe your suggestion in detail..."
                                    value={formDetails}
                                    onChange={(e) => setFormDetails(e.target.value)}
                                    rows={4}
                                    required
                                />
                            </div>
                        </div>
                        <DialogFooter className="mt-4">
                            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">Submit Suggestion</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* View Suggestion Modal */}
            <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{selectedSuggestion?.title}</DialogTitle>
                        <DialogDescription>
                            Submitted by {selectedSuggestion?.author.name} ({selectedSuggestion?.author.role}) on{' '}
                            {selectedSuggestion && new Date(selectedSuggestion.created_at).toLocaleDateString()}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedSuggestion && (
                        <div className="space-y-4 py-2">
                            <div className="flex space-x-4">
                                <div>
                                    <span className="text-xs text-gray-500">Class</span>
                                    <p className="font-medium">{selectedSuggestion.class_name}</p>
                                </div>
                                <div>
                                    <span className="text-xs text-gray-500">Subject</span>
                                    <p className="font-medium">{selectedSuggestion.subject_name}</p>
                                </div>
                            </div>
                            <div>
                                <span className="text-xs text-gray-500">Details</span>
                                <p className="mt-1 text-gray-900 whitespace-pre-wrap">{selectedSuggestion.details}</p>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setViewModalOpen(false)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
