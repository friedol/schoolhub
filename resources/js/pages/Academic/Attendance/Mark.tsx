import { useState, useMemo } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, XCircle, Clock, AlertCircle, Save, Calendar, Search, Users } from 'lucide-react';
import { useReactTable, getCoreRowModel, flexRender, createColumnHelper } from '@tanstack/react-table';

interface Student { id: number; name: string; student_number: string; profile_photo?: string }
interface Attendance { id: number; student_id: number; date: string; status: 'present' | 'absent' | 'late' | 'excused' | 'sick' | 'leave'; remarks?: string }
interface SchoolClass { id: number; name: string; level: string; students_count: number }

interface Props {
    classes: SchoolClass[];
    students: Student[];
    attendances: Attendance[];
    selectedClass?: number;
    selectedDate?: string;
}

const STATUS_CONFIG = {
    present: { label: 'Present', color: 'bg-emerald-100 text-emerald-700 border-emerald-300', icon: CheckCircle },
    absent:  { label: 'Absent',  color: 'bg-red-100 text-red-700 border-red-300',             icon: XCircle },
    late:    { label: 'Late',    color: 'bg-amber-100 text-amber-700 border-amber-300',        icon: Clock },
    excused: { label: 'Excused', color: 'bg-blue-100 text-blue-700 border-blue-300',           icon: AlertCircle },
    sick:    { label: 'Sick',    color: 'bg-purple-100 text-purple-700 border-purple-300',     icon: AlertCircle },
    leave:   { label: 'Leave',   color: 'bg-cyan-100 text-cyan-700 border-cyan-300',           icon: AlertCircle },
};

