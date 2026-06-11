import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Copy, 
  Trash2,
  Eye,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface MessageTemplate {
  id: number;
  name: string;
  subject: string;
  type: string;
  category: string;
  language: string;
  is_active: boolean;
  created_by: {
    name: string;
  };
  created_at: string;
  messages_count: number;
}

interface Props {
  templates: {
    data: MessageTemplate[];
    links: any[];
    meta: any;
  };
  stats: {
    total_templates: number;
    active_templates: number;
    sms_templates: number;
    email_templates: number;
  };
  typeOptions: Record<string, string>;
  categoryOptions: Record<string, string>;
  languageOptions: Record<string, string>;
  filters: {
    type?: string;
    category?: string;
    language?: string;
    is_active?: string;
    search?: string;
  };
}

export default function MessageTemplatesIndex({ 
  templates, 
  stats, 
  typeOptions, 
  categoryOptions, 
  languageOptions, 
  filters 
}: Props) {
  return (
    <AuthenticatedLayout>
      <Head title="Message Templates" />

      <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
        
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Message Templates</h1>
                <p className="mt-2 text-gray-600">
                  Manage reusable message templates for SMS, email, and push notifications
                </p>
              </div>
              <Link href="/communication/templates/create">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Template
                </Button>
              </Link>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_templates}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.active_templates}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">SMS Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.sms_templates}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Email Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.email_templates}</div>
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
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <Input
                    placeholder="Search templates..."
                    defaultValue={filters.search}
                    className="w-full"
                  />
                </div>
                <Select defaultValue={filters.type}>
                  <SelectTrigger>
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {Object.entries(typeOptions).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select defaultValue={filters.category}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {Object.entries(categoryOptions).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select defaultValue={filters.language}>
                  <SelectTrigger>
                    <SelectValue placeholder="Language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Languages</SelectItem>
                    {Object.entries(languageOptions).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select defaultValue={filters.is_active}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="1">Active</SelectItem>
                    <SelectItem value="0">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Templates Table */}
          <Card>
            <CardHeader>
              <CardTitle>Templates</CardTitle>
              <CardDescription>
                {templates.meta.total} templates found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {templates.data.length > 0 ? (
                <div className="space-y-4">
                  {templates.data.map((template) => (
                    <div key={template.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-medium">{template.name}</h3>
                          <Badge variant={template.is_active ? 'default' : 'secondary'}>
                            {template.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          <Badge variant="outline">{typeOptions[template.type]}</Badge>
                          <Badge variant="outline">{categoryOptions[template.category]}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {template.subject || 'No subject'}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                          <span>Created by {template.created_by.name}</span>
                          <span>•</span>
                          <span>{new Date(template.created_at).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>{template.messages_count} messages sent</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Link href={`/communication/templates/${template.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/communication/templates/${template.id}/edit`}>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Copy className="mr-2 h-4 w-4" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              {template.is_active ? (
                                <>
                                  <ToggleLeft className="mr-2 h-4 w-4" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <ToggleRight className="mr-2 h-4 w-4" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No templates found</p>
                  <Link href="/communication/templates/create">
                    <Button className="mt-4">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Your First Template
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        
      </div>
    </AuthenticatedLayout>
  );
}



