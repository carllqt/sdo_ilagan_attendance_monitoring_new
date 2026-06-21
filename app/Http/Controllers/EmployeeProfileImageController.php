<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Symfony\Component\HttpFoundation\Response;

class EmployeeProfileImageController extends Controller
{
    public function show(Request $request, string $filename): Response
    {
        if ($filename !== basename($filename)) {
            abort(404);
        }

        $path = storage_path("app/public/employee-profile-images/{$filename}");

        if (! File::isFile($path)) {
            abort(404);
        }

        return response()->file($path, [
            'Cache-Control' => 'public, max-age=2592000, immutable',
            'Expires' => now()->addDays(30)->toRfc7231String(),
        ]);
    }
}
