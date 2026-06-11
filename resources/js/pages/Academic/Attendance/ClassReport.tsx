import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, FileText } from 'lucide-react';

export default function ClassReport() {
    return (
        <AppLayout>
            <Head title="Class Attendance Report" />
            <div className="flex flex-col gap-6 p-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Class Attendance Report</h1>
                    <p className="text-muted-foreground">View detailed attendance records for a specific class</p>
                </div>

                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center">
                            <Users className="mr-2 h-5 w-5 text-indigo-500" />
                            Class Attendance Data
                        </CardTitle>
                        <CardDescription>Select a class and date range to generate the report</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[400px] flex flex-col items-center justify-center text-center border-t mt-4">
                        <div className="rounded-full bg-indigo-50 p-4 mb-4">
                            <FileText className="h-8 w-8 text-indigo-600" />
                        </div>
                        <p className="font-medium">Class Reports Module</p>
                        <p className="text-sm text-muted-foreground max-w-sm mt-2">
                            The advanced datatable interface for viewing and exporting full class attendance histories will be populated here.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
