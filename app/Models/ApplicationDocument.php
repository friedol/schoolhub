<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApplicationDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_application_id',
        'document_type',
        'file_path',
        'file_name',
        'file_size',
        'mime_type',
        'is_verified',
        'verified_by',
        'verified_at',
        'notes',
    ];

    protected $casts = [
        'is_verified' => 'boolean',
        'verified_at' => 'datetime',
        'file_size' => 'integer',
    ];

    const DOCUMENT_TYPE_BIRTH_CERTIFICATE = 'birth_certificate';
    const DOCUMENT_TYPE_PASSPORT_PHOTO = 'passport_photo';
    const DOCUMENT_TYPE_REPORT_CARD = 'report_card';
    const DOCUMENT_TYPE_TRANSFER_CERTIFICATE = 'transfer_certificate';
    const DOCUMENT_TYPE_MEDICAL_RECORDS = 'medical_records';
    const DOCUMENT_TYPE_VACCINATION_RECORDS = 'vaccination_records';
    const DOCUMENT_TYPE_OTHER = 'other';

    /**
     * Get the student application this document belongs to
     */
    public function studentApplication(): BelongsTo
    {
        return $this->belongsTo(StudentApplication::class);
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
     * Get document type display name
     */
    public function getDocumentTypeDisplayAttribute(): string
    {
        return match($this->document_type) {
            self::DOCUMENT_TYPE_BIRTH_CERTIFICATE => 'Birth Certificate',
            self::DOCUMENT_TYPE_PASSPORT_PHOTO => 'Passport Photo',
            self::DOCUMENT_TYPE_REPORT_CARD => 'Report Card',
            self::DOCUMENT_TYPE_TRANSFER_CERTIFICATE => 'Transfer Certificate',
            self::DOCUMENT_TYPE_MEDICAL_RECORDS => 'Medical Records',
            self::DOCUMENT_TYPE_VACCINATION_RECORDS => 'Vaccination Records',
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



