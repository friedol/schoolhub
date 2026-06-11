<?php

namespace Tests\Feature;

use App\Models\Platform;
use App\Models\School;
use App\Models\User;
use App\Models\Hostel;
use App\Models\HostelMaintenanceRequest;
use App\Models\HostelInventory;
use App\Models\InventoryItem;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HostelTest extends TestCase
{
    use RefreshDatabase;

    protected Platform $platform;
    protected School $school;
    protected User $schoolAdmin;
    protected Hostel $hostel;

    protected function setUp(): void
    {
        parent::setUp();

        $this->platform = Platform::create([
            'name' => 'EduTZ Group',
            'description' => 'Test platform',
            'domain' => 'test.edutz.com',
            'contact_email' => 'admin@test.com',
            'contact_phone' => '+255123456789',
            'address' => 'Test Address',
            'region' => 'Dar es Salaam',
            'district' => 'Kinondoni',
            'is_active' => true,
            'subscription_plan' => 'premium',
        ]);

        $this->school = School::create([
            'platform_id' => $this->platform->id,
            'name' => 'Test School',
            'code' => 'TS1',
            'address' => 'School Address',
            'region' => 'Dar es Salaam',
            'district' => 'Kinondoni',
            'contact_email' => 'school@test.com',
            'contact_phone' => '+255123456789',
            'school_level' => 'secondary',
            'is_active' => true,
        ]);

        $this->schoolAdmin = User::create([
            'name' => 'School Admin',
            'email' => 'admin@test.com',
            'password' => bcrypt('password'),
            'role' => 'school_admin',
            'school_id' => $this->school->id,
            'platform_id' => $this->platform->id,
            'is_active' => true,
        ]);

        $this->hostel = Hostel::create([
            'school_id' => $this->school->id,
            'name' => 'Gold Dormitory',
            'type' => 'boys',
            'location' => 'Main Campus',
            'total_capacity' => 100,
            'is_active' => true,
            'created_by' => $this->schoolAdmin->id,
        ]);
    }

    public function test_hostel_dashboard_does_not_throw_sql_error()
    {
        $this->actingAs($this->schoolAdmin);

        // Create a maintenance request using priority/severity
        $request = HostelMaintenanceRequest::create([
            'hostel_id' => $this->hostel->id,
            'requested_by' => $this->schoolAdmin->id,
            'request_type' => 'plumbing',
            'severity' => 'urgent',
            'title' => 'Leaking pipe',
            'description' => 'Pipe is leaking in the common restroom',
            'request_date' => now(),
            'status' => 'pending',
            'reported_date' => now(),
            'created_by' => $this->schoolAdmin->id,
        ]);

        // Assert that the request has priority 'urgent' and severity returns 'urgent'
        $this->assertEquals('urgent', $request->priority);
        $this->assertEquals('urgent', $request->severity);

        // Fetch dashboard stats via route/controller
        $response = $this->get(route('hostel.dashboard-stats'));
        $response->assertStatus(200);
        $response->assertJsonFragment([
            'urgent_maintenance_requests' => 1,
        ]);

        // Fetch dashboard page
        $response = $this->get(route('hostel.dashboard'));
        $response->assertStatus(200);
    }

    public function test_hostel_maintenance_index_returns_list_correctly()
    {
        $this->actingAs($this->schoolAdmin);

        $request = HostelMaintenanceRequest::create([
            'hostel_id' => $this->hostel->id,
            'requested_by' => $this->schoolAdmin->id,
            'request_type' => 'electrical',
            'severity' => 'medium',
            'title' => 'Flickering light',
            'description' => 'Light in room 10 is flickering',
            'request_date' => now(),
            'status' => 'pending',
            'reported_date' => now(),
            'created_by' => $this->schoolAdmin->id,
        ]);

        $response = $this->get(route('hostel.maintenance.index'));
        $response->assertStatus(200);
    }

    public function test_hostel_inventory_index_does_not_throw_sql_error()
    {
        $this->actingAs($this->schoolAdmin);

        // Create an InventoryItem
        $item = InventoryItem::create([
            'school_id' => $this->school->id,
            'name' => 'Bunk Bed',
            'item_code' => 'BED-001',
            'item_type' => 'asset',
            'cost_price' => 150000.00,
            'current_stock' => 10,
            'is_active' => true,
            'created_by' => $this->schoolAdmin->id,
        ]);

        // Create a HostelInventory using relationships / fillable
        $inventory = HostelInventory::create([
            'hostel_id' => $this->hostel->id,
            'item_name' => $item->name,
            'item_type' => 'furniture',
            'item_code' => $item->item_code,
            'quantity' => 5,
            'condition' => 'excellent',
            'purchase_cost' => $item->cost_price,
            'created_by' => $this->schoolAdmin->id,
        ]);

        $this->assertEquals('excellent', $inventory->condition);
        $this->assertEquals($item->id, $inventory->inventory_item_id);

        $response = $this->get(route('hostel.inventory.index'));
        $response->assertStatus(200);

        // Test store / create request
        $response = $this->post(route('hostel.inventory.store'), [
            'hostel_id' => $this->hostel->id,
            'inventory_item_id' => $item->id,
            'quantity' => 2,
            'condition' => 'excellent',
            'notes' => 'New arrivals',
        ]);
        $response->assertRedirect(route('hostel.inventory.index'));
    }
}
