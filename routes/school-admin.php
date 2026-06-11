<?php

use App\Http\Controllers\SchoolAdmin\SchoolController;
use App\Http\Controllers\SchoolAdmin\AcademicController;
use App\Http\Controllers\Academic\TimetableController;
use App\Http\Controllers\Academic\AssessmentController;
use App\Http\Controllers\Academic\CurriculumController;
use App\Http\Controllers\System\ConfigurationController;
use App\Http\Controllers\System\RoleController;
use App\Http\Controllers\System\PermissionController;
use App\Http\Controllers\System\SchoolConfigurationController;
use App\Http\Controllers\System\AuditLogController;
use App\Http\Controllers\System\DataBackupController;
use App\Http\Controllers\System\HolidayController;
use App\Http\Controllers\HR\StaffController;
use App\Http\Controllers\HR\PayrollController;
use App\Http\Controllers\HR\LeaveController;
use App\Http\Controllers\HR\PerformanceController;
use App\Http\Controllers\HR\AttendanceController;
use App\Http\Controllers\Finance\FeeStructureController;
use App\Http\Controllers\Finance\InvoiceController;
use App\Http\Controllers\Finance\PaymentController;
use App\Http\Controllers\Finance\PaymentPlanController;
use App\Http\Controllers\Finance\BudgetController;
use App\Http\Controllers\Finance\FinancialReportsController;
use App\Http\Controllers\Finance\FeesCollectionController;
use App\Http\Controllers\Library\BookController;
use App\Http\Controllers\Library\CirculationController;
use App\Http\Controllers\Library\FineController;
use App\Http\Controllers\Library\ReportController;

// Inventory Controllers
use App\Http\Controllers\Inventory\InventoryController;
use App\Http\Controllers\Inventory\PurchaseOrderController;
use App\Http\Controllers\Inventory\GoodsReceivedController;
use App\Http\Controllers\Inventory\IssueNoteController;
use App\Http\Controllers\Inventory\InventoryReportsController;
use App\Http\Controllers\Inventory\AssetMaintenanceController;

// Hostel Controllers
use App\Http\Controllers\Hostel\HostelController;
use App\Http\Controllers\Hostel\HostelAllocationController;
use App\Http\Controllers\Hostel\HostelLeaveController;
use App\Http\Controllers\Hostel\HostelInventoryController;
use App\Http\Controllers\Hostel\HostelMaintenanceController;
use App\Http\Controllers\Hostel\HostelReportsController;
use App\Http\Controllers\Hostel\HostelWardenController;

// Transport Controllers
use App\Http\Controllers\Transport\TransportController;

// Communication Controllers
use App\Http\Controllers\Communication\AnnouncementController;
use App\Http\Controllers\Communication\MessageController;
use App\Http\Controllers\Communication\MessageTemplateController;
use App\Http\Controllers\Communication\NoticeBoardController;
use App\Http\Controllers\Communication\SuggestionController;
use App\Http\Controllers\Communication\EventController;
use App\Http\Controllers\Communication\MeetingRequestController;
use App\Http\Controllers\Communication\NotificationPreferenceController;

// ID Card Controller
use App\Http\Controllers\IDCardController;

// Sitting Plan & Room Controllers
use App\Http\Controllers\SchoolAdmin\RoomController;
use App\Http\Controllers\SchoolAdmin\SittingPlanController;

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth', 'role:school_admin,headteacher,bursar', \App\Http\Middleware\HandleMultiTenancy::class])->prefix('school-admin')->name('school-admin.')->group(function () {
    
    // Dashboard
    Route::get('/dashboard', [SchoolController::class, 'dashboard'])->name('dashboard');
    
    // Students Management
    Route::get('/students', [SchoolController::class, 'students'])->name('students');
    Route::get('/students/create', [SchoolController::class, 'createStudent'])->name('students.create');
    Route::post('/students', [SchoolController::class, 'storeStudent'])->name('students.store');
    
    // Teachers Management
    Route::get('/teachers', [SchoolController::class, 'teachers'])->name('teachers');
    Route::get('/teachers/create', [SchoolController::class, 'createTeacher'])->name('teachers.create');
    Route::post('/teachers', [SchoolController::class, 'storeTeacher'])->name('teachers.store');
    Route::get('/teachers/{teacher}', [SchoolController::class, 'showTeacher'])->name('teachers.show');
    Route::patch('/teachers/{teacher}', [SchoolController::class, 'updateTeacher'])->name('teachers.update');
    Route::delete('/teachers/{teacher}', [SchoolController::class, 'destroyTeacher'])->name('teachers.destroy');
    
    // Classes Management - Moved to Academic routes
    
    // Subjects Management - Moved to Academic routes
    
    // Fee Categories Management
    Route::get('/fee-categories', [SchoolController::class, 'feeCategories'])->name('fee-categories');
    Route::get('/fee-categories/create', [SchoolController::class, 'createFeeCategory'])->name('fee-categories.create');
    Route::post('/fee-categories', [SchoolController::class, 'storeFeeCategory'])->name('fee-categories.store');
    
    // School Settings
    Route::get('/settings', [SchoolController::class, 'settings'])->name('settings');
    Route::patch('/settings', [SchoolController::class, 'updateSettings'])->name('settings.update');
    
});

// HR Management Routes
Route::middleware(['auth', 'role:school_admin,headteacher', \App\Http\Middleware\HandleMultiTenancy::class])->prefix('hr')->name('hr.')->group(function () {
    
    // HR Dashboard
    Route::get('/dashboard', function () {
        return Inertia::render('HR/Dashboard');
    })->name('dashboard');
    
    // Staff Management
    Route::get('/staff', [StaffController::class, 'index'])->name('staff.index');
    Route::get('/staff/create', [StaffController::class, 'create'])->name('staff.create');
    Route::post('/staff', [StaffController::class, 'store'])->name('staff.store');
    Route::get('/staff/{staff}', [StaffController::class, 'show'])->name('staff.show');
    Route::get('/staff/{staff}/edit', [StaffController::class, 'edit'])->name('staff.edit');
    Route::put('/staff/{staff}', [StaffController::class, 'update'])->name('staff.update');
    Route::delete('/staff/{staff}', [StaffController::class, 'destroy'])->name('staff.destroy');
    
    // Payroll Management
    Route::get('/payroll', [PayrollController::class, 'index'])->name('payroll.index');
    Route::get('/payroll/create', [PayrollController::class, 'create'])->name('payroll.create');
    Route::post('/payroll', [PayrollController::class, 'store'])->name('payroll.store');
    Route::get('/payroll/{payroll}', [PayrollController::class, 'show'])->name('payroll.show');
    Route::get('/payroll/{payroll}/edit', [PayrollController::class, 'edit'])->name('payroll.edit');
    Route::put('/payroll/{payroll}', [PayrollController::class, 'update'])->name('payroll.update');
    Route::delete('/payroll/{payroll}', [PayrollController::class, 'destroy'])->name('payroll.destroy');
    Route::post('/payroll/{payroll}/approve', [PayrollController::class, 'approve'])->name('payroll.approve');
    Route::post('/payroll/{payroll}/pay', [PayrollController::class, 'markAsPaid'])->name('payroll.pay');
    Route::get('/payroll/payslip/{payslip}/download', [PayrollController::class, 'downloadPayslip'])->name('payroll.payslip.download');
    
    // Leave Management
    Route::get('/leave', [LeaveController::class, 'index'])->name('leave.index');
    Route::get('/leave/create', [LeaveController::class, 'create'])->name('leave.create');
    Route::post('/leave', [LeaveController::class, 'store'])->name('leave.store');
    Route::get('/leave/{leaveApplication}', [LeaveController::class, 'show'])->name('leave.show');
    Route::get('/leave/{leaveApplication}/edit', [LeaveController::class, 'edit'])->name('leave.edit');
    Route::put('/leave/{leaveApplication}', [LeaveController::class, 'update'])->name('leave.update');
    Route::delete('/leave/{leaveApplication}', [LeaveController::class, 'destroy'])->name('leave.destroy');
    Route::post('/leave/{leaveApplication}/approve', [LeaveController::class, 'approve'])->name('leave.approve');
    Route::post('/leave/{leaveApplication}/reject', [LeaveController::class, 'reject'])->name('leave.reject');
    Route::post('/leave/{leaveApplication}/cancel', [LeaveController::class, 'cancel'])->name('leave.cancel');
    
    // Performance Management
    Route::get('/performance', [PerformanceController::class, 'index'])->name('performance.index');
    Route::get('/performance/create', [PerformanceController::class, 'create'])->name('performance.create');
    Route::post('/performance', [PerformanceController::class, 'store'])->name('performance.store');
    Route::get('/performance/{performanceAppraisal}', [PerformanceController::class, 'show'])->name('performance.show');
    Route::get('/performance/{performanceAppraisal}/edit', [PerformanceController::class, 'edit'])->name('performance.edit');
    Route::put('/performance/{performanceAppraisal}', [PerformanceController::class, 'update'])->name('performance.update');
    Route::delete('/performance/{performanceAppraisal}', [PerformanceController::class, 'destroy'])->name('performance.destroy');
    
    // Attendance Management
    Route::get('/attendance', [AttendanceController::class, 'index'])->name('attendance.index');
    Route::get('/attendance/mark', [AttendanceController::class, 'mark'])->name('attendance.mark');
    Route::post('/attendance', [AttendanceController::class, 'markIndividual'])->name('attendance.store');
    
});

