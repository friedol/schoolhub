import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Trash2,
  Clipboard,
  CalendarDays,
  User,
  Users,
} from 'lucide-react';
import { BreadcrumbItem } from '@/types';

type ReceiverType = 'student' | 'teacher' | 'staff' | 'parents' | 'all';

interface Notice {
  id: number;
  subject: string;
  notice: string;
  sender: string;
  receiver: ReceiverType;
  date: string;
  created_at: string;
}

const mockNotices: Notice[] = [
  {
    id: 1,
    subject: 'School Fees Payment Deadline',
    notice:
      'All parents and guardians are hereby informed that the deadline for school fees payment for the second term is 31st May 2026. Students with outstanding fees will not be allowed to sit for end-of-term examinations. Please ensure fees are paid promptly to avoid any inconvenience. Payment can be made via M-Pesa Paybill Number 123456 or directly at the school bursar\'s office between 8 AM and 4 PM, Monday to Friday.',
    sender: 'School Bursar',
    receiver: 'parents',
    date: '2026-05-20',
    created_at: '2026-05-20T08:00:00Z',
  },
  {
    id: 2,
    subject: 'End of Term Examination Timetable',
    notice:
      'Students are informed that end of term examinations will commence on 2nd June 2026. The examination timetable has been posted on the school notice board and will also be distributed in classrooms. All students must report by 7:30 AM on examination days. Late students will not be admitted after the examination begins. Required materials: pens, pencils, rulers, and student ID cards.',
    sender: 'Examination Office',
    receiver: 'student',
    date: '2026-05-22',
    created_at: '2026-05-22T09:00:00Z',
  },
  {
    id: 3,
    subject: 'Professional Development Workshop',
    notice:
      'All teaching staff are required to attend the professional development workshop scheduled for Saturday, 28th May 2026 from 9:00 AM to 3:00 PM in the school library. The workshop will cover the new competency-based curriculum implementation strategies. Lunch will be provided. Please confirm your attendance with the Deputy Principal by Thursday, 26th May.',
    sender: 'Deputy Principal',
    receiver: 'teacher',
    date: '2026-05-21',
    created_at: '2026-05-21T10:30:00Z',
  },
  {
    id: 4,
    subject: 'Annual Sports Day - Volunteers Needed',
    notice:
      'The school will be holding its Annual Sports Day on 7th June 2026. We are calling on all students, teachers, staff, and parents to participate and help make this event a success. Volunteers are needed for: race officiating, first aid support, food service, and event coordination. Please register your interest at the school office by 30th May.',
    sender: 'Sports Department',
    receiver: 'all',
    date: '2026-05-23',
    created_at: '2026-05-23T11:00:00Z',
  },
  {
    id: 5,
    subject: 'Updated Leave Application Procedure',
    notice:
      'All non-teaching staff are hereby informed of the updated leave application procedure effective 1st June 2026. All leave applications must be submitted at least 5 working days in advance using the new HR Leave Form available from the HR office. Verbal requests will no longer be accepted. The new procedure also includes an emergency leave clause for urgent situations. Please collect the new forms and contact the HR office for any clarifications.',
    sender: 'Human Resources',
    receiver: 'staff',
    date: '2026-05-19',
    created_at: '2026-05-19T14:00:00Z',
  },
  {
    id: 6,
    subject: 'Parent-Teacher Conference - Term 2',
    notice:
      'Parents and guardians are cordially invited to the Term 2 Parent-Teacher Conference scheduled for Saturday, 14th June 2026 from 8:00 AM to 1:00 PM. You will have the opportunity to meet your child\'s subject teachers and discuss their academic progress, behaviour, and well-being. Individual slots of 10 minutes per teacher will be allocated. Please book your appointment slots through the school office or online portal starting 1st June.',
    sender: 'Principal\'s Office',
    receiver: 'parents',
    date: '2026-05-24',
    created_at: '2026-05-24T08:30:00Z',
  },
];

const receiverLabels: Record<ReceiverType | 'all_filter', string> = {
  student: 'Students',
  teacher: 'Teachers',
  staff: 'Staff',
  parents: 'Parents',
  all: 'All',
  all_filter: 'All Recipients',
};

const receiverBadgeColors: Record<ReceiverType, string> = {
  student: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  teacher: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  staff: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  parents: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
  all: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
};

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Communication', href: '/communication' },
  { title: 'Notice Board', href: '/communication/notice-board' },
];

