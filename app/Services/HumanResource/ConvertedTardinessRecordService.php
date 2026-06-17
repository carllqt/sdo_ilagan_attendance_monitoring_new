<?php

namespace App\Services\HumanResource;

use App\Data\HumanResource\ConvertedTardinessRecordManagement\ConvertedTardinessRecordFilter;
use App\Models\Administrator\Employee;
use App\Models\HumanResource\HrTardinessBatch;
use App\Models\HumanResource\HrTardinessConversion;
use App\Repositories\HumanResource\ConvertedTardinessRecordRepository;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;

class ConvertedTardinessRecordService
{
    public function __construct(
        private readonly ConvertedTardinessRecordRepository $repository,
    ) {}

    public function pageData(Request $request): array
    {
        $filter = ConvertedTardinessRecordFilter::fromRequest($request);
        $records = $this->repository->paginatedRecords($filter);
        $monthlySummaries = $this->repository->monthlySummaries(
            $records->getCollection()->pluck('id'),
            $filter,
        );

        $records->setCollection(
            $records
                ->getCollection()
                ->map(fn (Employee $employee) => $this->employeeRecordPayload(
                    $employee,
                    $monthlySummaries->get($employee->id, collect()),
                )),
        );

        return [
            'records' => $records,
            'batchHistory' => $this->repository
                ->batchHistory($filter)
                ->through(fn (HrTardinessBatch $batch) => $this->batchHistoryPayload($batch)),
            'selectedBatch' => Inertia::optional(fn () => $this->selectedBatchPayload($request)),
            'limit' => $filter->limit,
            'search' => $filter->search,
            'year' => $filter->year,
            'years' => fn () => $this->repository->availableYears(),
        ];
    }

    public function suggestions(Request $request): array
    {
        $filter = ConvertedTardinessRecordFilter::fromRequest($request);

        return $this->repository
            ->suggestionEmployees($filter)
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

    public function batchData(HrTardinessBatch $batch): array
    {
        $start = Carbon::parse($batch->start_month);
        $end = Carbon::parse($batch->end_month);

        return [
            'batch' => [
                'id' => $batch->id,
                'month_range' => $this->monthRangeLabel($start, $end),
            ],
            'records' => $this->repository->batchRecords($batch),
        ];
    }

    private function employeeRecordPayload(Employee $employee, $monthlySummaries): array
    {
        $months = collect(range(1, 12))
            ->mapWithKeys(fn (int $month) => [$month => [
                'total_tardy' => 0,
                'batches' => [],
            ]])
            ->all();
        $records = collect();

        foreach ($monthlySummaries as $summary) {
            $month = (int) $summary->start_month;

            if (! isset($months[$month])) {
                continue;
            }

            $batchItems = $this->summaryBatchItems((string) $summary->batch_items);
            $totalTardy = (float) $summary->total_tardy;
            $endMonth = (int) $summary->end_month;

            $months[$month]['total_tardy'] = $totalTardy;
            $months[$month]['batches'] = $batchItems->map(fn (array $batch) => [
                'batch_id' => $batch['batch_id'],
                'month' => $batch['month'],
            ])->values()->all();

            $records->push([
                'batch_id' => $batchItems->pluck('batch_id')->join(', '),
                'month' => $batchItems->pluck('month')->join("\n"),
                'start_month' => $month,
                'end_month' => min(max($endMonth, $month), 12),
                'total_tardy' => $totalTardy,
                'batches' => $batchItems->values()->all(),
            ]);
        }

        return [
            'id' => $employee->id,
            'employee_id' => $employee->id,
            'employee' => $this->employeePayload($employee),
            'records' => $records->values(),
            'months' => $months,
            'total_tardy' => $records->sum(fn (array $record) => (float) $record['total_tardy']),
        ];
    }

    private function summaryBatchItems(string $batchItems)
    {
        return collect(explode(';;', $batchItems))
            ->filter()
            ->map(function (string $item) {
                [$batchId, $startMonth, $endMonth] = array_pad(
                    explode('|', $item),
                    3,
                    null,
                );
                $start = Carbon::parse($startMonth)->startOfMonth();
                $end = Carbon::parse($endMonth)->startOfMonth();

                return [
                    'batch_id' => $batchId,
                    'month' => $this->monthRangeLabel($start, $end),
                    'start_month' => (int) $start->month,
                    'end_month' => (int) $end->month,
                ];
            });
    }

    private function batchHistoryPayload(HrTardinessBatch $batch): array
    {
        $start = Carbon::parse($batch->start_month)->startOfMonth();
        $end = Carbon::parse($batch->end_month)->startOfMonth();

        return [
            'id' => $batch->id,
            'converted_at' => optional($batch->created_at)->toIso8601String(),
            'month_range' => $this->monthRangeLabel($start, $end),
            'employee_count' => $batch->tardiness_conversions_count
                ?? $batch->tardinessConversions->count(),
        ];
    }

    private function selectedBatchPayload(Request $request): ?array
    {
        $batchId = (int) $request->query('batch_id', 0);

        if ($batchId < 1) {
            return null;
        }

        $batch = $this->repository->batchDetails($batchId);

        return $batch ? $this->batchDetailsPayload($batch) : null;
    }

    private function batchDetailsPayload(HrTardinessBatch $batch): array
    {
        $start = Carbon::parse($batch->start_month)->startOfMonth();
        $end = Carbon::parse($batch->end_month)->startOfMonth();

        return [
            'id' => $batch->id,
            'converted_at' => optional($batch->created_at)->toIso8601String(),
            'month_range' => $this->monthRangeLabel($start, $end),
            'employees' => $batch->tardinessConversions
                ->map(fn (HrTardinessConversion $record) => [
                    'id' => $record->id,
                    'employee_id' => $record->employee_id,
                    'employee' => $this->employeePayload($record->employee),
                    'total_tardy' => $record->total_tardy,
                    'total_hours' => $record->total_hours,
                    'total_minutes' => $record->total_minutes,
                    'total_equivalent' => $record->total_equivalent,
                ])
                ->values(),
        ];
    }

    private function employeePayload($employee): array
    {
        if (! $employee) {
            return [
                'id' => null,
                'first_name' => null,
                'middle_name' => null,
                'last_name' => null,
                'full_name' => 'Unknown Employee',
                'profile_img' => null,
                'position' => null,
                'office' => null,
            ];
        }

        return [
            'id' => $employee->id,
            'first_name' => $employee->first_name,
            'middle_name' => $employee->middle_name,
            'last_name' => $employee->last_name,
            'full_name' => $this->employeeName($employee),
            'profile_img' => $employee->profile_img,
            'position' => $employee->position,
            'office' => $employee->office ? [
                'id' => $employee->office->id,
                'name' => $employee->office->name,
                'division' => $employee->office->division ? [
                    'id' => $employee->office->division->id,
                    'code' => $employee->office->division->code,
                    'name' => $employee->office->division->name,
                ] : null,
            ] : null,
        ];
    }

    private function employeeName($employee): string
    {
        return trim(preg_replace('/\s+/', ' ', trim(implode(' ', array_filter([
            $employee->first_name,
            $employee->middle_name,
            $employee->last_name,
        ]))))) ?: 'Employee #'.$employee->id;
    }

    private function monthRangeLabel(Carbon $start, Carbon $end): string
    {
        return $start->format('F Y') === $end->format('F Y')
            ? $start->format('F Y')
            : $start->format('F').' - '.$end->format('F Y');
    }
}
