<?php

use Illuminate\Support\Facades\Mail;

use App\Http\Controllers\Administrator\{
    AttendanceController,
    DailyTimeRecordController,
    EmployeeManagementController,
    TardinessSummaryManagementController,
    AttendanceManagementController,
    DepartmentManagementController,
    StationManagementController,
    TravelLocatorManagementController
};
use App\Http\Controllers\HumanResource\{
    TardinessConversionController,
    ConvertedTardinessRecordManagementController,
    VacationLeaveController,
    SickLeaveController,
};
use App\Http\Controllers\AttendanceMonitoringController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\DocumentPdfController;
use App\Http\Controllers\EmployeeProfileImageController;
use App\Http\Controllers\DocumentRequestController;
use App\Http\Controllers\PositionController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/


Route::get('/', [AuthenticatedSessionController::class, 'create'])->name('landing');
Route::get('/employee-profile-images/{filename}', [EmployeeProfileImageController::class, 'show'])
    ->where('filename', '[^/]+')
    ->name('employee-profile-images.show');

Route::get('/attendance-monitoring', [AttendanceMonitoringController::class, 'index'])->name('attendance-monitoring');
Route::get('/attendance-monitoring/employees-page', [AttendanceMonitoringController::class, 'employeesPage'])->name('attendance-monitoring.employees-page');
Route::get('/attendance-monitoring/stations/suggestions', [AttendanceMonitoringController::class, 'stationSuggestions'])->name('attendance-monitoring.stations.suggestions');
Route::get('/attendance-monitoring/employees/suggestions', [AttendanceMonitoringController::class, 'employeeSuggestions'])->name('attendance-monitoring.employees.suggestions');
Route::post('/document-requests', [DocumentRequestController::class, 'store'])->name('document-requests.store');
Route::post('/document-pdfs/{type}', [DocumentPdfController::class, 'store'])
    ->whereIn('type', ['locator-slip', 'travel-order'])
    ->name('document-pdfs.store');


