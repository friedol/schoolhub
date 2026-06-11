import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Trash2,
  Mail,
  MailOpen,
  Inbox,
  Send,
  User,
} from 'lucide-react';
import { BreadcrumbItem } from '@/types';

interface MessageUser {
  name: string;
  role: string;
}

interface Message {
  id: number;
  sender: MessageUser;
  receiver: MessageUser;
  subject: string;
  body: string;
  read_at: string | null;
  created_at: string;
  sender_deleted: boolean;
  receiver_deleted: boolean;
}

const mockInbox: Message[] = [
  {
    id: 1,
    sender: { name: 'Mr. James Mwangi', role: 'Teacher' },
    receiver: { name: 'You', role: 'Admin' },
    subject: 'Student Performance Report - Grade 7A',
    body: 'Dear Admin,\n\nI wanted to bring to your attention the recent performance reports for Grade 7A. Several students have shown significant improvement this term, particularly in Mathematics and Science. However, a few students still require additional support.\n\nPlease review the attached report and let me know if you have any questions or suggestions.\n\nBest regards,\nMr. James Mwangi',
    read_at: null,
    created_at: '2026-05-24T09:15:00Z',
    sender_deleted: false,
    receiver_deleted: false,
  },
  {
    id: 2,
    sender: { name: 'Mrs. Fatuma Hassan', role: 'Parent' },
    receiver: { name: 'You', role: 'Admin' },
    subject: 'Request for Meeting - My Son Ali',
    body: 'Dear School Administration,\n\nI would like to request a meeting to discuss my son Ali Hassan in Form 2B. I have some concerns about his recent attendance and would like to understand how I can support him better at home.\n\nPlease let me know your available times.\n\nThank you,\nMrs. Fatuma Hassan',
    read_at: '2026-05-23T14:30:00Z',
    created_at: '2026-05-23T11:00:00Z',
    sender_deleted: false,
    receiver_deleted: false,
  },
  {
    id: 3,
    sender: { name: 'Principal Dr. Amina Saleh', role: 'Principal' },
    receiver: { name: 'You', role: 'Admin' },
    subject: 'Staff Meeting - Friday 30th May',
    body: 'Dear All,\n\nThis is a reminder that we will have a compulsory staff meeting this Friday, 30th May at 3:00 PM in the Main Hall.\n\nAgenda items include:\n1. Term review\n2. Upcoming examinations schedule\n3. New curriculum updates\n\nPlease make arrangements to attend.\n\nDr. Amina Saleh\nPrincipal',
    read_at: '2026-05-22T08:00:00Z',
    created_at: '2026-05-21T16:45:00Z',
    sender_deleted: false,
    receiver_deleted: false,
  },
  {
    id: 4,
    sender: { name: 'Mr. Peter Kimaro', role: 'Teacher' },
    receiver: { name: 'You', role: 'Admin' },
    subject: 'Library Books Return Request',
    body: 'Hello,\n\nI wanted to inform you that several students from Form 3 have overdue library books. Could you please make an announcement reminding students to return books by end of this week?\n\nThank you,\nMr. Peter Kimaro\nLibrarian',
    read_at: null,
    created_at: '2026-05-20T10:30:00Z',
    sender_deleted: false,
    receiver_deleted: false,
  },
];

const mockSent: Message[] = [
  {
    id: 5,
    sender: { name: 'You', role: 'Admin' },
    receiver: { name: 'All Teachers', role: 'Teacher' },
    subject: 'Reminder: Submit Mid-Term Grades',
    body: 'Dear Teachers,\n\nThis is a reminder that mid-term grades are due by Friday, 30th May. Please submit all grades through the online portal no later than 5:00 PM.\n\nIf you have any issues with the portal, please contact the IT department.\n\nThank you.',
    read_at: '2026-05-24T11:00:00Z',
    created_at: '2026-05-24T08:00:00Z',
    sender_deleted: false,
    receiver_deleted: false,
  },
  {
    id: 6,
    sender: { name: 'You', role: 'Admin' },
    receiver: { name: 'Mrs. Fatuma Hassan', role: 'Parent' },
    subject: 'Re: Request for Meeting - My Son Ali',
    body: 'Dear Mrs. Hassan,\n\nThank you for reaching out. We would be happy to meet with you to discuss Ali\'s progress.\n\nWe have an opening on Wednesday, 28th May at 10:00 AM. Please confirm if this time works for you.\n\nKind regards,\nSchool Administration',
    read_at: null,
    created_at: '2026-05-23T13:00:00Z',
    sender_deleted: false,
    receiver_deleted: false,
  },
  {
    id: 7,
    sender: { name: 'You', role: 'Admin' },
    receiver: { name: 'All Students', role: 'Student' },
    subject: 'End of Term Examination Schedule',
    body: 'Dear Students,\n\nPlease find below the end of term examination schedule:\n\n- Mathematics: 2nd June, 8:00 AM\n- English: 3rd June, 8:00 AM\n- Science: 4th June, 8:00 AM\n- Social Studies: 5th June, 8:00 AM\n\nMake sure to bring all required stationery and your student ID card.\n\nGood luck!\nSchool Administration',
    read_at: '2026-05-22T09:30:00Z',
    created_at: '2026-05-20T14:00:00Z',
    sender_deleted: false,
    receiver_deleted: false,
  },
];

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Communication', href: '/communication' },
  { title: 'Messages', href: '/communication/messages' },
];

