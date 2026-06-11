import React, { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Building2, Users, Calendar, Printer, UserCheck, RefreshCw, Download, Lock, Star } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

interface Student {
    id: number;
    name: string;
    gender: string;
    student_profile: { admission_number: string; special_needs: any; school_class: { name: string } } | null;
}

interface Allocation {
    id: number;
    student_id: number | null;
    student: Student | null;
    seat_number: string;
    row_number: number;
    column_number: number;
    is_reserved: boolean;
    is_absent: boolean;
}

interface Room {
    id: number;
    room_number: string;
    room_name: string | null;
    capacity: number;
    rows: number;
    columns: number;
    floor: number;
    building: string;
}

interface Props {
    session: {
        id: number;
        date: string;
        start_time: string;
        end_time: string;
        exam: { id: number; name: string };
        subject: { id: number; name: string };
        school_class: { id: number; name: string };
        room_id: number | null;
        invigilator_id: number | null;
    };
    rooms: Room[];
    allRooms: Room[];
    activeRoom: Room | null;
    allocations: Allocation[];
    teachers: { id: number; name: string }[];
}

function chr(code: number): string { return String.fromCharCode(code); }
function isEmpty(v: any): boolean {
    return !v || (Array.isArray(v) && v.length === 0) || (typeof v === 'object' && Object.keys(v).length === 0);
}

