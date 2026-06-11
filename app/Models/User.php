<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasOneThrough;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use App\Models\Scopes\SchoolScope;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'role',
        'school_id',
        'platform_id',
        'student_number',
        'parent_id',
        'date_of_birth',
        'gender',
        'address',
        'profile_photo',
        'is_active',
        'last_login_at',
        'language_preference',
        'settings',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'date_of_birth' => 'date',
            'is_active' => 'boolean',
            'last_login_at' => 'datetime',
            'settings' => 'array',
        ];
    }

    /**
     * Apply global scopes when the model boots.
     * SchoolScope ensures every query is automatically limited
     * to the authenticated user's school_id.
     */
    protected static function booted(): void
    {
        static::addGlobalScope(new SchoolScope());
    }

    /**
     * Get the school this user belongs to
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    /**
     * Get the platform this user belongs to (for super admins)
     */
    public function platform(): BelongsTo
    {
        return $this->belongsTo(Platform::class);
    }

    /**
     * Get the parent of this user (for students)
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(User::class, 'parent_id');
    }

    /**
     * Get the children of this user (for parents)
     */
    public function children(): HasMany
    {
        return $this->hasMany(User::class, 'parent_id');
    }

    /**
     * Get user roles
     */
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'user_roles');
    }

    /**
     * Get user permissions
     */
    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(Permission::class, 'user_permissions');
    }

    /**
     * Get the subject combination (for A-Level students)
     */
    public function subjectCombination(): BelongsTo
    {
        return $this->belongsTo(SubjectCombination::class);
    }

    /**
     * Get student guardians
     */
    public function guardians(): HasMany
    {
        return $this->hasMany(StudentGuardian::class, 'student_id');
    }

    /**
     * Get student medical records
     */
    public function medicalRecords(): HasMany
    {
        return $this->hasMany(StudentMedicalRecord::class, 'student_id');
    }

    /**
     * Get student disciplinary records
     */
    public function disciplinaryRecords(): HasMany
    {
        return $this->hasMany(StudentDisciplinaryRecord::class, 'student_id');
    }

    /**
     * Get student promotions
     */
    public function promotions(): HasMany
    {
        return $this->hasMany(Promotion::class, 'student_id');
    }

    /**
     * Get student graduation record
     */
    public function graduation(): HasOne
    {
        return $this->hasOne(Graduation::class, 'student_id');
    }

    /**
     * Get alumni record
     */
    public function alumni(): HasOne
    {
        return $this->hasOne(Alumni::class, 'student_id');
    }

    /**
     * Get the class this teacher is assigned to as class teacher
     */
    public function assignedClass(): HasOne
    {
        return $this->hasOne(SchoolClass::class, 'class_teacher_id');
    }

    /**
     * Get staff profile
     */
    public function staffProfile(): HasOne
    {
        return $this->hasOne(StaffProfile::class, 'user_id');
    }

    /**
     * Get the class teacher is assigned to (currentClass)
     */
    public function currentClass()
    {
        if ($this->role === 'teacher' || $this->role === 'headteacher' || $this->role === 'academic_master') {
            return $this->assignedClass();
        }
        return $this->class();
    }

    /**
     * Get subjects teacher is assigned to
     */
    public function subjects(): BelongsToMany
    {
        return $this->belongsToMany(Subject::class, 'subject_teachers', 'teacher_id', 'subject_id')
            ->withPivot(['school_class_id', 'academic_year', 'is_primary_teacher', 'is_active'])
            ->withTimestamps();
    }

    /**
     * Get class student belongs to
     */
    public function class(): HasOneThrough
    {
        return $this->hasOneThrough(
            SchoolClass::class,
            StudentProfile::class,
            'student_id',
            'id',
            'id',
            'class_id'
        );
    }

    /**
     * Get student profile
     */
    public function studentProfile(): HasOne
    {
        return $this->hasOne(StudentProfile::class, 'student_id');
    }

    /**
     * Get staff qualifications
     */
    public function qualifications(): HasMany
    {
        return $this->hasMany(StaffQualification::class, 'staff_id');
    }

    /**
     * Get staff documents
     */
    public function documents(): HasMany
    {
        return $this->hasMany(StaffDocument::class, 'staff_id');
    }

    /**
     * Get salary structure
     */
    public function salaryStructure(): BelongsTo
    {
        return $this->belongsTo(SalaryStructure::class);
    }

    /**
     * Get payroll records
     */
    public function payrollRecords(): HasMany
    {
        return $this->hasMany(PayrollRecord::class, 'staff_id');
    }

    /**
     * Get payslips
     */
    public function payslips(): HasMany
    {
        return $this->hasMany(Payslip::class, 'staff_id');
    }

    /**
     * Get leave applications
     */
    public function leaveApplications(): HasMany
    {
        return $this->hasMany(LeaveApplication::class, 'staff_id');
    }

    /**
     * Get performance appraisals as staff
     */
    public function performanceAppraisals(): HasMany
    {
        return $this->hasMany(PerformanceAppraisal::class, 'staff_id');
    }

    /**
     * Get performance appraisals as appraiser
     */
    public function appraisalsAsAppraiser(): HasMany
    {
        return $this->hasMany(PerformanceAppraisal::class, 'appraiser_id');
    }

    /**
     * Get staff attendance records
     */
    public function staffAttendance(): HasMany
    {
        return $this->hasMany(StaffAttendance::class, 'staff_id');
    }

    /**
     * Get student invoices
     */
    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class, 'student_id');
    }

    /**
     * Get student payments
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class, 'student_id');
    }

    /**
     * Get student receipts
     */
    public function receipts(): HasMany
    {
        return $this->hasMany(Receipt::class, 'student_id');
    }

    /**
     * Get student payment plans
     */
    public function paymentPlans(): HasMany
    {
        return $this->hasMany(PaymentPlan::class, 'student_id');
    }

    /**
     * Get book issuances as borrower
     */
    public function bookIssuances(): HasMany
    {
        return $this->hasMany(BookIssuance::class, 'borrower_id');
    }

    /**
     * Get book reservations as borrower
     */
    public function bookReservations(): HasMany
    {
        return $this->hasMany(BookReservation::class, 'borrower_id');
    }

    /**
     * Get library fines as borrower
     */
    public function libraryFines(): HasMany
    {
        return $this->hasMany(LibraryFine::class, 'borrower_id');
    }

    /**
     * Get library transactions as borrower
     */
    public function libraryTransactions(): HasMany
    {
        return $this->hasMany(LibraryTransaction::class, 'borrower_id');
    }

    /**
     * Check if user has a specific role
     */
    public function hasRole(string $role): bool
    {
        return $this->role === $role || $this->roles()->where('name', $role)->exists();
    }

    /**
     * Check if user has any of the given roles
     */
    public function hasAnyRole(array $roles): bool
    {
        return $this->roles()->whereIn('name', $roles)->exists() || in_array($this->role, $roles);
    }

    /**
     * Check if user has a specific permission
     */
    public function hasPermission(string $permission): bool
    {
        // Check direct permissions
        if ($this->permissions()->where('name', $permission)->exists()) {
            return true;
        }

        // Check role permissions
        foreach ($this->roles as $role) {
            if ($role->hasPermission($permission)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if user is a super admin
     */
    public function isSuperAdmin(): bool
    {
        return $this->role === 'super_admin';
    }

    /**
     * Check if user is a school admin
     */
    public function isSchoolAdmin(): bool
    {
        return in_array($this->role, ['school_admin', 'headteacher', 'bursar']);
    }

    /**
     * Check if user is a teacher
     */
    public function isTeacher(): bool
    {
        return $this->role === 'teacher';
    }

    /**
     * Check if user is a student
     */
    public function isStudent(): bool
    {
        return $this->role === 'student';
    }

    /**
     * Check if user is a parent
     */
    public function isParent(): bool
    {
        return $this->role === 'parent';
    }

    /**
     * Get user's full name with role
     */
    public function getFullNameWithRoleAttribute(): string
    {
        $roleDisplay = match ($this->role) {
            'super_admin' => 'Super Admin',
            'school_admin' => 'School Admin',
            'headteacher' => 'Headteacher',
            'bursar' => 'Bursar',
            'teacher' => 'Teacher',
            'student' => 'Student',
            'parent' => 'Parent',
            default => 'User'
        };

        return "{$this->name} ({$roleDisplay})";
    }

    /**
     * Get user's initials for avatar
     */
    public function getInitialsAttribute(): string
    {
        $names = explode(' ', $this->name);
        $initials = '';

        foreach ($names as $name) {
            if (!empty($name)) {
                $initials .= strtoupper($name[0]);
            }
        }

        return substr($initials, 0, 2);
    }

    /**
     * Scope to filter users by school
     */
    public function scopeForSchool($query, $schoolId)
    {
        return $query->where('school_id', $schoolId);
    }

    /**
     * Scope to filter users by platform
     */
    public function scopeForPlatform($query, $platformId)
    {
        return $query->where('platform_id', $platformId);
    }

    /**
     * Scope to filter users by role
     */
    public function scopeWithRole($query, $role)
    {
        return $query->where('role', $role);
    }

    /**
     * Get first name segment from full name
     */
    public function getFirstNameAttribute(): string
    {
        $parts = explode(' ', $this->name);
        return $parts[0] ?? '';
    }

    /**
     * Get last name segment from full name
     */
    public function getLastNameAttribute(): string
    {
        $parts = explode(' ', $this->name);
        array_shift($parts);
        return implode(' ', $parts) ?: '';
    }

    /**
     * Get the current school from request context
     */
    public static function getCurrentSchool(): ?School
    {
        $request = request();
        return $request->attributes->get('current_school');
    }
}
