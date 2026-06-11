import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Edit, 
  Users, 
  Bed, 
  FileText, 
  Wrench, 
  Package,
  BarChart3,
  MapPin,
  Calendar,
  User
} from 'lucide-react';

interface HostelFloor {
  id: number;
  name: string;
  description?: string;
}

interface HostelRoom {
  id: number;
  room_number: string;
  room_type: string;
  capacity: number;
  current_occupancy: number;
  is_available: boolean;
}

interface HostelBed {
  id: number;
  bed_number: string;
  bed_code: string;
  status: string;
}

interface HostelWarden {
  id: number;
  user: {
    name: string;
    email: string;
  };
  assignment_date: string;
  is_active: boolean;
}

interface Hostel {
  id: number;
  name: string;
  type: string;
  location: string;
  total_capacity: number;
  is_active: boolean;
  notes?: string;
  floors: HostelFloor[];
  rooms: HostelRoom[];
  beds: HostelBed[];
  wardens: HostelWarden[];
  created_at: string;
  updated_at: string;
}

interface HostelShowProps {
  hostel: Hostel;
}

export default function HostelShow({ hostel }: HostelShowProps) {
  const activeWardens = hostel.wardens.filter(warden => warden.is_active);
  const availableBeds = hostel.beds.filter(bed => bed.status === 'vacant');
  const occupiedBeds = hostel.beds.filter(bed => bed.status === 'occupied');
  const occupancyRate = hostel.total_capacity > 0 
    ? Math.round((occupiedBeds.length / hostel.total_capacity) * 100) 
    : 0;

  return (
    <AuthenticatedLayout>
      <Head title={`Hostel - ${hostel.name}`} />

      <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
        
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 text-gray-900">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{hostel.name}</h1>
                  <div className="flex items-center space-x-4 mt-2">
                    <Badge variant={hostel.is_active ? "default" : "secondary"}>
                      {hostel.is_active ? "Active" : "Inactive"}
                    </Badge>
                    <Badge variant="outline">{hostel.type}</Badge>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-1" />
                      {hostel.location}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Link href={`/hostel/${hostel.id}/edit`}>
                    <Button variant="outline">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
                    <Bed className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{hostel.total_capacity}</div>
                    <p className="text-xs text-muted-foreground">
                      Total beds available
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Occupied Beds</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{occupiedBeds.length}</div>
                    <p className="text-xs text-muted-foreground">
                      Currently occupied
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Available Beds</CardTitle>
                    <Bed className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{availableBeds.length}</div>
                    <p className="text-xs text-muted-foreground">
                      Available for allocation
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{occupancyRate}%</div>
                    <p className="text-xs text-muted-foreground">
                      Current utilization
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Link href={`/hostel/allocations?hostel_id=${hostel.id}`}>
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

                <Link href={`/hostel/leave?hostel_id=${hostel.id}`}>
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

                <Link href={`/hostel/maintenance?hostel_id=${hostel.id}`}>
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

                <Link href={`/hostel/inventory?hostel_id=${hostel.id}`}>
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

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Floors and Rooms */}
                <Card>
                  <CardHeader>
                    <CardTitle>Floors and Rooms</CardTitle>
                    <CardDescription>Hostel structure and room information</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {hostel.floors.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Building2 className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2">No floors configured</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {hostel.floors.map((floor) => {
                          const floorRooms = hostel.rooms.filter(room => room.id); // Assuming room has floor_id
                          return (
                            <div key={floor.id} className="border rounded-lg p-4">
                              <h4 className="font-semibold mb-2">{floor.name}</h4>
                              {floor.description && (
                                <p className="text-sm text-gray-600 mb-3">{floor.description}</p>
                              )}
                              <div className="grid grid-cols-1 gap-2">
                                {floorRooms.map((room) => (
                                  <div key={room.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                    <div>
                                      <span className="font-medium">Room {room.room_number}</span>
                                      <span className="text-sm text-gray-600 ml-2">({room.room_type})</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <span className="text-sm">
                                        {room.current_occupancy}/{room.capacity}
                                      </span>
                                      <Badge variant={room.is_available ? "default" : "secondary"}>
                                        {room.is_available ? "Available" : "Full"}
                                      </Badge>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Wardens */}
                <Card>
                  <CardHeader>
                    <CardTitle>Wardens</CardTitle>
                    <CardDescription>Assigned wardens and their details</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {activeWardens.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <User className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2">No wardens assigned</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {activeWardens.map((warden) => (
                          <div key={warden.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-semibold">{warden.user.name}</h4>
                                <p className="text-sm text-gray-600">{warden.user.email}</p>
                                <div className="flex items-center text-sm text-gray-500 mt-1">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  Assigned: {new Date(warden.assignment_date).toLocaleDateString()}
                                </div>
                              </div>
                              <Badge variant="default">Active</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Notes */}
              {hostel.notes && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{hostel.notes}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        
      </div>
    </AuthenticatedLayout>
  );
}



