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
import { Send, X, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { BreadcrumbItem } from '@/types';

type ReceiverType = 'individual' | 'class' | 'all_students' | 'all_teachers' | 'all_staff';

interface FormData {
  receiverType: ReceiverType | '';
  receiverId: string;
  subject: string;
  body: string;
}

interface FormErrors {
  receiverType?: string;
  receiverId?: string;
  subject?: string;
  body?: string;
}

const MAX_BODY_LENGTH = 2000;

const individualReceivers = [
  { id: '1', name: 'Mr. James Mwangi', role: 'Teacher' },
  { id: '2', name: 'Mrs. Grace Odhiambo', role: 'Teacher' },
  { id: '3', name: 'Mr. Peter Kimaro', role: 'Teacher' },
  { id: '4', name: 'Mrs. Fatuma Hassan', role: 'Parent' },
  { id: '5', name: 'Dr. Amina Saleh', role: 'Principal' },
  { id: '6', name: 'John Baraka', role: 'Student' },
  { id: '7', name: 'Mary Juma', role: 'Student' },
];

const classOptions = [
  { id: 'form1a', name: 'Form 1A' },
  { id: 'form1b', name: 'Form 1B' },
  { id: 'form2a', name: 'Form 2A' },
  { id: 'form2b', name: 'Form 2B' },
  { id: 'form3a', name: 'Form 3A' },
  { id: 'form3b', name: 'Form 3B' },
  { id: 'form4a', name: 'Form 4A' },
  { id: 'form4b', name: 'Form 4B' },
];

const receiverTypeLabels: Record<ReceiverType, string> = {
  individual: 'Individual',
  class: 'Class',
  all_students: 'All Students',
  all_teachers: 'All Teachers',
  all_staff: 'All Staff',
};

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Communication', href: '/communication' },
  { title: 'Messages', href: '/communication/messages' },
  { title: 'New Message', href: '/communication/messages/create' },
];

export default function MessagesCreate() {
  const [formData, setFormData] = useState<FormData>({
    receiverType: '',
    receiverId: '',
    subject: '',
    body: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleReceiverTypeChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      receiverType: value as ReceiverType,
      receiverId: '',
    }));
    setErrors((prev) => ({ ...prev, receiverType: undefined, receiverId: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.receiverType) {
      newErrors.receiverType = 'Please select a receiver type.';
    }
    if (
      (formData.receiverType === 'individual' || formData.receiverType === 'class') &&
      !formData.receiverId
    ) {
      newErrors.receiverId = 'Please select a receiver.';
    }
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required.';
    } else if (formData.subject.length > 255) {
      newErrors.subject = 'Subject must not exceed 255 characters.';
    }
    if (!formData.body.trim()) {
      newErrors.body = 'Message body is required.';
    } else if (formData.body.length > MAX_BODY_LENGTH) {
      newErrors.body = `Message must not exceed ${MAX_BODY_LENGTH} characters.`;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    // Simulate async send
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus('success');
      setFormData({ receiverType: '', receiverId: '', subject: '', body: '' });
    }, 1200);
  };

  const requiresReceiverSelect =
    formData.receiverType === 'individual' || formData.receiverType === 'class';

  const bodyLength = formData.body.length;
  const bodyNearLimit = bodyLength > MAX_BODY_LENGTH * 0.8;

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Compose Message" />

      <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
        
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-2">
              <Link href="/communication/messages">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Back
                </Button>
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Compose Message</h1>
            <p className="mt-2 text-muted-foreground">
              Send a direct message to an individual or group
            </p>
          </div>

          {/* Success/Error Alerts */}
          {submitStatus === 'success' && (
            <div className="flex items-center space-x-3 p-4 mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-800 dark:text-green-300">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <div>
                <p className="font-medium">Message sent successfully!</p>
                <p className="text-sm text-green-700 dark:text-green-400">
                  Your message has been delivered.{' '}
                  <Link href="/communication/messages" className="underline font-medium">
                    Back to Messages
                  </Link>
                </p>
              </div>
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="flex items-center space-x-3 p-4 mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-300">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p className="font-medium">Failed to send message. Please try again.</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>New Message</CardTitle>
                <CardDescription>
                  Fill in the details below to compose and send your message
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Receiver Type */}
                <div className="space-y-2">
                  <Label htmlFor="receiverType">
                    Receiver Type <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.receiverType}
                    onValueChange={handleReceiverTypeChange}
                  >
                    <SelectTrigger id="receiverType" className={errors.receiverType ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select who to send to..." />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.entries(receiverTypeLabels) as [ReceiverType, string][]).map(
                        ([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                  {errors.receiverType && (
                    <p className="text-sm text-red-500">{errors.receiverType}</p>
                  )}
                  {formData.receiverType && !requiresReceiverSelect && (
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-sm text-muted-foreground">Sending to:</span>
                      <Badge variant="secondary">
                        {receiverTypeLabels[formData.receiverType as ReceiverType]}
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Receiver (dynamic) */}
                {requiresReceiverSelect && (
                  <div className="space-y-2">
                    <Label htmlFor="receiverId">
                      {formData.receiverType === 'individual' ? 'Select Person' : 'Select Class'}{' '}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.receiverId}
                      onValueChange={(value) => {
                        setFormData((prev) => ({ ...prev, receiverId: value }));
                        setErrors((prev) => ({ ...prev, receiverId: undefined }));
                      }}
                    >
                      <SelectTrigger
                        id="receiverId"
                        className={errors.receiverId ? 'border-red-500' : ''}
                      >
                        <SelectValue
                          placeholder={
                            formData.receiverType === 'individual'
                              ? 'Select a person...'
                              : 'Select a class...'
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {formData.receiverType === 'individual'
                          ? individualReceivers.map((person) => (
                              <SelectItem key={person.id} value={person.id}>
                                <span>
                                  {person.name}{' '}
                                  <span className="text-muted-foreground text-xs">
                                    ({person.role})
                                  </span>
                                </span>
                              </SelectItem>
                            ))
                          : classOptions.map((cls) => (
                              <SelectItem key={cls.id} value={cls.id}>
                                {cls.name}
                              </SelectItem>
                            ))}
                      </SelectContent>
                    </Select>
                    {errors.receiverId && (
                      <p className="text-sm text-red-500">{errors.receiverId}</p>
                    )}
                  </div>
                )}

                {/* Subject */}
                <div className="space-y-2">
                  <Label htmlFor="subject">
                    Subject <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="subject"
                    placeholder="Enter message subject..."
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
                </div>

                {/* Message Body */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="body">
                      Message <span className="text-red-500">*</span>
                    </Label>
                    <span
                      className={`text-xs ${
                        bodyLength > MAX_BODY_LENGTH
                          ? 'text-red-500 font-medium'
                          : bodyNearLimit
                          ? 'text-amber-500'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {bodyLength} / {MAX_BODY_LENGTH}
                    </span>
                  </div>
                  <Textarea
                    id="body"
                    placeholder="Write your message here..."
                    value={formData.body}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, body: e.target.value }));
                      setErrors((prev) => ({ ...prev, body: undefined }));
                    }}
                    className={`min-h-[160px] resize-y ${errors.body ? 'border-red-500' : ''}`}
                    maxLength={MAX_BODY_LENGTH}
                  />
                  {errors.body && (
                    <p className="text-sm text-red-500">{errors.body}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-2">
                  <Link href="/communication/messages">
                    <Button type="button" variant="outline" disabled={isSubmitting}>
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                  </Link>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <span className="animate-pulse mr-2">Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Message
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
