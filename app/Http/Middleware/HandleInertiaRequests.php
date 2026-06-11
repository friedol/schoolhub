<?php

namespace App\Http\Middleware;

use App\Models\School;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        // Get the school name for multi-school system
        $schoolName = $this->getSchoolName($request);

        // Get current school model context
        $currentSchool = $request->attributes->get('current_school');
        if (!$currentSchool && $request->user() && $request->user()->school_id) {
            $currentSchool = School::find($request->user()->school_id);
        }

        return [
            ...parent::share($request),
            'name' => $schoolName,
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $request->user(),
            ],
            'currentSchool' => $currentSchool,
            'schools' => School::where('is_active', true)->get(['id', 'name', 'code']),
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'flash' => [
                'success' => $request->session()->get('success'),
                'error'   => $request->session()->get('error'),
            ],
        ];
    }

    /**
     * Get the current school name based on the request host/port.
     * This supports the multi-school authentication system.
     */
    private function getSchoolName(Request $request): string
    {
        // If user is authenticated, get their school name
        if ($request->user()) {
            $user = $request->user();
            
            // If user has a school, use the school name
            if ($user->school_id) {
                $school = School::find($user->school_id);
                if ($school) {
                    return $school->name;
                }
            }
            
            // For super admins, use platform name
            if ($user->platform_id) {
                return 'EduTZ Platform';
            }
        }

        // For unauthenticated requests, detect school from host/port
        $host = $request->getHost();
        $port = $request->getPort();
        $hostPort = $host . ':' . $port;

        // Map host:port to school code
        $schoolMappings = [
            'localhost:8001' => 'SMSS',
            '127.0.0.1:8001' => 'SMSS',
            'localhost:8002' => 'KIS',
            '127.0.0.1:8002' => 'KIS',
        ];

        if (isset($schoolMappings[$hostPort])) {
            $schoolCode = $schoolMappings[$hostPort];
            $school = School::where('code', $schoolCode)->first();
            
            if ($school) {
                return $school->name;
            }
        }

        // Default fallback
        return config('app.name', 'EduTZ');
    }
}
