<?php

namespace App\Http\Controllers\Administrator;

use App\Http\Controllers\Concerns\HandleModalConcerns\EmployeeModals;
use App\Http\Controllers\Concerns\ValidatesPassword;
use App\Http\Controllers\Controller;
use App\Models\Administrator\Employee;
use App\Models\Administrator\Office;
use App\Models\Administrator\Station;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;


class EmployeeManagementController extends Controller
{
    use EmployeeModals;
    use ValidatesPassword;
    
    public function index(Request $request)
    {
        $user = auth()->user();
        $stationId = $user->employee->station_id;
        $limit = $this->employeeListLimit($request);

        if ((string) $request->query('limit') !== (string) $limit) {
            return redirect()->to($request->fullUrlWithQuery([
                'limit' => $limit,
            ]));
        }

        $employeeList = $this->employeeListData($request, $stationId);

        $stations = Station::select('id', 'name')->get();

        return Inertia::render('Admin/EmployeeManagement/EmployeeManagement', [
            'offices' => $employeeList['offices'],
            'filteredEmployeesList' => $employeeList['filteredEmployeesList'],
            'stations' => $stations,
            'selectedFingerprintEmployee' => $this->resolveFingerprintEmployee($stationId),
            'userStation' => $user->employee->station->name ?? null,
            'userStationId' => $stationId,
            'search' => $employeeList['search'],
            'status' => $employeeList['status'],
            'officeName' => $employeeList['officeName'],
            'limit' => $employeeList['limit'],
            'editEmployeeModal' => $this->resolveEmployeeActionModal('edit-employee'),
            'testFingerprintModal' => $this->resolveTestFingerprintModal(),
            'fingerprintServiceUrl' => $this->fingerprintServiceUrl(),
        ]);
    }

    public function list(Request $request)
    {
        $user = auth()->user();
        $stationId = $user->employee->station_id;
        $employeeList = $this->employeeListData($request, $stationId);

        return response()->json([
            'filteredEmployeesList' => $employeeList['filteredEmployeesList'],
            'search' => $employeeList['search'],
            'status' => $employeeList['status'],
            'officeName' => $employeeList['officeName'],
            'limit' => $employeeList['limit'],
        ]);
    }

