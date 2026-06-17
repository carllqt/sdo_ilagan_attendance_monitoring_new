<?php

namespace App\Http\Controllers\Administrator;

use App\Data\Administrator\DailyTimeRecordListFilter\DailyTimeRecordFilter;
use App\Http\Controllers\Concerns\ValidatesPassword;
use App\Http\Controllers\Controller;
use App\Http\Requests\Administrator\DailyTimeRecord\{
    RecomputeDtrRequest,
    UndoRecomputeDtrRequest,
    WorkScheduleRequest,
    WorkTypeRequest,
};
use App\Models\Administrator\WorkSchedule;
use App\Models\Administrator\WorkType;
use App\Services\Administrator\DailyTimeRecord\DailyTimeRecordService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DailyTimeRecordController extends Controller
{
    use ValidatesPassword;

    public function __construct(
        private readonly DailyTimeRecordService $dailyTimeRecords,
    ) {}

    public function index(Request $request)
    {
        $stationId = $this->stationId();
        $filter = DailyTimeRecordFilter::fromRequest($request, $stationId);

        if ($filter->hasInvalidLimit($request)) {
            return redirect()->to($request->fullUrlWithQuery([
                'limit' => $filter->limit,
            ]));
        }

        return Inertia::render(
            'Admin/DailyTimeRecord/DailyTimeRecord',
            $this->dailyTimeRecords->pageData($request, $stationId),
        );
    }

    public function suggestions(Request $request)
    {
        return response()->json(
            $this->dailyTimeRecords->suggestions($request, $this->stationId()),
        );
    }

    public function offices(Request $request)
    {
        return response()->json(
            $this->dailyTimeRecords->officePrintData($request, $this->stationId()),
        );
    }

    public function details($employeeId)
    {
        return response()->json(
            $this->dailyTimeRecords->detailsData((int) $employeeId, $this->stationId()),
        );
    }

    public function recompute(RecomputeDtrRequest $request, $employeeId)
    {
        $validated = $request->validated();

        $recompute = $this->dailyTimeRecords->recomputeEmployeeDateRange(
            (int) $employeeId,
            $this->stationId(),
            $validated['from'],
            $validated['to'],
        );

        return back()->with('recomputeUndo', $recompute);
    }

    public function undoRecompute(UndoRecomputeDtrRequest $request, $employeeId)
    {
        $validated = $request->validated();

        $this->dailyTimeRecords->undoRecomputeEmployeeDateRange(
            (int) $employeeId,
            $this->stationId(),
            $validated['token'],
        );

        return back();
    }

    public function storeWorkType(WorkTypeRequest $request)
    {
        $this->dailyTimeRecords->storeWorkType($request->validated());

        return back()->with('success', 'Work type added successfully.');
    }

    public function updateWorkType(WorkTypeRequest $request, WorkType $workType)
    {
        $this->ensureValidPassword($request);
        $this->dailyTimeRecords->updateWorkType($workType, $request->validated());

        return back()->with('success', 'Work type updated successfully.');
    }

    public function destroyWorkType(Request $request, WorkType $workType)
    {
        $this->ensureValidPassword($request);

        try {
            $this->dailyTimeRecords->deleteWorkType($workType);
        } catch (\InvalidArgumentException $exception) {
            return $this->redirectToCleanDailyTimeRecord($request)
                ->with('error', $exception->getMessage());
        }

        return $this->redirectToCleanDailyTimeRecord($request)
            ->with('success', 'Work type deleted successfully.');
    }

    public function storeWorkSchedule(WorkScheduleRequest $request)
    {
        $this->dailyTimeRecords->storeWorkSchedule($request->validated());

        return back()->with('success', 'Work schedule added successfully.');
    }

    public function updateWorkSchedule(WorkScheduleRequest $request, WorkSchedule $workSchedule)
    {
        $this->ensureValidPassword($request);
        $this->dailyTimeRecords->updateWorkSchedule($workSchedule, $request->validated());

        return back()->with('success', 'Work schedule updated successfully.');
    }

    public function destroyWorkSchedule(Request $request, WorkSchedule $workSchedule)
    {
        $this->ensureValidPassword($request);
        $this->dailyTimeRecords->deleteWorkSchedule($workSchedule);

        return $this->redirectToCleanDailyTimeRecord($request)
            ->with('success', 'Work schedule deleted successfully.');
    }

    private function redirectToCleanDailyTimeRecord(Request $request)
    {
        $query = [];
        $previousUrl = (string) $request->headers->get('referer', '');
        $previousQuery = parse_url($previousUrl, PHP_URL_QUERY);

        if ($previousQuery) {
            parse_str($previousQuery, $query);
        }

        unset(
            $query['modal'],
            $query['work_type_id'],
            $query['work_schedule_id'],
        );

        return redirect()->route('daily-time-record', $query);
    }

    private function stationId(): int
    {
        $stationId = optional(auth()->user()->employee)->station_id;

        if (! $stationId) {
            abort(403, 'Station not assigned to this user.');
        }

        return (int) $stationId;
    }

}
