<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        $user = auth()->user();
        $currentSchool = \App\Models\User::getCurrentSchool();
        
        // Redirect based on user role and school context
        if ($user->isSuperAdmin()) {
            // Super admin can access platform level or specific school
            if ($currentSchool) {
                // If accessing a specific school, redirect to school admin dashboard
                return redirect()->route('school-admin.dashboard');
            } else {
                // Platform level access
                return redirect()->route('super-admin.dashboard');
            }
        } elseif ($user->isSchoolAdmin() || $user->isTeacher() || $user->isStudent() || $user->isParent()) {
            // School-level users
            return redirect()->route('school-admin.dashboard');
        } else {
            // Default dashboard
            return Inertia::render('dashboard');
        }
    })->name('dashboard');
});

// Include multi-tenant routes
require __DIR__.'/super-admin.php';
require __DIR__.'/school-admin.php';

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';

// Timetable Master API Routes
Route::middleware(['auth', \App\Http\Middleware\HandleMultiTenancy::class])->prefix('api')->group(function () {
    Route::get('/timetable/all/{term}', [App\Http\Controllers\Academic\TimetableController::class, 'getAllSlots']);
    Route::get('/timetable/{schoolType}/{classId}/{section}/{term}', [App\Http\Controllers\Academic\TimetableController::class, 'getTimetable']);
    Route::post('/timetable/update', [App\Http\Controllers\Academic\TimetableController::class, 'updateTimetable']);
    Route::get('/subjects/{schoolType}', [App\Http\Controllers\Academic\TimetableController::class, 'getSubjectsBySchoolType']);
    Route::get('/teachers', [App\Http\Controllers\Academic\TimetableController::class, 'getTeachers']);
    Route::get('/classes/{schoolType}', [App\Http\Controllers\Academic\TimetableController::class, 'getClassesBySchoolType']);
    Route::post('/subject-teachers/assign', [App\Http\Controllers\Academic\TimetableController::class, 'assignSubjectTeacher']);
});

