import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '@/components/ui/table';
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
    Shield, 
    Plus, 
    Search, 
    MoreHorizontal, 
    Edit, 
    Trash2, 
    Users, 
    CheckCircle, 
    XCircle,
    AlertCircle
} from 'lucide-react';

interface Role {
    id: number;
    name: string;
    display_name: string;
    description?: string;
    is_system_role: boolean;
    is_active: boolean;
    users_count: number;
    created_at: string;
    updated_at: string;
}

interface Props {
    roles: {
        data: Role[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    can: {
        createRole: boolean;
        editRole: boolean;
        deleteRole: boolean;
    };
}

export default function RolesIndex({ roles, can }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const filteredRoles = roles.data.filter(role =>
        role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = (role: Role) => {
        if (role.is_system_role) {
            setMessage({ type: 'error', text: 'Cannot delete system roles.' });
            return;
        }

        if (role.users_count > 0) {
            setMessage({ type: 'error', text: 'Cannot delete role with assigned users.' });
            return;
        }

        if (confirm(`Are you sure you want to delete the role "${role.display_name}"?`)) {
            router.delete(`/system/roles/${role.id}`, {
                onSuccess: () => {
                    setMessage({ type: 'success', text: 'Role deleted successfully.' });
                },
                onError: (errors) => {
                    setMessage({ type: 'error', text: Object.values(errors)[0] as string });
                }
            });
        }
    };

    const getRoleStatusBadge = (role: Role) => {
        if (!role.is_active) {
            return <Badge variant="secondary">Inactive</Badge>;
        }
        if (role.is_system_role) {
            return <Badge variant="default">System Role</Badge>;
        }
        return <Badge variant="outline">Custom Role</Badge>;
    };

    return (
        <AppLayout title="User Roles">
            <Head title="User Roles" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                                        <Shield className="h-8 w-8 mr-3 text-blue-600" />
                                        User Roles
                                    </h2>
                                    <p className="text-gray-600">Manage user roles and permissions</p>
                                </div>
                                {can.createRole && (
                                    <Link href="/system/roles/create">
                                        <Button>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Create Role
                                        </Button>
                                    </Link>
                                )}
                            </div>

                            {message && (
                                <Alert className={`mb-6 ${message.type === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
                                    {message.type === 'error' ? (
                                        <AlertCircle className="h-4 w-4 text-red-600" />
                                    ) : (
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                    )}
                                    <AlertDescription className={message.type === 'error' ? 'text-red-800' : 'text-green-800'}>
                                        {message.text}
                                    </AlertDescription>
                                </Alert>
                            )}

                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle>Roles ({roles.total})</CardTitle>
                                            <CardDescription>
                                                Manage user roles and their permissions
                                            </CardDescription>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <Input
                                                    placeholder="Search roles..."
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    className="pl-10 w-64"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Role</TableHead>
                                                    <TableHead>Description</TableHead>
                                                    <TableHead>Type</TableHead>
                                                    <TableHead>Users</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead>Created</TableHead>
                                                    <TableHead className="w-[50px]"></TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {filteredRoles.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={7} className="text-center py-8">
                                                            <div className="flex flex-col items-center">
                                                                <Shield className="h-12 w-12 text-gray-400 mb-4" />
                                                                <p className="text-gray-500">No roles found</p>
                                                                {can.createRole && (
                                                                    <Link href="/system/roles/create" className="mt-2">
                                                                        <Button variant="outline" size="sm">
                                                                            <Plus className="h-4 w-4 mr-2" />
                                                                            Create your first role
                                                                        </Button>
                                                                    </Link>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    filteredRoles.map((role) => (
                                                        <TableRow key={role.id}>
                                                            <TableCell>
                                                                <div>
                                                                    <div className="font-medium">{role.display_name}</div>
                                                                    <div className="text-sm text-gray-500">{role.name}</div>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="max-w-xs truncate">
                                                                    {role.description || 'No description'}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                {getRoleStatusBadge(role)}
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex items-center">
                                                                    <Users className="h-4 w-4 mr-1 text-gray-400" />
                                                                    {role.users_count}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex items-center">
                                                                    {role.is_active ? (
                                                                        <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                                                                    ) : (
                                                                        <XCircle className="h-4 w-4 text-red-500 mr-1" />
                                                                    )}
                                                                    <span className={role.is_active ? 'text-green-700' : 'text-red-700'}>
                                                                        {role.is_active ? 'Active' : 'Inactive'}
                                                                    </span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="text-sm text-gray-500">
                                                                    {new Date(role.created_at).toLocaleDateString()}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <Button variant="ghost" size="sm">
                                                                            <MoreHorizontal className="h-4 w-4" />
                                                                        </Button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent align="end">
                                                                        <DropdownMenuItem asChild>
                                                                            <Link href={`/system/roles/${role.id}`}>
                                                                                View Details
                                                                            </Link>
                                                                        </DropdownMenuItem>
                                                                        {can.editRole && (
                                                                            <DropdownMenuItem asChild>
                                                                                <Link href={`/system/roles/${role.id}/edit`}>
                                                                                    <Edit className="h-4 w-4 mr-2" />
                                                                                    Edit
                                                                                </Link>
                                                                            </DropdownMenuItem>
                                                                        )}
                                                                        {can.deleteRole && !role.is_system_role && role.users_count === 0 && (
                                                                            <DropdownMenuItem
                                                                                onClick={() => handleDelete(role)}
                                                                                className="text-red-600"
                                                                            >
                                                                                <Trash2 className="h-4 w-4 mr-2" />
                                                                                Delete
                                                                            </DropdownMenuItem>
                                                                        )}
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>

                                    {/* Pagination */}
                                    {roles.last_page > 1 && (
                                        <div className="flex items-center justify-between mt-4">
                                            <div className="text-sm text-gray-500">
                                                Showing {((roles.current_page - 1) * roles.per_page) + 1} to{' '}
                                                {Math.min(roles.current_page * roles.per_page, roles.total)} of{' '}
                                                {roles.total} results
                                            </div>
                                            <div className="flex space-x-2">
                                                {roles.current_page > 1 && (
                                                    <Link
                                                        href={`/system/roles?page=${roles.current_page - 1}`}
                                                        className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
                                                    >
                                                        Previous
                                                    </Link>
                                                )}
                                                {roles.current_page < roles.last_page && (
                                                    <Link
                                                        href={`/system/roles?page=${roles.current_page + 1}`}
                                                        className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
                                                    >
                                                        Next
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                
            </div>
        </AppLayout>
    );
}