// Finance Management Routes
Route::middleware(['auth', 'role:school_admin,headteacher,bursar', \App\Http\Middleware\HandleMultiTenancy::class])->prefix('finance')->name('finance.')->group(function () {
    
    // Finance Dashboard
    Route::get('/dashboard', [FinancialReportsController::class, 'dashboard'])->name('dashboard');

    // Fees Collection — Fees Group
    Route::get('/fees-collection/fees-group', [FeesCollectionController::class, 'feesGroup'])->name('fees-collection.fees-group');
    Route::post('/fees-collection/fees-group', [FeesCollectionController::class, 'storeFeesGroup'])->name('fees-collection.fees-group.store');
    Route::put('/fees-collection/fees-group/{id}', [FeesCollectionController::class, 'updateFeesGroup'])->name('fees-collection.fees-group.update');
    Route::delete('/fees-collection/fees-group/{id}', [FeesCollectionController::class, 'destroyFeesGroup'])->name('fees-collection.fees-group.destroy');

    // Fees Collection — Fees Type
    Route::get('/fees-collection/fees-type', [FeesCollectionController::class, 'feesType'])->name('fees-collection.fees-type');
    Route::post('/fees-collection/fees-type', [FeesCollectionController::class, 'storeFeesType'])->name('fees-collection.fees-type.store');
    Route::put('/fees-collection/fees-type/{id}', [FeesCollectionController::class, 'updateFeesType'])->name('fees-collection.fees-type.update');
    Route::delete('/fees-collection/fees-type/{id}', [FeesCollectionController::class, 'destroyFeesType'])->name('fees-collection.fees-type.destroy');

    // Fees Collection — Fees Master
    Route::get('/fees-collection/fees-master', [FeesCollectionController::class, 'feesMaster'])->name('fees-collection.fees-master');
    Route::post('/fees-collection/fees-master', [FeesCollectionController::class, 'storeFeesMaster'])->name('fees-collection.fees-master.store');
    Route::put('/fees-collection/fees-master/{id}', [FeesCollectionController::class, 'updateFeesMaster'])->name('fees-collection.fees-master.update');
    Route::delete('/fees-collection/fees-master/{id}', [FeesCollectionController::class, 'destroyFeesMaster'])->name('fees-collection.fees-master.destroy');
    
    // Fee Categories
    Route::get('/fee-categories', [FeeStructureController::class, 'index'])->name('fee-categories.index');
    Route::get('/fee-categories/create', [FeeStructureController::class, 'create'])->name('fee-categories.create');
    Route::post('/fee-categories', [FeeStructureController::class, 'store'])->name('fee-categories.store');
    Route::get('/fee-categories/{feeStructure}', [FeeStructureController::class, 'show'])->name('fee-categories.show');
    Route::get('/fee-categories/{feeStructure}/edit', [FeeStructureController::class, 'edit'])->name('fee-categories.edit');
    Route::put('/fee-categories/{feeStructure}', [FeeStructureController::class, 'update'])->name('fee-categories.update');
    Route::delete('/fee-categories/{feeStructure}', [FeeStructureController::class, 'destroy'])->name('fee-categories.destroy');
    
    // Student Fees
    Route::get('/student-fees', [InvoiceController::class, 'index'])->name('student-fees.index');
    Route::get('/student-fees/create', [InvoiceController::class, 'create'])->name('student-fees.create');
    Route::post('/student-fees', [InvoiceController::class, 'store'])->name('student-fees.store');
    Route::get('/student-fees/{invoice}', [InvoiceController::class, 'show'])->name('student-fees.show');
    Route::get('/student-fees/{invoice}/edit', [InvoiceController::class, 'edit'])->name('student-fees.edit');
    Route::put('/student-fees/{invoice}', [InvoiceController::class, 'update'])->name('student-fees.update');
    Route::delete('/student-fees/{invoice}', [InvoiceController::class, 'destroy'])->name('student-fees.destroy');
    
    // Payments
    Route::get('/payments', [PaymentController::class, 'index'])->name('payments.index');
    Route::get('/payments/create', [PaymentController::class, 'create'])->name('payments.create');
    Route::post('/payments', [PaymentController::class, 'store'])->name('payments.store');
    Route::get('/payments/student-invoices', [PaymentController::class, 'getStudentInvoices'])->name('payments.student-invoices');
    Route::get('/payments/{payment}', [PaymentController::class, 'show'])->name('payments.show');
    Route::post('/payments/{payment}/verify', [PaymentController::class, 'verifyPayment'])->name('payments.verify');
    
    // Payment Plans
    Route::get('/payment-plans', [PaymentPlanController::class, 'index'])->name('payment-plans.index');
    Route::get('/payment-plans/create', [PaymentPlanController::class, 'create'])->name('payment-plans.create');
    Route::post('/payment-plans', [PaymentPlanController::class, 'store'])->name('payment-plans.store');
    Route::get('/payment-plans/{paymentPlan}', [PaymentPlanController::class, 'show'])->name('payment-plans.show');
    Route::get('/payment-plans/{paymentPlan}/edit', [PaymentPlanController::class, 'edit'])->name('payment-plans.edit');
    Route::put('/payment-plans/{paymentPlan}', [PaymentPlanController::class, 'update'])->name('payment-plans.update');
    Route::delete('/payment-plans/{paymentPlan}', [PaymentPlanController::class, 'destroy'])->name('payment-plans.destroy');
    
    // Budget Management
    Route::get('/budget', [BudgetController::class, 'index'])->name('budget.index');
    Route::get('/budget/create', [BudgetController::class, 'create'])->name('budget.create');
    Route::post('/budget', [BudgetController::class, 'store'])->name('budget.store');
    Route::get('/budget/{budget}', [BudgetController::class, 'show'])->name('budget.show');
    Route::get('/budget/{budget}/edit', [BudgetController::class, 'edit'])->name('budget.edit');
    Route::put('/budget/{budget}', [BudgetController::class, 'update'])->name('budget.update');
    Route::delete('/budget/{budget}', [BudgetController::class, 'destroy'])->name('budget.destroy');
    
    // Financial Reports
    Route::get('/reports', [FinancialReportsController::class, 'index'])->name('reports.index');
    Route::get('/reports/fee-collection', [FinancialReportsController::class, 'feeCollectionReport'])->name('reports.fee-collection');
    Route::get('/reports/arrears', [FinancialReportsController::class, 'arrearsReport'])->name('reports.arrears');
    Route::get('/reports/income-statement', [FinancialReportsController::class, 'incomeStatement'])->name('reports.income-statement');
    Route::get('/reports/balance-sheet', [FinancialReportsController::class, 'balanceSheet'])->name('reports.balance-sheet');
    Route::get('/reports/cash-flow', [FinancialReportsController::class, 'cashFlowStatement'])->name('reports.cash-flow');
    Route::get('/reports/budget-actual', [FinancialReportsController::class, 'budgetVsActual'])->name('reports.budget-actual');
    
    // Transactions
    Route::get('/transactions', [PaymentController::class, 'index'])->name('transactions.index');
    
});

// Library Management Routes
Route::middleware(['auth', 'role:school_admin,headteacher,teacher,librarian', \App\Http\Middleware\HandleMultiTenancy::class])->prefix('library')->name('library.')->group(function () {
    
    // Library Dashboard
    Route::get('/dashboard', [CirculationController::class, 'index'])->name('dashboard');
    
    // Book Catalog
    Route::get('/books', [BookController::class, 'index'])->name('books.index');
    Route::get('/books/create', [BookController::class, 'create'])->name('books.create');
    Route::post('/books', [BookController::class, 'store'])->name('books.store');
    Route::get('/books/{book}', [BookController::class, 'show'])->name('books.show');
    Route::get('/books/{book}/edit', [BookController::class, 'edit'])->name('books.edit');
    Route::put('/books/{book}', [BookController::class, 'update'])->name('books.update');
    Route::delete('/books/{book}', [BookController::class, 'destroy'])->name('books.destroy');
    
    // Book Issuance
    Route::get('/issuance', [CirculationController::class, 'index'])->name('issuance.index');
    Route::get('/issuance/issue', function () {
        return Inertia::render('Library/Circulation/Issue');
    })->name('issuance.issue');
    Route::post('/issuance', [CirculationController::class, 'issueBook'])->name('issuance.store');
    Route::post('/issuance/return', [CirculationController::class, 'returnBook'])->name('issuance.return');
    Route::post('/issuance/renew', [CirculationController::class, 'renewBook'])->name('issuance.renew');
    Route::post('/issuance/reserve', [CirculationController::class, 'reserveBook'])->name('issuance.reserve');
    
    // Fines Management
    Route::get('/fines', [FineController::class, 'index'])->name('fines.index');
    Route::post('/fines/{fine}/pay', [FineController::class, 'recordPayment'])->name('fines.pay');
    Route::post('/fines/{fine}/waive', [FineController::class, 'waiveFine'])->name('fines.waive');
    
    // Library Reports
    Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
    
});

