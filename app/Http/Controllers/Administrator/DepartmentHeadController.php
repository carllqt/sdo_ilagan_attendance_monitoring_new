<?php

namespace App\Http\Controllers\Administrator;

use App\Http\Controllers\Controller;
use App\Models\Administrator\Employee;
use App\Models\Station;
use App\Models\DepartmentHead;
use App\Models\Department;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Throwable;

class DepartmentHeadController extends Controller
{
    public function index()
    {
        $dept_heads = DepartmentHead::with([
            'employee:id,first_name,middle_name,last_name,position,department_id,work_type'
        ])
            ->where('type', 'department_head')
            ->latest()
            ->get();

        $departments = Department::select('id', 'name')->get();

        $employees = Employee::select(
            'id',
            'first_name',
            'middle_name',
            'last_name',
            'work_type',
            'position',
            'department_id',
            'station_id'
        )->get();

        $assignedDepartments = $dept_heads
            ->map(fn($h) => $h->employee?->department_id)
            ->filter()
            ->unique()
            ->values()
            ->toArray();

        return Inertia::render('Admin/DepartmentHead/DepartmentHead', [
            'dept_heads' => $dept_heads,
            'departments' => $departments,
            'employees' => $employees,
            'assignedDepartments' => $assignedDepartments,
        ]);
    }

    public function storeHead(Request $request)
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
        ]);

        $employee = Employee::findOrFail($validated['employee_id']);

        // 🚫 Ensure employee has a department
        if (!$employee->department_id) {
            return back()->withErrors([
                'employee' => 'Selected employee is not assigned to any department.'
            ]);
        }

        // 🚫 Prevent duplicate department head per department
        $exists = DepartmentHead::where('type', 'department_head')
            ->whereHas('employee', function ($q) use ($employee) {
                $q->where('department_id', $employee->department_id);
            })
            ->exists();

        if ($exists) {
            return back()->withErrors([
                'department' => 'This department already has a head assigned.'
            ]);
        }

        // 🚫 Prevent same employee from being assigned twice
        $alreadyAssigned = DepartmentHead::where('employee_id', $employee->id)
            ->where('type', 'department_head')
            ->exists();

        if ($alreadyAssigned) {
            return back()->withErrors([
                'employee' => 'This employee is already assigned as a department head.'
            ]);
        }

        // ✅ Create
        DepartmentHead::create([
            'employee_id' => $employee->id,
            'type' => 'department_head',
        ]);

        return back()->with('success', 'Department head added successfully!');
    }

    public function destroy(Request $request, $id)
    {
        try {
            $request->validate([
                'password' => ['required', 'current_password'],
            ]);

            $record = DepartmentHead::findOrFail($id);
            $record->delete();

            return back()->with('success', 'Deleted successfully.');
        } catch (Throwable $e) {
            return back()->with('error', 'Failed to delete.');
        }
    }

    public function storeDepartment(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:departments,name',
        ]);

        Department::create([
            'name' => $validated['name'],
        ]);

        return back()->with('success', 'Department created successfully!');
    }
}