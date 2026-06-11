<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Book extends Model
{
    use HasFactory;

    // Subject category options
    const SUBJECT_CATEGORY_OPTIONS = [
        'fiction' => 'Fiction',
        'non_fiction' => 'Non-Fiction',
        'science' => 'Science',
        'mathematics' => 'Mathematics',
        'history' => 'History',
        'kiswahili_literature' => 'Kiswahili Literature',
        'english_literature' => 'English Literature',
        'reference' => 'Reference',
    ];

    // Target audience options
    const TARGET_AUDIENCE_OPTIONS = [
        'pre_primary' => 'Pre-Primary',
        'lower_primary' => 'Lower Primary',
        'upper_primary' => 'Upper Primary',
        'o_level' => 'O-Level',
        'a_level' => 'A-Level',
        'teacher_reference' => 'Teacher Reference',
    ];

    // Language options
    const LANGUAGE_OPTIONS = [
        'english' => 'English',
        'kiswahili' => 'Kiswahili',
        'bilingual' => 'Bilingual',
    ];

    // Book type options
    const BOOK_TYPE_OPTIONS = [
        'hardcover' => 'Hardcover',
        'paperback' => 'Paperback',
        'ebook' => 'E-Book',
        'audiobook' => 'Audiobook',
    ];

    protected $fillable = [
        'school_id',
        'accession_number',
        'title',
        'author',
        'publisher',
        'publication_year',
        'edition',
        'isbn',
        'issn',
        'dewey_decimal_number',
        'library_of_congress_number',
        'subject_category',
        'target_audience',
        'language',
        'number_of_pages',
        'book_type',
        'acquisition_date',
        'cost',
        'supplier',
        'shelf_location',
        'cover_image_path',
        'description',
        'keywords',
        'is_active',
        'created_by',
    ];

    protected $casts = [
        'publication_year' => 'integer',
        'number_of_pages' => 'integer',
        'cost' => 'decimal:2',
        'acquisition_date' => 'date',
        'keywords' => 'array',
        'is_active' => 'boolean',
    ];

    const SUBJECT_CATEGORY_FICTION = 'fiction';
    const SUBJECT_CATEGORY_NON_FICTION = 'non_fiction';
    const SUBJECT_CATEGORY_SCIENCE = 'science';
    const SUBJECT_CATEGORY_MATHEMATICS = 'mathematics';
    const SUBJECT_CATEGORY_HISTORY = 'history';
    const SUBJECT_CATEGORY_KISWAHILI_LITERATURE = 'kiswahili_literature';
    const SUBJECT_CATEGORY_ENGLISH_LITERATURE = 'english_literature';
    const SUBJECT_CATEGORY_REFERENCE = 'reference';
    const SUBJECT_CATEGORY_GEOGRAPHY = 'geography';
    const SUBJECT_CATEGORY_BIOLOGY = 'biology';
    const SUBJECT_CATEGORY_CHEMISTRY = 'chemistry';
    const SUBJECT_CATEGORY_PHYSICS = 'physics';
    const SUBJECT_CATEGORY_OTHER = 'other';

    const TARGET_AUDIENCE_PRE_PRIMARY = 'pre_primary';
    const TARGET_AUDIENCE_LOWER_PRIMARY = 'lower_primary';
    const TARGET_AUDIENCE_UPPER_PRIMARY = 'upper_primary';
    const TARGET_AUDIENCE_O_LEVEL = 'o_level';
    const TARGET_AUDIENCE_A_LEVEL = 'a_level';
    const TARGET_AUDIENCE_TEACHER_REFERENCE = 'teacher_reference';
    const TARGET_AUDIENCE_GENERAL = 'general';

    const BOOK_TYPE_HARDCOVER = 'hardcover';
    const BOOK_TYPE_PAPERBACK = 'paperback';
    const BOOK_TYPE_EBOOK = 'ebook';
    const BOOK_TYPE_AUDIOBOOK = 'audiobook';

    const LANGUAGE_ENGLISH = 'english';
    const LANGUAGE_KISWAHILI = 'kiswahili';
    const LANGUAGE_ARABIC = 'arabic';
    const LANGUAGE_FRENCH = 'french';
    const LANGUAGE_OTHER = 'other';

    /**
     * Get the school this book belongs to
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    /**
     * Get the user who created this book record
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get book copies
     */
    public function copies(): HasMany
    {
        return $this->hasMany(BookCopy::class);
    }

    /**
     * Get book issuances
     */
    public function issuances(): HasMany
    {
        return $this->hasMany(BookIssuance::class);
    }

    /**
     * Get book reservations
     */
    public function reservations(): HasMany
    {
        return $this->hasMany(BookReservation::class);
    }

    /**
     * Get subject category display name
     */
    public function getSubjectCategoryDisplayAttribute(): string
    {
        return match($this->subject_category) {
            self::SUBJECT_CATEGORY_FICTION => 'Fiction',
            self::SUBJECT_CATEGORY_NON_FICTION => 'Non-Fiction',
            self::SUBJECT_CATEGORY_SCIENCE => 'Science',
            self::SUBJECT_CATEGORY_MATHEMATICS => 'Mathematics',
            self::SUBJECT_CATEGORY_HISTORY => 'History',
            self::SUBJECT_CATEGORY_KISWAHILI_LITERATURE => 'Kiswahili Literature',
            self::SUBJECT_CATEGORY_ENGLISH_LITERATURE => 'English Literature',
            self::SUBJECT_CATEGORY_REFERENCE => 'Reference',
            self::SUBJECT_CATEGORY_GEOGRAPHY => 'Geography',
            self::SUBJECT_CATEGORY_BIOLOGY => 'Biology',
            self::SUBJECT_CATEGORY_CHEMISTRY => 'Chemistry',
            self::SUBJECT_CATEGORY_PHYSICS => 'Physics',
            self::SUBJECT_CATEGORY_OTHER => 'Other',
            default => 'Unknown'
        };
    }

    /**
     * Get target audience display name
     */
    public function getTargetAudienceDisplayAttribute(): string
    {
        return match($this->target_audience) {
            self::TARGET_AUDIENCE_PRE_PRIMARY => 'Pre-Primary',
            self::TARGET_AUDIENCE_LOWER_PRIMARY => 'Lower Primary',
            self::TARGET_AUDIENCE_UPPER_PRIMARY => 'Upper Primary',
            self::TARGET_AUDIENCE_O_LEVEL => 'O-Level',
            self::TARGET_AUDIENCE_A_LEVEL => 'A-Level',
            self::TARGET_AUDIENCE_TEACHER_REFERENCE => 'Teacher Reference',
            self::TARGET_AUDIENCE_GENERAL => 'General',
            default => 'Unknown'
        };
    }

    /**
     * Get book type display name
     */
    public function getBookTypeDisplayAttribute(): string
    {
        return match($this->book_type) {
            self::BOOK_TYPE_HARDCOVER => 'Hardcover',
            self::BOOK_TYPE_PAPERBACK => 'Paperback',
            self::BOOK_TYPE_EBOOK => 'E-Book',
            self::BOOK_TYPE_AUDIOBOOK => 'Audiobook',
            default => 'Unknown'
        };
    }

    /**
     * Get language display name
     */
    public function getLanguageDisplayAttribute(): string
    {
        return match($this->language) {
            self::LANGUAGE_ENGLISH => 'English',
            self::LANGUAGE_KISWAHILI => 'Kiswahili',
            self::LANGUAGE_ARABIC => 'Arabic',
            self::LANGUAGE_FRENCH => 'French',
            self::LANGUAGE_OTHER => 'Other',
            default => 'Unknown'
        };
    }

    /**
     * Get total copies count
     */
    public function getTotalCopiesAttribute(): int
    {
        return $this->copies()->count();
    }

    /**
     * Get available copies count
     */
    public function getAvailableCopiesAttribute(): int
    {
        return $this->copies()->where('status', BookCopy::STATUS_AVAILABLE)->count();
    }

    /**
     * Get issued copies count
     */
    public function getIssuedCopiesAttribute(): int
    {
        return $this->copies()->where('status', BookCopy::STATUS_ISSUED)->count();
    }

    /**
     * Check if book is available
     */
    public function isAvailable(): bool
    {
        return $this->available_copies > 0;
    }

    /**
     * Generate unique accession number
     */
    public static function generateAccessionNumber(): string
    {
        $year = date('Y');
        $lastBook = self::whereYear('created_at', $year)
            ->orderBy('id', 'desc')
            ->first();
        
        $sequence = $lastBook ? (intval(substr($lastBook->accession_number, -3)) + 1) : 1;
        
        return 'ACC-' . $year . '-' . str_pad($sequence, 3, '0', STR_PAD_LEFT);
    }

    /**
     * Get availability status
     */
    public function getAvailabilityStatusAttribute(): string
    {
        if ($this->available_copies > 0) {
            return 'Available';
        } elseif ($this->issued_copies > 0) {
            return 'Issued';
        } else {
            return 'Unavailable';
        }
    }
}