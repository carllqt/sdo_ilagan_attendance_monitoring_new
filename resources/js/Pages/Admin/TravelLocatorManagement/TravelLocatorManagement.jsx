import React from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { ClipboardList } from "lucide-react";
import LocatorSlipTable from "./Partials/LocatorSlipTable";
import TravelOrderTable from "./Partials/TravelOrderTable";
import useTravelLocatorManagement from "./hooks/useTravelLocatorManagement";
import { emptyPagination } from "./util";

const TravelLocatorManagement = ({
    locator_slip_requests = emptyPagination,
    travel_order_requests = emptyPagination,
    locator_filters = {},
    travel_filters = {},
    station_options = [],
}) => {
    const {
        currentLocatorFilters,
        currentTravelFilters,
        locatorLoading,
        travelLoading,
        updateLocatorRequests,
        updateTravelRequests,
    } = useTravelLocatorManagement({
        locatorFilters: locator_filters,
        travelFilters: travel_filters,
    });

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-5">
                    <ClipboardList className="h-5 w-5 text-blue-600" />
                    <span>Travel & Locator Management</span>
                </div>
            }
        >
            <Head title="Travel & Locator Management" />

            <div className="space-y-5">
                <TravelOrderTable
                    records={travel_order_requests}
                    filters={currentTravelFilters}
                    isLoading={travelLoading}
                    onFilterChange={updateTravelRequests}
                    stations={station_options}
                />
                <LocatorSlipTable
                    records={locator_slip_requests}
                    filters={currentLocatorFilters}
                    isLoading={locatorLoading}
                    onFilterChange={updateLocatorRequests}
                    stations={station_options}
                />
            </div>
        </AuthenticatedLayout>
    );
};

export default TravelLocatorManagement;
