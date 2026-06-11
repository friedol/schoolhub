import React, { useState, useEffect, useMemo } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
    CalendarDays, Users, BookOpen, Clock, AlertTriangle, Plus, Printer,
    Save, RefreshCw, Trash2, Edit2, LayoutGrid, Award, BookMarked, Home,
    Calendar, CheckCircle, HelpCircle
} from 'lucide-react';
import axios from 'axios';
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    createColumnHelper,
} from '@tanstack/react-table';

/* ─────────────────────── Interfaces ─────────────────────── */
interface Period {
    id: number;
    period_number: number;
    name: string;
    start_time: string;
    end_time: string;
    is_break: boolean;
}

interface Classroom {
    id: number;
    name: string;
    room_number: string;
    capacity: number;
}

interface Subject {
    id: number;
    name: string;
    code: string;
    category?: string;
}

interface Teacher {
    id: number;
    name: string;
    email: string;
}

interface TimetableSlot {
    id?: number;
    day_of_week: string;
    period_id: number;
    subject_id: number;
    teacher_id: number;
    class_room_id?: number | null;
    subject?: Subject;
    teacher?: Teacher;
    classroom?: Classroom;
    period?: Period;
    timetable?: {
        id: number;
        class_id: number;
        section: string;
        class?: {
            id: number;
            name: string;
        }
    };
}

interface Props {
    academicTerms: Array<{ 
        id: number; 
        name: string; 
        is_active: boolean; 
        start_date?: string; 
        end_date?: string; 
        academic_year?: string; 
    }>;
    classes?: any[];
    periods?: Period[];
    rooms?: Classroom[];
    subjects?: Subject[];
    teachers?: Teacher[];
    examinationTimetables?: any[];
    holidaysList?: any[];
}

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const DAY_LABELS: Record<string, string> = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
};

const SUBJECT_COLORS: Record<string, string> = {
    'P-MATH': 'border-emerald-500 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400',
    'P-ENG': 'border-blue-500 text-blue-700 bg-blue-50 dark:bg-blue-950/20 dark:text-blue-400',
    'P-SCI': 'border-purple-500 text-purple-700 bg-purple-50 dark:bg-purple-950/20 dark:text-purple-400',
    'P-SST': 'border-orange-500 text-orange-700 bg-orange-50 dark:bg-orange-950/20 dark:text-orange-400',
    'S-MATH': 'border-emerald-500 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400',
    'S-ENG': 'border-blue-500 text-blue-700 bg-blue-50 dark:bg-blue-950/20 dark:text-blue-400',
    'S-BIO': 'border-pink-500 text-pink-700 bg-pink-50 dark:bg-pink-950/20 dark:text-pink-400',
    'S-CHEM': 'border-amber-500 text-amber-700 bg-amber-50 dark:bg-amber-950/20 dark:text-amber-400',
    'S-PHY': 'border-cyan-500 text-cyan-700 bg-cyan-50 dark:bg-cyan-950/20 dark:text-cyan-400',
};

const DEFAULT_COLOR = 'border-slate-300 text-slate-700 bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:bg-slate-900/30';

function getSubjectBadgeStyles(code: string) {
    return SUBJECT_COLORS[code] ?? DEFAULT_COLOR;
}

