import React, { useEffect, useMemo, useRef, useState } from "react";
import { Head, router } from "@inertiajs/react";

import TalaBackground from "@/Components/TalaBackground";
import Header from "./Partials/Header";
import EmployeeList from "./Partials/EmployeeList";
import { getEmployeeName, sortAlphabetically } from "@/lib/utils";

const toArray = (value) => {
    if (Array.isArray(value)) return value;
    if (Array.isArray(value?.data)) return value.data;
    if (value && typeof value === "object") return Object.values(value);
    return [];
};

const createRows = (employees) => {
    return sortAlphabetically(
        toArray(employees?.data || employees).map((employee) => ({
            id: employee.id,
            employee_id: employee.employee_id || employee.id,
            name: getEmployeeName(employee) || "Unknown Employee",
            station: employee.station?.name || "Division Office",
            station_id: employee.station?.id || null,
            position: employee.position || "Employee",
            profile_img: employee.profile_img || null,
            am_in: employee.am_in || "",
            am_out: employee.am_out || "",
            pm_in: employee.pm_in || "",
            pm_out: employee.pm_out || "",
            status: employee.status || "Absent",
        })),
        "name",
    );
};

const updateEmployeeCollection = (employees, updatedEmployee) => {
    if (!updatedEmployee?.id) return employees;

    if (Array.isArray(employees)) {
        return employees.map((employee) =>
            Number(employee.id) === Number(updatedEmployee.id)
                ? updatedEmployee
                : employee,
        );
    }

    if (Array.isArray(employees?.data)) {
        return {
            ...employees,
            data: employees.data.map((employee) =>
                Number(employee.id) === Number(updatedEmployee.id)
                    ? updatedEmployee
                    : employee,
            ),
        };
    }

    return employees;
};

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
    const rows = useMemo(() => createRows(liveEmployees), [liveEmployees]);
    const [search, setSearch] = useState(filters.search || "");
    const [stationSearch, setStationSearch] = useState("");
    const [time, setTime] = useState(new Date());
    const [filterScope, setFilterScope] = useState(null);
    const [liveStatus, setLiveStatus] = useState("connecting");
    const [streamKey, setStreamKey] = useState(0);
    const requestInFlightRef = useRef(false);
    const requestIdRef = useRef(0);
    const eventSourceRef = useRef(null);
    const intentionalStreamCloseRef = useRef(false);
    const silentStreamReconnectRef = useRef(false);
    const selectedStation = filters.station_id || 1;
    const selectedStationCode = filters.station_code || "SDO";
    const selectedStationName =
        filters.station_name || "School Division Office";

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
        silentStreamReconnectRef.current = true;
        intentionalStreamCloseRef.current = true;
        eventSourceRef.current?.close();
        setFilterScope(scope);

        router.get(route("attendance-monitoring"), Object.fromEntries(params), {
            preserveScroll: true,
            preserveState: true,
            replace: true,
            onFinish: () => {
                if (requestIdRef.current !== requestId) return;

                requestInFlightRef.current = false;
                setFilterScope(null);
                setStreamKey((key) => key + 1);
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

    useEffect(() => {
        const closeStream = () => eventSourceRef.current?.close();

        window.addEventListener("pagehide", closeStream);
        window.addEventListener("beforeunload", closeStream);

        return () => {
            window.removeEventListener("pagehide", closeStream);
            window.removeEventListener("beforeunload", closeStream);
        };
    }, []);

    useEffect(() => {
        const params = new URLSearchParams();

        params.set("station_code", selectedStationCode);
        params.set("station_name", selectedStationName);

        if (selectedStation) {
            params.set("station_id", selectedStation);
        }

        const streamUrl = `${route("attendance-monitoring.stream")}?${params.toString()}`;
        const eventSource = new EventSource(streamUrl);
        let closedByCleanup = false;

        intentionalStreamCloseRef.current = false;
        eventSourceRef.current = eventSource;
        const parsePayload = (event) => JSON.parse(event.data || "{}");

        const keepLiveDuringNavigation = silentStreamReconnectRef.current;

        setLiveStatus((current) =>
            keepLiveDuringNavigation && current === "live"
                ? current
                : "connecting",
        );
        eventSource.onopen = () => {
            silentStreamReconnectRef.current = false;
            setLiveStatus("live");
        };

        eventSource.addEventListener("employee-updated", (event) => {
            if (requestInFlightRef.current) return;

            try {
                const payload = parsePayload(event);

                setLiveEmployees((current) =>
                    updateEmployeeCollection(current, payload.employee),
                );
            } catch (error) {
                console.error(
                    "Attendance monitoring employee SSE parse error:",
                    error,
                );
            }
        });

        eventSource.addEventListener("recent-logs-updated", (event) => {
            if (requestInFlightRef.current) return;

            try {
                setLiveRecentLogs(parsePayload(event) || []);
            } catch (error) {
                console.error(
                    "Attendance monitoring logs SSE parse error:",
                    error,
                );
            }
        });

        eventSource.addEventListener("ranking-updated", (event) => {
            if (requestInFlightRef.current) return;

            try {
                setLiveTopFirstTimeIns(parsePayload(event) || []);
            } catch (error) {
                console.error(
                    "Attendance monitoring ranking SSE parse error:",
                    error,
                );
            }
        });

        eventSource.addEventListener("travel-updated", (event) => {
            if (requestInFlightRef.current) return;

            try {
                setLiveTravelOrders(parsePayload(event) || []);
            } catch (error) {
                console.error(
                    "Attendance monitoring travel SSE parse error:",
                    error,
                );
            }
        });

        eventSource.onerror = (error) => {
            if (
                closedByCleanup ||
                intentionalStreamCloseRef.current ||
                eventSource.readyState === EventSource.CLOSED
            ) {
                return;
            }

            console.error("Attendance monitoring SSE error:", error);
            silentStreamReconnectRef.current = false;
            setLiveStatus("reconnecting");
        };

        return () => {
            closedByCleanup = true;
            intentionalStreamCloseRef.current = true;
            eventSource.close();

            if (eventSourceRef.current === eventSource) {
                eventSourceRef.current = null;
            }
        };
    }, [
        filters.station_code,
        filters.station_id,
        filters.station_name,
        selectedStation,
        selectedStationCode,
        selectedStationName,
        streamKey,
    ]);

    const selectStation = (station) => {
        const stationCode = String(station?.code || "SDO").trim();
        const stationName = String(
            station?.name || "School Division Office",
        ).trim();

        visit(
            {
                station_code: stationCode,
                station_name: stationName,
                page: 1,
            },
            "station",
        );
    };

    const goToPage = (page) => {
        visit({ page }, "employees");
    };

    const submitSearch = (value) => {
        visit({ search: value?.trim() || "", page: 1 }, "employees");
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#02062f] text-[#070d3f]">
            <Head title="Project T.A.L.A" />
            <TalaBackground />
            <Header
                liveStatus={liveStatus}
                onReconnect={() => {
                    silentStreamReconnectRef.current = false;
                    intentionalStreamCloseRef.current = true;
                    eventSourceRef.current?.close();
                    setLiveStatus("connecting");
                    setStreamKey((key) => key + 1);
                }}
                time={time}
            />
            <EmployeeList
                employees={liveEmployees}
                goToPage={goToPage}
                rows={rows}
                isFiltering={Boolean(filterScope)}
                isStationFiltering={filterScope === "station"}
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
