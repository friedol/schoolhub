import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Sparkles, X, Plus } from 'lucide-react';

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
}

interface Props {
    alumni: Alumni;
}

const PREDEFINED_MENTOR_AREAS = [
    'Career Advice', 'Technical Skills', 'Resume Review', 
    'Mock Interviews', 'Entrepreneurship', 'Industry Insights', 
    'Higher Education Guidance', 'Networking Skills', 'Personal Branding'
];

const PREDEFINED_VOLUNTEER_AREAS = [
    'Event Organization', 'Guest Lectures', 'Fundraising', 
    'Alumni Meetups', 'School Celebrations', 'Career Fairs', 
    'Campus Tours', 'Student Activity Support'
];

export default function AlumniEdit({ alumni }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        current_name: alumni.current_name || '',
        email: alumni.email || '',
        phone: alumni.phone || '',
        address: alumni.address || '',
        city: alumni.city || '',
        country: alumni.country || '',
        occupation: alumni.occupation || '',
        employer: alumni.employer || '',
        industry: alumni.industry || '',
        higher_education_institution: alumni.higher_education_institution || '',
        higher_education_degree: alumni.higher_education_degree || '',
        higher_education_year: alumni.higher_education_year || '',
        social_media_linkedin: alumni.social_media_linkedin || '',
        social_media_facebook: alumni.social_media_facebook || '',
        social_media_twitter: alumni.social_media_twitter || '',
        social_media_instagram: alumni.social_media_instagram || '',
        is_mentor: alumni.is_mentor || false,
        mentor_areas: alumni.mentor_areas || [],
        is_volunteer: alumni.is_volunteer || false,
        volunteer_areas: alumni.volunteer_areas || [],
        newsletter_subscription: alumni.newsletter_subscription || false,
        event_notifications: alumni.event_notifications || false,
        privacy_level: alumni.privacy_level || 'public',
        notes: alumni.notes || '',
    });

    const [customMentorArea, setCustomMentorArea] = useState('');
    const [customVolunteerArea, setCustomVolunteerArea] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/student/alumni/${alumni.id}`);
    };

    // Mentorship Area Helpers
    const toggleMentorArea = (area: string) => {
        const current = [...data.mentor_areas];
        const index = current.indexOf(area);
        if (index > -1) {
            current.splice(index, 1);
        } else {
            current.push(area);
        }
        setData('mentor_areas', current);
    };

    const addCustomMentorArea = () => {
        if (customMentorArea.trim() && !data.mentor_areas.includes(customMentorArea.trim())) {
            setData('mentor_areas', [...data.mentor_areas, customMentorArea.trim()]);
            setCustomMentorArea('');
        }
    };

    // Volunteering Area Helpers
    const toggleVolunteerArea = (area: string) => {
        const current = [...data.volunteer_areas];
        const index = current.indexOf(area);
        if (index > -1) {
            current.splice(index, 1);
        } else {
            current.push(area);
        }
        setData('volunteer_areas', current);
    };

    const addCustomVolunteerArea = () => {
        if (customVolunteerArea.trim() && !data.volunteer_areas.includes(customVolunteerArea.trim())) {
            setData('volunteer_areas', [...data.volunteer_areas, customVolunteerArea.trim()]);
            setCustomVolunteerArea('');
        }
    };

    return (
        <AppLayout>
            <Head title={`Edit Alumni Profile - ${alumni.current_name}`} />

            <form onSubmit={handleSubmit} className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <Link href={`/student/alumni/${alumni.id}`}>
                            <Button type="button" variant="ghost" size="sm" className="p-0 h-8 w-8 rounded-full">
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Edit Alumni Profile</h1>
                            <p className="text-gray-600">Update information for {alumni.current_name}</p>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <Button type="submit" disabled={processing} className="bg-blue-600 hover:bg-blue-700">
                            <Save className="w-4 h-4 mr-2" />
                            {processing ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Columns - Contact, Career & Education */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Personal & Contact details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg font-bold">Personal & Contact Details</CardTitle>
                                <CardDescription>Basic contact details and address information</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-600 block">Current Name</label>
                                        <Input
                                            value={data.current_name}
                                            onChange={(e) => setData('current_name', e.target.value)}
                                            required
                                        />
                                        {errors.current_name && <span className="text-xs text-red-500">{errors.current_name}</span>}
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-600 block">Email Address</label>
                                        <Input
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                        />
                                        {errors.email && <span className="text-xs text-red-500">{errors.email}</span>}
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-600 block">Phone Number</label>
                                        <Input
                                            value={data.phone}
                                            onChange={(e) => setData('phone', e.target.value)}
                                        />
                                        {errors.phone && <span className="text-xs text-red-500">{errors.phone}</span>}
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-600 block">City</label>
                                        <Input
                                            value={data.city}
                                            onChange={(e) => setData('city', e.target.value)}
                                        />
                                        {errors.city && <span className="text-xs text-red-500">{errors.city}</span>}
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-600 block">Country</label>
                                        <Input
                                            value={data.country}
                                            onChange={(e) => setData('country', e.target.value)}
                                        />
                                        {errors.country && <span className="text-xs text-red-500">{errors.country}</span>}
                                    </div>
                                    <div className="space-y-1 md:col-span-2">
                                        <label className="text-xs font-semibold text-gray-600 block">Address</label>
                                        <Textarea
                                            value={data.address}
                                            onChange={(e) => setData('address', e.target.value)}
                                            rows={2}
                                        />
                                        {errors.address && <span className="text-xs text-red-500">{errors.address}</span>}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Professional Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg font-bold">Professional Career Information</CardTitle>
                                <CardDescription>Alumni professional status and current job role</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-600 block">Occupation / Title</label>
                                        <Input
                                            value={data.occupation}
                                            onChange={(e) => setData('occupation', e.target.value)}
                                            placeholder="e.g. Software Engineer"
                                        />
                                        {errors.occupation && <span className="text-xs text-red-500">{errors.occupation}</span>}
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-600 block">Employer / Company</label>
                                        <Input
                                            value={data.employer}
                                            onChange={(e) => setData('employer', e.target.value)}
                                            placeholder="e.g. Google"
                                        />
                                        {errors.employer && <span className="text-xs text-red-500">{errors.employer}</span>}
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-600 block">Industry</label>
                                        <Input
                                            value={data.industry}
                                            onChange={(e) => setData('industry', e.target.value)}
                                            placeholder="e.g. Technology"
                                        />
                                        {errors.industry && <span className="text-xs text-red-500">{errors.industry}</span>}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Higher Education */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg font-bold">Higher Education details</CardTitle>
                                <CardDescription>Milestones achieved in tertiary institutions after school graduation</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-600 block">Higher Ed Institution</label>
                                        <Input
                                            value={data.higher_education_institution}
                                            onChange={(e) => setData('higher_education_institution', e.target.value)}
                                            placeholder="e.g. University of Dar es Salaam"
                                        />
                                        {errors.higher_education_institution && <span className="text-xs text-red-500">{errors.higher_education_institution}</span>}
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-600 block">Degree / Course</label>
                                        <Input
                                            value={data.higher_education_degree}
                                            onChange={(e) => setData('higher_education_degree', e.target.value)}
                                            placeholder="e.g. BSc in Computer Science"
                                        />
                                        {errors.higher_education_degree && <span className="text-xs text-red-500">{errors.higher_education_degree}</span>}
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-600 block">Graduation Year</label>
                                        <Input
                                            type="number"
                                            value={data.higher_education_year}
                                            onChange={(e) => setData('higher_education_year', e.target.value)}
                                            placeholder="e.g. 2029"
                                        />
                                        {errors.higher_education_year && <span className="text-xs text-red-500">{errors.higher_education_year}</span>}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Contribution areas (Mentorship & Volunteering) */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg font-bold">Mentorship & Volunteering Interests</CardTitle>
                                <CardDescription>Setup volunteering options and areas of career guidance</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Mentorship */}
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="is_mentor"
                                            checked={data.is_mentor}
                                            onChange={(e) => setData('is_mentor', e.target.checked)}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                                        />
                                        <label htmlFor="is_mentor" className="text-sm font-bold text-gray-800 cursor-pointer">
                                            Enable Active Mentoring Profile
                                        </label>
                                    </div>

                                    {data.is_mentor && (
                                        <div className="pl-6 space-y-3 pt-2">
                                            <span className="text-xs font-semibold text-gray-500 block mb-1">Select Mentorship Expertise Areas</span>
                                            <div className="flex flex-wrap gap-2">
                                                {PREDEFINED_MENTOR_AREAS.map((area) => {
                                                    const selected = data.mentor_areas.includes(area);
                                                    return (
                                                        <Badge
                                                            key={area}
                                                            type="button"
                                                            onClick={() => toggleMentorArea(area)}
                                                            className={`cursor-pointer border py-1.5 px-3 rounded-full text-xs transition-colors ${
                                                                selected 
                                                                ? 'bg-red-500 hover:bg-red-600 text-white border-red-600' 
                                                                : 'bg-white hover:bg-gray-50 text-gray-600 border-gray-300'
                                                            }`}
                                                        >
                                                            {area}
                                                        </Badge>
                                                    );
                                                })}
                                            </div>

                                            {/* Add custom mentorship area */}
                                            <div className="flex items-center space-x-2 pt-2 max-w-sm">
                                                <Input
                                                    placeholder="Add custom mentoring area..."
                                                    value={customMentorArea}
                                                    onChange={(e) => setCustomMentorArea(e.target.value)}
                                                    size={30}
                                                    className="h-8 text-xs"
                                                />
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={addCustomMentorArea}
                                                    className="h-8"
                                                >
                                                    <Plus className="w-3.5 h-3.5 mr-1" /> Add
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Volunteering */}
                                <div className="space-y-3 border-t pt-4">
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="is_volunteer"
                                            checked={data.is_volunteer}
                                            onChange={(e) => setData('is_volunteer', e.target.checked)}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                                        />
                                        <label htmlFor="is_volunteer" className="text-sm font-bold text-gray-800 cursor-pointer">
                                            Enable Active Volunteering Profile
                                        </label>
                                    </div>

                                    {data.is_volunteer && (
                                        <div className="pl-6 space-y-3 pt-2">
                                            <span className="text-xs font-semibold text-gray-500 block mb-1">Select Volunteer Support domains</span>
                                            <div className="flex flex-wrap gap-2">
                                                {PREDEFINED_VOLUNTEER_AREAS.map((area) => {
                                                    const selected = data.volunteer_areas.includes(area);
                                                    return (
                                                        <Badge
                                                            key={area}
                                                            type="button"
                                                            onClick={() => toggleVolunteerArea(area)}
                                                            className={`cursor-pointer border py-1.5 px-3 rounded-full text-xs transition-colors ${
                                                                selected 
                                                                ? 'bg-indigo-500 hover:bg-indigo-600 text-white border-indigo-600' 
                                                                : 'bg-white hover:bg-gray-50 text-gray-600 border-gray-300'
                                                            }`}
                                                        >
                                                            {area}
                                                        </Badge>
                                                    );
                                                })}
                                            </div>

                                            {/* Add custom volunteer area */}
                                            <div className="flex items-center space-x-2 pt-2 max-w-sm">
                                                <Input
                                                    placeholder="Add custom volunteer area..."
                                                    value={customVolunteerArea}
                                                    onChange={(e) => setCustomVolunteerArea(e.target.value)}
                                                    size={30}
                                                    className="h-8 text-xs"
                                                />
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={addCustomVolunteerArea}
                                                    className="h-8"
                                                >
                                                    <Plus className="w-3.5 h-3.5 mr-1" /> Add
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Social Media, Settings & Admin Notes */}
                    <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                        {/* Privacy & settings */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg font-bold">Privacy & Settings</CardTitle>
                                <CardDescription>Alumni directory visibility preferences</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-600 block">Directory Privacy Level</label>
                                    <Select 
                                        value={data.privacy_level} 
                                        onValueChange={(val) => setData('privacy_level', val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="public">Public (Visible to All)</SelectItem>
                                            <SelectItem value="alumni_only">Alumni Only (Internal network only)</SelectItem>
                                            <SelectItem value="private">Private (Administrators only)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.privacy_level && <span className="text-xs text-red-500">{errors.privacy_level}</span>}
                                </div>

                                <div className="border-t pt-4 space-y-3">
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="newsletter_subscription"
                                            checked={data.newsletter_subscription}
                                            onChange={(e) => setData('newsletter_subscription', e.target.checked)}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                                        />
                                        <label htmlFor="newsletter_subscription" className="text-xs font-semibold text-gray-700 cursor-pointer">
                                            Newsletter Subscription
                                        </label>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="event_notifications"
                                            checked={data.event_notifications}
                                            onChange={(e) => setData('event_notifications', e.target.checked)}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                                        />
                                        <label htmlFor="event_notifications" className="text-xs font-semibold text-gray-700 cursor-pointer">
                                            Event Email Notifications
                                        </label>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Social Media links */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg font-bold">Social Media Profiles</CardTitle>
                                <CardDescription>Direct links to personal professional networking channels</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-600 block">LinkedIn Profile URL</label>
                                    <Input
                                        type="url"
                                        value={data.social_media_linkedin}
                                        onChange={(e) => setData('social_media_linkedin', e.target.value)}
                                        placeholder="https://linkedin.com/in/username"
                                    />
                                    {errors.social_media_linkedin && <span className="text-xs text-red-500">{errors.social_media_linkedin}</span>}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-600 block">Facebook Profile URL</label>
                                    <Input
                                        type="url"
                                        value={data.social_media_facebook}
                                        onChange={(e) => setData('social_media_facebook', e.target.value)}
                                        placeholder="https://facebook.com/username"
                                    />
                                    {errors.social_media_facebook && <span className="text-xs text-red-500">{errors.social_media_facebook}</span>}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-600 block">Twitter Profile URL</label>
                                    <Input
                                        type="url"
                                        value={data.social_media_twitter}
                                        onChange={(e) => setData('social_media_twitter', e.target.value)}
                                        placeholder="https://twitter.com/username"
                                    />
                                    {errors.social_media_twitter && <span className="text-xs text-red-500">{errors.social_media_twitter}</span>}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-600 block">Instagram Profile URL</label>
                                    <Input
                                        type="url"
                                        value={data.social_media_instagram}
                                        onChange={(e) => setData('social_media_instagram', e.target.value)}
                                        placeholder="https://instagram.com/username"
                                    />
                                    {errors.social_media_instagram && <span className="text-xs text-red-500">{errors.social_media_instagram}</span>}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Internal Notes */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg font-bold">Internal Relations Notes</CardTitle>
                                <CardDescription>Private records and notes regarding alumni relations</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-600 block">Administrative Notes</label>
                                    <Textarea
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        rows={4}
                                        placeholder="Enter secure internal administration notes..."
                                    />
                                    {errors.notes && <span className="text-xs text-red-500">{errors.notes}</span>}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}
