<?php

namespace App\Repositories\HumanResource;

use App\Data\HumanResource\ConvertedTardinessRecordManagement\ConvertedTardinessRecordFilter;
use App\Models\Administrator\Employee;
use App\Models\HumanResource\HrTardinessBatch;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class ConvertedTardinessRecordRepository
{
    public function paginatedRecords(ConvertedTardinessRecordFilter $filter): LengthAwarePaginator
    {
        return Employee::query()
            ->with([
                'office:id,name,division_id',
                'office.division:id,code,name',
                'tardinessConvertion' => fn ($query) => $query
                    ->with('batch:id,start_month,end_month')
                    ->whereHas('batch')
                    ->orderBy('batch_id'),
            ])
            ->select(
                'id',
                'first_name',
                'middle_name',
                'last_name',
                'profile_img',
                'position',
                'office_id',
            )
            ->whereHas('tardinessConvertion.batch')
            ->orderByName()
            ->paginate($filter->limit, ['*'], 'page', $filter->page)
            ->withQueryString();
    }

    public function batchRecords(HrTardinessBatch $batch): Collection
    {
        return $batch->tardinessConvertions()
            ->with('employee', 'tardinessRecords')
            ->get();
    }

    public function batchHistory(ConvertedTardinessRecordFilter $filter): LengthAwarePaginator
    {
        return HrTardinessBatch::query()
            ->with([
                'tardinessConvertions' => fn ($query) => $query
                    ->with('employee.office:id,name,division_id')
                    ->orderBy('employee_id'),
            ])
            ->withCount('tardinessConvertions')
            ->latest()
            ->paginate(
                $filter->batchHistoryLimit,
                ['*'],
                'batch_page',
                $filter->batchHistoryPage,
            )
            ->withQueryString();
    }
}
