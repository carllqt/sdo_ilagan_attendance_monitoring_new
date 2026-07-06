import { useEffect, useRef, useState } from "react";
import { router } from "@inertiajs/react";

const buildQuery = (locatorFilters, travelFilters) => ({
    locator_page: Number(locatorFilters.page ?? 1),
    locator_search: locatorFilters.search || "",
    locator_station_id: locatorFilters.station_id || "",
    travel_page: Number(travelFilters.page ?? 1),
    travel_search: travelFilters.search || "",
    travel_station_id: travelFilters.station_id || "",
});

const useTravelLocatorManagement = ({ locatorFilters, travelFilters }) => {
    const [currentLocatorFilters, setCurrentLocatorFilters] =
        useState(locatorFilters);
    const [currentTravelFilters, setCurrentTravelFilters] =
        useState(travelFilters);
    const [locatorLoading, setLocatorLoading] = useState(false);
    const [travelLoading, setTravelLoading] = useState(false);
    const locatorFiltersRef = useRef(locatorFilters);
    const travelFiltersRef = useRef(travelFilters);

    useEffect(() => {
        locatorFiltersRef.current = locatorFilters;
        setCurrentLocatorFilters(locatorFilters);
    }, [locatorFilters]);

    useEffect(() => {
        travelFiltersRef.current = travelFilters;
        setCurrentTravelFilters(travelFilters);
    }, [travelFilters]);

    const updateLocatorRequests = (values = {}) => {
        if (locatorLoading) return;

        const next = { ...locatorFiltersRef.current, ...values };
        const query = buildQuery(next, travelFiltersRef.current);

        locatorFiltersRef.current = next;
        setCurrentLocatorFilters(next);
        setLocatorLoading(true);

        router.visit(route("travel-locator-management", query), {
            only: ["locator_slip_requests", "locator_filters"],
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onFinish: () => setLocatorLoading(false),
        });
    };

    const updateTravelRequests = (values = {}) => {
        if (travelLoading) return;

        const next = { ...travelFiltersRef.current, ...values };
        const query = buildQuery(locatorFiltersRef.current, next);

        travelFiltersRef.current = next;
        setCurrentTravelFilters(next);
        setTravelLoading(true);

        router.visit(route("travel-locator-management", query), {
            only: ["travel_order_requests", "travel_filters"],
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onFinish: () => setTravelLoading(false),
        });
    };

    return {
        currentLocatorFilters,
        currentTravelFilters,
        locatorLoading,
        travelLoading,
        updateLocatorRequests,
        updateTravelRequests,
    };
};

export default useTravelLocatorManagement;