// Inventory Management Routes
Route::middleware(['auth', 'role:school_admin,headteacher', \App\Http\Middleware\HandleMultiTenancy::class])->prefix('inventory')->name('inventory.')->group(function () {
    
    // Inventory Items
    Route::get('/', [InventoryController::class, 'index'])->name('index');
    Route::get('/items', [InventoryController::class, 'index'])->name('items.index');
    Route::get('/items/create', [InventoryController::class, 'create'])->name('items.create');
    Route::post('/items', [InventoryController::class, 'store'])->name('items.store');
    Route::get('/items/{inventoryItem}', [InventoryController::class, 'show'])->name('items.show');
    Route::get('/items/{inventoryItem}/edit', [InventoryController::class, 'edit'])->name('items.edit');
    Route::put('/items/{inventoryItem}', [InventoryController::class, 'update'])->name('items.update');
    Route::delete('/items/{inventoryItem}', [InventoryController::class, 'destroy'])->name('items.destroy');
    Route::post('/items/{inventoryItem}/adjust-stock', [InventoryController::class, 'adjustStock'])->name('items.adjust-stock');
    Route::get('/low-stock', [InventoryController::class, 'getLowStockItems'])->name('low-stock');
    Route::get('/needs-reorder', [InventoryController::class, 'getItemsNeedingReorder'])->name('needs-reorder');
    Route::post('/items/{inventoryItem}/barcode', [InventoryController::class, 'generateBarcode'])->name('items.barcode');
    Route::get('/items/{inventoryItem}/movement', [InventoryController::class, 'getStockMovement'])->name('items.movement');

    // Purchase Orders
    Route::get('/purchase-orders', [PurchaseOrderController::class, 'index'])->name('purchase-orders.index');
    Route::get('/purchase-orders/create', [PurchaseOrderController::class, 'create'])->name('purchase-orders.create');
    Route::post('/purchase-orders', [PurchaseOrderController::class, 'store'])->name('purchase-orders.store');
    Route::get('/purchase-orders/{purchaseOrder}', [PurchaseOrderController::class, 'show'])->name('purchase-orders.show');
    Route::get('/purchase-orders/{purchaseOrder}/edit', [PurchaseOrderController::class, 'edit'])->name('purchase-orders.edit');
    Route::put('/purchase-orders/{purchaseOrder}', [PurchaseOrderController::class, 'update'])->name('purchase-orders.update');
    Route::delete('/purchase-orders/{purchaseOrder}', [PurchaseOrderController::class, 'destroy'])->name('purchase-orders.destroy');
    Route::post('/purchase-orders/{purchaseOrder}/approve', [PurchaseOrderController::class, 'approve'])->name('purchase-orders.approve');
    Route::post('/purchase-orders/{purchaseOrder}/send', [PurchaseOrderController::class, 'send'])->name('purchase-orders.send');
    Route::post('/purchase-orders/{purchaseOrder}/cancel', [PurchaseOrderController::class, 'cancel'])->name('purchase-orders.cancel');
    Route::get('/purchase-orders/pending', [PurchaseOrderController::class, 'getPendingOrders'])->name('purchase-orders.pending');
    Route::get('/purchase-orders/overdue', [PurchaseOrderController::class, 'getOverdueOrders'])->name('purchase-orders.overdue');
    Route::get('/purchase-orders/{purchaseOrder}/print', [PurchaseOrderController::class, 'print'])->name('purchase-orders.print');

    // Goods Received Note
    Route::get('/goods-received', [GoodsReceivedController::class, 'index'])->name('goods-received.index');
    Route::get('/goods-received/create', [GoodsReceivedController::class, 'create'])->name('goods-received.create');
    Route::post('/goods-received', [GoodsReceivedController::class, 'store'])->name('goods-received.store');
    Route::get('/goods-received/{goodsReceivedNote}', [GoodsReceivedController::class, 'show'])->name('goods-received.show');
    Route::get('/goods-received/{goodsReceivedNote}/edit', [GoodsReceivedController::class, 'edit'])->name('goods-received.edit');
    Route::put('/goods-received/{goodsReceivedNote}', [GoodsReceivedController::class, 'update'])->name('goods-received.update');
    Route::post('/goods-received/{goodsReceivedNote}/accept', [GoodsReceivedController::class, 'accept'])->name('goods-received.accept');
    Route::post('/goods-received/{goodsReceivedNote}/reject', [GoodsReceivedController::class, 'reject'])->name('goods-received.reject');
    Route::get('/purchase-orders/{purchaseOrder}/items', [GoodsReceivedController::class, 'getPurchaseOrderItems'])->name('purchase-orders.items');
    Route::get('/goods-received/{goodsReceivedNote}/print', [GoodsReceivedController::class, 'print'])->name('goods-received.print');

    // Issue Note
    Route::get('/issue-notes', [IssueNoteController::class, 'index'])->name('issue-notes.index');
    Route::get('/issue-notes/create', [IssueNoteController::class, 'create'])->name('issue-notes.create');
    Route::post('/issue-notes', [IssueNoteController::class, 'store'])->name('issue-notes.store');
    Route::get('/issue-notes/{issueNote}', [IssueNoteController::class, 'show'])->name('issue-notes.show');
    Route::get('/issue-notes/{issueNote}/edit', [IssueNoteController::class, 'edit'])->name('issue-notes.edit');
    Route::put('/issue-notes/{issueNote}', [IssueNoteController::class, 'update'])->name('issue-notes.update');
    Route::post('/issue-notes/{issueNote}/issue', [IssueNoteController::class, 'issue'])->name('issue-notes.issue');
    Route::post('/issue-notes/{issueNote}/return', [IssueNoteController::class, 'return'])->name('issue-notes.return');
    Route::get('/items/{inventoryItem}/available-stock', [IssueNoteController::class, 'getAvailableStock'])->name('items.available-stock');
    Route::get('/issue-notes/{issueNote}/print', [IssueNoteController::class, 'print'])->name('issue-notes.print');

    // Asset Maintenance
    Route::get('/asset-maintenance', [AssetMaintenanceController::class, 'index'])->name('asset-maintenance.index');
    Route::get('/asset-maintenance/create', [AssetMaintenanceController::class, 'create'])->name('asset-maintenance.create');
    Route::post('/asset-maintenance', [AssetMaintenanceController::class, 'store'])->name('asset-maintenance.store');
    Route::get('/asset-maintenance/{assetMaintenance}', [AssetMaintenanceController::class, 'show'])->name('asset-maintenance.show');
    Route::get('/asset-maintenance/{assetMaintenance}/edit', [AssetMaintenanceController::class, 'edit'])->name('asset-maintenance.edit');
    Route::put('/asset-maintenance/{assetMaintenance}', [AssetMaintenanceController::class, 'update'])->name('asset-maintenance.update');
    Route::delete('/asset-maintenance/{assetMaintenance}', [AssetMaintenanceController::class, 'destroy'])->name('asset-maintenance.destroy');
    Route::get('/asset-maintenance/overdue', [AssetMaintenanceController::class, 'getOverdueMaintenances'])->name('asset-maintenance.overdue');
    Route::get('/asset-maintenance/due-soon', [AssetMaintenanceController::class, 'getDueSoonMaintenances'])->name('asset-maintenance.due-soon');
    Route::get('/items/{inventoryItem}/maintenance-history', [AssetMaintenanceController::class, 'getAssetMaintenanceHistory'])->name('items.maintenance-history');
    Route::post('/preventive-maintenance', [AssetMaintenanceController::class, 'schedulePreventiveMaintenance'])->name('preventive-maintenance.schedule');

    // Reports
    Route::get('/reports', [InventoryReportsController::class, 'index'])->name('reports.index');
    Route::get('/reports/stock-status', [InventoryReportsController::class, 'stockStatusReport'])->name('reports.stock-status');
    Route::get('/reports/stock-movement', [InventoryReportsController::class, 'stockMovementReport'])->name('reports.stock-movement');
    Route::get('/reports/slow-moving', [InventoryReportsController::class, 'slowMovingItemsReport'])->name('reports.slow-moving');
    Route::get('/reports/asset-register', [InventoryReportsController::class, 'assetRegisterReport'])->name('reports.asset-register');
    Route::get('/reports/consumption-analysis', [InventoryReportsController::class, 'consumptionAnalysisReport'])->name('reports.consumption-analysis');
    Route::get('/reports/purchase-orders', [InventoryReportsController::class, 'purchaseOrderReport'])->name('reports.purchase-orders');
    Route::get('/reports/maintenance', [InventoryReportsController::class, 'maintenanceReport'])->name('reports.maintenance');
    Route::post('/reports/stock-status/export', [InventoryReportsController::class, 'exportStockStatusReport'])->name('reports.stock-status.export');
    Route::post('/reports/asset-register/export', [InventoryReportsController::class, 'exportAssetRegisterReport'])->name('reports.asset-register.export');
});

