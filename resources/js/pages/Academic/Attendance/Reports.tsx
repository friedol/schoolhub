import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart3, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AttendanceReports() {
    return (
        <AppLayout>
            <Head title="Attendance Analytics & Reports" />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Analytics & Reports</h1>
                        <p className="text-muted-foreground">Advanced insights and exportable attendance data</p>
                    </div>
                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Export All Data
                    </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-base flex items-center">
                                <BarChart3 className="mr-2 h-5 w-5 text-emerald-500" />
                                Top Attendance Classes
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="border-t pt-4 h-[250px] flex items-center justify-center">
                            <p className="text-muted-foreground text-sm">Class ranking data visualization pending...</p>
                        </CardContent>
                    </Card>
                    
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-base flex items-center">
                                <BarChart3 className="mr-2 h-5 w-5 text-red-500" />
                                Frequently Absent Students
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="border-t pt-4 h-[250px] flex items-center justify-center">
                            <p className="text-muted-foreground text-sm">Absentees watchlist pending...</p>
                        </CardContent>
                    </Card>
                </div>

                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-base">Comprehensive Monthly Comparison</CardTitle>
                        <CardDescription>Compare overall attendance rates month over month</CardDescription>
                    </CardHeader>
                    <CardContent className="border-t pt-4 h-[350px] flex items-center justify-center bg-slate-50/50">
                        <p className="text-muted-foreground text-sm">Interactive Line Chart Placeholder</p>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
