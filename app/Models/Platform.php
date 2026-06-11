<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Platform extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'domain',
        'logo',
        'contact_email',
        'contact_phone',
        'address',
        'region',
        'district',
        'is_active',
        'subscription_plan',
        'subscription_expires_at',
        'settings',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'subscription_expires_at' => 'datetime',
        'settings' => 'array',
    ];

    /**
     * Get all schools belonging to this platform
     */
    public function schools(): HasMany
    {
        return $this->hasMany(School::class);
    }

    /**
     * Get the platform super admin user
     */
    public function superAdmin()
    {
        return $this->hasOne(User::class)->where('role', 'super_admin');
    }

    /**
     * Get all users across all schools in this platform
     */
    public function allUsers()
    {
        return User::where('platform_id', $this->id);
    }

    /**
     * Generate a unique school code for this platform
     */
    public function generateSchoolCode(): string
    {
        $prefix = strtoupper(substr($this->name, 0, 3));
        
        do {
            $code = $prefix . '-' . str_pad(mt_rand(1, 9999), 4, '0', STR_PAD_LEFT);
        } while (School::where('code', $code)->exists());
        
        return $code;
    }

    /**
     * Get platform statistics
     */
    public function getStatistics(): array
    {
        $schools = $this->schools();
        
        return [
            'total_schools' => $schools->count(),
            'active_schools' => $schools->where('is_active', true)->count(),
            'total_students' => $this->allUsers()->where('role', 'student')->count(),
            'total_teachers' => $this->allUsers()->where('role', 'teacher')->count(),
            'total_parents' => $this->allUsers()->where('role', 'parent')->count(),
        ];
    }
}
