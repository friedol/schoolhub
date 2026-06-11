import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, Edit, Trash2, MoreHorizontal, Sliders, Star } from 'lucide-react';
import Swal from 'sweetalert2';

interface GradingScale {
    id: number; name: string; level: string; scale_type: string;
    grades: Record<string, { min: number; max: number; points: number; description: string }>;
    is_active: boolean; is_default: boolean;
}
interface Props { scales: { data: GradingScale[] } }

const levelLabels: Record<string, string> = { pre_primary: 'Pre-Primary', primary: 'Primary', o_level: 'O-Level', a_level: 'A-Level' };
const gradeColors = ['bg-emerald-100 text-emerald-700', 'bg-blue-100 text-blue-700', 'bg-violet-100 text-violet-700', 'bg-amber-100 text-amber-700', 'bg-red-100 text-red-700'];

export default function GradingScalesIndex({ scales }: Props) {
    const handleDelete = (scale: GradingScale) => {
        if (scale.is_default) return;
        Swal.fire({ title: 'Delete grading scale?', text: `"${scale.name}" will be permanently removed.`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', confirmButtonText: 'Delete' })
            .then(r => r.isConfirmed && router.delete(`/academic/grading-scales/${scale.id}`));
    };

    const active = scales.data.filter(s => s.is_active).length;

    return (
        <AppLayout>
            <Head title="Grading Scales" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Grading Scales</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">Define NECTA-compatible grading scales for assessments and exams</p>
                    </div>
                    <Button size="sm" asChild>
                        <Link href="/academic/grading-scales/create"><Plus className="mr-2 h-4 w-4" />New Scale</Link>
                    </Button>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    {[
                        { label: 'Total Scales', value: scales.data.length, color: 'text-blue-600 bg-blue-50' },
                        { label: 'Active', value: active, color: 'text-emerald-600 bg-emerald-50' },
                        { label: 'Default', value: scales.data.filter(s => s.is_default).length, color: 'text-amber-600 bg-amber-50' },
                    ].map(s => (
                        <Card key={s.label} className="border shadow-sm">
                            <CardContent className="p-4 flex items-center gap-3">
                                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${s.color}`}><Sliders className="h-5 w-5" /></div>
                                <div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-xl font-bold">{s.value}</p></div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Card className="border shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">All Grading Scales</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/40">
                                    <TableHead className="pl-6">Name</TableHead>
                                    <TableHead>Level</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Grade Bands</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right pr-6">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {scales.data.map(scale => (
                                    <TableRow key={scale.id} className="hover:bg-muted/30">
                                        <TableCell className="pl-6">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-sm">{scale.name}</span>
                                                {scale.is_default && (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700 font-medium">
                                                        <Star className="h-3 w-3" />Default
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm text-muted-foreground">{levelLabels[scale.level] || scale.level}</span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="text-xs">{scale.scale_type}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {Object.entries(scale.grades || {}).map(([grade, info], i) => (
                                                    <span key={grade} className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${gradeColors[i % gradeColors.length]}`}>
                                                        {grade}: {info.min}–{info.max}%
                                                    </span>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {scale.is_active
                                                ? <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">Active</Badge>
                                                : <Badge variant="secondary" className="text-xs">Inactive</Badge>}
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild><Link href={`/academic/grading-scales/${scale.id}/edit`}><Edit className="mr-2 h-4 w-4" />Edit</Link></DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDelete(scale)} className={`text-red-600 ${scale.is_default ? 'opacity-50 pointer-events-none' : ''}`}>
                                                        <Trash2 className="mr-2 h-4 w-4" />{scale.is_default ? 'Cannot delete default' : 'Delete'}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        {scales.data.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <Sliders className="h-10 w-10 text-muted-foreground/50 mb-3" />
                                <p className="text-sm font-medium">No grading scales yet</p>
                                <p className="text-xs text-muted-foreground mt-1 mb-4">Create NECTA-compatible grading scales</p>
                                <Button size="sm" asChild><Link href="/academic/grading-scales/create"><Plus className="mr-2 h-4 w-4" />New Scale</Link></Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
