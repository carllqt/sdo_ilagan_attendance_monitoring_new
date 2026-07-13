import React, { useEffect, useRef, useState } from "react";
import { Head, router } from "@inertiajs/react";
import {
    AlertTriangle,
    BriefcaseBusiness,
    Building2,
    CheckCircle2,
    Fingerprint,
    Loader2,
    Search,
    UserRound,
    Wifi,
    WifiOff,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import FloatingInput from "@/components/floating-input";
import { getEmployeeName } from "@/lib/utils";
import { AttendanceTable } from "./Partials/AttendanceTable";
import BrandSubtitle from "@/Components/BrandSubtitle";
import EmployeeAvatar from "@/Components/EmployeeAvatar";
import { SuggestionSkeletonList } from "@/Components/Skeletons";
import TalaBackground from "@/Components/TalaBackground";
import useEmployeeSearchSuggestions from "../Admin/EmployeeManagement/hooks/useEmployeeSearchSuggestions";

const defaultFingerprintServiceUrl = `http://${window.location.hostname}:5000`;

const emptyAM = { am_time_in: null, am_time_out: null };
const emptyPM = { pm_time_in: null, pm_time_out: null };

const statusConfig = {
    idle: {
        label: "Ready",
        icon: Wifi,
        badgeClass: "border-slate-200 bg-slate-50 text-slate-600",
        panelClass: "ring-1 ring-white/10",
    },
    scanning: {
        label: "Scanning",
        icon: Wifi,
        badgeClass: "border-blue-200 bg-blue-50 text-blue-700",
        panelClass: "ring-1 ring-cyan-200/25",
    },
    processing: {
        label: "Processing",
        icon: Loader2,
        badgeClass: "border-amber-200 bg-amber-50 text-amber-700",
        panelClass: "ring-1 ring-amber-200/25",
    },
    success: {
        label: "Recorded",
        icon: CheckCircle2,
        badgeClass: "border-emerald-200 bg-emerald-50 text-emerald-700",
        panelClass: "ring-1 ring-emerald-200/25",
    },
    error: {
        label: "Attention",
        icon: WifiOff,
        badgeClass: "border-red-200 bg-red-50 text-red-700",
        panelClass: "ring-1 ring-red-200/25",
    },
    prompt: {
        label: "Choose Log",
        icon: AlertTriangle,
        badgeClass: "border-amber-200 bg-amber-50 text-amber-700",
        panelClass: "ring-1 ring-amber-200/25",
    },
};

const employeePayload = (employee) => ({
    id: employee.id,
    first_name: employee.first_name,
    middle_name: employee.middle_name,
    last_name: employee.last_name,
    profile_img: employee.profile_img,
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
    const [filterLoading, setFilterLoading] = useState(false);
    const filtersRef = useRef({
        search: attendanceFilters.search || "",
        employeeId: attendanceFilters.employee_id || null,
        session: initialSession,
        page: Number(attendanceFilters.page || 1),
        limit: Number(attendanceFilters.limit || 6),
    });
    const eventSourceRef = useRef(null);
    const scannerEnabledRef = useRef(false);
    const retryTimerRef = useRef(null);
    const successTimerRef = useRef(null);
    const reconnectTimerRef = useRef(null);
    const access = attendanceAccess || {};
    const canUseScanner = true;
    const stationId = access.station?.id;
    const stationQuery = stationId
        ? `?station_id=${encodeURIComponent(stationId)}`
        : "";
    const totalAttendanceRecords =
        attendancePage?.total ?? dailyAttendance.length;
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
            closeFingerprintStream();
            return;
        }

        startAttendanceFingerprintScan();
        return () => {
            closeFingerprintStream();
            clearInterval(retryTimerRef.current);
            clearInterval(successTimerRef.current);
            clearTimeout(reconnectTimerRef.current);
        };
    }, [canUseScanner, stationQuery]);

    const updateAttendance = (data, timeStr) => {
        const session = data.session;
        const scannedEmployee = employeePayload(data.employee);

        setEmployee(scannedEmployee);
        setActiveTab(session);
        setDailyAttendance((prev) => {
            const updated = [...prev];
            const existing = updated.find(
                (record) =>
                    Number(record.employee?.id) === Number(scannedEmployee.id),
            );

            if (existing) {
                existing.employee = {
                    ...existing.employee,
                    ...scannedEmployee,
                };

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

    const closeFingerprintStream = () => {
        eventSourceRef.current?.close();
        eventSourceRef.current = null;
    };

    const startRetryCountdown = (seconds, callback) => {
        clearInterval(retryTimerRef.current);
        setRetryCountdown(seconds);
        let count = seconds;
        retryTimerRef.current = setInterval(() => {
            count -= 1;
            setRetryCountdown(count);

            if (count <= 0) {
                clearInterval(retryTimerRef.current);
                setRetryCountdown(null);
                callback();
            }
        }, 1000);
    };

    const startSuccessCountdown = (callback = null) => {
        clearInterval(successTimerRef.current);
        let count = 3;
        setSuccessCountdown(count);
        successTimerRef.current = setInterval(() => {
            count -= 1;
            setSuccessCountdown(count);

            if (count <= 0) {
                clearInterval(successTimerRef.current);
                setSuccessCountdown(null);
                setScanStatus("scanning");
                setScanMessage("Place your fingerprint");
                callback?.();
            }
        }, 1000);
    };

    const applyAttendanceResult = (data, restartScanner = true) => {
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
                if (restartScanner) startAttendanceFingerprintScan();
            });
            return;
        }

        if (data.prompt) {
            closeFingerprintStream();
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
            return;
        }

        if (data.success && data.employee && data.session && data.action) {
            const timeStr = data.time || new Date().toTimeString().split(" ")[0];
            updateAttendance(data, timeStr);
            setScanStatus("success");
            setScanMessage(data.message);
            startSuccessCountdown(() => {
                if (restartScanner) startAttendanceFingerprintScan();
            });
            return;
        }

        if (data.message && !data.prompt) {
            setScanStatus("error");
            setScanMessage(data.message);
            startRetryCountdown(3, () => {
                setScanStatus("scanning");
                setScanMessage("Place your fingerprint");
                if (restartScanner) startAttendanceFingerprintScan();
            });
        }
    };

    const recordAttendanceScan = async (employeeId) => {
        if (!employeeId) return;

        closeFingerprintStream();
        setScanStatus("processing");
        setScanMessage("Recording attendance...");

        try {
            const response = await window.axios.post(route("attendance.scan"), {
                employee_id: employeeId,
            });

            applyAttendanceResult(response.data);
        } catch (error) {
            const message =
                error.response?.data?.message ||
                "Unable to record attendance.";

            setScanStatus("error");
            setScanMessage(message);
            startRetryCountdown(3, () => {
                setScanStatus("scanning");
                setScanMessage("Place your fingerprint");
                startAttendanceFingerprintScan();
            });
        }
    };

    const handleResponseData = (data) => {
        if (!data || Object.keys(data).length === 0) return;

        if (data.success && data.employee?.id && !data.session) {
            recordAttendanceScan(data.employee.id);
            return;
        }

        applyAttendanceResult(data, false);
    };

    const startAttendanceFingerprintScan = () => {
        if (!scannerEnabledRef.current) return;

        closeFingerprintStream();
        setScanStatus("scanning");
        setScanMessage("Place your fingerprint");

        const eventSource = new EventSource(
            `${fingerprintServiceUrl}/bioAttendanceScan${stationQuery}`,
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
            clearTimeout(reconnectTimerRef.current);
            reconnectTimerRef.current = setTimeout(() => {
                if (scannerEnabledRef.current) {
                    startAttendanceFingerprintScan();
                }
            }, 3000);
        };
    };

    const handleSessionChange = (session) => {
        setActiveTab(session);
        updateAttendanceQuery({ session, page: 1 });
    };

    const handlePromptChoice = async (choice) => {
        const promptData = amPromptData || pmPromptData;

        if (!promptData?.employee?.id) return;

        setShowAMPromptModal(false);
        setShowPMPromptModal(false);
        setScanStatus("processing");
        setScanMessage(`Recording ${choice}...`);

        try {
            const response = await window.axios.post(route("attendance.choice"), {
                employee_id: promptData.employee.id,
                choice,
            });

            applyAttendanceResult(response.data);
        } catch (error) {
            const message =
                error.response?.data?.message ||
                "Failed to send choice to server.";

            setScanStatus("error");
            setScanMessage(message);
            startRetryCountdown(3, () => {
                setScanStatus("scanning");
                setScanMessage("Place your fingerprint");
                startAttendanceFingerprintScan();
            });
        }
    };

    const getFingerprintColor = () => {
        switch (scanStatus) {
            case "scanning":
                return "text-blue-500";
            case "processing":
                return "text-amber-500";
            case "success":
                return "text-emerald-500";
            case "error":
                return "text-red-500";
            default:
                return "text-slate-400";
        }
    };

    const currentStatus = statusConfig[scanStatus] || statusConfig.idle;
    const StatusIcon = currentStatus.icon;
    const employeeName = employee ? getEmployeeName(employee) : "";
    const formattedDate = time.toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <>
            <Head title="Attendance" />
            <main className="relative min-h-screen overflow-hidden bg-[#02062f] px-4 py-5 text-white sm:px-6">
                <TalaBackground />
                <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-5">
                    <header className="flex flex-col gap-4 rounded-[1.35rem] border border-white/25 bg-[linear-gradient(135deg,rgba(255,255,255,0.10),rgba(120,119,255,0.15))] px-5 py-4 shadow-[0_0_28px_rgba(167,139,250,0.18),0_22px_70px_rgba(2,6,47,0.38),inset_0_1px_0_rgba(255,255,255,0.22)] ring-1 ring-violet-200/10 backdrop-blur-[2px] lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white shadow-xl shadow-blue-950/30 ring-2 ring-white/55">
                                <img
                                    src="/sdo-pic.jpg"
                                    alt="Division of Ilagan Logo"
                                    className="h-14 w-14 rounded-full object-cover"
                                />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-white drop-shadow-sm">
                                    Project T.A.L.A
                                </h1>
                                <p className="max-w-2xl text-[10px] font-bold uppercase tracking-wide text-blue-50">
                                    <BrandSubtitle />
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-end gap-2 lg:ml-auto">
                            <div
                                className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold shadow-sm ${currentStatus.badgeClass}`}
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
                            <div className="min-w-[132px] text-right">
                                <p className="text-lg font-black leading-tight tracking-wide text-white drop-shadow-sm">
                                    {time.toLocaleTimeString("en-US", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        second: "2-digit",
                                        hour12: true,
                                    })}
                                </p>
                                <p className="mt-0.5 text-xs font-bold text-blue-50">
                                    {formattedDate}
                                </p>
                            </div>
                            <img
                                src="/logo-copy.png"
                                alt="Project T.A.L.A Logo"
                                className="h-12 w-12 rounded-full bg-white/90 object-contain p-1 shadow-lg shadow-blue-950/25 ring-1 ring-white/40"
                            />
                        </div>
                    </header>

                    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                            <section className="relative flex min-h-[32rem] flex-col overflow-hidden rounded-[1.35rem] border border-blue-400/25 bg-[#071158] p-5 shadow-[0_18px_56px_rgba(2,6,47,0.30)]">
                                <div className="relative z-10 flex min-h-0 flex-1 flex-col">
                                    <div className="mb-4 flex items-center justify-between gap-4">
                                        <div>
                                            <h2 className="text-lg font-black text-white">
                                                Time In / Time Out
                                            </h2>
                                            <p className="text-sm font-semibold text-blue-100">
                                                Scan fingerprint to record
                                                attendance.
                                            </p>
                                        </div>
                                        <div className="rounded-full border border-blue-300/30 bg-blue-950/55 px-3 py-1 text-sm font-bold text-white shadow-sm">
                                            {activeTab} Session
                                        </div>
                                    </div>

                                    <div className="flex min-h-0 flex-1 flex-col gap-4">
                                        <div
                                            className={`relative flex flex-[0.4] flex-col items-center justify-center overflow-hidden rounded-2xl border border-violet-400/70 bg-[radial-gradient(circle_at_50%_20%,rgba(80,70,255,0.42),transparent_30%),linear-gradient(135deg,rgba(14,21,139,0.92),rgba(4,10,78,0.96))] px-5 py-4 text-center shadow-[0_0_28px_rgba(79,70,229,0.26)] ${currentStatus.panelClass}`}
                                        >
                                            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_62%,rgba(56,189,248,0.16)_0_1px,transparent_1px),radial-gradient(circle_at_82%_36%,rgba(167,139,250,0.18)_0_1px,transparent_1px)] bg-[length:14px_14px]" />
                                            <div className="pointer-events-none absolute left-5 top-5 h-6 w-6 rounded-tl-xl border-l-2 border-t-2 border-violet-400/80" />
                                            <div className="pointer-events-none absolute right-5 top-5 h-6 w-6 rounded-tr-xl border-r-2 border-t-2 border-violet-400/80" />
                                            <div className="pointer-events-none absolute bottom-5 left-5 h-6 w-6 rounded-bl-xl border-b-2 border-l-2 border-violet-400/80" />
                                            <div className="pointer-events-none absolute bottom-5 right-5 h-6 w-6 rounded-br-xl border-b-2 border-r-2 border-violet-400/80" />
                                            <div className="relative flex h-32 w-32 items-center justify-center rounded-full border border-blue-400/30 bg-blue-950/45">
                                                <div className="absolute inset-2 rounded-full border border-blue-400/25" />
                                                <Fingerprint
                                                    className={`relative h-20 w-20 ${getFingerprintColor()}`}
                                                />
                                            </div>
                                            <div className="relative mt-3 min-h-[3.5rem]">
                                                <div className="text-base font-bold text-white drop-shadow-sm">
                                                    {scanMessage}
                                                </div>
                                                <div className="mt-1 text-sm font-semibold text-blue-100">
                                                    {retryCountdown !== null
                                                        ? `Retrying in ${retryCountdown} seconds`
                                                        : successCountdown !==
                                                            null
                                                          ? `Resetting in ${successCountdown} seconds`
                                                          : "Keep the finger steady until confirmation."}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid flex-[0.6] overflow-hidden rounded-2xl border border-blue-300/35 bg-[#080f5c] text-white shadow-[0_16px_34px_rgba(2,6,47,0.24)] md:grid-cols-[38%_1fr]">
                                            <div className="relative flex min-h-[13rem] items-center justify-center bg-[#080f5c] p-5">
                                                <EmployeeAvatar
                                                    employee={employee}
                                                    name={employeeName}
                                                    className="relative h-48 w-48 border border-blue-300/55 bg-[#06115d]"
                                                    fallbackClassName="bg-[#06115d]"
                                                    glowClassName="bg-transparent"
                                                    iconClassName="text-blue-300"
                                                    fallbackAnimationClassName=""
                                                />
                                            </div>

                                            <div className="flex min-w-0 flex-col justify-center p-5">
                                                <div className="flex items-center gap-3 rounded-2xl border border-blue-300/25 bg-[#080f5c] px-4 py-3">
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-950/55 text-blue-100 ring-1 ring-blue-200/20">
                                                        <UserRound className="h-5 w-5" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="text-[11px] font-black uppercase tracking-[0.14em] text-blue-100">
                                                            Name
                                                        </div>
                                                        <div className="mt-0.5 min-h-5 truncate text-sm font-bold text-white">
                                                            {employeeName ||
                                                                "Name will appear after scan"}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="mt-3 flex items-center gap-3 rounded-2xl border border-blue-300/25 bg-[#080f5c] px-4 py-3">
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-950/55 text-blue-100 ring-1 ring-blue-200/20">
                                                        <Building2 className="h-5 w-5" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="text-[11px] font-black uppercase tracking-[0.14em] text-blue-100">
                                                            Office
                                                        </div>
                                                        <div className="mt-0.5 truncate text-sm font-bold text-white">
                                                            {employee?.office
                                                                ?.name ||
                                                                employee?.office ||
                                                                "Office will appear after scan"}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="mt-3 flex items-center gap-3 rounded-2xl border border-blue-300/25 bg-[#080f5c] px-4 py-3">
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-950/55 text-blue-100 ring-1 ring-blue-200/20">
                                                        <BriefcaseBusiness className="h-5 w-5" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="text-[11px] font-black uppercase tracking-[0.14em] text-blue-100">
                                                            Position
                                                        </div>
                                                        <div className="mt-0.5 truncate text-sm font-bold text-white">
                                                            {employee?.position ||
                                                                "Position will appear after scan"}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="relative flex min-h-[32rem] flex-col overflow-hidden rounded-[1.35rem] border border-blue-400/25 bg-[#071158] p-5 shadow-[0_18px_56px_rgba(2,6,47,0.30)]">
                                <div className="relative z-10 flex min-h-0 flex-1 flex-col">
                                    <div className="mb-4 flex items-start justify-between gap-4">
                                        <div>
                                            <h2 className="text-lg font-black text-white">
                                                Today&apos;s Logs
                                            </h2>
                                            <p className="text-sm font-semibold text-blue-100">
                                                Latest biometric entries for the
                                                day.
                                            </p>
                                        </div>
                                        <div className="rounded-full border border-blue-300/30 bg-blue-950/55 px-3 py-1 text-sm font-bold text-white shadow-sm">
                                            {totalAttendanceRecords} records
                                        </div>
                                    </div>

                                    <div
                                        className="relative mb-4"
                                        ref={searchBoxRef}
                                    >
                                        <FloatingInput
                                            label="Employee Name"
                                            icon={Search}
                                            name="attendance_search"
                                            value={search}
                                            variant="glass"
                                            disabled={filterLoading}
                                            onChange={(event) => {
                                                setSearch(event.target.value);
                                                filtersRef.current = {
                                                    ...filtersRef.current,
                                                    employeeId: null,
                                                };
                                                setShowSuggestions(true);
                                            }}
                                            onFocus={() =>
                                                setShowSuggestions(true)
                                            }
                                            onKeyDown={(event) => {
                                                if (event.key === "Enter") {
                                                    event.preventDefault();
                                                    applySearch();
                                                }
                                            }}
                                        />

                                        {showSuggestions && search.trim() ? (
                                            <div className="absolute right-0 top-full z-50 mt-2 w-full overflow-hidden rounded-xl border border-blue-300/30 bg-[#071158] shadow-2xl shadow-blue-950/30">
                                                <div className="border-b border-blue-300/20 bg-blue-950/55 px-3 py-2 text-xs font-bold uppercase tracking-wide text-blue-100">
                                                    Results for "{search.trim()}
                                                    "
                                                </div>

                                                <div className="max-h-72 overflow-y-auto">
                                                    {suggestionsLoading ? (
                                                        <SuggestionSkeletonList
                                                            count={3}
                                                        />
                                                    ) : suggestionMatches.length >
                                                      0 ? (
                                                        suggestionMatches.map(
                                                            (employee) => (
                                                                <button
                                                                    key={
                                                                        employee.id
                                                                    }
                                                                    type="button"
                                                                    onMouseDown={() =>
                                                                        selectSuggestion(
                                                                            employee,
                                                                        )
                                                                    }
                                                                    className="flex w-full items-start justify-between gap-3 px-3 py-2 text-left text-sm text-white transition hover:bg-blue-900/60"
                                                                >
                                                                    <div className="flex min-w-0 items-center gap-3">
                                                                        <EmployeeAvatar
                                                                            employee={
                                                                                employee
                                                                            }
                                                                            name={
                                                                                employee.label
                                                                            }
                                                                            className="h-9 w-9"
                                                                        />
                                                                        <div className="min-w-0">
                                                                            <div className="truncate font-medium text-white">
                                                                                {
                                                                                    employee.label
                                                                                }
                                                                            </div>
                                                                            <div className="truncate text-xs text-blue-100">
                                                                                {employee.meta ||
                                                                                    "Employee"}
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <span className="shrink-0 rounded-full bg-blue-800/70 px-2 py-1 text-[11px] font-bold text-blue-50">
                                                                        Search
                                                                    </span>
                                                                </button>
                                                            ),
                                                        )
                                                    ) : (
                                                        <div className="px-3 py-4 text-sm text-blue-100">
                                                            No employee matches
                                                            found.
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
                                        <TabsList className="mb-4 grid w-full grid-cols-2 rounded-xl border border-blue-300/25 bg-blue-950/45 p-1">
                                            <TabsTrigger
                                                value="AM"
                                                className="rounded-lg text-white/80 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                                            >
                                                AM Logs
                                            </TabsTrigger>
                                            <TabsTrigger
                                                value="PM"
                                                className="rounded-lg text-white/80 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
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
                                                    dailyAttendance={
                                                        dailyAttendance
                                                    }
                                                    session={session}
                                                    search={search}
                                                    pagination={attendancePage}
                                                    isLoading={filterLoading}
                                                    onPageChange={(page) =>
                                                        updateAttendanceQuery({
                                                            page,
                                                        })
                                                    }
                                                />
                                            </TabsContent>
                                        ))}
                                    </Tabs>
                                </div>
                            </section>
                    </div>
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

const PromptModal = ({
    employee,
    message,
    secondaryLabel,
    primaryLabel,
    onSecondary,
    onPrimary,
}) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
        <div className="w-full max-w-md overflow-hidden rounded-[1.35rem] border border-white/25 bg-[linear-gradient(135deg,rgba(255,255,255,0.12),rgba(120,119,255,0.18))] text-white shadow-[0_0_28px_rgba(167,139,250,0.20),0_24px_80px_rgba(2,6,47,0.42),inset_0_1px_0_rgba(255,255,255,0.22)] ring-1 ring-violet-200/10 backdrop-blur-md">
            <div className="flex items-center gap-4 border-b border-white/20 px-5 py-4">
                <EmployeeAvatar
                    employee={employee}
                    name={`${employee.first_name || ""} ${employee.last_name || ""}`}
                    className="h-18 w-18"
                />
                <div className="min-w-0">
                    <h2 className="truncate text-lg font-black">
                        {employee.first_name} {employee.last_name}
                    </h2>
                    <p className="text-sm font-semibold text-blue-100">
                        Confirm attendance action
                    </p>
                </div>
            </div>
            <div className="space-y-5 p-5">
                <p className="text-sm font-semibold text-blue-50">{message}</p>
                <div className="flex justify-end gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                        onClick={onSecondary}
                    >
                        {secondaryLabel}
                    </Button>
                    <Button
                        type="button"
                        className="bg-white text-[#141b6d] hover:bg-blue-50"
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
