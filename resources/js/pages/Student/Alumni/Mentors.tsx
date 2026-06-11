import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { GraduationCap, Mail, Phone, MapPin, Briefcase, Heart, MessageSquare, ArrowLeft } from 'lucide-react';

interface Alumni {
    id: number;
    current_name: string;
    email: string;
    phone: string;
    graduation_year: number;
    final_class: string;
    occupation: string;
    employer: string;
    industry: string;
    city: string;
    country: string;
    is_mentor: boolean;
    mentor_areas: string[] | null;
    is_volunteer: boolean;
    privacy_level: string;
    student: {
        name: string;
    };
}

interface Props {
    mentors: {
        data: Alumni[];
        links: any[];
        meta: any;
    };
}

export default function AlumniMentors({ mentors }: Props) {
    const [searchTerm, setSearchTerm] = useState<string>('');

    const filteredMentors = mentors.data.filter(mentor => {
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        const areasString = Array.isArray(mentor.mentor_areas) ? mentor.mentor_areas.join(' ').toLowerCase() : '';
        return (
            mentor.current_name.toLowerCase().includes(searchLower) ||
            mentor.occupation?.toLowerCase().includes(searchLower) ||
            mentor.employer?.toLowerCase().includes(searchLower) ||
            areasString.includes(searchLower)
        );
    });

    return (
        <AppLayout>
            <Head title="Alumni Mentors Directory" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                <div className="flex justify-between items-center">
                    <div>
                        <div className="flex items-center space-x-2">
                            <Link href="/students/alumni">
                                <Button variant="ghost" size="sm" className="p-0 h-8 w-8 rounded-full">
                                    <ArrowLeft className="w-4 h-4" />
                                </Button>
                            </Link>
                            <h1 className="text-3xl font-bold text-gray-900">Alumni Mentors</h1>
                        </div>
                        <p className="text-gray-600 ml-10">Alumni offering mentoring and career guidance to students</p>
                    </div>
                </div>

                <div className="flex justify-between items-center bg-white p-4 rounded-lg border shadow-sm">
                    <div className="flex-1 max-w-md">
                        <Input
                            placeholder="Search mentors by name, occupation, or expertise..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="text-sm text-gray-500 font-medium ml-4">
                        Showing {filteredMentors.length} of {mentors.data.length} mentors
                    </div>
                </div>

                {filteredMentors.length === 0 ? (
                    <Card className="p-8 text-center text-gray-500">
                        No mentors found matching your search.
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredMentors.map((mentor) => (
                            <Card key={mentor.id} className="hover:shadow-md transition-all flex flex-col justify-between border-l-4 border-l-red-500">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-lg font-bold text-gray-900">{mentor.current_name}</CardTitle>
                                            <CardDescription className="flex items-center mt-1">
                                                <GraduationCap className="w-3.5 h-3.5 mr-1 text-gray-500" />
                                                Class of {mentor.graduation_year} ({mentor.final_class})
                                            </CardDescription>
                                        </div>
                                        <Badge variant="secondary" className="bg-red-50 text-red-700 border-red-100">
                                            Mentor
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4 pt-0 flex-1 flex flex-col justify-between">
                                    <div className="space-y-3">
                                        {/* Occupation */}
                                        {mentor.occupation && (
                                            <div className="flex items-start text-sm">
                                                <Briefcase className="w-4 h-4 mr-2 text-gray-500 mt-0.5" />
                                                <div>
                                                    <span className="font-medium text-gray-800">{mentor.occupation}</span>
                                                    {mentor.employer && (
                                                        <span className="text-gray-500"> at {mentor.employer}</span>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Address/Location */}
                                        {(mentor.city || mentor.country) && (
                                            <div className="flex items-center text-sm text-gray-500">
                                                <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                                                <span>
                                                    {[mentor.city, mentor.country].filter(Boolean).join(', ')}
                                                </span>
                                            </div>
                                        )}

                                        {/* Contacts - public or alumni_only level */}
                                        {mentor.privacy_level !== 'private' && (
                                            <div className="border-t pt-3 space-y-1.5">
                                                {mentor.email && (
                                                    <div className="flex items-center text-xs text-gray-600">
                                                        <Mail className="w-3.5 h-3.5 mr-2 text-gray-400" />
                                                        <a href={`mailto:${mentor.email}`} className="hover:underline">{mentor.email}</a>
                                                    </div>
                                                )}
                                                {mentor.phone && (
                                                    <div className="flex items-center text-xs text-gray-600">
                                                        <Phone className="w-3.5 h-3.5 mr-2 text-gray-400" />
                                                        <a href={`tel:${mentor.phone}`} className="hover:underline">{mentor.phone}</a>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Mentor Areas */}
                                        {Array.isArray(mentor.mentor_areas) && mentor.mentor_areas.length > 0 && (
                                            <div className="border-t pt-3">
                                                <span className="text-xs font-semibold text-gray-500 block mb-1.5">Areas of Mentorship</span>
                                                <div className="flex flex-wrap gap-1">
                                                    {mentor.mentor_areas.map((area, idx) => (
                                                        <Badge key={idx} variant="outline" className="text-xs bg-gray-50 text-gray-600 font-medium">
                                                            {area}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-4 flex gap-2">
                                        <Link href={`/students/alumni/${mentor.id}`} className="w-full">
                                            <Button variant="outline" size="sm" className="w-full">
                                                View Profile
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
