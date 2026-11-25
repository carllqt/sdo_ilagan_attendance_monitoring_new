import React, { useEffect, useMemo, useRef, useState } from "react";
import { Head, router } from "@inertiajs/react";

import TalaBackground from "@/Components/TalaBackground";
import Header from "./Partials/Header";
import EmployeeList from "./Partials/EmployeeList";
import { getEmployeeName, sortAlphabetically } from "@/lib/utils";

// The page reloads its data this often to show new scans.
const AUTO_REFRESH_MS = 30 * 1000;

const toArray = (value) => {
    if (Array.isArray(value)) return value;
    if (Array.isArray(value?.data)) return value.data;
    if (value && typeof value === "object") return Object.values(value);
    return [];
};

// Each employee's status, including On Travel, comes from the server
// (AttendanceEmployeeData).
const createRows = (employees) =>
    sortAlphabetically(
        toArray(employees?.data || employees).map((employee) => {
            const employeeId = employee.employee_id || employee.id;
            const isOnTravel = Boolean(employee.on_travel);

            return {
                id: employee.id,
                employee_id: employeeId,
                name: getEmployeeName(employee) || "Unknown Employee",
                station: employee.station?.name || "Division Office",
                station_id: employee.station?.id || null,
                position: employee.position || "Employee",
                profile_img: employee.profile_img || null,
                am_in: isOnTravel ? "" : employee.am_in || "",
                am_out: isOnTravel ? "" : employee.am_out || "",
                pm_in: isOnTravel ? "" : employee.pm_in || "",
                pm_out: isOnTravel ? "" : employee.pm_out || "",
                status: employee.status || "Absent",
                isOnTravel,
            };
        }),
        "name",
    );