export default function NoticeBoardIndex() {
  const [searchQuery, setSearchQuery] = useState('');
  const [receiverFilter, setReceiverFilter] = useState<string>('all_filter');
  const [notices, setNotices] = useState<Notice[]>(mockNotices);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredNotices = notices.filter((n) => {
    const matchesSearch =
      n.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.notice.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesReceiver =
      receiverFilter === 'all_filter' || n.receiver === receiverFilter;
    return matchesSearch && matchesReceiver;
  });

  const handleDelete = (id: number) => {
    setNotices((prev) => prev.filter((n) => n.id !== id));
  };

  const handleViewNotice = (notice: Notice) => {
    setSelectedNotice(notice);
    setIsDialogOpen(true);
  };

  const countByReceiver = (type: ReceiverType | 'all_filter') => {
    if (type === 'all_filter') return notices.length;
    return notices.filter((n) => n.receiver === type).length;
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Notice Board" />

      <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
        
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  Notice Board
                </h1>
                <p className="mt-2 text-muted-foreground">
                  Post and manage school notices for students, staff, teachers, and parents
                </p>
              </div>
              <Link href="/communication/notice-board/create">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Notice
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {(
              [
                ['all_filter', 'All Notices'],
                ['student', 'Students'],
                ['teacher', 'Teachers'],
                ['staff', 'Staff'],
                ['parents', 'Parents'],
              ] as [ReceiverType | 'all_filter', string][]
            ).map(([type, label]) => (
              <Card
                key={type}
                className={`cursor-pointer transition-colors hover:border-primary ${
                  receiverFilter === type ? 'border-primary ring-1 ring-primary' : ''
                }`}
                onClick={() => setReceiverFilter(type)}
              >
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-xs font-medium text-muted-foreground">{label}</CardTitle>
                </CardHeader>
                <CardContent className="pb-4 px-4">
                  <div className="text-2xl font-bold">{countByReceiver(type)}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center text-base">
                <Filter className="mr-2 h-4 w-4" />
                Filter & Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search notices by subject, sender, or content..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select
                  value={receiverFilter}
                  onValueChange={(value) => setReceiverFilter(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by recipient..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_filter">All Recipients</SelectItem>
                    <SelectItem value="student">Students</SelectItem>
                    <SelectItem value="teacher">Teachers</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="parents">Parents</SelectItem>
                    <SelectItem value="all">All (Everyone)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Notices List */}
          <Card>
            <CardHeader>
              <CardTitle>Notices</CardTitle>
              <CardDescription>
                {filteredNotices.length} notice{filteredNotices.length !== 1 ? 's' : ''} found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredNotices.length > 0 ? (
                <div className="space-y-4">
                  {filteredNotices.map((notice) => (
                    <div
                      key={notice.id}
                      className="p-4 border rounded-lg hover:border-muted-foreground/30 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          {/* Title row */}
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h3 className="text-base font-semibold">{notice.subject}</h3>
                            <Badge
                              className={`text-xs ${receiverBadgeColors[notice.receiver]}`}
                            >
                              <Users className="mr-1 h-3 w-3" />
                              {receiverLabels[notice.receiver]}
                            </Badge>
                          </div>

                          {/* Preview */}
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {notice.notice}
                          </p>

                          {/* Meta */}
                          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {notice.sender}
                            </span>
                            <span className="flex items-center gap-1">
                              <CalendarDays className="h-3 w-3" />
                              {new Date(notice.date).toLocaleDateString([], {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="shrink-0">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewNotice(notice)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDelete(notice.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Clipboard className="mx-auto h-12 w-12 text-muted-foreground/40 mb-4" />
                  <p className="text-muted-foreground">
                    {searchQuery || receiverFilter !== 'all_filter'
                      ? 'No notices match your filters'
                      : 'No notices posted yet'}
                  </p>
                  <Link href="/communication/notice-board/create">
                    <Button className="mt-4">
                      <Plus className="mr-2 h-4 w-4" />
                      Post First Notice
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        
      </div>

      {/* Notice Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          {selectedNotice && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl pr-8">{selectedNotice.subject}</DialogTitle>
                <DialogDescription asChild>
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    <Badge
                      className={`text-xs ${receiverBadgeColors[selectedNotice.receiver]}`}
                    >
                      <Users className="mr-1 h-3 w-3" />
                      {receiverLabels[selectedNotice.receiver]}
                    </Badge>
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <User className="h-3.5 w-3.5" />
                      {selectedNotice.sender}
                    </span>
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {new Date(selectedNotice.date).toLocaleDateString([], {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </DialogDescription>
              </DialogHeader>
              <div className="mt-2">
                <div className="bg-muted/30 rounded-lg p-4">
                  <p className="text-sm leading-relaxed whitespace-pre-line">
                    {selectedNotice.notice}
                  </p>
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Close
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      handleDelete(selectedNotice.id);
                      setIsDialogOpen(false);
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Notice
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
