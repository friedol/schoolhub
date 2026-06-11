import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Wrench, 
  Plus, 
  Search, 
  Filter,
  User,
  Building2,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';

interface User {
  id: number;
  name: string;
}

interface Hostel {
  id: number;
  name: string;
}

interface HostelRoom {
  id: number;
  room_number: string;
}

interface MaintenanceRequest {
  id: number;
  hostel: Hostel;
  room?: HostelRoom;
  reported_by: User;
  issue_description: string;
  severity: string;
  status: string;
  assigned_to?: User;
  resolution_notes?: string;
  reported_date: string;
  resolved_date?: string;
  cost?: number;
  notes?: string;
}

interface HostelMaintenanceIndexProps {
  maintenanceRequests: {
    data: MaintenanceRequest[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  hostels: Hostel[];
  staff: User[];
  stats: {
    total_requests: number;
    pending_requests: number;
    in_progress_requests: number;
    completed_requests: number;
    urgent_requests: number;
  };
  severityOptions: Record<string, string>;
  filters: {
    hostel_id?: string;
    room_id?: string;
    severity?: string;
    status?: string;
    assigned_to?: string;
    date_from?: string;
    date_to?: string;
    search?: string;
  };
}

export default function HostelMaintenanceIndex({ 
  maintenanceRequests, 
  hostels, 
  staff, 
  stats, 
  severityOptions, 
  filters 
}: HostelMaintenanceIndexProps) {
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'urgent':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'low':
        return <AlertTriangle className="h-4 w-4 text-green-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'urgent':
        return <Badge variant="destructive">Urgent</Badge>;
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge variant="secondary">Medium</Badge>;
      case 'low':
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'in_progress':
        return <Wrench className="h-4 w-4 text-blue-600" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'in_progress':
        return <Badge variant="default">In Progress</Badge>;
      case 'completed':
        return <Badge variant="default">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <AuthenticatedLayout>
      <Head title="Maintenance Requests" />

      <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
        
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 text-gray-900">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Maintenance Requests</h1>
                  <p className="text-gray-600 mt-2">Track and manage hostel maintenance issues</p>
                </div>
                <Link href="/hostel/maintenance/create">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Report Issue
                  </Button>
                </Link>
              </div>

              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                    <Wrench className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.total_requests}</div>
                    <p className="text-xs text-muted-foreground">
                      All time requests
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.pending_requests}</div>
                    <p className="text-xs text-muted-foreground">
                      Awaiting assignment
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                    <Wrench className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.in_progress_requests}</div>
                    <p className="text-xs text-muted-foreground">
                      Currently being worked on
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Completed</CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.completed_requests}</div>
                    <p className="text-xs text-muted-foreground">
                      Successfully resolved
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Urgent</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.urgent_requests}</div>
                    <p className="text-xs text-muted-foreground">
                      High priority issues
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Search</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search issues..."
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
                      <label className="text-sm font-medium">Severity</label>
                      <Select defaultValue={filters.severity}>
                        <SelectTrigger>
                          <SelectValue placeholder="All severities" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All severities</SelectItem>
                          {Object.entries(severityOptions).map(([value, label]) => (
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
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Assigned To</label>
                      <Select defaultValue={filters.assigned_to}>
                        <SelectTrigger>
                          <SelectValue placeholder="All staff" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All staff</SelectItem>
                          {staff.map((person) => (
                            <SelectItem key={person.id} value={person.id.toString()}>
                              {person.name}
                            </SelectItem>
                          ))}
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

              {/* Maintenance Requests List */}
              <Card>
                <CardHeader>
                  <CardTitle>Maintenance Requests</CardTitle>
                  <CardDescription>
                    Showing {maintenanceRequests.data.length} of {maintenanceRequests.total} requests
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {maintenanceRequests.data.length === 0 ? (
                    <div className="text-center py-12">
                      <Wrench className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No maintenance requests</h3>
                      <p className="mt-1 text-sm text-gray-500">Get started by reporting a maintenance issue.</p>
                      <div className="mt-6">
                        <Link href="/hostel/maintenance/create">
                          <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Report Issue
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {maintenanceRequests.data.map((request) => (
                        <div key={request.id} className="border rounded-lg p-4 hover:bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="text-lg font-semibold">Request #{request.id}</h3>
                                {getSeverityIcon(request.severity)}
                                {getSeverityBadge(request.severity)}
                                {getStatusIcon(request.status)}
                                {getStatusBadge(request.status)}
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                                <div className="flex items-center">
                                  <Building2 className="h-4 w-4 mr-2" />
                                  <span>{request.hostel.name}</span>
                                </div>
                                {request.room && (
                                  <div className="flex items-center">
                                    <span>Room {request.room.room_number}</span>
                                  </div>
                                )}
                                <div className="flex items-center">
                                  <User className="h-4 w-4 mr-2" />
                                  <span>Reported by {request.reported_by.name}</span>
                                </div>
                                <div className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-2" />
                                  <span>{new Date(request.reported_date).toLocaleDateString()}</span>
                                </div>
                              </div>

                              <div className="mt-2 text-sm text-gray-600">
                                <strong>Issue:</strong> {request.issue_description}
                              </div>

                              {request.assigned_to && (
                                <div className="mt-2 text-sm text-gray-500">
                                  <span>Assigned to: {request.assigned_to.name}</span>
                                </div>
                              )}

                              {request.resolution_notes && (
                                <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                  <strong>Resolution:</strong> {request.resolution_notes}
                                </div>
                              )}

                              {request.cost && (
                                <div className="mt-2 text-sm text-gray-600">
                                  <strong>Cost:</strong> TZS {request.cost.toLocaleString()}
                                </div>
                              )}

                              {request.notes && (
                                <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                  <strong>Notes:</strong> {request.notes}
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Link href={`/hostel/maintenance/${request.id}`}>
                                <Button variant="outline" size="sm">
                                  View
                                </Button>
                              </Link>
                              {request.status === 'pending' && (
                                <Button variant="outline" size="sm" className="text-blue-600">
                                  Assign
                                </Button>
                              )}
                              {request.status === 'in_progress' && (
                                <Button variant="outline" size="sm" className="text-green-600">
                                  Complete
                                </Button>
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



