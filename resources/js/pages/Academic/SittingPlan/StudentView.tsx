import { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, User, Building2, MapPin } from 'lucide-react';

interface Plan {
    id: number;
    seat_number: string;
    student: {
        id: number;
        name: string;
        email: string;
        student_profile: { admission_number: string; school_class: { name: string }; stream: string | null } | null;
    };
    room: { room_number: string; room_name: string | null; building: string };
    exam_session: { date: string; start_time: string; exam: { name: string }; subject: { name: string } };
}

interface Props {
    plans: {
        data: Plan[];
        links: { url: string | null; label: string; active: boolean }[];
        from: number | null;
        to: number | null;
        total: number;
        current_page: number;
        last_page: number;
    };
    exams: { id: number; name: string }[];
    filters: { search?: string; exam_id?: string };
}

export default function StudentView({ plans, exams, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [examId, setExamId] = useState(filters.exam_id || 'all');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/academic/sitting-plans/student', {
            search: search,
            exam_id: examId === 'all' ? '' : examId
        }, { preserveState: true });
    };

    return (
        <AppLayout>
            <Head title="Student Sitting Plan Lookup" />

            <div className="flex flex-col gap-6 p-6">

                {/* Header */}
                <div>
                    <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Student Sitting Plan Lookup</h1>
                    <p className="text-xs text-indigo-400 mt-0.5">Dashboard / Sitting Plans / Student Lookup</p>
                </div>

                {/* Search form */}
                <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-4 shadow-sm">
                    <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-indigo-700">Search Student</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-400" />
                                <Input
                                    placeholder="Name, email, admission no..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="pl-9 border-indigo-200 bg-white"
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-indigo-700">Examination</Label>
                            <Select value={examId} onValueChange={setExamId}>
                                <SelectTrigger className="border-indigo-200 bg-white"><SelectValue placeholder="All Examinations" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Examinations</SelectItem>
                                    {exams.map(e => <SelectItem key={e.id} value={e.id.toString()}>{e.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 gap-1.5 h-9">
                            <Search className="h-3.5 w-3.5" /> Search
                        </Button>
                    </form>
                </div>

                {/* Results */}
                <div className="rounded-xl border border-indigo-200 shadow-sm">
                    <div className="px-5 py-3 border-b border-indigo-100 bg-indigo-50 flex items-center justify-between">
                        <h2 className="text-sm font-bold text-indigo-800">Seat Assignments</h2>
                        {plans.total > 0 && (
                            <span className="text-xs text-indigo-500 font-medium">
                                {plans.from}–{plans.to} of {plans.total} result{plans.total !== 1 ? 's' : ''}
                            </span>
                        )}
                    </div>

                    {plans.data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3">
                            <div className="h-14 w-14 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center">
                                <Search className="h-7 w-7 text-indigo-400" />
                            </div>
                            <p className="text-sm font-semibold text-zinc-700">
                                {(search || examId !== 'all') ? 'No matching sitting plans' : 'No sitting plans found'}
                            </p>
                            <p className="text-xs text-indigo-400">
                                {(search || examId !== 'all') ? 'Try a different name, admission number, or exam filter.' : 'Search by student name, admission number, or email.'}
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="divide-y divide-indigo-50">
                                {plans.data.map(plan => (
                                    <div key={plan.id} className="flex flex-col sm:flex-row sm:items-center gap-4 px-5 py-4 hover:bg-indigo-50/30 transition-colors">
                                        {/* Student */}
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 border border-indigo-200">
                                                <User className="h-4 w-4 text-indigo-600" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-semibold text-zinc-800 truncate">{plan.student.name}</p>
                                                <p className="text-xs text-indigo-400 font-mono">{plan.student.student_profile?.admission_number}</p>
                                            </div>
                                        </div>

                                        {/* Class */}
                                        <div className="shrink-0">
                                            <p className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wide">Class</p>
                                            <span className="bg-violet-100 text-violet-700 text-xs font-bold px-2 py-0.5 rounded">
                                                {plan.student.student_profile?.school_class?.name}
                                            </span>
                                        </div>

                                        {/* Exam */}
                                        <div className="shrink-0 min-w-0">
                                            <p className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wide">Examination</p>
                                            <p className="text-xs font-semibold text-zinc-700 truncate max-w-[160px]">{plan.exam_session.exam.name}</p>
                                            <p className="text-[10px] text-indigo-300 font-mono">{new Date(plan.exam_session.date).toLocaleDateString()} · {plan.exam_session.start_time}</p>
                                        </div>

                                        {/* Subject */}
                                        <div className="shrink-0">
                                            <p className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wide">Subject</p>
                                            <p className="text-xs font-semibold text-zinc-700">{plan.exam_session.subject.name}</p>
                                        </div>

                                        {/* Room */}
                                        <div className="shrink-0">
                                            <p className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wide">Room</p>
                                            <div className="flex items-center gap-1 text-xs text-zinc-700">
                                                <Building2 className="h-3 w-3 text-indigo-400" />
                                                Room {plan.room.room_number}
                                            </div>
                                            {plan.room.building && (
                                                <p className="text-[9px] text-indigo-300 flex items-center gap-0.5">
                                                    <MapPin className="h-2.5 w-2.5" />{plan.room.building}
                                                </p>
                                            )}
                                        </div>

                                        {/* Seat badge */}
                                        <div className="shrink-0">
                                            <p className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wide mb-1">Seat</p>
                                            <Badge className="bg-indigo-600 text-white font-mono text-sm px-3 py-1">
                                                {plan.seat_number}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {plans.last_page > 1 && (
                                <div className="flex items-center justify-between px-5 py-3 border-t border-indigo-100 bg-indigo-50/40">
                                    <p className="text-xs text-indigo-500">
                                        Showing {plans.from}–{plans.to} of {plans.total} students
                                    </p>
                                    <div className="flex items-center gap-1">
                                        {plans.links.map((link, i) => {
                                            const isActive  = link.active;
                                            const isDisabled = !link.url;
                                            const label = link.label
                                                .replace('&laquo;', '«')
                                                .replace('&raquo;', '»');
                                            return isDisabled ? (
                                                <span key={i} className="px-2.5 py-1 text-xs rounded text-indigo-300 cursor-default">{label}</span>
                                            ) : (
                                                <Link
                                                    key={i}
                                                    href={link.url!}
                                                    preserveState
                                                    className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                                                        isActive
                                                            ? 'bg-indigo-600 text-white'
                                                            : 'text-indigo-600 hover:bg-indigo-100'
                                                    }`}
                                                >
                                                    {label}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

            </div>
        </AppLayout>
    );
}