// Hostel Management Routes
Route::middleware(['auth', 'role:school_admin,headteacher,dormitory_manager', \App\Http\Middleware\HandleMultiTenancy::class])->prefix('hostel')->name('hostel.')->group(function () {
    
    // Hostel Dashboard
    Route::get('/dashboard', [HostelReportsController::class, 'dashboard'])->name('dashboard');
    
    // Hostels
    Route::get('/hostels', [HostelController::class, 'index'])->name('hostels.index');
    Route::get('/hostels/create', [HostelController::class, 'create'])->name('hostels.create');
    Route::post('/hostels', [HostelController::class, 'store'])->name('hostels.store');
    Route::get('/hostels/{hostel}', [HostelController::class, 'show'])->name('hostels.show');
    Route::get('/hostels/{hostel}/edit', [HostelController::class, 'edit'])->name('hostels.edit');
    Route::put('/hostels/{hostel}', [HostelController::class, 'update'])->name('hostels.update');
    Route::delete('/hostels/{hostel}', [HostelController::class, 'destroy'])->name('hostels.destroy');
    Route::get('/hostels/{hostel}/vacancy', [HostelController::class, 'getVacancyReport'])->name('hostels.vacancy');
    Route::get('/occupancy', [HostelController::class, 'getOccupancyReport'])->name('occupancy');
    Route::get('/stats', [HostelController::class, 'getHostelStatistics'])->name('stats');
    Route::get('/hostels/{hostel}/available-beds', [HostelController::class, 'getAvailableBeds'])->name('hostels.available-beds');

    // Residents / Allocations
    Route::get('/residents', [HostelAllocationController::class, 'index'])->name('residents.index');
    Route::get('/residents/create', [HostelAllocationController::class, 'create'])->name('residents.create');
    Route::post('/residents', [HostelAllocationController::class, 'store'])->name('residents.store');
    Route::get('/residents/{allocation}', [HostelAllocationController::class, 'show'])->name('residents.show');
    Route::get('/residents/{allocation}/edit', [HostelAllocationController::class, 'edit'])->name('residents.edit');
    Route::put('/residents/{allocation}', [HostelAllocationController::class, 'update'])->name('residents.update');
    Route::post('/residents/{allocation}/deallocate', [HostelAllocationController::class, 'deallocate'])->name('residents.deallocate');
    Route::post('/residents/bulk', [HostelAllocationController::class, 'bulkAllocate'])->name('residents.bulk');
    Route::get('/students/{studentId}/allocations', [HostelAllocationController::class, 'getStudentAllocationHistory'])->name('students.allocations');
    Route::get('/students/{studentId}/current-allocation', [HostelAllocationController::class, 'getCurrentAllocation'])->name('students.current-allocation');

    // Leave Records
    Route::get('/leave-records', [HostelLeaveController::class, 'index'])->name('leave-records.index');
    Route::get('/leave-records/create', [HostelLeaveController::class, 'create'])->name('leave-records.create');
    Route::post('/leave-records', [HostelLeaveController::class, 'store'])->name('leave-records.store');
    Route::get('/leave-records/{leaveApplication}', [HostelLeaveController::class, 'show'])->name('leave-records.show');
    Route::get('/leave-records/{leaveApplication}/edit', [HostelLeaveController::class, 'edit'])->name('leave-records.edit');
    Route::put('/leave-records/{leaveApplication}', [HostelLeaveController::class, 'update'])->name('leave-records.update');
    Route::post('/leave-records/{leaveApplication}/approve', [HostelLeaveController::class, 'approve'])->name('leave-records.approve');
    Route::post('/leave-records/{leaveApplication}/reject', [HostelLeaveController::class, 'reject'])->name('leave-records.reject');
    Route::post('/leave-records/{leaveApplication}/check-in', [HostelLeaveController::class, 'checkIn'])->name('leave-records.check-in');
    Route::post('/leave-records/{leaveApplication}/check-out', [HostelLeaveController::class, 'checkOut'])->name('leave-records.check-out');
    Route::get('/students/{studentId}/leave', [HostelLeaveController::class, 'getStudentLeaveHistory'])->name('students.leave');
    Route::get('/leave-records/pending', [HostelLeaveController::class, 'getPendingApplications'])->name('leave-records.pending');
    Route::get('/leave-records/overdue', [HostelLeaveController::class, 'getOverdueReturns'])->name('leave-records.overdue');

    // Hostel Inventory
    Route::get('/inventory', [HostelInventoryController::class, 'index'])->name('inventory.index');
    Route::get('/inventory/create', [HostelInventoryController::class, 'create'])->name('inventory.create');
    Route::post('/inventory', [HostelInventoryController::class, 'store'])->name('inventory.store');
    Route::get('/inventory/{hostelInventory}', [HostelInventoryController::class, 'show'])->name('inventory.show');
    Route::get('/inventory/{hostelInventory}/edit', [HostelInventoryController::class, 'edit'])->name('inventory.edit');
    Route::put('/inventory/{hostelInventory}', [HostelInventoryController::class, 'update'])->name('inventory.update');
    Route::delete('/inventory/{hostelInventory}', [HostelInventoryController::class, 'destroy'])->name('inventory.destroy');
    Route::post('/inventory/{hostelInventory}/adjust', [HostelInventoryController::class, 'adjustQuantity'])->name('inventory.adjust');
    Route::post('/inventory/{hostelInventory}/transfer', [HostelInventoryController::class, 'transfer'])->name('inventory.transfer');
    Route::get('/hostels/{hostelId}/inventory', [HostelInventoryController::class, 'getHostelInventory'])->name('hostels.inventory');
    Route::get('/rooms/{roomId}/inventory', [HostelInventoryController::class, 'getRoomInventory'])->name('rooms.inventory');
    Route::get('/inventory-summary', [HostelInventoryController::class, 'getInventorySummary'])->name('inventory.summary');
    Route::get('/inventory-low-stock', [HostelInventoryController::class, 'getLowStockItems'])->name('inventory.low-stock');

    // Maintenance
    Route::get('/maintenance', [HostelMaintenanceController::class, 'index'])->name('maintenance.index');
    Route::get('/maintenance/create', [HostelMaintenanceController::class, 'create'])->name('maintenance.create');
    Route::post('/maintenance', [HostelMaintenanceController::class, 'store'])->name('maintenance.store');
    Route::get('/maintenance/{maintenanceRequest}', [HostelMaintenanceController::class, 'show'])->name('maintenance.show');
    Route::get('/maintenance/{maintenanceRequest}/edit', [HostelMaintenanceController::class, 'edit'])->name('maintenance.edit');
    Route::put('/maintenance/{maintenanceRequest}', [HostelMaintenanceController::class, 'update'])->name('maintenance.update');
    Route::post('/maintenance/{maintenanceRequest}/assign', [HostelMaintenanceController::class, 'assign'])->name('maintenance.assign');
    Route::post('/maintenance/{maintenanceRequest}/complete', [HostelMaintenanceController::class, 'complete'])->name('maintenance.complete');
    Route::post('/maintenance/{maintenanceRequest}/cancel', [HostelMaintenanceController::class, 'cancel'])->name('maintenance.cancel');
    Route::get('/my-maintenance', [HostelMaintenanceController::class, 'getMyAssignedRequests'])->name('maintenance.my');
    Route::get('/urgent-maintenance', [HostelMaintenanceController::class, 'getUrgentRequests'])->name('maintenance.urgent');
    Route::get('/maintenance/{maintenanceRequest}/history', [HostelMaintenanceController::class, 'getMaintenanceHistory'])->name('maintenance.history');
    Route::get('/maintenance-stats', [HostelMaintenanceController::class, 'getMaintenanceStats'])->name('maintenance.stats');

    // Wardens
    Route::get('/wardens', [HostelWardenController::class, 'index'])->name('wardens.index');
    Route::get('/wardens/create', [HostelWardenController::class, 'create'])->name('wardens.create');
    Route::post('/wardens', [HostelWardenController::class, 'store'])->name('wardens.store');
    Route::get('/wardens/{warden}', [HostelWardenController::class, 'show'])->name('wardens.show');
    Route::get('/wardens/{warden}/edit', [HostelWardenController::class, 'edit'])->name('wardens.edit');
    Route::put('/wardens/{warden}', [HostelWardenController::class, 'update'])->name('wardens.update');
    Route::post('/wardens/{warden}/deactivate', [HostelWardenController::class, 'deactivate'])->name('wardens.deactivate');
    Route::post('/wardens/{warden}/activate', [HostelWardenController::class, 'activate'])->name('wardens.activate');
    Route::get('/wardens/{warden}/duty-roster', [HostelWardenController::class, 'getWardenDutyRoster'])->name('wardens.duty-roster');
    Route::post('/wardens/{warden}/duty-roster', [HostelWardenController::class, 'createDutyRoster'])->name('wardens.duty-roster.store');
    Route::get('/hostels/{hostelId}/wardens', [HostelWardenController::class, 'getHostelWardens'])->name('hostels.wardens');
    Route::get('/active-wardens', [HostelWardenController::class, 'getActiveWardens'])->name('wardens.active');

    // Reports
    Route::get('/reports', [HostelReportsController::class, 'index'])->name('reports.index');
    Route::get('/reports/occupancy', [HostelReportsController::class, 'occupancyReport'])->name('reports.occupancy');
    Route::get('/reports/allocation', [HostelReportsController::class, 'studentAllocationReport'])->name('reports.allocation');
    Route::get('/reports/leave', [HostelReportsController::class, 'leaveApplicationReport'])->name('reports.leave');
    Route::get('/reports/maintenance', [HostelReportsController::class, 'maintenanceReport'])->name('reports.maintenance');
    Route::get('/reports/inventory', [HostelReportsController::class, 'inventoryReport'])->name('reports.inventory');
    Route::get('/reports/warden', [HostelReportsController::class, 'wardenPerformanceReport'])->name('reports.warden');
    Route::post('/reports/export', [HostelReportsController::class, 'exportReport'])->name('reports.export');
    Route::get('/dashboard-stats', [HostelReportsController::class, 'getDashboardStats'])->name('dashboard-stats');
});

Route::middleware(['auth', 'role:school_admin,headteacher', \App\Http\Middleware\HandleMultiTenancy::class])->prefix('transport')->name('transport.')->group(function () {
    
    Route::redirect('/', '/transport/dashboard');
    // Transport Dashboard
    Route::get('/dashboard', [TransportController::class, 'dashboard'])->name('dashboard');
    
    // Vehicles
    Route::get('/vehicles', [TransportController::class, 'vehicles'])->name('vehicles.index');
    Route::post('/vehicles', [TransportController::class, 'storeVehicle'])->name('vehicles.store');
    
    // Routes
    Route::get('/routes', [TransportController::class, 'routes'])->name('routes.index');
    Route::post('/routes', [TransportController::class, 'storeRoute'])->name('routes.store');
    
    // Student Assignments
    Route::get('/assignments', [TransportController::class, 'assignments'])->name('assignments.index');
    
    // Trips
    Route::get('/trips', [TransportController::class, 'trips'])->name('trips.index');
    
    // Maintenance
    Route::get('/maintenance', [TransportController::class, 'maintenance'])->name('maintenance.index');
    Route::post('/maintenance', [TransportController::class, 'storeMaintenance'])->name('maintenance.store');
    
});