/*
|--------------------------------------------------------------------------
| Authenticated & Verified Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'role:sdo_admin|sdo_hr|school_admin'])->group(function () {

    Route::get('/attendance', [AttendanceController::class, 'index'])->name('attendance');
    Route::get('/attendance/suggestions', [AttendanceController::class, 'suggestions'])->name('attendance.suggestions');
    Route::post('/attendance/scan', [AttendanceController::class, 'scan'])->name('attendance.scan');
    Route::post('/attendance/choice', [AttendanceController::class, 'choice'])->name('attendance.choice');
    Route::post('/attendance-monitoring/broadcast', [AttendanceMonitoringController::class, 'broadcast'])->name('attendance-monitoring.broadcast');
    Route::get('/attendance-monitoring/live-test', [AttendanceMonitoringController::class, 'liveTest'])->name('attendance-monitoring.live-test');
    Route::post('/attendance-monitoring/live-test', [AttendanceMonitoringController::class, 'triggerLiveTest'])->name('attendance-monitoring.live-test.trigger');

    //Attendance Management
    Route::get('/attendance-management', [AttendanceManagementController::class, 'index'])->name('attendance-management');
    Route::post('/attendance-management/{id}/update', [AttendanceManagementController::class, 'update'])->name('attendance-management.update');
    Route::post('/attendance-management/create', [AttendanceManagementController::class, 'store'])->name('attendance-management.create');
    Route::post('/attendance-management/travel-orders', [AttendanceManagementController::class, 'storeTravelOrder'])->name('attendance-management.travel-orders.store');

    // Travel and Locator Requests
    Route::get('/travel-locator-management/suggestions', [TravelLocatorManagementController::class, 'suggestions'])->name('travel-locator-management.suggestions');
    Route::post('/travel-locator-management/travel-orders/{id}/approve', [TravelLocatorManagementController::class, 'approveTravelOrder'])->name('travel-locator-management.travel-orders.approve');
    Route::delete('/travel-locator-management/travel-orders/{id}', [TravelLocatorManagementController::class, 'deleteTravelOrder'])->name('travel-locator-management.travel-orders.delete');
    Route::get('/travel-locator-management', [TravelLocatorManagementController::class, 'index'])->name('travel-locator-management');

    // Daily Time Records
    Route::controller(DailyTimeRecordController::class)
        ->prefix('daily-time-record')
        ->group(function () {
            Route::get('/', 'index')->name('daily-time-record');
            Route::get('/suggestions', 'suggestions')->name('daily-time-record.suggestions');
            Route::get('/offices', 'offices')->name('daily-time-record.offices');
            Route::post('/tardiness/compute', 'computeTardiness')->name('daily-time-record.tardiness.compute');
            Route::get('/employees/{employeeId}/details', 'details')->name('daily-time-record.details');
            Route::post('/employees/{employeeId}/recompute', 'recompute')->name('daily-time-record.recompute');
            Route::post('/employees/{employeeId}/recompute/undo', 'undoRecompute')->name('daily-time-record.recompute.undo');
            Route::post('/work-types', 'storeWorkType')->name('daily-time-record.work-types.store');
            Route::put('/work-types/{workType}', 'updateWorkType')->name('daily-time-record.work-types.update');
            Route::delete('/work-types/{workType}', 'destroyWorkType')->name('daily-time-record.work-types.destroy');
            Route::post('/work-schedules', 'storeWorkSchedule')->name('daily-time-record.work-schedules.store');
            Route::put('/work-schedules/{workSchedule}', 'updateWorkSchedule')->name('daily-time-record.work-schedules.update');
            Route::delete('/work-schedules/{workSchedule}', 'destroyWorkSchedule')->name('daily-time-record.work-schedules.destroy');
        });

    // Admin Tardiness Records
    Route::get('/tardiness-summary/suggestions', [TardinessSummaryManagementController::class, 'suggestions'])->name('tardiness-summary.suggestions');
    Route::get('/tardiness-summary', [TardinessSummaryManagementController::class, 'index'])->name('tardiness-summary');

    // HR Tardiness Records
    Route::get('/converted-tardiness-record-management/suggestions', [ConvertedTardinessRecordManagementController::class, 'suggestions'])->name('converted-tardiness-record.suggestions');
    Route::get('/converted-tardiness-record-management', [ConvertedTardinessRecordManagementController::class, 'index'])->name('converted-tardiness-record');
    Route::get('/converted-tardiness-record-management/{batch}', [ConvertedTardinessRecordManagementController::class, 'show'])->name('converted-tardiness-record.batch');

    // HR Tardiness Conversion
    Route::get('/tardiness-conversion/suggestions', [TardinessConversionController::class, 'suggestions'])->name('tardiness-conversion.suggestions');
    Route::get('/tardiness-conversion', [TardinessConversionController::class, 'index'])->name('tardiness-conversion');
    Route::post('/tardiness-conversions/store', [TardinessConversionController::class, 'store'])->name('tardiness-conversion.store');
    Route::put('/tardiness-conversions/{type}/{id}', [TardinessConversionController::class, 'update'])->where('type', 'hours|minutes')->whereNumber('id')->name('tardiness-conversions.update');

    //Employee Managements
    Route::get('/employee-management/suggestions', [EmployeeManagementController::class, 'suggestions'])->name('employees.suggestions');
    Route::get('/employee-management', [EmployeeManagementController::class, 'index'])->name('employee-management');
    Route::post('/employeestore', [EmployeeManagementController::class, 'store'])->name('employees.store');
    Route::put('/employeeedit/{id}', [EmployeeManagementController::class, 'update'])->name('employees.update');

    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::middleware(['role:sdo_admin'])->group(function () {
    // Department Management
    Route::get('/department-management', [DepartmentManagementController::class, 'index'])->name('department-management');
    Route::get('/department-management/employees', [DepartmentManagementController::class, 'employeeCandidates'])->name('department.employees');
    Route::get('/department-management/office-heads', [DepartmentManagementController::class, 'officeHeadRows'])->name('department.office-heads');
    Route::get('/department-management/office-heads/suggestions', [DepartmentManagementController::class, 'officeHeadSuggestions'])->name('department.office-heads.suggestions');
    Route::post('/department-management/office-heads', [DepartmentManagementController::class, 'storeHead'])->name('departmenthead.storeHead');
    Route::post('/department-management/division-heads', [DepartmentManagementController::class, 'storeDivisionHead'])->name('divisionhead.storeDivisionHead');
    Route::post('/department-management/divisions', [DepartmentManagementController::class, 'storeDepartment'])->name('division.storeDivision');
    Route::put('/department-management/divisions/{id}', [DepartmentManagementController::class, 'updateDepartment'])->name('department.updateDepartment');
    Route::delete('/department-management/office-heads/{id}', [DepartmentManagementController::class, 'destroy'])->name('departmenthead.destroy');
    Route::delete('/department-management/division-heads/{id}', [DepartmentManagementController::class, 'destroyDivisionHead'])->name('divisionhead.destroy');
    Route::delete('/department-management/divisions/{id}', [DepartmentManagementController::class, 'destroyDepartment'])->name('department.destroy');
    Route::post('/department-management/offices', [DepartmentManagementController::class, 'storeOffice'])->name('office.storeOffice');
    Route::put('/department-management/offices/{id}', [DepartmentManagementController::class, 'updateOffice'])->name('office.updateOffice');
    Route::delete('/department-management/offices/{id}', [DepartmentManagementController::class, 'destroyOffice'])->name('office.destroy');
    Route::post('/department-management/suggest-names', [DepartmentManagementController::class, 'suggestDepartmentNames'])->name('departmentnames.suggest');

    //Station Management
    Route::get('/stations/suggestions', [StationManagementController::class, 'suggestions'])->name('stations.suggestions');
    Route::get('/stations/admin/list', [StationManagementController::class, 'adminRows'])->name('stationadmin.list');
    Route::get('/stations/list', [StationManagementController::class, 'stationRows'])->name('stations.list');
    Route::get('/stations', [StationManagementController::class, 'index'])->name('stations');
    Route::get('/station-management', [StationManagementController::class, 'index'])->name('station-management');
    Route::post('/stations', [StationManagementController::class, 'storeStation'])->name('stations.store');
    Route::get('/stations/admin/employees', [StationManagementController::class, 'adminEmployeeCandidates'])->name('stationadmin.employees');
    Route::post('/stations/admin', [StationManagementController::class, 'store'])->name('stationadmin.store');
    Route::delete('/stations/admin/{id}', [StationManagementController::class, 'destroy'])->name('stationadmin.destroy');
    Route::put('/station-assignments/{stationAssignment}', [StationManagementController::class, 'updateStationAssignment'])->name('stationassignments.update');
    Route::delete('/station-assignments/{stationAssignment}', [StationManagementController::class, 'destroyStationAssignment'])->name('stationassignments.destroy');
    Route::put('/stations/{station}', [StationManagementController::class, 'updateStation'])->name('stations.update');
    Route::delete('/stations/{station}', [StationManagementController::class, 'destroyStation'])->name('stations.destroy');
});


Route::get('/test-role', function () {
    dd(auth()->user()->getRoleNames());
})->middleware('auth');

Route::get('/test-mail', function () {
    Mail::raw('This is a test email from Laravel.', function ($message) {
        $message->to('reycarlmedico@gmail.com')
                ->subject('Laravel SMTP Test');
    });

    return 'Mail sent.';
});

/*
|--------------------------------------------------------------------------
| Auth Routes (Login, Register, Password, etc.)
|--------------------------------------------------------------------------
*/
require __DIR__ . '/auth.php';
