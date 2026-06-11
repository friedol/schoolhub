# EduTZ-GroupSMS School-Level Modules Documentation

## Overview

This document provides comprehensive documentation for all school-level modules implemented in the EduTZ-GroupSMS system. Each module is designed to meet the specific needs of Tanzanian schools while maintaining NECTA compliance and bilingual support.

---

## MODULE 1: Academic Management (NECTA Compliant)

### Features Implemented

#### 1.1 Curriculum & Subjects Management
- **Pre-loaded Tanzanian Syllabus**: Complete curriculum structure for all education levels
- **Subject Assignment**: Assign subjects to classes and combinations
- **NECTA Compliance**: Built-in support for NECTA examination requirements
- **Credit System**: Flexible credit allocation for subjects

**Models:**
- `Curriculum`: Manages curriculum structure
- `CurriculumSubject`: Links subjects to curricula
- `Subject`: Core subject information

**Key Features:**
```php
// Create NECTA-compliant curriculum
$curriculum = Curriculum::create([
    'name' => 'Form 1-4 Curriculum',
    'level' => 'secondary',
    'is_necta_curriculum' => true,
    'academic_year' => '2024',
]);

// Assign subjects to curriculum
$curriculum->subjects()->create([
    'subject_id' => $subject->id,
    'is_core' => true,
    'credits' => 4,
    'weekly_periods' => 5,
]);
```

#### 1.2 Timetabling System
- **Drag-and-Drop Interface**: Intuitive timetable creation
- **Conflict Detection**: Automatic detection of scheduling conflicts
- **Room Management**: Assign rooms to classes
- **Teacher Availability**: Track teacher schedules

**Models:**
- `Timetable`: Manages class schedules

**Key Features:**
```php
// Create timetable entry
$timetable = Timetable::create([
    'class_id' => $class->id,
    'subject_id' => $subject->id,
    'teacher_id' => $teacher->id,
    'day_of_week' => 1, // Monday
    'start_time' => '08:00',
    'end_time' => '09:00',
    'room' => 'Room 101',
]);

// Check for conflicts
if ($timetable->conflictsWith($otherTimetable)) {
    // Handle conflict
}
```

#### 1.3 Attendance Management
- **Daily Attendance**: Track student and teacher attendance
- **SMS Alerts**: Automatic SMS notifications for absenteeism
- **Attendance Reports**: Comprehensive attendance analytics
- **Late Arrival Tracking**: Monitor late arrivals

**Models:**
- `Attendance`: Manages attendance records

**Key Features:**
```php
// Mark attendance
$attendance = Attendance::create([
    'user_id' => $student->id,
    'class_id' => $class->id,
    'date' => now()->toDateString(),
    'status' => Attendance::STATUS_PRESENT,
    'time_in' => '08:15',
    'marked_by' => auth()->id(),
]);

// Get attendance percentage
$percentage = Attendance::getAttendancePercentage(
    $student->id, 
    $startDate, 
    $endDate
);
```

#### 1.4 Assessment & Grading
- **Multiple Assessment Types**: Assignments, quizzes, tests, exams, projects
- **Automatic Grading**: Calculate grades and points automatically
- **Grade Distribution**: Track grade distribution across classes
- **Performance Analytics**: Detailed performance reports

**Models:**
- `Assessment`: Manages assessments
- `AssessmentResult`: Stores student results

**Key Features:**
```php
// Create assessment
$assessment = Assessment::create([
    'name' => 'Mathematics Test 1',
    'type' => Assessment::TYPE_TEST,
    'total_marks' => 100,
    'weight' => 2.0,
    'date' => now()->toDateString(),
]);

// Grade assessment
$result = AssessmentResult::create([
    'assessment_id' => $assessment->id,
    'student_id' => $student->id,
    'marks' => 85,
    'graded_by' => auth()->id(),
]);

// Calculate grade and points
$result->grade = $result->calculateGrade(); // 'A'
$result->points = $result->calculatePoints(); // 4.0
```

#### 1.5 Report Cards
- **NECTA-Style Reports**: Generate official report cards
- **Teacher Comments**: Include teacher and headteacher comments
- **Academic Summary**: Comprehensive academic performance summary
- **Attendance Integration**: Include attendance data

