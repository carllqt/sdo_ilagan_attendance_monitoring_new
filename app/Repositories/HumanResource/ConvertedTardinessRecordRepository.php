<?php

namespace App\Repositories\HumanResource;

use App\Data\HumanResource\ConvertedTardinessRecordFilter;
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
                    ->with('batch:id,batch_code,start_month,end_month')
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
}
