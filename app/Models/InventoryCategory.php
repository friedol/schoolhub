<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InventoryCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'name',
        'description',
        'parent_id',
        'level',
        'is_active',
    ];

    protected $casts = [
        'level' => 'integer',
        'is_active' => 'boolean',
    ];

    // Category hierarchy constants
    const LEVEL_MAIN = 1;
    const LEVEL_SUB = 2;
    const LEVEL_SPECIFIC = 3;

    // Main category options
    const MAIN_CATEGORIES = [
        'stationery' => 'Stationery',
        'lab_equipment' => 'Lab Equipment',
        'sports_equipment' => 'Sports Equipment',
        'furniture' => 'Furniture',
        'it_equipment' => 'IT Equipment',
        'library_books' => 'Library Books',
        'uniforms' => 'Uniforms',
        'cleaning_supplies' => 'Cleaning Supplies',
        'medical_supplies' => 'Medical Supplies',
        'maintenance_tools' => 'Maintenance Tools',
    ];

    /**
     * Get the school that owns the category
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    /**
     * Get the parent category
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(InventoryCategory::class, 'parent_id');
    }

    /**
     * Get child categories
     */
    public function children(): HasMany
    {
        return $this->hasMany(InventoryCategory::class, 'parent_id');
    }

    /**
     * Get all descendants (children, grandchildren, etc.)
     */
    public function descendants(): HasMany
    {
        return $this->children()->with('descendants');
    }

    /**
     * Get inventory items in this category
     */
    public function inventoryItems(): HasMany
    {
        return $this->hasMany(InventoryItem::class, 'category_id');
    }

    /**
     * Get the full category path (e.g., "Furniture > Classroom Furniture > Student Desk")
     */
    public function getFullPathAttribute(): string
    {
        $path = [$this->name];
        $parent = $this->parent;
        
        while ($parent) {
            array_unshift($path, $parent->name);
            $parent = $parent->parent;
        }
        
        return implode(' > ', $path);
    }

    /**
     * Scope to get main categories only
     */
    public function scopeMainCategories($query)
    {
        return $query->where('level', self::LEVEL_MAIN);
    }

    /**
     * Scope to get sub categories only
     */
    public function scopeSubCategories($query)
    {
        return $query->where('level', self::LEVEL_SUB);
    }

    /**
     * Scope to get specific categories only
     */
    public function scopeSpecificCategories($query)
    {
        return $query->where('level', self::LEVEL_SPECIFIC);
    }

    /**
     * Scope to get active categories only
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}



