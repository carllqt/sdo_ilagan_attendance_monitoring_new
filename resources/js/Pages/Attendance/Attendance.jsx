import React, { useEffect, useRef, useState } from "react";
import { Head, router } from "@inertiajs/react";
import {
    AlertTriangle,
    CheckCircle2,
    Clock3,
    Fingerprint,
    Loader2,
    LockKeyhole,
    MonitorCheck,
    Search,
    ShieldCheck,
    User2,
    Wifi,
    WifiOff,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import FloatingInput from "@/components/floating-input";
import { getEmployeeName } from "@/lib/utils";
import { AttendanceTable } from "./Partials/AttendanceTable";
import BrandSubtitle from "@/Components/BrandSubtitle";
import { SuggestionSkeletonList } from "@/Components/Skeletons";
import useEmployeeSearchSuggestions from "../Admin/EmployeeManagement/hooks/useEmployeeSearchSuggestions";

const defaultFingerprintServiceUrl = `http://${window.location.hostname}:5000`;

const emptyAM = { am_time_in: null, am_time_out: null };
const emptyPM = { pm_time_in: null, pm_time_out: null };

const statusConfig = {
    idle: {
        label: "Ready",
        icon: Wifi,
        badgeClass: "border-slate-200 bg-slate-50 text-slate-600",
        panelClass: "border-slate-200 bg-slate-50",
    },
    scanning: {
        label: "Scanning",
        icon: Wifi,
        badgeClass: "border-blue-200 bg-blue-50 text-blue-700",
        panelClass: "border-blue-200 bg-blue-50",
    },
    processing: {
        label: "Processing",
        icon: Loader2,
        badgeClass: "border-amber-200 bg-amber-50 text-amber-700",
        panelClass: "border-amber-200 bg-amber-50",
    },
    success: {
        label: "Recorded",
        icon: CheckCircle2,
        badgeClass: "border-emerald-200 bg-emerald-50 text-emerald-700",
        panelClass: "border-emerald-200 bg-emerald-50",
    },
    error: {
        label: "Attention",
        icon: WifiOff,
        badgeClass: "border-red-200 bg-red-50 text-red-700",
        panelClass: "border-red-200 bg-red-50",
    },
    prompt: {
        label: "Choose Log",
        icon: AlertTriangle,
        badgeClass: "border-amber-200 bg-amber-50 text-amber-700",
        panelClass: "border-amber-200 bg-amber-50",
    },
};

const employeePayload = (employee) => ({
    id: employee.id,
    first_name: employee.first_name,
    middle_name: employee.middle_name,
    last_name: employee.last_name,
    position: employee.position,
    office: employee.office,
    station_id: employee.station_id,
});

const attendanceItems = (records) =>
    Array.isArray(records) ? records : records?.data || [];

const attendancePagination = (records) =>
    Array.isArray(records) ? null : records || null;

const defaultSession = () => (new Date().getHours() < 12 ? "AM" : "PM");

const Attendance = ({
    attendances,
    attendanceFilters = {},
    attendanceAccess = {},
    fingerprintServiceUrl = defaultFingerprintServiceUrl,
}) => {
    const initialSession = attendanceFilters.session || defaultSession();
    const [time, setTime] = useState(new Date());
    const [employee, setEmployee] = useState(null);
    const [scanMessage, setScanMessage] = useState("Place your fingerprint");
    const [scanStatus, setScanStatus] = useState("idle");
    const [retryCountdown, setRetryCountdown] = useState(null);
    const [successCountdown, setSuccessCountdown] = useState(null);
    const [dailyAttendance, setDailyAttendance] = useState(
        attendanceItems(attendances),
    );
    const [attendancePage, setAttendancePage] = useState(
        attendancePagination(attendances),
    );
    const [showAMPromptModal, setShowAMPromptModal] = useState(false);
    const [amPromptData, setAMPromptData] = useState(null);
    const [showPMPromptModal, setShowPMPromptModal] = useState(false);
    const [pmPromptData, setPMPromptData] = useState(null);
    const [activeTab, setActiveTab] = useState(initialSession);
    const [search, setSearch] = useState(attendanceFilters.search || "");
    const [access, setAccess] = useState(attendanceAccess || {});
    const [filterLoading, setFilterLoading] = useState(false);
    const [unlockStatus, setUnlockStatus] = useState("idle");
    const [unlockMessage, setUnlockMessage] = useState(
        "Station admin fingerprint unlock is required.",
    );
    const filtersRef = useRef({
        search: attendanceFilters.search || "",
        employeeId: attendanceFilters.employee_id || null,
        session: initialSession,
        page: Number(attendanceFilters.page || 1),
        limit: Number(attendanceFilters.limit || 6),
    });
    const eventSourceRef = useRef(null);
    const unlockSourceRef = useRef(null);
    const scannerEnabledRef = useRef(false);
    const canUseScanner = Boolean(access.device_registered && access.unlocked);
    const stationId = access.station?.id;
    const stationQuery = stationId
        ? `?station_id=${encodeURIComponent(stationId)}`
        : "";
    const totalAttendanceRecords = attendancePage?.total ?? dailyAttendance.length;
    const {
        searchBoxRef,
        setShowSuggestions,
        showSuggestions,
        suggestionMatches,
        suggestionsLoading,
    } = useEmployeeSearchSuggestions({
        enabled: canUseScanner && !filterLoading && Boolean(search.trim()),
        query: search,
        routeName: "attendance.suggestions",
    });

    const updateAttendanceQuery = (values = {}) => {
        const next = {
            ...filtersRef.current,
            session: activeTab,
            ...values,
            limit: 6,
        };
        const params = new URLSearchParams(window.location.search);
        const nextSearch = String(next.search || "").trim();
        const nextEmployeeId = Number(next.employeeId || 0) || null;
        const nextSession = next.session === "PM" ? "PM" : "AM";
        const nextPage = Math.max(Number(next.page || 1), 1);

        if (nextSearch) {
            params.set("search", nextSearch);
        } else {
            params.delete("search");
        }

        params.set("session", nextSession);
        params.set("page", String(nextPage));
        params.set("limit", "6");

        filtersRef.current = {
            search: nextSearch,
            employeeId: nextEmployeeId,
            session: nextSession,
            page: nextPage,
            limit: 6,
        };
        setFilterLoading(true);

        const query = params.toString();

        router.visit(`${route("attendance")}${query ? `?${query}` : ""}`, {
            headers: nextEmployeeId
                ? { "X-Attendance-Employee-Id": String(nextEmployeeId) }
                : {},
            only: ["attendances", "attendanceFilters"],
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onFinish: () => setFilterLoading(false),
        });
    };

    const applySearch = (value = search) => {
        if (filterLoading) return;

        updateAttendanceQuery({
            search: String(value || "").trim(),
            employeeId: null,
            page: 1,
        });
        setShowSuggestions(false);
    };

    const selectSuggestion = (employee) => {
        if (filterLoading) return;

        setSearch(employee.label);
        updateAttendanceQuery({
            search: employee.label,
            employeeId: employee.id,
            page: 1,
        });
        setShowSuggestions(false);
    };

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        setAccess(attendanceAccess || {});
    }, [attendanceAccess]);

    useEffect(() => {
        setDailyAttendance(attendanceItems(attendances));
        setAttendancePage(attendancePagination(attendances));
    }, [attendances]);

    useEffect(() => {
        const nextSession = attendanceFilters.session || defaultSession();
        const nextFilters = {
            search: attendanceFilters.search || "",
            employeeId: attendanceFilters.employee_id || null,
            session: nextSession,
            page: Number(attendanceFilters.page || 1),
            limit: Number(attendanceFilters.limit || 6),
        };

        filtersRef.current = nextFilters;
        setSearch(nextFilters.search);
        setActiveTab(nextSession);
    }, [attendanceFilters]);

    useEffect(() => {
        scannerEnabledRef.current = canUseScanner;

        if (!canUseScanner) {
            eventSourceRef.current?.close();
            return;
        }

        startFingerprintLogin();
        return () => eventSourceRef.current?.close();
    }, [canUseScanner, stationQuery]);

    useEffect(() => {
        return () => unlockSourceRef.current?.close();
    }, []);

    const updateAttendance = (data, timeStr) => {
        const session = data.session;
        const scannedEmployee = employeePayload(data.employee);

        setEmployee(scannedEmployee);
        setActiveTab(session);
        setDailyAttendance((prev) => {
            const updated = [...prev];
            const existing = updated.find(
                (record) =>
                    Number(record.employee?.id) ===
                    Number(scannedEmployee.id),
            );

            if (existing) {
                if (session === "AM") {
                    existing.am = { ...emptyAM, ...existing.am };
                    if (data.action === "time-in") {
                        existing.am.am_time_in = timeStr;
                    }
                    if (data.action === "time-out") {
                        existing.am.am_time_out = timeStr;
                    }
                } else {
                    existing.pm = { ...emptyPM, ...existing.pm };
                    if (data.action === "time-in") {
                        existing.pm.pm_time_in = timeStr;
                    }
                    if (data.action === "time-out") {
                        existing.pm.pm_time_out = timeStr;
                    }
                }

                return updated;
            }

            updated.push({
                id: `live-${Date.now()}`,
                employee: scannedEmployee,
                am:
                    session === "AM"
                        ? {
                              am_time_in:
                                  data.action === "time-in" ? timeStr : null,
                              am_time_out:
                                  data.action === "time-out" ? timeStr : null,
                          }
                        : { ...emptyAM },
                pm:
                    session === "PM"
                        ? {
                              pm_time_in:
                                  data.action === "time-in" ? timeStr : null,
                              pm_time_out:
                                  data.action === "time-out" ? timeStr : null,
                          }
                        : { ...emptyPM },
            });

            return updated;
        });
    };

    const startRetryCountdown = (seconds, callback) => {
        setRetryCountdown(seconds);
        let count = seconds;
        const interval = setInterval(() => {
            count -= 1;
            setRetryCountdown(count);

            if (count <= 0) {
                clearInterval(interval);
                setRetryCountdown(null);
                callback();
            }
        }, 1000);
    };

    const startSuccessCountdown = () => {
        let count = 3;
        setSuccessCountdown(count);
        const interval = setInterval(() => {
            count -= 1;
            setSuccessCountdown(count);

            if (count <= 0) {
                clearInterval(interval);
                setSuccessCountdown(null);
                setScanStatus("scanning");
                setScanMessage("Place your fingerprint");
            }
        }, 1000);
    };

    const handleResponseData = (data) => {
        if (!data || Object.keys(data).length === 0) return;

        if (
            data.employee?.station_id &&
            stationId &&
            Number(data.employee.station_id) !== Number(stationId)
        ) {
            setScanStatus("error");
            setScanMessage("Employee is not assigned to this station.");
            startRetryCountdown(3, () => {
                setScanStatus("scanning");
                setScanMessage("Place your fingerprint");
            });
            return;
        }

        if (data.prompt) {
            setScanStatus("prompt");
            setScanMessage(data.message);

            if (data.prompt_type === "AM") {
                setAMPromptData({
                    employee: data.employee,
                    message: data.message,
                    options: data.options,
                });
                setShowAMPromptModal(true);
            } else if (data.prompt_type === "PM") {
                setPMPromptData({
                    employee: data.employee,
                    message: data.message,
                    options: data.options,
                });
                setShowPMPromptModal(true);
            }
        }

        if (data.success && data.employee) {
            const timeStr = new Date().toTimeString().split(" ")[0];
            updateAttendance(data, timeStr);
            setScanStatus("success");
            setScanMessage(data.message);
            startSuccessCountdown();
            return;
        }

        if (data.message && !data.prompt) {
            setScanStatus("error");
            setScanMessage(data.message);
            startRetryCountdown(3, () => {
                setScanStatus("scanning");
                setScanMessage("Place your fingerprint");
            });
        }
    };

    const startFingerprintLogin = () => {
        if (!scannerEnabledRef.current) return;

        eventSourceRef.current?.close();
        setScanStatus("scanning");
        setScanMessage("Place your fingerprint");

        const eventSource = new EventSource(
            `${fingerprintServiceUrl}/bioLogin${stationQuery}`,
        );
        eventSourceRef.current = eventSource;

        eventSource.onmessage = (event) => {
            try {
                const dataStr = event.data.startsWith("data:")
                    ? event.data.slice(5)
                    : event.data;

                handleResponseData(JSON.parse(dataStr));
            } catch (err) {
                console.error("SSE parse error:", err);
                setScanStatus("error");
                setScanMessage("Failed to parse server response.");
            }
        };

        eventSource.onerror = (err) => {
            console.error("SSE error:", err);
            setScanStatus("error");
            setScanMessage("Lost connection to fingerprint service.");
            setTimeout(() => {
                if (scannerEnabledRef.current) {
                    startFingerprintLogin();
                }
            }, 3000);
        };
    };

    const registerDevice = () => {
        router.post(
            "/attendance/device",
            { name: window.navigator.userAgent },
            { preserveScroll: true },
        );
    };

    const lockScanner = () => {
        router.post("/attendance/lock", {}, { preserveScroll: true });
    };

    const handleSessionChange = (session) => {
        setActiveTab(session);
        updateAttendanceQuery({ session, page: 1 });
    };

    const startAdminUnlock = () => {
        unlockSourceRef.current?.close();
        setUnlockStatus("scanning");
        setUnlockMessage("Place the station admin fingerprint.");

        const eventSource = new EventSource(
            `${fingerprintServiceUrl}/bioTestSSE`,
        );
        unlockSourceRef.current = eventSource;

        eventSource.onmessage = (event) => {
            try {
                const dataStr = event.data.startsWith("data:")
                    ? event.data.slice(5)
                    : event.data;
                const data = JSON.parse(dataStr);

                if (!data || Object.keys(data).length === 0) return;

                if (data.success && data.employee?.id) {
                    setUnlockStatus("processing");
                    setUnlockMessage(
                        `Verifying ${getEmployeeName(data.employee)}...`,
                    );
                    eventSource.close();
                    unlockSourceRef.current = null;

                    router.post(
                        "/attendance/unlock",
                        { employee_id: data.employee.id },
                        {
                            preserveScroll: true,
                            onSuccess: () => {
                                setUnlockStatus("success");
                                setUnlockMessage(
                                    "Attendance scanner unlocked.",
                                );
                            },
                            onError: () => {
                                setUnlockStatus("error");
                                setUnlockMessage(
                                    "Fingerprint does not match the logged-in station admin.",
                                );
                            },
                        },
                    );
                    return;
                }

                if (data.message) {
                    setUnlockStatus("error");
                    setUnlockMessage(data.message);
                }
            } catch (err) {
                console.error("Unlock SSE parse error:", err);
                setUnlockStatus("error");
                setUnlockMessage("Failed to read fingerprint response.");
            }
        };

        eventSource.onerror = (err) => {
            console.error("Unlock SSE error:", err);
            setUnlockStatus("error");
            setUnlockMessage("Could not reach fingerprint service.");
            eventSource.close();
            unlockSourceRef.current = null;
        };
    };

    const handlePromptChoice = (choice) => {
        const promptData = amPromptData || pmPromptData;

        if (!promptData?.employee?.id) return;

        setShowAMPromptModal(false);
        setShowPMPromptModal(false);
        setScanStatus("processing");
        setScanMessage(`Recording ${choice}...`);

        const eventSource = new EventSource(
            `${fingerprintServiceUrl}/bioFingerprintChoice/${
                promptData.employee.id
            }/${encodeURIComponent(choice)}${stationQuery}`,
        );

        eventSource.onmessage = (event) => {
            try {
                const dataStr = event.data.startsWith("data:")
                    ? event.data.slice(5)
                    : event.data;

                handleResponseData(JSON.parse(dataStr));
            } catch (err) {
                console.error("SSE parse error:", err);
                setScanStatus("error");
                setScanMessage("Failed to parse server response.");
            } finally {
                eventSource.close();
            }
        };

        eventSource.onerror = (err) => {
            console.error("SSE error:", err);
            setScanStatus("error");
            setScanMessage("Failed to send choice to server.");
            eventSource.close();
        };
    };

    const getFingerprintColor = () => {
        switch (scanStatus) {
            case "scanning":
                return "text-blue-500 animate-pulse";
            case "processing":
                return "text-amber-500 animate-pulse";
            case "success":
                return "text-emerald-500 animate-bounce";
            case "error":
                return "text-red-500";
            default:
                return "text-slate-400";
        }
    };

    const currentStatus = statusConfig[scanStatus] || statusConfig.idle;
    const StatusIcon = currentStatus.icon;
    const employeeName = employee
        ? getEmployeeName(employee)
        : "No employee detected";
    const formattedDate = time.toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <>
            <Head title="Attendance" />
            <main className="min-h-screen bg-slate-100 px-6 py-6">
                <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
                    <header className="flex items-center justify-between rounded-2xl border border-blue-100 bg-white px-5 py-4 shadow-sm">
                        <div className="flex items-center gap-4">
                            <img
                                src="/sdo-pic.jpg"
                                alt="Division of Ilagan Logo"
                                className="h-14 w-14 rounded-full object-cover"
                            />
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">
                                    Project T.A.L.A
                                </h1>
                                <p className="text-sm text-slate-500">
                                    <BrandSubtitle compact />
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {canUseScanner && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="gap-2"
                                    onClick={lockScanner}
                                >
                                    <LockKeyhole className="h-4 w-4" />
                                    Lock
                                </Button>
                            )}
                            <div
                                className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold ${currentStatus.badgeClass}`}
                            >
                                <StatusIcon
                                    className={`h-4 w-4 ${
                                        scanStatus === "processing"
                                            ? "animate-spin"
                                            : ""
                                    }`}
                                />
                                {currentStatus.label}
                            </div>
                            <img
                                src="/logo-copy.png"
                                alt="Project T.A.L.A Logo"
                                className="h-12 w-12 object-contain"
                            />
                        </div>
                    </header>

                    {!canUseScanner ? (
                        <AttendanceAccessGate
                            access={access}
                            unlockStatus={unlockStatus}
                            unlockMessage={unlockMessage}
                            onRegisterDevice={registerDevice}
                            onStartUnlock={startAdminUnlock}
                        />
                    ) : (
                    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.35fr_1fr]">
                        <section className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
                            <div className="mb-4 flex items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">
                                        Time In / Time Out
                                    </h2>
                                    <p className="text-sm text-slate-500">
                                        Scan fingerprint to record attendance.
                                    </p>
                                </div>
                                <div className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                                    {activeTab} Session
                                </div>
                            </div>

                            <div className="grid min-h-[32rem] grid-cols-1 gap-5 lg:grid-cols-[0.85fr_1fr]">
                                <div
                                    className={`flex flex-col items-center justify-center rounded-2xl border p-6 text-center ${currentStatus.panelClass}`}
                                >
                                    <div className="relative flex h-48 w-48 items-center justify-center rounded-full border border-white/80 bg-white shadow-sm">
                                        <div className="absolute inset-5 rounded-full border border-slate-100" />
                                        <Fingerprint
                                            className={`relative h-28 w-28 ${getFingerprintColor()}`}
                                        />
                                    </div>
                                    <div className="mt-5 min-h-[5rem]">
                                        <div className="text-base font-semibold text-slate-900">
                                            {scanMessage}
                                        </div>
                                        <div className="mt-1 text-sm font-medium text-slate-500">
                                            {retryCountdown !== null
                                                ? `Retrying in ${retryCountdown} seconds`
                                                : successCountdown !== null
                                                  ? `Resetting in ${successCountdown} seconds`
                                                  : "Keep the finger steady until confirmation."}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-4">
                                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                                        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-500">
                                            <Clock3 className="h-4 w-4 text-blue-600" />
                                            Current Time
                                        </div>
                                        <div className="font-mono text-6xl font-bold tracking-tight text-blue-900">
                                            {time.toLocaleTimeString()}
                                        </div>
                                        <div className="mt-2 text-sm font-medium text-slate-500">
                                            {formattedDate}
                                        </div>
                                        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-200">
                                            <div
                                                className="h-full rounded-full bg-blue-600 transition-all"
                                                style={{
                                                    width: `${
                                                        (time.getSeconds() /
                                                            60) *
                                                        100
                                                    }%`,
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className="rounded-2xl border border-slate-200 bg-white p-5">
                                        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-500">
                                            <User2 className="h-4 w-4 text-blue-600" />
                                            Last Detected Employee
                                        </div>
                                        <div className="text-2xl font-bold text-slate-900">
                                            {employeeName}
                                        </div>
                                        <div className="mt-1 text-sm text-slate-500">
                                            {employee?.position ||
                                                "Waiting for fingerprint scan"}
                                        </div>
                                        <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                                            {employee?.office?.name ||
                                                employee?.office ||
                                                "Office will appear after scan"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="flex min-h-[32rem] flex-col rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
                            <div className="mb-4 flex items-start justify-between gap-4">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">
                                        Today&apos;s Logs
                                    </h2>
                                    <p className="text-sm text-slate-500">
                                        Latest biometric entries for the day.
                                    </p>
                                </div>
                                <div className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600">
                                    {totalAttendanceRecords} records
                                </div>
                            </div>

                            <div className="relative mb-4" ref={searchBoxRef}>
                                <FloatingInput
                                    label="Employee Name"
                                    icon={Search}
                                    name="attendance_search"
                                    value={search}
                                    disabled={filterLoading}
                                    onChange={(event) => {
                                        setSearch(event.target.value);
                                        filtersRef.current = {
                                            ...filtersRef.current,
                                            employeeId: null,
                                        };
                                        setShowSuggestions(true);
                                    }}
                                    onFocus={() => setShowSuggestions(true)}
                                    onKeyDown={(event) => {
                                        if (event.key === "Enter") {
                                            event.preventDefault();
                                            applySearch();
                                        }
                                    }}
                                />

                                {showSuggestions && search.trim() ? (
                                    <div className="absolute right-0 top-full z-50 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
                                        <div className="border-b bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Results for "{search.trim()}"
                                        </div>

                                        <div className="max-h-72 overflow-y-auto">
                                            {suggestionsLoading ? (
                                                <SuggestionSkeletonList count={3} />
                                            ) : suggestionMatches.length > 0 ? (
                                                suggestionMatches.map(
                                                    (employee) => (
                                                        <button
                                                            key={employee.id}
                                                            type="button"
                                                            onMouseDown={() =>
                                                                selectSuggestion(
                                                                    employee,
                                                                )
                                                            }
                                                            className="flex w-full items-start justify-between gap-3 px-3 py-2 text-left text-sm transition hover:bg-blue-50"
                                                        >
                                                            <div className="min-w-0">
                                                                <div className="truncate font-medium text-slate-800">
                                                                    {
                                                                        employee.label
                                                                    }
                                                                </div>
                                                                <div className="truncate text-xs text-slate-500">
                                                                    {employee.meta ||
                                                                        "Employee"}
                                                                </div>
                                                            </div>

                                                            <span className="shrink-0 rounded-full bg-blue-100 px-2 py-1 text-[11px] font-semibold text-blue-700">
                                                                Search
                                                            </span>
                                                        </button>
                                                    ),
                                                )
                                            ) : (
                                                <div className="px-3 py-4 text-sm text-slate-500">
                                                    No employee matches found.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : null}
                            </div>

                            <Tabs
                                value={activeTab}
                                onValueChange={handleSessionChange}
                                className="flex min-h-0 flex-1 flex-col"
                            >
                                <TabsList className="mb-4 grid w-full grid-cols-2 rounded-xl bg-slate-100 p-1">
                                    <TabsTrigger
                                        value="AM"
                                        className="rounded-lg data-[state=active]:bg-blue-700 data-[state=active]:text-white"
                                    >
                                        AM Logs
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="PM"
                                        className="rounded-lg data-[state=active]:bg-blue-700 data-[state=active]:text-white"
                                    >
                                        PM Logs
                                    </TabsTrigger>
                                </TabsList>

                                {["AM", "PM"].map((session) => (
                                    <TabsContent
                                        key={session}
                                        value={session}
                                        className="min-h-0 flex-1"
                                    >
                                        <AttendanceTable
                                            dailyAttendance={dailyAttendance}
                                            session={session}
                                            search={search}
                                            pagination={attendancePage}
                                            isLoading={filterLoading}
                                            onPageChange={(page) =>
                                                updateAttendanceQuery({ page })
                                            }
                                        />
                                    </TabsContent>
                                ))}
                            </Tabs>
                        </section>
                    </div>
                    )}
                </div>

                {showAMPromptModal && amPromptData && (
                    <PromptModal
                        employee={amPromptData.employee}
                        message={amPromptData.message}
                        secondaryLabel="AM Time-Out"
                        primaryLabel="PM Time-In"
                        onSecondary={() => handlePromptChoice("AM Time-Out")}
                        onPrimary={() => handlePromptChoice("PM Time-In")}
                    />
                )}

                {showPMPromptModal && pmPromptData && (
                    <PromptModal
                        employee={pmPromptData.employee}
                        message={pmPromptData.message}
                        secondaryLabel="PM Time-In"
                        primaryLabel="PM Time-Out"
                        onSecondary={() => handlePromptChoice("PM Time-In")}
                        onPrimary={() => handlePromptChoice("PM Time-Out")}
                    />
                )}
            </main>
        </>
    );
};

const AttendanceAccessGate = ({
    access,
    unlockStatus,
    unlockMessage,
    onRegisterDevice,
    onStartUnlock,
}) => {
    const isDeviceRegistered = Boolean(access.device_registered);
    const isBusy = ["scanning", "processing"].includes(unlockStatus);
    const panel = isDeviceRegistered
        ? {
              icon: ShieldCheck,
              title: "Fingerprint Unlock Required",
              description:
                  "Scan the logged-in station admin fingerprint to open the attendance scanner.",
              action: "Scan Admin Fingerprint",
              onClick: onStartUnlock,
          }
        : {
              icon: MonitorCheck,
              title: "Register This Device",
              description:
                  "This computer must be registered to the station before it can run attendance.",
              action: "Register Device",
              onClick: onRegisterDevice,
          };
    const Icon = panel.icon;

    return (
        <section className="min-h-[36rem] rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
            <div className="flex h-full min-h-[33rem] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-6 py-10 text-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-full border border-blue-100 bg-white shadow-sm">
                    <Icon className="h-12 w-12 text-blue-700" />
                </div>
                <div className="mt-6 max-w-xl">
                    <h2 className="text-2xl font-bold text-slate-900">
                        {panel.title}
                    </h2>
                    <p className="mt-2 text-sm text-slate-500">
                        {panel.description}
                    </p>
                </div>

                <div className="mt-6 grid w-full max-w-2xl grid-cols-1 gap-3 text-left md:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Station
                        </div>
                        <div className="mt-1 font-semibold text-slate-900">
                            {access.station?.name || "No station assigned"}
                        </div>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Logged-in Admin
                        </div>
                        <div className="mt-1 font-semibold text-slate-900">
                            {access.admin?.name || "Unknown admin"}
                        </div>
                    </div>
                </div>

                {isDeviceRegistered && (
                    <div className="mt-5 min-h-[2.5rem] rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-800">
                        {unlockMessage}
                    </div>
                )}

                <Button
                    type="button"
                    className="mt-6 gap-2 bg-blue-700 text-white hover:bg-blue-800"
                    disabled={isBusy}
                    onClick={panel.onClick}
                >
                    {isBusy ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Fingerprint className="h-4 w-4" />
                    )}
                    {isBusy ? "Waiting for fingerprint" : panel.action}
                </Button>
            </div>
        </section>
    );
};

const PromptModal = ({
    employee,
    message,
    secondaryLabel,
    primaryLabel,
    onSecondary,
    onPrimary,
}) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
        <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="bg-blue-700 px-5 py-4 text-white">
                <h2 className="text-lg font-semibold">
                    {employee.first_name} {employee.last_name}
                </h2>
                <p className="text-sm text-blue-100">
                    Confirm attendance action
                </p>
            </div>
            <div className="space-y-5 p-5">
                <p className="text-sm text-slate-600">{message}</p>
                <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={onSecondary}>
                        {secondaryLabel}
                    </Button>
                    <Button
                        type="button"
                        className="bg-blue-700 text-white hover:bg-blue-800"
                        onClick={onPrimary}
                    >
                        {primaryLabel}
                    </Button>
                </div>
            </div>
        </div>
    </div>
);

export default Attendance;
