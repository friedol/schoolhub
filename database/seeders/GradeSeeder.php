<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Grade;
use App\Models\School;

class GradeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $schools = School::all();

        foreach ($schools as $school) {
            $grades = [
                // Pre-Primary
                ['name' => 'Baby Class', 'code' => 'BC', 'level' => 'pre_primary', 'sort_order' => 1],
                ['name' => 'Middle Class', 'code' => 'MC', 'level' => 'pre_primary', 'sort_order' => 2],
                ['name' => 'Top Class', 'code' => 'TC', 'level' => 'pre_primary', 'sort_order' => 3],

                // Primary
                ['name' => 'Standard I', 'code' => 'STD1', 'level' => 'primary', 'sort_order' => 4],
                ['name' => 'Standard II', 'code' => 'STD2', 'level' => 'primary', 'sort_order' => 5],
                ['name' => 'Standard III', 'code' => 'STD3', 'level' => 'primary', 'sort_order' => 6],
                ['name' => 'Standard IV', 'code' => 'STD4', 'level' => 'primary', 'sort_order' => 7],
                ['name' => 'Standard V', 'code' => 'STD5', 'level' => 'primary', 'sort_order' => 8],
                ['name' => 'Standard VI', 'code' => 'STD6', 'level' => 'primary', 'sort_order' => 9],
                ['name' => 'Standard VII', 'code' => 'STD7', 'level' => 'primary', 'sort_order' => 10],

                // O-Level
                ['name' => 'Form I', 'code' => 'FORM1', 'level' => 'o_level', 'sort_order' => 11],
                ['name' => 'Form II', 'code' => 'FORM2', 'level' => 'o_level', 'sort_order' => 12],
                ['name' => 'Form III', 'code' => 'FORM3', 'level' => 'o_level', 'sort_order' => 13],
                ['name' => 'Form IV', 'code' => 'FORM4', 'level' => 'o_level', 'sort_order' => 14],

                // A-Level
                ['name' => 'Form V', 'code' => 'FORM5', 'level' => 'a_level', 'sort_order' => 15],
                ['name' => 'Form VI', 'code' => 'FORM6', 'level' => 'a_level', 'sort_order' => 16],
            ];

            foreach ($grades as $gradeData) {
                Grade::create([
                    'school_id' => $school->id,
                    'name' => $gradeData['name'],
                    'code' => $gradeData['code'],
                    'level' => $gradeData['level'],
                    'description' => $this->getGradeDescription($gradeData['level']),
                    'sort_order' => $gradeData['sort_order'],
                    'is_active' => true,
                ]);
            }
        }
    }

    private function getGradeDescription(string $level): string
    {
        return match ($level) {
            'pre_primary' => 'Pre-Primary Education Level',
            'primary' => 'Primary Education Level',
            'o_level' => 'Ordinary Level Secondary Education',
            'a_level' => 'Advanced Level Secondary Education',
            default => 'Education Level',
        };
    }
}



