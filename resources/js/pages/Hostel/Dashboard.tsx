import React from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatCard, StatGrid } from '@/components/ui/stat-card';
import {
  Building2,
  Users,
  Bed,
  FileText,
  Wrench,
  Package,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface DashboardStats {
  total_hostels: number;
  total_capacity: number;
  current_occupancy: number;
  occupancy_rate: number;
  pending_leave_applications: number;
  pending_maintenance_requests: number;
  urgent_maintenance_requests: number;
}

interface HostelDashboardProps {
  stats: DashboardStats;
}

export default function HostelDashboard({ stats }: HostelDashboardProps) {
  return (
    <AuthenticatedLayout>
      <Head title="Hostel Dashboard" />

      <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
        
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 text-gray-900">
              <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-base font-semibold text-gray-900">Hostel Management Dashboard</h1>
                  <p className="text-sm text-gray-600 mt-1">Overview of hostel operations and management</p>
                </div>
              </div>

              {/* Statistics Cards */}
              <div className="mb-8">
                <StatGrid cols={4}>
                  <StatCard
                    title="Total Rooms"
                    value={stats.total_hostels}
                    icon={Building2}
                    color="blue"
                  />
                  <StatCard
                    title="Occupied Rooms"
                    value={stats.current_occupancy}
                    icon={Users}
                    color="rose"
                  />
                  <StatCard
                    title="Available Beds"
                    value={stats.total_capacity - stats.current_occupancy}
                    icon={Bed}
                    color="green"
                  />
                  <StatCard
                    title="Total Residents"
                    value={stats.current_occupancy}
                    icon={Users}
                    color="emerald"
                  />
                  <StatCard
                    title="Pending Leave"
                    value={stats.pending_leave_applications}
                    icon={Clock}
                    color="amber"
                  />
                  <StatCard
                    title="Maintenance Requests"
                    value={stats.pending_maintenance_requests}
                    icon={Wrench}
                    color="orange"
                  />
                </StatGrid>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
                    <CardDescription className="text-xs">Common hostel management tasks</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full justify-start" variant="outline">
                      <Users className="mr-2 h-4 w-4" />
                      <span className="text-sm">Allocate Students</span>
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <FileText className="mr-2 h-4 w-4" />
                      <span className="text-sm">Process Leave Applications</span>
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Wrench className="mr-2 h-4 w-4" />
                      <span className="text-sm">Report Maintenance Issue</span>
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Package className="mr-2 h-4 w-4" />
                      <span className="text-sm">Manage Inventory</span>
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold">Pending Tasks</CardTitle>
                    <CardDescription className="text-xs">Items requiring attention</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {stats.pending_leave_applications > 0 && (
                      <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-yellow-600 mr-2" />
                          <span className="text-sm font-medium">Leave Applications</span>
                        </div>
                        <Badge variant="secondary">{stats.pending_leave_applications}</Badge>
                      </div>
                    )}

                    {stats.pending_maintenance_requests > 0 && (
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center">
                          <Wrench className="h-4 w-4 text-blue-600 mr-2" />
                          <span className="text-sm font-medium">Maintenance Requests</span>
                        </div>
                        <Badge variant="secondary">{stats.pending_maintenance_requests}</Badge>
                      </div>
                    )}

                    {stats.urgent_maintenance_requests > 0 && (
                      <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                        <div className="flex items-center">
                          <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                          <span className="text-sm font-medium">Urgent Maintenance</span>
                        </div>
                        <Badge variant="destructive">{stats.urgent_maintenance_requests}</Badge>
                      </div>
                    )}

                    {stats.pending_leave_applications === 0 &&
                     stats.pending_maintenance_requests === 0 &&
                     stats.urgent_maintenance_requests === 0 && (
                      <div className="flex items-center justify-center p-6 text-gray-500">
                        <CheckCircle className="h-8 w-8 mr-2" />
                        <span className="text-sm">No pending tasks</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-semibold">Recent Activity</CardTitle>
                  <CardDescription className="text-xs">Latest hostel management activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">New student allocation</p>
                        <p className="text-xs text-gray-500">John Doe allocated to Room 101, Bed A</p>
                      </div>
                      <span className="text-xs text-gray-500">2 hours ago</span>
                    </div>

                    <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Leave application approved</p>
                        <p className="text-xs text-gray-500">Weekend leave for Jane Smith</p>
                      </div>
                      <span className="text-xs text-gray-500">4 hours ago</span>
                    </div>

                    <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Maintenance request submitted</p>
                        <p className="text-xs text-gray-500">Broken window in Room 205</p>
                      </div>
                      <span className="text-xs text-gray-500">6 hours ago</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        
      </div>
    </AuthenticatedLayout>
  );
}



