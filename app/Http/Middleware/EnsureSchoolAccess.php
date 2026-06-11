<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureSchoolAccess
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!Auth::check()) {
            return redirect()->route('login');
        }

        $user = Auth::user();
        
        // Super admins can access any school
        if ($user->isSuperAdmin()) {
            return $next($request);
        }

        // For school users, ensure they can only access their own school's data
        if ($user->school_id && $request->route('school')) {
            $requestedSchoolId = $request->route('school');
            
            if ($user->school_id != $requestedSchoolId) {
                abort(403, 'Unauthorized access. You can only access your school\'s data.');
            }
        }

        return $next($request);
    }
}
