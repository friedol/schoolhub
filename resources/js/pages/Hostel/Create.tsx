import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Building2, Save, ArrowLeft } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface HostelCreateProps {
  // No additional props needed for create form
}

export default function HostelCreate({}: HostelCreateProps) {
  const { data, setData, post, processing, errors } = useForm({
    name: '',
    type: '',
    location: '',
    total_capacity: '',
    is_active: true,
    notes: '',
  });

  const [isActive, setIsActive] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/hostel');
  };

  const hostelTypes = [
    { value: 'boys', label: 'Boys Hostel' },
    { value: 'girls', label: 'Girls Hostel' },
    { value: 'mixed', label: 'Mixed Hostel' },
    { value: 'staff', label: 'Staff Quarters' },
  ];

  return (
    <AuthenticatedLayout>
      <Head title="Create Hostel" />

      <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
        
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 text-gray-900">
              <div className="flex items-center space-x-4 mb-8">
                <Link href="/hostel">
                  <Button variant="outline" size="sm">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                </Link>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Create New Hostel</h1>
                  <p className="text-gray-600 mt-2">Add a new hostel to the system</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Building2 className="mr-2 h-5 w-5" />
                      Hostel Information
                    </CardTitle>
                    <CardDescription>
                      Enter the basic information for the new hostel
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Hostel Name *</Label>
                        <Input
                          id="name"
                          type="text"
                          value={data.name}
                          onChange={(e) => setData('name', e.target.value)}
                          placeholder="Enter hostel name"
                          className={errors.name ? 'border-red-500' : ''}
                        />
                        {errors.name && (
                          <p className="text-sm text-red-600">{errors.name}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="type">Hostel Type *</Label>
                        <Select value={data.type} onValueChange={(value) => setData('type', value)}>
                          <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                            <SelectValue placeholder="Select hostel type" />
                          </SelectTrigger>
                          <SelectContent>
                            {hostelTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.type && (
                          <p className="text-sm text-red-600">{errors.type}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Location *</Label>
                      <Input
                        id="location"
                        type="text"
                        value={data.location}
                        onChange={(e) => setData('location', e.target.value)}
                        placeholder="Enter hostel location"
                        className={errors.location ? 'border-red-500' : ''}
                      />
                      {errors.location && (
                        <p className="text-sm text-red-600">{errors.location}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="total_capacity">Total Capacity *</Label>
                        <Input
                          id="total_capacity"
                          type="number"
                          min="1"
                          value={data.total_capacity}
                          onChange={(e) => setData('total_capacity', e.target.value)}
                          placeholder="Enter total bed capacity"
                          className={errors.total_capacity ? 'border-red-500' : ''}
                        />
                        {errors.total_capacity && (
                          <p className="text-sm text-red-600">{errors.total_capacity}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="is_active">Status</Label>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="is_active"
                            checked={isActive}
                            onCheckedChange={(checked) => {
                              setIsActive(checked);
                              setData('is_active', checked);
                            }}
                          />
                          <Label htmlFor="is_active">
                            {isActive ? 'Active' : 'Inactive'}
                          </Label>
                        </div>
                        <p className="text-xs text-gray-500">
                          Active hostels can be used for student allocation
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        value={data.notes}
                        onChange={(e) => setData('notes', e.target.value)}
                        placeholder="Enter any additional notes about the hostel"
                        rows={3}
                        className={errors.notes ? 'border-red-500' : ''}
                      />
                      {errors.notes && (
                        <p className="text-sm text-red-600">{errors.notes}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end space-x-4">
                  <Link href="/hostel">
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </Link>
                  <Button type="submit" disabled={processing}>
                    {processing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Create Hostel
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



