# EduTZ-GroupSMS API Documentation

## Overview

The EduTZ-GroupSMS API provides comprehensive endpoints for managing multi-tenant school systems in Tanzania. The API follows RESTful principles and supports both English and Swahili languages.

## Base URL

```
Production: https://api.edutz-group.com/v1
Development: http://localhost:8000/api/v1
```

## Authentication

The API uses Laravel Sanctum for authentication. Include the bearer token in the Authorization header:

```
Authorization: Bearer {your-token}
```

## Rate Limiting

- **Authenticated users**: 1000 requests per hour
- **Unauthenticated users**: 100 requests per hour

## Response Format

All API responses follow this format:

```json
{
    "success": true,
    "data": {},
    "message": "Success message",
    "meta": {
        "pagination": {},
        "language": "en"
    }
}
```

## Error Handling

Error responses follow this format:

```json
{
    "success": false,
    "error": {
        "code": "VALIDATION_ERROR",
        "message": "The given data was invalid.",
        "details": {
            "email": ["The email field is required."]
        }
    }
}
```

## Multi-Tenant Context

All endpoints automatically scope data based on the authenticated user's context:
- **Super Admins**: Access to all platform data
- **School Admins**: Access to their school's data only
- **Teachers/Students/Parents**: Access to their school's data only

---

## Authentication Endpoints

### Login
```http
POST /auth/login
```

**Request Body:**
```json
{
    "email": "user@example.com",
    "password": "password",
    "remember": false
}
```

**Response:**
```json
{
    "success": true,
    "data": {
        "user": {
            "id": 1,
            "name": "John Doe",
            "email": "user@example.com",
            "role": "school_admin",
            "school_id": 1,
            "platform_id": 1,
            "language_preference": "en"
        },
        "token": "1|abc123...",
        "expires_at": "2024-12-31T23:59:59Z"
    }
}
```

### Logout
```http
POST /auth/logout
```

### Register (Super Admin only)
```http
POST /auth/register
```

---

## Platform Management (Super Admin)

### Get Platform Dashboard
```http
GET /platform/dashboard
```

**Response:**
```json
{
    "success": true,
    "data": {
        "platform": {
            "id": 1,
            "name": "EduTZ Group",
            "description": "Leading educational platform",
            "contact_email": "admin@edutz-group.com",
            "subscription_plan": "premium"
        },
        "statistics": {
            "total_schools": 15,
            "active_schools": 14,
            "total_students": 2500,
            "total_teachers": 150,
            "total_parents": 2000
        },
        "recent_schools": [],
        "schools_by_region": {},
        "user_distribution": {}
    }
}
```

### List Schools
```http
GET /platform/schools
```

**Query Parameters:**
- `search` (string): Search by name, code, region, or district
- `region` (string): Filter by region
- `level` (string): Filter by school level
- `status` (string): Filter by active status
- `page` (integer): Page number
- `per_page` (integer): Items per page

### Create School
```http
POST /platform/schools
```

**Request Body:**
```json
{
    "name": "EduTZ Academy - Mwanza",
    "description": "Quality education in Mwanza",
    "address": "Nyamagana, Mwanza",
    "region": "Mwanza",
    "district": "Nyamagana",
    "ward": "Nyamagana",
    "contact_email": "info@edutz-mwanza.ac.tz",
    "contact_phone": "+255123456789",
    "school_level": "combined",
    "registration_number": "REG-001-2024",
    "necta_number": "NECTA-001-2024",
    "motto": "Excellence Through Knowledge",
    "admin_name": "Dr. John Mwalimu",
    "admin_email": "headmaster@edutz-mwanza.ac.tz",
    "admin_phone": "+255123456790"
}
```

### Get School Details
```http
GET /platform/schools/{id}
```

### Toggle School Status
```http
PATCH /platform/schools/{id}/toggle-status
```

### Get Platform Analytics
```http
GET /platform/analytics
```

---

## School Management (School Admin)

### Get School Dashboard
```http
GET /school/dashboard
```

**Response:**
```json
{
    "success": true,
    "data": {
        "school": {
            "id": 1,
            "name": "EduTZ Academy - Dar es Salaam",
            "code": "ETZ-DAR-001",
            "motto": "Excellence Through Knowledge",
            "school_level": "combined"
        },
        "statistics": {
            "total_students": 500,
            "total_teachers": 25,
            "total_parents": 450,
            "total_classes": 20,
            "total_subjects": 15
        },
        "recent_students": [],
        "class_distribution": [],
        "fee_summary": {
            "total_expected": 50000000,
            "total_collected": 45000000,
            "pending_amount": 5000000
        }
    }
}
```

### Student Management

#### List Students
```http
GET /school/students
```

**Query Parameters:**
- `search` (string): Search by name, student number, or email
- `class_id` (integer): Filter by class
- `gender` (string): Filter by gender
- `page` (integer): Page number

#### Create Student
```http
POST /school/students
```

**Request Body:**
```json
{
    "name": "John Mwalimu",
    "email": "john.mwalimu@school.ac.tz",
    "phone": "+255123456789",
    "date_of_birth": "2010-05-15",
    "gender": "male",
    "address": "Dar es Salaam, Tanzania",
    "class_id": 1,
    "parent_id": 1,
    "student_number": "001"
}
```

#### Get Student Details
```http
GET /school/students/{id}
```

#### Update Student
```http
PUT /school/students/{id}
```