// Communication Routes
Route::middleware(['auth', 'role:school_admin,headteacher,teacher', \App\Http\Middleware\HandleMultiTenancy::class])->prefix('communication')->name('communication.')->group(function () {

    // Communication Dashboard
    Route::get('/dashboard', function () {
        return Inertia::render('Communication/Dashboard');
    })->name('dashboard');

    // Announcements
    Route::get('/announcements', [AnnouncementController::class, 'index'])->name('announcements.index');
    Route::get('/announcements/create', [AnnouncementController::class, 'create'])->name('announcements.create');
    Route::post('/announcements', [AnnouncementController::class, 'store'])->name('announcements.store');
    Route::get('/announcements/{announcement}', [AnnouncementController::class, 'show'])->name('announcements.show');
    Route::get('/announcements/{announcement}/edit', [AnnouncementController::class, 'edit'])->name('announcements.edit');
    Route::put('/announcements/{announcement}', [AnnouncementController::class, 'update'])->name('announcements.update');
    Route::delete('/announcements/{announcement}', [AnnouncementController::class, 'destroy'])->name('announcements.destroy');
    Route::post('/announcements/{announcement}/publish', [AnnouncementController::class, 'publish'])->name('announcements.publish');
    Route::post('/announcements/{announcement}/unpublish', [AnnouncementController::class, 'unpublish'])->name('announcements.unpublish');
    Route::post('/announcements/{announcement}/pin', [AnnouncementController::class, 'pin'])->name('announcements.pin');
    Route::post('/announcements/{announcement}/unpin', [AnnouncementController::class, 'unpin'])->name('announcements.unpin');
    Route::post('/announcements/{announcement}/comments', [AnnouncementController::class, 'addComment'])->name('announcements.comments.store');
    Route::post('/announcements/{announcement}/comments/{commentId}/approve', [AnnouncementController::class, 'approveComment'])->name('announcements.comments.approve');
    Route::delete('/announcements/{announcement}/comments/{commentId}', [AnnouncementController::class, 'deleteComment'])->name('announcements.comments.destroy');
    Route::get('/public-announcements', [AnnouncementController::class, 'getPublicAnnouncements'])->name('announcements.public');

    // Messages (Direct Messaging)
    Route::get('/messages', [MessageController::class, 'index'])->name('messages.index');
    Route::get('/messages/create', [MessageController::class, 'create'])->name('messages.create');
    Route::post('/messages', [MessageController::class, 'store'])->name('messages.store');
    Route::get('/messages/{message}', [MessageController::class, 'show'])->name('messages.show');
    Route::get('/messages/{message}/edit', [MessageController::class, 'edit'])->name('messages.edit');
    Route::put('/messages/{message}', [MessageController::class, 'update'])->name('messages.update');
    Route::delete('/messages/{message}', [MessageController::class, 'destroy'])->name('messages.destroy');
    Route::post('/messages/{message}/send', [MessageController::class, 'send'])->name('messages.send');
    Route::post('/messages/{message}/schedule', [MessageController::class, 'schedule'])->name('messages.schedule');
    Route::post('/messages/{message}/cancel', [MessageController::class, 'cancel'])->name('messages.cancel');
    Route::post('/messages/{message}/reply', [MessageController::class, 'reply'])->name('messages.reply');
    Route::get('/recipients-by-type', [MessageController::class, 'getRecipientsByType'])->name('messages.recipients-by-type');
    Route::get('/class-recipients', [MessageController::class, 'getClassRecipients'])->name('messages.class-recipients');

    // Message Templates
    Route::get('/templates', [MessageTemplateController::class, 'index'])->name('templates.index');
    Route::get('/templates/create', [MessageTemplateController::class, 'create'])->name('templates.create');
    Route::post('/templates', [MessageTemplateController::class, 'store'])->name('templates.store');
    Route::get('/templates/{template}', [MessageTemplateController::class, 'show'])->name('templates.show');
    Route::get('/templates/{template}/edit', [MessageTemplateController::class, 'edit'])->name('templates.edit');
    Route::put('/templates/{template}', [MessageTemplateController::class, 'update'])->name('templates.update');
    Route::delete('/templates/{template}', [MessageTemplateController::class, 'destroy'])->name('templates.destroy');
    Route::post('/templates/{template}/duplicate', [MessageTemplateController::class, 'duplicate'])->name('templates.duplicate');
    Route::post('/templates/{template}/toggle-status', [MessageTemplateController::class, 'toggleStatus'])->name('templates.toggle-status');
    Route::post('/templates/{template}/preview', [MessageTemplateController::class, 'preview'])->name('templates.preview');
    Route::get('/templates-by-category/{category}', [MessageTemplateController::class, 'getTemplatesByCategory'])->name('templates.by-category');
    Route::get('/templates-by-type/{type}', [MessageTemplateController::class, 'getTemplatesByType'])->name('templates.by-type');

    // Notice Board
    Route::get('/notice-board', [NoticeBoardController::class, 'index'])->name('notice-board.index');
    Route::get('/notice-board/create', [NoticeBoardController::class, 'create'])->name('notice-board.create');
    Route::post('/notice-board', [NoticeBoardController::class, 'store'])->name('notice-board.store');
    Route::delete('/notice-board/{id}', [NoticeBoardController::class, 'destroy'])->name('notice-board.destroy');

    // Suggestions & Feedback
    Route::get('/suggestions', [SuggestionController::class, 'index'])->name('suggestions.index');
    Route::post('/suggestions', [SuggestionController::class, 'store'])->name('suggestions.store');
    Route::delete('/suggestions/{id}', [SuggestionController::class, 'destroy'])->name('suggestions.destroy');

    // SMS Gateway
    Route::get('/sms', [MessageTemplateController::class, 'index'])->name('sms.index');

    // Email Gateway
    Route::get('/email', [MessageTemplateController::class, 'index'])->name('email.index');

    // Events
    Route::get('/events', [EventController::class, 'index'])->name('events.index');
    Route::get('/events/create', [EventController::class, 'create'])->name('events.create');
    Route::post('/events', [EventController::class, 'store'])->name('events.store');
    Route::get('/events/{event}', [EventController::class, 'show'])->name('events.show');
    Route::get('/events/{event}/edit', [EventController::class, 'edit'])->name('events.edit');
    Route::put('/events/{event}', [EventController::class, 'update'])->name('events.update');
    Route::delete('/events/{event}', [EventController::class, 'destroy'])->name('events.destroy');
    Route::post('/events/{event}/publish', [EventController::class, 'publish'])->name('events.publish');
    Route::post('/events/{event}/cancel', [EventController::class, 'cancel'])->name('events.cancel');
    Route::post('/events/{event}/complete', [EventController::class, 'complete'])->name('events.complete');
    Route::post('/events/{event}/rsvp', [EventController::class, 'rsvp'])->name('events.rsvp');
    Route::get('/events/{event}/rsvp-stats', [EventController::class, 'getRsvpStats'])->name('events.rsvp-stats');
    Route::get('/upcoming-events', [EventController::class, 'getUpcomingEvents'])->name('events.upcoming');
    Route::get('/public-events', [EventController::class, 'getPublicEvents'])->name('events.public-list');
    Route::get('/calendar-events', [EventController::class, 'getEventCalendar'])->name('events.calendar');

    // Meeting Requests
    Route::get('/meeting-requests', [MeetingRequestController::class, 'index'])->name('meetings.index');
    Route::get('/meeting-requests/create', [MeetingRequestController::class, 'create'])->name('meetings.create');
    Route::post('/meeting-requests', [MeetingRequestController::class, 'store'])->name('meetings.store');
    Route::get('/meeting-requests/{meeting}', [MeetingRequestController::class, 'show'])->name('meetings.show');
    Route::get('/meeting-requests/{meeting}/edit', [MeetingRequestController::class, 'edit'])->name('meetings.edit');
    Route::put('/meeting-requests/{meeting}', [MeetingRequestController::class, 'update'])->name('meetings.update');
    Route::delete('/meeting-requests/{meeting}', [MeetingRequestController::class, 'destroy'])->name('meetings.destroy');
    Route::post('/meeting-requests/{meeting}/approve', [MeetingRequestController::class, 'approve'])->name('meetings.approve');
    Route::post('/meeting-requests/{meeting}/schedule', [MeetingRequestController::class, 'schedule'])->name('meetings.schedule');
    Route::post('/meeting-requests/{meeting}/complete', [MeetingRequestController::class, 'complete'])->name('meetings.complete');
    Route::post('/meeting-requests/{meeting}/cancel', [MeetingRequestController::class, 'cancel'])->name('meetings.cancel');
    Route::post('/meeting-requests/{meeting}/decline', [MeetingRequestController::class, 'decline'])->name('meetings.decline');
    Route::get('/my-meetings', [MeetingRequestController::class, 'getMyMeetings'])->name('meetings.my');
    Route::get('/upcoming-meetings', [MeetingRequestController::class, 'getUpcomingMeetings'])->name('meetings.upcoming');
    Route::get('/meeting-stats', [MeetingRequestController::class, 'getMeetingStats'])->name('meetings.stats');

    // Notification Preferences
    Route::get('/notification-preferences', [NotificationPreferenceController::class, 'index'])->name('notification-preferences.index');
    Route::post('/notification-preferences', [NotificationPreferenceController::class, 'update'])->name('notification-preferences.update');
    Route::post('/notification-preferences/{notificationType}/channel', [NotificationPreferenceController::class, 'updateChannel'])->name('notification-preferences.channel');
    Route::post('/notification-preferences/{notificationType}/frequency', [NotificationPreferenceController::class, 'updateFrequency'])->name('notification-preferences.frequency');
    Route::post('/notification-preferences/{notificationType}/quiet-hours', [NotificationPreferenceController::class, 'updateQuietHours'])->name('notification-preferences.quiet-hours');
    Route::post('/notification-preferences/{notificationType}/category', [NotificationPreferenceController::class, 'addCategory'])->name('notification-preferences.category.add');
    Route::delete('/notification-preferences/{notificationType}/category', [NotificationPreferenceController::class, 'removeCategory'])->name('notification-preferences.category.remove');
    Route::post('/notification-preferences/{notificationType}/reset', [NotificationPreferenceController::class, 'resetToDefaults'])->name('notification-preferences.reset');
    Route::get('/notification-preferences/all', [NotificationPreferenceController::class, 'getPreferences'])->name('notification-preferences.all');
    Route::get('/notification-preferences/{notificationType}', [NotificationPreferenceController::class, 'getPreference'])->name('notification-preferences.type');

});

