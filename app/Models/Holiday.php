<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Holiday extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'name',
        'description',
        'holiday_type',
        'start_date',
        'end_date',
        'is_recurring',
        'recurrence_pattern',
        'is_public_holiday',
        'is_active',
        'created_by',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'is_recurring' => 'boolean',
        'is_public_holiday' => 'boolean',
        'is_active' => 'boolean',
    ];

    const HOLIDAY_TYPES = [
        'public' => 'Public Holiday',
        'academic' => 'Academic Holiday',
        'religious' => 'Religious Holiday',
        'cultural' => 'Cultural Holiday',
        'national' => 'National Holiday',
        'regional' => 'Regional Holiday',
        'school' => 'School Holiday',
        'term_break' => 'Term Break',
        'examination' => 'Examination Period',
        'maintenance' => 'Maintenance Day',
    ];

    const RECURRENCE_PATTERNS = [
        'none' => 'No Recurrence',
        'yearly' => 'Yearly',
        'monthly' => 'Monthly',
        'weekly' => 'Weekly',
        'custom' => 'Custom Pattern',
    ];

    // Tanzanian Public Holidays
    const TANZANIAN_PUBLIC_HOLIDAYS = [
        '01-01' => 'New Year\'s Day',
        '01-12' => 'Zanzibar Revolution Day',
        '04-07' => 'Karume Day',
        '04-26' => 'Union Day',
        '05-01' => 'Labour Day',
        '07-07' => 'Saba Saba Day',
        '08-08' => 'Nane Nane Day',
        '10-14' => 'Nyerere Day',
        '12-09' => 'Independence Day',
        '12-25' => 'Christmas Day',
        '12-26' => 'Boxing Day',
    ];

    // Relationships
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Scopes
    public function scopeForSchool($query, $schoolId)
    {
        return $query->where('school_id', $schoolId);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('holiday_type', $type);
    }

    public function scopePublicHolidays($query)
    {
        return $query->where('is_public_holiday', true);
    }

    public function scopeSchoolHolidays($query)
    {
        return $query->where('is_public_holiday', false);
    }

    public function scopeRecurring($query)
    {
        return $query->where('is_recurring', true);
    }

    public function scopeNonRecurring($query)
    {
        return $query->where('is_recurring', false);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeInDateRange($query, $startDate, $endDate)
    {
        return $query->where(function ($q) use ($startDate, $endDate) {
            $q->whereBetween('start_date', [$startDate, $endDate])
              ->orWhereBetween('end_date', [$startDate, $endDate])
              ->orWhere(function ($q2) use ($startDate, $endDate) {
                  $q2->where('start_date', '<=', $startDate)
                     ->where('end_date', '>=', $endDate);
              });
        });
    }

    public function scopeInYear($query, $year)
    {
        return $query->whereYear('start_date', $year)
            ->orWhereYear('end_date', $year);
    }

    public function scopeInMonth($query, $year, $month)
    {
        return $query->where(function ($q) use ($year, $month) {
            $q->whereYear('start_date', $year)->whereMonth('start_date', $month)
              ->orWhereYear('end_date', $year)->whereMonth('end_date', $month)
              ->orWhere(function ($q2) use ($year, $month) {
                  $q2->where('start_date', '<=', "{$year}-{$month}-01")
                     ->where('end_date', '>=', "{$year}-{$month}-31");
              });
        });
    }

    public function scopeUpcoming($query, $days = 30)
    {
        return $query->where('start_date', '>=', now())
            ->where('start_date', '<=', now()->addDays($days))
            ->orderBy('start_date');
    }

    // Accessors
    public function getHolidayTypeDisplayAttribute(): string
    {
        return self::HOLIDAY_TYPES[$this->holiday_type] ?? $this->holiday_type;
    }

    public function getRecurrencePatternDisplayAttribute(): string
    {
        return self::RECURRENCE_PATTERNS[$this->recurrence_pattern] ?? $this->recurrence_pattern;
    }

    public function getDurationAttribute(): int
    {
        return $this->start_date->diffInDays($this->end_date) + 1;
    }

    public function getIsMultiDayAttribute(): bool
    {
        return $this->duration > 1;
    }

    public function getIsTodayAttribute(): bool
    {
        $today = now()->toDateString();
        return $today >= $this->start_date->toDateString() && $today <= $this->end_date->toDateString();
    }

    public function getIsUpcomingAttribute(): bool
    {
        return $this->start_date->isFuture();
    }

    public function getIsPastAttribute(): bool
    {
        return $this->end_date->isPast();
    }

    public function getIsCurrentAttribute(): bool
    {
        return $this->start_date->isPast() && $this->end_date->isFuture();
    }

    public function getDaysUntilStartAttribute(): ?int
    {
        if ($this->start_date->isFuture()) {
            return now()->diffInDays($this->start_date, false);
        }
        
        return null;
    }

    public function getDaysUntilEndAttribute(): ?int
    {
        if ($this->end_date->isFuture()) {
            return now()->diffInDays($this->end_date, false);
        }
        
        return null;
    }

    // Methods
    public function isDateInHoliday($date): bool
    {
        $checkDate = is_string($date) ? \Carbon\Carbon::parse($date) : $date;
        
        return $checkDate->between($this->start_date, $this->end_date);
    }

    public function getHolidayDates(): array
    {
        $dates = [];
        $current = $this->start_date->copy();
        
        while ($current->lte($this->end_date)) {
            $dates[] = $current->copy();
            $current->addDay();
        }
        
        return $dates;
    }

    public function generateRecurringHolidays(int $years = 5): array
    {
        if (!$this->is_recurring) {
            return [];
        }

        $holidays = [];
        $currentYear = $this->start_date->year;
        
        for ($i = 1; $i <= $years; $i++) {
            $year = $currentYear + $i;
            
            switch ($this->recurrence_pattern) {
                case 'yearly':
                    $startDate = $this->start_date->copy()->year($year);
                    $endDate = $this->end_date->copy()->year($year);
                    break;
                    
                case 'monthly':
                    $startDate = $this->start_date->copy()->addMonths($i);
                    $endDate = $this->end_date->copy()->addMonths($i);
                    break;
                    
                case 'weekly':
                    $startDate = $this->start_date->copy()->addWeeks($i);
                    $endDate = $this->end_date->copy()->addWeeks($i);
                    break;
                    
                default:
                    continue 2;
            }
            
            $holidays[] = [
                'name' => $this->name,
                'description' => $this->description,
                'holiday_type' => $this->holiday_type,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'is_recurring' => false,
                'recurrence_pattern' => 'none',
                'is_public_holiday' => $this->is_public_holiday,
                'is_active' => true,
                'created_by' => $this->created_by,
            ];
        }
        
        return $holidays;
    }

    public static function createTanzanianPublicHolidays(int $schoolId, int $year, int $createdBy): array
    {
        $holidays = [];
        
        foreach (self::TANZANIAN_PUBLIC_HOLIDAYS as $date => $name) {
            $holidayDate = \Carbon\Carbon::createFromFormat('Y-m-d', "{$year}-{$date}");
            
            $holidays[] = self::create([
                'school_id' => $schoolId,
                'name' => $name,
                'description' => "Tanzanian public holiday - {$name}",
                'holiday_type' => 'public',
                'start_date' => $holidayDate,
                'end_date' => $holidayDate,
                'is_recurring' => true,
                'recurrence_pattern' => 'yearly',
                'is_public_holiday' => true,
                'is_active' => true,
                'created_by' => $createdBy,
            ]);
        }
        
        return $holidays;
    }

    public static function getHolidaysInDateRange(int $schoolId, $startDate, $endDate): \Illuminate\Database\Eloquent\Collection
    {
        return self::where('school_id', $schoolId)
            ->where('is_active', true)
            ->inDateRange($startDate, $endDate)
            ->orderBy('start_date')
            ->get();
    }

    public static function isHoliday(int $schoolId, $date): bool
    {
        $checkDate = is_string($date) ? \Carbon\Carbon::parse($date) : $date;
        
        return self::where('school_id', $schoolId)
            ->where('is_active', true)
            ->where('start_date', '<=', $checkDate)
            ->where('end_date', '>=', $checkDate)
            ->exists();
    }

    public static function getHolidayOnDate(int $schoolId, $date): ?self
    {
        $checkDate = is_string($date) ? \Carbon\Carbon::parse($date) : $date;
        
        return self::where('school_id', $schoolId)
            ->where('is_active', true)
            ->where('start_date', '<=', $checkDate)
            ->where('end_date', '>=', $checkDate)
            ->first();
    }

    public static function getUpcomingHolidays(int $schoolId, int $days = 30): \Illuminate\Database\Eloquent\Collection
    {
        return self::where('school_id', $schoolId)
            ->where('is_active', true)
            ->upcoming($days)
            ->get();
    }

    public static function getHolidayCalendar(int $schoolId, int $year): array
    {
        $holidays = self::where('school_id', $schoolId)
            ->where('is_active', true)
            ->inYear($year)
            ->orderBy('start_date')
            ->get();

        $calendar = [];
        
        foreach ($holidays as $holiday) {
            $current = $holiday->start_date->copy();
            
            while ($current->lte($holiday->end_date)) {
                $month = $current->format('Y-m');
                $day = $current->format('d');
                
                if (!isset($calendar[$month])) {
                    $calendar[$month] = [];
                }
                
                $calendar[$month][$day] = [
                    'name' => $holiday->name,
                    'type' => $holiday->holiday_type,
                    'is_public' => $holiday->is_public_holiday,
                ];
                
                $current->addDay();
            }
        }
        
        return $calendar;
    }

    public static function getHolidayStatistics(int $schoolId, int $year): array
    {
        $holidays = self::where('school_id', $schoolId)
            ->where('is_active', true)
            ->inYear($year)
            ->get();

        $totalHolidays = $holidays->count();
        $totalDays = $holidays->sum('duration');
        $publicHolidays = $holidays->where('is_public_holiday', true)->count();
        $schoolHolidays = $holidays->where('is_public_holiday', false)->count();
        
        $holidaysByType = $holidays->groupBy('holiday_type')->map->count();
        
        $longestHoliday = $holidays->sortByDesc('duration')->first();
        $shortestHoliday = $holidays->sortBy('duration')->first();

        return [
            'total_holidays' => $totalHolidays,
            'total_days' => $totalDays,
            'public_holidays' => $publicHolidays,
            'school_holidays' => $schoolHolidays,
            'holidays_by_type' => $holidaysByType,
            'longest_holiday' => $longestHoliday ? [
                'name' => $longestHoliday->name,
                'duration' => $longestHoliday->duration,
            ] : null,
            'shortest_holiday' => $shortestHoliday ? [
                'name' => $shortestHoliday->name,
                'duration' => $shortestHoliday->duration,
            ] : null,
            'year' => $year,
        ];
    }

    public static function getWorkingDaysInRange(int $schoolId, $startDate, $endDate): int
    {
        $start = is_string($startDate) ? \Carbon\Carbon::parse($startDate) : $startDate;
        $end = is_string($endDate) ? \Carbon\Carbon::parse($endDate) : $endDate;
        
        $workingDays = 0;
        $current = $start->copy();
        
        while ($current->lte($end)) {
            // Skip weekends (Saturday = 6, Sunday = 0)
            if ($current->dayOfWeek !== 0 && $current->dayOfWeek !== 6) {
                // Check if it's not a holiday
                if (!self::isHoliday($schoolId, $current)) {
                    $workingDays++;
                }
            }
            
            $current->addDay();
        }
        
        return $workingDays;
    }

    public static function getNextWorkingDay(int $schoolId, $date): \Carbon\Carbon
    {
        $checkDate = is_string($date) ? \Carbon\Carbon::parse($date) : $date;
        $nextDay = $checkDate->copy()->addDay();
        
        while (true) {
            // Skip weekends
            if ($nextDay->dayOfWeek === 0 || $nextDay->dayOfWeek === 6) {
                $nextDay->addDay();
                continue;
            }
            
            // Skip holidays
            if (self::isHoliday($schoolId, $nextDay)) {
                $nextDay->addDay();
                continue;
            }
            
            break;
        }
        
        return $nextDay;
    }
}



