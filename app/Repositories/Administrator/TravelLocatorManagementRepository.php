<?php

namespace App\Repositories\Administrator;

use App\Data\Administrator\TravelLocatorManagement\TravelLocatorRequestFilter;
use App\Models\Administrator\Employee;
use App\Models\EmployeeTravelOrder;
use App\Models\LocatorSlipRequest;
use App\Models\TravelOrderRequest;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

class TravelLocatorManagementRepository
{
    public function locatorSlipRequests(TravelLocatorRequestFilter $filter)
    {
        $query = LocatorSlipRequest::query()
            ->with('station:id,name,code');

        $this->applyStation($query, $filter);
        $this->applySearch($query, $filter, [
            'employee_name',
            'email',
            'position',
            'purpose_of_travel',
            'destination',
            'travel_type',
            'status',
        ]);

        return $query
            ->latest()
            ->paginate($filter->limit, ['*'], 'locator_page', $filter->page)
            ->withQueryString();
    }

    public function travelOrderRequests(TravelLocatorRequestFilter $filter)
    {
        $query = TravelOrderRequest::query();

        $this->applyStation($query, $filter);
        $this->applySearch($query, $filter, [
            'employee_name',
            'destination',
            'host_of_activity',
            'fund_source',
            'status',
        ], includeStation: false);

        $paginator = $query
            ->latest()
            ->paginate($filter->limit, [
                'id',
                'employee_id',
                'first_name',
                'middle_name',
                'last_name',
                'employee_name',
                'destination',
                'host_of_activity',
                'inclusive_dates',
                'fund_source',
                'status',
                'created_at',
                'station_id',
            ], 'travel_page', $filter->page)
            ->withQueryString();

        $employeesById = Employee::query()
            ->whereIn(
                'id',
                $paginator->getCollection()
                    ->pluck('employee_id')
                    ->filter()
                    ->unique()
                    ->values(),
            )
            ->where('active_status', 1)
            ->get([
                'id',
                'first_name',
                'middle_name',
                'last_name',
                'extension_name',
                'station_id',
            ])
            ->keyBy(fn (Employee $employee) => (string) $employee->getKey());

        $paginator->setCollection(
            $paginator->getCollection()->map(function (TravelOrderRequest $request) use ($employeesById) {
                $matchedEmployee = $this->matchedEmployeeForTravelRequest(
                    $request,
                    $employeesById,
                );

                $request->setAttribute(
                    'matched_employee_id',
                    $matchedEmployee?->getKey(),
                );
                $request->setAttribute(
                    'matched_employee_name',
                    $matchedEmployee?->full_name,
                );
                $request->setAttribute(
                    'has_employee_match',
                    (bool) $matchedEmployee,
                );

                return $request;
            }),
        );

        return $paginator;
    }

    public function suggestions(string $type, string $search, ?int $stationId = null): array
    {
        if ($search === '') {
            return [];
        }

        if ($type === 'locator_slip') {
            $filter = new TravelLocatorRequestFilter($search, 1, $stationId);
            $query = LocatorSlipRequest::query()
                ->with('station:id,name,code');

            $this->applyStation($query, $filter);
            $this->applySearch($query, $filter, [
                'employee_name',
                'email',
                'position',
                'purpose_of_travel',
                'destination',
                'travel_type',
                'status',
            ]);

            return $query
                ->latest()
                ->limit(8)
                ->get(['id', 'employee_name', 'email', 'destination', 'station_id'])
                ->map(fn (LocatorSlipRequest $request) => [
                    'id' => $request->id,
                    'label' => $request->employee_name ?: 'Unnamed Request',
                    'meta' => collect([$request->email, $request->station?->name, $request->destination])
                        ->filter()
                        ->join(' - '),
                    'search' => $request->employee_name ?: $request->email,
                ])
                ->values()
                ->all();
        }

        $filter = new TravelLocatorRequestFilter($search, 1, $stationId);
        $query = TravelOrderRequest::query();

        $this->applyStation($query, $filter);
        $this->applySearch($query, $filter, [
            'employee_name',
            'destination',
            'host_of_activity',
            'fund_source',
            'status',
        ], includeStation: false);

        return $query
            ->latest()
            ->limit(8)
            ->get(['id', 'employee_name', 'destination'])
            ->map(fn (TravelOrderRequest $request) => [
                'id' => $request->id,
                'label' => $request->employee_name ?: 'Unnamed Request',
                'meta' => $request->destination ?: '-',
                'search' => $request->employee_name ?: '',
            ])
            ->values()
            ->all();
    }

