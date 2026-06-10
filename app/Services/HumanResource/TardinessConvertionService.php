<?php

namespace App\Services\HumanResource;

use App\Data\HumanResource\TardinessConvertionFilter;
use App\Models\Administrator\Office;
use App\Models\HumanResource\ConvertionHours;
use App\Models\HumanResource\ConvertionMinutes;
use App\Models\HumanResource\HrTardinessBatch;
use App\Models\HumanResource\HrTardinessConvertion;
use App\Repositories\HumanResource\TardinessConvertionRepository;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class TardinessConvertionService
{
    public function __construct(
        private readonly TardinessConvertionRepository $repository,
    ) {}

    public function pageData(Request $request): array
    {
        $filter = TardinessConvertionFilter::fromRequest($request);
        $monthList = $this->monthList();
        $defaultStartMonth = $monthList->first() ?: now()->format('F Y');
        $defaultEndMonth = $monthList->contains(now()->format('F Y'))
            ? now()->format('F Y')
            : ($monthList->last() ?: now()->format('F Y'));
        $filter = $filter->withDefaults($defaultStartMonth, $defaultEndMonth);
        $filter = $filter->withEmployeeId($this->repository->employeeIdForSearch(
            filter: $filter,
            startDate: $this->monthStart($filter->startMonth)->toDateString(),
            endDate: $this->monthEnd($filter->endMonth)->toDateString(),
        ));
        $conversionHours = ConvertionHours::all();
        $conversionMinutes = ConvertionMinutes::all();
        $summaries = $this->paginatedEmployeeSummaries(
            filter: $filter,
            conversionHours: $conversionHours,
            conversionMinutes: $conversionMinutes,
        );

        return [
            'records' => $summaries,
            'monthList' => $monthList,
            'offices' => $this->officeOptions(),
            'office' => $filter->officeId,
            'search' => $filter->search,
            'selectedFirstMonth' => $filter->startMonth,
            'selectedSecondMonth' => $filter->endMonth,
            'conversionHours' => $conversionHours,
            'conversionMinutes' => $conversionMinutes,
            'editConvertionModal' => $this->editConvertionModal($request),
        ];
    }

    public function suggestions(Request $request): array
    {
        $filter = TardinessConvertionFilter::fromRequest($request);
        $monthList = $this->monthList();
        $filter = $filter->withDefaults(
            $monthList->first() ?: now()->format('F Y'),
            $monthList->contains(now()->format('F Y'))
                ? now()->format('F Y')
                : ($monthList->last() ?: now()->format('F Y')),
        );
        [$startDate, $endDate] = $this->dateRange($filter);

        return $this->repository
            ->suggestionEmployees($filter, $startDate, $endDate)
            ->map(fn (object $employee) => [
                'id' => $employee->id,
                'label' => $this->employeeName($employee),
                'meta' => collect([$employee->office, $employee->position ?? null])
                    ->filter()
                    ->join(' - '),
                'search' => $this->employeeName($employee),
            ])
            ->values()
            ->all();
    }

    public function storeSummaries(array $summaries): void
    {
        DB::transaction(function () use ($summaries) {
            $batch = $this->createBatch($summaries[0]);

            foreach ($summaries as $summary) {
                $conversion = HrTardinessConvertion::create([
                    ...$summary,
                    'batch_id' => $batch->id,
                ]);

                $conversion->tardinessRecords()->attach(
                    $this->repository->recordIdsForSummary($summary),
                );
            }
        });
    }

    public function updateConversion(string $type, int $id, float $equivalentDays): void
    {
        $this->repository->updateConversion($type, $id, $equivalentDays);
    }

    private function editConvertionModal(Request $request): ?array
    {
        if ($request->query('modal') !== 'edit-convertion') {
            return null;
        }

        $type = (string) $request->query('conversion_type', '');
        $id = (int) $request->query('conversion_id');

        if (! in_array($type, ['hours', 'minutes'], true) || $id <= 0) {
            return null;
        }

        return $this->repository->conversionModal($type, $id);
    }

    private function paginatedEmployeeSummaries(
        TardinessConvertionFilter $filter,
        Collection $conversionHours,
        Collection $conversionMinutes,
    ) {
        [$startDate, $endDate] = $this->dateRange($filter);

        return $this->repository
            ->paginatedSummaryRows($filter, $startDate, $endDate)
            ->through(fn ($row) => $this->employeeSummaryPayload(
                row: $row,
                conversionHours: $conversionHours,
                conversionMinutes: $conversionMinutes,
                filter: $filter,
            ));
    }

    private function employeeSummaryPayload(
        object $row,
        Collection $conversionHours,
        Collection $conversionMinutes,
        TardinessConvertionFilter $filter,
    ): array {
        $totalMinutes = (int) $row->total_minutes;
        $hours = intdiv($totalMinutes, 60);
        $minutes = $totalMinutes % 60;

        $equiHours = (float) ($conversionHours->firstWhere('hours', $hours)?->equivalent_days ?? 0);
        $equiMins = (float) ($conversionMinutes->firstWhere('minutes', $minutes)?->equivalent_days ?? 0);
        $fullName = $this->employeeName($row);
        $rowStart = Carbon::parse($row->start_date)->startOfMonth();
        $rowEnd = Carbon::parse($row->end_date)->endOfMonth();
        $division = $row->division_id ? [
            'id' => $row->division_id,
            'code' => $row->division_code,
            'name' => $row->division_name,
        ] : null;
        $office = $row->office_id ? [
            'id' => $row->office_id,
            'name' => $row->office,
            'division' => $division,
        ] : null;

        return [
            'employee_id' => $row->employee_id,
            'first_name' => $row->first_name,
            'middle_name' => $row->middle_name,
            'last_name' => $row->last_name,
            'full_name' => $fullName,
            'name' => $fullName,
            'profile_img' => $row->profile_img,
            'office_id' => $row->office_id,
            'office' => $row->office,
            'office_option' => $office,
            'division' => $division,
            'date' => $row->start_date,
            'start_month' => $rowStart->toDateString(),
            'end_month' => $rowEnd->toDateString(),
            'month_label' => $this->monthRangeLabel($rowStart, $rowEnd),
            'total_tardy' => $this->minutesToTardyDecimal($totalMinutes),
            'equi_hours' => $equiHours,
            'equi_mins' => $equiMins,
            'total_equi' => $equiHours + $equiMins,
        ];
    }

    private function employeeName(object $employee): string
    {
        return preg_replace(
            '/\s+/',
            ' ',
            trim("{$employee->first_name} {$employee->middle_name} {$employee->last_name}"),
        );
    }

    private function monthList(): Collection
    {
        return $this->repository
            ->monthList()
            ->map(fn ($record) => Carbon::create((int) $record->year, (int) $record->month, 1)->format('F Y'));
    }

    private function officeOptions(): Collection
    {
        return collect([
            ['id' => 'all', 'name' => 'All Offices'],
        ])->merge(
            $this->repository->officeOptions()->map(function (Office $office) {
                $division = $office->division;

                return [
                    'id' => $office->id,
                    'name' => $office->name,
                    'division' => $division ? [
                        'id' => $division->id,
                        'code' => $division->code,
                        'name' => $division->name,
                    ] : null,
                ];
            }),
        );
    }

    private function dateRange(TardinessConvertionFilter $filter): array
    {
        return [
            $this->monthStart($filter->startMonth)->toDateString(),
            $this->monthEnd($filter->endMonth)->toDateString(),
        ];
    }

    private function monthStart(?string $month): Carbon
    {
        return $this->parseMonth($month)->startOfMonth();
    }

    private function monthEnd(?string $month): Carbon
    {
        return $this->parseMonth($month)->endOfMonth();
    }

    private function parseMonth(?string $month): Carbon
    {
        if (! $month) {
            return now();
        }

        return Carbon::createFromFormat('F Y', $month)->startOfMonth();
    }

    private function createBatch(array $summary): HrTardinessBatch
    {
        return HrTardinessBatch::create([
            'batch_code' => 'BATCH-'.now()->format('YmdHis'),
            'start_month' => $summary['start_month'],
            'end_month' => $summary['end_month'],
        ]);
    }

    private function monthRangeLabel(Carbon $start, Carbon $end): string
    {
        if ($start->isSameMonth($end) && $start->isSameYear($end)) {
            return $start->format('F Y');
        }

        if ($start->isSameYear($end)) {
            return $start->format('M').' - '.$end->format('M Y');
        }

        return $start->format('M Y').' - '.$end->format('M Y');
    }

    private function minutesToTardyDecimal(int $totalMinutes): float
    {
        $hours = intdiv(max($totalMinutes, 0), 60);
        $minutes = max($totalMinutes, 0) % 60;

        return (float) sprintf('%d.%02d', $hours, $minutes);
    }
}
