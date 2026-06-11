<?php

namespace App\Models\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;
use Illuminate\Support\Facades\Auth;

/**
 * SchoolScope — automatically limits User queries to the logged-in
 * user's school_id so cross-school data leaks are impossible.
 *
 * Applied automatically via User::booted() only for school-level roles.
 * Super-admins and unauthenticated contexts bypass this scope.
 *
 * Controllers may call ->withoutGlobalScope(SchoolScope::class) when
 * they genuinely need cross-school data (e.g., SuperAdmin reports).
 */
class SchoolScope implements Scope
{
    public function apply(Builder $builder, Model $model): void
    {
        // Guard against recursive calls: Auth::user() triggers a User query,
        // which re-enters this scope before the first call finishes.
        static $resolving = false;
        if ($resolving) {
            return;
        }

        $resolving = true;

        try {
            if (! Auth::check()) {
                return;
            }

            $user = Auth::user();

            if (! $user) {
                return;
            }

            // Super-admins need unrestricted access across schools
            if (method_exists($user, 'isSuperAdmin') && $user->isSuperAdmin()) {
                return;
            }

            // Platform admins also bypass
            if (in_array($user->role ?? '', ['super_admin', 'platform_admin'])) {
                return;
            }

            // For all school-level users, restrict to their school
            if ($user->school_id) {
                $builder->where($model->getTable() . '.school_id', $user->school_id);
            }
        } finally {
            $resolving = false;
        }
    }
}
