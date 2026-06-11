<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Create school_types table
        if (!Schema::hasTable('school_types')) {
            Schema::create('school_types', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('code')->unique();
                $table->boolean('is_active')->default(true);
                $table->softDeletes();
                $table->timestamps();
            });
        }

        // Seed default school types immediately so they exist for subsequent foreign keys/data migration
        DB::table('school_types')->insertOrIgnore([
            [
                'name' => 'Primary School',
                'code' => 'primary',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Secondary/Advanced School',
                'code' => 'secondary',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);

        $primarySchoolTypeId = DB::table('school_types')->where('code', 'primary')->value('id');
        $secondarySchoolTypeId = DB::table('school_types')->where('code', 'secondary')->value('id');

        // 2. Create class_rooms table
        if (!Schema::hasTable('class_rooms')) {
            Schema::create('class_rooms', function (Blueprint $table) {
                $table->id();
                $table->foreignId('school_id')->constrained('schools')->onDelete('cascade');
                $table->string('name');
                $table->string('room_number');
                $table->integer('capacity')->default(40);
                $table->boolean('is_active')->default(true);
                $table->softDeletes();
                $table->timestamps();

                $table->unique(['school_id', 'room_number']);
            });
        }

        // Migrate rooms to class_rooms table
        if (Schema::hasTable('rooms') && Schema::hasTable('class_rooms')) {
            $existingRooms = DB::table('rooms')->get();
            foreach ($existingRooms as $room) {
                DB::table('class_rooms')->insertOrIgnore([
                    'id' => $room->id,
                    'school_id' => $room->school_id,
                    'name' => $room->room_name ?? $room->room_number,
                    'room_number' => $room->room_number,
                    'capacity' => $room->capacity,
                    'is_active' => $room->is_active,
                    'created_at' => $room->created_at,
                    'updated_at' => $room->updated_at,
                ]);
            }
        }

        // 3. Create teachers table
        if (!Schema::hasTable('teachers')) {
            Schema::create('teachers', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
                $table->foreignId('school_id')->constrained('schools')->onDelete('cascade');
                $table->string('specialization')->nullable();
                $table->boolean('is_active')->default(true);
                $table->softDeletes();
                $table->timestamps();

                $table->unique(['school_id', 'user_id']);
            });
        }

        // Populate teachers table from users where role = 'teacher'
        if (Schema::hasTable('teachers')) {
            $teacherUsers = DB::table('users')->where('role', 'teacher')->get();
            foreach ($teacherUsers as $user) {
                DB::table('teachers')->insertOrIgnore([
                    'user_id' => $user->id,
                    'school_id' => $user->school_id,
                    'specialization' => null,
                    'is_active' => $user->is_active,
                    'created_at' => $user->created_at,
                    'updated_at' => $user->updated_at,
                ]);
            }
        }

        // 4. Update subjects table
        Schema::table('subjects', function (Blueprint $table) {
            if (!Schema::hasColumn('subjects', 'school_type_id')) {
                $table->foreignId('school_type_id')->nullable()->after('school_id')->constrained('school_types')->onDelete('set null');
            }
            if (!Schema::hasColumn('subjects', 'deleted_at')) {
                $table->softDeletes()->after('settings');
            }
        });

        // 5. Update school_classes table
        Schema::table('school_classes', function (Blueprint $table) {
            if (!Schema::hasColumn('school_classes', 'school_type_id')) {
                $table->foreignId('school_type_id')->nullable()->after('school_id')->constrained('school_types')->onDelete('set null');
            }
        });

        // Assign school_type_id to existing classes based on level
        if (Schema::hasColumn('school_classes', 'school_type_id')) {
            DB::table('school_classes')
                ->where('level', 'like', '%primary%')
                ->orWhere('name', 'like', '%class%')
                ->update(['school_type_id' => $primarySchoolTypeId]);

            DB::table('school_classes')
                ->where('level', 'like', '%secondary%')
                ->orWhere('level', 'like', '%form%')
                ->orWhere('name', 'like', '%form%')
                ->update(['school_type_id' => $secondarySchoolTypeId]);
        }

        // 6. Alter timetables table to hold header info
        Schema::table('timetables', function (Blueprint $table) {
            if (!Schema::hasColumn('timetables', 'school_type_id')) {
                $table->foreignId('school_type_id')->nullable()->after('school_id')->constrained('school_types')->onDelete('set null');
            }
            if (!Schema::hasColumn('timetables', 'section')) {
                $table->string('section')->nullable()->after('class_id');
            }
            if (!Schema::hasColumn('timetables', 'academic_term_id')) {
                $table->foreignId('academic_term_id')->nullable()->after('section')->constrained('academic_terms')->onDelete('cascade');
            }
            if (!Schema::hasColumn('timetables', 'deleted_at')) {
                $table->softDeletes()->after('settings');
            }

            // Make columns nullable so we can migrate data smoothly
            $table->foreignId('subject_id')->nullable()->change();
            $table->foreignId('teacher_id')->nullable()->change();
            $table->string('day_of_week')->nullable()->change();
            $table->string('period')->nullable()->change();
            $table->time('start_time')->nullable()->change();
            $table->time('end_time')->nullable()->change();
        });

        // 7. Create timetable_slots table
        if (!Schema::hasTable('timetable_slots')) {
            Schema::create('timetable_slots', function (Blueprint $table) {
                $table->id();
                $table->foreignId('timetable_id')->constrained('timetables')->onDelete('cascade');
                $table->string('day_of_week');
                $table->foreignId('period_id')->constrained('periods')->onDelete('cascade');
                $table->foreignId('subject_id')->constrained('subjects')->onDelete('cascade');
                $table->foreignId('teacher_id')->constrained('users')->onDelete('cascade');
                $table->foreignId('class_room_id')->nullable()->constrained('class_rooms')->onDelete('set null');
                $table->softDeletes();
                $table->timestamps();

                $table->unique(['timetable_id', 'day_of_week', 'period_id']);
            });
        }

        // 8. Migrate existing records from timetables to timetable_slots
        $oldTimetables = DB::table('timetables')
            ->whereNotNull('subject_id')
            ->whereNotNull('teacher_id')
            ->get();

        foreach ($oldTimetables as $oldRecord) {
            // Determine school type based on class
            $class = DB::table('school_classes')->where('id', $oldRecord->class_id)->first();
            $schoolTypeId = $class ? $class->school_type_id : null;

            // Resolve term id from settings/date if null
            $termId = $oldRecord->academic_term_id;
            if (!$termId) {
                // Find first active term for school
                $termId = DB::table('academic_terms')
                    ->where('school_id', $oldRecord->school_id)
                    ->where('is_active', true)
                    ->value('id');
            }

            // Find or create parent timetable record
            $timetableId = DB::table('timetables')
                ->where('school_id', $oldRecord->school_id)
                ->where('class_id', $oldRecord->class_id)
                ->where('section', $class->section ?? 'A')
                ->where('academic_term_id', $termId)
                ->value('id');

            if (!$timetableId) {
                $timetableId = DB::table('timetables')->insertGetId([
                    'school_id' => $oldRecord->school_id,
                    'school_type_id' => $schoolTypeId,
                    'class_id' => $oldRecord->class_id,
                    'section' => $class->section ?? 'A',
                    'academic_term_id' => $termId,
                    'is_active' => true,
                    'created_at' => $oldRecord->created_at,
                    'updated_at' => $oldRecord->updated_at,
                ]);
            }

            // Resolve period_id by matching name/times on periods table
            $periodId = null;
            if ($oldRecord->period) {
                $periodId = DB::table('periods')
                    ->where('school_id', $oldRecord->school_id)
                    ->where('name', $oldRecord->period)
                    ->value('id');
            }

            if (!$periodId) {
                // Find or create a matching period
                $periodId = DB::table('periods')
                    ->where('school_id', $oldRecord->school_id)
                    ->where('start_time', $oldRecord->start_time)
                    ->value('id');
            }

            if (!$periodId) {
                // Generate a period
                $periodId = DB::table('periods')->insertGetId([
                    'school_id' => $oldRecord->school_id,
                    'period_number' => DB::table('periods')->where('school_id', $oldRecord->school_id)->count() + 1,
                    'name' => $oldRecord->period ?? 'Period',
                    'start_time' => $oldRecord->start_time ?? '08:00:00',
                    'end_time' => $oldRecord->end_time ?? '09:00:00',
                    'is_break' => false,
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            // Resolve class_room_id
            $classRoomId = null;
            if ($oldRecord->room) {
                $classRoomId = DB::table('class_rooms')
                    ->where('school_id', $oldRecord->school_id)
                    ->where('room_number', $oldRecord->room)
                    ->value('id');

                if (!$classRoomId) {
                    $classRoomId = DB::table('class_rooms')->insertGetId([
                        'school_id' => $oldRecord->school_id,
                        'name' => 'Room ' . $oldRecord->room,
                        'room_number' => $oldRecord->room,
                        'capacity' => 40,
                        'is_active' => true,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }

            // Insert into timetable_slots
            DB::table('timetable_slots')->insertOrIgnore([
                'timetable_id' => $timetableId,
                'day_of_week' => strtolower($oldRecord->day_of_week),
                'period_id' => $periodId,
                'subject_id' => $oldRecord->subject_id,
                'teacher_id' => $oldRecord->teacher_id,
                'class_room_id' => $classRoomId,
                'created_at' => $oldRecord->created_at,
                'updated_at' => $oldRecord->updated_at,
            ]);
        }

        // Clean up the parent records (remove values migrated to slots to avoid confusion)
        DB::table('timetables')
            ->whereNotNull('subject_id')
            ->update([
                'subject_id' => null,
                'teacher_id' => null,
                'day_of_week' => null,
                'period' => null,
                'start_time' => null,
                'end_time' => null,
                'room' => null,
            ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('timetable_slots');
        Schema::dropIfExists('teachers');
        Schema::dropIfExists('class_rooms');

        Schema::table('timetables', function (Blueprint $table) {
            if (Schema::hasColumn('timetables', 'deleted_at')) {
                $table->dropSoftDeletes();
            }
            if (Schema::hasColumn('timetables', 'academic_term_id')) {
                $table->dropConstrainedForeignId('academic_term_id');
            }
            if (Schema::hasColumn('timetables', 'section')) {
                $table->dropColumn('section');
            }
            if (Schema::hasColumn('timetables', 'school_type_id')) {
                $table->dropConstrainedForeignId('school_type_id');
            }
        });

        Schema::table('school_classes', function (Blueprint $table) {
            if (Schema::hasColumn('school_classes', 'school_type_id')) {
                $table->dropConstrainedForeignId('school_type_id');
            }
        });

        Schema::table('subjects', function (Blueprint $table) {
            if (Schema::hasColumn('subjects', 'deleted_at')) {
                $table->dropSoftDeletes();
            }
            if (Schema::hasColumn('subjects', 'school_type_id')) {
                $table->dropConstrainedForeignId('school_type_id');
            }
        });

        Schema::dropIfExists('school_types');
    }
};