export default function TimetableIndex({
    academicTerms,
    classes: initialClasses = [],
    periods: initialPeriods = [],
    rooms: initialRooms = [],
    subjects: initialSubjects = [],
    teachers: initialTeachers = [],
    examinationTimetables = [],
    holidaysList = [],
}: Props) {
    // Selection state
    const [schoolType, setSchoolType] = useState<'primary' | 'secondary'>('secondary');
    const [classes, setClasses] = useState<any[]>(initialClasses);
    const [selectedClass, setSelectedClass] = useState<string>(
        initialClasses.length > 0 ? String(initialClasses[0].id) : ''
    );
    const [selectedSection, setSelectedSection] = useState<string>('A');
    const [selectedTerm, setSelectedTerm] = useState<string>('');

    // Main Timetable Type Tabs
    // 'class' | 'teacher' | 'school' | 'exam' | 'year'
    const [mainTab, setMainTab] = useState<'class' | 'teacher' | 'school' | 'exam' | 'year'>('class');

    // Metadata loaded from API
    const [periods, setPeriods] = useState<Period[]>(initialPeriods);
    const [classrooms, setClassrooms] = useState<Classroom[]>(initialRooms);
    const [subjects, setSubjects] = useState<Subject[]>(initialSubjects);
    const [teachers, setTeachers] = useState<Teacher[]>(initialTeachers);
    const [subjectTeachers, setSubjectTeachers] = useState<any[]>([]);

    // All scheduled slots across school for Teacher/School Master timetables
    const [allTermSlots, setAllTermSlots] = useState<TimetableSlot[]>([]);

    // Specific Teacher Timetable select
    const [selectedTeacherId, setSelectedTeacherId] = useState<string>(
        initialTeachers.length > 0 ? String(initialTeachers[0].id) : ''
    );

    // School Master select
    const [schoolMasterDay, setSchoolMasterDay] = useState<string>('monday');

    // Editor data state
    const [timetableId, setTimetableId] = useState<number | null>(null);
    const [slots, setSlots] = useState<TimetableSlot[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [conflicts, setConflicts] = useState<any[]>([]);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // sub tab for Class Timetable: 'grid' | 'assign'
    const [activeSubTab, setActiveSubTab] = useState<'grid' | 'assign'>('grid');

    // Slot Edit Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalDay, setModalDay] = useState('');
    const [modalPeriodId, setModalPeriodId] = useState<number | null>(null);
    const [modalSubjectId, setModalSubjectId] = useState('');
    const [modalTeacherId, setModalTeacherId] = useState('');
    const [modalClassroomId, setModalClassroomId] = useState('');

    // HTML5 Drag and Drop state
    const [draggingSubject, setDraggingSubject] = useState<Subject | null>(null);
    const [draggingSlot, setDraggingSlot] = useState<{ day: string; periodId: number } | null>(null);

    // 1. Initial Term Setting and Teacher Loading on Mount
    useEffect(() => {
        if (academicTerms && academicTerms.length > 0) {
            const activeTerm = academicTerms.find(t => t.is_active);
            setSelectedTerm(String(activeTerm ? activeTerm.id : academicTerms[0].id));
        }
        
        // Load all teachers globally immediately so the dropdown is never empty
        const loadGlobalTeachers = async () => {
            try {
                const response = await axios.get('/api/teachers');
                setTeachers(response.data);
                if (response.data.length > 0) {
                    setSelectedTeacherId(prev => prev || String(response.data[0].id));
                }
            } catch (err) {
                console.error("Error loading teachers globally", err);
            }
        };
        loadGlobalTeachers();
    }, [academicTerms]);

    // 2. Load classes dynamically on School Type change
    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const response = await axios.get(`/api/classes/${schoolType}`);
                setClasses(response.data);
                if (response.data.length > 0) {
                    setSelectedClass(String(response.data[0].id));
                } else {
                    setSelectedClass('');
                }
            } catch (err) {
                console.error("Error fetching classes", err);
            }
        };
        fetchClasses();
    }, [schoolType]);

    // 3. Load class timetable once selections are ready
    const handleLoadTimetable = async () => {
        if (!selectedClass || !selectedTerm) return;
        setIsLoading(true);
        setConflicts([]);
        setSuccessMessage(null);
        try {
            const response = await axios.get(`/api/timetable/${schoolType}/${selectedClass}/${selectedSection}/${selectedTerm}`);
            const data = response.data;
            setTimetableId(data.timetable.id);
            setSlots(data.timetable.slots || []);
            setPeriods(data.periods || []);
            setClassrooms(data.classrooms || []);
            setSubjects(data.subjects || []);
            setSubjectTeachers(data.subject_teachers || []);
            if (data.teachers) {
                setTeachers(data.teachers);
            }
        } catch (err) {
            console.error("Error loading class timetable", err);
        } finally {
            setIsLoading(false);
        }
    };

    // 4. Load all slots when selectedTerm changes to build teacher/school master views
    const handleLoadAllTermSlots = async () => {
        if (!selectedTerm) return;
        try {
            const response = await axios.get(`/api/timetable/all/${selectedTerm}`);
            setAllTermSlots(response.data || []);
        } catch (err) {
            console.error("Error loading all slots for term", err);
        }
    };

    // Trigger loads on parameter changes
    useEffect(() => {
        if (selectedClass && selectedTerm) {
            handleLoadTimetable();
        }
        if (selectedTerm) {
            handleLoadAllTermSlots();
        }
    }, [selectedClass, selectedSection, selectedTerm]);

    // Handle Assigning Subject Teacher mappings
    const handleAssignTeacher = async (subjectId: number, teacherId: number | null) => {
        if (!selectedClass) return;
        try {
            await axios.post('/api/subject-teachers/assign', {
                school_class_id: parseInt(selectedClass),
                subject_id: subjectId,
                teacher_id: teacherId
            });
            setSuccessMessage("Subject teacher mapped successfully");
            handleLoadTimetable(); // Reload timetable & mappings
            handleLoadAllTermSlots(); // Reload all slots
        } catch (err) {
            console.error("Error mapping teacher to subject", err);
        }
    };

    // HTML5 Drag and Drop Handlers
    const handleDragStartSubject = (subject: Subject) => {
        setDraggingSubject(subject);
        setDraggingSlot(null);
    };

    const handleDragStartGridSlot = (day: string, periodId: number) => {
        setDraggingSlot({ day, periodId });
        setDraggingSubject(null);
    };

    const handleDropOnGridCell = (targetDay: string, targetPeriodId: number) => {
        // Option A: Dropping a subject from the panel
        if (draggingSubject) {
            // Find default teacher from subject_teachers mapping
            const mappedTeacher = subjectTeachers.find(st => st.subject_id === draggingSubject.id);
            const defaultTeacherId = mappedTeacher ? mappedTeacher.teacher_id : '';

            // Check if slot already exists
            const existingSlot = slots.find(s => s.day_of_week === targetDay && s.period_id === targetPeriodId);

            if (existingSlot) {
                // Edit existing
                setSlots(slots.map(s => (s.day_of_week === targetDay && s.period_id === targetPeriodId) ? {
                    ...s,
                    subject_id: draggingSubject.id,
                    subject: draggingSubject,
                    teacher_id: defaultTeacherId ? parseInt(defaultTeacherId) : (teachers[0]?.id || 0),
                    teacher: defaultTeacherId ? teachers.find(t => t.id === parseInt(defaultTeacherId)) : teachers[0]
                } : s));
            } else {
                // Add new
                const newSlot: TimetableSlot = {
                    day_of_week: targetDay,
                    period_id: targetPeriodId,
                    subject_id: draggingSubject.id,
                    subject: draggingSubject,
                    teacher_id: defaultTeacherId ? parseInt(defaultTeacherId) : (teachers[0]?.id || 0),
                    teacher: defaultTeacherId ? teachers.find(t => t.id === parseInt(defaultTeacherId)) : teachers[0],
                    class_room_id: classrooms[0]?.id || null,
                    classroom: classrooms[0] || undefined
                };
                setSlots([...slots, newSlot]);
            }
        }

        // Option B: Moving a slot from another grid cell
        if (draggingSlot) {
            const { day: sourceDay, periodId: sourcePeriodId } = draggingSlot;
            if (sourceDay === targetDay && sourcePeriodId === targetPeriodId) return;

            const sourceSlotIndex = slots.findIndex(s => s.day_of_week === sourceDay && s.period_id === sourcePeriodId);
            if (sourceSlotIndex === -1) return;

            const sourceSlot = slots[sourceSlotIndex];
            const targetSlotIndex = slots.findIndex(s => s.day_of_week === targetDay && s.period_id === targetPeriodId);

            let updatedSlots = [...slots];

            if (targetSlotIndex !== -1) {
                // Swap them
                const targetSlot = slots[targetSlotIndex];
                updatedSlots[sourceSlotIndex] = {
                    ...targetSlot,
                    day_of_week: sourceDay,
                    period_id: sourcePeriodId
                };
                updatedSlots[targetSlotIndex] = {
                    ...sourceSlot,
                    day_of_week: targetDay,
                    period_id: targetPeriodId
                };
            } else {
                // Just move it
                updatedSlots[sourceSlotIndex] = {
                    ...sourceSlot,
                    day_of_week: targetDay,
                    period_id: targetPeriodId
                };
            }
            setSlots(updatedSlots);
        }

        // Reset drag states
        setDraggingSubject(null);
        setDraggingSlot(null);
    };

    // Modal Edit Handlers
    const openEditModal = (day: string, periodId: number) => {
        const existing = slots.find(s => s.day_of_week === day && s.period_id === periodId);
        setModalDay(day);
        setModalPeriodId(periodId);

        if (existing) {
            setModalSubjectId(String(existing.subject_id));
            setModalTeacherId(String(existing.teacher_id));
            setModalClassroomId(existing.class_room_id ? String(existing.class_room_id) : '');
        } else {
            // Find default subject
            const defaultSub = subjects[0]?.id ? String(subjects[0].id) : '';
            setModalSubjectId(defaultSub);

            // Find default teacher from mapping if possible
            const mappedTeacher = defaultSub ? subjectTeachers.find(st => String(st.subject_id) === defaultSub) : null;
            setModalTeacherId(mappedTeacher ? String(mappedTeacher.teacher_id) : (teachers[0]?.id ? String(teachers[0].id) : ''));
            setModalClassroomId(classrooms[0]?.id ? String(classrooms[0].id) : '');
        }
        setIsModalOpen(true);
    };

    const handleSaveModalSlot = () => {
        if (!modalPeriodId || !modalSubjectId || !modalTeacherId) return;

        const subId = parseInt(modalSubjectId);
        const teachId = parseInt(modalTeacherId);
        const roomId = modalClassroomId ? parseInt(modalClassroomId) : null;

        const resolvedSubject = subjects.find(s => s.id === subId);
        const resolvedTeacher = teachers.find(t => t.id === teachId);
        const resolvedClassroom = classrooms.find(r => r.id === roomId);

        const existingIndex = slots.findIndex(s => s.day_of_week === modalDay && s.period_id === modalPeriodId);

        let updatedSlots = [...slots];

        if (existingIndex !== -1) {
            // Update
            updatedSlots[existingIndex] = {
                ...updatedSlots[existingIndex],
                subject_id: subId,
                subject: resolvedSubject,
                teacher_id: teachId,
                teacher: resolvedTeacher,
                class_room_id: roomId,
                classroom: resolvedClassroom
            };
        } else {
            // Add
            updatedSlots.push({
                day_of_week: modalDay,
                period_id: modalPeriodId,
                subject_id: subId,
                subject: resolvedSubject,
                teacher_id: teachId,
                teacher: resolvedTeacher,
                class_room_id: roomId,
                classroom: resolvedClassroom
            });
        }

        setSlots(updatedSlots);
        setIsModalOpen(false);
    };

    const handleRemoveSlot = (day: string, periodId: number) => {
        setSlots(slots.filter(s => !(s.day_of_week === day && s.period_id === periodId)));
        setIsModalOpen(false);
    };

    // Save timetable to database
    const handleSaveTimetable = async () => {
        if (!selectedClass || !selectedTerm) return;
        setIsSaving(true);
        setConflicts([]);
        setSuccessMessage(null);

        // Find school_type_id
        const typeId = schoolType === 'primary' ? 1 : 2; // matches seeded database IDs

        const payload = {
            school_class_id: parseInt(selectedClass),
            school_type_id: typeId,
            section: selectedSection,
            academic_term_id: parseInt(selectedTerm),
            slots: slots.map(s => ({
                day_of_week: s.day_of_week,
                period_id: s.period_id,
                subject_id: s.subject_id,
                teacher_id: s.teacher_id,
                class_room_id: s.class_room_id || null
            }))
        };

        try {
            const response = await axios.post('/api/timetable/update', payload);
            if (response.data.success) {
                setSuccessMessage(response.data.message || 'Timetable saved successfully');
                handleLoadTimetable(); // reload class slots
                handleLoadAllTermSlots(); // reload master slots
            }
        } catch (err: any) {
            if (err.response && err.response.status === 422) {
                setConflicts(err.response.data.errors || []);
            } else {
                console.error("Error saving timetable", err);
            }
        } finally {
            setIsSaving(false);
        }
    };

    // Print functionality
    const handlePrint = () => {
        window.print();
    };

    // Clear all slots in the editor (locally)
    const handleClearLocalSlots = () => {
        setSlots([]);
    };

    /* ─────────────────────── TanStack Table: Class Timetable ─────────────────────── */
    const classTableData = useMemo(() => {
        return DAYS.map(day => {
            const row: any = { day };
            periods.forEach(p => {
                row[`period_${p.id}`] = slots.find(s => s.day_of_week === day && s.period_id === p.id);
            });
            return row;
        });
    }, [slots, periods]);

    const columnHelper = createColumnHelper<any>();

    const classColumns = useMemo(() => {
        const cols = [
            columnHelper.accessor('day', {
                header: () => <span className="font-bold">Day</span>,
                cell: info => <span className="font-bold capitalize text-slate-800 dark:text-slate-200">{DAY_LABELS[info.getValue()]}</span>,
            })
        ];

        periods.forEach(p => {
            cols.push(
                columnHelper.accessor(`period_${p.id}`, {
                    header: () => (
                        <div className="flex flex-col items-center">
                            <span className="font-semibold text-xs">{p.name}</span>
                            <span className="text-[10px] text-muted-foreground font-mono">{p.start_time.substring(0,5)}–{p.end_time.substring(0,5)}</span>
                        </div>
                    ),
                    cell: info => {
                        const cellData = info.getValue() as TimetableSlot | undefined;
                        const day = info.row.original.day;

                        return (
                            <div
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={() => handleDropOnGridCell(day, p.id)}
                                className="min-h-[72px] h-full flex flex-col justify-center p-1 border-dashed hover:border-slate-400 dark:hover:border-slate-600 transition-colors rounded-lg border-2 border-transparent"
                            >
                                {cellData ? (
                                    <div
                                        draggable
                                        onDragStart={() => handleDragStartGridSlot(day, p.id)}
                                        onClick={() => openEditModal(day, p.id)}
                                        className={`group relative rounded-lg border p-2 cursor-pointer shadow-sm text-left transition-all hover:scale-[1.02] hover:shadow-md ${getSubjectBadgeStyles(cellData.subject?.code || '')}`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <p className="text-[11px] font-bold truncate leading-tight">{cellData.subject?.name}</p>
                                            <Badge variant="outline" className="text-[9px] font-bold scale-90 -mr-1 px-1 py-0 border-slate-300 bg-white dark:bg-slate-900">
                                                {cellData.subject?.code}
                                            </Badge>
                                        </div>
                                        <p className="text-[10px] text-slate-600 dark:text-slate-400 truncate mt-1 flex items-center gap-1 font-semibold">
                                            <Users className="h-2.5 w-2.5" /> {cellData.teacher?.name || 'No Teacher'}
                                        </p>
                                        {cellData.classroom && (
                                            <p className="text-[9px] text-slate-500 truncate flex items-center gap-1">
                                                <Home className="h-2.5 w-2.5" /> Room {cellData.classroom.room_number}
                                            </p>
                                        )}
                                        <div className="absolute right-1 bottom-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 print-hide">
                                            <Edit2 className="h-3 w-3 text-slate-400 hover:text-slate-900 dark:hover:text-white" />
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => openEditModal(day, p.id)}
                                        className="h-[60px] w-full border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-center hover:border-primary/40 hover:bg-primary/5 transition-all text-slate-300 dark:text-slate-700 hover:text-primary font-medium print-hide"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        );
                    }
                })
            );
        });

        return cols;
    }, [periods, subjects, classrooms, teachers, slots, subjectTeachers]);

    const classTable = useReactTable({
        data: classTableData,
        columns: classColumns,
        getCoreRowModel: getCoreRowModel(),
    });

    /* ─────────────────────── Teacher Timetable Setup ─────────────────────── */
    const teacherTableData = useMemo(() => {
        return DAYS.map(day => {
            const row: any = { day };
            periods.forEach(p => {
                // Filter all slots where teacher_id matches selected teacher
                row[`period_${p.id}`] = allTermSlots.find(s =>
                    String(s.teacher_id) === selectedTeacherId &&
                    s.day_of_week === day &&
                    s.period_id === p.id
                );
            });
            return row;
        });
    }, [allTermSlots, periods, selectedTeacherId]);

    const teacherColumns = useMemo(() => {
        const cols = [
            columnHelper.accessor('day', {
                header: () => <span className="font-bold">Day</span>,
                cell: info => <span className="font-bold capitalize text-slate-800 dark:text-slate-200">{DAY_LABELS[info.getValue()]}</span>,
            })
        ];

        periods.forEach(p => {
            cols.push(
                columnHelper.accessor(`period_${p.id}`, {
                    header: () => (
                        <div className="flex flex-col items-center">
                            <span className="font-semibold text-xs">{p.name}</span>
                            <span className="text-[10px] text-muted-foreground font-mono">{p.start_time.substring(0,5)}–{p.end_time.substring(0,5)}</span>
                        </div>
                    ),
                    cell: info => {
                        const cellData = info.getValue() as TimetableSlot | undefined;
                        return (
                            <div className="min-h-[60px] h-full flex flex-col justify-center p-1 text-center">
                                {cellData ? (
                                    <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-2 bg-slate-50 dark:bg-slate-900/50 shadow-sm text-left">
                                        <p className="text-[11px] font-bold text-slate-900 dark:text-white leading-tight">
                                            {cellData.timetable?.class?.name || 'Class'}
                                        </p>
                                        <p className="text-[10px] text-slate-600 dark:text-slate-400 truncate mt-0.5 font-semibold">
                                            {cellData.subject?.name} ({cellData.subject?.code})
                                        </p>
                                        {cellData.classroom && (
                                            <p className="text-[9px] text-slate-500 truncate mt-0.5">
                                                Room {cellData.classroom.room_number}
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <span className="text-slate-300 dark:text-slate-800">—</span>
                                )}
                            </div>
                        );
                    }
                })
            );
        });

        return cols;
    }, [periods, allTermSlots, selectedTeacherId]);

    const teacherTable = useReactTable({
        data: teacherTableData,
        columns: teacherColumns,
        getCoreRowModel: getCoreRowModel(),
    });

    /* ─────────────────────── School Master Timetable Setup ─────────────────────── */
    // Rows represent classes, columns represent periods. Selected by Day.
    const allUniqueClasses = useMemo(() => {
        // Collect all classes and sections available
        const uniqueKeys: Record<string, any> = {};
        allTermSlots.forEach(s => {
            if (s.timetable?.class) {
                const key = `${s.timetable.class.id}_${s.timetable.section}`;
                uniqueKeys[key] = {
                    id: s.timetable.class.id,
                    name: s.timetable.class.name,
                    section: s.timetable.section,
                };
            }
        });

        // Add class models that are in the database but have no slots yet to be comprehensive
        classes.forEach(c => {
            ['A', 'B', 'C'].forEach(sec => {
                const key = `${c.id}_${sec}`;
                if (!uniqueKeys[key]) {
                    uniqueKeys[key] = {
                        id: c.id,
                        name: c.name,
                        section: sec,
                    };
                }
            });
        });

        return Object.values(uniqueKeys).sort((a,b) => a.name.localeCompare(b.name) || a.section.localeCompare(b.section));
    }, [allTermSlots, classes]);

    const schoolTableData = useMemo(() => {
        return allUniqueClasses.map(cls => {
            const row: any = { classInfo: cls };
            periods.forEach(p => {
                row[`period_${p.id}`] = allTermSlots.find(s =>
                    s.timetable?.class_id === cls.id &&
                    s.timetable?.section === cls.section &&
                    s.day_of_week === schoolMasterDay &&
                    s.period_id === p.id
                );
            });
            return row;
        });
    }, [allUniqueClasses, allTermSlots, periods, schoolMasterDay]);

    const schoolColumns = useMemo(() => {
        const cols = [
            columnHelper.accessor('classInfo', {
                header: () => <span className="font-bold">Class / Section</span>,
                cell: info => {
                    const cls = info.getValue();
                    return <span className="font-bold text-xs text-slate-800 dark:text-slate-200">{cls.name} - Sec {cls.section}</span>;
                },
            })
        ];

        periods.forEach(p => {
            cols.push(
                columnHelper.accessor(`period_${p.id}`, {
                    header: () => (
                        <div className="flex flex-col items-center">
                            <span className="font-semibold text-xs">{p.name}</span>
                            <span className="text-[10px] text-muted-foreground font-mono">{p.start_time.substring(0,5)}–{p.end_time.substring(0,5)}</span>
                        </div>
                    ),
                    cell: info => {
                        const cellData = info.getValue() as TimetableSlot | undefined;
                        return (
                            <div className="min-h-[50px] h-full flex flex-col justify-center p-1 text-center">
                                {cellData ? (
                                    <div className="rounded border border-slate-200 dark:border-slate-800 p-1.5 bg-slate-50 dark:bg-slate-900/50 text-left">
                                        <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">{cellData.subject?.code}</p>
                                        <p className="text-[9px] text-slate-600 dark:text-slate-400 truncate leading-tight font-semibold mt-0.5">
                                            {cellData.teacher?.name.split(' ').pop()}
                                        </p>
                                        {cellData.classroom && (
                                            <p className="text-[8px] text-slate-400 truncate">
                                                R: {cellData.classroom.room_number}
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <span className="text-slate-200 dark:text-slate-800/40">—</span>
                                )}
                            </div>
                        );
                    }
                })
            );
        });

        return cols;
    }, [periods, allTermSlots, schoolMasterDay]);

    const schoolTable = useReactTable({
        data: schoolTableData,
        columns: schoolColumns,
        getCoreRowModel: getCoreRowModel(),
    });

    /* ─────────────────────── Tanzania Academic Calendar Seeded Data ─────────────────────── */
    const tanzanianHolidays = [
        { date: 'Jan 12', name: 'Zanzibar Revolution Day (Siku ya Mapinduzi)' },
        { date: 'Apr 07', name: 'Karume Day' },
        { date: 'Apr 26', name: 'Union Day (Siku ya Muungano)' },
        { date: 'May 01', name: 'Workers Day (Mei Mosi)' },
        { date: 'Jul 07', name: 'Saba Saba Day (Dar es Salaam International Trade Fair)' },
        { date: 'Aug 08', name: 'Nane Nane Day (Farmers Day)' },
        { date: 'Oct 14', name: 'Nyerere Day (Kumbukumbu ya Mwalimu Nyerere)' },
        { date: 'Dec 09', name: 'Independence Day (Siku ya Uhuru)' },
    ];

    const activeSchoolTypeLabel = schoolType === 'primary' ? 'Primary School (Classes 1–7)' : 'Secondary/Advanced School (Forms 1–6)';

    return (
        <AppLayout>
            <Head title="Timetable Master - Control Center" />

            {/* Printable Header - hidden on screen */}
            <div className="hidden print-header print:block text-center">
                <h1>{activeSchoolName}</h1>
                <p className="font-bold text-lg capitalize">{activeSchoolTypeLabel} Timetable</p>
                {mainTab === 'class' && (
                    <p className="text-sm font-semibold">
                        Class: {classes.find(c => String(c.id) === selectedClass)?.name || 'N/A'} • 
                        Section: {selectedSection} • 
                        Term: {academicTerms.find(t => String(t.id) === selectedTerm)?.name || 'N/A'}
                    </p>
                )}
                {mainTab === 'teacher' && (
                    <p className="text-sm font-semibold">
                        Teacher Schedule: {teachers.find(t => String(t.id) === selectedTeacherId)?.name || 'N/A'} • 
                        Term: {academicTerms.find(t => String(t.id) === selectedTerm)?.name || 'N/A'}
                    </p>
                )}
                {mainTab === 'school' && (
                    <p className="text-sm font-semibold">
                        School Master Day Sheet: {DAY_LABELS[schoolMasterDay]} • 
                        Term: {academicTerms.find(t => String(t.id) === selectedTerm)?.name || 'N/A'}
                    </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">Academic Year: 2024/2025</p>
            </div>

            <div className="flex flex-col gap-6 p-4 md:p-6 print:p-0">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-4 print-hide">
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                            <CalendarDays className="h-6 w-6 text-primary" /> Timetable Master
                        </h1>
                        <p className="text-xs md:text-sm text-muted-foreground mt-1">
                            A complete scheduling panel compliant with the National School Timetable guidelines in Tanzania. Support Primary and Secondary school configurations.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2 w-full md:w-auto">
                        <Button variant="outline" size="sm" onClick={handlePrint} className="h-9 gap-1.5 text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                            <Printer className="h-4 w-4" /> Print Timetable
                        </Button>
                        {mainTab === 'class' && (
                            <>
                                <Button variant="outline" size="sm" onClick={handleClearLocalSlots} className="h-9 gap-1.5 text-xs text-rose-600 border-rose-200 dark:border-rose-950 hover:bg-rose-50 dark:hover:bg-rose-950/20">
                                    <RefreshCw className="h-4 w-4" /> Reset Grid
                                </Button>
                                <Button size="sm" onClick={handleSaveTimetable} disabled={isSaving || !selectedClass} className="h-9 gap-1.5 text-xs bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow">
                                    <Save className="h-4 w-4" /> {isSaving ? 'Saving...' : 'Save Schedule'}
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* Primary Timetable Navigation Tabs */}
                <div className="flex flex-wrap gap-2 print-hide border-b border-slate-200 dark:border-slate-800 pb-2">
                    <Button
                        variant={mainTab === 'class' ? 'default' : 'ghost'}
                        onClick={() => setMainTab('class')}
                        className="text-xs font-semibold"
                    >
                        Class Timetables
                    </Button>
                    <Button
                        variant={mainTab === 'teacher' ? 'default' : 'ghost'}
                        onClick={() => setMainTab('teacher')}
                        className="text-xs font-semibold"
                    >
                        Teacher Timetables
                    </Button>
                    <Button
                        variant={mainTab === 'school' ? 'default' : 'ghost'}
                        onClick={() => setMainTab('school')}
                        className="text-xs font-semibold"
                    >
                        School Master View
                    </Button>
                    <Button
                        variant={mainTab === 'exam' ? 'default' : 'ghost'}
                        onClick={() => setMainTab('exam')}
                        className="text-xs font-semibold"
                    >
                        Exam Timetables
                    </Button>
                    <Button
                        variant={mainTab === 'year' ? 'default' : 'ghost'}
                        onClick={() => setMainTab('year')}
                        className="text-xs font-semibold"
                    >
                        Whole Year Calendar
                    </Button>
                </div>

                {/* Global Controls & Filters based on selected tab */}
                <Card className="border shadow-xs print-hide">
                    <CardContent className="py-2 px-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 items-end">
                            <div className="space-y-0.5">
                                <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Academic Term</Label>
                                <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                                    <SelectTrigger className="h-8 text-xs">
                                        <SelectValue placeholder="Select term" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {academicTerms.map(t => (
                                            <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {mainTab === 'class' && (
                                <>
                                    <div className="space-y-0.5">
                                        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">School Level Type</Label>
                                        <Select value={schoolType} onValueChange={(val: any) => setSchoolType(val)}>
                                            <SelectTrigger className="h-8 text-xs">
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="primary">Primary (Class 1–7)</SelectItem>
                                                <SelectItem value="secondary">Secondary (Form 1–6)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-0.5">
                                        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Class / Form</Label>
                                        <Select value={selectedClass} onValueChange={setSelectedClass}>
                                            <SelectTrigger className="h-8 text-xs">
                                                <SelectValue placeholder="Select class" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {classes.map(c => (
                                                    <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-0.5">
                                        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Class Section</Label>
                                        <Select value={selectedSection} onValueChange={setSelectedSection}>
                                            <SelectTrigger className="h-8 text-xs">
                                                <SelectValue placeholder="Select section" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="A">Section A</SelectItem>
                                                <SelectItem value="B">Section B</SelectItem>
                                                <SelectItem value="C">Section C</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </>
                            )}

                            {mainTab === 'teacher' && (
                                <div className="space-y-0.5 col-span-2 sm:col-span-1">
                                    <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Select Teacher</Label>
                                    <Select value={selectedTeacherId} onValueChange={setSelectedTeacherId}>
                                        <SelectTrigger className="h-8 text-xs">
                                            <SelectValue placeholder="Select teacher" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {teachers.map(t => (
                                                <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {mainTab === 'school' && (
                                <>
                                    <div className="space-y-0.5">
                                        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">School Level Type</Label>
                                        <Select value={schoolType} onValueChange={(val: any) => setSchoolType(val)}>
                                            <SelectTrigger className="h-8 text-xs">
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="primary">Primary (Class 1–7)</SelectItem>
                                                <SelectItem value="secondary">Secondary (Form 1–6)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-0.5">
                                        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Day of the Week</Label>
                                        <Select value={schoolMasterDay} onValueChange={setSchoolMasterDay}>
                                            <SelectTrigger className="h-8 text-xs">
                                                <SelectValue placeholder="Select day" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {DAYS.map(d => (
                                                    <SelectItem key={d} value={d} className="capitalize">{DAY_LABELS[d]}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Notifications & Error console */}
                {successMessage && (
                    <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 p-3 text-sm text-emerald-800 dark:text-emerald-400 font-medium print-hide flex items-center gap-2 animate-pulse">
                        <CheckCircle className="h-4.5 w-4.5 text-emerald-500" /> {successMessage}
                    </div>
                )}

                {conflicts.length > 0 && (
                    <div className="rounded-lg bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 p-4 print-hide">
                        <h4 className="text-sm font-bold text-rose-800 dark:text-rose-400 flex items-center gap-1.5 mb-2">
                            <AlertTriangle className="h-4.5 w-4.5 text-rose-500" /> Teacher Conflict Double Booking Check Failed
                        </h4>
                        <ul className="list-disc list-inside space-y-1 text-xs text-rose-700 dark:text-rose-300 font-medium">
                            {conflicts.map((conflict, i) => (
                                <li key={i}>{conflict.message}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Tab Render Switchboard */}
                {mainTab === 'class' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        {/* Class Grid Editor */}
                        <div className="lg:col-span-9 space-y-4 print:w-full print:block">
                            <div className="flex border-b border-border pb-px print-hide">
                                <button
                                    onClick={() => setActiveSubTab('grid')}
                                    className={`px-4 py-2 border-b-2 font-semibold text-xs transition-colors ${activeSubTab === 'grid' ? 'border-primary text-primary font-bold' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                                >
                                    Schedule Editor Grid
                                </button>
                                <button
                                    onClick={() => setActiveSubTab('assign')}
                                    className={`px-4 py-2 border-b-2 font-semibold text-xs transition-colors ${activeSubTab === 'assign' ? 'border-primary text-primary font-bold' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                                >
                                    Assign Teachers to Subjects
                                </button>
                            </div>

                            {activeSubTab === 'grid' ? (
                                <Card className="border shadow-sm overflow-hidden print:border-none print:shadow-none">
                                    <CardContent className="p-0">
                                        {isLoading ? (
                                            <div className="p-12 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
                                                <RefreshCw className="h-6 w-6 animate-spin text-primary" /> Loading timetable slots...
                                            </div>
                                        ) : (
                                            <div className="overflow-x-auto print:overflow-visible">
                                                <table className="w-full text-center border-collapse min-w-[750px] print-table">
                                                    <thead>
                                                        {classTable.getHeaderGroups().map(headerGroup => (
                                                            <tr key={headerGroup.id} className="bg-slate-50 dark:bg-slate-900 border-b border-border">
                                                                {headerGroup.headers.map(header => (
                                                                    <th key={header.id} className="p-3 border-r border-border text-center text-xs text-slate-700 dark:text-slate-300">
                                                                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                                                    </th>
                                                                ))}
                                                            </tr>
                                                        ))}
                                                    </thead>
                                                    <tbody>
                                                        {classTable.getRowModel().rows.map(row => (
                                                            <tr key={row.id} className="border-b border-border hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                                                                {row.getVisibleCells().map(cell => (
                                                                    <td key={cell.id} className="border-r border-border p-1 align-middle">
                                                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                                    </td>
                                                                ))}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ) : (
                                <Card className="border shadow-sm print-hide">
                                    <CardHeader className="py-3 px-4 border-b">
                                        <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                                            <Award className="h-4 w-4 text-primary" /> Map Class Subject Teachers
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4 space-y-4">
                                        <p className="text-xs text-muted-foreground">
                                            Assign which teacher is responsible for each subject in this class. Timetable slots will automatically use these assignments when dragging subjects onto the grid.
                                        </p>
                                        <div className="divide-y divide-border">
                                            {subjects.map(sub => {
                                                const assignment = subjectTeachers.find(st => st.subject_id === sub.id);
                                                return (
                                                    <div key={sub.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                        <div>
                                                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{sub.name}</p>
                                                            <p className="text-[10px] text-muted-foreground uppercase">{sub.code}</p>
                                                        </div>
                                                        <div className="w-full sm:w-64">
                                                            <Select
                                                                value={assignment ? String(assignment.teacher_id) : 'none'}
                                                                onValueChange={(val) => handleAssignTeacher(sub.id, val === 'none' ? null : parseInt(val))}
                                                            >
                                                                <SelectTrigger className="h-8 text-xs">
                                                                    <SelectValue placeholder="Select teacher" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="none">Unassigned</SelectItem>
                                                                    {teachers.map(t => (
                                                                        <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Subject Panel */}
                        <div className="lg:col-span-3 space-y-4 print-hide">
                            <Card className="border shadow-sm">
                                <CardHeader className="py-3 px-4 border-b">
                                    <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                                        <BookOpen className="h-4 w-4 text-primary" /> Subjects Drawer
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 space-y-3">
                                    <p className="text-[11px] text-muted-foreground">
                                        Drag these subjects directly into the editor grid:
                                    </p>
                                    <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 max-h-[350px] overflow-y-auto pr-1">
                                        {subjects.map(sub => (
                                            <div
                                                key={sub.id}
                                                draggable
                                                onDragStart={() => handleDragStartSubject(sub)}
                                                className="border rounded-lg p-2.5 cursor-grab bg-white dark:bg-slate-900 hover:border-slate-400 dark:hover:border-slate-600 transition-all flex items-center justify-between gap-1 shadow-sm active:cursor-grabbing hover:scale-[1.01]"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <BookMarked className="h-3.5 w-3.5 text-slate-500" />
                                                    <div>
                                                        <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 leading-tight">{sub.name}</p>
                                                        <p className="text-[9px] text-muted-foreground uppercase">{sub.code}</p>
                                                    </div>
                                                </div>
                                                <Badge variant="outline" className="text-[9px] px-1 py-0 uppercase">
                                                    Drag
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                {mainTab === 'teacher' && (
                    <Card className="border shadow-sm overflow-hidden print:border-none print:shadow-none">
                        <CardContent className="p-0">
                            <div className="overflow-x-auto print:overflow-visible">
                                <table className="w-full text-center border-collapse min-w-[750px] print-table">
                                    <thead>
                                        {teacherTable.getHeaderGroups().map(headerGroup => (
                                            <tr key={headerGroup.id} className="bg-slate-50 dark:bg-slate-900 border-b border-border">
                                                {headerGroup.headers.map(header => (
                                                    <th key={header.id} className="p-3 border-r border-border text-center text-xs text-slate-700 dark:text-slate-300">
                                                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                                    </th>
                                                ))}
                                            </tr>
                                        ))}
                                    </thead>
                                    <tbody>
                                        {teacherTable.getRowModel().rows.map(row => (
                                            <tr key={row.id} className="border-b border-border hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                                                {row.getVisibleCells().map(cell => (
                                                    <td key={cell.id} className="border-r border-border p-1 align-middle">
                                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {mainTab === 'school' && (
                    <Card className="border shadow-sm overflow-hidden print:border-none print:shadow-none">
                        <CardContent className="p-0">
                            <div className="overflow-x-auto print:overflow-visible">
                                <table className="w-full text-center border-collapse min-w-[750px] print-table">
                                    <thead>
                                        {schoolTable.getHeaderGroups().map(headerGroup => (
                                            <tr key={headerGroup.id} className="bg-slate-50 dark:bg-slate-900 border-b border-border">
                                                {headerGroup.headers.map(header => (
                                                    <th key={header.id} className="p-3 border-r border-border text-center text-xs text-slate-700 dark:text-slate-300">
                                                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                                    </th>
                                                ))}
                                            </tr>
                                        ))}
                                    </thead>
                                    <tbody>
                                        {schoolTable.getRowModel().rows.map(row => (
                                            <tr key={row.id} className="border-b border-border hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                                                {row.getVisibleCells().map(cell => (
                                                    <td key={cell.id} className="border-r border-border p-1 align-middle">
                                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {mainTab === 'exam' && (
                    <Card className="border shadow-sm">
                        <CardHeader className="py-3 px-4 border-b">
                            <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                                <BookOpen className="h-4.5 w-4.5 text-primary" /> Examination Timetable
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm print-table text-left sm:text-center">
                                    <thead>
                                        <tr className="border-b border-border bg-slate-50 dark:bg-slate-900">
                                            <th className="p-3 border-r border-border text-xs text-slate-700 dark:text-slate-300 font-bold">Date</th>
                                            <th className="p-3 border-r border-border text-xs text-slate-700 dark:text-slate-300 font-bold">Subject</th>
                                            <th className="p-3 border-r border-border text-xs text-slate-700 dark:text-slate-300 font-bold">Class</th>
                                            <th className="p-3 border-r border-border text-xs text-slate-700 dark:text-slate-300 font-bold">Time</th>
                                            <th className="p-3 border-r border-border text-xs text-slate-700 dark:text-slate-300 font-bold">Room</th>
                                            <th className="p-3 text-xs text-slate-700 dark:text-slate-300 font-bold">Invigilator</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {examinationTimetables && examinationTimetables.length > 0 ? (
                                            examinationTimetables.map((exam, index) => (
                                                <tr key={index} className="border-b border-border">
                                                    <td className="p-3 border-r border-border font-mono text-xs text-indigo-600 font-bold">{exam.date}</td>
                                                    <td className="p-3 border-r border-border font-medium">{exam.subject}</td>
                                                    <td className="p-3 border-r border-border text-slate-600 dark:text-slate-400">{exam.class}</td>
                                                    <td className="p-3 border-r border-border font-mono text-xs">{exam.time}</td>
                                                    <td className="p-3 border-r border-border text-slate-600 dark:text-slate-400">{exam.room}</td>
                                                    <td className="p-3 text-xs font-semibold text-slate-700 dark:text-slate-300">{exam.invigilator}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={6} className="p-8 text-center text-muted-foreground text-xs font-semibold">
                                                    No exam timetables scheduled for this term.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {mainTab === 'year' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Tanzania Academic Terms */}
                        <Card className="border shadow-sm">
                            <CardHeader className="py-3 px-4 border-b">
                                <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                                    <Clock className="h-4.5 w-4.5 text-primary" /> Tanzania Academic Term Schedule
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 space-y-4">
                                <div className="space-y-3">
                                    {academicTerms && academicTerms.length > 0 ? (
                                        academicTerms.map(t => {
                                            const formatDate = (dateStr?: string) => {
                                                if (!dateStr) return 'N/A';
                                                try {
                                                    const d = new Date(dateStr);
                                                    if (isNaN(d.getTime())) return dateStr;
                                                    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                                                } catch {
                                                    return dateStr;
                                                }
                                            };
                                            return (
                                                <div key={t.id} className={`p-3 rounded-lg border ${t.is_active ? 'border-primary/30 bg-primary/5 dark:bg-primary/10' : 'bg-slate-50 dark:bg-slate-900/40'}`}>
                                                    <div className="flex items-center justify-between">
                                                        <h5 className="font-bold text-xs">{t.name}</h5>
                                                        {t.is_active && (
                                                            <Badge className="text-[9px] h-4.5 bg-primary/20 hover:bg-primary/20 text-primary border-primary/20 font-semibold px-1.5 py-0">Active</Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-[11px] text-muted-foreground mt-0.5">
                                                        Start Date: {formatDate(t.start_date)} • End Date: {formatDate(t.end_date)}
                                                    </p>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <p className="text-xs text-muted-foreground text-center py-4">No academic terms configured.</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Tanzania National Holidays */}
                        <Card className="border shadow-sm">
                            <CardHeader className="py-3 px-4 border-b">
                                <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                                    <Calendar className="h-4.5 w-4.5 text-primary" /> Tanzania National Holidays (Siku Kuu)
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4">
                                <div className="divide-y divide-border">
                                    {(holidaysList && holidaysList.length > 0 ? holidaysList : tanzanianHolidays).map((h, i) => (
                                        <div key={i} className="py-2.5 flex justify-between items-center text-xs">
                                            <span className="font-bold text-slate-800 dark:text-slate-200">{h.name}</span>
                                            <Badge variant="outline" className="font-mono text-[10px]">{h.date}</Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>

            {/* Modal for editing slot */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm print-hide">
                    <div className="w-full max-w-md bg-white dark:bg-slate-900 border rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        <div className="p-4 border-b bg-slate-50 dark:bg-slate-800 flex justify-between items-center">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Edit Timetable Slot</h3>
                                <p className="text-[10px] text-muted-foreground font-semibold uppercase mt-0.5">
                                    {modalDay} • {periods.find(p => p.id === modalPeriodId)?.name || 'Period'}
                                </p>
                            </div>
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setIsModalOpen(false)}>×</Button>
                        </div>
                        <div className="p-4 space-y-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="modalSubject">Subject</Label>
                                <Select value={modalSubjectId} onValueChange={(val) => {
                                    setModalSubjectId(val);
                                    // Auto-update teacher if mapping exists
                                    const mappedTeacher = subjectTeachers.find(st => String(st.subject_id) === val);
                                    if (mappedTeacher) {
                                        setModalTeacherId(String(mappedTeacher.teacher_id));
                                    }
                                }}>
                                    <SelectTrigger className="h-9 text-xs">
                                        <SelectValue placeholder="Select subject" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {subjects.map(s => (
                                            <SelectItem key={s.id} value={String(s.id)}>{s.name} ({s.code})</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="modalTeacher">Teacher</Label>
                                <Select value={modalTeacherId} onValueChange={setModalTeacherId}>
                                    <SelectTrigger className="h-9 text-xs">
                                        <SelectValue placeholder="Select teacher" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {teachers.map(t => (
                                            <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="modalClassroom">Classroom / Location</Label>
                                <Select value={modalClassroomId} onValueChange={setModalClassroomId}>
                                    <SelectTrigger className="h-9 text-xs">
                                        <SelectValue placeholder="Select classroom" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">None / Unassigned</SelectItem>
                                        {classrooms.map(c => (
                                            <SelectItem key={c.id} value={String(c.id)}>{c.name} ({c.room_number})</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="p-4 border-t bg-slate-50 dark:bg-slate-800 flex justify-between items-center gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-8 gap-1 text-xs text-rose-600 border-rose-200 dark:border-rose-950 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                                onClick={() => handleRemoveSlot(modalDay, modalPeriodId!)}
                            >
                                <Trash2 className="h-3.5 w-3.5" /> Clear Slot
                            </Button>
                            <div className="flex gap-2">
                                <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => setIsModalOpen(false)}>
                                    Cancel
                                </Button>
                                <Button size="sm" className="h-8 text-xs bg-primary hover:bg-primary/95 text-primary-foreground font-bold px-4" onClick={handleSaveModalSlot}>
                                    Apply Changes
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}

const activeSchoolName = "St. Mary's Secondary School"; // Or pull from school context
