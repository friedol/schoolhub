import React from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatCard, StatGrid } from '@/components/ui/stat-card';
import { 
  MessageSquare, 
  Bell, 
  Calendar, 
  Users, 
  Send, 
  Eye, 
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface DashboardProps {
  stats: {
    total_messages: number;
    sent_messages: number;
    delivered_messages: number;
    failed_messages: number;
    total_announcements: number;
    published_announcements: number;
    total_events: number;
    upcoming_events: number;
    total_meetings: number;
    pending_meetings: number;
  };
  recentMessages: any[];
  recentAnnouncements: any[];
  upcomingEvents: any[];
  pendingMeetings: any[];
}

export default function CommunicationDashboard({ 
  stats, 
  recentMessages, 
  recentAnnouncements, 
  upcomingEvents, 
  pendingMeetings 
}: DashboardProps) {
  return (
    <AuthenticatedLayout>
      <Head title="Communication Dashboard" />

      <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
        
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Communication Dashboard</h1>
            <p className="mt-2 text-gray-600">
              Manage messages, announcements, events, and meetings
            </p>
          </div>

          {/* Statistics Cards */}
          <div className="mb-8">
            <StatGrid cols={4}>
              <StatCard
                title="Total Messages"
                value={stats.total_messages}
                icon={MessageSquare}
                color="blue"
                trend="stable"
                trendLabel={`${stats.sent_messages} sent, ${stats.delivered_messages} delivered`}
              />
              <StatCard
                title="Announcements"
                value={stats.total_announcements}
                icon={Bell}
                color="indigo"
                trend="stable"
                trendLabel={`${stats.published_announcements} published`}
              />
              <StatCard
                title="Events"
                value={stats.total_events}
                icon={Calendar}
                color="emerald"
                trend="stable"
                trendLabel={`${stats.upcoming_events} upcoming`}
              />
              <StatCard
                title="Meetings"
                value={stats.total_meetings}
                icon={Users}
                color="purple"
                trend="stable"
                trendLabel={`${stats.pending_meetings} pending`}
              />
            </StatGrid>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common communication tasks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Send className="mr-2 h-4 w-4" />
                  Send Message
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Bell className="mr-2 h-4 w-4" />
                  Create Announcement
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule Event
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Users className="mr-2 h-4 w-4" />
                  Request Meeting
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Message Status</CardTitle>
                <CardDescription>
                  Recent message delivery status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    <span className="text-sm">Delivered</span>
                  </div>
                  <Badge variant="secondary">{stats.delivered_messages}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-yellow-500" />
                    <span className="text-sm">Sent</span>
                  </div>
                  <Badge variant="secondary">{stats.sent_messages}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <XCircle className="mr-2 h-4 w-4 text-red-500" />
                    <span className="text-sm">Failed</span>
                  </div>
                  <Badge variant="secondary">{stats.failed_messages}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Messages</CardTitle>
                <CardDescription>
                  Latest communication activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentMessages.length > 0 ? (
                  <div className="space-y-3">
                    {recentMessages.map((message) => (
                      <div key={message.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{message.subject || 'No Subject'}</p>
                          <p className="text-xs text-muted-foreground">
                            {message.type} • {message.recipients_count} recipients
                          </p>
                        </div>
                        <Badge variant={message.status === 'delivered' ? 'default' : 'secondary'}>
                          {message.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No recent messages
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Events</CardTitle>
                <CardDescription>
                  Events happening soon
                </CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingEvents.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingEvents.map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{event.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {event.start_date} • {event.location || 'No location'}
                          </p>
                        </div>
                        <Badge variant="outline">
                          {event.event_type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No upcoming events
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Pending Meetings */}
          {pendingMeetings.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertCircle className="mr-2 h-5 w-5 text-orange-500" />
                  Pending Meetings
                </CardTitle>
                <CardDescription>
                  Meetings requiring your attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pendingMeetings.map((meeting) => (
                    <div key={meeting.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{meeting.subject}</p>
                        <p className="text-xs text-muted-foreground">
                          {meeting.requester?.name} • {meeting.preferred_date}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          View
                        </Button>
                        <Button size="sm">
                          Approve
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        
      </div>
    </AuthenticatedLayout>
  );
}



