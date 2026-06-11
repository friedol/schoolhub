import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  Plus, 
  Search, 
  Filter,
  User,
  Building2,
  Bed,
  Calendar,
  MoreHorizontal
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

interface HostelFloor {
  id: number;
  name: string;
}

interface HostelRoom {
  id: number;
  room_number: string;
}

interface HostelBed {
  id: number;
  bed_number: string;
  bed_code: string;
}

interface Allocation {
  id: number;
  hostel: Hostel;
  floor: HostelFloor;
  room: HostelRoom;
  bed: HostelBed;
  student: Student;
  allocation_date: string;
  allocation_type: string;
  academic_year: string;
  term: string;
  is_active: boolean;
  allocation_notes?: string;
  allocated_by: {
    name: string;
  };
}

interface HostelAllocationsIndexProps {
  allocations: {
    data: Allocation[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  hostels: Hostel[];
  stats: {
    total_allocations: number;
    active_allocations: number;
    new_allocations: number;
    transfers: number;
  };
  typeOptions: Record<string, string>;
  filters: {
    hostel_id?: string;
    academic_year?: string;
    term?: string;
    status?: string;
    search?: string;
  };
}

export default function HostelAllocationsIndex({ 
  allocations, 
  hostels, 
  stats, 
  typeOptions, 
  filters 
}: HostelAllocationsIndexProps) {
  return (
    <AuthenticatedLayout>
      <Head title="Student Allocations" />

      <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
        
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 text-gray-900">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Student Allocations</h1>
                  <p className="text-gray-600 mt-2">Manage student hostel assignments</p>
                </div>
                <Link href="/hostel/allocations/create">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Allocate Student
                  </Button>
                </Link>
              </div>

              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Allocations</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.total_allocations}</div>
                    <p className="text-xs text-muted-foreground">
                      All time allocations
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Allocations</CardTitle>
                    <User className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.active_allocations}</div>
                    <p className="text-xs text-muted-foreground">
                      Currently allocated
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">New Allocations</CardTitle>
                    <Plus className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.new_allocations}</div>
                    <p className="text-xs text-muted-foreground">
                      First-time allocations
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Transfers</CardTitle>
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.transfers}</div>
                    <p className="text-xs text-muted-foreground">
                      Room transfers
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
                      <label className="text-sm font-medium">Academic Year</label>
                      <Input
                        placeholder="e.g., 2024"
                        defaultValue={filters.academic_year}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Term</label>
                      <Select defaultValue={filters.term}>
                        <SelectTrigger>
                          <SelectValue placeholder="All terms" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All terms</SelectItem>
                          <SelectItem value="1">Term 1</SelectItem>
                          <SelectItem value="2">Term 2</SelectItem>
                          <SelectItem value="3">Term 3</SelectItem>
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
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Allocations List */}
              <Card>
                <CardHeader>
                  <CardTitle>Student Allocations</CardTitle>
                  <CardDescription>
                    Showing {allocations.data.length} of {allocations.total} allocations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {allocations.data.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No allocations</h3>
                      <p className="mt-1 text-sm text-gray-500">Get started by allocating a student to a hostel.</p>
                      <div className="mt-6">
                        <Link href="/hostel/allocations/create">
                          <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Allocate Student
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {allocations.data.map((allocation) => (
                        <div key={allocation.id} className="border rounded-lg p-4 hover:bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="text-lg font-semibold">{allocation.student.name}</h3>
                                <Badge variant={allocation.is_active ? "default" : "secondary"}>
                                  {allocation.is_active ? "Active" : "Inactive"}
                                </Badge>
                                <Badge variant="outline">{typeOptions[allocation.allocation_type]}</Badge>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                                <div className="flex items-center">
                                  <Building2 className="h-4 w-4 mr-2" />
                                  <span>{allocation.hostel.name}</span>
                                </div>
                                <div className="flex items-center">
                                  <Bed className="h-4 w-4 mr-2" />
                                  <span>Room {allocation.room.room_number}, Bed {allocation.bed.bed_number}</span>
                                </div>
                                <div className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-2" />
                                  <span>{new Date(allocation.allocation_date).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center">
                                  <User className="h-4 w-4 mr-2" />
                                  <span>Allocated by {allocation.allocated_by.name}</span>
                                </div>
                              </div>

                              <div className="mt-2 text-sm text-gray-500">
                                <span>Academic Year: {allocation.academic_year}</span>
                                <span className="mx-2">•</span>
                                <span>Term: {allocation.term}</span>
                                {allocation.student.student_number && (
                                  <>
                                    <span className="mx-2">•</span>
                                    <span>Student #: {allocation.student.student_number}</span>
                                  </>
                                )}
                              </div>

                              {allocation.allocation_notes && (
                                <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                  <strong>Notes:</strong> {allocation.allocation_notes}
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Link href={`/hostel/allocations/${allocation.id}`}>
                                <Button variant="outline" size="sm">
                                  View
                                </Button>
                              </Link>
                              <Button variant="outline" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
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