**Models:**
- `ReportCard`: Manages report cards

**Key Features:**
```php
// Generate report card
$reportCard = ReportCard::create([
    'student_id' => $student->id,
    'class_id' => $class->id,
    'academic_term_id' => $term->id,
    'total_marks' => 450,
    'average_marks' => 75.5,
    'position' => 5,
    'grade' => 'B',
    'attendance_percentage' => 95.5,
    'headteacher_comment' => 'Good performance, keep it up!',
]);
```

---

## MODULE 2: Student Lifecycle Management

### Features Implemented

#### 2.1 Online Admission System
- **Application Forms**: Digital application forms
- **Document Upload**: Upload birth certificates, photos, etc.
- **Application Tracking**: Track application status
- **Approval Workflow**: Streamlined approval process

**Models:**
- `StudentApplication`: Manages applications

**Key Features:**
```php
// Create application
$application = StudentApplication::create([
    'first_name' => 'John',
    'last_name' => 'Mwalimu',
    'date_of_birth' => '2010-05-15',
    'gender' => 'male',
    'parent_name' => 'Peter Mwalimu',
    'parent_phone' => '+255123456789',
    'applied_class' => 'Form 1',
    'status' => StudentApplication::STATUS_PENDING,
]);

// Convert to student
$student = $application->convertToStudent();
```

#### 2.2 Student Profile Management
- **Comprehensive Biodata**: Complete student information
- **Academic History**: Track academic progress
- **Medical Information**: Store medical records
- **Disciplinary Records**: Track disciplinary actions

**Models:**
- `StudentProfile`: Manages student profiles

**Key Features:**
```php
// Create student profile
$profile = StudentProfile::create([
    'student_id' => $student->id,
    'admission_number' => 'SCH001/2024',
    'class_id' => $class->id,
    'boarding_status' => 'day',
    'medical_info' => ['allergies' => 'None'],
    'special_needs' => [],
]);
```

#### 2.3 Promotion & Graduation
- **Bulk Promotion**: Promote students to next class
- **Graduation Management**: Manage graduation ceremonies
- **Certificate Generation**: Generate graduation certificates
- **Alumni Tracking**: Track former students

---

## MODULE 3: Human Resources & Staff Management

### Features Implemented

#### 3.1 Staff Database
- **Complete Profiles**: Personal details, TSC numbers, qualifications
- **Employment History**: Track employment records
- **Contact Information**: Comprehensive contact details
- **Document Management**: Store certificates and documents

**Models:**
- `StaffProfile`: Manages staff profiles

**Key Features:**
```php
// Create staff profile
$profile = StaffProfile::create([
    'staff_id' => $teacher->id,
    'employee_number' => 'EMP001',
    'tsc_number' => 'TSC123456',
    'employment_type' => StaffProfile::EMPLOYMENT_TYPE_FULL_TIME,
    'hire_date' => now()->toDateString(),
    'qualifications' => ['Bachelor of Education'],
    'bank_account_number' => '1234567890',
]);
```

#### 3.2 Payroll Management
- **Salary Structures**: Define salary components
- **Allowances & Deductions**: Manage NSSF, PAYE, loans
- **Monthly Payslips**: Generate payslips automatically
- **Payment Tracking**: Track salary payments and arrears

**Models:**
- `SalaryRecord`: Manages salary records

**Key Features:**
```php
// Create salary record
$salary = SalaryRecord::create([
    'staff_id' => $teacher->id,
    'basic_salary' => 500000,
    'allowances' => ['housing' => 100000, 'transport' => 50000],
    'deductions' => ['nssf' => 10000, 'paye' => 25000],
    'gross_salary' => 650000,
    'net_salary' => 615000,
    'payment_date' => now()->toDateString(),
]);
```

#### 3.3 Leave Management
- **Leave Applications**: Apply for various leave types
- **Approval Workflow**: Streamlined approval process
- **Leave Tracking**: Track leave balances
- **Leave Reports**: Generate leave reports

**Models:**
- `LeaveRecord`: Manages leave records

