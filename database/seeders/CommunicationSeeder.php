<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\School;
use App\Models\Announcement;
use App\Models\Event;
use App\Models\MeetingRequest;
use App\Models\User;

class CommunicationSeeder extends Seeder
{
    public function run()
    {
        $schools = School::all();
        
        foreach ($schools as $school) {
            $this->createCommunicationDataForSchool($school);
        }
    }

    private function createCommunicationDataForSchool($school)
    {
        // Create announcements
        $this->createAnnouncements($school);

        // Create events
        $this->createEvents($school);

        // Create meeting requests
        $this->createMeetingRequests($school);
    }

    private function createAnnouncements($school)
    {
        $announcementTypes = [
            'academic' => [
                'Examination Schedule Released',
                'New Academic Calendar Available',
                'Subject Selection Deadline',
                'Results Publication Notice',
                'Academic Awards Ceremony'
            ],
            'general' => [
                'School Fees Payment Reminder',
                'Parent-Teacher Meeting Schedule',
                'School Holiday Notice',
                'Transport Route Changes',
                'Library Hours Update'
            ],
            'event' => [
                'Inter-School Sports Competition',
                'Sports Day Schedule',
                'Athletics Training Schedule',
                'Football Tournament Results',
                'Swimming Competition Notice'
            ],
            'academic' => [
                'Cultural Day Celebration',
                'Drama Club Performance',
                'Music Festival Participation',
                'Art Exhibition Opening',
                'Traditional Dance Competition'
            ],
            'urgent' => [
                'Weather Alert - School Closure',
                'Emergency Contact Update',
                'Security Notice',
                'Health Advisory',
                'Transportation Delay Notice'
            ]
        ];

        $priorities = ['urgent', 'high', 'normal', 'low'];
        $targetAudiences = ['all', 'students', 'parents', 'teachers', 'staff'];

        foreach ($announcementTypes as $category => $titles) {
            foreach ($titles as $title) {
                $author = User::where('school_id', $school->id)
                             ->whereIn('role', ['headteacher', 'academic_master', 'bursar'])
                             ->inRandomOrder()
                             ->first();

                Announcement::create([
                    'school_id' => $school->id,
                    'user_id' => $author->id,
                    'title' => $title,
                    'content' => $this->generateAnnouncementContent($title, $category),
                    'type' => $category,
                    'audience' => fake()->randomElement($targetAudiences),
                    'published_at' => fake()->dateTimeBetween('-3 months', 'now'),
                    'expires_at' => fake()->optional(0.3)->dateTimeBetween('now', '+1 month'),
                    'is_active' => true,
                    'settings' => json_encode([
                        'priority' => fake()->randomElement($priorities),
                        'is_pinned' => fake()->boolean(10),
                        'views_count' => fake()->numberBetween(0, 500),
                        'language' => fake()->randomElement(['en', 'sw'])
                    ])
                ]);
            }
        }
    }

    private function generateAnnouncementContent($title, $category)
    {
        $contentTemplates = [
            'academic' => "This is to inform all students and parents about {$title}. Please take note of the following important details and ensure compliance with the requirements. For any questions, contact the academic office.",
            'administrative' => "Dear Parents and Students, {$title}. This announcement contains important information that requires your immediate attention. Please read carefully and take appropriate action.",
            'sports' => "Sports enthusiasts! {$title}. Join us for this exciting event and show your school spirit. Registration details and requirements are provided below.",
            'cultural' => "Cultural celebration alert! {$title}. This is a wonderful opportunity to showcase our diverse talents and traditions. All are welcome to participate.",
            'emergency' => "URGENT NOTICE: {$title}. Please read this announcement carefully and follow the instructions provided. Your safety and well-being are our priority."
        ];

        $baseContent = $contentTemplates[$category] ?? "Important announcement: {$title}. Please read for details.";
        
        return $baseContent . "\n\n" . fake()->paragraphs(2, true);
    }

    private function generateExcerpt($title)
    {
        return substr($title . ' - Important information for all students and parents.', 0, 100) . '...';
    }

    private function createEvents($school)
    {
        $eventTypes = [
            'academic' => [
                'Parent-Teacher Conference',
                'Academic Awards Ceremony',
                'Science Fair',
                'Debate Competition',
                'Spelling Bee Contest'
            ],
            'sports' => [
                'Annual Sports Day',
                'Football Tournament',
                'Athletics Championship',
                'Basketball Competition',
                'Swimming Gala'
            ],
            'cultural' => [
                'Cultural Day Celebration',
                'Drama Performance',
                'Music Concert',
                'Art Exhibition',
                'Traditional Dance Show'
            ],
            'social' => [
                'Graduation Ceremony',
                'School Anniversary',
                'Welcome Party for New Students',
                'Farewell Party for Graduates',
                'Staff Appreciation Day'
            ],
            'emergency' => [
                'Emergency Drill',
                'Fire Safety Training',
                'First Aid Workshop',
                'Security Briefing',
                'Health Check-up Day'
            ]
        ];

        $locations = [
            'School Auditorium', 'Sports Ground', 'Library Hall', 'Classroom Block A',
            'Assembly Hall', 'Science Laboratory', 'Computer Lab', 'Art Room',
            'Music Room', 'Outdoor Pavilion', 'Main Hall', 'Conference Room'
        ];

        foreach ($eventTypes as $type => $eventNames) {
            foreach ($eventNames as $eventName) {
                $organizer = User::where('school_id', $school->id)
                               ->whereIn('role', ['headteacher', 'academic_master', 'teacher'])
                               ->inRandomOrder()
                               ->first();

                $startDate = fake()->dateTimeBetween('now', '+6 months');
                $endDate = fake()->dateTimeBetween($startDate, $startDate->modify('+1 day'));

                Event::create([
                    'school_id' => $school->id,
                    'title' => $eventName,
                    'description' => $this->generateEventDescription($eventName, $type),
                    'event_type' => $type,
                    'start_date' => $startDate->format('Y-m-d'),
                    'end_date' => $endDate->format('Y-m-d'),
                    'start_time' => fake()->time('H:i'),
                    'end_time' => fake()->time('H:i'),
                    'location' => fake()->randomElement($locations),
                    'is_all_day' => fake()->boolean(30), // 30% all day events
                    'is_public' => fake()->boolean(80), // 80% public events
                    'requires_rsvp' => fake()->boolean(60), // 60% require RSVP
                    'max_attendees' => fake()->numberBetween(50, 500),
                    'organizer_id' => $organizer->id,
                    'status' => fake()->randomElement(['draft', 'published', 'cancelled']),
                    'views_count' => fake()->numberBetween(0, 200)
                ]);
            }
        }
    }

