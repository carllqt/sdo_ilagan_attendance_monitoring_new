<?php

namespace App\Http\Controllers\Administrator;

use App\Http\Controllers\Controller;
use App\Models\Administrator\Employee;
use App\Models\DepartmentHeadAndSchoolAdmin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Throwable;

class DepartmentHeadAndSchoolAdminController extends Controller
    {
    public function index()
    {
        $query = DepartmentHeadAndSchoolAdmin::with([
            'employee:id,first_name,middle_name,last_name,position,department,work_type'
        ])
        ->when(request('department'), function ($q, $department) {
            $q->whereHas('employee', function ($query) use ($department) {
                $query->where('department', $department);
            });
        })
        ->when(request('search'), function ($q, $search) {
            $q->whereHas('employee', function ($query) use ($search) {
                $query->where('first_name', 'like', "%{$search}%")
                    ->orWhere('middle_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%");
            });
        })
        ->latest();

        $all = $query->get();

        $dept_heads = $all->where('type', 'department_head')->values();
        $school_admins = $all->where('type', 'school_admin')->values();

        $employees = Employee::select(
            'id',
            'first_name',
            'middle_name',
            'last_name',
            'work_type',
            'position',
            'department'
        )->get();

        $assignedDepartments = $dept_heads
            ->pluck('employee.department')
            ->toArray();

        return Inertia::render('Admin/DepartmentHead/SchoolandDepartmentHead', [
            'dept_heads' => $dept_heads,
            'school_admins' => $school_admins, 
            'employees' => $employees,
            'assignedDepartments' => $assignedDepartments,
            'queryParams' => request()->query(),
        ]);
    }

    public function departmentheadStore(Request $request)
    {
        $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'type' => 'required|in:department_head,school_admin',
        ]);

        $employee = Employee::findOrFail($request->employee_id);

        // 🔥 Only restrict department_head
        if ($request->type === 'department_head') {
            $exists = DepartmentHeadAndSchoolAdmin::where('type', 'department_head')
                ->whereHas('employee', function ($q) use ($employee) {
                    $q->where('department', $employee->department);
                })
                ->exists();

            if ($exists) {
                return back()->withErrors([
                    'department' => 'This department already has a head assigned.'
                ]);
            }
        }

        DepartmentHeadAndSchoolAdmin::create([
            'employee_id' => $employee->id,
            'type' => $request->type, 
        ]);

        return back()->with('success', 'Added successfully!');
    }

    public function destroy(Request $request, $id)
    {
        try {
            $request->validate([
                'password' => ['required', 'current_password'],
            ]);

            $record = DepartmentHeadAndSchoolAdmin::findOrFail($id);
            $record->delete();

            return back()->with('success', 'Deleted successfully.');
        } catch (Throwable $e) {
            return back()->with('error', 'Failed to delete.');
        }
    }
}
