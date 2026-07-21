import { useEffect, useRef, useState } from "react";
import { router } from "@inertiajs/react";
import { getEmployeeName } from "@/lib/utils";
import useEmployeeSearchSuggestions from "../../Admin/EmployeeManagement/hooks/useEmployeeSearchSuggestions";
import {
    attendanceChoice,
    attendanceItems,
    defaultLogAction,
    defaultSession,
    employeePayload,
    emptyAM,
    emptyPM,
    fingerprintColor,
    statusConfig,
} from "../utils";

const useAttendanceController = ({
    attendances,
    attendanceAccess = {},
    attendanceFilters = {},
    fingerprintServiceUrl,
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
    const [showAMPromptModal, setShowAMPromptModal] = useState(false);
    const [amPromptData, setAMPromptData] = useState(null);
    const [showPMPromptModal, setShowPMPromptModal] = useState(false);
    const [pmPromptData, setPMPromptData] = useState(null);
    const [activeTab, setActiveTab] = useState(initialSession);
    const [logSession, setLogSession] = useState(initialSession);
    const [logAction, setLogAction] = useState(
        defaultLogAction(new Date(), initialSession),
    );
    const [manualLogMode, setManualLogMode] = useState(false);
    const [search, setSearch] = useState(attendanceFilters.search || "");
    const [filterLoading, setFilterLoading] = useState(false);
    const filtersRef = useRef({
        search: attendanceFilters.search || "",
        employeeId: attendanceFilters.employee_id || null,
        session: initialSession,
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
    const totalAttendanceRecords = dailyAttendance.length;
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
    const hasOpenSuggestions = showSuggestions && Boolean(search.trim());

    const updateAttendanceQuery = (values = {}) => {
        const next = {
            ...filtersRef.current,
            session: activeTab,
            ...values,
        };
        const params = new URLSearchParams(window.location.search);
        const nextSearch = String(next.search || "").trim();
        const nextEmployeeId = Number(next.employeeId || 0) || null;
        const nextSession = next.session === "PM" ? "PM" : "AM";

        if (nextSearch) {
            params.set("search", nextSearch);
        } else {
            params.delete("search");
        }

        params.set("session", nextSession);
        params.delete("page");
        params.delete("limit");

        filtersRef.current = {
            search: nextSearch,
            employeeId: nextEmployeeId,
            session: nextSession,
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

    const selectSuggestion = (employee) => {
        if (filterLoading) return;

        setSearch(employee.label);
        updateAttendanceQuery({
            search: employee.label,
            employeeId: employee.id,
        });
        setShowSuggestions(false);
    };

    useEffect(() => {
        const syncClock = () => {
            const now = new Date();
            const nextSession = defaultSession(now);

            setTime(now);

            if (!manualLogMode) {
                setLogSession(nextSession);
                setLogAction(defaultLogAction(now, nextSession));
            }
        };

        syncClock();
        const timer = setInterval(syncClock, 1000);

        return () => clearInterval(timer);
    }, [manualLogMode]);

    useEffect(() => {
        setDailyAttendance(attendanceItems(attendances));
    }, [attendances]);

    useEffect(() => {
        const nextSession = attendanceFilters.session || defaultSession();
        const nextFilters = {
            search: attendanceFilters.search || "",
            employeeId: attendanceFilters.employee_id || null,
            session: nextSession,
        };

        filtersRef.current = nextFilters;
        setSearch(nextFilters.search);
        setActiveTab(nextSession);

        if (!manualLogMode) {
            setLogSession(nextSession);
            setLogAction(defaultLogAction(new Date(), nextSession));
        }
    }, [attendanceFilters, manualLogMode]);

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
                choice: attendanceChoice(logSession, logAction),
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
        updateAttendanceQuery({ session });
    };

    const handleLogSessionToggle = () => {
        const nextSession = logSession === "AM" ? "PM" : "AM";

        setManualLogMode(true);
        setLogSession(nextSession);
        setLogAction(defaultLogAction(time, nextSession));
    };

    const handleLogActionChange = (action) => {
        setManualLogMode(true);
        setLogAction(action);
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

    const currentStatus = statusConfig[scanStatus] || statusConfig.idle;
    const StatusIcon = currentStatus.icon;
    const selectedChoice = attendanceChoice(logSession, logAction);
    const employeeName = employee ? getEmployeeName(employee) : "";
    const formattedDate = time.toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    const handleSearchChange = (event) => {
        const nextSearch = event.target.value;

        setSearch(nextSearch);
        filtersRef.current = {
            ...filtersRef.current,
            search: nextSearch,
            employeeId: null,
        };
        setShowSuggestions(true);
    };

    return {
        activeTab,
        amPromptData,
        currentStatus,
        dailyAttendance,
        employee,
        employeeName,
        filterLoading,
        fingerprintColor: fingerprintColor(scanStatus),
        formattedDate,
        handleLogActionChange,
        handleLogSessionToggle,
        handlePromptChoice,
        handleSearchChange,
        handleSessionChange,
        hasOpenSuggestions,
        logAction,
        logSession,
        pmPromptData,
        retryCountdown,
        scanMessage,
        scanStatus,
        search,
        searchBoxRef,
        selectSuggestion,
        selectedChoice,
        setShowSuggestions,
        showAMPromptModal,
        showPMPromptModal,
        StatusIcon,
        successCountdown,
        suggestionMatches,
        suggestionsLoading,
        time,
        totalAttendanceRecords,
    };
};

export default useAttendanceController;
