import React, { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, User, Building2, Bed } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface Student {
  id: number;
  name: string;
  student_number: string;
}

interface Hostel {
  id: number;
  name: string;
  floors: HostelFloor[];
}

interface HostelFloor {
  id: number;
  name: string;
  rooms: HostelRoom[];
}

interface HostelRoom {
  id: number;
  room_number: string;
  room_type: string;
  capacity: number;
  current_occupancy: number;
  beds: HostelBed[];
}

interface HostelBed {
  id: number;
  bed_number: string;
  bed_code: string;
  status: string;
}

interface HostelAllocationsCreateProps {
  hostels: Hostel[];
  students: Student[];
  typeOptions: Record<string, string>;
}

export default function HostelAllocationsCreate({ hostels, students, typeOptions }: HostelAllocationsCreateProps) {
  const { data, setData, post, processing, errors } = useForm({
    hostel_id: '',
    floor_id: '',
    room_id: '',
    bed_id: '',
    student_id: '',
    allocation_date: new Date().toISOString().split('T')[0],
    allocation_type: 'new',
    academic_year: new Date().getFullYear().toString(),
    term: '1',
    allocation_notes: '',
  });

  const [selectedHostel, setSelectedHostel] = useState<Hostel | null>(null);
  const [selectedFloor, setSelectedFloor] = useState<HostelFloor | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<HostelRoom | null>(null);
  const [availableBeds, setAvailableBeds] = useState<HostelBed[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/hostel/allocations');
  };

  const handleHostelChange = (hostelId: string) => {
    const hostel = hostels.find(h => h.id.toString() === hostelId);
    setSelectedHostel(hostel || null);
    setSelectedFloor(null);
    setSelectedRoom(null);
    setAvailableBeds([]);
    setData('hostel_id', hostelId);
    setData('floor_id', '');
    setData('room_id', '');
    setData('bed_id', '');
  };

  const handleFloorChange = (floorId: string) => {
    if (!selectedHostel) return;
    
    const floor = selectedHostel.floors.find(f => f.id.toString() === floorId);
    setSelectedFloor(floor || null);
    setSelectedRoom(null);
    setAvailableBeds([]);
    setData('floor_id', floorId);
    setData('room_id', '');
    setData('bed_id', '');
  };

  const handleRoomChange = (roomId: string) => {
    if (!selectedFloor) return;
    
    const room = selectedFloor.rooms.find(r => r.id.toString() === roomId);
    setSelectedRoom(room || null);
    
    if (room) {
      const beds = room.beds.filter(bed => bed.status === 'vacant');
      setAvailableBeds(beds);
    } else {
      setAvailableBeds([]);
    }
    
    setData('room_id', roomId);
    setData('bed_id', '');
  };

  const handleBedChange = (bedId: string) => {
    setData('bed_id', bedId);
  };

  return (
    <AuthenticatedLayout>
      <Head title="Allocate Student" />

      <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
        
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 text-gray-900">
              <div className="flex items-center space-x-4 mb-8">
                <Link href="/hostel/allocations">
                  <Button variant="outline" size="sm">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                </Link>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Allocate Student</h1>
                  <p className="text-gray-600 mt-2">Assign a student to a hostel bed</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="mr-2 h-5 w-5" />
                      Student Information
                    </CardTitle>
                    <CardDescription>
                      Select the student to allocate
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="student_id">Student *</Label>
                      <Select value={data.student_id} onValueChange={(value) => setData('student_id', value)}>
                        <SelectTrigger className={errors.student_id ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Select a student" />
                        </SelectTrigger>
                        <SelectContent>
                          {students.map((student) => (
                            <SelectItem key={student.id} value={student.id.toString()}>
                              {student.name} {student.student_number && `(${student.student_number})`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.student_id && (
                        <p className="text-sm text-red-600">{errors.student_id}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="allocation_type">Allocation Type *</Label>
                        <Select value={data.allocation_type} onValueChange={(value) => setData('allocation_type', value)}>
                          <SelectTrigger className={errors.allocation_type ? 'border-red-500' : ''}>
                            <SelectValue placeholder="Select allocation type" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(typeOptions).map(([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.allocation_type && (
                          <p className="text-sm text-red-600">{errors.allocation_type}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="allocation_date">Allocation Date *</Label>
                        <Input
                          id="allocation_date"
                          type="date"
                          value={data.allocation_date}
                          onChange={(e) => setData('allocation_date', e.target.value)}
                          className={errors.allocation_date ? 'border-red-500' : ''}
                        />
                        {errors.allocation_date && (
                          <p className="text-sm text-red-600">{errors.allocation_date}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="academic_year">Academic Year *</Label>
                        <Input
                          id="academic_year"
                          type="text"
                          value={data.academic_year}
                          onChange={(e) => setData('academic_year', e.target.value)}
                          placeholder="e.g., 2024"
                          className={errors.academic_year ? 'border-red-500' : ''}
                        />
                        {errors.academic_year && (
                          <p className="text-sm text-red-600">{errors.academic_year}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="term">Term *</Label>
                        <Select value={data.term} onValueChange={(value) => setData('term', value)}>
                          <SelectTrigger className={errors.term ? 'border-red-500' : ''}>
                            <SelectValue placeholder="Select term" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Term 1</SelectItem>
                            <SelectItem value="2">Term 2</SelectItem>
                            <SelectItem value="3">Term 3</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.term && (
                          <p className="text-sm text-red-600">{errors.term}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Building2 className="mr-2 h-5 w-5" />
                      Hostel Selection
                    </CardTitle>
                    <CardDescription>
                      Choose the hostel, floor, room, and bed
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="hostel_id">Hostel *</Label>
                      <Select value={data.hostel_id} onValueChange={handleHostelChange}>
                        <SelectTrigger className={errors.hostel_id ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Select a hostel" />
                        </SelectTrigger>
                        <SelectContent>
                          {hostels.map((hostel) => (
                            <SelectItem key={hostel.id} value={hostel.id.toString()}>
                              {hostel.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.hostel_id && (
                        <p className="text-sm text-red-600">{errors.hostel_id}</p>
                      )}
                    </div>

                    {selectedHostel && (
                      <div className="space-y-2">
                        <Label htmlFor="floor_id">Floor *</Label>
                        <Select value={data.floor_id} onValueChange={handleFloorChange}>
                          <SelectTrigger className={errors.floor_id ? 'border-red-500' : ''}>
                            <SelectValue placeholder="Select a floor" />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedHostel.floors.map((floor) => (
                              <SelectItem key={floor.id} value={floor.id.toString()}>
                                {floor.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.floor_id && (
                          <p className="text-sm text-red-600">{errors.floor_id}</p>
                        )}
                      </div>
                    )}

                    {selectedFloor && (
                      <div className="space-y-2">
                        <Label htmlFor="room_id">Room *</Label>
                        <Select value={data.room_id} onValueChange={handleRoomChange}>
                          <SelectTrigger className={errors.room_id ? 'border-red-500' : ''}>
                            <SelectValue placeholder="Select a room" />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedFloor.rooms.map((room) => (
                              <SelectItem key={room.id} value={room.id.toString()}>
                                Room {room.room_number} ({room.room_type}) - {room.current_occupancy}/{room.capacity}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.room_id && (
                          <p className="text-sm text-red-600">{errors.room_id}</p>
                        )}
                      </div>
                    )}

                    {availableBeds.length > 0 && (
                      <div className="space-y-2">
                        <Label htmlFor="bed_id">Bed *</Label>
                        <Select value={data.bed_id} onValueChange={handleBedChange}>
                          <SelectTrigger className={errors.bed_id ? 'border-red-500' : ''}>
                            <SelectValue placeholder="Select a bed" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableBeds.map((bed) => (
                              <SelectItem key={bed.id} value={bed.id.toString()}>
                                <div className="flex items-center">
                                  <Bed className="mr-2 h-4 w-4" />
                                  Bed {bed.bed_number} ({bed.bed_code})
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.bed_id && (
                          <p className="text-sm text-red-600">{errors.bed_id}</p>
                        )}
                      </div>
                    )}

                    {selectedRoom && availableBeds.length === 0 && (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800">
                          No available beds in this room. All beds are currently occupied.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Additional Information</CardTitle>
                    <CardDescription>
                      Add any notes or additional information
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Label htmlFor="allocation_notes">Allocation Notes</Label>
                      <Textarea
                        id="allocation_notes"
                        value={data.allocation_notes}
                        onChange={(e) => setData('allocation_notes', e.target.value)}
                        placeholder="Enter any notes about this allocation"
                        rows={3}
                        className={errors.allocation_notes ? 'border-red-500' : ''}
                      />
                      {errors.allocation_notes && (
                        <p className="text-sm text-red-600">{errors.allocation_notes}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end space-x-4">
                  <Link href="/hostel/allocations">
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </Link>
                  <Button type="submit" disabled={processing}>
                    {processing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Allocating...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Allocate Student
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        
      </div>
    </AuthenticatedLayout>
  );
}