**Key Features:**
```php
// Create leave record
$leave = LeaveRecord::create([
    'staff_id' => $teacher->id,
    'leave_type' => LeaveRecord::LEAVE_TYPE_ANNUAL,
    'start_date' => '2024-12-01',
    'end_date' => '2024-12-15',
    'total_days' => 15,
    'reason' => 'Annual vacation',
    'status' => LeaveRecord::STATUS_PENDING,
]);
```

---

## MODULE 4: Fee & Financial Management

### Features Implemented

#### 4.1 Fee Structure Setup
- **Flexible Fee Categories**: Define various fee types
- **Class-Specific Fees**: Different fees for different classes
- **Day vs Boarding**: Separate fee structures
- **Payment Plans**: Installment payment options

**Models:**
- `FeeCategory`: Manages fee categories
- `StudentFee`: Manages individual student fees

**Key Features:**
```php
// Create fee category
$feeCategory = FeeCategory::create([
    'name' => 'Matumizi ya Maabara',
    'amount' => 30000,
    'currency' => 'TZS',
    'payment_frequency' => 'termly',
    'due_date' => '2024-02-01',
    'is_mandatory' => true,
]);

// Create student fee
$studentFee = StudentFee::create([
    'student_id' => $student->id,
    'fee_category_id' => $feeCategory->id,
    'amount' => 30000,
    'due_date' => '2024-02-01',
    'status' => StudentFee::STATUS_PENDING,
]);
```

#### 4.2 Payment Processing
- **Mobile Money Integration**: M-Pesa, Tigo Pesa, Airtel Money, HaloPesa
- **Cash/Bank Payments**: Manual payment entry
- **Automatic Reconciliation**: Automatic payment matching
- **Receipt Generation**: Official payment receipts

**Models:**
- `FeePayment`: Manages payments

**Key Features:**
```php
// Process mobile money payment
$payment = FeePayment::create([
    'student_id' => $student->id,
    'student_fee_id' => $studentFee->id,
    'amount' => 30000,
    'payment_method' => FeePayment::PAYMENT_METHOD_MOBILE_MONEY,
    'provider' => 'mpesa',
    'phone_number' => '+255123456789',
    'transaction_id' => 'MPESA123456',
    'status' => FeePayment::STATUS_COMPLETED,
]);

// Process payment
$payment->processPayment();
```

#### 4.3 Financial Reports
- **Balance Sheets**: Comprehensive financial statements
- **Income Statements**: Revenue and expense tracking
- **Fee Collection Reports**: Detailed collection analytics
- **Arrears Management**: Track outstanding fees

---

## MODULE 5: Library Management

### Features Implemented

#### 5.1 Catalog Management
- **Book Database**: Complete book information (ISBN, title, author, publisher)
- **Category Management**: Organize books by categories
- **Location Tracking**: Track book locations and shelf numbers
- **Inventory Management**: Monitor book quantities

**Models:**
- `Book`: Manages book catalog

**Key Features:**
```php
// Add book to catalog
$book = Book::create([
    'isbn' => '978-0-123456-78-9',
    'title' => 'Advanced Mathematics',
    'author' => 'Dr. John Mwalimu',
    'publisher' => 'Tanzania Publishers',
    'category' => 'textbook',
    'total_copies' => 50,
    'available_copies' => 45,
    'location' => 'Library A',
    'shelf_number' => 'A-101',
]);
```

#### 5.2 Book Issuance & Returns
- **Issue Management**: Issue books to students and staff
- **Due Date Tracking**: Monitor due dates
- **Return Processing**: Process book returns
- **Renewal System**: Allow book renewals

**Models:**
- `BookIssuance`: Manages book loans

**Key Features:**
```php
// Issue book
$issuance = BookIssuance::create([
    'book_id' => $book->id,
    'borrower_id' => $student->id,
    'borrower_type' => BookIssuance::BORROWER_TYPE_STUDENT,
    'issue_date' => now()->toDateString(),
    'due_date' => now()->addDays(14)->toDateString(),
    'status' => BookIssuance::STATUS_ISSUED,
]);

// Return book
$issuance->returnBook($librarian);
```

