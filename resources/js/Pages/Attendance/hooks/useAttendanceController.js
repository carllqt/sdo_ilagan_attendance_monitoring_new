import React, { useEffect, useRef, useState } from "react";
import { router } from "@inertiajs/react";
import { toast } from "sonner";
import { getEmployeeName } from "@/lib/utils";
import useEmployeeSearchSuggestions from "../../Admin/EmployeeManagement/hooks/useEmployeeSearchSuggestions";
import ScanCooldownToast from "../Partials/ScanCooldownToast";
import {
    attendanceChoice,
    attendanceItems,
    canSwitchToAmSession,
    defaultLogAction,
    defaultSession,
    employeePayload,
    emptyAM,
    emptyPM,
    fingerprintColor,
    scannerMessages,
    statusConfig,
} from "../utils";

const MANUAL_SCANNER_SELECTION_MS = 60 * 1000;

const useAttendanceController = ({
    attendances,
    attendanceAccess = {},
    attendanceFilters = {},
    fingerprintServiceUrl,
}) => {
    const initialNow = new Date();
    const initialUrlParams = new URLSearchParams(window.location.search);
    const requestedScannerSession = initialUrlParams
        .get("session")
        ?.toUpperCase();
    const initialScannerSession = ["AM", "PM"].includes(
        requestedScannerSession,
    )
        ? requestedScannerSession
        : defaultSession(initialNow);
    const initialTab = attendanceFilters.session === "PM" ? "PM" : "AM";
    const requestedInitialAction = initialUrlParams.get("action");
    const initialScannerAction = ["time-in", "time-out"].includes(
        requestedInitialAction,
    )
        ? requestedInitialAction
        : defaultLogAction(initialNow, initialScannerSession);
    const [time, setTime] = useState(new Date());
    const [employee, setEmployee] = useState(null);
    const [scanMessage, setScanMessage] = useState(scannerMessages.placeFinger);
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
    const [activeTab, setActiveTab] = useState(initialTab);
    const [logSession, setLogSession] = useState(initialScannerSession);
    const [logAction, setLogAction] = useState(initialScannerAction);
    const [manualLogMode, setManualLogMode] = useState(false);
    const [search, setSearch] = useState(attendanceFilters.search || "");
    const [filterLoading, setFilterLoading] = useState(false);
    const filtersRef = useRef({
        search: attendanceFilters.search || "",
        employeeId: attendanceFilters.employee_id || null,
        session: initialTab,
    });
    const eventSourceRef = useRef(null);
    const logActionRef = useRef(initialScannerAction);
    const logSessionRef = useRef(initialScannerSession);
    const scannerEnabledRef = useRef(false);
    const retryTimerRef = useRef(null);
    const successTimerRef = useRef(null);
    const reconnectTimerRef = useRef(null);
    const manualSelectionTimerRef = useRef(null);
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

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        let changed = false;

        if (!params.has("session")) {
            params.set("session", initialScannerSession.toLowerCase());
            changed = true;
        }

        if (!params.has("action")) {
            params.set("action", initialScannerAction);
            changed = true;
        }

        if (!params.has("logs")) {
            params.set("logs", initialTab.toLowerCase());
            changed = true;
        }

        if (params.has("attendancelogs")) {
            params.delete("attendancelogs");
            changed = true;
        }

        if (changed) {
            window.history.replaceState(
                window.history.state,
                "",
                `${window.location.pathname}?${params.toString()}`,
            );
        }
    }, [initialScannerAction, initialScannerSession, initialTab]);

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

        params.set("logs", nextSession.toLowerCase());
        params.delete("attendancelogs");
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

            if (!canSwitchToAmSession(now) && logSession === "AM") {
                setManualLogMode(false);
                setLogSession("PM");
                setLogAction(defaultLogAction(now, "PM"));
                logSessionRef.current = "PM";
                logActionRef.current = defaultLogAction(now, "PM");
            } else if (!manualLogMode) {
                setLogSession(nextSession);
                setLogAction(defaultLogAction(now, nextSession));
                logSessionRef.current = nextSession;
                logActionRef.current = defaultLogAction(now, nextSession);
            }
        };

        syncClock();
        const timer = setInterval(syncClock, 1000);

        return () => clearInterval(timer);
    }, [logSession, manualLogMode]);

    useEffect(() => {
        logActionRef.current = logAction;
        logSessionRef.current = logSession;
    }, [logAction, logSession]);

    useEffect(() => {
        if (manualLogMode) return;

        const params = new URLSearchParams(window.location.search);
        const session = logSession.toLowerCase();

        if (
            params.get("session") === session &&
            params.get("action") === logAction
        ) {
            return;
        }

        params.set("session", session);
        params.set("action", logAction);
        window.history.replaceState(
            window.history.state,
            "",
            `${window.location.pathname}?${params.toString()}`,
        );
    }, [logAction, logSession, manualLogMode]);

    useEffect(() => {
        setDailyAttendance(attendanceItems(attendances));
    }, [attendances]);

    useEffect(() => {
        const keepSessionAlive = () => {
            window.axios
                .get(route("attendance.keep-alive"))
                .catch(() => undefined);
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                keepSessionAlive();
            }
        };

        keepSessionAlive();
        const timer = setInterval(keepSessionAlive, 30 * 60 * 1000);
        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            clearInterval(timer);
            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange,
            );
        };
    }, []);

    useEffect(() => {
        const now = new Date();
        const requestedSession =
            attendanceFilters.session || defaultSession(now);
        const nextSession = requestedSession === "PM" ? "PM" : "AM";
        const nextFilters = {
            search: attendanceFilters.search || "",
            employeeId: attendanceFilters.employee_id || null,
            session: nextSession,
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
            clearTimeout(manualSelectionTimerRef.current);
        };
    }, [canUseScanner, stationQuery]);

    const updateAttendance = (data, timeStr) => {
        const session = data.session;
        const scannedEmployee = employeePayload(data.employee);

        setEmployee(scannedEmployee);
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

    const setScannerFeedback = (status, message) => {
        setScanStatus(status);
        setScanMessage(message);
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
                resetScannerState();
                callback?.();
            }
        }, 1000);
    };

    const resetScannerState = () => {
        setScannerFeedback("scanning", scannerMessages.placeFinger);
    };

    const retryScanner = (restartScanner = true) => {
        startRetryCountdown(3, () => {
            resetScannerState();
            if (restartScanner) startAttendanceFingerprintScan();
        });
    };

    const applyAttendanceResult = (data, restartScanner = true) => {
        if (!data || Object.keys(data).length === 0) return;

        if (data.prompt) {
            closeFingerprintStream();
            setScannerFeedback("prompt", data.message);

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

        if (data.cooldown && data.employee) {
            closeFingerprintStream();
            toast.custom(
                () =>
                    React.createElement(ScanCooldownToast, {
                        employee: data.employee,
                        recordedAction: data.last_recorded_action,
                        recordedAt: data.last_recorded_at,
                        remainingMinutes: data.remaining_minutes,
                    }),
                {
                    duration: 5000,
                    position: "top-center",
                },
            );
            resetScannerState();
            retryScanner(restartScanner);
            return;
        }

        if (data.success && data.employee && data.session && data.action) {
            const timeStr = data.time || new Date().toTimeString().split(" ")[0];
            updateAttendance(data, timeStr);
            setScannerFeedback("success", data.message);
            startSuccessCountdown(() => {
                if (restartScanner) startAttendanceFingerprintScan();
            });
            return;
        }

        if (data.message && !data.prompt) {
            setScannerFeedback("error", data.message);
            retryScanner(restartScanner);
        }
    };

    const recordAttendanceScan = async (employeeId) => {
        if (!employeeId) return;

        closeFingerprintStream();
        setScannerFeedback("processing", scannerMessages.recording);

        try {
            const response = await window.axios.post(route("attendance.scan"), {
                employee_id: employeeId,
                choice: attendanceChoice(
                    logSessionRef.current,
                    logActionRef.current,
                ),
            }, {
                timeout: 15000,
            });

            applyAttendanceResult(response.data);
        } catch (error) {
            const message =
                error.response?.data?.message ||
                "Unable to record attendance.";

            setScannerFeedback("error", message);
            retryScanner();
        }
    };

    const handleResponseData = (data) => {
        if (!data || Object.keys(data).length === 0) return;

        if (data.status) {
            setScannerFeedback(
                data.status === "processing"
                    ? "processing"
                    : data.status === "error"
                      ? "error"
                      : "scanning",
                data.message || scannerMessages.placeFinger,
            );
            return;
        }

        if (data.success && data.employee?.id && !data.session) {
            recordAttendanceScan(data.employee.id);
            return;
        }

        // Stop acquiring fingerprints throughout the retry countdown.
        closeFingerprintStream();
        applyAttendanceResult(data, true);
    };

    const startAttendanceFingerprintScan = () => {
        if (!scannerEnabledRef.current) return;

        closeFingerprintStream();
        resetScannerState();

        const eventSource = new EventSource(
            `${fingerprintServiceUrl}/bioAttendanceScan${stationQuery}`,
        );
        eventSourceRef.current = eventSource;

        eventSource.onopen = () => {
            if (eventSourceRef.current !== eventSource) return;

            setScannerFeedback("scanning", scannerMessages.connected);
        };

        eventSource.onmessage = (event) => {
            if (eventSourceRef.current !== eventSource) return;

            try {
                const dataStr = event.data.startsWith("data:")
                    ? event.data.slice(5)
                    : event.data;

                handleResponseData(JSON.parse(dataStr));
            } catch (err) {
                console.error("SSE parse error:", err);
                setScannerFeedback("error", scannerMessages.parseError);
            }
        };

        eventSource.onerror = (err) => {
            if (eventSourceRef.current !== eventSource) return;

            console.error("SSE error:", err);
            eventSource.close();
            eventSourceRef.current = null;
            setScannerFeedback("error", scannerMessages.disconnected);
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

    const enableManualLogMode = () => {
        clearTimeout(manualSelectionTimerRef.current);
        setManualLogMode(true);
        manualSelectionTimerRef.current = setTimeout(() => {
            setManualLogMode(false);
        }, MANUAL_SCANNER_SELECTION_MS);
    };

    const handleLogSessionToggle = () => {
        const nextSession = logSession === "AM" ? "PM" : "AM";

        if (nextSession === "AM" && !canSwitchToAmSession(time)) {
            return false;
        }

        enableManualLogMode();
        setLogSession(nextSession);
        const nextAction = defaultLogAction(time, nextSession);
        setLogAction(nextAction);
        logSessionRef.current = nextSession;
        logActionRef.current = nextAction;

        const params = new URLSearchParams(window.location.search);
        params.set("session", nextSession.toLowerCase());
        params.set("action", nextAction);
        window.history.replaceState(
            window.history.state,
            "",
            `${window.location.pathname}?${params.toString()}`,
        );

        return true;
    };

    const handleLogActionChange = (action) => {
        enableManualLogMode();
        setLogAction(action);
        logActionRef.current = action;

        const params = new URLSearchParams(window.location.search);
        params.set("action", action);
        window.history.replaceState(
            window.history.state,
            "",
            `${window.location.pathname}?${params.toString()}`,
        );
    };

    const handlePromptChoice = async (choice) => {
        const promptData = amPromptData || pmPromptData;

        if (!promptData?.employee?.id) return;

        setShowAMPromptModal(false);
        setShowPMPromptModal(false);
        setScannerFeedback("processing", `Recording ${choice}...`);

        try {
            const response = await window.axios.post(route("attendance.choice"), {
                employee_id: promptData.employee.id,
                choice,
            });

            applyAttendanceResult(response.data);
        } catch (error) {
            const message =
                error.response?.status === 419
                    ? "Your attendance session expired. Refresh the page and sign in again."
                    : error.response?.data?.message ||
                      "Failed to send choice to server.";

            setScannerFeedback("error", message);
            retryScanner();
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
