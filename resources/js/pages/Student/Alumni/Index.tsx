import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { GraduationCap, Users, Mail, Phone, MapPin, Briefcase, Heart, MessageSquare, Eye, Edit, Filter } from 'lucide-react';
import { StatCard, StatGrid } from '@/components/ui/stat-card';

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
    is_volunteer: boolean;
    newsletter_subscription: boolean;
    privacy_level: string;
    last_contact_date: string;
    student: {
        name: string;
    };
    graduation: {
        certificate_number: string;
    };
}

interface Props {
    alumni: {
        data: Alumni[];
        links: any[];
        meta: any;
    };
    graduationYears: number[];
    finalClasses: string[];
}

export default function AlumniIndex({ alumni, graduationYears, finalClasses }: Props) {
    const [graduationYearFilter, setGraduationYearFilter] = useState<string>('all');
    const [finalClassFilter, setFinalClassFilter] = useState<string>('all');
    const [occupationFilter, setOccupationFilter] = useState<string>('');
    const [mentorFilter, setMentorFilter] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState<string>('');

    const getPrivacyColor = (level: string) => {
        switch (level) {
            case 'public':
                return 'bg-green-100 text-green-800';
            case 'alumni_only':
                return 'bg-blue-100 text-blue-800';
            case 'private':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const filteredAlumni = alumni.data.filter(alumnus => {
        if (graduationYearFilter && graduationYearFilter !== 'all' && alumnus.graduation_year.toString() !== graduationYearFilter) return false;
        if (finalClassFilter && finalClassFilter !== 'all' && alumnus.final_class !== finalClassFilter) return false;
        if (occupationFilter && !alumnus.occupation?.toLowerCase().includes(occupationFilter.toLowerCase())) return false;
        if (mentorFilter && mentorFilter !== 'all') {
            const isMentor = alumnus.is_mentor;
            if (mentorFilter === 'true' && !isMentor) return false;
            if (mentorFilter === 'false' && isMentor) return false;
        }
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            return (
                alumnus.current_name.toLowerCase().includes(searchLower) ||
                alumnus.email?.toLowerCase().includes(searchLower) ||
                alumnus.occupation?.toLowerCase().includes(searchLower) ||
                alumnus.employer?.toLowerCase().includes(searchLower)
            );
        }
        return true;
    });

    const stats = {
        total: alumni.data.length,
        mentors: alumni.data.filter(a => a.is_mentor).length,
        volunteers: alumni.data.filter(a => a.is_volunteer).length,
        newsletterSubscribers: alumni.data.filter(a => a.newsletter_subscription).length,
    };

    return (
        <AppLayout>
            <Head title="Alumni Management" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Alumni Management</h1>
                        <p className="text-gray-600">Manage alumni network and engagement</p>
                    </div>
                    <div className="flex space-x-2">
                        <Link href="/student/alumni/statistics">
                            <Button variant="outline">
                                <Users className="w-4 h-4 mr-2" />
                                Statistics
                            </Button>
                        </Link>
                        <Link href="/student/alumni/mentors">
                            <Button variant="outline">
                                <Heart className="w-4 h-4 mr-2" />
                                Mentors
                            </Button>
                        </Link>
                        <Link href="/student/alumni/newsletter">
                            <Button>
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Send Newsletter
                            </Button>
                        </Link>
                    </div>
                </div>

                <StatGrid cols={4}>
                    <StatCard
                        title="Total Alumni"
                        value={stats.total}
                        icon={GraduationCap}
                        color="blue"
                        trend="stable"
                        trendLabel="Total"
                        subtitle="All alumni members"
                    />
                    <StatCard
                        title="Mentors"
                        value={stats.mentors}
                        icon={Heart}
                        color="red"
                        trend="stable"
                        trendLabel="Mentors"
                        subtitle="Available mentors"
                    />
                    <StatCard
                        title="Volunteers"
                        value={stats.volunteers}
                        icon={Users}
                        color="indigo"
                        trend="stable"
                        trendLabel="Volunteers"
                        subtitle="Active volunteers"
                    />
                    <StatCard
                        title="Newsletter"
                        value={stats.newsletterSubscribers}
                        icon={MessageSquare}
                        color="green"
                        trend="stable"
                        trendLabel="Newsletter"
                        subtitle="Newsletter subscribers"
                    />
                </StatGrid>

                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>Alumni Directory</CardTitle>
                                <CardDescription>
                                    Search and filter alumni members
                                </CardDescription>
                            </div>
                            <div className="flex space-x-4">
                                <Input
                                    placeholder="Search alumni..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-64"
                                />
                                 <Select value={graduationYearFilter} onValueChange={setGraduationYearFilter}>
                                    <SelectTrigger className="w-32">
                                        <SelectValue placeholder="Year" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Years</SelectItem>
                                        {graduationYears.map((year) => (
                                            <SelectItem key={year} value={year.toString()}>
                                                {year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select value={finalClassFilter} onValueChange={setFinalClassFilter}>
                                    <SelectTrigger className="w-32">
                                        <SelectValue placeholder="Class" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Classes</SelectItem>
                                        {finalClasses.map((cls) => (
                                            <SelectItem key={cls} value={cls}>
                                                {cls}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select value={mentorFilter} onValueChange={setMentorFilter}>
                                    <SelectTrigger className="w-32">
                                        <SelectValue placeholder="Mentor" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        <SelectItem value="true">Mentors</SelectItem>
                                        <SelectItem value="false">Non-Mentors</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Alumni</TableHead>
                                    <TableHead>Graduation</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Occupation</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Roles</TableHead>
                                    <TableHead>Privacy</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredAlumni.map((alumnus) => (
                                    <TableRow key={alumnus.id}>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{alumnus.current_name}</div>
                                                <div className="text-sm text-gray-500">
                                                    Certificate: {alumnus.graduation.certificate_number}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{alumnus.final_class}</div>
                                                <div className="text-sm text-gray-500">
                                                    {alumnus.graduation_year}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                {alumnus.email && (
                                                    <div className="flex items-center text-sm">
                                                        <Mail className="w-3 h-3 mr-1" />
                                                        {alumnus.email}
                                                    </div>
                                                )}
                                                {alumnus.phone && (
                                                    <div className="flex items-center text-sm text-gray-500">
                                                        <Phone className="w-3 h-3 mr-1" />
                                                        {alumnus.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {alumnus.occupation ? (
                                                <div>
                                                    <div className="font-medium">{alumnus.occupation}</div>
                                                    {alumnus.employer && (
                                                        <div className="text-sm text-gray-500">
                                                            at {alumnus.employer}
                                                        </div>
                                                    )}
                                                    {alumnus.industry && (
                                                        <div className="text-xs text-gray-400">
                                                            {alumnus.industry}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-gray-500">Not specified</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {alumnus.city || alumnus.country ? (
                                                <div className="flex items-center text-sm">
                                                    <MapPin className="w-3 h-3 mr-1" />
                                                    {alumnus.city && alumnus.country 
                                                        ? `${alumnus.city}, ${alumnus.country}`
                                                        : alumnus.city || alumnus.country
                                                    }
                                                </div>
                                            ) : (
                                                <span className="text-gray-500">Not specified</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex space-x-1">
                                                {alumnus.is_mentor && (
                                                    <Badge variant="secondary" className="text-xs">
                                                        <Heart className="w-3 h-3 mr-1" />
                                                        Mentor
                                                    </Badge>
                                                )}
                                                {alumnus.is_volunteer && (
                                                    <Badge variant="outline" className="text-xs">
                                                        <Users className="w-3 h-3 mr-1" />
                                                        Volunteer
                                                    </Badge>
                                                )}
                                                {!alumnus.is_mentor && !alumnus.is_volunteer && (
                                                    <span className="text-gray-500 text-xs">None</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getPrivacyColor(alumnus.privacy_level)}>
                                                {alumnus.privacy_level}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end space-x-2">
                                                <Link href={`/student/alumni/${alumnus.id}`}>
                                                    <Button variant="outline" size="sm">
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                                <Link href={`/student/alumni/${alumnus.id}/edit`}>
                                                    <Button variant="outline" size="sm">
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
