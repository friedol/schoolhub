import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  Users, 
  FileText, 
  Wrench, 
  Package,
  Download,
  TrendingUp,
  Building2,
  Calendar,
  User
} from 'lucide-react';

interface Hostel {
  id: number;
  name: string;
}

interface HostelReportsIndexProps {
  hostels: Hostel[];
}

export default function HostelReportsIndex({ hostels }: HostelReportsIndexProps) {
  const reportTypes = [
    {
      id: 'occupancy',
      title: 'Occupancy Report',
      description: 'View hostel occupancy rates and capacity utilization',
      icon: <Users className="h-8 w-8 text-blue-600" />,
      color: 'bg-blue-50 hover:bg-blue-100',
      borderColor: 'border-blue-200',
    },
    {
      id: 'allocation',
      title: 'Student Allocation Report',
      description: 'Detailed report of student allocations by hostel, floor, and room',
      icon: <Building2 className="h-8 w-8 text-green-600" />,
      color: 'bg-green-50 hover:bg-green-100',
      borderColor: 'border-green-200',
    },
    {
      id: 'leave',
      title: 'Leave Application Report',
      description: 'Track leave applications, approvals, and student movements',
      icon: <FileText className="h-8 w-8 text-purple-600" />,
      color: 'bg-purple-50 hover:bg-purple-100',
      borderColor: 'border-purple-200',
    },
    {
      id: 'maintenance',
      title: 'Maintenance Report',
      description: 'Monitor maintenance requests, completion rates, and costs',
      icon: <Wrench className="h-8 w-8 text-orange-600" />,
      color: 'bg-orange-50 hover:bg-orange-100',
      borderColor: 'border-orange-200',
    },
    {
      id: 'inventory',
      title: 'Inventory Report',
      description: 'Track hostel inventory, asset values, and condition status',
      icon: <Package className="h-8 w-8 text-indigo-600" />,
      color: 'bg-indigo-50 hover:bg-indigo-100',
      borderColor: 'border-indigo-200',
    },
    {
      id: 'warden',
      title: 'Warden Performance Report',
      description: 'Monitor warden assignments, duty rosters, and performance',
      icon: <User className="h-8 w-8 text-teal-600" />,
      color: 'bg-teal-50 hover:bg-teal-100',
      borderColor: 'border-teal-200',
    },
  ];

  return (
    <AuthenticatedLayout>
      <Head title="Hostel Reports" />

      <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
        
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 text-gray-900">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Hostel Reports</h1>
                <p className="text-gray-600 mt-2">Generate comprehensive reports for hostel management</p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Hostels</CardTitle>
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{hostels.length}</div>
                    <p className="text-xs text-muted-foreground">
                      Active hostels in system
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Available Reports</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{reportTypes.length}</div>
                    <p className="text-xs text-muted-foreground">
                      Different report types
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Export Formats</CardTitle>
                    <Download className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">2</div>
                    <p className="text-xs text-muted-foreground">
                      PDF and Excel formats
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Real-time Data</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">Live</div>
                    <p className="text-xs text-muted-foreground">
                      Always up-to-date information
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Report Types */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reportTypes.map((report) => (
                  <Link key={report.id} href={`/hostel/reports/${report.id}`}>
                    <Card className={`${report.color} ${report.borderColor} border-2 hover:shadow-lg transition-all duration-200 cursor-pointer`}>
                      <CardHeader>
                        <div className="flex items-center space-x-4">
                          {report.icon}
                          <div>
                            <CardTitle className="text-lg">{report.title}</CardTitle>
                            <CardDescription className="mt-1">
                              {report.description}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <Button variant="outline" size="sm">
                            View Report
                          </Button>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-1" />
                              PDF
                            </Button>
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-1" />
                              Excel
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>

              {/* Recent Reports */}
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle>Recent Reports</CardTitle>
                  <CardDescription>Your recently generated reports</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Users className="h-8 w-8 text-blue-600" />
                        <div>
                          <h3 className="font-semibold">Occupancy Report - All Hostels</h3>
                          <p className="text-sm text-gray-600">Generated on {new Date().toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Wrench className="h-8 w-8 text-orange-600" />
                        <div>
                          <h3 className="font-semibold">Maintenance Report - January 2024</h3>
                          <p className="text-sm text-gray-600">Generated on {new Date(Date.now() - 86400000).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <FileText className="h-8 w-8 text-purple-600" />
                        <div>
                          <h3 className="font-semibold">Leave Application Report - Term 1</h3>
                          <p className="text-sm text-gray-600">Generated on {new Date(Date.now() - 172800000).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Report Features */}
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle>Report Features</CardTitle>
                  <CardDescription>What you can do with our reporting system</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="text-center">
                      <Calendar className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">Date Range Filtering</h3>
                      <p className="text-sm text-gray-600">
                        Generate reports for specific time periods with custom date ranges
                      </p>
                    </div>
                    <div className="text-center">
                      <Building2 className="h-12 w-12 text-green-600 mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">Hostel-Specific Reports</h3>
                      <p className="text-sm text-gray-600">
                        Filter reports by specific hostels or view consolidated data
                      </p>
                    </div>
                    <div className="text-center">
                      <Download className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">Multiple Export Formats</h3>
                      <p className="text-sm text-gray-600">
                        Download reports in PDF or Excel format for further analysis
                      </p>
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



