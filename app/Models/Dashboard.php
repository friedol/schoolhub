<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Dashboard extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'user_id',
        'name',
        'description',
        'role',
        'is_default',
        'is_public',
        'layout_config',
        'is_active',
    ];

    protected $casts = [
        'is_default' => 'boolean',
        'is_public' => 'boolean',
        'layout_config' => 'array',
        'is_active' => 'boolean',
    ];

    const ROLE_OPTIONS = [
        'super_admin' => 'Super Admin',
        'school_admin' => 'School Admin',
        'headteacher' => 'Headteacher',
        'teacher' => 'Teacher',
        'bursar' => 'Bursar',
        'librarian' => 'Librarian',
        'dormitory_manager' => 'Dormitory Manager',
        'academic_master' => 'Academic Master',
        'parent' => 'Parent',
        'student' => 'Student',
    ];

    // Relationships
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function widgets(): HasMany
    {
        return $this->hasMany(DashboardWidget::class);
    }

    public function shares(): HasMany
    {
        return $this->hasMany(DashboardShare::class);
    }

    // Scopes
    public function scopeForSchool($query, $schoolId)
    {
        return $query->where('school_id', $schoolId);
    }

    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeByRole($query, $role)
    {
        return $query->where('role', $role);
    }

    public function scopeDefault($query)
    {
        return $query->where('is_default', true);
    }

    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    // Accessors
    public function getRoleDisplayAttribute(): string
    {
        return self::ROLE_OPTIONS[$this->role] ?? $this->role;
    }

    public function getLayoutConfigAttribute($value): array
    {
        return json_decode($value, true) ?? [];
    }

    public function setLayoutConfigAttribute($value): void
    {
        $this->attributes['layout_config'] = json_encode($value);
    }

    // Methods
    public function addWidget(DashboardWidget $widget, array $position = null): void
    {
        $widget->update([
            'dashboard_id' => $this->id,
            'position' => $position ?? $this->getNextPosition(),
        ]);
    }

    public function removeWidget(DashboardWidget $widget): void
    {
        $widget->update(['dashboard_id' => null]);
    }

    public function getNextPosition(): array
    {
        $maxX = $this->widgets()->max('position->x') ?? 0;
        $maxY = $this->widgets()->max('position->y') ?? 0;
        
        return [
            'x' => $maxX + 1,
            'y' => $maxY + 1,
        ];
    }

    public function updateLayout(array $layout): void
    {
        $this->update(['layout_config' => $layout]);
    }

    public function canBeAccessedBy(User $user): bool
    {
        if ($this->is_public) {
            return true;
        }

        if ($this->user_id === $user->id) {
            return true;
        }

        return $this->shares()
            ->where('user_id', $user->id)
            ->exists();
    }

    public function shareWith(User $user, string $permission = 'view'): void
    {
        $this->shares()->updateOrCreate(
            ['user_id' => $user->id],
            ['permission' => $permission]
        );
    }

    public function unshareWith(User $user): void
    {
        $this->shares()->where('user_id', $user->id)->delete();
    }

    public function getSharedUsers()
    {
        return $this->shares()->with('user')->get();
    }

    public static function getDefaultForRole(string $role, int $schoolId): ?self
    {
        return self::where('school_id', $schoolId)
            ->where('role', $role)
            ->where('is_default', true)
            ->where('is_active', true)
            ->first();
    }

    public static function createDefaultForRole(string $role, int $schoolId, int $userId): self
    {
        return self::create([
            'school_id' => $schoolId,
            'user_id' => $userId,
            'name' => self::ROLE_OPTIONS[$role] . ' Dashboard',
            'description' => 'Default dashboard for ' . self::ROLE_OPTIONS[$role],
            'role' => $role,
            'is_default' => true,
            'is_public' => false,
            'layout_config' => [],
            'is_active' => true,
        ]);
    }
}



