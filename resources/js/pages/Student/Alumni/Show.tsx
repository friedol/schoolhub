import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    GraduationCap, Mail, Phone, MapPin, Briefcase, Heart, 
    MessageSquare, ArrowLeft, Edit, Calendar, Info, 
    Linkedin, Facebook, Twitter, Instagram, Bookmark
} from 'lucide-react';

interface Alumni {
    id: number;
    student_id: number;
    graduation_id: number;
    graduation_year: number;
    final_class: string;
    current_name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    city: string | null;
    country: string | null;
    occupation: string | null;
    employer: string | null;
    industry: string | null;
    higher_education_institution: string | null;
    higher_education_degree: string | null;
    higher_education_year: number | null;
    social_media_linkedin: string | null;
    social_media_facebook: string | null;
    social_media_twitter: string | null;
    social_media_instagram: string | null;
    is_mentor: boolean;
    mentor_areas: string[] | null;
    is_volunteer: boolean;
    volunteer_areas: string[] | null;
    newsletter_subscription: boolean;
    event_notifications: boolean;
    privacy_level: string;
    last_contact_date: string | null;
    notes: string | null;
    student: {
        name: string;
    };
    graduation: {
        certificate_number: string;
        final_class?: {
            name: string;
        };
    };
}

interface Props {
    alumni: Alumni;
}

