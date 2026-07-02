<?php

namespace App\Http\Controllers\HumanResource;

use App\Http\Controllers\Concerns\ValidatesPassword;
use App\Http\Controllers\Controller;
use App\Http\Requests\HumanResource\TardinessConversion\TardinessConversionStoreRequest;
use App\Http\Requests\HumanResource\TardinessConversion\TardinessConversionUpdateRequest;
use App\Services\HumanResource\TardinessConversionService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TardinessConversionController extends Controller
{
    use ValidatesPassword;

    public function __construct(
        private readonly TardinessConversionService $tardinessConversion,
    ) {}

    public function index(Request $request)
    {
        return Inertia::render(
            'HumanResource/HRTardinessSummaryManagement/TardinessConversion',
            $this->tardinessConversion->pageData($request),
        );
    }

    public function suggestions(Request $request)
    {
        return response()->json($this->tardinessConversion->suggestions($request));
    }

    public function store(TardinessConversionStoreRequest $request)
    {
        $this->ensureValidPassword($request);

        $this->tardinessConversion->storeSummaries(
            $request->validated()['summaries'],
            $request->user()?->employee?->station_id,
        );

        return redirect()
            ->back()
            ->with('success', 'All tardiness summaries have been saved successfully!');
    }

    public function update(TardinessConversionUpdateRequest $request, string $type, int $id)
    {
        $this->tardinessConversion->updateConversion(
            type: $type,
            id: $id,
            equivalentDays: (float) $request->validated()['equivalent_days'],
        );

        $query = collect($request->query())
            ->except(['modal', 'conversion_type', 'conversion_id'])
            ->all();

        return redirect()
            ->route('tardiness-conversion', $query)
            ->with('success', 'Conversion value updated successfully.');
    }
}