#### Delete Student
```http
DELETE /school/students/{id}
```

### Teacher Management

#### List Teachers
```http
GET /school/teachers
```

#### Create Teacher
```http
POST /school/teachers
```

**Request Body:**
```json
{
    "name": "Ms. Grace Mwalimu",
    "email": "grace.mwalimu@school.ac.tz",
    "phone": "+255123456789",
    "date_of_birth": "1985-03-20",
    "gender": "female",
    "address": "Dar es Salaam, Tanzania",
    "class_id": 1
}
```

### Class Management

#### List Classes
```http
GET /school/classes
```

#### Create Class
```http
POST /school/classes
```

**Request Body:**
```json
{
    "name": "Form 1A",
    "code": "F1A",
    "level": "Form 1",
    "stream": "A",
    "capacity": 40,
    "class_teacher_id": 1,
    "academic_year": "2024"
}
```

### Subject Management

#### List Subjects
```http
GET /school/subjects
```

#### Create Subject
```http
POST /school/subjects
```

**Request Body:**
```json
{
    "name": "Mathematics",
    "code": "MATH",
    "description": "Core mathematics subject",
    "category": "core",
    "is_core": true,
    "is_elective": false,
    "is_necta_subject": true,
    "credits": 4
}
```

### Fee Management

#### List Fee Categories
```http
GET /school/fee-categories
```

#### Create Fee Category
```http
POST /school/fee-categories
```

**Request Body:**
```json
{
    "name": "Tuition Fee",
    "description": "Monthly tuition fee",
    "amount": 50000,
    "currency": "TZS",
    "payment_frequency": "monthly",
    "due_date": "2024-02-01",
    "is_mandatory": true
}
```

#### Process Payment
```http
POST /school/payments
```

**Request Body:**
```json
{
    "student_id": 1,
    "fee_category_id": 1,
    "amount": 50000,
    "payment_method": "mobile_money",
    "provider": "mpesa",
    "phone_number": "+255123456789",
    "reference": "MPESA123456"
}
```

---

## Communication Endpoints

### Send Message
```http
POST /communication/messages
```

**Request Body:**
```json
{
    "recipients": [1, 2, 3],
    "recipient_type": "students",
    "subject": "Important Announcement",
    "message": "School will be closed tomorrow",
    "priority": "high",
    "send_sms": true,
    "send_email": true
}
```

### Get Messages
```http
GET /communication/messages
```

### Mark Message as Read
```http
PATCH /communication/messages/{id}/read
```

---

## Language Endpoints

### Switch Language
```http
POST /language/switch
```

**Request Body:**
```json
{
    "language": "sw"
}
```

### Get Current Language
```http
GET /language/current
```

---

## Mobile Money Integration

### Initialize Payment
```http
POST /payments/mobile-money/initialize
```

**Request Body:**
```json
{
    "amount": 50000,
    "currency": "TZS",
    "provider": "mpesa",
    "phone_number": "+255123456789",
    "description": "School Fee Payment",
    "reference": "FEE-001"
}
```

### Verify Payment
```http
POST /payments/mobile-money/verify
```

**Request Body:**
```json
{
    "transaction_id": "MPESA123456",
    "reference": "FEE-001"
}
```

---

## File Upload Endpoints

### Upload Profile Photo
```http
POST /upload/profile-photo
```

**Request Body:** (multipart/form-data)
- `photo` (file): Image file (max 2MB)
- `user_id` (integer): User ID

### Upload School Logo
```http
POST /upload/school-logo
```

**Request Body:** (multipart/form-data)
- `logo` (file): Image file (max 2MB)
- `school_id` (integer): School ID

---

## Webhook Endpoints

### Mobile Money Payment Webhook
```http
POST /webhooks/mobile-money/{provider}
```

**Headers:**
- `X-Webhook-Signature`: Signature for verification

**Request Body:**
```json
{
    "transaction_id": "MPESA123456",
    "amount": 50000,
    "currency": "TZS",
    "status": "completed",
    "reference": "FEE-001",
    "timestamp": "2024-01-27T10:30:00Z"
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Request validation failed |
| `UNAUTHORIZED` | Authentication required |
| `FORBIDDEN` | Insufficient permissions |
| `NOT_FOUND` | Resource not found |
| `RATE_LIMITED` | Too many requests |
| `PAYMENT_FAILED` | Payment processing failed |
| `SCHOOL_NOT_FOUND` | School not found or inactive |
| `USER_NOT_FOUND` | User not found |
| `INVALID_ROLE` | Invalid user role |

---

## SDKs and Libraries

### JavaScript/TypeScript
```bash
npm install @edutz/sdk
```

```javascript
import { EduTZClient } from '@edutz/sdk';

const client = new EduTZClient({
    baseUrl: 'https://api.edutz-group.com/v1',
    token: 'your-api-token'
});

// Get school dashboard
const dashboard = await client.school.getDashboard();
```

### PHP
```bash
composer require edutz/php-sdk
```

```php
use EduTZ\Client;

$client = new Client([
    'base_url' => 'https://api.edutz-group.com/v1',
    'token' => 'your-api-token'
]);

// Get school dashboard
$dashboard = $client->school()->getDashboard();
```

---

## Support

For API support and questions:
- Email: api-support@edutz-group.com
- Documentation: https://docs.edutz-group.com
- Status Page: https://status.edutz-group.com