export default function AlumniShow({ alumni }: Props) {
    const getPrivacyBadge = (level: string) => {
        switch (level) {
            case 'public':
                return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Public Profile</Badge>;
            case 'alumni_only':
                return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Alumni Only</Badge>;
            case 'private':
                return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">Private Profile</Badge>;
            default:
                return <Badge>{level}</Badge>;
        }
    };

    return (
        <AppLayout>
            <Head title={`Alumni Profile - ${alumni.current_name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <Link href="/students/alumni">
                            <Button variant="ghost" size="sm" className="p-0 h-8 w-8 rounded-full">
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{alumni.current_name}</h1>
                            <div className="flex items-center space-x-2 mt-1">
                                <span className="text-gray-500 text-sm">Alumni ID: #{alumni.id}</span>
                                <span className="text-gray-300">•</span>
                                {getPrivacyBadge(alumni.privacy_level)}
                            </div>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <Link href={`/student/alumni/${alumni.id}/edit`}>
                            <Button className="bg-blue-600 hover:bg-blue-700">
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Profile
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Personal info & Quick stats */}
                    <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                        <Card className="hover:shadow-md transition-shadow">
                            <CardHeader className="text-center pb-4 border-b">
                                <div className="mx-auto w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3">
                                    <GraduationCap className="w-10 h-10" />
                                </div>
                                <CardTitle className="text-xl font-bold">{alumni.current_name}</CardTitle>
                                <CardDescription className="text-sm">
                                    Class of {alumni.graduation_year} ({alumni.final_class})
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-4">
                                <div className="space-y-3">
                                    {/* Email */}
                                    <div className="flex items-start text-sm">
                                        <Mail className="w-4 h-4 mr-3 text-gray-400 mt-0.5" />
                                        <div>
                                            <span className="text-gray-500 block text-xs">Email Address</span>
                                            {alumni.email ? (
                                                <a href={`mailto:${alumni.email}`} className="text-blue-600 hover:underline">{alumni.email}</a>
                                            ) : (
                                                <span className="text-gray-400 italic">Not specified</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Phone */}
                                    <div className="flex items-start text-sm">
                                        <Phone className="w-4 h-4 mr-3 text-gray-400 mt-0.5" />
                                        <div>
                                            <span className="text-gray-500 block text-xs">Phone Number</span>
                                            {alumni.phone ? (
                                                <a href={`tel:${alumni.phone}`} className="text-gray-800 hover:underline">{alumni.phone}</a>
                                            ) : (
                                                <span className="text-gray-400 italic">Not specified</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Location */}
                                    <div className="flex items-start text-sm">
                                        <MapPin className="w-4 h-4 mr-3 text-gray-400 mt-0.5" />
                                        <div>
                                            <span className="text-gray-500 block text-xs">Location</span>
                                            {alumni.address || alumni.city || alumni.country ? (
                                                <span className="text-gray-800">
                                                    {[alumni.address, alumni.city, alumni.country].filter(Boolean).join(', ')}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 italic">Not specified</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Social Links */}
                                <div className="border-t pt-4">
                                    <span className="text-xs font-semibold text-gray-500 block mb-2">Social Media Profiles</span>
                                    <div className="flex space-x-3">
                                        {alumni.social_media_linkedin && (
                                            <a href={alumni.social_media_linkedin} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-50 hover:bg-blue-50 text-gray-500 hover:text-blue-600 rounded-full transition-colors">
                                                <Linkedin className="w-5 h-5" />
                                            </a>
                                        )}
                                        {alumni.social_media_facebook && (
                                            <a href={alumni.social_media_facebook} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-50 hover:bg-blue-50 text-gray-500 hover:text-blue-600 rounded-full transition-colors">
                                                <Facebook className="w-5 h-5" />
                                            </a>
                                        )}
                                        {alumni.social_media_twitter && (
                                            <a href={alumni.social_media_twitter} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-50 hover:bg-blue-50 text-gray-500 hover:text-blue-600 rounded-full transition-colors">
                                                <Twitter className="w-5 h-5" />
                                            </a>
                                        )}
                                        {alumni.social_media_instagram && (
                                            <a href={alumni.social_media_instagram} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-50 hover:bg-blue-50 text-gray-500 hover:text-blue-600 rounded-full transition-colors">
                                                <Instagram className="w-5 h-5" />
                                            </a>
                                        )}
                                        {!alumni.social_media_linkedin && !alumni.social_media_facebook && !alumni.social_media_twitter && !alumni.social_media_instagram && (
                                            <span className="text-sm text-gray-400 italic">No social links added</span>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Engagement Status */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-gray-500">Network Engagement</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between items-center border-b pb-2">
                                    <span className="text-sm font-medium text-gray-600">Mentorship Status</span>
                                    {alumni.is_mentor ? (
                                        <Badge className="bg-red-50 text-red-700 border-red-100 hover:bg-red-100">Active Mentor</Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-gray-400">Not Mentoring</Badge>
                                    )}
                                </div>
                                <div className="flex justify-between items-center border-b pb-2">
                                    <span className="text-sm font-medium text-gray-600">Volunteer Status</span>
                                    {alumni.is_volunteer ? (
                                        <Badge className="bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100">Active Volunteer</Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-gray-400">Not Volunteering</Badge>
                                    )}
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-600">Newsletter Status</span>
                                    {alumni.newsletter_subscription ? (
                                        <Badge className="bg-green-50 text-green-700 border-green-100 hover:bg-green-100">Subscribed</Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-gray-400">Unsubscribed</Badge>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Columns: Education, Career and Notes */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Graduation & Education details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg font-bold flex items-center gap-2">
                                    <GraduationCap className="w-5 h-5 text-blue-600" />
                                    School Graduation details
                                </CardTitle>
                                <CardDescription>Official graduation credentials and records</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-gray-500 text-xs block">Student Name (During Enrollment)</span>
                                        <span className="text-sm font-semibold text-gray-800">{alumni.student.name}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 text-xs block">Certificate Number</span>
                                        <span className="text-sm font-semibold text-gray-800">{alumni.graduation.certificate_number}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 text-xs block">Graduation Year</span>
                                        <span className="text-sm font-semibold text-gray-800">{alumni.graduation_year}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 text-xs block">Final Stream / Class</span>
                                        <span className="text-sm font-semibold text-gray-800">{alumni.final_class}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Professional & Higher Education Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg font-bold flex items-center gap-2">
                                    <Briefcase className="w-5 h-5 text-green-600" />
                                    Professional & Higher Education
                                </CardTitle>
                                <CardDescription>Current professional status and higher education milestones</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Career details */}
                                <div className="space-y-3">
                                    <h4 className="text-sm font-bold text-gray-800 border-b pb-1">Current Employment</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <span className="text-gray-500 text-xs block">Job Title / Occupation</span>
                                            <span className="text-sm font-semibold text-gray-800">{alumni.occupation || 'Not specified'}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 text-xs block">Employer / Company</span>
                                            <span className="text-sm font-semibold text-gray-800">{alumni.employer || 'Not specified'}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 text-xs block">Industry</span>
                                            <span className="text-sm font-semibold text-gray-800">{alumni.industry || 'Not specified'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Higher Ed details */}
                                <div className="space-y-3 pt-2">
                                    <h4 className="text-sm font-bold text-gray-800 border-b pb-1">Higher Education</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <span className="text-gray-500 text-xs block">Institution</span>
                                            <span className="text-sm font-semibold text-gray-800">{alumni.higher_education_institution || 'Not specified'}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 text-xs block">Degree / Course</span>
                                            <span className="text-sm font-semibold text-gray-800">{alumni.higher_education_degree || 'Not specified'}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 text-xs block">Graduation Year</span>
                                            <span className="text-sm font-semibold text-gray-800">{alumni.higher_education_year || 'Not specified'}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Mentoring & Volunteering specifications */}
                        {(alumni.is_mentor || alumni.is_volunteer) && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                                        <Heart className="w-5 h-5 text-red-600" />
                                        Contributions & Services
                                    </CardTitle>
                                    <CardDescription>Mentorship domains and volunteer activity areas</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {alumni.is_mentor && Array.isArray(alumni.mentor_areas) && alumni.mentor_areas.length > 0 && (
                                        <div>
                                            <span className="text-sm font-bold text-gray-700 block mb-2">Mentor Expertise Domains</span>
                                            <div className="flex flex-wrap gap-1.5">
                                                {alumni.mentor_areas.map((area, idx) => (
                                                    <Badge key={idx} variant="secondary" className="bg-red-50 text-red-700 border border-red-100">
                                                        {area}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {alumni.is_volunteer && Array.isArray(alumni.volunteer_areas) && alumni.volunteer_areas.length > 0 && (
                                        <div className="border-t pt-4">
                                            <span className="text-sm font-bold text-gray-700 block mb-2">Volunteer Support Areas</span>
                                            <div className="flex flex-wrap gap-1.5">
                                                {alumni.volunteer_areas.map((area, idx) => (
                                                    <Badge key={idx} variant="secondary" className="bg-indigo-50 text-indigo-700 border border-indigo-100">
                                                        {area}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Internal Admin Notes */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg font-bold flex items-center gap-2">
                                    <Bookmark className="w-5 h-5 text-amber-600" />
                                    Internal Admin Notes
                                </CardTitle>
                                <CardDescription>Private records and notes regarding alumni relations</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {alumni.notes ? (
                                    <div className="p-4 bg-amber-50 rounded-lg border border-amber-100 text-sm text-gray-700 whitespace-pre-line">
                                        {alumni.notes}
                                    </div>
                                ) : (
                                    <div className="text-center py-6 text-gray-400 text-sm italic">
                                        No internal notes have been recorded for this profile yet.
                                    </div>
                                )}
                                {alumni.last_contact_date && (
                                    <div className="flex items-center text-xs text-gray-500 pt-2 border-t">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        <span>Last contact recorded on: {new Date(alumni.last_contact_date).toLocaleDateString()}</span>
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
