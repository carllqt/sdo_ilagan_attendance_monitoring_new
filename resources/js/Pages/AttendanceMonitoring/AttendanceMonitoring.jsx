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
    const rows = useMemo(() => createRows(employees), [employees]);
    const [search, setSearch] = useState(filters.search || "");
    const [stationSearch, setStationSearch] = useState("");
    const [time, setTime] = useState(new Date());
    const requestInFlightRef = useRef(false);
    const requestIdRef = useRef(0);
    const selectedStation = filters.station_id || 1;
    const selectedStationCode = filters.station_code || "SDO";
    const selectedStationName =
        filters.station_name || "School Division Office";

    const visit = (overrides = {}) => {
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

        router.get(route("attendance-monitoring"), Object.fromEntries(params), {
            preserveScroll: true,
            preserveState: true,
            replace: true,
            onFinish: () => {
                if (requestIdRef.current !== requestId) return;

                requestInFlightRef.current = false;
            },
        });
    };

    useEffect(() => {
        setSearch(filters.search || "");
    }, [filters.search]);

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            if (requestInFlightRef.current) return;

            const requestId = requestIdRef.current + 1;
            requestIdRef.current = requestId;
            requestInFlightRef.current = true;

            router.reload({
                only: [
                    "employees",
                    "recentLogs",
                    "topFirstTimeIns",
                    "travelOrders",
                ],
                preserveScroll: true,
                preserveState: true,
                onFinish: () => {
                    if (requestIdRef.current !== requestId) return;

                    requestInFlightRef.current = false;
                },
            });
        }, 5000);

        return () => clearInterval(timer);
    }, []);

    const selectStation = (station) => {
        const stationCode = String(station?.code || "SDO").trim();
        const stationName = String(
            station?.name || "School Division Office",
        ).trim();

        visit({
            station_code: stationCode,
            station_name: stationName,
            page: 1,
        });
    };

    const goToPage = (page) => {
        visit({ page });
    };

    const submitSearch = (value) => {
        visit({ search: value?.trim() || "", page: 1 });
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#02062f] text-[#070d3f]">
            <Head title="Project T.A.L.A" />
            <TalaBackground />
            <Header time={time} />
            <EmployeeList
                employees={employees}
                goToPage={goToPage}
                rows={rows}
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
                recentLogs={recentLogs}
                topFirstTimeIns={topFirstTimeIns}
                travelOrders={travelOrders}
            />
        </div>
    );
};

export default AttendanceMonitoring;
