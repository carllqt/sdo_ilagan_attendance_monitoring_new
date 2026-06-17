<?php

namespace App\Http\Controllers\Administrator;

use App\Http\Controllers\Concerns\ValidatesPassword;
use App\Http\Controllers\Controller;
use App\Http\Requests\Administrator\EmployeeManagement\{StoreEmployeeRequest, UpdateEmployeeRequest};
use App\Services\Administrator\EmployeeManagementService;
use Illuminate\Http\Request;
use Inertia\Inertia;


class EmployeeManagementController extends Controller
{
    use ValidatesPassword;

    public function __construct(
        private readonly EmployeeManagementService $employees,
    ) {}
    
    public function index(Request $request)
    {
        $user = auth()->user();
        $stationId = $user->employee->station_id;
        $isSchoolAdmin = $user->hasRole('school_admin') && ! $user->hasRole('sdo_admin');

        $employeeList = null;
        $options = null;
        $employeeListData = function () use (&$employeeList, $request, $stationId, $isSchoolAdmin) {
            return $employeeList ??= $this->employees->employeeListData($request, $stationId, $isSchoolAdmin);
        };
        $pageOptions = function () use (&$options) {
            return $options ??= $this->employees->pageOptions();
        };

        return Inertia::render('Admin/EmployeeManagement/EmployeeManagement', [
            'offices' => fn () => $employeeListData()['offices'],
            'filteredEmployeesList' => fn () => $employeeListData()['filteredEmployeesList'],
            'stations' => fn () => $pageOptions()['stations'],
            'workSchedules' => fn () => $pageOptions()['workSchedules'],
            'selectedFingerprintEmployee' => fn () => $this->employees->selectedFingerprintEmployee($request, $stationId),
            'userStation' => $user->employee->station->name ?? null,
            'userStationId' => $stationId,
            'search' => fn () => $employeeListData()['search'],
            'status' => fn () => $employeeListData()['status'],
            'officeName' => fn () => $employeeListData()['officeName'],
            'limit' => fn () => $employeeListData()['limit'],
            'editEmployeeModal' => fn () => $this->employees->editModal($request, 'edit-employee'),
            'testFingerprintModal' => fn () => $this->employees->testFingerprintModal($request),
            'fingerprintServiceUrl' => fn () => $this->employees->fingerprintServiceUrl($request),
        ]);
    }

    public function suggestions(Request $request)
    {
        $user = auth()->user();
        $stationId = $user->employee->station_id;

        return response()->json(
            $this->employees->suggestions($request, $stationId),
        );
    }

    public function store(StoreEmployeeRequest $request)
    {
        $validated = $request->validated();
        $this->employees->store($validated, $request);
        $fullName = $this->employees->successName($validated);

        return redirect()->back()->with(
            'success',
            "Employee {$fullName} added successfully!",
        );
    }

    public function update(UpdateEmployeeRequest $request, $id)
    {
        $this->ensureValidPassword($request);
        
        $validated = $request->validated();
        unset($validated['password']);

        $this->employees->update((int) $id, $validated, $request);

        return back()->with('success', 'Employee updated successfully 🎉');
    }

}
