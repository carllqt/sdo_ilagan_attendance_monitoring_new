import React from "react";
import { Head, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import LocatorSlipTable from "@/Pages/Employee/LocatorSlip/Partials/LocatorSlipTable";
import TravelOrderTable from "@/Pages/Employee/TravelOrder/Partials/TravelOrderTable";
import ApplicationLeaveTable from "@/Pages/Employee/ApplicationLeave/Partials/ApplicationLeaveTable";

const slipTypes = [
    { value: "locator-slip", label: "LocatorSlip" },
    { value: "travel-order", label: "TravelOrder" },
    { value: "application-leave", label: "ApplicationLeave" },
];

export default function Index({
    selectedType = "locator-slip",
    locator_slips = null,
    travel_orders = null,
    leave_applications = null,
    filters = {},
}) {
    const handleTypeChange = (type) => {
        router.get(
            route("slip-monitoring.index"),
            { type },
            {
                preserveScroll: true,
                replace: true,
            },
        );
    };

    return (
        <AuthenticatedLayout header={["Administrator", "Slip Monitoring"]}>
            <Head title="Slip Monitoring" />

            <section className="space-y-4">
                <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h1 className="text-xl font-bold text-slate-950">
                                Slip Monitoring
                            </h1>
                            <p className="mt-1 text-sm text-slate-500">
                                Choose a slip type to review submitted records.
                                Each list shows 10 records per page.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {slipTypes.map((type) => (
                                <button
                                    key={type.value}
                                    type="button"
                                    onClick={() => handleTypeChange(type.value)}
                                    className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                                        selectedType === type.value
                                            ? "bg-blue-700 text-white"
                                            : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                                    }`}
                                >
                                    {type.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {selectedType === "locator-slip" && locator_slips && (
                    <LocatorSlipTable
                        slips={locator_slips.data || []}
                        filters={filters}
                        locator_slips={locator_slips}
                        filterRoute="slip-monitoring.index"
                        filterParams={{ type: selectedType }}
                    />
                )}

                {selectedType === "travel-order" && travel_orders && (
                    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
                        <TravelOrderTable
                            travelOrders={travel_orders.data || []}
                            pagination={travel_orders}
                        />
                    </div>
                )}

                {selectedType === "application-leave" &&
                    leave_applications && (
                        <ApplicationLeaveTable
                            applications={leave_applications.data || []}
                            filters={filters}
                            leaveApplications={leave_applications}
                            filterRoute="slip-monitoring.index"
                            filterParams={{ type: selectedType }}
                        />
                    )}
            </section>
        </AuthenticatedLayout>
    );
}
