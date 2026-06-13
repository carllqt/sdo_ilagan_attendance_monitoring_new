<?php

namespace App\Http\Controllers\HumanResource;

use App\Http\Controllers\Concerns\ValidatesPassword;
use App\Http\Controllers\Controller;
use App\Http\Requests\HumanResource\TardinessConvertion\TardinessConvertionStoreRequest;
use App\Http\Requests\HumanResource\TardinessConvertion\TardinessConvertionUpdateRequest;
use App\Services\HumanResource\TardinessConvertionService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TardinessConvertionController extends Controller
{
    use ValidatesPassword;

    public function __construct(
        private readonly TardinessConvertionService $tardinessConvertion,
    ) {}

    public function index(Request $request)
    {
        return Inertia::render(
            'HumanResource/HRTardinessSummaryManagement/TardinessConvertion',
            $this->tardinessConvertion->pageData($request),
        );
    }

    public function suggestions(Request $request)
    {
        return response()->json($this->tardinessConvertion->suggestions($request));
    }

    public function store(TardinessConvertionStoreRequest $request)
    {
        $this->ensureValidPassword($request);

        $this->tardinessConvertion->storeSummaries(
            $request->validated()['summaries'],
        );

        return redirect()
            ->back()
            ->with('success', 'All tardiness summaries have been saved successfully!');
    }

    public function update(TardinessConvertionUpdateRequest $request, string $type, int $id)
    {
        $this->tardinessConvertion->updateConversion(
            type: $type,
            id: $id,
            equivalentDays: (float) $request->validated()['equivalent_days'],
        );

        $query = collect($request->query())
            ->except(['modal', 'conversion_type', 'conversion_id'])
            ->all();

        return redirect()
            ->route('tardinessconvertion', $query)
            ->with('success', 'Convertion value updated successfully.');
    }
}
