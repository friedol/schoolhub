<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FeesType extends Model
{
    protected $table = 'fees_types';

    protected $fillable = ['school_id', 'fees_group_id', 'name', 'code', 'description', 'is_active'];

    protected $casts = ['is_active' => 'boolean'];

    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    public function feesGroup(): BelongsTo
    {
        return $this->belongsTo(FeesGroup::class, 'fees_group_id');
    }

    public function feesMasters(): HasMany
    {
        return $this->hasMany(FeesMaster::class, 'fees_type_id');
    }
}
