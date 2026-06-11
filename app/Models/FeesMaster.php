<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FeesMaster extends Model
{
    protected $table = 'fees_masters';

    protected $fillable = [
        'school_id', 'fees_group_id', 'fees_type_id',
        'due_date', 'amount', 'fine_type', 'fine_amount', 'is_active',
    ];

    protected $casts = [
        'is_active'   => 'boolean',
        'amount'      => 'decimal:2',
        'fine_amount' => 'decimal:2',
        'due_date'    => 'date',
    ];

    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    public function feesGroup(): BelongsTo
    {
        return $this->belongsTo(FeesGroup::class, 'fees_group_id');
    }

    public function feesType(): BelongsTo
    {
        return $this->belongsTo(FeesType::class, 'fees_type_id');
    }
}