// Reports & Analytics Routes
Route::middleware(['auth', 'role:school_admin,headteacher,bursar,teacher', \App\Http\Middleware\HandleMultiTenancy::class])->prefix('reports')->name('reports.')->group(function () {
    
    // Reports Dashboard
    Route::get('/dashboard', function () {
        return Inertia::render('Reports/Dashboard');
    })->name('dashboard');
    
    // Academic Reports
    Route::get('/academic', function () {
        return Inertia::render('Reports/Dashboard'); // Reuse dashboard
    })->name('academic.index');
    
    // Financial Reports
    Route::get('/financial', function () {
        return Inertia::render('Reports/Dashboard'); // Reuse dashboard
    })->name('financial.index');
    
    // Attendance Reports
    Route::get('/attendance', function () {
        return Inertia::render('Reports/Dashboard'); // Reuse dashboard
    })->name('attendance.index');
    
    // Custom Reports
    Route::get('/custom', function () {
        return Inertia::render('Reports/Dashboard'); // Reuse dashboard
    })->name('custom.index');
    
});

// Student Management Routes (plural URL support for sidebars)
Route::middleware(['auth', 'role:school_admin,headteacher,teacher', \App\Http\Middleware\HandleMultiTenancy::class])->prefix('students')->name('students.')->group(function () {
    Route::get('/applications', [App\Http\Controllers\Student\ApplicationController::class, 'index'])->name('applications.index');
    Route::get('/applications/create', [App\Http\Controllers\Student\ApplicationController::class, 'create'])->name('applications.create');
    Route::post('/applications', [App\Http\Controllers\Student\ApplicationController::class, 'store'])->name('applications.store');
    Route::get('/applications/{application}', [App\Http\Controllers\Student\ApplicationController::class, 'show'])->name('applications.show');
    Route::get('/applications/{application}/edit', [App\Http\Controllers\Student\ApplicationController::class, 'edit'])->name('applications.edit');
    Route::put('/applications/{application}', [App\Http\Controllers\Student\ApplicationController::class, 'update'])->name('applications.update');
    Route::get('/profiles', [App\Http\Controllers\Student\ProfileController::class, 'index'])->name('profiles.index');
    Route::get('/profiles/create', [App\Http\Controllers\Student\ProfileController::class, 'create'])->name('profiles.create');
    Route::post('/profiles', [App\Http\Controllers\Student\ProfileController::class, 'store'])->name('profiles.store');
    Route::get('/profiles/{student}', [App\Http\Controllers\Student\ProfileController::class, 'show'])->name('profiles.show');
    Route::get('/profiles/{student}/edit', [App\Http\Controllers\Student\ProfileController::class, 'edit'])->name('profiles.edit');
    Route::put('/profiles/{student}', [App\Http\Controllers\Student\ProfileController::class, 'update'])->name('profiles.update');
    Route::delete('/profiles/{student}', [App\Http\Controllers\Student\ProfileController::class, 'destroy'])->name('profiles.destroy');
    Route::post('/profiles/{student}/toggle-status', [App\Http\Controllers\Student\ProfileController::class, 'toggleStatus'])->name('profiles.toggle-status');
    Route::post('/profiles/{student}/guardian', [App\Http\Controllers\Student\ProfileController::class, 'addGuardian'])->name('profiles.add-guardian');
    Route::post('/profiles/{student}/medical', [App\Http\Controllers\Student\ProfileController::class, 'addMedicalRecord'])->name('profiles.add-medical');
    Route::post('/profiles/{student}/disciplinary', [App\Http\Controllers\Student\ProfileController::class, 'addDisciplinaryRecord'])->name('profiles.add-disciplinary');

    Route::get('/attendance', [App\Http\Controllers\Student\AttendanceController::class, 'index'])->name('attendance.index');
    Route::get('/attendance/mark', [App\Http\Controllers\Student\AttendanceController::class, 'mark'])->name('attendance.mark');
    Route::post('/attendance', [App\Http\Controllers\Student\AttendanceController::class, 'store'])->name('attendance.store');
    Route::get('/attendance/classes', [App\Http\Controllers\Student\AttendanceController::class, 'classReport'])->name('attendance.classes');
    Route::get('/attendance/export', [App\Http\Controllers\Student\AttendanceController::class, 'export'])->name('attendance.export');
    Route::get('/attendance/student/{id}', [App\Http\Controllers\Student\AttendanceController::class, 'studentProfile'])->name('attendance.student');
    Route::get('/attendance/reports', [App\Http\Controllers\Student\AttendanceController::class, 'reports'])->name('attendance.reports');
    Route::get('/promotions', [App\Http\Controllers\Student\PromotionController::class, 'index'])->name('promotions.index');
    Route::get('/alumni', [App\Http\Controllers\Student\AlumniController::class, 'index'])->name('alumni.index');
    Route::get('/parents', [App\Http\Controllers\Student\ProfileController::class, 'parentsIndex'])->name('parents.index');
});

// Student Management Routes (singular URL/Name support for controllers & page layouts)
Route::middleware(['auth', 'role:school_admin,headteacher,teacher', \App\Http\Middleware\HandleMultiTenancy::class])->prefix('student')->name('student.')->group(function () {
    // Applications
    Route::get('/applications', [App\Http\Controllers\Student\ApplicationController::class, 'index'])->name('applications.index');
    Route::get('/applications/create', [App\Http\Controllers\Student\ApplicationController::class, 'create'])->name('applications.create');
    Route::post('/applications', [App\Http\Controllers\Student\ApplicationController::class, 'store'])->name('applications.store');
    Route::get('/applications/{application}', [App\Http\Controllers\Student\ApplicationController::class, 'show'])->name('applications.show');
    Route::get('/applications/{application}/edit', [App\Http\Controllers\Student\ApplicationController::class, 'edit'])->name('applications.edit');
    Route::put('/applications/{application}', [App\Http\Controllers\Student\ApplicationController::class, 'update'])->name('applications.update');
    Route::patch('/applications/{application}/status', [App\Http\Controllers\Student\ApplicationController::class, 'updateStatus'])->name('applications.update-status');
    Route::post('/applications/{application}/interview', [App\Http\Controllers\Student\ApplicationController::class, 'scheduleInterview'])->name('applications.schedule-interview');
    Route::post('/interviews/{interview}/record', [App\Http\Controllers\Student\ApplicationController::class, 'recordInterview'])->name('interviews.record');
    Route::post('/applications/{application}/payment', [App\Http\Controllers\Student\ApplicationController::class, 'processPayment'])->name('applications.process-payment');
    Route::post('/payments/{payment}/verify', [App\Http\Controllers\Student\ApplicationController::class, 'verifyPayment'])->name('payments.verify');
    Route::get('/documents/{document}/download', [App\Http\Controllers\Student\ApplicationController::class, 'downloadDocument'])->name('documents.download');
    Route::post('/documents/{document}/verify', [App\Http\Controllers\Student\ApplicationController::class, 'verifyDocument'])->name('documents.verify');
    Route::get('/applications/{application}/admission-letter', [App\Http\Controllers\Student\ApplicationController::class, 'generateAdmissionLetter'])->name('applications.admission-letter');

    // Profiles
    Route::get('/profiles', [App\Http\Controllers\Student\ProfileController::class, 'index'])->name('profiles.index');
    Route::get('/profiles/create', [App\Http\Controllers\Student\ProfileController::class, 'create'])->name('profiles.create');
    Route::post('/profiles', [App\Http\Controllers\Student\ProfileController::class, 'store'])->name('profiles.store');
    Route::get('/profiles/{student}', [App\Http\Controllers\Student\ProfileController::class, 'show'])->name('profiles.show');
    Route::get('/profiles/{student}/edit', [App\Http\Controllers\Student\ProfileController::class, 'edit'])->name('profiles.edit');
    Route::put('/profiles/{student}', [App\Http\Controllers\Student\ProfileController::class, 'update'])->name('profiles.update');
    Route::delete('/profiles/{student}', [App\Http\Controllers\Student\ProfileController::class, 'destroy'])->name('profiles.destroy');
    Route::post('/profiles/{student}/guardian', [App\Http\Controllers\Student\ProfileController::class, 'addGuardian'])->name('profiles.add-guardian');
    Route::post('/profiles/{student}/medical', [App\Http\Controllers\Student\ProfileController::class, 'addMedicalRecord'])->name('profiles.add-medical');
    Route::post('/profiles/{student}/disciplinary', [App\Http\Controllers\Student\ProfileController::class, 'addDisciplinaryRecord'])->name('profiles.add-disciplinary');

    // Attendance
    Route::get('/attendance', [App\Http\Controllers\Student\AttendanceController::class, 'index'])->name('attendance.index');
    Route::get('/attendance/mark', [App\Http\Controllers\Student\AttendanceController::class, 'mark'])->name('attendance.mark');
    Route::post('/attendance', [App\Http\Controllers\Student\AttendanceController::class, 'store'])->name('attendance.store');
    Route::get('/attendance/classes', [App\Http\Controllers\Student\AttendanceController::class, 'classReport'])->name('attendance.classes');
    Route::get('/attendance/export', [App\Http\Controllers\Student\AttendanceController::class, 'export'])->name('attendance.export');
    Route::get('/attendance/student/{id}', [App\Http\Controllers\Student\AttendanceController::class, 'studentProfile'])->name('attendance.student');
    Route::get('/attendance/reports', [App\Http\Controllers\Student\AttendanceController::class, 'reports'])->name('attendance.reports');

    // Promotions & Graduations
    Route::get('/promotions', [App\Http\Controllers\Student\PromotionController::class, 'index'])->name('promotions.index');
    Route::get('/promotions/class/{class}', [App\Http\Controllers\Student\PromotionController::class, 'showClass'])->name('promotions.show-class');
    Route::post('/promotions/bulk', [App\Http\Controllers\Student\PromotionController::class, 'bulkPromote'])->name('promotions.bulk');
    Route::post('/promotions/student/{student}', [App\Http\Controllers\Student\PromotionController::class, 'promoteStudent'])->name('promotions.promote-student');
    Route::get('/graduations', [App\Http\Controllers\Student\PromotionController::class, 'graduationIndex'])->name('graduations.index');
    Route::get('/graduations/class/{class}', [App\Http\Controllers\Student\PromotionController::class, 'showGraduatingClass'])->name('graduations.show-class');
    Route::post('/graduations/process', [App\Http\Controllers\Student\PromotionController::class, 'processGraduation'])->name('graduations.process');
    Route::post('/graduations/certificates', [App\Http\Controllers\Student\PromotionController::class, 'generateCertificates'])->name('graduations.certificates');

    // Alumni
    Route::get('/alumni', [App\Http\Controllers\Student\AlumniController::class, 'index'])->name('alumni.index');
    Route::get('/alumni/statistics', [App\Http\Controllers\Student\AlumniController::class, 'statistics'])->name('alumni.statistics');
    Route::get('/alumni/mentors', [App\Http\Controllers\Student\AlumniController::class, 'mentors'])->name('alumni.mentors');
    Route::get('/alumni/volunteers', [App\Http\Controllers\Student\AlumniController::class, 'volunteers'])->name('alumni.volunteers');
    Route::post('/alumni/newsletter', [App\Http\Controllers\Student\AlumniController::class, 'sendNewsletter'])->name('alumni.newsletter');
    Route::get('/alumni/export', [App\Http\Controllers\Student\AlumniController::class, 'export'])->name('alumni.export');
    Route::get('/alumni/{alumni}', [App\Http\Controllers\Student\AlumniController::class, 'show'])->name('alumni.show');
    Route::get('/alumni/{alumni}/edit', [App\Http\Controllers\Student\AlumniController::class, 'edit'])->name('alumni.edit');
    Route::put('/alumni/{alumni}', [App\Http\Controllers\Student\AlumniController::class, 'update'])->name('alumni.update');

    // Parents
    Route::get('/parents', [App\Http\Controllers\Student\ProfileController::class, 'parentsIndex'])->name('parents.index');
});

