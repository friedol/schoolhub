<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StaffDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'staff_id',
        'document_type',
        'document_name',
        'file_path',
        'file_name',
        'file_size',
        'mime_type',
        'expiry_date',
        'is_verified',
        'verified_by',
        'verified_at',
        'notes',
    ];

    protected $casts = [
        'expiry_date' => 'date',
        'is_verified' => 'boolean',
        'verified_at' => 'datetime',
        'file_size' => 'integer',
    ];

    const DOCUMENT_TYPE_CV = 'cv';
    const DOCUMENT_TYPE_CONTRACT = 'contract';
    const DOCUMENT_TYPE_ID_COPY = 'id_copy';
    const DOCUMENT_TYPE_CERTIFICATE = 'certificate';
    const DOCUMENT_TYPE_TSC_CERTIFICATE = 'tsc_certificate';
    const DOCUMENT_TYPE_CRB_CLEARANCE = 'crb_clearance';
    const DOCUMENT_TYPE_MEDICAL_CERTIFICATE = 'medical_certificate';
    const DOCUMENT_TYPE_REFERENCE_LETTER = 'reference_letter';
    const DOCUMENT_TYPE_OTHER = 'other';

    /**
     * Get the staff member this document belongs to
     */
    public function staff(): BelongsTo
    {
        return $this->belongsTo(User::class, 'staff_id');
    }

    /**
     * Get the user who verified this document
     */
    public function verifiedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    /**
     * Check if document is verified
     */
    public function isVerified(): bool
    {
        return $this->is_verified;
    }

    /**
     * Check if document is expired
     */
    public function isExpired(): bool
    {
        return $this->expiry_date && $this->expiry_date->isPast();
    }

    /**
     * Check if document is expiring soon (within 30 days)
     */
    public function isExpiringSoon(): bool
    {
        return $this->expiry_date && $this->expiry_date->isFuture() && $this->expiry_date->diffInDays(now()) <= 30;
    }

    /**
     * Get document type display name
     */
    public function getDocumentTypeDisplayAttribute(): string
    {
        return match($this->document_type) {
            self::DOCUMENT_TYPE_CV => 'CV/Resume',
            self::DOCUMENT_TYPE_CONTRACT => 'Employment Contract',
            self::DOCUMENT_TYPE_ID_COPY => 'ID Copy',
            self::DOCUMENT_TYPE_CERTIFICATE => 'Academic Certificate',
            self::DOCUMENT_TYPE_TSC_CERTIFICATE => 'TSC Certificate',
            self::DOCUMENT_TYPE_CRB_CLEARANCE => 'CRB Clearance',
            self::DOCUMENT_TYPE_MEDICAL_CERTIFICATE => 'Medical Certificate',
            self::DOCUMENT_TYPE_REFERENCE_LETTER => 'Reference Letter',
            self::DOCUMENT_TYPE_OTHER => 'Other',
            default => 'Unknown'
        };
    }

    /**
     * Get file size in human readable format
     */
    public function getFileSizeHumanAttribute(): string
    {
        $bytes = $this->file_size;
        $units = ['B', 'KB', 'MB', 'GB'];
        
        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }
        
        return round($bytes, 2) . ' ' . $units[$i];
    }
}