#### 5.3 Fine Management
- **Automatic Fine Calculation**: Calculate overdue fines
- **Fine Collection**: Track fine payments
- **Fine Reports**: Generate fine reports
- **Fine Waivers**: Manage fine waivers

---

## MODULE 6: Inventory & Store Management

### Features Implemented

#### 6.1 Item Catalog
- **Asset Database**: Complete asset information
- **Category Management**: Organize items by categories
- **Location Tracking**: Track item locations
- **Asset Tagging**: Unique asset identification

**Models:**
- `InventoryItem`: Manages inventory items

**Key Features:**
```php
// Add inventory item
$item = InventoryItem::create([
    'name' => 'Viti za Darasani',
    'category' => 'furniture',
    'current_stock' => 250,
    'minimum_stock' => 50,
    'unit_cost' => 15000,
    'location' => 'Store Room A',
    'is_consumable' => false,
]);
```

#### 6.2 Stock Management
- **Stock Tracking**: Monitor stock levels
- **Low Stock Alerts**: Automatic low stock notifications
- **Stock Adjustments**: Adjust stock levels
- **Stock Reports**: Generate stock reports

**Models:**
- `InventoryTransaction`: Manages stock transactions

**Key Features:**
```php
// Add stock
$item->addStock(50, 'Purchase');

// Remove stock
$item->removeStock(10, 'Issue to Classroom');

// Check stock status
if ($item->isLowStock()) {
    // Send alert
}
```

---

## MODULE 7: Transport & Fleet Management

### Features Implemented

#### 7.1 Vehicle Management
- **Vehicle Database**: Complete vehicle information
- **Registration Tracking**: Track vehicle registrations
- **Insurance Management**: Monitor insurance expiry
- **Maintenance Scheduling**: Schedule maintenance

**Models:**
- `Vehicle`: Manages vehicles

**Key Features:**
```php
// Register vehicle
$vehicle = Vehicle::create([
    'vehicle_number' => 'T 123 ABC',
    'make' => 'Toyota',
    'model' => 'Hiace',
    'capacity' => 30,
    'vehicle_type' => Vehicle::VEHICLE_TYPE_BUS,
    'insurance_expiry' => '2024-12-31',
    'status' => Vehicle::STATUS_ACTIVE,
]);
```

#### 7.2 Route & Stop Management
- **Route Definition**: Define bus routes
- **Stop Management**: Manage pickup/drop-off points
- **Distance Calculation**: Calculate route distances
- **Fare Management**: Set route fares

**Models:**
- `TransportRoute`: Manages routes

**Key Features:**
```php
// Create route
$route = TransportRoute::create([
    'route_name' => 'Kimara - School',
    'route_code' => 'KIM-SCH',
    'start_location' => 'Kimara',
    'end_location' => 'School',
    'distance_km' => 15.5,
    'fare_amount' => 500,
]);
```

#### 7.3 Student Allocation
- **Route Assignment**: Assign students to routes
- **Bus Assignment**: Assign students to specific buses
- **Attendance Tracking**: Track bus attendance
- **SMS Alerts**: Notify parents when bus is near

---

## MODULE 8: Hostel & Dormitory Management

### Features Implemented

#### 8.1 Hostel Setup
- **Hostel Configuration**: Define hostels (boys/girls)
- **Room Management**: Manage rooms and beds
- **Capacity Planning**: Plan hostel capacity
- **Facility Management**: Track hostel facilities

**Models:**
- `Hostel`: Manages hostels
- `HostelRoom`: Manages rooms

**Key Features:**
```php
// Create hostel
$hostel = Hostel::create([
    'hostel_name' => 'Boys Hostel A',
    'gender' => Hostel::GENDER_MALE,
    'capacity' => 100,
    'warden_id' => $warden->id,
    'facilities' => ['WiFi', 'Study Room', 'Common Room'],
]);

// Create room
$room = HostelRoom::create([
    'hostel_id' => $hostel->id,
    'room_number' => 'A101',
    'room_type' => HostelRoom::ROOM_TYPE_QUAD,
    'capacity' => 4,
]);
```

