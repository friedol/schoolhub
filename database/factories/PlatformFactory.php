<?php

namespace Database\Factories;

use App\Models\Platform;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Platform>
 */
class PlatformFactory extends Factory
{
    protected $model = Platform::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->company() . ' Platform',
            'description' => $this->faker->sentence(10),
            'domain' => $this->faker->domainName(),
            'contact_email' => $this->faker->companyEmail(),
            'contact_phone' => $this->faker->phoneNumber(),
            'address' => $this->faker->address(),
            'region' => $this->faker->randomElement(['Dar es Salaam', 'Arusha', 'Mwanza', 'Dodoma', 'Tanga']),
            'district' => $this->faker->city(),
            'is_active' => true,
            'subscription_plan' => $this->faker->randomElement(['basic', 'premium', 'enterprise']),
            'subscription_expires_at' => $this->faker->dateTimeBetween('now', '+1 year'),
            'settings' => [
                'currency' => 'TZS',
                'language' => 'en',
                'timezone' => 'Africa/Dar_es_Salaam',
                'date_format' => 'd/m/Y',
                'time_format' => 'H:i'
            ]
        ];
    }

    /**
     * Indicate that the platform is active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => true,
        ]);
    }

    /**
     * Indicate that the platform is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    /**
     * Indicate that the platform has enterprise subscription.
     */
    public function enterprise(): static
    {
        return $this->state(fn (array $attributes) => [
            'subscription_plan' => 'enterprise',
            'subscription_expires_at' => $this->faker->dateTimeBetween('+1 year', '+2 years'),
        ]);
    }
}