    public function travelOrderRequestForApproval(int $id, int $stationId): TravelOrderRequest
    {
        return TravelOrderRequest::query()
            ->where('station_id', $stationId)
            ->findOrFail($id);
    }

    public function approveTravelOrderRequest(
        TravelOrderRequest $travelRequest,
        int $employeeId,
    ): EmployeeTravelOrder {
        return DB::transaction(function () use ($travelRequest, $employeeId) {
            $travelOrder = EmployeeTravelOrder::firstOrCreate([
                'employee_id' => $employeeId,
                'start_date' => $travelRequest->inclusive_dates,
                'end_date' => $travelRequest->inclusive_dates,
            ]);

            $travelRequest->update(['status' => 'approved']);

            return $travelOrder;
        });
    }

    public function matchedEmployeeForTravelRequest(
        TravelOrderRequest $travelRequest,
        $employeesById = null,
    ): ?Employee {
        $employee = $employeesById?->get((string) $travelRequest->employee_id);

        if (! $employee) {
            $employee = Employee::query()
                ->where('id', $travelRequest->employee_id)
                ->where('station_id', $travelRequest->station_id)
                ->where('active_status', 1)
                ->first([
                    'id',
                    'first_name',
                    'middle_name',
                    'last_name',
                    'extension_name',
                    'station_id',
                ]);
        }

        if (! $employee) {
            return null;
        }

        if ((int) $employee->station_id !== (int) $travelRequest->station_id) {
            return null;
        }

        return $this->employeeMatchesTravelRequest($employee, $travelRequest)
            ? $employee
            : null;
    }

    public function deleteTravelOrderRequest(TravelOrderRequest $travelRequest): void
    {
        $travelRequest->delete();
    }

    private function applyStation(Builder $query, TravelLocatorRequestFilter $filter): void
    {
        if (! $filter->stationId) {
            return;
        }

        $query->where('station_id', $filter->stationId);
    }

    private function applySearch(
        Builder $query,
        TravelLocatorRequestFilter $filter,
        array $columns,
        bool $includeStation = true,
    ): void
    {
        if ($filter->search === '') {
            return;
        }

        $query->where(function (Builder $query) use ($columns, $filter, $includeStation) {
            foreach ($columns as $column) {
                $query->orWhere($column, 'like', "%{$filter->search}%");
            }

            if ($includeStation) {
                $query->orWhereHas('station', function (Builder $stationQuery) use ($filter) {
                    $stationQuery->where('name', 'like', "%{$filter->search}%")
                        ->orWhere('code', 'like', "%{$filter->search}%");
                });
            }
        });
    }

    private function employeeMatchesTravelRequest(
        Employee $employee,
        TravelOrderRequest $travelRequest,
    ): bool {
        return $this->normalizeName($employee->first_name) === $this->normalizeName($travelRequest->first_name)
            && $this->normalizeName($employee->middle_name) === $this->normalizeName($travelRequest->middle_name)
            && $this->normalizeName($employee->last_name) === $this->normalizeName($travelRequest->last_name);
    }

    private function normalizeName(?string $value): string
    {
        return strtolower(
            preg_replace('/\s+/', ' ', trim((string) $value)),
        );
    }
}
