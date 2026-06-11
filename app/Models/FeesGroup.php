<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FeesGroup extends Model
{
    protected $table = 'fees_groups';

    protected $fillable = ['school_id', 'name', 'description', 'is_active'];

    protected $casts = ['is_active' => 'boolean'];

    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    public function feesTypes(): HasMany
    {
        return $this->hasMany(FeesType::class, 'fees_group_id');
    }

    public function feesMasters(): HasMany
    {
        return $this->hasMany(FeesMaster::class, 'fees_group_id');
    }
}