// Role-specific Dashboard Routes
Route::middleware(['auth', 'role:bursar', \App\Http\Middleware\HandleMultiTenancy::class])->prefix('bursar')->name('bursar.')->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Bursar/Dashboard');
    })->name('dashboard');
});

Route::middleware(['auth', 'role:librarian', \App\Http\Middleware\HandleMultiTenancy::class])->prefix('librarian')->name('librarian.')->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Librarian/Dashboard');
    })->name('dashboard');
});

Route::middleware(['auth', 'role:dormitory_manager', \App\Http\Middleware\HandleMultiTenancy::class])->prefix('dormitory-manager')->name('dormitory-manager.')->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('DormitoryManager/Dashboard');
    })->name('dashboard');
});

Route::middleware(['auth', 'role:academic_master', \App\Http\Middleware\HandleMultiTenancy::class])->prefix('academic-master')->name('academic-master.')->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('AcademicMaster/Dashboard');
    })->name('dashboard');
});

Route::middleware(['auth', 'role:teacher', \App\Http\Middleware\HandleMultiTenancy::class])->prefix('teacher')->name('teacher.')->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Teacher/Dashboard');
    })->name('dashboard');
});

Route::middleware(['auth', 'role:student', \App\Http\Middleware\HandleMultiTenancy::class])->prefix('student')->name('student.')->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Student/Dashboard');
    })->name('dashboard');
});

Route::middleware(['auth', 'role:parent', \App\Http\Middleware\HandleMultiTenancy::class])->prefix('parent')->name('parent.')->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Parent/Dashboard');
    })->name('dashboard');
});