    private function employeeListData(Request $request, int $stationId): array
    {
        $search = trim((string) $request->query('search', ''));
        $status = $request->query('status', 'Active');
        $officeName = trim((string) $request->query('office', 'all'));
        $officeId = 'all';
        $limit = $this->employeeListLimit($request);

        if (! in_array($status, ['Active', 'Inactive'], true)) {
            $status = 'Active';
        }

        $offices = Office::with('division:id,code,name')
            ->select('id', 'division_id', 'name')
            ->orderBy('name')
            ->get();

        if ($officeName !== '' && $officeName !== 'all') {
            $officeId = $offices
                ->firstWhere('name', $officeName)
                ?->id ?? 'all';
        }

        $filteredEmployeesList = Employee::with(['roles', 'office.division'])
            ->withCount(['biometrics'])
            ->where('station_id', $stationId)
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query->where('id', $search)
                        ->orWhere('first_name', 'like', "%{$search}%")
                        ->orWhere('middle_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhereRaw(
                            "CONCAT_WS(' ', first_name, middle_name, last_name) LIKE ?",
                            ["%{$search}%"],
                        )
                        ->orWhereRaw(
                            "CONCAT_WS(' ', id, first_name, middle_name, last_name) LIKE ?",
                            ["%{$search}%"],
                        );
                });
            })
            ->when($officeId !== 'all', function ($query) use ($officeId) {
                $query->where('office_id', (int) $officeId);
            })
            ->where('active_status', $status === 'Active' ? 1 : 0)
            ->orderBy('first_name')
            ->orderBy('middle_name')
            ->orderBy('last_name')
            ->orderBy('id')
            ->paginate($limit)
            ->withQueryString()
            ->through(fn ($emp) => $this->appendEmployeeMeta($emp));

        return [
            'offices' => $offices,
            'filteredEmployeesList' => $filteredEmployeesList,
            'search' => $search,
            'status' => $status,
            'officeName' => $officeId === 'all' ? 'all' : $officeName,
            'limit' => $limit,
        ];
    }

    private function appendEmployeeMeta($emp)
    {
        $emp->available_fingers = max(3 - (int) $emp->biometrics_count, 0);

        $emp->is_department_head = $emp->roles
            ->where('type', 'department_head')
            ->isNotEmpty();

        return $emp;
    }

    private function employeeListLimit(Request $request): int
    {
        $limit = (int) $request->query('limit', 10);

        return in_array($limit, [10, 25, 50, 100], true) ? $limit : 10;
    }

    private function fingerprintServiceUrl(): string
    {
        return rtrim(
            env('BIOMETRIC_SERVICE_URL') ?: request()->getScheme() . '://' . request()->getHost() . ':5000',
            '/',
        );
    }

    public function suggestions(Request $request)
    {
        $user = auth()->user();
        $stationId = $user->employee->station_id;
        $search = trim((string) $request->query('search', ''));
        $availableForFingerprint = $request->boolean('available_for_fingerprint');

        $employees = Employee::with('office.division:id,code,name')
            ->select(
                'id',
                'first_name',
                'middle_name',
                'last_name',
                'profile_img',
                'position',
                'office_id',
            )
            ->withCount(['biometrics'])
            ->where('station_id', $stationId)
            ->when($availableForFingerprint, function ($query) {
                $query->having('biometrics_count', '<', 3);
            })
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query->where('id', $search)
                        ->orWhere('first_name', 'like', "%{$search}%")
                        ->orWhere('middle_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhereRaw(
                            "CONCAT_WS(' ', first_name, middle_name, last_name) LIKE ?",
                            ["%{$search}%"],
                        )
                        ->orWhereRaw(
                            "CONCAT_WS(' ', id, first_name, middle_name, last_name) LIKE ?",
                            ["%{$search}%"],
                        );
                });
            })
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->limit(10)
            ->get()
            ->map(fn ($employee) => $this->formatFingerprintEmployee($employee));

        return response()->json($employees);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name' => 'required|string|max:255',
            'profile_img' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'position' => 'required|string|max:255',
            'office_id' => 'nullable|exists:offices,id',
            'work_type' => 'required|string|max:255',
            'station_id' => 'required|exists:stations,id',
        ]);

        if ($request->hasFile('profile_img')) {
            $validated['profile_img'] = $request->file('profile_img')->store(
                'employee-profile-images',
                'public',
            );
        }

        Employee::create($validated);

        $fullName = trim(
            preg_replace(
                '/\s+/',
                ' ',
                implode(' ', [
                    $validated['first_name'] ?? '',
                    $validated['middle_name'] ?? '',
                    $validated['last_name'] ?? '',
                ]),
            ),
        );

        return redirect()->back()->with(
            'success',
            "Employee {$fullName} added successfully!",
        );
    }

    public function update(Request $request, $id)
    {
        $this->ensureValidPassword($request);

        $request->validate([
            'password' => 'required',
        ]);
        
        $employee = Employee::findOrFail($id);

        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name' => 'required|string|max:255',
            'profile_img' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'position' => 'required|string|max:255',
            'office_id' => 'nullable|exists:offices,id',
            'work_type' => 'required|string|max:255',
            'active_status' => 'required|boolean',
            'station_id' => 'required|exists:stations,id',
        ]);

        if ($request->hasFile('profile_img')) {
            if ($employee->profile_img) {
                Storage::disk('public')->delete($employee->profile_img);
            }

            $validated['profile_img'] = $request->file('profile_img')->store(
                'employee-profile-images',
                'public',
            );
        }

        $employee->update($validated);

        return back()->with('success', 'Employee updated successfully 🎉');
    }
}
