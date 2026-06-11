import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Upload, Trash2, Save, User, Phone, Mail, MapPin, Calendar, GraduationCap } from 'lucide-react';

interface SalaryStructure {
    id: number;
    name: string;
    basic_salary: number;
}

interface Props {
    salaryStructures: SalaryStructure[];
}

export default function CreateStaff({ salaryStructures }: Props) {
    const [qualifications, setQualifications] = useState<Array<{
        qualification_type: string;
        institution_name: string;
        qualification_title: string;
        field_of_study: string;
        year_completed: string;
        grade_classification: string;
    }>>([]);

    const [documents, setDocuments] = useState<Array<{
        document_type: string;
        document_name: string;
        file: File | null;
    }>>([]);

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        phone: '',
        role: '',
        employee_id: '',
        date_of_birth: '',
        gender: '',
        address: '',
        tsc_number: '',
        designation: '',
        date_of_joining: '',
        is_teaching_staff: false,
        salary_structure_id: '',
        qualifications: qualifications,
        documents: documents,
    });

    const qualificationTypes = [
        { value: 'degree', label: 'Degree' },
        { value: 'diploma', label: 'Diploma' },
        { value: 'certificate', label: 'Certificate' },
        { value: 'professional', label: 'Professional' },
        { value: 'training', label: 'Training' },
    ];

    const documentTypes = [
        { value: 'cv', label: 'CV/Resume' },
        { value: 'contract', label: 'Employment Contract' },
        { value: 'id_copy', label: 'ID Copy' },
        { value: 'certificate', label: 'Academic Certificate' },
        { value: 'tsc_certificate', label: 'TSC Certificate' },
        { value: 'crb_clearance', label: 'CRB Clearance' },
        { value: 'medical_certificate', label: 'Medical Certificate' },
        { value: 'reference_letter', label: 'Reference Letter' },
    ];

    const addQualification = () => {
        setQualifications([...qualifications, {
            qualification_type: '',
            institution_name: '',
            qualification_title: '',
            field_of_study: '',
            year_completed: '',
            grade_classification: '',
        }]);
    };

    const removeQualification = (index: number) => {
        setQualifications(qualifications.filter((_, i) => i !== index));
    };

    const updateQualification = (index: number, field: string, value: string) => {
        const updated = [...qualifications];
        updated[index] = { ...updated[index], [field]: value };
        setQualifications(updated);
        setData('qualifications', updated);
    };

    const addDocument = () => {
        setDocuments([...documents, {
            document_type: '',
            document_name: '',
            file: null,
        }]);
    };

    const removeDocument = (index: number) => {
        setDocuments(documents.filter((_, i) => i !== index));
    };

    const updateDocument = (index: number, field: string, value: any) => {
        const updated = [...documents];
        updated[index] = { ...updated[index], [field]: value };
        setDocuments(updated);
        setData('documents', updated);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setData('qualifications', qualifications);
        setData('documents', documents);
        post('/hr/staff');
    };

    return (
        <AppLayout>
            <Head title="Add New Staff Member" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Add New Staff Member</h1>
                    <p className="text-gray-600">Create a new staff member profile</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                            <CardDescription>
                                Basic personal details of the staff member
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Enter full name"
                                        className={errors.name ? 'border-red-500' : ''}
                                    />
                                    {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="email@example.com"
                                        className={errors.email ? 'border-red-500' : ''}
                                    />
                                    {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input
                                        id="phone"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        placeholder="+255 XXX XXX XXX"
                                        className={errors.phone ? 'border-red-500' : ''}
                                    />
                                    {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="date_of_birth">Date of Birth</Label>
                                    <Input
                                        id="date_of_birth"
                                        type="date"
                                        value={data.date_of_birth}
                                        onChange={(e) => setData('date_of_birth', e.target.value)}
                                        className={errors.date_of_birth ? 'border-red-500' : ''}
                                    />
                                    {errors.date_of_birth && <p className="text-red-500 text-sm">{errors.date_of_birth}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="gender">Gender</Label>
                                    <Select
                                        value={data.gender}
                                        onValueChange={(value) => setData('gender', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select gender" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="male">Male</SelectItem>
                                            <SelectItem value="female">Female</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.gender && <p className="text-red-500 text-sm">{errors.gender}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="role">Role</Label>
                                    <Select
                                        value={data.role}
                                        onValueChange={(value) => setData('role', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="teacher">Teacher</SelectItem>
                                            <SelectItem value="headteacher">Headteacher</SelectItem>
                                            <SelectItem value="bursar">Bursar</SelectItem>
                                            <SelectItem value="librarian">Librarian</SelectItem>
                                            <SelectItem value="dormitory_manager">Dormitory Manager</SelectItem>
                                            <SelectItem value="academic_master">Academic Master</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.role && <p className="text-red-500 text-sm">{errors.role}</p>}
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="address">Address</Label>
                                <Textarea
                                    id="address"
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    placeholder="Enter full address"
                                    rows={3}
                                    className={errors.address ? 'border-red-500' : ''}
                                />
                                {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Employment Information</CardTitle>
                            <CardDescription>
                                Employment details and job information
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="employee_id">Employee ID</Label>
                                    <Input
                                        id="employee_id"
                                        value={data.employee_id}
                                        onChange={(e) => setData('employee_id', e.target.value)}
                                        placeholder="Auto-generated if empty"
                                        className={errors.employee_id ? 'border-red-500' : ''}
                                    />
                                    {errors.employee_id && <p className="text-red-500 text-sm">{errors.employee_id}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="designation">Designation</Label>
                                    <Input
                                        id="designation"
                                        value={data.designation}
                                        onChange={(e) => setData('designation', e.target.value)}
                                        placeholder="e.g., Mathematics Teacher"
                                        className={errors.designation ? 'border-red-500' : ''}
                                    />
                                    {errors.designation && <p className="text-red-500 text-sm">{errors.designation}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="tsc_number">TSC Number (For Teachers)</Label>
                                    <Input
                                        id="tsc_number"
                                        value={data.tsc_number}
                                        onChange={(e) => setData('tsc_number', e.target.value)}
                                        placeholder="TSC registration number"
                                        className={errors.tsc_number ? 'border-red-500' : ''}
                                    />
                                    {errors.tsc_number && <p className="text-red-500 text-sm">{errors.tsc_number}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="date_of_joining">Date of Joining</Label>
                                    <Input
                                        id="date_of_joining"
                                        type="date"
                                        value={data.date_of_joining}
                                        onChange={(e) => setData('date_of_joining', e.target.value)}
                                        className={errors.date_of_joining ? 'border-red-500' : ''}
                                    />
                                    {errors.date_of_joining && <p className="text-red-500 text-sm">{errors.date_of_joining}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="salary_structure_id">Salary Structure</Label>
                                    <Select
                                        value={data.salary_structure_id}
                                        onValueChange={(value) => setData('salary_structure_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select salary structure" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {salaryStructures.map((structure) => (
                                                <SelectItem key={structure.id} value={structure.id.toString()}>
                                                    {structure.name} - TZS {structure.basic_salary.toLocaleString()}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.salary_structure_id && <p className="text-red-500 text-sm">{errors.salary_structure_id}</p>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>Qualifications</CardTitle>
                                    <CardDescription>
                                        Academic and professional qualifications
                                    </CardDescription>
                                </div>
                                <Button type="button" onClick={addQualification} variant="outline">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Qualification
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {qualifications.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <GraduationCap className="w-12 h-12 mx-auto mb-4" />
                                    <p>No qualifications added yet. Click "Add Qualification" to get started.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {qualifications.map((qual, index) => (
                                        <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                                            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div>
                                                    <Label>Qualification Type</Label>
                                                    <Select
                                                        value={qual.qualification_type}
                                                        onValueChange={(value) => updateQualification(index, 'qualification_type', value)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select type" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {qualificationTypes.map((type) => (
                                                                <SelectItem key={type.value} value={type.value}>
                                                                    {type.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div>
                                                    <Label>Institution</Label>
                                                    <Input
                                                        value={qual.institution_name}
                                                        onChange={(e) => updateQualification(index, 'institution_name', e.target.value)}
                                                        placeholder="Institution name"
                                                    />
                                                </div>

                                                <div>
                                                    <Label>Qualification Title</Label>
                                                    <Input
                                                        value={qual.qualification_title}
                                                        onChange={(e) => updateQualification(index, 'qualification_title', e.target.value)}
                                                        placeholder="e.g., Bachelor of Education"
                                                    />
                                                </div>

                                                <div>
                                                    <Label>Field of Study</Label>
                                                    <Input
                                                        value={qual.field_of_study}
                                                        onChange={(e) => updateQualification(index, 'field_of_study', e.target.value)}
                                                        placeholder="e.g., Mathematics"
                                                    />
                                                </div>

                                                <div>
                                                    <Label>Year Completed</Label>
                                                    <Input
                                                        type="number"
                                                        value={qual.year_completed}
                                                        onChange={(e) => updateQualification(index, 'year_completed', e.target.value)}
                                                        placeholder="2020"
                                                    />
                                                </div>

                                                <div>
                                                    <Label>Grade/Classification</Label>
                                                    <Input
                                                        value={qual.grade_classification}
                                                        onChange={(e) => updateQualification(index, 'grade_classification', e.target.value)}
                                                        placeholder="e.g., First Class"
                                                    />
                                                </div>
                                            </div>

                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => removeQualification(index)}
                                                className="text-red-600"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>Documents</CardTitle>
                                    <CardDescription>
                                        Upload required documents
                                    </CardDescription>
                                </div>
                                <Button type="button" onClick={addDocument} variant="outline">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Document
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {documents.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <Upload className="w-12 h-12 mx-auto mb-4" />
                                    <p>No documents added yet. Click "Add Document" to get started.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {documents.map((doc, index) => (
                                        <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <Label>Document Type</Label>
                                                    <Select
                                                        value={doc.document_type}
                                                        onValueChange={(value) => updateDocument(index, 'document_type', value)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select document type" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {documentTypes.map((type) => (
                                                                <SelectItem key={type.value} value={type.value}>
                                                                    {type.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div>
                                                    <Label>Document Name</Label>
                                                    <Input
                                                        value={doc.document_name}
                                                        onChange={(e) => updateDocument(index, 'document_name', e.target.value)}
                                                        placeholder="Document name"
                                                    />
                                                </div>

                                                <div className="md:col-span-2">
                                                    <Label>File</Label>
                                                    <Input
                                                        type="file"
                                                        accept=".pdf,.jpg,.jpeg,.png"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) updateDocument(index, 'file', file);
                                                        }}
                                                        className="cursor-pointer"
                                                    />
                                                </div>
                                            </div>

                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => removeDocument(index)}
                                                className="text-red-600"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="flex justify-end space-x-4">
                        <Button type="button" variant="outline">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            <Save className="w-4 h-4 mr-2" />
                            {processing ? 'Creating...' : 'Create Staff Member'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}



