<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Grade;
use App\Models\School;

class GradeLevelSeeder extends Seeder
{
    public function run()
    {
        $schools = School::all();

        foreach ($schools as $school) {
            $this->createGradeLevels($school);
        }
    }

    private function createGradeLevels($school)
    {
        $gradeLevels = [
            // Pre-Primary
            ['name' => 'Nursery', 'code' => 'NUR', 'level' => 'pre_primary', 'sort_order' => 1],
            ['name' => 'Pre-School', 'code' => 'PRE', 'level' => 'pre_primary', 'sort_order' => 2],
            
            // Primary
            ['name' => 'Standard 1', 'code' => 'STD1', 'level' => 'primary', 'sort_order' => 3],
            ['name' => 'Standard 2', 'code' => 'STD2', 'level' => 'primary', 'sort_order' => 4],
            ['name' => 'Standard 3', 'code' => 'STD3', 'level' => 'primary', 'sort_order' => 5],
            ['name' => 'Standard 4', 'code' => 'STD4', 'level' => 'primary', 'sort_order' => 6],
            ['name' => 'Standard 5', 'code' => 'STD5', 'level' => 'primary', 'sort_order' => 7],
            ['name' => 'Standard 6', 'code' => 'STD6', 'level' => 'primary', 'sort_order' => 8],
            ['name' => 'Standard 7', 'code' => 'STD7', 'level' => 'primary', 'sort_order' => 9],
            
            // O-Level
            ['name' => 'Form 1', 'code' => 'F1', 'level' => 'o_level', 'sort_order' => 10],
            ['name' => 'Form 2', 'code' => 'F2', 'level' => 'o_level', 'sort_order' => 11],
            ['name' => 'Form 3', 'code' => 'F3', 'level' => 'o_level', 'sort_order' => 12],
            ['name' => 'Form 4', 'code' => 'F4', 'level' => 'o_level', 'sort_order' => 13],
            
            // A-Level
            ['name' => 'Form 5', 'code' => 'F5', 'level' => 'a_level', 'sort_order' => 14],
            ['name' => 'Form 6', 'code' => 'F6', 'level' => 'a_level', 'sort_order' => 15],
        ];

        foreach ($gradeLevels as $gradeData) {
            Grade::create([
                'school_id' => $school->id,
                'name' => $gradeData['name'],
                'code' => $school->code . '_' . $gradeData['code'], // Make code unique per school
                'level' => $gradeData['level'],
                'description' => 'Grade level: ' . $gradeData['name'],
                'is_active' => true,
                'sort_order' => $gradeData['sort_order']
            ]);
        }
    }
}
