import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
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
  Eye,
  Pin,
  PinOff,
  Send,
  Archive,
  Trash2,
  MessageSquare
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Announcement {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  priority: string;
  target_audience: string;
  is_published: boolean;
  is_pinned: boolean;
  published_at: string;
  author: {
    name: string;
  };
  views_count: number;
  comments_count: number;
}

interface Props {
  announcements: {
    data: Announcement[];
    links: any[];
    meta: any;
  };
  stats: {
    total_announcements: number;
    published_announcements: number;
    pinned_announcements: number;
    urgent_announcements: number;
  };
  categoryOptions: Record<string, string>;
  priorityOptions: Record<string, string>;
  targetAudienceOptions: Record<string, string>;
  languageOptions: Record<string, string>;
  filters: {
    category?: string;
    priority?: string;
    target_audience?: string;
    is_published?: string;
    is_pinned?: string;
    search?: string;
  };
}

export default function AnnouncementsIndex({ 
  announcements, 
  stats, 
  categoryOptions, 
  priorityOptions, 
  targetAudienceOptions, 
  languageOptions, 
  filters 
}: Props) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'normal':
        return 'bg-blue-100 text-blue-800';
      case 'low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AppLayout>
      <Head title="Announcements" />

      <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
        
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
                <p className="mt-2 text-gray-600">
                  Manage school announcements and news
                </p>
              </div>
              <Link href="/communication/announcements/create">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Announcement
                </Button>
              </Link>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Announcements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_announcements}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Published</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.published_announcements}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pinned</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pinned_announcements}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Urgent</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.urgent_announcements}</div>
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
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <div>
                  <Input
                    placeholder="Search announcements..."
                    defaultValue={filters.search}
                    className="w-full"
                  />
                </div>
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
                <Select defaultValue={filters.priority}>
                  <SelectTrigger>
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    {Object.entries(priorityOptions).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select defaultValue={filters.target_audience}>
                  <SelectTrigger>
                    <SelectValue placeholder="Audience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Audiences</SelectItem>
                    {Object.entries(targetAudienceOptions).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select defaultValue={filters.is_published}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="1">Published</SelectItem>
                    <SelectItem value="0">Draft</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue={filters.is_pinned}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pinned" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="1">Pinned</SelectItem>
                    <SelectItem value="0">Not Pinned</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Announcements List */}
          <Card>
            <CardHeader>
              <CardTitle>Announcements</CardTitle>
              <CardDescription>
                {announcements.meta.total} announcements found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {announcements.data.length > 0 ? (
                <div className="space-y-4">
                  {announcements.data.map((announcement) => (
                    <div key={announcement.id} className="flex items-start justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          {announcement.is_pinned && (
                            <Pin className="h-4 w-4 text-yellow-500" />
                          )}
                          <h3 className="text-lg font-medium">{announcement.title}</h3>
                          <Badge className={getPriorityColor(announcement.priority)}>
                            {priorityOptions[announcement.priority]}
                          </Badge>
                          <Badge variant={announcement.is_published ? 'default' : 'secondary'}>
                            {announcement.is_published ? 'Published' : 'Draft'}
                          </Badge>
                          <Badge variant="outline">{categoryOptions[announcement.category]}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {announcement.excerpt}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>By {announcement.author.name}</span>
                          <span>•</span>
                          <span>{new Date(announcement.published_at).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>{announcement.views_count} views</span>
                          <span>•</span>
                          <span>{announcement.comments_count} comments</span>
                          <span>•</span>
                          <span>Target: {targetAudienceOptions[announcement.target_audience]}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Link href={`/communication/announcements/${announcement.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/communication/announcements/${announcement.id}/edit`}>
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
                            {!announcement.is_published && (
                              <DropdownMenuItem>
                                <Send className="mr-2 h-4 w-4" />
                                Publish
                              </DropdownMenuItem>
                            )}
                            {announcement.is_published && (
                              <DropdownMenuItem>
                                <Archive className="mr-2 h-4 w-4" />
                                Unpublish
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem>
                              {announcement.is_pinned ? (
                                <>
                                  <PinOff className="mr-2 h-4 w-4" />
                                  Unpin
                                </>
                              ) : (
                                <>
                                  <Pin className="mr-2 h-4 w-4" />
                                  Pin
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
                  <p className="text-muted-foreground">No announcements found</p>
                  <Link href="/communication/announcements/create">
                    <Button className="mt-4">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Your First Announcement
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        
      </div>
    </AppLayout>
  );
}
