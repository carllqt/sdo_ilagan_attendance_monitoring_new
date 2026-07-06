<?php

namespace App\Repositories\Administrator;

use App\Data\Administrator\TravelLocatorManagement\TravelLocatorRequestFilter;
use App\Models\LocatorSlipRequest;
use App\Models\TravelOrderRequest;
use Illuminate\Database\Eloquent\Builder;

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
        $query = TravelOrderRequest::query()
            ->with('station:id,name,code');

        $this->applyStation($query, $filter);
        $this->applySearch($query, $filter, [
            'employee_name',
            'email',
            'position',
            'purpose_of_travel',
            'destination',
            'host_of_activity',
            'fund_source',
            'status',
        ]);

        return $query
            ->latest()
            ->paginate($filter->limit, ['*'], 'travel_page', $filter->page)
            ->withQueryString();
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
        $query = TravelOrderRequest::query()
            ->with('station:id,name,code');

        $this->applyStation($query, $filter);
        $this->applySearch($query, $filter, [
            'employee_name',
            'email',
            'position',
            'purpose_of_travel',
            'destination',
            'host_of_activity',
            'fund_source',
            'status',
        ]);

        return $query
            ->latest()
            ->limit(8)
            ->get(['id', 'employee_name', 'email', 'destination', 'station_id'])
            ->map(fn (TravelOrderRequest $request) => [
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

    private function applyStation(Builder $query, TravelLocatorRequestFilter $filter): void
    {
        if (! $filter->stationId) {
            return;
        }

        $query->where('station_id', $filter->stationId);
    }

    private function applySearch(Builder $query, TravelLocatorRequestFilter $filter, array $columns): void
    {
        if ($filter->search === '') {
            return;
        }

        $query->where(function (Builder $query) use ($columns, $filter) {
            foreach ($columns as $column) {
                $query->orWhere($column, 'like', "%{$filter->search}%");
            }

            $query->orWhereHas('station', function (Builder $stationQuery) use ($filter) {
                $stationQuery->where('name', 'like', "%{$filter->search}%")
                    ->orWhere('code', 'like', "%{$filter->search}%");
            });
        });
    }
}
