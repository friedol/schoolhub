import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Printer, Eye, Users } from 'lucide-react';

interface Candidate {
    id: number;
    seat_number: string;
    student: {
        name: string;
        student_profile: { admission_number: string; school_class: { name: string } } | null;
    };
    exam_session: { subject: { name: string } };
}

interface Props {
    exams: { id: number; name: string }[];
    rooms: { id: number; room_number: string; capacity: number }[];
    candidates: Candidate[];
    filters: { exam_id?: string; room_id?: string };
}

export default function CandidateList({ exams, rooms, candidates, filters }: Props) {
    const [examId, setExamId] = useState(filters.exam_id || '');
    const [roomId, setRoomId] = useState(filters.room_id || '');

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/academic/sitting-plans/candidate-list', { exam_id: examId, room_id: roomId }, { preserveState: true });
    };

    const selectedRoom = rooms.find(r => r.id.toString() === roomId);
    const selectedExam = exams.find(e => e.id.toString() === examId);

    return (
        <AppLayout>
            <Head title="Room Candidate List" />

            <div className="flex flex-col gap-6 p-6">

                {/* Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between print:hidden">
                    <div>
                        <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Room Candidate Lists</h1>
                        <p className="text-xs text-indigo-400 mt-0.5">Dashboard / Sitting Plans / Candidate List</p>
                    </div>
                    {candidates.length > 0 && (
                        <Button size="sm" onClick={() => window.print()} className="bg-indigo-600 hover:bg-indigo-700 gap-1.5 h-9">
                            <Printer className="h-3.5 w-3.5" /> Print List
                        </Button>
                    )}
                </div>

                {/* Filters */}
                <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-4 shadow-sm print:hidden">
                    <form onSubmit={handleFilter} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-indigo-700">Select Examination</Label>
                            <Select value={examId} onValueChange={setExamId}>
                                <SelectTrigger className="border-indigo-200 bg-white"><SelectValue placeholder="Choose Examination" /></SelectTrigger>
                                <SelectContent>{exams.map(e => <SelectItem key={e.id} value={e.id.toString()}>{e.name}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-indigo-700">Select Room</Label>
                            <Select value={roomId} onValueChange={setRoomId}>
                                <SelectTrigger className="border-indigo-200 bg-white"><SelectValue placeholder="Choose Room" /></SelectTrigger>
                                <SelectContent>{rooms.map(r => <SelectItem key={r.id} value={r.id.toString()}>Room {r.room_number} (Cap: {r.capacity})</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 gap-1.5 h-9" disabled={!examId || !roomId}>
                            <Eye className="h-3.5 w-3.5" /> Generate List
                        </Button>
                    </form>
                </div>

                {/* Candidate list */}
                {candidates.length > 0 ? (
                    <div className="rounded-xl border-2 border-indigo-300 shadow-md overflow-hidden">
                        {/* Official header */}
                        <div className="text-center border-b border-indigo-200 bg-indigo-600 text-white py-5 px-6">
                            <h2 className="text-lg font-bold tracking-widest uppercase">Official Candidate List</h2>
                            <p className="text-xs text-indigo-200 mt-1 uppercase tracking-widest font-semibold">
                                Room {selectedRoom?.room_number} &bull; {selectedExam?.name}
                            </p>
                            {candidates[0]?.exam_session?.subject?.name && (
                                <p className="text-xs text-indigo-300 mt-0.5">
                                    Subject: {candidates[0].exam_session.subject.name}
                                </p>
                            )}
                        </div>
                        <table className="w-full text-sm">
                            <thead className="bg-indigo-50 border-b border-indigo-200">
                                <tr>
                                    {['Seat No', 'Admission No', 'Candidate Name', 'Class', 'Verified'].map(h => (
                                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-indigo-500 uppercase tracking-wide">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-indigo-50 bg-white">
                                {candidates.map(c => (
                                    <tr key={c.id} className="hover:bg-indigo-50/30 transition-colors">
                                        <td className="px-4 py-3 font-mono font-bold text-indigo-600">{c.seat_number}</td>
                                        <td className="px-4 py-3 font-mono text-xs text-violet-600">{c.student.student_profile?.admission_number}</td>
                                        <td className="px-4 py-3 font-semibold text-zinc-800">{c.student.name}</td>
                                        <td className="px-4 py-3">
                                            <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded">
                                                {c.student.student_profile?.school_class?.name}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 print:hidden">
                                            <span className="text-xs text-emerald-600 font-medium">✓ Verified</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="px-4 py-2.5 bg-indigo-50 border-t border-indigo-100 text-xs text-indigo-500 flex justify-between">
                            <span>{candidates.length} candidate{candidates.length !== 1 ? 's' : ''}</span>
                            <span>Room capacity: {selectedRoom?.capacity}</span>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                        <div className="h-14 w-14 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center">
                            <Users className="h-7 w-7 text-indigo-400" />
                        </div>
                        <p className="text-sm font-semibold text-zinc-700">No Candidates Loaded</p>
                        <p className="text-xs text-indigo-400">Select an exam and room above to view candidate lists.</p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
