<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\Administrator\Station;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(Request $request): Response|RedirectResponse
    {
        if (Auth::check()) {
            return redirect()->route('employee-management');
        }

        $documentRequestModal = match ($request->query('modal')) {
            'locator-slip' => 'locator_slip',
            'travel-order' => 'travel_order',
            default => null,
        };

        return Inertia::render('Auth/Login/Login', [
            'canResetPassword' => Route::has('password.request'),
            'documentRequestModal' => $documentRequestModal,
            'status' => session('status'),
            'stations' => fn () => Station::query()
                ->select('id', 'name', 'code')
                ->orderByRaw("CASE WHEN code = 'SDO' THEN 0 ELSE 1 END")
                ->orderBy('name')
                ->get(),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();
        Auth::logoutOtherDevices((string) $request->input('password'));

        if (config('session.driver') === 'database') {
            DB::table(config('session.table', 'sessions'))
                ->where('user_id', $request->user()->getAuthIdentifier())
                ->where('id', '!=', $request->session()->getId())
                ->delete();
        }

        return redirect()->route('employee-management');
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