#### 8.2 Allocation Management
- **Student Allocation**: Assign students to hostels/rooms
- **Bed Assignment**: Assign specific beds
- **Allocation Tracking**: Track allocations
- **Transfer Management**: Manage transfers

---

## MODULE 9: Communication & Portal

### Features Implemented

#### 9.1 SMS & Email Gateway
- **Bulk Messaging**: Send messages to multiple recipients
- **Individual Messaging**: Send personal messages
- **Message Templates**: Pre-defined message templates
- **Delivery Tracking**: Track message delivery

**Models:**
- `Message`: Manages messages
- `MessageRecipient`: Manages recipients

**Key Features:**
```php
// Send message
$message = Message::create([
    'subject' => 'Important Announcement',
    'content' => 'School will be closed tomorrow',
    'message_type' => Message::MESSAGE_TYPE_ANNOUNCEMENT,
    'recipient_type' => Message::RECIPIENT_TYPE_ALL,
    'send_sms' => true,
    'send_email' => true,
    'status' => Message::STATUS_SENT,
]);
```

#### 9.2 Parent Portal
- **Child Monitoring**: View child's progress
- **Fee Management**: View and pay fees
- **Communication**: Communicate with teachers
- **Attendance Tracking**: Monitor attendance

#### 9.3 Student Portal
- **Academic Records**: View academic results
- **Timetable Access**: View class timetable
- **Assignment Tracking**: Track assignments
- **Communication**: Receive messages

---

## MODULE 10: Reporting & Analytics

### Features Implemented

#### 10.1 Pre-built Reports
- **Academic Reports**: Performance reports
- **Financial Reports**: Fee collection reports
- **Attendance Reports**: Attendance analytics
- **Library Reports**: Library usage reports

#### 10.2 Custom Reports
- **Report Builder**: Create custom reports
- **Filter Options**: Advanced filtering
- **Export Options**: Export to various formats
- **Scheduled Reports**: Automated report generation

#### 10.3 Dashboard Widgets
- **Role-Specific Dashboards**: Customized dashboards
- **Key Metrics**: Important KPIs
- **Charts & Graphs**: Visual data representation
- **Real-time Updates**: Live data updates

---

## MODULE 11: System Configuration & Security

### Features Implemented

#### 11.1 User Role & Permissions
- **Granular Permissions**: Fine-grained access control
- **Role Management**: Create and manage roles
- **Permission Assignment**: Assign permissions to roles
- **Access Auditing**: Track user access

#### 11.2 School Profile Setup
- **School Configuration**: Configure school details
- **Academic Calendar**: Set academic calendar
- **Holiday Management**: Manage holidays
- **System Settings**: Configure system settings

#### 11.3 Data Backup & Recovery
- **Automated Backups**: Daily automated backups
- **Backup Verification**: Verify backup integrity
- **Recovery Procedures**: Data recovery processes
- **Backup Storage**: Secure backup storage

---

## Tanzanian-Specific Features

### 1. Language Support
- **Bilingual Interface**: Full English and Swahili support
- **Language Switching**: Real-time language switching
- **Localized Content**: Swahili translations for all modules
- **Cultural Adaptation**: Tanzanian cultural context

### 2. Currency & Payments
- **Tanzanian Shillings**: Native currency support
- **Mobile Money Integration**: M-Pesa, Tigo Pesa, Airtel Money, HaloPesa
- **Local Payment Methods**: Support for local payment systems
- **Currency Formatting**: Proper TZS formatting

### 3. NECTA Compliance
- **Examination Support**: NECTA examination management
- **Report Formats**: NECTA-compliant report formats
- **Student Lists**: Pre-formatted student lists for registration
- **Grade Standards**: NECTA grading standards

### 4. Mobile-First Design
- **Responsive Design**: Mobile-optimized interface
- **Touch-Friendly**: Touch-optimized controls
- **Offline Support**: Limited offline functionality
- **Progressive Web App**: PWA capabilities

---

## Sample Data Examples

