<?php

use App\Http\Controllers\SuperAdmin\PlatformController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'role:super_admin'])->prefix('super-admin')->name('super-admin.')->group(function () {
    
    // Dashboard
    Route::get('/dashboard', [PlatformController::class, 'dashboard'])->name('dashboard');
    
    // Schools Management
    Route::get('/schools', [PlatformController::class, 'schools'])->name('schools');
    Route::get('/schools/create', [PlatformController::class, 'createSchool'])->name('schools.create');
    Route::post('/schools', [PlatformController::class, 'storeSchool'])->name('schools.store');
    Route::get('/schools/{school}', [PlatformController::class, 'showSchool'])->name('schools.show');
    Route::get('/schools/{school}/edit', [PlatformController::class, 'editSchool'])->name('schools.edit');
    Route::patch('/schools/{school}', [PlatformController::class, 'updateSchool'])->name('schools.update');
    Route::patch('/schools/{school}/toggle-status', [PlatformController::class, 'toggleSchoolStatus'])->name('schools.toggle-status');
    
    // Analytics
    Route::get('/analytics', [PlatformController::class, 'analytics'])->name('analytics');
    
    // Platform Settings
    Route::get('/settings', [PlatformController::class, 'settings'])->name('settings');
    Route::patch('/settings', [PlatformController::class, 'updateSettings'])->name('settings.update');
    
});
