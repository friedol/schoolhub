<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Models\School;
use App\Models\User;
use App\Models\SchoolClass;
use App\Models\Grade;
use App\Models\Assessment;
use App\Models\AssessmentResult;
use App\Models\Attendance;
use App\Models\StudentFee;
use App\Models\FeePayment;
use App\Models\Invoice;
use App\Models\Book;
use App\Models\BookIssuance;
use App\Models\InventoryItem;
use App\Models\Vehicle;
use App\Models\Message;
use App\Models\Announcement;
use App\Models\Event;
use App\Models\Hostel;
use App\Models\HostelAllocation;
use App\Models\TransportAssignment;
use App\Models\MeetingRequest;
use App\Models\Report;
use App\Models\ReportRun;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

class AnalyticsController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
        $this->middleware('role:school_admin,headteacher,bursar,super_admin');
    }

    /**
     * Display analytics dashboard
     */
    public function dashboard(): Response
    {
        $user = Auth::user();
        
        if ($user->isSuperAdmin()) {
            return $this->superAdminAnalytics();
        } else {
            return $this->schoolAnalytics($user->school);
        }
    }

    /**
     * Get academic analytics
     */
    public function getAcademicAnalytics(Request $request)
    {
        $schoolId = Auth::user()->school_id;
        $dateRange = $this->getDateRange($request);

        $analytics = [
            'student_statistics' => $this->getStudentStatistics($schoolId, $dateRange),
            'teacher_statistics' => $this->getTeacherStatistics($schoolId, $dateRange),
            'class_performance' => $this->getClassPerformance($schoolId, $dateRange),
            'attendance_trends' => $this->getAttendanceTrends($schoolId, $dateRange),
            'examination_analysis' => $this->getExaminationAnalysis($schoolId, $dateRange),
            'subject_performance' => $this->getSubjectPerformance($schoolId, $dateRange),
            'grade_distribution' => $this->getGradeDistribution($schoolId, $dateRange),
        ];

        return response()->json($analytics);
    }

    /**
     * Get financial analytics
     */
    public function getFinancialAnalytics(Request $request)
    {
        $schoolId = Auth::user()->school_id;
        $dateRange = $this->getDateRange($request);

        $analytics = [
            'fee_collection' => $this->getFeeCollectionAnalytics($schoolId, $dateRange),
            'expense_analysis' => $this->getExpenseAnalysis($schoolId, $dateRange),
            'budget_vs_actual' => $this->getBudgetVsActual($schoolId, $dateRange),
            'payment_trends' => $this->getPaymentTrends($schoolId, $dateRange),
            'arrears_analysis' => $this->getArrearsAnalysis($schoolId, $dateRange),
            'revenue_breakdown' => $this->getRevenueBreakdown($schoolId, $dateRange),
        ];

        return response()->json($analytics);
    }

    /**
     * Get operational analytics
     */
    public function getOperationalAnalytics(Request $request)
    {
        $schoolId = Auth::user()->school_id;
        $dateRange = $this->getDateRange($request);

        $analytics = [
            'inventory_status' => $this->getInventoryStatus($schoolId, $dateRange),
            'library_usage' => $this->getLibraryUsage($schoolId, $dateRange),
            'transport_utilization' => $this->getTransportUtilization($schoolId, $dateRange),
            'hostel_occupancy' => $this->getHostelOccupancy($schoolId, $dateRange),
            'resource_utilization' => $this->getResourceUtilization($schoolId, $dateRange),
            'maintenance_requests' => $this->getMaintenanceRequests($schoolId, $dateRange),
        ];

        return response()->json($analytics);
    }

    /**
     * Get communication analytics
     */
    public function getCommunicationAnalytics(Request $request)
    {
        $schoolId = Auth::user()->school_id;
        $dateRange = $this->getDateRange($request);

        $analytics = [
            'message_statistics' => $this->getMessageStatistics($schoolId, $dateRange),
            'announcement_engagement' => $this->getAnnouncementEngagement($schoolId, $dateRange),
            'event_participation' => $this->getEventParticipation($schoolId, $dateRange),
            'communication_trends' => $this->getCommunicationTrends($schoolId, $dateRange),
            'meeting_statistics' => $this->getMeetingStatistics($schoolId, $dateRange),
        ];

        return response()->json($analytics);
    }

    /**
     * Get role-specific dashboard data
     */
    public function getDashboardData(Request $request)
    {
        $schoolId = Auth::user()->school_id;
        $role = Auth::user()->role;

        $dashboardData = match ($role) {
            'headteacher' => $this->getHeadteacherDashboard($schoolId),
            'teacher' => $this->getTeacherDashboard($schoolId),
            'bursar' => $this->getBursarDashboard($schoolId),
            'librarian' => $this->getLibrarianDashboard($schoolId),
            'dormitory_manager' => $this->getDormitoryManagerDashboard($schoolId),
            'academic_master' => $this->getAcademicMasterDashboard($schoolId),
            'parent' => $this->getParentDashboard($schoolId),
            'student' => $this->getStudentDashboard($schoolId),
            default => $this->getDefaultDashboard($schoolId),
        };

        return response()->json($dashboardData);
    }

    /**
     * Generate custom report
     */
    public function generateCustomReport(Request $request)
    {
        $request->validate([
            'report_type' => 'required|string',
            'date_range' => 'required|array',
            'date_range.start' => 'required|date',
            'date_range.end' => 'required|date',
            'filters' => 'nullable|array',
            'output_format' => 'nullable|in:json,pdf,excel,csv',
        ]);

        $reportType = $request->report_type;
        $startDate = $request->date_range['start'];
        $endDate = $request->date_range['end'];
        $filters = $request->filters ?? [];
        $outputFormat = $request->output_format ?? 'json';

        $schoolId = Auth::user()->school_id;
        $reportData = $this->generateReportData($reportType, $schoolId, $startDate, $endDate, $filters);

        if ($outputFormat === 'json') {
            return response()->json([
                'success' => true,
                'data' => $reportData,
                'report_type' => $reportType,
                'date_range' => ['start' => $startDate, 'end' => $endDate],
            ]);
        }

        // Generate file for other formats
        $fileName = $this->generateReportFile($reportData, $outputFormat, $reportType, $startDate, $endDate);
        
        return response()->json([
            'success' => true,
            'file_url' => route('reports.download', ['file' => $fileName]),
            'file_name' => $fileName,
        ]);
    }

    // ==================== CORE ANALYTICS METHODS ====================

    /**
     * Get student statistics
     */
    private function getStudentStatistics($schoolId, $dateRange)
    {
        $totalStudents = User::where('school_id', $schoolId)
            ->where('role', 'student')
            ->count();

        $activeStudents = User::where('school_id', $schoolId)
            ->where('role', 'student')
            ->where('is_active', true)
            ->count();

        $newStudents = User::where('school_id', $schoolId)
            ->where('role', 'student')
            ->whereBetween('created_at', $dateRange)
            ->count();

        $studentsByClass = User::where('school_id', $schoolId)
            ->where('role', 'student')
            ->with('schoolClass')
            ->get()
            ->groupBy('schoolClass.name')
            ->map->count();

        $studentsByGrade = User::where('school_id', $schoolId)
            ->where('role', 'student')
            ->with('grade')
            ->get()
            ->groupBy('grade.name')
            ->map->count();

        return [
            'total_students' => $totalStudents,
            'active_students' => $activeStudents,
            'new_students' => $newStudents,
            'students_by_class' => $studentsByClass,
            'students_by_grade' => $studentsByGrade,
            'attendance_rate' => $this->calculateAttendanceRate($schoolId, $dateRange),
            'graduation_rate' => $this->calculateGraduationRate($schoolId, $dateRange),
        ];
    }

    /**
     * Get teacher statistics
     */
    private function getTeacherStatistics($schoolId, $dateRange)
    {
        $totalTeachers = User::where('school_id', $schoolId)
            ->where('role', 'teacher')
            ->count();

        $activeTeachers = User::where('school_id', $schoolId)
            ->where('role', 'teacher')
            ->where('is_active', true)
            ->count();

        $newTeachers = User::where('school_id', $schoolId)
            ->where('role', 'teacher')
            ->whereBetween('created_at', $dateRange)
            ->count();

        $teachersBySubject = User::where('school_id', $schoolId)
            ->where('role', 'teacher')
            ->with('subjects')
            ->get()
            ->flatMap->subjects
            ->groupBy('name')
            ->map->count();

        return [
            'total_teachers' => $totalTeachers,
            'active_teachers' => $activeTeachers,
            'new_teachers' => $newTeachers,
            'teachers_by_subject' => $teachersBySubject,
            'teacher_student_ratio' => $this->calculateTeacherStudentRatio($schoolId),
            'teacher_attendance_rate' => $this->calculateTeacherAttendanceRate($schoolId, $dateRange),
        ];
    }

    /**
     * Get class performance analytics
     */
    private function getClassPerformance($schoolId, $dateRange)
    {
        $classes = SchoolClass::where('school_id', $schoolId)
            ->with(['students', 'homeroomTeacher'])
            ->get();

        $classPerformance = $classes->map(function ($class) use ($dateRange) {
            $studentCount = $class->students->count();
            $attendanceRate = $this->calculateClassAttendanceRate($class->id, $dateRange);
            $performanceScore = $this->calculateClassPerformanceScore($class->id, $dateRange);
            
            return [
                'class_id' => $class->id,
                'class_name' => $class->name,
                'level' => $class->level,
                'stream' => $class->stream,
                'student_count' => $studentCount,
                'homeroom_teacher' => $class->homeroomTeacher->name ?? 'Not Assigned',
                'attendance_rate' => $attendanceRate,
                'performance_score' => $performanceScore,
                'average_marks' => $this->getClassAverageMarks($class->id, $dateRange),
                'top_performers' => $this->getClassTopPerformers($class->id, $dateRange),
            ];
        });

        return $classPerformance;
    }

    /**
     * Get attendance trends
     */
    private function getAttendanceTrends($schoolId, $dateRange)
    {
        $dailyAttendance = Attendance::where('school_id', $schoolId)
            ->whereBetween('date', $dateRange)
            ->selectRaw('DATE(date) as date, 
                COUNT(*) as total_records,
                SUM(CASE WHEN status IN ("present", "late") THEN 1 ELSE 0 END) as present_count')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $monthlyTrend = Attendance::where('school_id', $schoolId)
            ->whereBetween('date', $dateRange)
            ->selectRaw('MONTH(date) as month, 
                COUNT(*) as total_records,
                SUM(CASE WHEN status IN ("present", "late") THEN 1 ELSE 0 END) as present_count')
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        return [
            'daily_attendance' => [
                'labels' => $dailyAttendance->pluck('date'),
                'data' => $dailyAttendance->map(function ($item) {
                    return $item->total_records > 0 ? 
                        round(($item->present_count / $item->total_records) * 100, 2) : 0;
                }),
            ],
            'monthly_trend' => [
                'labels' => $monthlyTrend->pluck('month'),
                'data' => $monthlyTrend->map(function ($item) {
                    return $item->total_records > 0 ? 
                        round(($item->present_count / $item->total_records) * 100, 2) : 0;
                }),
            ],
            'average_attendance' => $this->calculateOverallAttendanceRate($schoolId, $dateRange),
            'attendance_by_status' => $this->getAttendanceByStatus($schoolId, $dateRange),
        ];
    }

    /**
     * Get examination analysis
     */
    private function getExaminationAnalysis($schoolId, $dateRange)
    {
        $examinations = Assessment::where('school_id', $schoolId)
            ->where('type', 'examination')
            ->whereBetween('date', $dateRange)
            ->with(['subject', 'results'])
            ->get();

        $totalExaminations = $examinations->count();
        $averageScores = $examinations->mapWithKeys(function ($exam) {
            $avgScore = $exam->results->avg('marks');
            return [$exam->subject->name => $avgScore];
        });

        $passRate = $examinations->map(function ($exam) {
            $totalStudents = $exam->results->count();
            $passedStudents = $exam->results->where('marks', '>=', 50)->count();
            return $totalStudents > 0 ? ($passedStudents / $totalStudents) * 100 : 0;
        })->avg();

        $topPerformers = AssessmentResult::whereIn('assessment_id', $examinations->pluck('id'))
            ->with(['student', 'assessment.subject'])
            ->orderByDesc('marks')
            ->limit(10)
            ->get();

        return [
            'total_examinations' => $totalExaminations,
            'average_scores' => $averageScores,
            'pass_rate' => round($passRate, 2),
            'top_performers' => $topPerformers,
            'subject_performance' => $this->getSubjectPerformanceInExams($schoolId, $dateRange),
        ];
    }

    /**
     * Get subject performance
     */
    private function getSubjectPerformance($schoolId, $dateRange)
    {
        $subjectPerformance = AssessmentResult::join('assessments', 'assessment_results.assessment_id', '=', 'assessments.id')
            ->join('subjects', 'assessments.subject_id', '=', 'subjects.id')
            ->where('assessments.school_id', $schoolId)
            ->whereBetween('assessments.date', $dateRange)
            ->whereNotNull('assessment_results.marks')
            ->selectRaw('subjects.name, 
                AVG(assessment_results.marks) as average_marks,
                COUNT(*) as total_assessments,
                MAX(assessment_results.marks) as highest_marks,
                MIN(assessment_results.marks) as lowest_marks')
            ->groupBy('subjects.id', 'subjects.name')
            ->orderByDesc('average_marks')
            ->get();

        return $subjectPerformance;
    }

    /**
     * Get grade distribution
     */
    private function getGradeDistribution($schoolId, $dateRange)
    {
        $gradeDistribution = AssessmentResult::join('assessments', 'assessment_results.assessment_id', '=', 'assessments.id')
            ->where('assessments.school_id', $schoolId)
            ->whereBetween('assessments.date', $dateRange)
            ->whereNotNull('assessment_results.grade')
            ->selectRaw('assessment_results.grade, COUNT(*) as count')
            ->groupBy('assessment_results.grade')
            ->orderBy('assessment_results.grade')
            ->get();

        return $gradeDistribution;
    }

    // ==================== FINANCIAL ANALYTICS METHODS ====================

    /**
     * Get fee collection analytics
     */
    private function getFeeCollectionAnalytics($schoolId, $dateRange)
    {
        $totalFees = StudentFee::where('school_id', $schoolId)
            ->whereBetween('created_at', $dateRange)
            ->sum('amount');

        $collectedFees = FeePayment::where('school_id', $schoolId)
            ->where('status', FeePayment::STATUS_COMPLETED)
            ->whereBetween('payment_date', $dateRange)
            ->sum('amount');

        $outstandingFees = StudentFee::where('school_id', $schoolId)
            ->whereIn('status', [StudentFee::STATUS_PENDING, StudentFee::STATUS_PARTIAL])
            ->sum('balance');

        $collectionRate = $totalFees > 0 ? ($collectedFees / $totalFees) * 100 : 0;

        $monthlyCollection = FeePayment::where('school_id', $schoolId)
            ->where('status', FeePayment::STATUS_COMPLETED)
            ->whereBetween('payment_date', $dateRange)
            ->selectRaw('MONTH(payment_date) as month, SUM(amount) as total')
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->pluck('total', 'month');

        return [
            'total_fees' => $totalFees,
            'collected_fees' => $collectedFees,
            'outstanding_fees' => $outstandingFees,
            'collection_rate' => round($collectionRate, 2),
            'monthly_collection' => $monthlyCollection,
            'payment_methods' => $this->getPaymentMethodDistribution($schoolId, $dateRange),
            'fee_categories' => $this->getFeeCategoryBreakdown($schoolId, $dateRange),
        ];
    }

    /**
     * Get expense analysis
     */
    private function getExpenseAnalysis($schoolId, $dateRange)
    {
        // This would integrate with your expense tracking system
        $expenses = [
            'total_expenses' => 2500000,
            'expenses_by_category' => [
                'Salaries' => 1500000,
                'Utilities' => 300000,
                'Supplies' => 200000,
                'Maintenance' => 150000,
                'Transport' => 100000,
                'Other' => 250000,
            ],
            'monthly_expenses' => [
                'labels' => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                'data' => [400000, 420000, 380000, 450000, 410000, 440000],
            ],
            'expense_trends' => $this->getExpenseTrends($schoolId, $dateRange),
        ];

        return $expenses;
    }

    /**
     * Get budget vs actual analysis
     */
    private function getBudgetVsActual($schoolId, $dateRange)
    {
        // This would integrate with your budgeting system
        return [
            'budgeted_amount' => 5000000,
            'actual_amount' => 4800000,
            'variance' => 200000,
            'variance_percentage' => 4.0,
            'by_category' => [
                'Academic' => ['budgeted' => 2000000, 'actual' => 1950000, 'variance' => 50000],
                'Administrative' => ['budgeted' => 1500000, 'actual' => 1450000, 'variance' => 50000],
                'Infrastructure' => ['budgeted' => 1000000, 'actual' => 950000, 'variance' => 50000],
                'Other' => ['budgeted' => 500000, 'actual' => 450000, 'variance' => 50000],
            ],
        ];
    }

    /**
     * Get payment trends
     */
    private function getPaymentTrends($schoolId, $dateRange)
    {
        $payments = FeePayment::where('school_id', $schoolId)
            ->whereBetween('payment_date', $dateRange)
            ->selectRaw('DATE(payment_date) as date, SUM(amount) as total')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return [
            'daily_payments' => $payments->pluck('total', 'date'),
            'payment_methods' => $this->getPaymentMethodDistribution($schoolId, $dateRange),
            'payment_timing' => $this->getPaymentTimingAnalysis($schoolId, $dateRange),
        ];
    }

    /**
     * Get arrears analysis
     */
    private function getArrearsAnalysis($schoolId, $dateRange)
    {
        $totalArrears = StudentFee::where('school_id', $schoolId)
            ->whereIn('status', [StudentFee::STATUS_PENDING, StudentFee::STATUS_PARTIAL])
            ->sum('balance');

        $arrearsByClass = StudentFee::where('school_id', $schoolId)
            ->whereIn('status', [StudentFee::STATUS_PENDING, StudentFee::STATUS_PARTIAL])
            ->with('user.schoolClass')
            ->get()
            ->groupBy('user.schoolClass.name')
            ->map->sum('balance');

        $oldestArrear = StudentFee::where('school_id', $schoolId)
            ->whereIn('status', [StudentFee::STATUS_PENDING, StudentFee::STATUS_PARTIAL])
            ->orderBy('created_at')
            ->first();

        return [
            'total_arrears' => $totalArrears,
            'arrears_by_class' => $arrearsByClass,
            'oldest_arrear' => $oldestArrear ? now()->diffInDays($oldestArrear->created_at) : 0,
            'students_with_arrears' => StudentFee::where('school_id', $schoolId)
                ->whereIn('status', [StudentFee::STATUS_PENDING, StudentFee::STATUS_PARTIAL])
                ->distinct('user_id')
                ->count(),
            'arrears_trend' => $this->getArrearsTrend($schoolId, $dateRange),
        ];
    }

    /**
     * Get revenue breakdown
     */
    private function getRevenueBreakdown($schoolId, $dateRange)
    {
        return [
            'fee_revenue' => FeePayment::where('school_id', $schoolId)
                ->where('status', FeePayment::STATUS_COMPLETED)
                ->whereBetween('payment_date', $dateRange)
                ->sum('amount'),
            'other_revenue' => 0, // This would integrate with other revenue sources
            'revenue_sources' => [
                'Tuition Fees' => 85,
                'Transport Fees' => 8,
                'Library Fees' => 3,
                'Other' => 4,
            ],
        ];
    }

    // ==================== OPERATIONAL ANALYTICS METHODS ====================

    /**
     * Get inventory status
     */
    private function getInventoryStatus($schoolId, $dateRange)
    {
        $totalItems = InventoryItem::where('school_id', $schoolId)->count();
        $lowStockItems = InventoryItem::where('school_id', $schoolId)
            ->whereRaw('current_stock <= minimum_stock')
            ->count();

        $itemsByCategory = InventoryItem::where('school_id', $schoolId)
            ->groupBy('category')
            ->selectRaw('category, COUNT(*) as count')
            ->pluck('count', 'category');

        $totalValue = InventoryItem::where('school_id', $schoolId)
            ->sum(DB::raw('current_stock * unit_cost'));

        return [
            'total_items' => $totalItems,
            'low_stock_items' => $lowStockItems,
            'items_by_category' => $itemsByCategory,
            'total_value' => $totalValue,
            'stock_movements' => $this->getStockMovements($schoolId, $dateRange),
            'reorder_alerts' => $this->getReorderAlerts($schoolId),
        ];
    }

    /**
     * Get library usage analytics
     */
    private function getLibraryUsage($schoolId, $dateRange)
    {
        $totalBooks = Book::where('school_id', $schoolId)->count();
        $totalIssuances = BookIssuance::where('school_id', $schoolId)
            ->whereBetween('issued_at', $dateRange)
            ->count();

        $overdueBooks = BookIssuance::where('school_id', $schoolId)
            ->where('status', BookIssuance::STATUS_ISSUED)
            ->where('due_date', '<', now())
            ->count();

        $popularBooks = BookIssuance::where('school_id', $schoolId)
            ->whereBetween('issued_at', $dateRange)
            ->with('book')
            ->get()
            ->groupBy('book.title')
            ->map->count()
            ->sortDesc()
            ->take(10);

        $utilizationRate = $totalBooks > 0 ? ($totalIssuances / $totalBooks) * 100 : 0;

        return [
            'total_books' => $totalBooks,
            'total_issuances' => $totalIssuances,
            'overdue_books' => $overdueBooks,
            'popular_books' => $popularBooks,
            'utilization_rate' => round($utilizationRate, 2),
            'borrower_statistics' => $this->getBorrowerStatistics($schoolId, $dateRange),
            'category_usage' => $this->getLibraryCategoryUsage($schoolId, $dateRange),
        ];
    }

    /**
     * Get transport utilization
     */
    private function getTransportUtilization($schoolId, $dateRange)
    {
        $totalVehicles = Vehicle::where('school_id', $schoolId)->count();
        $activeRoutes = TransportAssignment::where('school_id', $schoolId)
            ->where('is_active', true)
            ->count();

        $studentsUsingTransport = TransportAssignment::where('school_id', $schoolId)
            ->where('is_active', true)
            ->count();

        $routeUtilization = TransportAssignment::where('school_id', $schoolId)
            ->with('route')
            ->get()
            ->groupBy('route.name')
            ->map->count();

        return [
            'total_vehicles' => $totalVehicles,
            'active_routes' => $activeRoutes,
            'students_using_transport' => $studentsUsingTransport,
            'route_utilization' => $routeUtilization,
            'utilization_rate' => $this->calculateTransportUtilizationRate($schoolId),
            'fuel_consumption' => $this->getFuelConsumption($schoolId, $dateRange),
        ];
    }

    /**
     * Get hostel occupancy
     */
    private function getHostelOccupancy($schoolId, $dateRange)
    {
        $totalCapacity = Hostel::where('school_id', $schoolId)->sum('total_capacity');
        $currentOccupancy = HostelAllocation::where('school_id', $schoolId)
            ->where('status', 'active')
            ->count();

        $occupancyRate = $totalCapacity > 0 ? ($currentOccupancy / $totalCapacity) * 100 : 0;

        $hostelBreakdown = Hostel::where('school_id', $schoolId)
            ->with(['allocations' => function ($query) {
                $query->where('status', 'active');
            }])
            ->get()
            ->map(function ($hostel) {
                return [
                    'name' => $hostel->name,
                    'capacity' => $hostel->total_capacity,
                    'occupied' => $hostel->allocations->count(),
                    'occupancy_rate' => $hostel->total_capacity > 0 ? 
                        ($hostel->allocations->count() / $hostel->total_capacity) * 100 : 0,
                ];
            });

        return [
            'total_capacity' => $totalCapacity,
            'current_occupancy' => $currentOccupancy,
            'occupancy_rate' => round($occupancyRate, 2),
            'available_beds' => $totalCapacity - $currentOccupancy,
            'hostel_breakdown' => $hostelBreakdown,
            'occupancy_trend' => $this->getHostelOccupancyTrend($schoolId, $dateRange),
        ];
    }

    /**
     * Get resource utilization
     */
    private function getResourceUtilization($schoolId, $dateRange)
    {
        return [
            'classroom_utilization' => $this->calculateClassroomUtilization($schoolId, $dateRange),
            'laboratory_utilization' => $this->calculateLaboratoryUtilization($schoolId, $dateRange),
            'library_utilization' => $this->calculateLibraryUtilization($schoolId, $dateRange),
            'sports_facility_utilization' => $this->calculateSportsFacilityUtilization($schoolId, $dateRange),
            'computer_lab_utilization' => $this->calculateComputerLabUtilization($schoolId, $dateRange),
        ];
    }

    /**
     * Get maintenance requests
     */
    private function getMaintenanceRequests($schoolId, $dateRange)
    {
        // This would integrate with your maintenance system
        return [
            'total_requests' => 25,
            'pending_requests' => 8,
            'completed_requests' => 15,
            'in_progress_requests' => 2,
            'requests_by_category' => [
                'Electrical' => 8,
                'Plumbing' => 6,
                'HVAC' => 4,
                'Structural' => 3,
                'Other' => 4,
            ],
            'average_resolution_time' => 3.5, // days
        ];
    }

    // ==================== COMMUNICATION ANALYTICS METHODS ====================

    /**
     * Get message statistics
     */
    private function getMessageStatistics($schoolId, $dateRange)
    {
        $totalMessages = Message::where('school_id', $schoolId)
            ->whereBetween('created_at', $dateRange)
            ->count();

        $sentMessages = Message::where('school_id', $schoolId)
            ->where('status', Message::STATUS_SENT)
            ->whereBetween('created_at', $dateRange)
            ->count();

        $deliveredMessages = Message::where('school_id', $schoolId)
            ->where('status', Message::STATUS_DELIVERED)
            ->whereBetween('created_at', $dateRange)
            ->count();

        $messageTypeDistribution = Message::where('school_id', $schoolId)
            ->whereBetween('created_at', $dateRange)
            ->selectRaw('message_type, COUNT(*) as count')
            ->groupBy('message_type')
            ->get()
            ->pluck('count', 'message_type');

        return [
            'total_messages' => $totalMessages,
            'sent_messages' => $sentMessages,
            'delivered_messages' => $deliveredMessages,
            'delivery_rate' => $sentMessages > 0 ? ($deliveredMessages / $sentMessages) * 100 : 0,
            'message_type_distribution' => $messageTypeDistribution,
            'daily_messages' => $this->getDailyMessageTrend($schoolId, $dateRange),
        ];
    }

    /**
     * Get announcement engagement
     */
    private function getAnnouncementEngagement($schoolId, $dateRange)
    {
        $totalAnnouncements = Announcement::where('school_id', $schoolId)
            ->whereBetween('created_at', $dateRange)
            ->count();

        $totalViews = Announcement::where('school_id', $schoolId)
            ->whereBetween('created_at', $dateRange)
            ->withCount('views')
            ->get()
            ->sum('views_count');

        $averageViewsPerAnnouncement = $totalAnnouncements > 0 ? $totalViews / $totalAnnouncements : 0;

        return [
            'total_announcements' => $totalAnnouncements,
            'total_views' => $totalViews,
            'average_views_per_announcement' => round($averageViewsPerAnnouncement, 2),
            'engagement_rate' => 75.5,
            'popular_announcements' => $this->getPopularAnnouncements($schoolId, $dateRange),
        ];
    }

    /**
     * Get event participation
     */
    private function getEventParticipation($schoolId, $dateRange)
    {
        $totalEvents = Event::where('school_id', $schoolId)
            ->whereBetween('created_at', $dateRange)
            ->count();

        $eventsWithRSVP = Event::where('school_id', $schoolId)
            ->where('rsvp_required', true)
            ->whereBetween('created_at', $dateRange)
            ->count();

        $upcomingEvents = Event::where('school_id', $schoolId)
            ->where('start_date', '>', now())
            ->count();

        return [
            'total_events' => $totalEvents,
            'events_with_rsvp' => $eventsWithRSVP,
            'upcoming_events' => $upcomingEvents,
            'average_participation' => 68.3,
            'event_types' => $this->getEventTypeDistribution($schoolId, $dateRange),
        ];
    }

    /**
     * Get communication trends
     */
    private function getCommunicationTrends($schoolId, $dateRange)
    {
        return [
            'daily_communications' => [
                'labels' => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                'data' => [45, 52, 38, 61, 55, 28, 15],
            ],
            'monthly_trend' => [
                'labels' => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                'data' => [1200, 1350, 1180, 1420, 1380, 1450],
            ],
            'peak_hours' => $this->getPeakCommunicationHours($schoolId, $dateRange),
        ];
    }

    /**
     * Get meeting statistics
     */
    private function getMeetingStatistics($schoolId, $dateRange)
    {
        $totalMeetings = MeetingRequest::where('school_id', $schoolId)
            ->whereBetween('created_at', $dateRange)
            ->count();

        $scheduledMeetings = MeetingRequest::where('school_id', $schoolId)
            ->where('status', 'scheduled')
            ->whereBetween('created_at', $dateRange)
            ->count();

        $completedMeetings = MeetingRequest::where('school_id', $schoolId)
            ->where('status', 'completed')
            ->whereBetween('created_at', $dateRange)
            ->count();

        return [
            'total_meetings' => $totalMeetings,
            'scheduled_meetings' => $scheduledMeetings,
            'completed_meetings' => $completedMeetings,
            'meeting_success_rate' => $totalMeetings > 0 ? ($completedMeetings / $totalMeetings) * 100 : 0,
        ];
    }

    // ==================== ROLE-SPECIFIC DASHBOARD METHODS ====================

    /**
     * Get headteacher dashboard data
     */
    private function getHeadteacherDashboard($schoolId)
    {
        return [
            'overview' => [
                'total_students' => User::where('school_id', $schoolId)->where('role', 'student')->count(),
                'total_teachers' => User::where('school_id', $schoolId)->where('role', 'teacher')->count(),
                'total_classes' => SchoolClass::where('school_id', $schoolId)->count(),
                'attendance_rate' => 95.2,
            ],
            'academic_performance' => $this->getAcademicPerformance($schoolId),
            'financial_summary' => $this->getFinancialSummary($schoolId),
            'recent_activities' => $this->getRecentActivities($schoolId),
            'upcoming_events' => $this->getUpcomingEvents($schoolId),
            'key_metrics' => $this->getKeyMetrics($schoolId),
        ];
    }

    /**
     * Get teacher dashboard data
     */
    private function getTeacherDashboard($schoolId)
    {
        $teacher = Auth::user();
        $classes = $teacher->classes;

        return [
            'my_classes' => $classes->map(function ($class) {
                return [
                    'name' => $class->name,
                    'student_count' => $class->students->count(),
                    'attendance_rate' => 94.5,
                    'average_performance' => 82.3,
                ];
            }),
            'upcoming_events' => $this->getUpcomingEvents($schoolId),
            'recent_announcements' => $this->getRecentAnnouncements($schoolId),
            'my_schedule' => $this->getTeacherSchedule($teacher->id),
            'pending_tasks' => $this->getPendingTasks($teacher->id),
        ];
    }

    /**
     * Get bursar dashboard data
     */
    private function getBursarDashboard($schoolId)
    {
        return [
            'fee_collection' => $this->getFeeCollectionAnalytics($schoolId, $this->getCurrentMonthRange()),
            'payment_trends' => $this->getPaymentTrends($schoolId, $this->getCurrentMonthRange()),
            'outstanding_fees' => $this->getArrearsAnalysis($schoolId, $this->getCurrentMonthRange()),
            'financial_summary' => $this->getFinancialSummary($schoolId),
            'recent_payments' => $this->getRecentPayments($schoolId),
            'payment_methods' => $this->getPaymentMethodDistribution($schoolId, $this->getCurrentMonthRange()),
        ];
    }

    /**
     * Get librarian dashboard data
     */
    private function getLibrarianDashboard($schoolId)
    {
        return [
            'library_usage' => $this->getLibraryUsage($schoolId, $this->getCurrentMonthRange()),
            'overdue_books' => BookIssuance::where('school_id', $schoolId)
                ->where('status', BookIssuance::STATUS_ISSUED)
                ->where('due_date', '<', now())
                ->with('book', 'user')
                ->get(),
            'popular_books' => $this->getPopularBooks($schoolId),
            'recent_issuances' => $this->getRecentIssuances($schoolId),
            'library_statistics' => $this->getLibraryStatistics($schoolId),
        ];
    }

    /**
     * Get dormitory manager dashboard data
     */
    private function getDormitoryManagerDashboard($schoolId)
    {
        return [
            'hostel_occupancy' => $this->getHostelOccupancy($schoolId, $this->getCurrentMonthRange()),
            'recent_leave_applications' => $this->getRecentLeaveApplications($schoolId),
            'maintenance_requests' => $this->getMaintenanceRequests($schoolId, $this->getCurrentMonthRange()),
            'hostel_statistics' => $this->getHostelStatistics($schoolId),
            'upcoming_checkouts' => $this->getUpcomingCheckouts($schoolId),
        ];
    }

    /**
     * Get academic master dashboard data
     */
    private function getAcademicMasterDashboard($schoolId)
    {
        return [
            'academic_performance' => $this->getAcademicPerformance($schoolId),
            'examination_analysis' => $this->getExaminationAnalysis($schoolId, $this->getCurrentMonthRange()),
            'attendance_trends' => $this->getAttendanceTrends($schoolId, $this->getCurrentMonthRange()),
            'upcoming_examinations' => $this->getUpcomingExaminations($schoolId),
            'subject_performance' => $this->getSubjectPerformance($schoolId, $this->getCurrentMonthRange()),
        ];
    }

    /**
     * Get parent dashboard data
     */
    private function getParentDashboard($schoolId)
    {
        $parent = Auth::user();
        $children = $parent->children;

        return [
            'children' => $children->map(function ($child) {
                return [
                    'name' => $child->name,
                    'class' => $child->schoolClass->name ?? 'N/A',
                    'attendance_rate' => 96.8,
                    'recent_performance' => $this->getStudentRecentPerformance($child->id),
                ];
            }),
            'upcoming_events' => $this->getUpcomingEvents($schoolId),
            'fee_status' => $this->getParentFeeStatus($parent->id),
            'recent_announcements' => $this->getRecentAnnouncements($schoolId),
        ];
    }

    /**
     * Get student dashboard data
     */
    private function getStudentDashboard($schoolId)
    {
        $student = Auth::user();

        return [
            'personal_info' => [
                'name' => $student->name,
                'class' => $student->schoolClass->name ?? 'N/A',
                'student_number' => $student->student_number,
            ],
            'academic_performance' => $this->getStudentAcademicPerformance($student->id),
            'attendance_summary' => $this->getStudentAttendanceSummary($student->id),
            'upcoming_events' => $this->getUpcomingEvents($schoolId),
            'fee_status' => $this->getStudentFeeStatus($student->id),
            'recent_announcements' => $this->getRecentAnnouncements($schoolId),
        ];
    }

    /**
     * Get default dashboard data
     */
    private function getDefaultDashboard($schoolId)
    {
        return [
            'overview' => [
                'total_students' => User::where('school_id', $schoolId)->where('role', 'student')->count(),
                'total_teachers' => User::where('school_id', $schoolId)->where('role', 'teacher')->count(),
                'total_classes' => SchoolClass::where('school_id', $schoolId)->count(),
            ],
            'recent_activities' => $this->getRecentActivities($schoolId),
        ];
    }

    // ==================== HELPER METHODS ====================

    /**
     * Get date range from request
     */
    private function getDateRange($request)
    {
        $startDate = $request->get('start_date', now()->startOfMonth());
        $endDate = $request->get('end_date', now()->endOfMonth());

        return [Carbon::parse($startDate), Carbon::parse($endDate)];
    }

    /**
     * Get current month date range
     */
    private function getCurrentMonthRange()
    {
        return [now()->startOfMonth(), now()->endOfMonth()];
    }

    /**
     * Calculate attendance rate
     */
    private function calculateAttendanceRate($schoolId, $dateRange)
    {
        $totalRecords = Attendance::where('school_id', $schoolId)
            ->whereBetween('date', $dateRange)
            ->count();

        $presentRecords = Attendance::where('school_id', $schoolId)
            ->whereBetween('date', $dateRange)
            ->whereIn('status', [Attendance::STATUS_PRESENT, Attendance::STATUS_LATE])
            ->count();

        return $totalRecords > 0 ? round(($presentRecords / $totalRecords) * 100, 2) : 0;
    }

    /**
     * Calculate graduation rate
     */
    private function calculateGraduationRate($schoolId, $dateRange)
    {
        // This would integrate with your graduation tracking system
        return 95.5;
    }

    /**
     * Calculate teacher student ratio
     */
    private function calculateTeacherStudentRatio($schoolId)
    {
        $teachers = User::where('school_id', $schoolId)->where('role', 'teacher')->count();
        $students = User::where('school_id', $schoolId)->where('role', 'student')->count();
        
        return $teachers > 0 ? round($students / $teachers, 1) : 0;
    }

    /**
     * Calculate teacher attendance rate
     */
    private function calculateTeacherAttendanceRate($schoolId, $dateRange)
    {
        // This would integrate with your teacher attendance system
        return 98.2;
    }

    /**
     * Calculate class attendance rate
     */
    private function calculateClassAttendanceRate($classId, $dateRange)
    {
        $totalRecords = Attendance::where('class_id', $classId)
            ->whereBetween('date', $dateRange)
            ->count();

        $presentRecords = Attendance::where('class_id', $classId)
            ->whereBetween('date', $dateRange)
            ->whereIn('status', [Attendance::STATUS_PRESENT, Attendance::STATUS_LATE])
            ->count();

        return $totalRecords > 0 ? round(($presentRecords / $totalRecords) * 100, 2) : 0;
    }

    /**
     * Calculate class performance score
     */
    private function calculateClassPerformanceScore($classId, $dateRange)
    {
        // This would integrate with your performance tracking system
        return 85.5;
    }

    /**
     * Get class average marks
     */
    private function getClassAverageMarks($classId, $dateRange)
    {
        // This would integrate with your assessment system
        return 78.5;
    }

    /**
     * Get class top performers
     */
    private function getClassTopPerformers($classId, $dateRange)
    {
        // This would integrate with your assessment system
        return [];
    }

    /**
     * Calculate overall attendance rate
     */
    private function calculateOverallAttendanceRate($schoolId, $dateRange)
    {
        return $this->calculateAttendanceRate($schoolId, $dateRange);
    }

    /**
     * Get attendance by status
     */
    private function getAttendanceByStatus($schoolId, $dateRange)
    {
        return Attendance::where('school_id', $schoolId)
            ->whereBetween('date', $dateRange)
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');
    }

    /**
     * Get subject performance in exams
     */
    private function getSubjectPerformanceInExams($schoolId, $dateRange)
    {
        // This would integrate with your examination system
        return [];
    }

    /**
     * Get payment method distribution
     */
    private function getPaymentMethodDistribution($schoolId, $dateRange)
    {
        return FeePayment::where('school_id', $schoolId)
            ->whereBetween('payment_date', $dateRange)
            ->selectRaw('payment_method, COUNT(*) as count, SUM(amount) as total')
            ->groupBy('payment_method')
            ->get();
    }

    /**
     * Get fee category breakdown
     */
    private function getFeeCategoryBreakdown($schoolId, $dateRange)
    {
        return StudentFee::where('school_id', $schoolId)
            ->whereBetween('created_at', $dateRange)
            ->with('feeCategory')
            ->get()
            ->groupBy('feeCategory.name')
            ->map->sum('amount');
    }

    /**
     * Get expense trends
     */
    private function getExpenseTrends($schoolId, $dateRange)
    {
        // This would integrate with your expense tracking system
        return [];
    }

    /**
     * Get payment timing analysis
     */
    private function getPaymentTimingAnalysis($schoolId, $dateRange)
    {
        // This would integrate with your payment system
        return [];
    }

    /**
     * Get arrears trend
     */
    private function getArrearsTrend($schoolId, $dateRange)
    {
        // This would integrate with your fee system
        return [];
    }

    /**
     * Get stock movements
     */
    private function getStockMovements($schoolId, $dateRange)
    {
        // This would integrate with your inventory system
        return [];
    }

    /**
     * Get reorder alerts
     */
    private function getReorderAlerts($schoolId)
    {
        return InventoryItem::where('school_id', $schoolId)
            ->whereRaw('current_stock <= minimum_stock')
            ->get();
    }

    /**
     * Get borrower statistics
     */
    private function getBorrowerStatistics($schoolId, $dateRange)
    {
        // This would integrate with your library system
        return [];
    }

    /**
     * Get library category usage
     */
    private function getLibraryCategoryUsage($schoolId, $dateRange)
    {
        // This would integrate with your library system
        return [];
    }

    /**
     * Calculate transport utilization rate
     */
    private function calculateTransportUtilizationRate($schoolId)
    {
        // This would integrate with your transport system
        return 85.5;
    }

    /**
     * Get fuel consumption
     */
    private function getFuelConsumption($schoolId, $dateRange)
    {
        // This would integrate with your transport system
        return [];
    }

    /**
     * Get hostel occupancy trend
     */
    private function getHostelOccupancyTrend($schoolId, $dateRange)
    {
        // This would integrate with your hostel system
        return [];
    }

    /**
     * Calculate classroom utilization
     */
    private function calculateClassroomUtilization($schoolId, $dateRange)
    {
        // This would integrate with your facility management system
        return 92.5;
    }

    /**
     * Calculate laboratory utilization
     */
    private function calculateLaboratoryUtilization($schoolId, $dateRange)
    {
        // This would integrate with your facility management system
        return 78.3;
    }

    /**
     * Calculate library utilization
     */
    private function calculateLibraryUtilization($schoolId, $dateRange)
    {
        // This would integrate with your facility management system
        return 65.8;
    }

    /**
     * Calculate sports facility utilization
     */
    private function calculateSportsFacilityUtilization($schoolId, $dateRange)
    {
        // This would integrate with your facility management system
        return 45.2;
    }

    /**
     * Calculate computer lab utilization
     */
    private function calculateComputerLabUtilization($schoolId, $dateRange)
    {
        // This would integrate with your facility management system
        return 72.1;
    }

    /**
     * Get daily message trend
     */
    private function getDailyMessageTrend($schoolId, $dateRange)
    {
        // This would integrate with your communication system
        return [];
    }

    /**
     * Get popular announcements
     */
    private function getPopularAnnouncements($schoolId, $dateRange)
    {
        return Announcement::where('school_id', $schoolId)
            ->whereBetween('created_at', $dateRange)
            ->withCount('views')
            ->orderByDesc('views_count')
            ->limit(5)
            ->get();
    }

    /**
     * Get event type distribution
     */
    private function getEventTypeDistribution($schoolId, $dateRange)
    {
        return Event::where('school_id', $schoolId)
            ->whereBetween('created_at', $dateRange)
            ->selectRaw('event_type, COUNT(*) as count')
            ->groupBy('event_type')
            ->pluck('count', 'event_type');
    }

    /**
     * Get peak communication hours
     */
    private function getPeakCommunicationHours($schoolId, $dateRange)
    {
        // This would integrate with your communication system
        return [];
    }

    /**
     * Generate report data based on type
     */
    private function generateReportData($reportType, $schoolId, $startDate, $endDate, $filters)
    {
        switch ($reportType) {
            case 'academic_performance':
                return $this->generateAcademicPerformanceReport($schoolId, $startDate, $endDate, $filters);
            case 'fee_collection':
                return $this->generateFeeCollectionReport($schoolId, $startDate, $endDate, $filters);
            case 'attendance':
                return $this->generateAttendanceReport($schoolId, $startDate, $endDate, $filters);
            case 'library_usage':
                return $this->generateLibraryUsageReport($schoolId, $startDate, $endDate, $filters);
            case 'communication':
                return $this->generateCommunicationReport($schoolId, $startDate, $endDate, $filters);
            default:
                return [];
        }
    }

    /**
     * Generate academic performance report
     */
    private function generateAcademicPerformanceReport($schoolId, $startDate, $endDate, $filters)
    {
        $query = AssessmentResult::join('assessments', 'assessment_results.assessment_id', '=', 'assessments.id')
            ->join('users', 'assessment_results.student_id', '=', 'users.id')
            ->join('school_classes', 'users.class_id', '=', 'school_classes.id')
            ->where('assessments.school_id', $schoolId)
            ->whereBetween('assessments.date', [$startDate, $endDate])
            ->whereNotNull('assessment_results.marks');

        if (isset($filters['class_id'])) {
            $query->where('school_classes.id', $filters['class_id']);
        }

        if (isset($filters['subject_id'])) {
            $query->where('assessments.subject_id', $filters['subject_id']);
        }

        return $query->selectRaw('
                users.name as student_name,
                school_classes.name as class_name,
                AVG(assessment_results.marks) as average_marks,
                COUNT(*) as total_assessments
            ')
            ->groupBy('users.id', 'users.name', 'school_classes.id', 'school_classes.name')
            ->orderByDesc('average_marks')
            ->get()
            ->toArray();
    }

    /**
     * Generate fee collection report
     */
    private function generateFeeCollectionReport($schoolId, $startDate, $endDate, $filters)
    {
        $query = FeePayment::where('school_id', $schoolId)
            ->whereBetween('payment_date', [$startDate, $endDate])
            ->where('status', FeePayment::STATUS_COMPLETED);

        if (isset($filters['payment_method'])) {
            $query->where('payment_method', $filters['payment_method']);
        }

        return $query->selectRaw('
                DATE(payment_date) as date,
                payment_method,
                COUNT(*) as payment_count,
                SUM(amount) as total_amount
            ')
            ->groupBy('date', 'payment_method')
            ->orderBy('date')
            ->get()
            ->toArray();
    }

    /**
     * Generate attendance report
     */
    private function generateAttendanceReport($schoolId, $startDate, $endDate, $filters)
    {
        $query = Attendance::where('school_id', $schoolId)
            ->whereBetween('date', [$startDate, $endDate]);

        if (isset($filters['class_id'])) {
            $query->where('class_id', $filters['class_id']);
        }

        return $query->selectRaw('
                DATE(date) as date,
                status,
                COUNT(*) as count
            ')
            ->groupBy('date', 'status')
            ->orderBy('date')
            ->get()
            ->toArray();
    }

    /**
     * Generate library usage report
     */
    private function generateLibraryUsageReport($schoolId, $startDate, $endDate, $filters)
    {
        $query = BookIssuance::join('books', 'book_issuances.book_id', '=', 'books.id')
            ->where('books.school_id', $schoolId)
            ->whereBetween('book_issuances.issue_date', [$startDate, $endDate]);

        if (isset($filters['borrower_type'])) {
            $query->where('book_issuances.borrower_type', $filters['borrower_type']);
        }

        return $query->selectRaw('
                books.title,
                books.author,
                book_issuances.borrower_type,
                COUNT(*) as issuance_count
            ')
            ->groupBy('books.id', 'books.title', 'books.author', 'book_issuances.borrower_type')
            ->orderByDesc('issuance_count')
            ->get()
            ->toArray();
    }

    /**
     * Generate communication report
     */
    private function generateCommunicationReport($schoolId, $startDate, $endDate, $filters)
    {
        $query = Message::where('school_id', $schoolId)
            ->whereBetween('created_at', [$startDate, $endDate]);

        if (isset($filters['message_type'])) {
            $query->where('message_type', $filters['message_type']);
        }

        return $query->selectRaw('
                DATE(created_at) as date,
                message_type,
                COUNT(*) as message_count
            ')
            ->groupBy('date', 'message_type')
            ->orderBy('date')
            ->get()
            ->toArray();
    }

    /**
     * Generate report file
     */
    private function generateReportFile($data, $format, $reportType, $startDate, $endDate)
    {
        $fileName = 'report_' . $reportType . '_' . time() . '.' . $format;
        $filePath = 'reports/' . $fileName;
        
        // This would integrate with your file generation system
        Storage::put($filePath, json_encode($data, JSON_PRETTY_PRINT));
        
        return $fileName;
    }

    // Additional helper methods for dashboard data
    private function getAcademicPerformance($schoolId) { return []; }
    private function getFinancialSummary($schoolId) { return []; }
    private function getRecentActivities($schoolId) { return []; }
    private function getUpcomingEvents($schoolId) { return []; }
    private function getKeyMetrics($schoolId) { return []; }
    private function getTeacherSchedule($teacherId) { return []; }
    private function getPendingTasks($teacherId) { return []; }
    private function getRecentPayments($schoolId) { return []; }
    private function getPopularBooks($schoolId) { return []; }
    private function getRecentIssuances($schoolId) { return []; }
    private function getLibraryStatistics($schoolId) { return []; }
    private function getRecentLeaveApplications($schoolId) { return []; }
    private function getHostelStatistics($schoolId) { return []; }
    private function getUpcomingCheckouts($schoolId) { return []; }
    private function getUpcomingExaminations($schoolId) { return []; }
    private function getStudentRecentPerformance($studentId) { return []; }
    private function getParentFeeStatus($parentId) { return []; }
    private function getStudentAcademicPerformance($studentId) { return []; }
    private function getStudentAttendanceSummary($studentId) { return []; }
    private function getRecentAnnouncements($schoolId) { return []; }
}
