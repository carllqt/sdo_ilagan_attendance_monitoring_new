<?php

namespace App\Http\Controllers\Administrator;

use App\Http\Controllers\Controller;
use App\Models\Administrator\TardinessRecord;
use App\Services\HourNormalization;
use Inertia\Inertia;
use Carbon\Carbon;

class TardinessRecordController extends Controller
{
    public function index()
    {
        $records = TardinessRecord::with('employee')
            ->get()
            ->groupBy('employee_id')
            ->map(function ($employeeRecords) {
                $employee = $employeeRecords->first()->employee;

                // Structure: year => [month => sum]
                $tardyPerMonths = [];
                $tardyPerYear = [];

                $employeeRecords->groupBy(function ($record) {
                    return Carbon::parse($record->date)->year;
                })->each(function ($yearGroup, $year) use (&$tardyPerMonths, &$tardyPerYear) {
                    $months = array_fill(1, 12, 0);

                    foreach ($yearGroup as $record) {
                        $monthNum = Carbon::parse($record->date)->month;
                        $months[$monthNum] = HourNormalization::sum([
                            $months[$monthNum],
                            $record->converted_tardy
                        ]);
                    }

                    $tardyPerMonths[$year] = $months;
                    $tardyPerYear[$year] = HourNormalization::sum(array_values($months));
                });

                return [
                    'employee'       => $employee,
                    'tardyPerMonths' => $tardyPerMonths,
                    'tardyPerYear'   => $tardyPerYear,
                ];
            })
            ->values();

        return Inertia::render('Admin/TardinessSummaryManagement/TardySummary', [
            'summary' => $records,
        ]);
    }
}