export default function RoomLayout({ session, rooms, allRooms, activeRoom, allocations, teachers }: Props) {
    const rowsCount = activeRoom?.rows || 8;
    const colsCount = activeRoom?.columns || 5;

    const [selectedRoomId, setSelectedRoomId]         = useState(activeRoom?.id.toString() || '');
    const [selectedInvigilatorId, setSelectedInvigilatorId] = useState(session.invigilator_id?.toString() || 'none');
    const [gridAllocations, setGridAllocations]       = useState<Allocation[]>(allocations);
    const [selectedSeat, setSelectedSeat]             = useState<{ row: number; col: number; seatNumber: string } | null>(null);
    const [isSeatModalOpen, setIsSeatModalOpen]       = useState(false);
    const [seatAction, setSeatAction]                 = useState<'available' | 'reserve' | 'special_need' | 'move'>('available');
    const [moveToSeat, setMoveToSeat]                 = useState('');

    const handleRoomChange = (roomId: string) => {
        setSelectedRoomId(roomId);
        router.get(`/academic/sitting-plans/${session.id}`, { room_id: roomId });
    };

    const handleAutoArrange = () => {
        const sorted = [...gridAllocations].sort((a, b) =>
            (a.student?.gender || '').localeCompare(b.student?.gender || '')
        );
        setGridAllocations(gridAllocations.map((item, idx) => ({
            ...item,
            student_id: sorted[idx]?.student_id ?? null,
            student: sorted[idx]?.student ?? null,
            is_reserved: sorted[idx]?.is_reserved ?? false,
        })));
    };

    const handleSavePlan = () => {
        router.post(`/academic/sitting-plans/${session.id}/save`, {
            room_id: selectedRoomId,
            invigilator_id: selectedInvigilatorId === 'none' ? null : selectedInvigilatorId,
            allocations: gridAllocations.map(a => ({
                seat_number: a.seat_number,
                row_number: a.row_number,
                column_number: a.column_number,
                student_id: a.student_id,
                is_reserved: a.is_reserved,
            }))
        });
    };

    const handleSeatClick = (rowNum: number, colNum: number, seatNum: string) => {
        setSelectedSeat({ row: rowNum, col: colNum, seatNumber: seatNum });
        const existing = gridAllocations.find(a => a.row_number === rowNum && a.column_number === colNum);
        setSeatAction(existing?.is_reserved ? 'reserve' : 'available');
        setIsSeatModalOpen(true);
    };

    const handleApplySeatAction = () => {
        if (!selectedSeat) return;
        const updated = [...gridAllocations];
        const idx = updated.findIndex(a => a.row_number === selectedSeat.row && a.column_number === selectedSeat.col);

        if (idx > -1) {
            if (seatAction === 'available') {
                updated[idx].is_reserved = false;
            } else if (seatAction === 'reserve') {
                updated[idx] = { ...updated[idx], is_reserved: true, student_id: null, student: null };
            } else if (seatAction === 'move' && moveToSeat) {
                const swapIdx = updated.findIndex(a => a.seat_number === moveToSeat);
                if (swapIdx > -1) {
                    [updated[idx].student_id, updated[swapIdx].student_id] = [updated[swapIdx].student_id, updated[idx].student_id];
                    [updated[idx].student, updated[swapIdx].student] = [updated[swapIdx].student, updated[idx].student];
                }
            }
        } else if (seatAction === 'reserve') {
            updated.push({ id: 0, student_id: null, student: null, seat_number: selectedSeat.seatNumber,
                row_number: selectedSeat.row, column_number: selectedSeat.col, is_reserved: true, is_absent: false });
        }

        setGridAllocations(updated);
        setIsSeatModalOpen(false);
    };

    const seatMap: Record<string, Allocation> = {};
    gridAllocations.forEach(a => { seatMap[`${a.row_number}_${a.column_number}`] = a; });

    const totalStudents  = gridAllocations.filter(a => a.student_id && !a.is_reserved).length;
    const boysCount      = gridAllocations.filter(a => a.student?.gender === 'male').length;
    const girlsCount     = gridAllocations.filter(a => a.student?.gender === 'female').length;
    const reservedCount  = gridAllocations.filter(a => a.is_reserved).length;
    const specialCount   = gridAllocations.filter(a => !isEmpty(a.student?.student_profile?.special_needs)).length;
    const availableSeats = (activeRoom?.capacity || 0) - totalStudents - reservedCount;

    return (
        <AppLayout>
            <Head title="Room Sitting Layout" />

            <div className="flex h-full flex-1 flex-col gap-5 p-6">

                {/* Header */}
                <div>
                    <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
                        Sitting Plan — {session.subject.name}
                    </h1>
                    <p className="text-xs text-indigo-400 mt-0.5">
                        Dashboard / Examinations / Sitting Plans / {session.exam.name}
                    </p>
                </div>

                {/* Session info strip */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                        { icon: Building2, label: 'Examination', val: session.exam.name,         color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
                        { icon: Users,     label: 'Subject',     val: session.subject.name,       color: 'text-violet-600 bg-violet-50 border-violet-200' },
                        { icon: Calendar,  label: 'Date',        val: new Date(session.date).toLocaleDateString() + ' · ' + session.start_time + '–' + session.end_time, color: 'text-amber-600 bg-amber-50 border-amber-200' },
                        { icon: Building2, label: 'Class',       val: session.school_class.name,  color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
                    ].map(({ icon: Icon, label, val, color }) => (
                        <div key={label} className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${color}`}>
                            <Icon className="h-4 w-4 shrink-0" />
                            <div className="min-w-0">
                                <p className="text-[10px] font-semibold uppercase tracking-wide opacity-60">{label}</p>
                                <p className="text-xs font-bold truncate">{val}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Stats summary */}
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                    {[
                        { label: 'Total',     val: totalStudents,               bg: 'bg-indigo-50 border-indigo-200',   text: 'text-indigo-700' },
                        { label: 'Boys',      val: boysCount,                   bg: 'bg-blue-50 border-blue-200',       text: 'text-blue-700' },
                        { label: 'Girls',     val: girlsCount,                  bg: 'bg-pink-50 border-pink-200',       text: 'text-pink-700' },
                        { label: 'Available', val: availableSeats,              bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700' },
                        { label: 'Reserved',  val: reservedCount,               bg: 'bg-amber-50 border-amber-200',     text: 'text-amber-700' },
                        { label: 'Sp. Needs', val: specialCount,                bg: 'bg-purple-50 border-purple-200',   text: 'text-purple-700' },
                    ].map(({ label, val, bg, text }) => (
                        <div key={label} className={`rounded-xl border p-3 text-center ${bg}`}>
                            <p className={`text-[10px] font-semibold uppercase tracking-wide ${text} opacity-70`}>{label}</p>
                            <p className={`text-xl font-bold ${text}`}>{val}</p>
                        </div>
                    ))}
                </div>

                {/* Main workspace */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">

                    {/* Seat grid */}
                    <div className="lg:col-span-3 rounded-xl border border-indigo-200 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
                        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-indigo-100 bg-indigo-50">
                            <div>
                                <h2 className="text-sm font-bold text-indigo-800">
                                    Hall Layout — Room {activeRoom?.room_number}
                                </h2>
                                <p className="text-xs text-indigo-400">{activeRoom?.capacity} capacity · {totalStudents} allocated · {availableSeats} free</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button size="sm" variant="outline" onClick={handleAutoArrange}
                                    className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 gap-1 h-8 text-xs">
                                    <RefreshCw className="h-3 w-3" /> Auto Arrange
                                </Button>
                                <Button size="sm" onClick={handleSavePlan} className="bg-emerald-600 hover:bg-emerald-700 h-8 text-xs">
                                    Save Plan
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => window.print()}
                                    className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 gap-1 h-8 text-xs">
                                    <Printer className="h-3 w-3" /> Print
                                </Button>
                            </div>
                        </div>

                        <div className="p-5 space-y-5">
                            {/* Invigilator */}
                            <div className="flex items-center gap-3 p-3 rounded-xl border border-emerald-200 bg-emerald-50/60 max-w-sm">
                                <UserCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                                <Label className="text-xs font-semibold text-emerald-700 shrink-0">Invigilator:</Label>
                                <Select value={selectedInvigilatorId} onValueChange={setSelectedInvigilatorId}>
                                    <SelectTrigger className="h-8 border-emerald-200 bg-white text-xs">
                                        <SelectValue placeholder="Assign Staff" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Unassigned / None</SelectItem>
                                        {teachers.map(t => <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Room selector */}
                            <div className="flex items-center gap-3 p-3 rounded-xl border border-indigo-200 bg-indigo-50/60 max-w-sm">
                                <Building2 className="h-4 w-4 text-indigo-600 shrink-0" />
                                <Label className="text-xs font-semibold text-indigo-700 shrink-0">Room:</Label>
                                <Select value={selectedRoomId} onValueChange={handleRoomChange}>
                                    <SelectTrigger className="h-8 border-indigo-200 bg-white text-xs">
                                        <SelectValue placeholder="Select Room" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {allRooms.map(r => <SelectItem key={r.id} value={r.id.toString()}>{r.room_name || `Room ${r.room_number}`}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Teacher desk */}
                            <div className="flex flex-col items-center gap-6">
                                <div className="flex items-center justify-center gap-2 bg-indigo-700 text-white text-xs font-bold px-8 py-2 rounded-lg shadow-sm">
                                    <Users className="h-3.5 w-3.5" /> INVIGILATOR / TEACHER DESK
                                </div>

                                {/* Grid */}
                                <div className="w-full overflow-x-auto">
                                    <div className="min-w-max" style={{ display: 'grid', gridTemplateColumns: `32px repeat(${colsCount}, minmax(80px, 1fr))`, gap: '6px' }}>
                                        {/* Col headers */}
                                        <div />
                                        {Array.from({ length: colsCount }).map((_, c) => (
                                            <div key={c} className="text-center text-[10px] font-bold text-indigo-400 py-1">{c + 1}</div>
                                        ))}

                                        {Array.from({ length: rowsCount }).map((_, r) => {
                                            const rowLetter = chr(65 + r);
                                            return (
                                                <React.Fragment key={r}>
                                                    <div className="flex items-center justify-center text-[10px] font-bold text-indigo-400">{rowLetter}</div>
                                                    {Array.from({ length: colsCount }).map((_, c) => {
                                                        const seatNum = `${rowLetter}${c + 1}`;
                                                        const alloc   = seatMap[`${r + 1}_${c + 1}`];
                                                        const isSpecial = !isEmpty(alloc?.student?.student_profile?.special_needs);

                                                        let style = 'border-indigo-100 bg-white hover:border-indigo-300 hover:bg-indigo-50/40';
                                                        let content = (
                                                            <div className="text-center py-2.5">
                                                                <p className="text-[9px] font-mono font-bold text-indigo-300">{seatNum}</p>
                                                                <p className="text-[9px] text-indigo-200 mt-0.5">Available</p>
                                                            </div>
                                                        );

                                                        if (alloc?.is_reserved) {
                                                            style = 'border-amber-300 bg-amber-50 hover:border-amber-400';
                                                            content = (
                                                                <div className="text-center py-2.5">
                                                                    <Lock className="h-3 w-3 text-amber-500 mx-auto mb-0.5" />
                                                                    <p className="text-[9px] font-mono font-bold text-amber-600">{seatNum}</p>
                                                                    <p className="text-[9px] text-amber-500">Reserved</p>
                                                                </div>
                                                            );
                                                        } else if (alloc?.student) {
                                                            const isMale = alloc.student.gender === 'male';
                                                            style = isSpecial
                                                                ? 'border-purple-300 bg-purple-50 hover:border-purple-400'
                                                                : isMale
                                                                    ? 'border-blue-200 bg-blue-50/60 hover:border-blue-300'
                                                                    : 'border-pink-200 bg-pink-50/60 hover:border-pink-300';
                                                            content = (
                                                                <div className="space-y-0.5 p-1">
                                                                    <div className="flex items-center justify-between">
                                                                        <span className={`text-[8px] font-mono font-bold px-1 py-0 rounded ${
                                                                            isSpecial ? 'bg-purple-100 text-purple-700' :
                                                                            isMale ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
                                                                        }`}>{seatNum}</span>
                                                                        {isSpecial && <Star className="h-2.5 w-2.5 text-purple-500" />}
                                                                    </div>
                                                                    <p className="text-[9px] font-bold text-zinc-800 truncate leading-tight">
                                                                        {alloc.student.name}
                                                                    </p>
                                                                    <p className="text-[8px] text-zinc-500 truncate">
                                                                        {alloc.student.student_profile?.admission_number}
                                                                    </p>
                                                                    <p className={`text-[8px] font-medium ${isMale ? 'text-blue-500' : 'text-pink-500'}`}>
                                                                        {alloc.student.student_profile?.school_class?.name}
                                                                    </p>
                                                                </div>
                                                            );
                                                        }

                                                        return (
                                                            <div key={c} onClick={() => handleSeatClick(r + 1, c + 1, seatNum)}
                                                                className={`border rounded-lg shadow-sm cursor-pointer transition-all duration-150 min-h-[64px] ${style}`}>
                                                                {content}
                                                            </div>
                                                        );
                                                    })}
                                                </React.Fragment>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-4">

                        {/* Legend */}
                        <div className="rounded-xl border border-indigo-200 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
                            <div className="px-4 py-3 border-b border-indigo-100 bg-indigo-50">
                                <h3 className="text-xs font-bold text-indigo-700 uppercase tracking-wide">Legend</h3>
                            </div>
                            <div className="p-4 space-y-2">
                                {[
                                    { bg: 'border-indigo-100 bg-white',         label: 'Available Seat' },
                                    { bg: 'border-blue-200 bg-blue-50/60',      label: 'Male Student' },
                                    { bg: 'border-pink-200 bg-pink-50/60',      label: 'Female Student' },
                                    { bg: 'border-amber-300 bg-amber-50',       label: 'Reserved / Blocked' },
                                    { bg: 'border-purple-300 bg-purple-50',     label: 'Special Needs' },
                                ].map(({ bg, label }) => (
                                    <div key={label} className="flex items-center gap-2.5 text-xs text-zinc-700">
                                        <div className={`h-4 w-4 rounded border shrink-0 ${bg}`} />
                                        {label}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Room info */}
                        <div className="rounded-xl border border-violet-200 bg-violet-50 shadow-sm overflow-hidden">
                            <div className="px-4 py-3 border-b border-violet-100">
                                <h3 className="text-xs font-bold text-violet-700 uppercase tracking-wide">Room Info</h3>
                            </div>
                            <div className="p-4 space-y-2 text-xs">
                                {[
                                    ['Name',      activeRoom?.room_name || 'Main Hall'],
                                    ['Building',  activeRoom?.building],
                                    ['Floor',     `Floor ${activeRoom?.floor}`],
                                    ['Capacity',  activeRoom?.capacity],
                                    ['Allocated', totalStudents],
                                    ['Available', availableSeats],
                                ].map(([label, val]) => (
                                    <div key={label as string} className="flex justify-between">
                                        <span className="text-violet-600">{label}</span>
                                        <span className="font-semibold text-violet-800">{val}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="rounded-xl border border-zinc-200 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
                            <div className="px-4 py-3 border-b border-zinc-100 bg-zinc-50">
                                <h3 className="text-xs font-bold text-zinc-600 uppercase tracking-wide">Quick Actions</h3>
                            </div>
                            <div className="p-3 space-y-2">
                                {[
                                    { href: `/academic/sitting-plans/candidate-list?exam_id=${session.exam.id}&room_id=${activeRoom?.id}`, icon: Download, label: 'Candidate List', color: 'border-indigo-200 text-indigo-600 hover:bg-indigo-50' },
                                    { href: `/academic/sitting-plans/attendance-sheets?exam_id=${session.exam.id}&room_id=${activeRoom?.id}`, icon: Download, label: 'Attendance Sheet', color: 'border-violet-200 text-violet-600 hover:bg-violet-50' },
                                    { href: '/academic/sitting-plans/invigilators', icon: UserCheck, label: 'Manage Invigilators', color: 'border-emerald-200 text-emerald-600 hover:bg-emerald-50' },
                                ].map(({ href, icon: Icon, label, color }) => (
                                    <Link key={href} href={href}>
                                        <Button size="sm" variant="outline" className={`w-full justify-start text-xs gap-2 h-8 ${color}`}>
                                            <Icon className="h-3.5 w-3.5" /> {label}
                                        </Button>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Seat override dialog */}
            <Dialog open={isSeatModalOpen} onOpenChange={setIsSeatModalOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Override Seat {selectedSeat?.seatNumber}</DialogTitle>
                        <DialogDescription>Row {selectedSeat?.row}, Column {selectedSeat?.col}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-zinc-700">Seat Action</Label>
                            <Select value={seatAction} onValueChange={(v: any) => setSeatAction(v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="available">Set as Available</SelectItem>
                                    <SelectItem value="reserve">Block / Reserve Seat</SelectItem>
                                    <SelectItem value="move">Swap / Move Candidate</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {seatAction === 'move' && (
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-zinc-700">Swap with seat number</Label>
                                <Input placeholder="e.g. A3" value={moveToSeat} onChange={e => setMoveToSeat(e.target.value.toUpperCase())} className="border-indigo-200" />
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsSeatModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleApplySeatAction} className="bg-indigo-600 hover:bg-indigo-700">Apply Override</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <style>{`@media print { .print\\:hidden { display: none !important; } }`}</style>
        </AppLayout>
    );
}