    private function generateEventDescription($eventName, $type)
    {
        $descriptions = [
            'academic' => "Join us for {$eventName}, an important academic event that brings together students, teachers, and parents to celebrate achievements and discuss academic progress.",
            'sports' => "Get ready for {$eventName}! This exciting sports event will showcase our students' athletic abilities and promote healthy competition and teamwork.",
            'cultural' => "Experience the rich cultural heritage at {$eventName}. This celebration highlights our diverse traditions, talents, and artistic expressions.",
            'social' => "Don't miss {$eventName}! This special social gathering provides an opportunity for the school community to come together and celebrate.",
            'emergency' => "Important safety event: {$eventName}. This training session is designed to ensure the safety and preparedness of our school community."
        ];

        $baseDescription = $descriptions[$type] ?? "Join us for {$eventName}, an important school event.";
        
        return $baseDescription . "\n\n" . fake()->paragraphs(2, true);
    }

    private function createMeetingRequests($school)
    {
        $students = User::where('school_id', $school->id)->where('role', 'student')->get();
        $teachers = User::where('school_id', $school->id)->where('role', 'teacher')->get();
        $parents = User::where('school_id', $school->id)->where('role', 'parent')->get();

        $meetingTypes = [
            'parent_teacher' => 'Parent-Teacher Meeting',
            'academic_consultation' => 'Academic Consultation',
            'disciplinary' => 'Disciplinary Meeting',
            'counseling' => 'Student Counseling',
            'progress_review' => 'Progress Review Meeting'
        ];

        $statuses = ['pending', 'approved', 'scheduled', 'completed', 'cancelled', 'declined'];

        // Create 30-50 meeting requests
        $meetingCount = fake()->numberBetween(30, 50);
        
        for ($i = 0; $i < $meetingCount; $i++) {
            $requester = fake()->randomElement([$parents->random(), $teachers->random()]);
            $requestedUser = $requester->role === 'parent' ? $teachers->random() : $parents->random();
            $student = $students->random();
            $meetingType = fake()->randomElement(array_keys($meetingTypes));
            $status = fake()->randomElement($statuses);

            $preferredDate = fake()->dateTimeBetween('now', '+2 months');
            $scheduledDate = $status === 'scheduled' || $status === 'completed' 
                ? fake()->dateTimeBetween($preferredDate, (clone $preferredDate)->modify('+1 month')) 
                : null;

            MeetingRequest::create([
                'school_id' => $school->id,
                'requester_id' => $requester->id,
                'requested_user_id' => $requestedUser->id,
                'student_id' => $student->id,
                'subject' => $this->generateMeetingSubject($meetingType, $student->name),
                'message' => $this->generateMeetingMessage($meetingType, $student->name),
                'meeting_type' => fake()->randomElement(['in_person', 'video_call', 'phone_call', 'hybrid']),
                'preferred_date' => $preferredDate->format('Y-m-d'),
                'preferred_time' => fake()->time('H:i'),
                'duration' => fake()->numberBetween(30, 120), // 30-120 minutes
                'status' => $status,
                'scheduled_date' => $scheduledDate?->format('Y-m-d'),
                'scheduled_time' => $scheduledDate ? fake()->time('H:i') : null,
                'meeting_link' => fake()->optional(0.3)->url(),
                'meeting_notes' => fake()->optional()->sentence(),
                'created_at' => fake()->dateTimeBetween('-3 months', 'now')
            ]);
        }
    }

    private function generateMeetingSubject($type, $studentName)
    {
        $subjects = [
            'parent_teacher' => "Parent-Teacher Meeting for {$studentName}",
            'academic_consultation' => "Academic Consultation - {$studentName}",
            'disciplinary' => "Disciplinary Discussion - {$studentName}",
            'counseling' => "Counseling Session - {$studentName}",
            'progress_review' => "Progress Review Meeting - {$studentName}"
        ];

        return $subjects[$type] ?? "Meeting Request - {$studentName}";
    }

    private function generateMeetingMessage($type, $studentName)
    {
        $messages = [
            'parent_teacher' => "I would like to schedule a meeting to discuss {$studentName}'s academic progress and any concerns. Please let me know your availability.",
            'academic_consultation' => "I need to discuss {$studentName}'s academic performance and explore ways to provide additional support. Looking forward to meeting with you.",
            'disciplinary' => "We need to discuss some behavioral concerns regarding {$studentName}. Please schedule a meeting at your earliest convenience.",
            'counseling' => "I would like to request a counseling session for {$studentName} to address some personal and academic challenges they are facing.",
            'progress_review' => "Let's schedule a progress review meeting for {$studentName} to evaluate their current performance and set goals for improvement."
        ];

        return $messages[$type] ?? "I would like to schedule a meeting regarding {$studentName}. Please let me know your availability.";
    }
}
