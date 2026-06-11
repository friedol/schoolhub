import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter,
  User,
  Building2,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface Student {
  id: number;
  name: string;
  student_number: string;
}

interface Hostel {
  id: number;
  name: string;
}

interface LeaveApplication {
  id: number;
  student: Student;
  hostel: Hostel;
  leave_type: string;
  leave_reason: string;
  departure_date: string;
  departure_time: string;
  expected_return_date: string;
  expected_return_time: string;
  actual_return_date?: string;
  actual_return_time?: string;
  destination: string;
  emergency_contact: string;
  parent_contact: string;
  status: string;
  approved_by?: {
    name: string;
  };
  approved_at?: string;
  rejection_reason?: string;
  check_in_verified: boolean;
  check_out_verified: boolean;
  verified_by?: {
    name: string;
  };
  application_notes?: string;
  created_at: string;
}

interface HostelLeaveIndexProps {
  leaveApplications: {
    data: LeaveApplication[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  hostels: Hostel[];
  stats: {
    total_applications: number;
    pending_applications: number;
    approved_applications: number;
    rejected_applications: number;
  };
  typeOptions: Record<string, string>;
  filters: {
    hostel_id?: string;
    leave_type?: string;
    status?: string;
    date_from?: string;
    date_to?: string;
    search?: string;
  };
}

export default function HostelLeaveIndex({ 
  leaveApplications, 
  hostels, 
  stats, 
  typeOptions, 
  filters 
}: HostelLeaveIndexProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'approved':
        return <Badge variant="default">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <AuthenticatedLayout>
      <Head title="Leave Applications" />

      <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
        
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 text-gray-900">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Leave Applications</h1>
                  <p className="text-gray-600 mt-2">Manage student leave requests</p>
                </div>
                <Link href="/hostel/leave/create">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    New Application
                  </Button>
                </Link>
              </div>

              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.total_applications}</div>
                    <p className="text-xs text-muted-foreground">
                      All time applications
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.pending_applications}</div>
                    <p className="text-xs text-muted-foreground">
                      Awaiting approval
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Approved</CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.approved_applications}</div>
                    <p className="text-xs text-muted-foreground">
                      Approved applications
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                    <XCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.rejected_applications}</div>
                    <p className="text-xs text-muted-foreground">
                      Rejected applications
                    </p>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Search</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search students..."
                          defaultValue={filters.search}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Hostel</label>
                      <Select defaultValue={filters.hostel_id}>
                        <SelectTrigger>
                          <SelectValue placeholder="All hostels" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All hostels</SelectItem>
                          {hostels.map((hostel) => (
                            <SelectItem key={hostel.id} value={hostel.id.toString()}>
                              {hostel.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Leave Type</label>
                      <Select defaultValue={filters.leave_type}>
                        <SelectTrigger>
                          <SelectValue placeholder="All types" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All types</SelectItem>
                          {Object.entries(typeOptions).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Status</label>
                      <Select defaultValue={filters.status}>
                        <SelectTrigger>
                          <SelectValue placeholder="All statuses" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All statuses</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">From Date</label>
                      <Input
                        type="date"
                        defaultValue={filters.date_from}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">To Date</label>
                      <Input
                        type="date"
                        defaultValue={filters.date_to}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Leave Applications List */}
              <Card>
                <CardHeader>
                  <CardTitle>Leave Applications</CardTitle>
                  <CardDescription>
                    Showing {leaveApplications.data.length} of {leaveApplications.total} applications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {leaveApplications.data.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No leave applications</h3>
                      <p className="mt-1 text-sm text-gray-500">Get started by creating a new leave application.</p>
                      <div className="mt-6">
                        <Link href="/hostel/leave/create">
                          <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            New Application
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {leaveApplications.data.map((application) => (
                        <div key={application.id} className="border rounded-lg p-4 hover:bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="text-lg font-semibold">{application.student.name}</h3>
                                {getStatusIcon(application.status)}
                                {getStatusBadge(application.status)}
                                <Badge variant="outline">{typeOptions[application.leave_type]}</Badge>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                                <div className="flex items-center">
                                  <Building2 className="h-4 w-4 mr-2" />
                                  <span>{application.hostel.name}</span>
                                </div>
                                <div className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-2" />
                                  <span>
                                    {new Date(application.departure_date).toLocaleDateString()} - 
                                    {new Date(application.expected_return_date).toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="flex items-center">
                                  <User className="h-4 w-4 mr-2" />
                                  <span>To: {application.destination}</span>
                                </div>
                                <div className="flex items-center">
                                  <span>Emergency: {application.emergency_contact}</span>
                                </div>
                              </div>

                              <div className="mt-2 text-sm text-gray-500">
                                <span>Student #: {application.student.student_number}</span>
                                <span className="mx-2">•</span>
                                <span>Parent: {application.parent_contact}</span>
                                {application.approved_by && (
                                  <>
                                    <span className="mx-2">•</span>
                                    <span>Approved by: {application.approved_by.name}</span>
                                  </>
                                )}
                              </div>

                              <div className="mt-2 text-sm text-gray-600">
                                <strong>Reason:</strong> {application.leave_reason}
                              </div>

                              {application.application_notes && (
                                <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                  <strong>Notes:</strong> {application.application_notes}
                                </div>
                              )}

                              {application.rejection_reason && (
                                <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                                  <strong>Rejection Reason:</strong> {application.rejection_reason}
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Link href={`/hostel/leave/${application.id}`}>
                                <Button variant="outline" size="sm">
                                  View
                                </Button>
                              </Link>
                              {application.status === 'pending' && (
                                <>
                                  <Button variant="outline" size="sm" className="text-green-600">
                                    Approve
                                  </Button>
                                  <Button variant="outline" size="sm" className="text-red-600">
                                    Reject
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        
      </div>
    </AuthenticatedLayout>
  );
}



