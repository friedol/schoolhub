import type { ReactNode } from 'react';
import type { InertiaLinkProps } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface AuthLayoutProps {
    title: string;
    description: string;
    children?: ReactNode;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    currentSchool?: { id: number; name: string; code: string };
    flash?: { message?: string; status?: string };
    [key: string]: unknown;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    school_id?: number;
    platform_id?: number;
    phone?: string;
    student_number?: string;
    parent_id?: number;
    date_of_birth?: string;
    gender?: string;
    address?: string;
    profile_photo?: string;
    avatar?: string;
    is_active: boolean;
    last_login_at?: string;
    language_preference?: string;
    settings?: Record<string, any>;
    email_verified_at?: string | null;
    two_factor_enabled?: boolean;
    created_at?: string;
    updated_at?: string;
    [key: string]: unknown;
}

export interface School {
    id: number;
    name: string;
    code?: string;
    student_count?: number;
    description?: string;
    motto?: string;
    contact_email: string;
    contact_phone: string;
    address: string;
    region: string;
    district: string;
    ward?: string;
    registration_number?: string;
    necta_number?: string;
    school_level: string;
    is_active: boolean;
    platform_id: number;
    created_at: string;
    updated_at: string;
}

export interface Platform {
    id: number;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    is_active?: boolean;
    subscription_plan?: string;
    description?: string;
    contact_email?: string;
    contact_phone?: string;
    region?: string;
    district?: string;
    created_at?: string;
    updated_at?: string;
}

export interface Role {
    id: number;
    name: string;
    description?: string;
    created_at: string;
    updated_at: string;
}

export interface Permission {
    id: number;
    name: string;
    description?: string;
    created_at: string;
    updated_at: string;
}

export interface SchoolClass {
    id: number;
    school_id: number;
    name: string;
    code: string;
    level: string;
    stream?: string;
    capacity: number;
    class_teacher_id?: number;
    is_active: boolean;
    academic_year: string;
    settings?: Record<string, any>;
    created_at: string;
    updated_at: string;
}

export interface Subject {
    id: number;
    school_id: number;
    name: string;
    code: string;
    description?: string;
    category: string;
    is_core: boolean;
    is_elective: boolean;
    is_necta_subject: boolean;
    credits: number;
    is_active: boolean;
    settings?: Record<string, any>;
    created_at: string;
    updated_at: string;
}

export interface AcademicTerm {
    id: number;
    school_id: number;
    academic_year: string;
    term: string;
    name: string;
    start_date: string;
    end_date: string;
    is_current: boolean;
    is_active: boolean;
    settings?: Record<string, any>;
    created_at: string;
    updated_at: string;
}

export interface StudentApplication {
    id: number;
    school_id: number;
    application_number: string;
    first_name: string;
    middle_name?: string;
    last_name: string;
    date_of_birth: string;
    gender: string;
    nationality: string;
    religion?: string;
    phone?: string;
    email?: string;
    address: string;
    region: string;
    district: string;
    ward?: string;
    previous_school?: string;
    previous_class?: string;
    reason_for_transfer?: string;
    parent_name: string;
    parent_phone: string;
    parent_email?: string;
    parent_occupation?: string;
    parent_address: string;
    guardian_name?: string;
    guardian_phone?: string;
    guardian_email?: string;
    guardian_relationship?: string;
    medical_conditions?: string;
    allergies?: string;
    emergency_contact_name: string;
    emergency_contact_phone: string;
    emergency_contact_relationship: string;
    documents?: Record<string, any>;
    status: string;
    applied_class: string;
    applied_academic_year: string;
    notes?: string;
    reviewed_by?: number;
    reviewed_at?: string;
    approved_by?: number;
    approved_at?: string;
    created_at: string;
    updated_at: string;
}