export default function MessagesIndex() {
  const [activeTab, setActiveTab] = useState('inbox');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [inboxMessages, setInboxMessages] = useState<Message[]>(mockInbox);

  const unreadCount = inboxMessages.filter((m) => !m.read_at).length;

  const filteredInbox = inboxMessages.filter(
    (m) =>
      m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.sender.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSent = mockSent.filter(
    (m) =>
      m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.receiver.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewMessage = (message: Message) => {
    setSelectedMessage(message);
    setIsDialogOpen(true);
    if (!message.read_at) {
      setInboxMessages((prev) =>
        prev.map((m) =>
          m.id === message.id ? { ...m, read_at: new Date().toISOString() } : m
        )
      );
    }
  };

  const handleDeleteMessage = (id: number) => {
    setInboxMessages((prev) => prev.filter((m) => m.id !== id));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const MessageRow = ({
    message,
    type,
  }: {
    message: Message;
    type: 'inbox' | 'sent';
  }) => {
    const isUnread = type === 'inbox' && !message.read_at;
    const contactName =
      type === 'inbox' ? message.sender.name : message.receiver.name;
    const contactRole =
      type === 'inbox' ? message.sender.role : message.receiver.role;

    return (
      <div
        className={`flex items-start justify-between p-4 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
          isUnread ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800' : ''
        }`}
        onClick={() => handleViewMessage(message)}
      >
        <div className="flex items-start space-x-3 flex-1 min-w-0">
          <div className="mt-1 shrink-0">
            {isUnread ? (
              <Mail className="h-4 w-4 text-blue-500" />
            ) : (
              <MailOpen className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <span className={`text-sm ${isUnread ? 'font-semibold' : 'font-medium'}`}>
                {contactName}
              </span>
              <Badge variant="outline" className="text-xs">
                {contactRole}
              </Badge>
              {isUnread && (
                <Badge className="bg-blue-500 text-white text-xs px-1.5 py-0">New</Badge>
              )}
            </div>
            <p className={`text-sm truncate ${isUnread ? 'font-medium' : 'text-muted-foreground'}`}>
              {message.subject}
            </p>
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {message.body.replace(/\n/g, ' ').substring(0, 80)}...
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 ml-4 shrink-0">
          <span className="text-xs text-muted-foreground">{formatDate(message.created_at)}</span>
          <div onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleViewMessage(message)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() => handleDeleteMessage(message.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    );
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Messages" />

      <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
        
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Messages</h1>
                <p className="mt-2 text-muted-foreground">
                  Send and receive direct messages within the school
                </p>
              </div>
              <Link href="/communication/messages/create">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Compose Message
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Inbox</CardTitle>
                <Inbox className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{inboxMessages.length}</div>
                <p className="text-xs text-muted-foreground">Total received messages</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Unread</CardTitle>
                <Mail className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{unreadCount}</div>
                <p className="text-xs text-muted-foreground">Messages awaiting your attention</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sent</CardTitle>
                <Send className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockSent.length}</div>
                <p className="text-xs text-muted-foreground">Total sent messages</p>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search messages by subject or sender..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="inbox" className="relative">
                <Inbox className="mr-2 h-4 w-4" />
                Inbox
                {unreadCount > 0 && (
                  <Badge className="ml-2 bg-blue-500 text-white text-xs px-1.5 py-0 h-5 min-w-5">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="sent">
                <Send className="mr-2 h-4 w-4" />
                Sent
              </TabsTrigger>
            </TabsList>

            <TabsContent value="inbox">
              <Card>
                <CardHeader>
                  <CardTitle>Inbox</CardTitle>
                  <CardDescription>
                    {filteredInbox.length} message{filteredInbox.length !== 1 ? 's' : ''}
                    {unreadCount > 0 && `, ${unreadCount} unread`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {filteredInbox.length > 0 ? (
                    <div className="space-y-3">
                      {filteredInbox.map((message) => (
                        <MessageRow key={message.id} message={message} type="inbox" />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Inbox className="mx-auto h-12 w-12 text-muted-foreground/40 mb-4" />
                      <p className="text-muted-foreground">
                        {searchQuery ? 'No messages match your search' : 'Your inbox is empty'}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sent">
              <Card>
                <CardHeader>
                  <CardTitle>Sent Messages</CardTitle>
                  <CardDescription>
                    {filteredSent.length} message{filteredSent.length !== 1 ? 's' : ''} sent
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {filteredSent.length > 0 ? (
                    <div className="space-y-3">
                      {filteredSent.map((message) => (
                        <MessageRow key={message.id} message={message} type="sent" />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Send className="mx-auto h-12 w-12 text-muted-foreground/40 mb-4" />
                      <p className="text-muted-foreground">
                        {searchQuery ? 'No messages match your search' : 'No sent messages yet'}
                      </p>
                      <Link href="/communication/messages/create">
                        <Button className="mt-4">
                          <Plus className="mr-2 h-4 w-4" />
                          Compose Your First Message
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        
      </div>

      {/* Message View Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          {selectedMessage && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">{selectedMessage.subject}</DialogTitle>
                <DialogDescription asChild>
                  <div className="flex items-center space-x-4 mt-2">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        <span className="font-medium">From:</span> {selectedMessage.sender.name}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {selectedMessage.sender.role}
                      </Badge>
                    </div>
                    <span className="text-muted-foreground">|</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">
                        <span className="font-medium">To:</span> {selectedMessage.receiver.name}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {selectedMessage.receiver.role}
                      </Badge>
                    </div>
                  </div>
                </DialogDescription>
              </DialogHeader>
              <div className="mt-2">
                <div className="text-xs text-muted-foreground mb-4">
                  {new Date(selectedMessage.created_at).toLocaleString()}
                </div>
                <div className="bg-muted/30 rounded-lg p-4">
                  <p className="text-sm whitespace-pre-line leading-relaxed">
                    {selectedMessage.body}
                  </p>
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Close
                  </Button>
                  <Link href="/communication/messages/create">
                    <Button>
                      <Send className="mr-2 h-4 w-4" />
                      Reply
                    </Button>
                  </Link>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
