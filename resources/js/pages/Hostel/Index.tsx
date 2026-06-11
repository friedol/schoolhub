import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Plus, 
  Users, 
  Bed, 
  FileText, 
  Wrench, 
  Package,
  BarChart3,
  Settings
} from 'lucide-react';

interface Hostel {
  id: number;
  name: string;
  type: string;
  location: string;
  total_capacity: number;
  current_occupancy: number;
  is_active: boolean;
  notes?: string;
}

interface HostelIndexProps {
  hostels: {
    data: Hostel[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  stats: {
    total_hostels: number;
    active_hostels: number;
    total_capacity: number;
    current_occupancy: number;
    occupancy_rate: number;
  };
}

export default function HostelIndex({ hostels, stats }: HostelIndexProps) {
  return (
    <AuthenticatedLayout>
      <Head title="Hostel Management" />

      <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
        
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 text-gray-900">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Hostel Management</h1>
                  <p className="text-gray-600 mt-2">Manage hostels, rooms, and student allocations</p>
                </div>
                <Link href="/hostel/create">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Hostel
                  </Button>
                </Link>
              </div>

              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Hostels</CardTitle>
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.total_hostels}</div>
                    <p className="text-xs text-muted-foreground">
                      {stats.active_hostels} active
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
                    <Bed className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.total_capacity}</div>
                    <p className="text-xs text-muted-foreground">
                      Total beds available
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Current Occupancy</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.current_occupancy}</div>
                    <p className="text-xs text-muted-foreground">
                      Students allocated
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.occupancy_rate}%</div>
                    <p className="text-xs text-muted-foreground">
                      Utilization rate
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Vacant Beds</CardTitle>
                    <Bed className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.total_capacity - stats.current_occupancy}</div>
                    <p className="text-xs text-muted-foreground">
                      Available for allocation
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Link href="/hostel/allocations">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <Users className="h-8 w-8 text-blue-600" />
                        <div>
                          <h3 className="font-semibold">Student Allocations</h3>
                          <p className="text-sm text-gray-600">Manage student assignments</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/hostel/leave">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <FileText className="h-8 w-8 text-green-600" />
                        <div>
                          <h3 className="font-semibold">Leave Applications</h3>
                          <p className="text-sm text-gray-600">Process leave requests</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/hostel/maintenance">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <Wrench className="h-8 w-8 text-orange-600" />
                        <div>
                          <h3 className="font-semibold">Maintenance</h3>
                          <p className="text-sm text-gray-600">Track maintenance requests</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/hostel/inventory">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <Package className="h-8 w-8 text-purple-600" />
                        <div>
                          <h3 className="font-semibold">Inventory</h3>
                          <p className="text-sm text-gray-600">Manage hostel inventory</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </div>

              {/* Hostels List */}
              <Card>
                <CardHeader>
                  <CardTitle>Hostels</CardTitle>
                  <CardDescription>List of all hostels in the system</CardDescription>
                </CardHeader>
                <CardContent>
                  {hostels.data.length === 0 ? (
                    <div className="text-center py-12">
                      <Building2 className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No hostels</h3>
                      <p className="mt-1 text-sm text-gray-500">Get started by creating a new hostel.</p>
                      <div className="mt-6">
                        <Link href="/hostel/create">
                          <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Hostel
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {hostels.data.map((hostel) => (
                        <div key={hostel.id} className="border rounded-lg p-4 hover:bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3">
                                <h3 className="text-lg font-semibold">{hostel.name}</h3>
                                <Badge variant={hostel.is_active ? "default" : "secondary"}>
                                  {hostel.is_active ? "Active" : "Inactive"}
                                </Badge>
                                <Badge variant="outline">{hostel.type}</Badge>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{hostel.location}</p>
                              <div className="flex items-center space-x-4 mt-2">
                                <span className="text-sm text-gray-500">
                                  Capacity: {hostel.current_occupancy}/{hostel.total_capacity}
                                </span>
                                <div className="w-32 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-blue-600 h-2 rounded-full" 
                                    style={{ 
                                      width: `${hostel.total_capacity > 0 ? (hostel.current_occupancy / hostel.total_capacity) * 100 : 0}%` 
                                    }}
                                  ></div>
                                </div>
                                <span className="text-sm text-gray-500">
                                  {hostel.total_capacity > 0 ? Math.round((hostel.current_occupancy / hostel.total_capacity) * 100) : 0}%
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Link href={`/hostel/${hostel.id}`}>
                                <Button variant="outline" size="sm">
                                  View
                                </Button>
                              </Link>
                              <Link href={`/hostel/${hostel.id}/edit`}>
                                <Button variant="outline" size="sm">
                                  <Settings className="h-4 w-4" />
                                </Button>
                              </Link>
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



