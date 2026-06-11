<?php

namespace App\Http\Controllers\SchoolAdmin;

use App\Http\Controllers\Controller;
use App\Models\Room;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class RoomController extends Controller
{
    public function index(): Response
    {
        $school = User::getCurrentSchool() ?? Auth::user()->school;
        $rooms = Room::where('school_id', $school->id)
            ->orderBy('building')
            ->orderBy('room_number')
            ->paginate(15);

        return Inertia::render('Academic/Rooms/Index', [
            'rooms' => $rooms,
            'roomTypes' => [
                Room::ROOM_TYPE_CLASSROOM => 'Classroom',
                Room::ROOM_TYPE_LABORATORY => 'Laboratory',
                Room::ROOM_TYPE_LIBRARY => 'Library',
                Room::ROOM_TYPE_COMPUTER_LAB => 'Computer Lab',
                Room::ROOM_TYPE_HALL => 'Hall',
                Room::ROOM_TYPE_OFFICE => 'Office'
            ]
        ]);
    }

    public function store(Request $request)
    {
        $school = User::getCurrentSchool() ?? Auth::user()->school;
        
        $validated = $request->validate([
            'room_number' => 'required|string|max:50|unique:rooms,room_number,NULL,id,school_id,' . $school->id,
            'room_name' => 'nullable|string|max:100',
            'room_type' => 'required|string|max:50',
            'capacity' => 'required|integer|min:1',
            'rows' => 'required|integer|min:1',
            'columns' => 'required|integer|min:1',
            'floor' => 'required|integer',
            'building' => 'required|string|max:100',
            'is_active' => 'boolean'
        ]);

        // Capacity check (rows * columns should equal or be close to capacity)
        if ($validated['rows'] * $validated['columns'] < $validated['capacity']) {
            return back()->withErrors(['capacity' => 'Seating grid (rows × columns) must accommodate the total capacity.']);
        }

        Room::create(array_merge($validated, [
            'school_id' => $school->id,
            'is_active' => $request->input('is_active', true)
        ]));

        return redirect()->route('academic.rooms.index')->with('success', 'Room created successfully.');
    }

    public function update(Request $request, Room $room)
    {
        $school = User::getCurrentSchool() ?? Auth::user()->school;
        
        $validated = $request->validate([
            'room_number' => 'required|string|max:50|unique:rooms,room_number,' . $room->id . ',id,school_id,' . $school->id,
            'room_name' => 'nullable|string|max:100',
            'room_type' => 'required|string|max:50',
            'capacity' => 'required|integer|min:1',
            'rows' => 'required|integer|min:1',
            'columns' => 'required|integer|min:1',
            'floor' => 'required|integer',
            'building' => 'required|string|max:100',
            'is_active' => 'boolean'
        ]);

        if ($validated['rows'] * $validated['columns'] < $validated['capacity']) {
            return back()->withErrors(['capacity' => 'Seating grid (rows × columns) must accommodate the total capacity.']);
        }

        $room->update($validated);

        return redirect()->route('academic.rooms.index')->with('success', 'Room updated successfully.');
    }

    public function destroy(Room $room)
    {
        $room->delete();
        return redirect()->route('academic.rooms.index')->with('success', 'Room deleted successfully.');
    }
}
