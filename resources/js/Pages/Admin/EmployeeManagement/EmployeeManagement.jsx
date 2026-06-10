import React from "react";
import { Head, usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { UserCog } from "lucide-react";

import EmployeeRegistration from "./Partials/EmployeeRegistration";
import EmployeeList from "./Partials/EmployeeList";
import EmployeeEditDialog from "./Partials/EmployeeEditDialog";
import FingerprintRegistrationPanel from "./Partials/EmployeeFingerprintPanel";
import useEmployeeEditModal from "./hooks/useEmployeeEditModal";
import useEmployeeFilters from "./hooks/useEmployeeFilters";
import useEmployeeManagementData from "./hooks/useEmployeeManagementData";
import useFingerprintPanel from "./hooks/useFingerprintPanel";
import { defaultFingerprintServiceUrl, statusOptions } from "./utils";

const EmployeeManagement = ({
    filteredEmployeesList,
    offices = [],
    workSchedules = [],
    stations,
    userStationId,
    search = "",
    status = "Active",
    officeName = "all",
    limit = 10,
    editEmployeeModal = null,
    selectedFingerprintEmployee: selectedFingerprintEmployeeProp = null,
    testFingerprintModal = false,
    fingerprintServiceUrl = defaultFingerprintServiceUrl,
}) => {
    const authUser = usePage().props.auth?.user;
    const userRoles = authUser?.roles || [];
    const isSchoolAdmin = userRoles.includes("school_admin");
    const { filteredEmployees, sortedOffices, sortedStations } =
        useEmployeeManagementData({
            filteredEmployeesList,
            offices,
            stations,
        });
    const { closeEditEmployeeModal, editForm, handleEdit, setEditForm } =
        useEmployeeEditModal(editEmployeeModal);

    const {
        availableFingers,
        cancelScan,
        clearFingerprintEmployee,
        handleTestFingerprintOpenChange,
        isRegistered,
        registerFingerprint,
        scanFeedbackKey,
        scanMessage,
        scanStatus,
        scanning,
        selectedEmployee,
        selectedFingerprintEmployee,
        selectFingerprintEmployee,
        setSelectedEmployee,
        setSelectedFingerprintEmployee,
        startTestFingerprint,
        testMessage,
        testOpen,
        testStatus,
    } = useFingerprintPanel({
        filteredEmployees,
        fingerprintServiceUrl,
        isSchoolAdmin,
        selectedFingerprintEmployeeProp,
        testFingerprintModal,
    });

    const {
        applyEmployeeFilters,
        employeesLoading,
        searchInput,
        selectedOffice,
        setSearchInput,
        setSelectedOffice,
        setStatusFilter,
        statusFilter,
    } = useEmployeeFilters({
        filteredEmployees,
        limit,
        officeName,
        offices: sortedOffices,
        search,
        selectedEmployee,
        selectedFingerprintEmployee,
        status,
        isSchoolAdmin,
    });

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-5">
                    <UserCog className="h-5 w-5 text-blue-600" />
                    <span>Employee Management</span>
                </div>
            }
        >
            <Head title="Employee Management" />
            <main>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <EmployeeRegistration
                        userStationId={userStationId}
                        offices={sortedOffices}
                        workSchedules={workSchedules}
                    />
                    <FingerprintRegistrationPanel
                        employees={filteredEmployees}
                        isSchoolAdmin={isSchoolAdmin}
                        selectedEmployee={selectedEmployee}
                        setSelectedEmployee={setSelectedEmployee}
                        selectedEmployeeRecord={selectedFingerprintEmployee}
                        setSelectedEmployeeRecord={
                            setSelectedFingerprintEmployee
                        }
                        onSelectEmployee={selectFingerprintEmployee}
                        onClearEmployee={clearFingerprintEmployee}
                        availableFingers={availableFingers}
                        scanning={scanning}
                        scanStatus={scanStatus}
                        scanMessage={scanMessage}
                        scanFeedbackKey={scanFeedbackKey}
                        cancelScan={cancelScan}
                        registerFingerprint={registerFingerprint}
                        testOpen={testOpen}
                        setTestOpen={handleTestFingerprintOpenChange}
                        testMessage={testMessage}
                        testStatus={testStatus}
                        startTestFingerprint={startTestFingerprint}
                    />
                </div>

                <EmployeeList
                    filteredEmployees={filteredEmployees}
                    pagination={filteredEmployeesList}
                    isLoading={employeesLoading}
                    isRegistered={isRegistered}
                    handleEdit={handleEdit}
                    searchInput={searchInput}
                    setSearchInput={setSearchInput}
                    applySearch={(value) => {
                        applyEmployeeFilters({ searchValue: value });
                    }}
                    offices={sortedOffices}
                    isSchoolAdmin={isSchoolAdmin}
                    selectedOffice={selectedOffice}
                    setSelectedOffice={setSelectedOffice}
                    statusOptions={statusOptions}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                    applyFilters={applyEmployeeFilters}
                />

                <EmployeeEditDialog
                    editForm={editForm}
                    setEditForm={setEditForm}
                    editOpen={!!editEmployeeModal}
                    setEditOpen={(nextOpen) => {
                        if (!nextOpen) closeEditEmployeeModal();
                    }}
                    offices={sortedOffices}
                    stations={sortedStations}
                    workSchedules={workSchedules}
                    userStationId={userStationId}
                />
            </main>
        </AuthenticatedLayout>
    );
};

export default EmployeeManagement;