export default function AttendanceMark({ classes, students, attendances, selectedClass, selectedDate }: Props) {
    const [formClassId, setFormClassId] = useState(selectedClass?.toString() || '');
    const [formStreamId, setFormStreamId] = useState('');
    const [formSubjectId, setFormSubjectId] = useState('');
    const [date, setDate] = useState(selectedDate || new Date().toISOString().split('T')[0]);
    
    // Have we clicked "Get Student List" for the current selection?
    const [isLoaded, setIsLoaded] = useState(students.length > 0);

    const [entries, setEntries] = useState<Record<number, { status: string; remarks: string }>>(() => {
        const base: Record<number, { status: string; remarks: string }> = {};
        students.forEach(s => {
            const existing = attendances.find(a => a.student_id === s.id);
            base[s.id] = { status: existing?.status || 'present', remarks: existing?.remarks || '' };
        });
        return base;
    });
    const [saving, setSaving] = useState(false);

    const setStatus = (studentId: number, status: string) =>
        setEntries(prev => ({ ...prev, [studentId]: { ...prev[studentId], status } }));

    const setRemarks = (studentId: number, remarks: string) =>
        setEntries(prev => ({ ...prev, [studentId]: { ...prev[studentId], remarks } }));

    const markAll = (status: string) => {
        const next: typeof entries = {};
        students.forEach(s => { next[s.id] = { status, remarks: entries[s.id]?.remarks || '' }; });
        setEntries(next);
    };

    const handleGetStudentList = () => {
        if (!formClassId) return;
        // In a full implementation, you would pass stream_id and subject_id as well
        router.get('/students/attendance/mark', { class_id: formClassId, date }, { 
            preserveState: true, 
            preserveScroll: true,
            onFinish: () => setIsLoaded(true)
        });
    };

    const handleSave = () => {
        if (!formClassId) return;
        setSaving(true);
        router.post('/students/attendance', {
            class_id: formClassId, date,
            attendances: students.map(s => ({ student_id: s.id, status: entries[s.id]?.status || 'present', remarks: entries[s.id]?.remarks || '' })),
        }, { onFinish: () => setSaving(false) });
    };

    const counts = {
        present: students.filter(s => entries[s.id]?.status === 'present').length,
        absent: students.filter(s => entries[s.id]?.status === 'absent').length,
        late: students.filter(s => entries[s.id]?.status === 'late').length,
        excused: students.filter(s => entries[s.id]?.status === 'excused').length,
        sick: students.filter(s => entries[s.id]?.status === 'sick').length,
        leave: students.filter(s => entries[s.id]?.status === 'leave').length,
    };

    // TanStack Table Setup
    const columnHelper = createColumnHelper<Student>();
    const columns = useMemo(() => [
        columnHelper.display({
            id: 'index',
            header: '#',
            cell: (info) => <span className="text-muted-foreground text-sm">{info.row.index + 1}</span>,
        }),
        columnHelper.accessor('name', {
            header: 'Student',
            cell: (info) => <span className="font-medium text-sm">{info.getValue()}</span>,
        }),
        columnHelper.accessor('student_number', {
            header: 'Adm No.',
            cell: (info) => <span className="font-mono text-xs text-muted-foreground">{info.getValue()}</span>,
        }),
        columnHelper.display({
            id: 'status',
            header: 'Status',
            cell: (info) => {
                const studentId = info.row.original.id;
                const entry = entries[studentId] || { status: 'present', remarks: '' };
                return (
                    <div className="flex items-center gap-1 flex-wrap">
                        {Object.entries(STATUS_CONFIG).map(([key, c]) => (
                            <button key={key} onClick={() => setStatus(studentId, key)}
                                className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${entry.status === key ? c.color : 'bg-transparent text-muted-foreground border-muted hover:border-foreground/30'}`}>
                                {c.label}
                            </button>
                        ))}
                    </div>
                );
            }
        }),
        columnHelper.display({
            id: 'remarks',
            header: 'Remarks',
            cell: (info) => {
                const studentId = info.row.original.id;
                const entry = entries[studentId] || { status: 'present', remarks: '' };
                return (
                    <Input value={entry.remarks} onChange={e => setRemarks(studentId, e.target.value)}
                        placeholder="Optional..." className="h-7 text-xs w-40" />
                );
            }
        })
    ], [entries]);

    const table = useReactTable({
        data: students,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <AppLayout>
            <Head title="Mark Attendance" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Mark Attendance</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">Filter class and subject to record daily attendance</p>
                    </div>
                    {isLoaded && students.length > 0 && (
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => markAll('present')}>
                                <CheckCircle className="mr-2 h-4 w-4 text-emerald-600" />Mark All Present
                            </Button>
                            <Button size="sm" onClick={handleSave} disabled={saving || !formClassId}>
                                <Save className="mr-2 h-4 w-4" />{saving ? 'Saving...' : 'Save'}
                            </Button>
                        </div>
                    )}
                </div>

                {/* Filters Row (As requested by user) */}
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row gap-4 items-end">
                        <div className="space-y-1.5 flex-1 max-w-[250px]">
                            <label className="text-sm font-medium">Select Class</label>
                            <Select value={formClassId} onValueChange={(v) => { setFormClassId(v); setIsLoaded(false); }}>
                                <SelectTrigger className="w-full bg-white">
                                    <SelectValue placeholder="Select Class" />
                                </SelectTrigger>
                                <SelectContent>
                                    {classes.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name} ({c.level})</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5 flex-1 max-w-[250px]">
                            <label className="text-sm font-medium">Select Stream/Section (Optional)</label>
                            <Select value={formStreamId} onValueChange={(v) => { setFormStreamId(v); setIsLoaded(false); }}>
                                <SelectTrigger className="w-full bg-white">
                                    <SelectValue placeholder="All Streams" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Streams</SelectItem>
                                    <SelectItem value="A">A</SelectItem>
                                    <SelectItem value="B">B</SelectItem>
                                    <SelectItem value="C">C</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5 flex-1 max-w-[300px]">
                            <label className="text-sm font-medium">Select Subject (Optional)</label>
                            <div className="relative">
                                {/* Simulating a searchable combobox */}
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 pointer-events-none" />
                                <Select value={formSubjectId} onValueChange={(v) => { setFormSubjectId(v); setIsLoaded(false); }}>
                                    <SelectTrigger className="w-full bg-white pl-9">
                                        <SelectValue placeholder="All Subjects" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Subjects</SelectItem>
                                        <SelectItem value="Math">Mathematics</SelectItem>
                                        <SelectItem value="Science">Science</SelectItem>
                                        <SelectItem value="PE">Physical Education</SelectItem>
                                        <SelectItem value="English">English</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-1.5 flex-1 max-w-[200px]">
                            <label className="text-sm font-medium">Date</label>
                            <Input type="date" value={date} onChange={e => { setDate(e.target.value); setIsLoaded(false); }} className="w-full bg-white" />
                        </div>
                    </div>
                    
                    <div>
                        <Button 
                            onClick={handleGetStudentList} 
                            disabled={!formClassId}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            Get Student List
                        </Button>
                    </div>
                </div>

                {/* Content Area */}
                {isLoaded ? (
                    students.length === 0 ? (
                        <Card className="border shadow-sm mt-4">
                            <CardContent className="flex flex-col items-center justify-center py-16">
                                <Users className="h-10 w-10 text-muted-foreground/50 mb-3" />
                                <p className="text-sm font-medium">No students found for this selection</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="flex flex-col gap-6 mt-2">
                            {/* TanStack Table */}
                            <Card className="border shadow-sm overflow-hidden">
                                <CardHeader className="pb-3 border-b bg-muted/20">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-base">{students.length} Students List</CardTitle>
                                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                            <span className="text-xs">Attendance Rate:</span>
                                            <span className="font-semibold text-emerald-600">{students.length > 0 ? Math.round((counts.present / students.length) * 100) : 0}%</span>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0 overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            {table.getHeaderGroups().map(headerGroup => (
                                                <TableRow key={headerGroup.id} className="bg-muted/40 hover:bg-muted/40">
                                                    {headerGroup.headers.map(header => (
                                                        <TableHead key={header.id} className={header.id === 'no' ? 'w-12 pl-6' : ''}>
                                                            {header.isPlaceholder
                                                                ? null
                                                                : flexRender(
                                                                    header.column.columnDef.header,
                                                                    header.getContext()
                                                                )}
                                                        </TableHead>
                                                    ))}
                                                </TableRow>
                                            ))}
                                        </TableHeader>
                                        <TableBody>
                                            {table.getRowModel().rows.map(row => (
                                                <TableRow key={row.id} className="hover:bg-muted/20">
                                                    {row.getVisibleCells().map(cell => (
                                                        <TableCell key={cell.id} className={cell.column.id === 'no' ? 'pl-6' : ''}>
                                                            {flexRender(
                                                                cell.column.columnDef.cell,
                                                                cell.getContext()
                                                            )}
                                                        </TableCell>
                                                    ))}
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>

                            {/* Stats Cards Moved Below Table */}
                            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6 mt-4">
                                {[
                                    { key: 'present', label: 'Present', icon: CheckCircle, colorClass: 'text-emerald-600' },
                                    { key: 'absent', label: 'Absent', icon: XCircle, colorClass: 'text-red-600' },
                                    { key: 'late', label: 'Late', icon: Clock, colorClass: 'text-amber-600' },
                                    { key: 'excused', label: 'Excused', icon: AlertCircle, colorClass: 'text-blue-600' },
                                    { key: 'sick', label: 'Sick', icon: AlertCircle, colorClass: 'text-purple-600' },
                                    { key: 'leave', label: 'Leave', icon: AlertCircle, colorClass: 'text-cyan-600' },
                                ].map(({ key, label, icon: Icon, colorClass }) => (
                                    <Button
                                        key={key}
                                        variant="outline"
                                        className="h-auto flex-col p-4 items-center justify-center"
                                        onClick={() => markAll(key)}
                                    >
                                        <Icon className={`mb-2 h-6 w-6 ${colorClass}`} />
                                        <span className="text-xs font-medium text-muted-foreground">{label}</span>
                                        <span className="text-xl font-bold mt-1">{counts[key as keyof typeof counts]}</span>
                                    </Button>
                                ))}
                            </div>



                            <div className="flex justify-end gap-3 pb-6">
                                <Button variant="outline" size="sm" onClick={() => markAll('absent')}>Mark All Absent</Button>
                                <Button size="sm" onClick={handleSave} disabled={saving}>
                                    <Save className="mr-2 h-4 w-4" />{saving ? 'Saving...' : 'Save Attendance'}
                                </Button>
                            </div>
                        </div>
                    )
                ) : (
                    <Card className="border shadow-sm border-dashed mt-4 bg-muted/10">
                        <CardContent className="flex flex-col items-center justify-center py-24 text-center">
                            <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                                <Search className="h-8 w-8 text-blue-500" />
                            </div>
                            <p className="text-lg font-medium text-foreground">Ready to mark attendance</p>
                            <p className="text-sm text-muted-foreground mt-1 max-w-sm">Select the class, stream, and subject parameters above and click "Get Student List" to begin marking.</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