// Academic Management Routes
Route::middleware(['auth', 'role:school_admin,headteacher,teacher,academic_master', \App\Http\Middleware\HandleMultiTenancy::class])->prefix('academic')->name('academic.')->group(function () {
    
    // Class Schedule Routes
    Route::get('/classes/schedule', [AcademicController::class, 'classSchedule'])->name('classes.schedule');
    Route::post('/classes/schedule', [AcademicController::class, 'storeClassSchedule'])->name('classes.schedule.store');
    Route::put('/classes/schedule/{id}', [AcademicController::class, 'updateClassSchedule'])->name('classes.schedule.update');
    Route::delete('/classes/schedule/{id}', [AcademicController::class, 'destroyClassSchedule'])->name('classes.schedule.destroy');

    // Academic Management
    Route::get('/curriculum', [CurriculumController::class, 'index'])->name('curriculum');
    Route::get('/curriculum/create', [CurriculumController::class, 'create'])->name('curriculum.create');
    Route::post('/curriculum', [CurriculumController::class, 'store'])->name('curriculum.store');
    Route::get('/curriculum/{id}', [CurriculumController::class, 'show'])->name('curriculum.show');
    Route::get('/curriculum/{id}/edit', [CurriculumController::class, 'edit'])->name('curriculum.edit');
    Route::put('/curriculum/{id}', [CurriculumController::class, 'update'])->name('curriculum.update');
    Route::delete('/curriculum/{id}', [CurriculumController::class, 'destroy'])->name('curriculum.destroy');
    // Timetable Management Routes
    Route::get('/timetable', [TimetableController::class, 'index'])->name('timetable');
    Route::get('/timetable/create', [TimetableController::class, 'create'])->name('timetable.create');
    Route::post('/timetable', [TimetableController::class, 'store'])->name('timetable.store');
    Route::get('/timetable/{timetable}', [TimetableController::class, 'show'])->name('timetable.show');
    Route::get('/timetable/{timetable}/edit', [TimetableController::class, 'edit'])->name('timetable.edit');
    Route::put('/timetable/{timetable}', [TimetableController::class, 'update'])->name('timetable.update');
    Route::delete('/timetable/{timetable}', [TimetableController::class, 'destroy'])->name('timetable.destroy');
    Route::get('/timetable/conflicts', [TimetableController::class, 'conflicts'])->name('timetable.conflicts');

    // Class Routine Routes
    Route::get('/class-routine', [AcademicController::class, 'classRoutine'])->name('class-routine');
    Route::post('/class-routine', [AcademicController::class, 'storeClassRoutine'])->name('class-routine.store');
    Route::put('/class-routine/{id}', [AcademicController::class, 'updateClassRoutine'])->name('class-routine.update');
    Route::delete('/class-routine/{id}', [AcademicController::class, 'destroyClassRoutine'])->name('class-routine.destroy');

    // Assessment Management Routes
    Route::get('/assessments', [AssessmentController::class, 'index'])->name('assessments');
    Route::get('/assessments/create', [AssessmentController::class, 'create'])->name('assessments.create');
    Route::post('/assessments', [AssessmentController::class, 'store'])->name('assessments.store');
    Route::get('/assessments/{assessment}', [AssessmentController::class, 'show'])->name('assessments.show');
    Route::get('/assessments/{assessment}/edit', [AssessmentController::class, 'edit'])->name('assessments.edit');
    Route::put('/assessments/{assessment}', [AssessmentController::class, 'update'])->name('assessments.update');
    Route::delete('/assessments/{assessment}', [AssessmentController::class, 'destroy'])->name('assessments.destroy');
    Route::post('/assessments/{assessment}/toggle-publish', [AssessmentController::class, 'togglePublish'])->name('assessments.toggle-publish');
    Route::get('/assessments/{assessment}/grade', [AssessmentController::class, 'gradeResults'])->name('assessments.grade');
    Route::post('/assessments/{assessment}/grade', [AssessmentController::class, 'storeGradeResults'])->name('assessments.grade.store');
    Route::get('/assessments/{assessment}/statistics', [AssessmentController::class, 'statistics'])->name('assessments.statistics');
    Route::get('/report-cards', [AcademicController::class, 'reportCards'])->name('report-cards');
    // Examination Management Routes
    Route::get('/exam-results', [AcademicController::class, 'examResults'])->name('exam-results');
    Route::get('/examinations/analytics', [AcademicController::class, 'examAnalytics'])->name('examinations.analytics');
    Route::get('/examinations/routine', [AcademicController::class, 'examRoutine'])->name('examinations.routine');
    Route::get('/examinations', [AcademicController::class, 'examinations'])->name('examinations');
    Route::get('/examinations/create', [AcademicController::class, 'createExamination'])->name('examinations.create');
    Route::post('/examinations', [AcademicController::class, 'storeExamination'])->name('examinations.store');
    Route::get('/examinations/{examination}', [AcademicController::class, 'showExamination'])->name('examinations.show');
    Route::get('/examinations/{examination}/edit', [AcademicController::class, 'editExamination'])->name('examinations.edit');
    Route::put('/examinations/{examination}', [AcademicController::class, 'updateExamination'])->name('examinations.update');
    Route::delete('/examinations/{examination}', [AcademicController::class, 'destroyExamination'])->name('examinations.destroy');
    
    // Classes CRUD
    Route::get('/classes', [AcademicController::class, 'classes'])->name('classes');
    Route::get('/classes/create', [AcademicController::class, 'createClass'])->name('classes.create');
    Route::post('/classes', [AcademicController::class, 'storeClass'])->name('classes.store');
    Route::post('/classes/levels', [AcademicController::class, 'saveClassLevels'])->name('classes.levels.save');
    Route::get('/classes/{class}', [AcademicController::class, 'showClass'])->name('classes.show');
    Route::get('/classes/{class}/edit', [AcademicController::class, 'editClass'])->name('classes.edit');
    Route::put('/classes/{class}', [AcademicController::class, 'updateClass'])->name('classes.update');
    Route::delete('/classes/{class}', [AcademicController::class, 'destroyClass'])->name('classes.destroy');
    
    // Sections CRUD
    Route::get('/sections', [AcademicController::class, 'sections'])->name('sections');
    Route::post('/sections', [AcademicController::class, 'storeSection'])->name('sections.store');
    Route::put('/sections/{id}', [AcademicController::class, 'updateSection'])->name('sections.update');
    Route::delete('/sections/{id}', [AcademicController::class, 'destroySection'])->name('sections.destroy');
    
    // Subjects CRUD
    Route::get('/subjects', [AcademicController::class, 'subjects'])->name('subjects');
    Route::get('/subjects/create', [AcademicController::class, 'createSubject'])->name('subjects.create');
    Route::post('/subjects', [AcademicController::class, 'storeSubject'])->name('subjects.store');
    Route::get('/subjects/{subject}', [AcademicController::class, 'showSubject'])->name('subjects.show');
    Route::get('/subjects/{subject}/edit', [AcademicController::class, 'editSubject'])->name('subjects.edit');
    Route::put('/subjects/{subject}', [AcademicController::class, 'updateSubject'])->name('subjects.update');
    Route::delete('/subjects/{subject}', [AcademicController::class, 'destroySubject'])->name('subjects.destroy');
    
    // Optional/Elective Subjects Allocation
    Route::get('/subjects/set-optional', [AcademicController::class, 'setOptional'])->name('subjects.set-optional');
    Route::get('/subjects/student-info', [AcademicController::class, 'getStudentOptionalInfo'])->name('subjects.student-info');
    Route::post('/subjects/set-optional', [AcademicController::class, 'storeOptional'])->name('subjects.set-optional.store');
    
    // Grading Scales CRUD
    Route::get('/grading-scales', [AcademicController::class, 'gradingScales'])->name('grading-scales');
    Route::get('/grading-scales/create', [AcademicController::class, 'createGradingScale'])->name('grading-scales.create');
    Route::post('/grading-scales', [AcademicController::class, 'storeGradingScale'])->name('grading-scales.store');
    Route::get('/grading-scales/{scale}/edit', [AcademicController::class, 'editGradingScale'])->name('grading-scales.edit');
    Route::put('/grading-scales/{scale}', [AcademicController::class, 'updateGradingScale'])->name('grading-scales.update');
    Route::delete('/grading-scales/{scale}', [AcademicController::class, 'destroyGradingScale'])->name('grading-scales.destroy');

    // Exam Attendance Tracking
    Route::get('/examinations/{examination}/attendance', [AcademicController::class, 'examAttendance'])->name('examinations.attendance');
    Route::post('/examinations/{examination}/attendance', [AcademicController::class, 'storeExamAttendance'])->name('examinations.attendance.store');

    // Marks Entry
    Route::get('/marks-entry', [AcademicController::class, 'marksEntry'])->name('marks-entry');
    Route::get('/marks-entry/input', [AcademicController::class, 'inputMarks'])->name('marks-entry.input');
    Route::post('/marks-entry', [AcademicController::class, 'storeMarks'])->name('marks-entry.store');

    // Results Verification & Approvals
    Route::get('/results-approvals', [AcademicController::class, 'resultsApprovals'])->name('results-approvals');
    Route::get('/results-approvals/{submission}', [AcademicController::class, 'showResultsApproval'])->name('results-approvals.show');
    Route::post('/results-approvals/{submission}/approve', [AcademicController::class, 'approveResults'])->name('results-approvals.approve');
    Route::post('/results-approvals/{submission}/reject', [AcademicController::class, 'rejectResults'])->name('results-approvals.reject');

    // Results Publishing & Report Card Show
    Route::get('/report-cards/{studentId}/{termId}', [AcademicController::class, 'showReportCard'])->name('report-cards.show');
    Route::post('/examinations/{examination}/publish', [AcademicController::class, 'publishExaminationResults'])->name('examinations.publish');

    // Room Management CRUD
    Route::resource('/rooms', RoomController::class);

    // Sitting Plan Routes
    Route::prefix('sitting-plans')->name('sitting-plans.')->group(function () {
        Route::get('/', [SittingPlanController::class, 'index'])->name('index');
        Route::get('/generator', [SittingPlanController::class, 'generator'])->name('generator');
        Route::get('/generator-data', [SittingPlanController::class, 'getGeneratorData'])->name('generator-data');
        Route::post('/generate', [SittingPlanController::class, 'generate'])->name('generate');
        Route::get('/allocations', [SittingPlanController::class, 'index'])->name('allocations');
        Route::get('/student', [SittingPlanController::class, 'studentSittingPlan'])->name('student');
        Route::get('/candidate-list', [SittingPlanController::class, 'candidateList'])->name('candidate-list');
        Route::get('/invigilators', [SittingPlanController::class, 'invigilators'])->name('invigilators');
        Route::post('/invigilators', [SittingPlanController::class, 'storeInvigilator'])->name('invigilators.store');
        Route::get('/attendance-sheets', [SittingPlanController::class, 'attendanceSheets'])->name('attendance-sheets');
        Route::post('/attendance-sheets/mark', [SittingPlanController::class, 'markAttendance'])->name('attendance-sheets.mark');
        Route::get('/reports', [SittingPlanController::class, 'reports'])->name('reports');
        
        Route::get('/{examSession}', [SittingPlanController::class, 'show'])->name('show');
        Route::post('/{examSession}/save', [SittingPlanController::class, 'savePlan'])->name('save');
        Route::post('/{examSession}/update-seat', [SittingPlanController::class, 'updateSeat'])->name('update-seat');
        Route::post('/{examSession}/auto-arrange', [SittingPlanController::class, 'autoArrange'])->name('auto-arrange');
    });

});


// System Configuration Routes
Route::middleware(['auth', 'role:super_admin,school_admin,headteacher', \App\Http\Middleware\HandleMultiTenancy::class])->prefix('system')->name('system.')->group(function () {
    
    // System Configuration
    Route::get('/configurations', [ConfigurationController::class, 'index'])->name('configurations.index');
    Route::post('/configurations/update', [ConfigurationController::class, 'update'])->name('configurations.update');
    Route::post('/configurations/reset', [ConfigurationController::class, 'reset'])->name('configurations.reset');
    Route::get('/configurations/export', [ConfigurationController::class, 'export'])->name('configurations.export');
    Route::post('/configurations/import', [ConfigurationController::class, 'import'])->name('configurations.import');
    
    // User Roles Management
    Route::resource('roles', RoleController::class);
    Route::post('/roles/{role}/permissions', [RoleController::class, 'assignPermissions'])->name('roles.permissions');
    Route::post('/roles/{role}/users', [RoleController::class, 'assignUsers'])->name('roles.users');
    
    // Permissions Management
    Route::resource('permissions', PermissionController::class)->only(['index', 'show']);
    
    // School Configuration
    Route::get('/school-configurations', [SchoolConfigurationController::class, 'index'])->name('school-configurations.index');
    Route::post('/school-configurations', [SchoolConfigurationController::class, 'store'])->name('school-configurations.store');
    Route::patch('/school-configurations/{configuration}', [SchoolConfigurationController::class, 'update'])->name('school-configurations.update');
    Route::delete('/school-configurations/{configuration}', [SchoolConfigurationController::class, 'destroy'])->name('school-configurations.destroy');
    Route::post('/school-configurations/validate', [SchoolConfigurationController::class, 'validateConfigurations'])->name('school-configurations.validate');
    
    // Audit Logs
    Route::get('/audit-logs', [AuditLogController::class, 'index'])->name('audit-logs.index');
    Route::get('/audit-logs/{auditLog}', [AuditLogController::class, 'show'])->name('audit-logs.show');
    Route::post('/audit-logs/export', [AuditLogController::class, 'export'])->name('audit-logs.export');
    
    // Data Backups
    Route::get('/backups', [DataBackupController::class, 'index'])->name('backups.index');
    Route::post('/backups', [DataBackupController::class, 'store'])->name('backups.store');
    Route::get('/backups/{backup}/download', [DataBackupController::class, 'download'])->name('backups.download');
    Route::post('/backups/{backup}/restore', [DataBackupController::class, 'restore'])->name('backups.restore');
    Route::delete('/backups/{backup}', [DataBackupController::class, 'destroy'])->name('backups.destroy');
    
    // Holidays Management
    Route::resource('holidays', HolidayController::class);
    Route::post('/holidays/import-public', [HolidayController::class, 'importPublicHolidays'])->name('holidays.import-public');
    Route::post('/holidays/generate-recurring', [HolidayController::class, 'generateRecurringHolidays'])->name('holidays.generate-recurring');
    Route::post('/holidays/bulk-delete', [HolidayController::class, 'bulkDelete'])->name('holidays.bulk-delete');

});

Route::middleware(['auth', 'role:school_admin,headteacher', \App\Http\Middleware\HandleMultiTenancy::class])->prefix('id-cards')->name('id-cards.')->group(function () {

    Route::get('/', [\App\Http\Controllers\IDCardController::class, 'index'])->name('index');
    Route::get('/bulk', [\App\Http\Controllers\IDCardController::class, 'bulkGenerate'])->name('bulk');
    Route::get('/bulk/print', [\App\Http\Controllers\IDCardController::class, 'printBulk'])->name('print-bulk');
    Route::get('/{user}/generate', [\App\Http\Controllers\IDCardController::class, 'generate'])->name('generate');
    Route::get('/{user}/print', [\App\Http\Controllers\IDCardController::class, 'printSingle'])->name('print-single');

});
