<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\School;
use App\Models\Platform;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    protected $model = User::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $school = School::inRandomOrder()->first() ?? School::factory()->create();
        
        return [
            'name' => $this->faker->name(),
            'email' => $this->faker->unique()->safeEmail(),
            'email_verified_at' => now(),
            'phone' => $this->faker->phoneNumber(),
            'password' => Hash::make('password'),
            'remember_token' => Str::random(10),
            'role' => $this->faker->randomElement(['teacher', 'student', 'parent']),
            'school_id' => $school->id,
            'platform_id' => $school->platform_id,
            'is_active' => true,
            'language_preference' => $this->faker->randomElement(['en', 'sw']),
            'settings' => ['theme' => $this->faker->randomElement(['light', 'dark'])]
        ];
    }

    /**
     * Indicate that the user is a super admin.
     */
    public function superAdmin(): static
    {
        $platform = Platform::first() ?? Platform::factory()->create();
        
        return $this->state(fn (array $attributes) => [
            'role' => 'super_admin',
            'school_id' => null,
            'platform_id' => $platform->id,
            'name' => 'Super Admin',
            'email' => 'superadmin@edutz.com',
        ]);
    }

    /**
     * Indicate that the user is a headteacher.
     */
    public function headteacher(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'headteacher',
            'name' => 'Headteacher',
        ]);
    }

    /**
     * Indicate that the user is a bursar.
     */
    public function bursar(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'bursar',
            'name' => 'Finance Manager',
        ]);
    }

    /**
     * Indicate that the user is a librarian.
     */
    public function librarian(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'librarian',
            'name' => 'Library Manager',
        ]);
    }

    /**
     * Indicate that the user is a dormitory manager.
     */
    public function dormitoryManager(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'dormitory_manager',
            'name' => 'Dormitory Manager',
        ]);
    }

    /**
     * Indicate that the user is an academic master.
     */
    public function academicMaster(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'academic_master',
            'name' => 'Academic Master',
        ]);
    }

    /**
     * Indicate that the user is a teacher.
     */
    public function teacher(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'teacher',
            'name' => 'Teacher ' . $this->faker->firstName(),
        ]);
    }

    /**
     * Indicate that the user is a student.
     */
    public function student(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'student',
            'name' => 'Student ' . $this->faker->firstName(),
            'student_number' => $this->faker->numerify('#######'),
            'date_of_birth' => $this->faker->dateTimeBetween('-18 years', '-14 years'),
            'gender' => $this->faker->randomElement(['male', 'female']),
            'address' => $this->faker->address(),
        ]);
    }

    /**
     * Indicate that the user is a parent.
     */
    public function parent(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'parent',
            'name' => 'Parent ' . $this->faker->firstName(),
        ]);
    }

    /**
     * Indicate that the user is active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => true,
        ]);
    }

    /**
     * Indicate that the user is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
}