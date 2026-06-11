import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Eye,
  Calendar,
  Clock,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface MeetingRequest {
  id: number;
  subject: string;
  message: string;
  preferred_date: string;
  preferred_time: string;
  duration: number;
  meeting_type: string;
  status: string;
  scheduled_date: string;
  scheduled_time: string;
  requester: {
    name: string;
  };
  requested_user: {
    name: string;
  };
  student: {
    name: string;
  } | null;
}

interface Props {
  meetings: {
    data: MeetingRequest[];
    links: any[];
    meta: any;
  };
  stats: {
    total_requests: number;
    pending_requests: number;
    scheduled_meetings: number;
    completed_meetings: number;
    upcoming_meetings: number;
  };
  statusOptions: Record<string, string>;
  meetingTypeOptions: Record<string, string>;
  filters: {
    status?: string;
    meeting_type?: string;
    requester_id?: string;
    requested_user_id?: string;
    student_id?: string;
    date_from?: string;
    date_to?: string;
  };
}

export default function MeetingRequestsIndex({ 
  meetings, 
  stats, 
  statusOptions, 
  meetingTypeOptions, 
  filters 
}: Props) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'scheduled':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <AlertCircle className="h-4 w-4" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'scheduled':
        return <Calendar className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      case 'declined':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const formatMeetingDate = (meeting: MeetingRequest) => {
    if (meeting.scheduled_date && meeting.scheduled_time) {
      const date = new Date(meeting.scheduled_date);
      return `${date.toLocaleDateString()} at ${meeting.scheduled_time}`;
    } else if (meeting.preferred_date && meeting.preferred_time) {
      const date = new Date(meeting.preferred_date);
      return `Preferred: ${date.toLocaleDateString()} at ${meeting.preferred_time}`;
    }
    return 'No date set';
  };

  return (
    <AppLayout>
      <Head title="Meeting Requests" />

      <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
        
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Meeting Requests</h1>
                <p className="mt-2 text-gray-600">
                  Manage parent-teacher and staff meeting requests
                </p>
              </div>
              <Link href="/communication/meetings/create">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Request Meeting
                </Button>
              </Link>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_requests}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pending_requests}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.scheduled_meetings}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.completed_meetings}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.upcoming_meetings}</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="mr-2 h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <Select defaultValue={filters.status}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {Object.entries(statusOptions).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select defaultValue={filters.meeting_type}>
                  <SelectTrigger>
                    <SelectValue placeholder="Meeting Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {Object.entries(meetingTypeOptions).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Requester ID"
                  defaultValue={filters.requester_id}
                  className="w-full"
                />
                <Input
                  placeholder="Requested User ID"
                  defaultValue={filters.requested_user_id}
                  className="w-full"
                />
                <Input
                  placeholder="Student ID"
                  defaultValue={filters.student_id}
                  className="w-full"
                />
                <div className="flex space-x-2">
                  <Input
                    type="date"
                    placeholder="From Date"
                    defaultValue={filters.date_from}
                    className="w-full"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Meetings List */}
          <Card>
            <CardHeader>
              <CardTitle>Meeting Requests</CardTitle>
              <CardDescription>
                {meetings.meta.total} meeting requests found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {meetings.data.length > 0 ? (
                <div className="space-y-4">
                  {meetings.data.map((meeting) => (
                    <div key={meeting.id} className="flex items-start justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          {getStatusIcon(meeting.status)}
                          <h3 className="text-lg font-medium">{meeting.subject}</h3>
                          <Badge className={getStatusColor(meeting.status)}>
                            {statusOptions[meeting.status]}
                          </Badge>
                          <Badge variant="outline">
                            {meetingTypeOptions[meeting.meeting_type]}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {meeting.message}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <div className="flex items-center">
                            <User className="mr-1 h-3 w-3" />
                            {meeting.requester.name} → {meeting.requested_user.name}
                          </div>
                          {meeting.student && (
                            <>
                              <span>•</span>
                              <span>Student: {meeting.student.name}</span>
                            </>
                          )}
                          <span>•</span>
                          <div className="flex items-center">
                            <Clock className="mr-1 h-3 w-3" />
                            {meeting.duration} minutes
                          </div>
                          <span>•</span>
                          <div className="flex items-center">
                            <Calendar className="mr-1 h-3 w-3" />
                            {formatMeetingDate(meeting)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Link href={`/communication/meetings/${meeting.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        {['pending', 'approved'].includes(meeting.status) && (
                          <Link href={`/communication/meetings/${meeting.id}/edit`}>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {meeting.status === 'pending' && (
                              <>
                                <DropdownMenuItem>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Decline
                                </DropdownMenuItem>
                              </>
                            )}
                            {meeting.status === 'approved' && (
                              <DropdownMenuItem>
                                <Calendar className="mr-2 h-4 w-4" />
                                Schedule
                              </DropdownMenuItem>
                            )}
                            {meeting.status === 'scheduled' && (
                              <DropdownMenuItem>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Mark Complete
                              </DropdownMenuItem>
                            )}
                            {!['completed', 'cancelled'].includes(meeting.status) && (
                              <DropdownMenuItem className="text-red-600">
                                <XCircle className="mr-2 h-4 w-4" />
                                Cancel
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No meeting requests found</p>
                  <Link href="/communication/meetings/create">
                    <Button className="mt-4">
                      <Plus className="mr-2 h-4 w-4" />
                      Request Your First Meeting
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        
      </div>
    </AppLayout>
  );
}
