<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('books', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained()->onDelete('cascade');
            $table->string('accession_number')->unique();
            $table->string('title');
            $table->string('author');
            $table->string('publisher')->nullable();
            $table->integer('publication_year')->nullable();
            $table->string('edition')->nullable();
            $table->string('isbn')->nullable();
            $table->string('issn')->nullable();
            $table->string('dewey_decimal_number')->nullable();
            $table->string('library_of_congress_number')->nullable();
            $table->string('subject_category');
            $table->string('target_audience');
            $table->string('language')->default('english');
            $table->integer('number_of_pages')->nullable();
            $table->string('book_type')->default('paperback');
            $table->date('acquisition_date')->nullable();
            $table->decimal('cost', 10, 2)->nullable();
            $table->string('supplier')->nullable();
            $table->string('shelf_location')->nullable();
            $table->string('cover_image_path')->nullable();
            $table->text('description')->nullable();
            $table->json('keywords')->nullable();
            $table->boolean('is_active')->default(true);
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();

            $table->index(['school_id', 'is_active']);
            $table->index(['subject_category']);
            $table->index(['target_audience']);
            $table->index(['title', 'author']);
            $table->index(['isbn']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('books');
    }
};



