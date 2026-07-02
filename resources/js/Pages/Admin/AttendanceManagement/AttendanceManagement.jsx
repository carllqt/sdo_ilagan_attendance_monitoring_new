"use client";

import React, { useEffect, useRef, useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router, usePage } from "@inertiajs/react";
import { CalendarClock } from "lucide-react";
import { toast } from "sonner";

import EditIncompleteAttendanceDialog from "./Partials/EditIncompleteAttendanceDialog";
import AddTravelOrderDialog from "./Partials/AddTravelOrderDialog";
import IncompleteAttendanceTable from "./Partials/IncompleteAttendanceTable";
import TravelOrderTable from "./Partials/TravelOrderTable";
import useAttendanceEditModal from "./hooks/useAttendanceEditModal";
import useAttendanceManagementData from "./hooks/useAttendanceManagementData";

const AttendanceManagement = ({
    employee_travel_orders = {},
    incomplete_attendances = {},
    offices = [],
    years = [],
    filters = {},
    travel_order_filters = {},
    editAttendanceModal = null,
}) => {
    const [currentFilters, setCurrentFilters] = useState(filters);
    const [currentTravelOrderFilters, setCurrentTravelOrderFilters] =
        useState(travel_order_filters);
    const [addTravelOrderOpen, setAddTravelOrderOpen] = useState(false);
    const [incompleteLoading, setIncompleteLoading] = useState(false);
    const [travelOrderLoading, setTravelOrderLoading] = useState(false);
    const filtersRef = useRef(filters);
    const travelOrderFiltersRef = useRef(travel_order_filters);

    const {
        sortedEmployeeTravelOrders,
        sortedIncompleteAttendances,
        sortedOffices,
        yearOptions,
    } = useAttendanceManagementData({
        employeeTravelOrders: employee_travel_orders,
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

    useEffect(() => {
        travelOrderFiltersRef.current = travel_order_filters;
        setCurrentTravelOrderFilters(travel_order_filters);
    }, [travel_order_filters]);

    const buildQuery = (incompleteFilters, travelOrderFilters) => ({
        day: Number(incompleteFilters.day),
        limit: Number(incompleteFilters.limit ?? 10),
        month: incompleteFilters.month,
        office: String(incompleteFilters.office ?? "all"),
        page: Number(incompleteFilters.page ?? 1),
        search: incompleteFilters.search || "",
        travel_order_day: Number(travelOrderFilters.day),
        travel_order_limit: Number(travelOrderFilters.limit ?? 10),
        travel_order_month: travelOrderFilters.month,
        travel_order_office: String(travelOrderFilters.office ?? "all"),
        travel_order_page: Number(travelOrderFilters.page ?? 1),
        travel_order_search: travelOrderFilters.search || "",
        travel_order_year: travelOrderFilters.year,
        year: incompleteFilters.year,
    });

    const updateIncomplete = (values = {}) => {
        if (incompleteLoading) return;

        const next = { ...filtersRef.current, ...values };
        const query = buildQuery(next, travelOrderFiltersRef.current);

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

    const updateTravelOrders = (values = {}) => {
        if (travelOrderLoading) return;

        const next = { ...travelOrderFiltersRef.current, ...values };
        const query = buildQuery(filtersRef.current, next);

        travelOrderFiltersRef.current = next;
        setCurrentTravelOrderFilters(next);
        setTravelOrderLoading(true);

        router.visit(route("attendance-management", query), {
            only: ["employee_travel_orders", "travel_order_filters"],
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onFinish: () => setTravelOrderLoading(false),
        });
    };

    const reloadTravelOrders = () => {
        if (travelOrderLoading) return;

        const query = buildQuery(filtersRef.current, travelOrderFiltersRef.current);
        setTravelOrderLoading(true);

        router.visit(route("attendance-management", query), {
            only: ["employee_travel_orders", "travel_order_filters"],
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onFinish: () => setTravelOrderLoading(false),
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

                <TravelOrderTable
                    records={sortedEmployeeTravelOrders}
                    filters={currentTravelOrderFilters}
                    offices={sortedOffices}
                    years={yearOptions}
                    onAddTravelOrder={() => setAddTravelOrderOpen(true)}
                    onFilterChange={updateTravelOrders}
                    isLoading={travelOrderLoading}
                />

                <AddTravelOrderDialog
                    open={addTravelOrderOpen}
                    onClose={() => setAddTravelOrderOpen(false)}
                    onSaved={reloadTravelOrders}
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
