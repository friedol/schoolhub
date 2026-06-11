import React from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatCard, StatGrid } from '@/components/ui/stat-card';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  BookOpen, 
  DollarSign,
  Calendar,
  FileText,
  PieChart,
  Activity,
  Target,
  Award,
  Clock
} from 'lucide-react';

interface DashboardProps {
  analytics: {
    academic: any;
    financial: any;
    operational: any;
    communication: any;
  };
  role: string;
}

export default function ReportsDashboard({ analytics, role }: DashboardProps) {
  const getRoleSpecificMetrics = () => {
    switch (role) {
      case 'headteacher':
        return [
          { title: 'Total Students', value: analytics.academic?.student_statistics?.total_students || 0, icon: Users, color: 'blue' },
          { title: 'Total Teachers', value: analytics.academic?.teacher_statistics?.total_teachers || 0, icon: Users, color: 'green' },
          { title: 'Attendance Rate', value: `${analytics.academic?.student_statistics?.attendance_rate || 0}%`, icon: Activity, color: 'purple' },
          { title: 'Fee Collection', value: `${analytics.financial?.fee_collection?.collection_rate || 0}%`, icon: DollarSign, color: 'orange' },
        ];
      case 'bursar':
        return [
          { title: 'Total Revenue', value: `TZS ${(analytics.financial?.fee_collection?.total_fees || 0).toLocaleString()}`, icon: DollarSign, color: 'green' },
          { title: 'Collected Fees', value: `TZS ${(analytics.financial?.fee_collection?.collected_fees || 0).toLocaleString()}`, icon: Target, color: 'blue' },
          { title: 'Outstanding', value: `TZS ${(analytics.financial?.fee_collection?.outstanding_fees || 0).toLocaleString()}`, icon: Clock, color: 'rose' },
          { title: 'Collection Rate', value: `${analytics.financial?.fee_collection?.collection_rate || 0}%`, icon: TrendingUp, color: 'purple' },
        ];
      case 'librarian':
        return [
          { title: 'Total Books', value: analytics.operational?.library_usage?.total_books || 0, icon: BookOpen, color: 'blue' },
          { title: 'Total Issuances', value: analytics.operational?.library_usage?.total_issuances || 0, icon: FileText, color: 'green' },
          { title: 'Overdue Books', value: analytics.operational?.library_usage?.overdue_books || 0, icon: Clock, color: 'rose' },
          { title: 'Utilization Rate', value: `${analytics.operational?.library_usage?.utilization_rate || 0}%`, icon: Activity, color: 'purple' },
        ];
      default:
        return [
          { title: 'Total Students', value: analytics.academic?.student_statistics?.total_students || 0, icon: Users, color: 'blue' },
          { title: 'Total Teachers', value: analytics.academic?.teacher_statistics?.total_teachers || 0, icon: Users, color: 'green' },
          { title: 'Total Books', value: analytics.operational?.library_usage?.total_books || 0, icon: BookOpen, color: 'purple' },
          { title: 'Collection Rate', value: `${analytics.financial?.fee_collection?.collection_rate || 0}%`, icon: DollarSign, color: 'orange' },
        ];
    }
  };

  const metrics = getRoleSpecificMetrics();

  return (
    <AuthenticatedLayout>
      <Head title="Reports & Analytics Dashboard" />

      <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
        
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics Dashboard</h1>
            <p className="mt-2 text-gray-600">
              Comprehensive insights and analytics for school operations
            </p>
          </div>

          {/* Key Metrics */}
          <div className="mb-8">
            <StatGrid cols={4}>
              {metrics.map((metric, index) => (
                <StatCard
                  key={index}
                  title={metric.title}
                  value={metric.value}
                  icon={metric.icon}
                  color={metric.color as any}
                />
              ))}
            </StatGrid>
          </div>

          {/* Charts and Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Academic Performance Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Academic Performance
                </CardTitle>
                <CardDescription>
                  Class-wise performance overview
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Performance Chart</p>
                    <p className="text-sm text-gray-400">Chart visualization will be implemented</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Financial Overview Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="mr-2 h-5 w-5" />
                  Financial Overview
                </CardTitle>
                <CardDescription>
                  Revenue and expense breakdown
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Financial Chart</p>
                    <p className="text-sm text-gray-400">Chart visualization will be implemented</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Reports */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Academic Reports</CardTitle>
                <CardDescription>
                  Student and teacher performance reports
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  Student Performance Report
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="mr-2 h-4 w-4" />
                  Teacher Effectiveness Report
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Activity className="mr-2 h-4 w-4" />
                  Attendance Summary Report
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Award className="mr-2 h-4 w-4" />
                  Examination Analysis Report
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Financial Reports</CardTitle>
                <CardDescription>
                  Fee collection and expense reports
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <DollarSign className="mr-2 h-4 w-4" />
                  Fee Collection Report
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Expense Analysis Report
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Target className="mr-2 h-4 w-4" />
                  Budget vs Actual Report
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  Financial Statements
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Operational Reports</CardTitle>
                <CardDescription>
                  Inventory and resource utilization reports
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Inventory Status Report
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Activity className="mr-2 h-4 w-4" />
                  Transport Utilization Report
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="mr-2 h-4 w-4" />
                  Hostel Occupancy Report
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  Library Usage Report
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Report Activity</CardTitle>
              <CardDescription>
                Latest reports generated and accessed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Student Performance Report</p>
                      <p className="text-sm text-gray-500">Generated 2 hours ago</p>
                    </div>
                  </div>
                  <Badge variant="secondary">PDF</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Fee Collection Report</p>
                      <p className="text-sm text-gray-500">Generated 4 hours ago</p>
                    </div>
                  </div>
                  <Badge variant="secondary">Excel</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <BookOpen className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Library Usage Report</p>
                      <p className="text-sm text-gray-500">Generated 1 day ago</p>
                    </div>
                  </div>
                  <Badge variant="secondary">PDF</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        
      </div>
    </AuthenticatedLayout>
  );
}



