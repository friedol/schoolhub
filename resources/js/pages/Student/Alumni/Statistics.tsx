import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Heart, Users, Briefcase, Calendar, ArrowLeft } from 'lucide-react';
import { StatCard, StatGrid } from '@/components/ui/stat-card';

interface GraduationYearStat {
    graduation_year: number;
    count: number;
}

interface ClassStat {
    final_class: string;
    count: number;
}

interface OccupationStat {
    occupation: string;
    count: number;
}

interface Props {
    totalAlumni: number;
    mentors: number;
    volunteers: number;
    graduationYearStats: GraduationYearStat[];
    classStats: ClassStat[];
    occupationStats: OccupationStat[];
}

export default function AlumniStatistics({
    totalAlumni,
    mentors,
    volunteers,
    graduationYearStats,
    classStats,
    occupationStats
}: Props) {
    // Find the max value for calculating percentages in pure CSS charts
    const maxYearCount = Math.max(...graduationYearStats.map(s => s.count), 1);
    const maxClassCount = Math.max(...classStats.map(s => s.count), 1);
    const maxOccupationCount = Math.max(...occupationStats.map(s => s.count), 1);

    return (
        <AppLayout>
            <Head title="Alumni Network Statistics" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                <div className="flex justify-between items-center">
                    <div>
                        <div className="flex items-center space-x-2">
                            <Link href="/students/alumni">
                                <Button variant="ghost" size="sm" className="p-0 h-8 w-8 rounded-full">
                                    <ArrowLeft className="w-4 h-4" />
                                </Button>
                            </Link>
                            <h1 className="text-3xl font-bold text-gray-900">Alumni Statistics</h1>
                        </div>
                        <p className="text-gray-600 ml-10">Visual analytics of the alumni network</p>
                    </div>
                </div>

                <StatGrid cols={3}>
                    <StatCard
                        title="Total Alumni"
                        value={totalAlumni}
                        icon={GraduationCap}
                        color="blue"
                        trend="stable"
                        trendLabel="Total"
                        subtitle="Graduated students"
                    />
                    <StatCard
                        title="Active Mentors"
                        value={mentors}
                        icon={Heart}
                        color="red"
                        trend="stable"
                        trendLabel="Mentors"
                        subtitle="Supporting current students"
                    />
                    <StatCard
                        title="Active Volunteers"
                        value={volunteers}
                        icon={Users}
                        color="indigo"
                        trend="stable"
                        trendLabel="Volunteers"
                        subtitle="Volunteering at events"
                    />
                </StatGrid>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Graduation Year Distribution Chart */}
                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-lg font-bold flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-blue-600" />
                                    Graduation Year Distribution
                                </CardTitle>
                                <CardDescription>Number of graduates by year</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                            {graduationYearStats.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">No data available</div>
                            ) : (
                                <div className="space-y-4">
                                    {graduationYearStats.map((stat) => {
                                        const percent = (stat.count / maxYearCount) * 100;
                                        return (
                                            <div key={stat.graduation_year} className="space-y-1">
                                                <div className="flex justify-between text-sm font-medium">
                                                    <span>Class of {stat.graduation_year}</span>
                                                    <span className="text-gray-600">{stat.count} {stat.count === 1 ? 'graduate' : 'graduates'}</span>
                                                </div>
                                                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                                                    <div
                                                        className="bg-blue-600 h-full rounded-full transition-all duration-500"
                                                        style={{ width: `${percent}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Final Class Distribution Chart */}
                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-lg font-bold flex items-center gap-2">
                                    <GraduationCap className="w-5 h-5 text-indigo-600" />
                                    Final Class Distribution
                                </CardTitle>
                                <CardDescription>Graduates from final year streams/classes</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                            {classStats.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">No data available</div>
                            ) : (
                                <div className="space-y-4">
                                    {classStats.map((stat) => {
                                        const percent = (stat.count / maxClassCount) * 100;
                                        return (
                                            <div key={stat.final_class} className="space-y-1">
                                                <div className="flex justify-between text-sm font-medium">
                                                    <span>{stat.final_class}</span>
                                                    <span className="text-gray-600">{stat.count} {stat.count === 1 ? 'graduate' : 'graduates'}</span>
                                                </div>
                                                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                                                    <div
                                                        className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                                                        style={{ width: `${percent}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Occupations/Industries Breakdown */}
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-green-600" />
                            Top Alumni Occupations & Careers
                        </CardTitle>
                        <CardDescription>Main professional sectors and roles represented in the network</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                        {occupationStats.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">No professional data specified yet</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {occupationStats.map((stat) => {
                                    const percent = (stat.count / maxOccupationCount) * 100;
                                    return (
                                        <div key={stat.occupation} className="space-y-1">
                                            <div className="flex justify-between text-sm font-medium">
                                                <span>{stat.occupation}</span>
                                                <span className="text-gray-600">{stat.count} {stat.count === 1 ? 'person' : 'people'}</span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                                <div
                                                    className="bg-green-600 h-full rounded-full transition-all duration-500"
                                                    style={{ width: `${percent}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
