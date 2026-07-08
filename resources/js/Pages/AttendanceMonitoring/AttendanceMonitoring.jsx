import React, { useEffect, useMemo, useRef, useState } from "react";
import { Head, router } from "@inertiajs/react";
import { BellRing } from "lucide-react";
import { Toaster, toast } from "sonner";

import TalaBackground from "@/Components/TalaBackground";
import Header from "./Partials/Header";
import EmployeeList from "./Partials/EmployeeList";
import { getEmployeeName, sortAlphabetically } from "@/lib/utils";

const LIVE_UPDATE_TOAST_ID = "attendance-monitoring-live-update";

const toArray = (value) => {
    if (Array.isArray(value)) return value;
    if (Array.isArray(value?.data)) return value.data;
    if (value && typeof value === "object") return Object.values(value);
    return [];
};

const createRows = (employees, travelOrders = []) => {
    const travelEmployeeIds = new Set(
        toArray(travelOrders)
            .map((travelOrder) => travelOrder?.employee?.id)
            .filter(Boolean)
            .map(Number),
    );

    return sortAlphabetically(
        toArray(employees?.data || employees).map((employee) => {
            const employeeId = employee.employee_id || employee.id;
            const isOnTravel = travelEmployeeIds.has(Number(employeeId));

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
                status: isOnTravel ? "ON TRAVEL" : employee.status || "Absent",
                isOnTravel,
            };
        }),
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

const formatPunchTime = (time) => {
    if (!time) return "";

    const [hours = 0, minutes = 0] = String(time).split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);

    return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
    });
};

const latestPunch = (employee = {}) => {
    const punches = [
        ["PM Out", employee.pm_out],
        ["PM In", employee.pm_in],
        ["AM Out", employee.am_out],
        ["AM In", employee.am_in],
    ];
    const punch = punches.find(([, time]) => Boolean(time));

    if (!punch) return employee.status || "Attendance updated";

    return `${punch[0]} ${formatPunchTime(punch[1])}`;
};

const LiveUpdateToast = ({ count, employee }) => (
    <div className="monitor-live-toast relative flex min-w-[270px] max-w-[330px] items-center gap-2.5 overflow-hidden rounded-xl border border-sky-300/25 bg-gradient-to-br from-[#02062f]/95 via-[#08145a]/95 to-[#0f2f72]/95 px-3.5 py-3 text-white shadow-2xl shadow-blue-950/35 backdrop-blur">
        <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-300/80 to-transparent" />
        {count > 1 ? (
            <span className="monitor-live-toast-badge absolute right-1.5 top-1.5 flex h-6 min-w-6 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[11px] font-black text-white shadow-lg shadow-rose-900/25">
                {count}
            </span>
        ) : null}
        <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-emerald-300/25 bg-emerald-400/15 text-emerald-200 shadow-inner">
            <span className="absolute inset-0 rounded-full bg-emerald-300/25 animate-ping" />
            <BellRing className="relative h-4 w-4 animate-bell-ring" />
        </span>
        <div className="min-w-0 pr-6">
            <p className="text-xs font-black uppercase text-sky-100">
                Live update
            </p>
            <p className="truncate text-sm font-semibold text-white">
                {getEmployeeName(employee) || "Employee"}
            </p>
            <p className="text-[11px] font-bold uppercase text-emerald-200">
                {latestPunch(employee)}
            </p>
        </div>
    </div>
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
    const [broadcastStatus, setBroadcastStatus] = useState("connecting");
    const [pageMotion, setPageMotion] = useState("next");
    const requestInFlightRef = useRef(false);
    const requestIdRef = useRef(0);
    const broadcastStatusTimerRef = useRef(null);
    const toastCountRef = useRef(0);
    const toastResetTimerRef = useRef(null);
    const selectedStation = filters.station_id || 1;
    const selectedStationCode = filters.station_code || "SDO";
    const selectedStationName =
        filters.station_name || "School Division Office";
    const hasActiveSearch = search.trim() !== "";
    const visibleEmployees = liveEmployees;
    const rows = useMemo(
        () => createRows(visibleEmployees, liveTravelOrders),
        [visibleEmployees, liveTravelOrders],
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

    const showLiveUpdateToast = (employee) => {
        if (!employee?.id) return;

        toastCountRef.current += 1;

        toast.custom(
            () => (
                <LiveUpdateToast
                    count={toastCountRef.current}
                    employee={employee}
                />
            ),
            {
                id: LIVE_UPDATE_TOAST_ID,
                duration: 4500,
            },
        );

        clearTimeout(toastResetTimerRef.current);
        toastResetTimerRef.current = setTimeout(() => {
            toastCountRef.current = 0;
        }, 4800);
    };

    useEffect(() => {
        if (!window.Echo || !selectedStation) return;

        const connection = window.Echo.connector?.pusher?.connection;
        const setConnected = () => setBroadcastStatus("live");
        const setConnecting = () => setBroadcastStatus("connecting");
        const setDisconnected = () => setBroadcastStatus("offline");

        if (connection) {
            if (connection.state === "connected") {
                setConnected();
            } else if (connection.state === "connecting") {
                setConnecting();
            } else {
                setDisconnected();
            }

            connection.bind("connected", setConnected);
            connection.bind("connecting", setConnecting);
            connection.bind("disconnected", setDisconnected);
            connection.bind("unavailable", setDisconnected);
            connection.bind("failed", setDisconnected);
        }

        const channelName = `attendance-monitoring.station.${selectedStation}`;
        const channel = window.Echo.private(channelName);

        channel.listen(".attendance-monitoring.updated", (event) => {
            const payload = event.payload || {};

            setLiveEmployees((current) =>
                updateEmployeeCollection(current, payload.employee),
            );

            if (Array.isArray(payload.recentLogs)) {
                setLiveRecentLogs(payload.recentLogs);
            }

            if (Array.isArray(payload.topFirstTimeIns)) {
                setLiveTopFirstTimeIns(payload.topFirstTimeIns);
            }

            if (Array.isArray(payload.travelOrders)) {
                setLiveTravelOrders(payload.travelOrders);
            }

            setBroadcastStatus("updated");
            showLiveUpdateToast(payload.employee);

            clearTimeout(broadcastStatusTimerRef.current);
            broadcastStatusTimerRef.current = setTimeout(() => {
                setBroadcastStatus("live");
            }, 1500);
        });

        return () => {
            clearTimeout(broadcastStatusTimerRef.current);
            clearTimeout(toastResetTimerRef.current);
            connection?.unbind("connected", setConnected);
            connection?.unbind("connecting", setConnecting);
            connection?.unbind("disconnected", setDisconnected);
            connection?.unbind("unavailable", setDisconnected);
            connection?.unbind("failed", setDisconnected);
            window.Echo.leave(channelName);
        };
    }, [selectedStation]);

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
            <Toaster position="top-center" visibleToasts={1} gap={10} />
            <TalaBackground />
            <Header broadcastStatus={broadcastStatus} time={time} />
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