const AttendanceMonitoring = ({
    employees = {},
    filters = {},
    stations = [],
    recentLogs = [],
    topFirstTimeIns = [],
    travelOrders = [],
}) => {
    const stationList = useMemo(
        () => sortAlphabetically(toArray(stations), "name"),
        [stations],
    );
    const [liveEmployees, setLiveEmployees] = useState(employees);
    const [liveRecentLogs, setLiveRecentLogs] = useState(recentLogs);
    const [liveTopFirstTimeIns, setLiveTopFirstTimeIns] =
        useState(topFirstTimeIns);
    const [liveTravelOrders, setLiveTravelOrders] = useState(travelOrders);
    const [search, setSearch] = useState(filters.search || "");
    const [stationSearch, setStationSearch] = useState("");
    const [time, setTime] = useState(new Date());
    const [filterScope, setFilterScope] = useState(null);
    // When the page last got fresh data (shown in the header).
    const [lastRefreshedAt, setLastRefreshedAt] = useState(() => new Date());
    const [refreshing, setRefreshing] = useState(false);
    const [pageMotion, setPageMotion] = useState("next");
    const requestInFlightRef = useRef(false);
    const requestIdRef = useRef(0);
    const refreshRef = useRef(null);
    const selectedStation = filters.station_id || 1;
    const selectedStationCode = filters.station_code || "SDO";
    const selectedStationName =
        filters.station_name || "School Division Office";
    const hasActiveSearch = search.trim() !== "";
    const visibleEmployees = liveEmployees;
    const rows = useMemo(
        () => createRows(visibleEmployees),
        [visibleEmployees],
    );

    const visit = (overrides = {}, scope = "employees") => {
        const params = new URLSearchParams(window.location.search);

        params.set("station_code", selectedStationCode);
        params.set("station_name", selectedStationName);
        params.delete("limit");

        Object.entries(overrides).forEach(([key, value]) => {
            if (value === null || value === undefined || value === "") {
                params.delete(key);
                return;
            }

            params.set(key, value);
        });

        if (!params.get("search")) params.delete("search");
        params.delete("station_search");

        const requestId = requestIdRef.current + 1;
        requestIdRef.current = requestId;
        requestInFlightRef.current = true;
        setFilterScope(scope);

        router.get(route("attendance-monitoring"), Object.fromEntries(params), {
            preserveScroll: true,
            preserveState: true,
            replace: true,
            onFinish: () => {
                if (requestIdRef.current !== requestId) return;

                requestInFlightRef.current = false;
                setFilterScope(null);
            },
        });
    };

    useEffect(() => {
        setSearch(filters.search || "");
    }, [filters.search]);

    useEffect(() => {
        setLiveEmployees(employees);
    }, [employees]);

    useEffect(() => {
        setLiveRecentLogs(recentLogs);
    }, [recentLogs]);

    useEffect(() => {
        setLiveTopFirstTimeIns(topFirstTimeIns);
    }, [topFirstTimeIns]);

    useEffect(() => {
        setLiveTravelOrders(travelOrders);
    }, [travelOrders]);

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Show new scans: reload the side panels every 30 seconds. The employee
    // list already gets fresh data as it pages through itself (every 9
    // seconds); it is reloaded here too when it has one page or a search is
    // active, since it does not page then.
    refreshRef.current = () => {
        if (requestInFlightRef.current || document.hidden) return;

        const only = ["recentLogs", "topFirstTimeIns", "travelOrders"];

        if (hasActiveSearch || Number(liveEmployees?.last_page || 1) <= 1) {
            only.push("employees");
        }

        router.reload({
            only,
            onStart: () => setRefreshing(true),
            onSuccess: () => setLastRefreshedAt(new Date()),
            onFinish: () => setRefreshing(false),
        });
    };

    useEffect(() => {
        const timer = setInterval(() => refreshRef.current?.(), AUTO_REFRESH_MS);
        return () => clearInterval(timer);
    }, []);

    const selectStation = (station) => {
        const stationCode = String(station?.code || "SDO").trim();
        const stationName = String(
            station?.name || "School Division Office",
        ).trim();

        setPageMotion("next");
        visit(
            {
                station_code: stationCode,
                station_name: stationName,
                page: null,
            },
            "station",
        );
    };

    const fetchEmployeePage = (page, direction = null) => {
        const currentPage = Number(visibleEmployees?.current_page || 1);
        const nextPage = Number(page);

        if (!nextPage || requestInFlightRef.current) return;
        if (!window.axios) {
            console.error("Axios is not available for employee page fetch.");
            return;
        }

        setPageMotion(
            direction || (nextPage >= currentPage ? "next" : "previous"),
        );

        const requestId = requestIdRef.current + 1;
        requestIdRef.current = requestId;
        requestInFlightRef.current = true;

        window.axios
            .get(route("attendance-monitoring.employees-page"), {
                params: {
                    page: nextPage,
                    station_code: selectedStationCode,
                    station_name: selectedStationName,
                },
            })
            .then((response) => {
                if (requestIdRef.current !== requestId) return;

                setLiveEmployees(response.data?.employees || {});
            })
            .catch((error) => {
                console.error("Attendance employee page fetch failed:", error);
            })
            .finally(() => {
                if (requestIdRef.current !== requestId) return;

                requestInFlightRef.current = false;
            });
    };

    const goToPage = (page, direction = null) => {
        const currentPage = Number(visibleEmployees?.current_page || 1);
        const nextPage = Number(page);

        if (!hasActiveSearch) {
            fetchEmployeePage(
                nextPage,
                direction || (nextPage >= currentPage ? "next" : "previous"),
            );
            return;
        }

        setPageMotion(
            direction || (nextPage >= currentPage ? "next" : "previous"),
        );
        visit({ page: nextPage }, "employees");
    };

    const submitSearch = (value) => {
        const nextSearch = value?.trim() || "";

        setPageMotion("next");
        visit(
            {
                search: nextSearch,
                page: nextSearch ? 1 : null,
            },
            "employees",
        );
    };

    useEffect(() => {
        const pageCount = Number(liveEmployees?.last_page || 1);
        const currentPage = Number(liveEmployees?.current_page || 1);

        if (pageCount <= 1 || hasActiveSearch || filterScope) {
            return;
        }

        const timer = setInterval(() => {
            if (requestInFlightRef.current) return;

            const nextPage = currentPage >= pageCount ? 1 : currentPage + 1;

            fetchEmployeePage(nextPage, "next");
        }, 9000);

        return () => clearInterval(timer);
    }, [
        filterScope,
        hasActiveSearch,
        liveEmployees?.current_page,
        liveEmployees?.last_page,
    ]);

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#02062f] text-[#070d3f]">
            <Head title="Attendance Monitoring" />
            <TalaBackground />
            <Header
                lastRefreshedAt={lastRefreshedAt}
                refreshing={refreshing}
                time={time}
            />
            <EmployeeList
                employees={visibleEmployees}
                goToPage={goToPage}
                rows={rows}
                isFiltering={Boolean(filterScope)}
                isStationFiltering={filterScope === "station"}
                pageMotion={pageMotion}
                search={search}
                selectedStation={selectedStation}
                selectedStationCode={selectedStationCode}
                selectedStationName={selectedStationName}
                selectStation={selectStation}
                setSearch={setSearch}
                setStationSearch={setStationSearch}
                submitSearch={submitSearch}
                stationSearch={stationSearch}
                stations={stationList}
                recentLogs={liveRecentLogs}
                topFirstTimeIns={liveTopFirstTimeIns}
                travelOrders={liveTravelOrders}
            />
        </div>
    );
};

export default AttendanceMonitoring;
