"use client";

import React, { useEffect, useRef, useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router, usePage } from "@inertiajs/react";
import { CalendarClock } from "lucide-react";
import { toast } from "sonner";

import EditIncompleteAttendanceDialog from "./Partials/EditIncompleteAttendanceDialog";
import IncompleteAttendanceTable from "./Partials/IncompleteAttendanceTable";
import useAttendanceEditModal from "./hooks/useAttendanceEditModal";
import useAttendanceManagementData from "./hooks/useAttendanceManagementData";

const AttendanceManagement = ({
    incomplete_attendances = {},
    offices = [],
    years = [],
    filters = {},
    editAttendanceModal = null,
}) => {
    const [currentFilters, setCurrentFilters] = useState(filters);
    const [incompleteLoading, setIncompleteLoading] = useState(false);
    const filtersRef = useRef(filters);

    const {
        sortedIncompleteAttendances,
        sortedOffices,
        yearOptions,
    } = useAttendanceManagementData({
        incompleteAttendances: incomplete_attendances,
        offices,
        years,
    });
    const {
        closeEditAttendanceModal,
        editAttendance,
        handleEdit,
        setEditAttendance,
    } = useAttendanceEditModal(editAttendanceModal);

    useEffect(() => {
        filtersRef.current = filters;
        setCurrentFilters(filters);
    }, [filters]);

    const buildQuery = (incompleteFilters) => ({
        day: Number(incompleteFilters.day),
        limit: Number(incompleteFilters.limit ?? 10),
        month: incompleteFilters.month,
        office: String(incompleteFilters.office ?? "all"),
        page: Number(incompleteFilters.page ?? 1),
        search: incompleteFilters.search || "",
        year: incompleteFilters.year,
    });

    const updateIncomplete = (values = {}) => {
        if (incompleteLoading) return;

        const next = { ...filtersRef.current, ...values };
        const query = buildQuery(next);

        filtersRef.current = next;
        setCurrentFilters(next);
        setIncompleteLoading(true);

        router.visit(route("attendance-management", query), {
            only: ["incomplete_attendances", "filters"],
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onFinish: () => setIncompleteLoading(false),
        });
    };

    const { flash } = usePage().props || {};
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
    }, [flash?.success]);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-5">
                    <CalendarClock className="h-5 w-5 text-blue-600" />
                    <span>Attendance Management</span>
                </div>
            }
        >
            <Head title="Attendance Management" />
            <main>
                <IncompleteAttendanceTable
                    records={sortedIncompleteAttendances}
                    filters={currentFilters}
                    offices={sortedOffices}
                    years={yearOptions}
                    onFilterChange={updateIncomplete}
                    handleEdit={handleEdit}
                    isLoading={incompleteLoading}
                />

                <EditIncompleteAttendanceDialog
                    attendance={editAttendance}
                    setAttendance={setEditAttendance}
                    editOpen={!!editAttendanceModal}
                    setEditOpen={(nextOpen) => {
                        if (!nextOpen) {
                            closeEditAttendanceModal();
                        }
                    }}
                />
            </main>
        </AuthenticatedLayout>
    );
};

export default AttendanceManagement;
