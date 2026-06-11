import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Package, 
  Plus, 
  Search, 
  Filter,
  Building2,
  Box,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface Hostel {
  id: number;
  name: string;
}

interface HostelRoom {
  id: number;
  room_number: string;
}

interface InventoryItem {
  id: number;
  name: string;
  description?: string;
  unit_cost?: number;
  unit_of_measure?: string;
}

interface HostelInventory {
  id: number;
  hostel: Hostel;
  inventory_item: InventoryItem;
  room?: HostelRoom;
  quantity: number;
  condition: string;
  notes?: string;
}

interface HostelInventoryIndexProps {
  inventory: {
    data: HostelInventory[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  hostels: Hostel[];
  stats: {
    total_items: number;
    total_value: number;
    items_by_condition: Record<string, number>;
  };
  conditionOptions: Record<string, string>;
  filters: {
    hostel_id?: string;
    room_id?: string;
    condition?: string;
    search?: string;
  };
}

export default function HostelInventoryIndex({ 
  inventory, 
  hostels, 
  stats, 
  conditionOptions, 
  filters 
}: HostelInventoryIndexProps) {
  const getConditionIcon = (condition: string) => {
    switch (condition) {
      case 'excellent':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'good':
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'fair':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'poor':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Box className="h-4 w-4 text-gray-600" />;
    }
  };

  const getConditionBadge = (condition: string) => {
    switch (condition) {
      case 'excellent':
        return <Badge variant="default">Excellent</Badge>;
      case 'good':
        return <Badge variant="default">Good</Badge>;
      case 'fair':
        return <Badge variant="secondary">Fair</Badge>;
      case 'poor':
        return <Badge variant="destructive">Poor</Badge>;
      default:
        return <Badge variant="outline">{condition}</Badge>;
    }
  };

  return (
    <AuthenticatedLayout>
      <Head title="Hostel Inventory" />

      <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
        
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 text-gray-900">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Hostel Inventory</h1>
                  <p className="text-gray-600 mt-2">Manage hostel inventory and assets</p>
                </div>
                <Link href="/hostel/inventory/create">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Item
                  </Button>
                </Link>
              </div>

              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.total_items}</div>
                    <p className="text-xs text-muted-foreground">
                      Total quantity across all hostels
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">TZS {stats.total_value.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                      Total inventory value
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Excellent Condition</CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.items_by_condition.excellent || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      Items in excellent condition
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Poor Condition</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.items_by_condition.poor || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      Items needing attention
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
                          placeholder="Search items..."
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
                      <label className="text-sm font-medium">Room</label>
                      <Select defaultValue={filters.room_id}>
                        <SelectTrigger>
                          <SelectValue placeholder="All rooms" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All rooms</SelectItem>
                          {/* Room options would be populated based on selected hostel */}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Condition</label>
                      <Select defaultValue={filters.condition}>
                        <SelectTrigger>
                          <SelectValue placeholder="All conditions" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All conditions</SelectItem>
                          {Object.entries(conditionOptions).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Inventory List */}
              <Card>
                <CardHeader>
                  <CardTitle>Inventory Items</CardTitle>
                  <CardDescription>
                    Showing {inventory.data.length} of {inventory.total} items
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {inventory.data.length === 0 ? (
                    <div className="text-center py-12">
                      <Package className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No inventory items</h3>
                      <p className="mt-1 text-sm text-gray-500">Get started by adding inventory items to hostels.</p>
                      <div className="mt-6">
                        <Link href="/hostel/inventory/create">
                          <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Item
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {inventory.data.map((item) => (
                        <div key={item.id} className="border rounded-lg p-4 hover:bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="text-lg font-semibold">{item.inventory_item.name}</h3>
                                {getConditionIcon(item.condition)}
                                {getConditionBadge(item.condition)}
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                                <div className="flex items-center">
                                  <Building2 className="h-4 w-4 mr-2" />
                                  <span>{item.hostel.name}</span>
                                </div>
                                {item.room && (
                                  <div className="flex items-center">
                                    <Box className="h-4 w-4 mr-2" />
                                    <span>Room {item.room.room_number}</span>
                                  </div>
                                )}
                                <div className="flex items-center">
                                  <Package className="h-4 w-4 mr-2" />
                                  <span>Quantity: {item.quantity}</span>
                                </div>
                                {item.inventory_item.unit_cost && (
                                  <div className="flex items-center">
                                    <DollarSign className="h-4 w-4 mr-2" />
                                    <span>Value: TZS {(item.quantity * item.inventory_item.unit_cost).toLocaleString()}</span>
                                  </div>
                                )}
                              </div>

                              {item.inventory_item.description && (
                                <div className="mt-2 text-sm text-gray-600">
                                  <strong>Description:</strong> {item.inventory_item.description}
                                </div>
                              )}

                              <div className="mt-2 text-sm text-gray-500">
                                <span>Unit Cost: TZS {item.inventory_item.unit_cost?.toLocaleString() || 'N/A'}</span>
                                {item.inventory_item.unit_of_measure && (
                                  <>
                                    <span className="mx-2">•</span>
                                    <span>Unit: {item.inventory_item.unit_of_measure}</span>
                                  </>
                                )}
                              </div>

                              {item.notes && (
                                <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                  <strong>Notes:</strong> {item.notes}
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Link href={`/hostel/inventory/${item.id}`}>
                                <Button variant="outline" size="sm">
                                  View
                                </Button>
                              </Link>
                              <Button variant="outline" size="sm">
                                Edit
                              </Button>
                              <Button variant="outline" size="sm">
                                Transfer
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



