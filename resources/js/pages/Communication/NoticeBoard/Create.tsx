import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Clipboard,
  X,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Users,
} from 'lucide-react';
import { BreadcrumbItem } from '@/types';

type ReceiverType = 'student' | 'teacher' | 'staff' | 'parents' | 'all';

interface FormData {
  subject: string;
  notice: string;
  receiver: ReceiverType | '';
}

interface FormErrors {
  subject?: string;
  notice?: string;
  receiver?: string;
}

const MAX_NOTICE_LENGTH = 3000;

const receiverOptions: { value: ReceiverType; label: string; description: string }[] = [
  { value: 'student', label: 'Students', description: 'Visible to all enrolled students' },
  { value: 'teacher', label: 'Teachers', description: 'Visible to all teaching staff' },
  { value: 'staff', label: 'Staff', description: 'Visible to all non-teaching staff' },
  { value: 'parents', label: 'Parents', description: 'Visible to all parents and guardians' },
  { value: 'all', label: 'All (Everyone)', description: 'Visible to the entire school community' },
];

const receiverBadgeColors: Record<ReceiverType, string> = {
  student: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  teacher: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  staff: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  parents: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
  all: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
};

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Communication', href: '/communication' },
  { title: 'Notice Board', href: '/communication/notice-board' },
  { title: 'New Notice', href: '/communication/notice-board/create' },
];

export default function NoticeBoardCreate() {
  const [formData, setFormData] = useState<FormData>({
    subject: '',
    notice: '',
    receiver: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required.';
    } else if (formData.subject.length > 255) {
      newErrors.subject = 'Subject must not exceed 255 characters.';
    }

    if (!formData.notice.trim()) {
      newErrors.notice = 'Notice details are required.';
    } else if (formData.notice.length > MAX_NOTICE_LENGTH) {
      newErrors.notice = `Notice must not exceed ${MAX_NOTICE_LENGTH} characters.`;
    }

    if (!formData.receiver) {
      newErrors.receiver = 'Please select who this notice is for.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    // Simulate async submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus('success');
      setFormData({ subject: '', notice: '', receiver: '' });
    }, 1200);
  };

  const selectedReceiver = receiverOptions.find((r) => r.value === formData.receiver);
  const noticeLength = formData.notice.length;
  const noticeNearLimit = noticeLength > MAX_NOTICE_LENGTH * 0.8;

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="New Notice" />

      <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
        
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-2">
              <Link href="/communication/notice-board">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Back
                </Button>
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">New Notice</h1>
            <p className="mt-2 text-muted-foreground">
              Post a notice to students, teachers, staff, parents, or the entire school community
            </p>
          </div>

          {/* Success Alert */}
          {submitStatus === 'success' && (
            <div className="flex items-center space-x-3 p-4 mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-800 dark:text-green-300">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <div>
                <p className="font-medium">Notice posted successfully!</p>
                <p className="text-sm text-green-700 dark:text-green-400">
                  The notice is now visible to the selected recipients.{' '}
                  <Link href="/communication/notice-board" className="underline font-medium">
                    View all notices
                  </Link>
                </p>
              </div>
            </div>
          )}

          {/* Error Alert */}
          {submitStatus === 'error' && (
            <div className="flex items-center space-x-3 p-4 mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-300">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p className="font-medium">Failed to post notice. Please try again.</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clipboard className="mr-2 h-5 w-5" />
                  Notice Details
                </CardTitle>
                <CardDescription>
                  Fill in the information below to create and post the notice
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Subject */}
                <div className="space-y-2">
                  <Label htmlFor="subject">
                    Subject <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="subject"
                    placeholder="Enter notice subject..."
                    value={formData.subject}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, subject: e.target.value }));
                      setErrors((prev) => ({ ...prev, subject: undefined }));
                    }}
                    className={errors.subject ? 'border-red-500' : ''}
                    maxLength={255}
                  />
                  {errors.subject && (
                    <p className="text-sm text-red-500">{errors.subject}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    A clear, descriptive title for the notice
                  </p>
                </div>

                {/* Notice Details */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="notice">
                      Notice Details <span className="text-red-500">*</span>
                    </Label>
                    <span
                      className={`text-xs ${
                        noticeLength > MAX_NOTICE_LENGTH
                          ? 'text-red-500 font-medium'
                          : noticeNearLimit
                          ? 'text-amber-500'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {noticeLength} / {MAX_NOTICE_LENGTH}
                    </span>
                  </div>
                  <Textarea
                    id="notice"
                    placeholder="Write the full notice content here. Be clear and include all relevant details such as dates, times, locations, and any required actions..."
                    value={formData.notice}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, notice: e.target.value }));
                      setErrors((prev) => ({ ...prev, notice: undefined }));
                    }}
                    className={`min-h-[200px] resize-y ${errors.notice ? 'border-red-500' : ''}`}
                    maxLength={MAX_NOTICE_LENGTH}
                  />
                  {errors.notice && (
                    <p className="text-sm text-red-500">{errors.notice}</p>
                  )}
                </div>

                {/* Receiver */}
                <div className="space-y-2">
                  <Label htmlFor="receiver">
                    Post To <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.receiver}
                    onValueChange={(value) => {
                      setFormData((prev) => ({ ...prev, receiver: value as ReceiverType }));
                      setErrors((prev) => ({ ...prev, receiver: undefined }));
                    }}
                  >
                    <SelectTrigger
                      id="receiver"
                      className={errors.receiver ? 'border-red-500' : ''}
                    >
                      <SelectValue placeholder="Select recipients..." />
                    </SelectTrigger>
                    <SelectContent>
                      {receiverOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex flex-col">
                            <span>{option.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.receiver && (
                    <p className="text-sm text-red-500">{errors.receiver}</p>
                  )}
                  {selectedReceiver && (
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge
                        className={`text-xs ${receiverBadgeColors[selectedReceiver.value]}`}
                      >
                        <Users className="mr-1 h-3 w-3" />
                        {selectedReceiver.label}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {selectedReceiver.description}
                      </span>
                    </div>
                  )}
                </div>

                {/* Preview summary before submit */}
                {formData.subject && formData.receiver && formData.notice && (
                  <div className="rounded-lg border bg-muted/20 p-4 space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Notice Preview
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{formData.subject}</span>
                      {selectedReceiver && (
                        <Badge
                          className={`text-xs ${receiverBadgeColors[selectedReceiver.value]}`}
                        >
                          {selectedReceiver.label}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3">{formData.notice}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-2">
                  <Link href="/communication/notice-board">
                    <Button type="button" variant="outline" disabled={isSubmitting}>
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                  </Link>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <span className="animate-pulse">Posting...</span>
                    ) : (
                      <>
                        <Clipboard className="mr-2 h-4 w-4" />
                        Post Notice
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        
      </div>
    </AppLayout>
  );
}
