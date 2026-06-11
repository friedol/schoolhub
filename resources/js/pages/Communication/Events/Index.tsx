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
  Calendar,
  MapPin,
  Users,
  Clock,
  Send,
  Archive,
  Trash2,
  CheckCircle,
  XCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Event {
  id: number;
  title: string;
  description: string;
  event_type: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  location: string;
  is_all_day: boolean;
  is_public: boolean;
  requires_rsvp: boolean;
  max_attendees: number;
  status: string;
  organizer: {
    name: string;
  };
  views_count: number;
  rsvp_stats: {
    total_invited: number;
    attending: number;
    not_attending: number;
    maybe: number;
    no_response: number;
  };
}

interface Props {
  events: {
    data: Event[];
    links: any[];
    meta: any;
  };
  stats: {
    total_events: number;
    published_events: number;
    upcoming_events: number;
    events_requiring_rsvp: number;
  };
  eventTypeOptions: Record<string, string>;
  statusOptions: Record<string, string>;
  filters: {
    event_type?: string;
    status?: string;
    is_public?: string;
    requires_rsvp?: string;
    date_from?: string;
    date_to?: string;
    search?: string;
  };
}

export default function EventsIndex({ 
  events, 
  stats, 
  eventTypeOptions, 
  statusOptions, 
  filters 
}: Props) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEventTypeColor = (eventType: string) => {
    switch (eventType) {
      case 'academic':
        return 'bg-blue-100 text-blue-800';
      case 'sports':
        return 'bg-green-100 text-green-800';
      case 'cultural':
        return 'bg-yellow-100 text-yellow-800';
      case 'social':
        return 'bg-red-100 text-red-800';
      case 'emergency':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatEventDate = (event: Event) => {
    const startDate = new Date(event.start_date);
    const endDate = new Date(event.end_date);
    
    if (event.is_all_day) {
      if (startDate.toDateString() === endDate.toDateString()) {
        return startDate.toLocaleDateString();
      } else {
        return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
      }
    } else {
      const timeStr = event.start_time ? ` at ${event.start_time}` : '';
      return `${startDate.toLocaleDateString()}${timeStr}`;
    }
  };

  return (
    <AppLayout>
      <Head title="Events" />

      <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
        
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Events</h1>
                <p className="mt-2 text-gray-600">
                  Manage school events and activities
                </p>
              </div>
              <Link href="/communication/events/create">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Event
                </Button>
              </Link>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_events}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Published</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.published_events}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.upcoming_events}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Require RSVP</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.events_requiring_rsvp}</div>
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
                    placeholder="Search events..."
                    defaultValue={filters.search}
                    className="w-full"
                  />
                </div>
                <Select defaultValue={filters.event_type}>
                  <SelectTrigger>
                    <SelectValue placeholder="Event Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {Object.entries(eventTypeOptions).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select defaultValue={filters.status}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {Object.entries(statusOptions).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select defaultValue={filters.is_public}>
                  <SelectTrigger>
                    <SelectValue placeholder="Visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="1">Public</SelectItem>
                    <SelectItem value="0">Private</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue={filters.requires_rsvp}>
                  <SelectTrigger>
                    <SelectValue placeholder="RSVP" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="1">Requires RSVP</SelectItem>
                    <SelectItem value="0">No RSVP</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex space-x-2">
                  <Input
                    type="date"
                    placeholder="From Date"
                    defaultValue={filters.date_from}
                    className="w-full"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Events List */}
          <Card>
            <CardHeader>
              <CardTitle>Events</CardTitle>
              <CardDescription>
                {events.meta.total} events found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {events.data.length > 0 ? (
                <div className="space-y-4">
                  {events.data.map((event) => (
                    <div key={event.id} className="flex items-start justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-medium">{event.title}</h3>
                          <Badge className={getStatusColor(event.status)}>
                            {statusOptions[event.status]}
                          </Badge>
                          <Badge className={getEventTypeColor(event.event_type)}>
                            {eventTypeOptions[event.event_type]}
                          </Badge>
                          {event.requires_rsvp && (
                            <Badge variant="outline">
                              <Users className="mr-1 h-3 w-3" />
                              RSVP
                            </Badge>
                          )}
                          {!event.is_public && (
                            <Badge variant="secondary">Private</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {event.description}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <div className="flex items-center">
                            <Calendar className="mr-1 h-3 w-3" />
                            {formatEventDate(event)}
                          </div>
                          {event.location && (
                            <>
                              <span>•</span>
                              <div className="flex items-center">
                                <MapPin className="mr-1 h-3 w-3" />
                                {event.location}
                              </div>
                            </>
                          )}
                          <span>•</span>
                          <span>By {event.organizer.name}</span>
                          <span>•</span>
                          <span>{event.views_count} views</span>
                          {event.requires_rsvp && event.rsvp_stats && (
                            <>
                              <span>•</span>
                              <span>{event.rsvp_stats.attending} attending</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Link href={`/communication/events/${event.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/communication/events/${event.id}/edit`}>
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
                            {event.status === 'draft' && (
                              <DropdownMenuItem>
                                <Send className="mr-2 h-4 w-4" />
                                Publish
                              </DropdownMenuItem>
                            )}
                            {event.status === 'published' && (
                              <DropdownMenuItem>
                                <Archive className="mr-2 h-4 w-4" />
                                Unpublish
                              </DropdownMenuItem>
                            )}
                            {event.status === 'published' && (
                              <DropdownMenuItem>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Mark Complete
                              </DropdownMenuItem>
                            )}
                            {!['completed', 'cancelled'].includes(event.status) && (
                              <DropdownMenuItem className="text-red-600">
                                <XCircle className="mr-2 h-4 w-4" />
                                Cancel
                              </DropdownMenuItem>
                            )}
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
                  <p className="text-muted-foreground">No events found</p>
                  <Link href="/communication/events/create">
                    <Button className="mt-4">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Your First Event
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