export interface StudentProfile {
    id: number;
    student_id: number;
    admission_number: string;
    admission_date: string;
    class_id?: number;
    stream?: string;
    boarding_status: string;
    transport_route?: number;
    medical_info?: Record<string, any>;
    allergies?: string;
    medications?: string;
    emergency_contact_name: string;
    emergency_contact_phone: string;
    emergency_contact_relationship: string;
    previous_school?: string;
    previous_class?: string;
    transfer_reason?: string;
    disciplinary_records?: Record<string, any>;
    achievements?: Record<string, any>;
    extracurricular_activities?: Record<string, any>;
    special_needs?: Record<string, any>;
    learning_disabilities?: Record<string, any>;
    parent_marital_status?: string;
    siblings_in_school?: Record<string, any>;
    family_income_range?: string;
    scholarship_status: string;
    scholarship_amount: number;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface StaffProfile {
    id: number;
    staff_id: number;
    employee_number: string;
    tsc_number?: string;
    employment_type: string;
    employment_status: string;
    hire_date: string;
    contract_start_date?: string;
    contract_end_date?: string;
    department?: string;
    position?: string;
    job_title?: string;
    reporting_to?: number;
    qualifications?: Record<string, any>;
    certifications?: Record<string, any>;
    previous_employment?: Record<string, any>;
    emergency_contact_name: string;
    emergency_contact_phone: string;
    emergency_contact_relationship: string;
    bank_name?: string;
    bank_account_number?: string;
    bank_branch?: string;
    nssf_number?: string;
    nhif_number?: string;
    tax_pin?: string;
    medical_info?: Record<string, any>;
    allergies?: string;
    medications?: string;
    performance_notes?: Record<string, any>;
    disciplinary_records?: Record<string, any>;
    achievements?: Record<string, any>;
    training_records?: Record<string, any>;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface FeeCategory {
    id: number;
    school_id: number;
    name: string;
    code: string;
    description?: string;
    amount: number;
    currency: string;
    payment_frequency: string;
    due_date?: string;
    is_mandatory: boolean;
    is_active: boolean;
    settings?: Record<string, any>;
    created_at: string;
    updated_at: string;
}

export interface StudentFee {
    id: number;
    school_id: number;
    student_id: number;
    fee_category_id: number;
    academic_term_id: number;
    amount: number;
    currency: string;
    due_date: string;
    status: string;
    paid_amount: number;
    balance: number;
    payment_plan?: string;
    installments?: Record<string, any>;
    notes?: string;
    created_by: number;
    created_at: string;
    updated_at: string;
}

export interface FeePayment {
    id: number;
    school_id: number;
    student_id: number;
    student_fee_id: number;
    fee_category_id: number;
    amount: number;
    currency: string;
    payment_method: string;
    payment_reference?: string;
    transaction_id?: string;
    payment_date: string;
    status: string;
    processed_by?: number;
    processed_at?: string;
    notes?: string;
    receipt_number: string;
    bank_reference?: string;
    mobile_money_provider?: string;
    mobile_money_phone?: string;
    mobile_money_transaction_id?: string;
    created_at: string;
    updated_at: string;
}

export interface Book {
    id: number;
    school_id: number;
    isbn?: string;
    title: string;
    author: string;
    publisher?: string;
    publication_year?: number;
    edition?: string;
    category: string;
    subcategory?: string;
    language: string;
    pages?: number;
    description?: string;
    location: string;
    shelf_number: string;
    total_copies: number;
    available_copies: number;
    borrowed_copies: number;
    lost_copies: number;
    damaged_copies: number;
    price?: number;
    currency: string;
    purchase_date?: string;
    donor?: string;
    condition: string;
    is_reference: boolean;
    is_active: boolean;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface BookIssuance {
    id: number;
    school_id: number;
    book_id: number;
    borrower_id: number;
    borrower_type: string;
    issue_date: string;
    due_date: string;
    return_date?: string;
    status: string;
    fine_amount: number;
    fine_paid: number;
    issued_by: number;
    returned_to?: number;
    notes?: string;
    renewal_count: number;
    last_renewal_date?: string;
    created_at: string;
    updated_at: string;
}

export interface InventoryItem {
    id: number;
    school_id: number;
    item_code: string;
    name: string;
    description?: string;
    category: string;
    subcategory?: string;
    unit_of_measure: string;
    current_stock: number;
    minimum_stock: number;
    maximum_stock?: number;
    reorder_level: number;
    unit_cost: number;
    currency: string;
    supplier?: string;
    location: string;
    condition: string;
    purchase_date?: string;
    warranty_expiry?: string;
    asset_tag?: string;
    serial_number?: string;
    is_consumable: boolean;
    is_active: boolean;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface Vehicle {
    id: number;
    school_id: number;
    vehicle_number: string;
    registration_number: string;
    make: string;
    model: string;
    year: number;
    color: string;
    capacity: number;
    vehicle_type: string;
    fuel_type: string;
    insurance_company?: string;
    insurance_policy_number?: string;
    insurance_expiry?: string;
    license_plate: string;
    chassis_number?: string;
    engine_number?: string;
    purchase_date?: string;
    purchase_price?: number;
    current_value?: number;
    driver_id?: number;
    route_id?: number;
    status: string;
    is_active: boolean;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface TransportRoute {
    id: number;
    school_id: number;
    route_name: string;
    route_code: string;
    start_location: string;
    end_location: string;
    distance_km: number;
    estimated_duration: number;
    fare_amount: number;
    currency: string;
    is_active: boolean;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface Hostel {
    id: number;
    school_id: number;
    hostel_name: string;
    hostel_code: string;
    gender: string;
    capacity: number;
    current_occupancy: number;
    warden_id?: number;
    assistant_warden_id?: number;
    building_name: string;
    floor: number;
    description?: string;
    facilities?: Record<string, any>;
    rules?: Record<string, any>;
    is_active: boolean;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface HostelRoom {
    id: number;
    hostel_id: number;
    room_number: string;
    room_type: string;
    capacity: number;
    current_occupancy: number;
    floor: number;
    facilities?: Record<string, any>;
    is_active: boolean;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface Message {
    id: number;
    school_id: number;
    sender_id: number;
    subject: string;
    content: string;
    message_type: string;
    priority: string;
    recipient_type: string;
    recipient_ids?: Record<string, any>;
    send_sms: boolean;
    send_email: boolean;
    send_push: boolean;
    scheduled_at?: string;
    sent_at?: string;
    status: string;
    sms_status?: string;
    email_status?: string;
    push_status?: string;
    delivery_reports?: Record<string, any>;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface Announcement {
    id: number;
    school_id: number;
    created_by: number;
    title: string;
    content: string;
    type: string;
    priority: string;
    target_audience: string;
    target_ids?: Record<string, any>;
    publish_date: string;
    expiry_date?: string;
    is_published: boolean;
    published_at?: string;
    attachments?: Record<string, any>;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface Assessment {
    id: number;
    school_id: number;
    academic_term_id: number;
    subject_id: number;
    school_class_id: number;
    name: string;
    type: string;
    max_marks: number;
    weightage: number;
    date: string;
    is_published: boolean;
    created_at: string;
    updated_at: string;
}

export interface Attendance {
    id: number;
    school_id: number;
    user_id: number;
    academic_term_id: number;
    date: string;
    status: string;
    type: string;
    remarks?: string;
    created_at: string;
    updated_at: string;
}

export interface ReportCard {
    id: number;
    school_id: number;
    student_id: number;
    academic_term_id: number;
    total_marks: number;
    average_marks: number;
    grade: string;
    ranking: number;
    teacher_comment?: string;
    headteacher_comment?: string;
    published_at?: string;
    created_at: string;
    updated_at: string;
}

export interface Timetable {
    id: number;
    school_id: number;
    academic_term_id: number;
    school_class_id: number;
    subject_id: number;
    teacher_id: number;
    day_of_week: string;
    start_time: string;
    end_time: string;
    room_number?: string;
    created_at: string;
    updated_at: string;
}

export interface Curriculum {
    id: number;
    school_id: number;
    name: string;
    description?: string;
    academic_year: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface CurriculumSubject {
    id: number;
    curriculum_id: number;
    subject_id: number;
    school_class_id: number;
    teacher_id?: number;
    academic_year: string;
    created_at: string;
    updated_at: string;
}

export interface AssessmentResult {
    id: number;
    assessment_id: number;
    student_id: number;
    marks_obtained: number;
    grade: string;
    comments?: string;
    created_at: string;
    updated_at: string;
}

export interface ReportCardSubject {
    id: number;
    report_card_id: number;
    subject_id: number;
    marks: number;
    grade: string;
    points: number;
    position: number;
    total_students: number;
    teacher_comment?: string;
    created_at: string;
    updated_at: string;
}

export interface SalaryRecord {
    id: number;
    staff_id: number;
    pay_period_start: string;
    pay_period_end: string;
    basic_salary: number;
    allowances?: Record<string, any>;
    deductions?: Record<string, any>;
    gross_salary: number;
    net_salary: number;
    currency: string;
    payment_method?: string;
    payment_date?: string;
    payment_status: string;
    bank_reference?: string;
    notes?: string;
    processed_by?: number;
    processed_at?: string;
    created_at: string;
    updated_at: string;
}

export interface LeaveRecord {
    id: number;
    staff_id: number;
    leave_type: string;
    start_date: string;
    end_date: string;
    total_days: number;
    reason: string;
    status: string;
    applied_date: string;
    approved_by?: number;
    approved_date?: string;
    rejected_reason?: string;
    rejected_by?: number;
    rejected_date?: string;
    emergency_contact?: string;
    handover_notes?: string;
    return_date?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface PerformanceAppraisal {
    id: number;
    staff_id: number;
    appraisal_period: string;
    appraisal_date: string;
    goals?: Record<string, any>;
    achievements?: Record<string, any>;
    areas_for_improvement?: Record<string, any>;
    overall_rating?: number;
    supervisor_comments?: string;
    staff_comments?: string;
    recommendations?: string;
    supervisor_id: number;
    status: string;
    created_at: string;
    updated_at: string;
}

export interface FinancialTransaction {
    id: number;
    school_id: number;
    transaction_number: string;
    type: string;
    category: string;
    description: string;
    amount: number;
    currency: string;
    transaction_date: string;
    reference_number?: string;
    payment_method?: string;
    created_by: number;
    approved_by?: number;
    approved_at?: string;
    status: string;
    notes?: string;
    attachments?: Record<string, any>;
    created_at: string;
    updated_at: string;
}

export interface LibraryFine {
    id: number;
    school_id: number;
    book_issuance_id: number;
    borrower_id: number;
    fine_amount: number;
    currency: string;
    fine_date: string;
    reason: string;
    status: string;
    paid_amount: number;
    paid_date?: string;
    waived_by?: number;
    waived_date?: string;
    waiver_reason?: string;
    created_at: string;
    updated_at: string;
}

export interface InventoryTransaction {
    id: number;
    school_id: number;
    inventory_item_id: number;
    transaction_type: string;
    quantity: number;
    unit_cost: number;
    total_cost: number;
    reason: string;
    reference_number?: string;
    performed_by: number;
    approved_by?: number;
    transaction_date: string;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface AssetAssignment {
    id: number;
    school_id: number;
    inventory_item_id: number;
    assigned_to: number;
    assignment_type: string;
    location?: string;
    assignment_date: string;
    return_date?: string;
    status: string;
    condition_notes?: string;
    assigned_by: number;
    returned_to?: number;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface RouteStop {
    id: number;
    route_id: number;
    stop_name: string;
    stop_code: string;
    address: string;
    latitude?: number;
    longitude?: number;
    pickup_time?: string;
    dropoff_time?: string;
    sequence_order: number;
    is_active: boolean;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface TransportAssignment {
    id: number;
    school_id: number;
    student_id: number;
    route_id: number;
    vehicle_id?: number;
    stop_id?: number;
    assignment_date: string;
    end_date?: string;
    status: string;
    fare_amount: number;
    currency: string;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface TransportTrip {
    id: number;
    school_id: number;
    vehicle_id: number;
    route_id: number;
    driver_id: number;
    trip_date: string;
    trip_type: string;
    scheduled_departure: string;
    actual_departure?: string;
    scheduled_arrival: string;
    actual_arrival?: string;
    total_passengers: number;
    total_students: number;
    total_teachers: number;
    status: string;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface BusAttendance {
    id: number;
    school_id: number;
    student_id: number;
    vehicle_id: number;
    trip_id?: number;
    attendance_date: string;
    trip_type: string;
    status: string;
    boarding_time?: string;
    alighting_time?: string;
    marked_by: number;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface HostelResident {
    id: number;
    student_id: number;
    hostel_id: number;
    room_id: number;
    bed_number: string;
    allocation_date: string;
    end_date?: string;
    status: string;
    allocation_notes?: string;
    allocated_by: number;
    transferred_by?: number;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface HostelLeaveRecord {
    id: number;
    student_id: number;
    hostel_id: number;
    leave_type: string;
    start_date: string;
    end_date: string;
    reason: string;
    destination: string;
    contact_person: string;
    contact_phone: string;
    status: string;
    approved_by?: number;
    approved_at?: string;
    rejection_reason?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface VehicleMaintenance {
    id: number;
    vehicle_id: number;
    date: string;
    maintenance_type: string;
    description: string;
    cost: number;
    currency: string;
    service_provider?: string;
    mileage?: number;
    next_maintenance_date?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface FuelRecord {
    id: number;
    vehicle_id: number;
    date: string;
    quantity: number;
    unit: string;
    cost: number;
    currency: string;
    fuel_station?: string;
    mileage?: number;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface MessageRecipient {
    id: number;
    message_id: number;
    recipient_id: number;
    delivery_status: string;
    delivered_at?: string;
    read_at?: string;
    sms_delivered_at?: string;
    email_delivered_at?: string;
    push_delivered_at?: string;
    delivery_error?: string;
    device_info?: Record<string, any>;
    created_at: string;
    updated_at: string;
}
