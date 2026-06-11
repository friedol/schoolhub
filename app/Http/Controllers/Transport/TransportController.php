<?php

namespace App\Http\Controllers\Transport;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TransportController extends Controller
{
    public function dashboard()
    {
        return Inertia::render('Transport/Dashboard');
    }

    public function vehicles()
    {
        return Inertia::render('Transport/Vehicles/Index');
    }

    public function storeVehicle(Request $request)
    {
        $request->validate([
            'vehicle_number' => 'required|string|max:50',
            'type'           => 'required|in:bus,minibus,van,coaster',
            'capacity'       => 'required|integer|min:1',
            'driver_name'    => 'required|string|max:255',
            'driver_phone'   => 'required|string|max:20',
            'status'         => 'required|in:active,inactive,maintenance',
        ]);

        return redirect()->back()->with('success', 'Vehicle saved successfully!');
    }

    public function routes()
    {
        return Inertia::render('Transport/Routes/Index');
    }

    public function storeRoute(Request $request)
    {
        $request->validate([
            'route_name'  => 'required|string|max:255',
            'start_point' => 'required|string|max:255',
            'end_point'   => 'required|string|max:255',
        ]);

        return redirect()->back()->with('success', 'Route saved successfully!');
    }

    public function assignments()
    {
        return Inertia::render('Transport/Assignments/Index');
    }

    public function trips()
    {
        return Inertia::render('Transport/Trips/Index');
    }

    public function maintenance()
    {
        return Inertia::render('Transport/Maintenance/Index');
    }

    public function storeMaintenance(Request $request)
    {
        $request->validate([
            'vehicle_id'       => 'required|integer',
            'maintenance_type' => 'required|string|max:100',
            'description'      => 'required|string',
            'date'             => 'required|date',
            'cost'             => 'required|numeric|min:0',
            'status'           => 'required|in:scheduled,in_progress,completed',
        ]);

        return redirect()->back()->with('success', 'Maintenance record saved successfully!');
    }
}
