<?php

namespace App\Http\Middleware;

use App\Models\School;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class HandleMultiTenancy
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Get the host from the request
        $host = $request->getHost();
        $port = $request->getPort();
        
        // Define school-specific URLs/ports
        $schoolMappings = [
            'localhost:8001' => 'SMSS', // St. Mary's Secondary School
            '127.0.0.1:8001' => 'SMSS',
            'localhost:8002' => 'KIS',  // Kilimanjaro International School
            '127.0.0.1:8002' => 'KIS',
            'localhost:8000' => null,   // Default/Platform level
            '127.0.0.1:8000' => null,
        ];
        
        // Create the full host:port key
        $hostPort = $host . ':' . $port;
        
        // Check if this is a school-specific URL
        if (isset($schoolMappings[$hostPort])) {
            $schoolCode = $schoolMappings[$hostPort];
            
            if ($schoolCode) {
                // Find the school by code
                $school = School::where('code', $schoolCode)->first();
                
                if ($school) {
                    // Set the school context in the request
                    $request->attributes->set('current_school', $school);
                    $request->attributes->set('school_id', $school->id);
                    
                    // If user is authenticated, ensure they belong to this school
                    if (Auth::check()) {
                        $user = Auth::user();
                        
                        // Super admin can access any school
                        if (!$user->isSuperAdmin() && $user->school_id !== $school->id) {
                            Auth::logout();
                            return redirect()->route('login')->with('error', 'You do not have access to this school.');
                        }
                    }
                } else {
                    abort(404, 'School not found');
                }
            }
        }
        
        return $next($request);
    }
}