### School Information
```php
$school = School::create([
    'name' => 'Jengo Secondary School',
    'code' => 'JEN-SEC-001',
    'address' => 'Dar es Salaam, Tanzania',
    'region' => 'Dar es Salaam',
    'district' => 'Kinondoni',
    'school_level' => 'secondary',
    'necta_number' => 'NECTA-001-2024',
]);
```

### Staff Information
```php
$staff = [
    'bursar' => ['name' => 'Mr. Said', 'role' => 'bursar'],
    'librarian' => ['name' => 'Ms. Neema', 'role' => 'librarian'],
    'driver' => ['name' => 'Daudi', 'role' => 'driver'],
];
```

### Fee Items
```php
$feeItem = FeeCategory::create([
    'name' => 'Matumizi ya Maabara',
    'amount' => 30000,
    'currency' => 'TZS',
    'description' => 'Laboratory usage fee',
]);
```

### Transport Information
```php
$vehicle = Vehicle::create([
    'vehicle_number' => 'T 123 ABC',
    'route' => 'Kimara - School',
    'capacity' => 30,
]);
```

### Inventory Items
```php
$inventoryItem = InventoryItem::create([
    'name' => 'Viti za Darasani',
    'quantity' => 250,
    'category' => 'furniture',
    'unit_cost' => 15000,
]);
```

---

## Complete Student Journey Example

### 1. Admission Process
```php
// Parent applies online
$application = StudentApplication::create([
    'first_name' => 'John',
    'last_name' => 'Mwalimu',
    'parent_name' => 'Peter Mwalimu',
    'parent_phone' => '+255123456789',
    'applied_class' => 'Form I',
    'status' => StudentApplication::STATUS_PENDING,
]);

// Admin reviews and approves
$application->update(['status' => StudentApplication::STATUS_APPROVED]);

// Convert to student
$student = $application->convertToStudent();
```

### 2. Student Setup
```php
// Assign to class
$student->update(['class_id' => $form1Class->id]);

// Assign to bus route
$transportAssignment = TransportAssignment::create([
    'student_id' => $student->id,
    'route_id' => $kimaraRoute->id,
    'vehicle_id' => $bus->id,
]);

// Assign to hostel (if boarding)
$hostelResident = HostelResident::create([
    'student_id' => $student->id,
    'hostel_id' => $boysHostel->id,
    'room_id' => $room->id,
    'bed_number' => 'A101-1',
]);
```

### 3. Daily Operations
```php
// Mark attendance in class
$attendance = Attendance::create([
    'user_id' => $student->id,
    'class_id' => $form1Class->id,
    'date' => now()->toDateString(),
    'status' => Attendance::STATUS_PRESENT,
    'time_in' => '08:15',
]);

// Mark bus attendance
$busAttendance = BusAttendance::create([
    'student_id' => $student->id,
    'vehicle_id' => $bus->id,
    'date' => now()->toDateString(),
    'status' => BusAttendance::STATUS_PRESENT,
]);

// Send SMS to parent if absent
if ($attendance->status === Attendance::STATUS_ABSENT) {
    $message = Message::create([
        'subject' => 'Absence Notification',
        'content' => "Your child {$student->name} was absent today.",
        'recipient_type' => Message::RECIPIENT_TYPE_INDIVIDUAL,
        'recipient_ids' => [$student->parent->id],
        'send_sms' => true,
    ]);
}
```

### 4. Academic Management
```php
// Teacher enters marks
$assessment = Assessment::create([
    'name' => 'Mathematics Test 1',
    'type' => Assessment::TYPE_TEST,
    'total_marks' => 100,
    'class_id' => $form1Class->id,
    'subject_id' => $mathematics->id,
]);

$result = AssessmentResult::create([
    'assessment_id' => $assessment->id,
    'student_id' => $student->id,
    'marks' => 85,
    'graded_by' => $teacher->id,
]);

// Generate report card
$reportCard = ReportCard::create([
    'student_id' => $student->id,
    'class_id' => $form1Class->id,
    'academic_term_id' => $term->id,
    'total_marks' => 450,
    'average_marks' => 75.5,
    'grade' => 'B',
    'headteacher_comment' => 'Good performance, keep it up!',
]);
```

