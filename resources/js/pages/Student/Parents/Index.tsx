import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Users, Phone, Mail, Eye, Search, GraduationCap, Heart } from 'lucide-react';
import { StatCard, StatGrid } from '@/components/ui/stat-card';

interface Parent {
    id: number;
    name: string;
    email: string;
    phone: string;
    relationship: string;
    is_active: boolean;
    student: {
        name: string;
        class_name: string;
        section: string;
    };
}

interface Props {
    parents: {
        data: Parent[];
        links: any[];
        meta: any;
    };
    classes: Array<{ id: number; name: string; sections: Array<{ id: number; name: string }> }>;
}

export default function ParentsIndex({ parents, classes }: Props) {
    const [classFilter, setClassFilter] = useState('all');
    const [sectionFilter, setSectionFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [contactModal, setContactModal] = useState(false);
    const [selectedParent, setSelectedParent] = useState<Parent | null>(null);

    const availableSections = classFilter !== 'all' ? (classes.find((c) => c.id.toString() === classFilter)?.sections || []) : [];

    const filteredParents = parents.data.filter((parent) => {
        if (classFilter !== 'all' && parent.student.class_name !== classes.find((c) => c.id.toString() === classFilter)?.name) return false;
        if (sectionFilter !== 'all' && parent.student.section !== availableSections.find((s) => s.id.toString() === sectionFilter)?.name) return false;
        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            return (
                parent.name.toLowerCase().includes(lower) ||
                parent.student.name.toLowerCase().includes(lower) ||
                parent.email.toLowerCase().includes(lower) ||
                parent.phone.includes(searchTerm)
            );
        }
        return true;
    });

    const getRelationshipColor = (relationship: string) => {
        switch (relationship.toLowerCase()) {
            case 'father':
                return 'bg-blue-100 text-blue-800';
            case 'mother':
                return 'bg-pink-100 text-pink-800';
            case 'guardian':
                return 'bg-orange-100 text-orange-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const handleViewContact = (parent: Parent) => {
        setSelectedParent(parent);
        setContactModal(true);
    };

    const stats = {
        total: parents.data.length,
        active: parents.data.filter((p) => p.is_active).length,
        fathers: parents.data.filter((p) => p.relationship.toLowerCase() === 'father').length,
        mothers: parents.data.filter((p) => p.relationship.toLowerCase() === 'mother').length,
    };

    return (
        <AppLayout>
            <Head title="Parent/Guardian Management" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Parent/Guardian Management</h1>
                        <p className="text-gray-600">View and contact parents and guardians of students</p>
                    </div>
                </div>

                <StatGrid cols={4}>
                    <StatCard
                        title="Total Parents"
                        value={stats.total}
                        icon={Users}
                        color="blue"
                        trend="stable"
                        trendLabel="Total"
                        subtitle="Registered contacts"
                    />
                    <StatCard
                        title="Active"
                        value={stats.active}
                        icon={Heart}
                        color="green"
                        trend="stable"
                        trendLabel="Active"
                        subtitle="Active guardians"
                    />
                    <StatCard
                        title="Fathers"
                        value={stats.fathers}
                        icon={Users}
                        color="indigo"
                        trend="stable"
                        trendLabel="Fathers"
                        subtitle="Registered fathers"
                    />
                    <StatCard
                        title="Mothers"
                        value={stats.mothers}
                        icon={Users}
                        color="pink"
                        trend="stable"
                        trendLabel="Mothers"
                        subtitle="Registered mothers"
                    />
                </StatGrid>

                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>Parents & Guardians</CardTitle>
                                <CardDescription>
                                    {filteredParents.length} parent{filteredParents.length !== 1 ? 's' : ''} found
                                </CardDescription>
                            </div>
                            <div className="flex space-x-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                        placeholder="Search parents or students..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-64 pl-9"
                                    />
                                </div>
                                <Select value={classFilter} onValueChange={(v) => { setClassFilter(v); setSectionFilter('all'); }}>
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
                                <Select value={sectionFilter} onValueChange={setSectionFilter} disabled={classFilter === 'all'}>
                                    <SelectTrigger className="w-36">
                                        <SelectValue placeholder="All sections" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Sections</SelectItem>
                                        {availableSections.map((sec) => (
                                            <SelectItem key={sec.id} value={sec.id.toString()}>
                                                {sec.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {filteredParents.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                <p>No parents found matching your filters</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Parent Name</TableHead>
                                        <TableHead>Student</TableHead>
                                        <TableHead>Class</TableHead>
                                        <TableHead>Relationship</TableHead>
                                        <TableHead>Phone</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredParents.map((parent) => (
                                        <TableRow key={parent.id}>
                                            <TableCell>
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium text-gray-600 shrink-0">
                                                        {parent.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="font-medium">{parent.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-1.5">
                                                    <GraduationCap className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm">{parent.student.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <span className="text-sm font-medium">{parent.student.class_name}</span>
                                                    {parent.student.section && (
                                                        <span className="text-xs text-gray-500 ml-1">({parent.student.section})</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={`text-xs ${getRelationshipColor(parent.relationship)}`}>
                                                    {parent.relationship.charAt(0).toUpperCase() + parent.relationship.slice(1)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-1 text-sm">
                                                    <Phone className="w-3 h-3 text-gray-400" />
                                                    <span>{parent.phone}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-1 text-sm text-gray-500">
                                                    <Mail className="w-3 h-3 text-gray-400" />
                                                    <span className="truncate max-w-[160px]">{parent.email}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={parent.is_active ? 'default' : 'secondary'}>
                                                    {parent.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleViewContact(parent)}
                                                >
                                                    <Eye className="w-4 h-4 mr-1" />
                                                    Contact
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Contact Info Modal */}
            <Dialog open={contactModal} onOpenChange={setContactModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Contact Information</DialogTitle>
                        <DialogDescription>
                            Contact details for {selectedParent?.name}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedParent && (
                        <div className="space-y-4 py-2">
                            <div className="flex items-center space-x-4">
                                <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center text-xl font-bold text-gray-600">
                                    {selectedParent.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-lg font-semibold">{selectedParent.name}</p>
                                    <Badge className={`text-xs ${getRelationshipColor(selectedParent.relationship)}`}>
                                        {selectedParent.relationship.charAt(0).toUpperCase() + selectedParent.relationship.slice(1)}
                                    </Badge>
                                </div>
                            </div>

                            <div className="space-y-3 bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center space-x-3">
                                    <Phone className="w-5 h-5 text-green-600" />
                                    <div>
                                        <p className="text-xs text-gray-500">Phone</p>
                                        <a
                                            href={`tel:${selectedParent.phone}`}
                                            className="font-medium text-green-700 hover:underline"
                                        >
                                            {selectedParent.phone}
                                        </a>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Mail className="w-5 h-5 text-blue-600" />
                                    <div>
                                        <p className="text-xs text-gray-500">Email</p>
                                        <a
                                            href={`mailto:${selectedParent.email}`}
                                            className="font-medium text-blue-700 hover:underline"
                                        >
                                            {selectedParent.email}
                                        </a>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-blue-50 rounded-lg p-3">
                                <p className="text-xs text-blue-600 font-medium mb-1">Ward / Student</p>
                                <div className="flex items-center space-x-2">
                                    <GraduationCap className="w-4 h-4 text-blue-500" />
                                    <span className="font-medium text-blue-900">{selectedParent.student.name}</span>
                                    <span className="text-blue-600 text-sm">
                                        — {selectedParent.student.class_name}
                                        {selectedParent.student.section && ` (${selectedParent.student.section})`}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setContactModal(false)}>
                            Close
                        </Button>
                        {selectedParent && (
                            <a href={`tel:${selectedParent.phone}`}>
                                <Button>
                                    <Phone className="w-4 h-4 mr-2" />
                                    Call Now
                                </Button>
                            </a>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
