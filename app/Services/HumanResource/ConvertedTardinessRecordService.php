<?php

namespace App\Services\HumanResource;

use App\Data\HumanResource\ConvertedTardinessRecordFilter;
use App\Models\Administrator\Employee;
use App\Models\HumanResource\HrTardinessBatch;
use App\Models\HumanResource\HrTardinessConvertion;
use App\Repositories\HumanResource\ConvertedTardinessRecordRepository;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class ConvertedTardinessRecordService
{
    public function __construct(
        private readonly ConvertedTardinessRecordRepository $repository,
    ) {}

    public function pageData(Request $request): array
    {
        $filter = ConvertedTardinessRecordFilter::fromRequest($request);

        return [
            'records' => $this->repository
                ->paginatedRecords($filter)
                ->through(fn (Employee $employee) => $this->employeeRecordPayload($employee)),
            'limit' => $filter->limit,
        ];
    }

    public function batchData(HrTardinessBatch $batch): array
    {
        $start = Carbon::parse($batch->start_month);
        $end = Carbon::parse($batch->end_month);

        return [
            'batch' => [
                'id' => $batch->id,
                'batch_code' => $batch->batch_code,
                'month_range' => $this->monthRangeLabel($start, $end),
            ],
            'records' => $this->repository->batchRecords($batch),
        ];
    }

    private function recordPayload(HrTardinessConvertion $record): array
    {
        $start = Carbon::parse($record->batch->start_month)->startOfMonth();
        $end = Carbon::parse($record->batch->end_month)->startOfMonth();

        return [
            'id' => $record->id,
            'batch_id' => $record->batch_id,
            'batch_code' => $record->batch->batch_code,
            'employee_id' => $record->employee_id,
            'employee' => $this->employeePayload($record->employee),
            'month' => $this->monthRangeLabel($start, $end),
            'start_month' => (int) $start->month,
            'end_month' => (int) $end->month,
            'total_tardy' => $record->total_tardy,
            'total_hours' => $record->total_hours,
            'total_minutes' => $record->total_minutes,
            'total_equivalent' => $record->total_equivalent,
        ];
    }

    private function employeeRecordPayload(Employee $employee): array
    {
        $records = $employee->tardinessConvertion
            ->filter(fn (HrTardinessConvertion $record) => $record->batch)
            ->map(fn (HrTardinessConvertion $record) => $this->recordPayload($record))
            ->values();

        $months = collect(range(1, 12))
            ->mapWithKeys(fn (int $month) => [$month => [
                'total_tardy' => 0,
                'batches' => [],
            ]])
            ->all();

        foreach ($records as $record) {
            $month = (int) $record['start_month'];

            if (! isset($months[$month])) {
                continue;
            }

            $months[$month]['total_tardy'] += (float) $record['total_tardy'];
            $months[$month]['batches'][] = [
                'batch_code' => $record['batch_code'],
                'month' => $record['month'],
            ];
        }

        return [
            'id' => $employee->id,
            'employee_id' => $employee->id,
            'employee' => $this->employeePayload($employee),
            'records' => $records,
            'months' => $months,
        ];
    }

    private function employeePayload($employee): array
    {
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