### 5. Financial Management
```php
// Generate fee invoice
$studentFee = StudentFee::create([
    'student_id' => $student->id,
    'fee_category_id' => $tuitionFee->id,
    'amount' => 150000,
    'due_date' => '2024-02-01',
    'status' => StudentFee::STATUS_PENDING,
]);

// Parent pays via M-Pesa
$payment = FeePayment::create([
    'student_id' => $student->id,
    'student_fee_id' => $studentFee->id,
    'amount' => 150000,
    'payment_method' => FeePayment::PAYMENT_METHOD_MOBILE_MONEY,
    'provider' => 'mpesa',
    'phone_number' => '+255123456789',
    'transaction_id' => 'MPESA123456',
    'status' => FeePayment::STATUS_COMPLETED,
]);

// Update fee balance
$studentFee->updateStatus();
```

### 6. Library Management
```php
// Student borrows book
$issuance = BookIssuance::create([
    'book_id' => $book->id,
    'borrower_id' => $student->id,
    'borrower_type' => BookIssuance::BORROWER_TYPE_STUDENT,
    'issue_date' => now()->toDateString(),
    'due_date' => now()->addDays(14)->toDateString(),
    'status' => BookIssuance::STATUS_ISSUED,
]);

// Librarian scans book
$book->updateCopyCounts();

// System tracks due date
if ($issuance->isOverdue()) {
    $fine = $issuance->calculateFine();
    // Send overdue notification
}
```

---

## API Endpoints

### Academic Management
- `GET /api/academic/assessments` - List assessments
- `POST /api/academic/assessments` - Create assessment
- `PUT /api/academic/assessments/{id}` - Update assessment
- `DELETE /api/academic/assessments/{id}` - Delete assessment
- `POST /api/academic/assessments/{id}/grade` - Grade assessment

### Student Management
- `GET /api/students` - List students
- `POST /api/students` - Create student
- `PUT /api/students/{id}` - Update student
- `GET /api/students/{id}/profile` - Get student profile

### Fee Management
- `GET /api/fees` - List fees
- `POST /api/fees` - Create fee
- `POST /api/fees/payments` - Process payment
- `GET /api/fees/reports` - Get fee reports

### Library Management
- `GET /api/library/books` - List books
- `POST /api/library/books` - Add book
- `POST /api/library/issuances` - Issue book
- `POST /api/library/returns` - Return book

---

## Security Features

### 1. Data Isolation
- **School-Level Isolation**: Complete data separation between schools
- **User Context**: Automatic user context validation
- **Access Control**: Role-based access control
- **Audit Logging**: Comprehensive audit trails

### 2. Authentication & Authorization
- **Multi-Factor Authentication**: 2FA support
- **Session Management**: Secure session handling
- **Password Policies**: Strong password requirements
- **Account Lockout**: Automatic account lockout

### 3. Data Protection
- **Encryption**: Data encryption at rest and in transit
- **Backup Security**: Encrypted backups
- **Access Logging**: Detailed access logs
- **Privacy Compliance**: Tanzanian data protection compliance

---

## Performance Optimization

### 1. Database Optimization
- **Indexing**: Optimized database indexes
- **Query Optimization**: Efficient queries
- **Connection Pooling**: Database connection pooling
- **Caching**: Redis caching implementation

### 2. Application Optimization
- **Lazy Loading**: Lazy loading of relationships
- **Eager Loading**: Eager loading where appropriate
- **Pagination**: Efficient pagination
- **Background Jobs**: Queue-based processing

### 3. Frontend Optimization
- **Code Splitting**: JavaScript code splitting
- **Image Optimization**: Optimized images
- **CDN Integration**: Content delivery network
- **Progressive Loading**: Progressive content loading

---

## Conclusion

The EduTZ-GroupSMS system provides a comprehensive, NECTA-compliant, bilingual school management solution specifically designed for Tanzanian schools. With its multi-tenant architecture, robust security, and extensive feature set, it addresses all the requirements outlined in the original specification while maintaining scalability and ease of use.

The system is ready for production deployment and can immediately support multiple schools with thousands of users, providing a complete digital transformation solution for Tanzanian educational institutions.
