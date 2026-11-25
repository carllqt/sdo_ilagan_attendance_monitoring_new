import React, { useCallback, useEffect, useRef, useState } from "react";
import { router } from "@inertiajs/react";
import { toast } from "sonner";
import { ArrowLeftRight } from "lucide-react";
import { getEmployeeName } from "@/lib/utils";
import {
    fetchScannerStatus,
    releaseScanner,
    scannerMovedHere,
    scannerUrl,
    scannerUsedElsewhere,
} from "@/lib/fingerprintScanner";
import useEmployeeSearchSuggestions from "../../Admin/EmployeeManagement/hooks/useEmployeeSearchSuggestions";
import AlreadyRecordedToast from "../Partials/AlreadyRecordedToast";
import AttendanceToast from "../Partials/AttendanceToast";
import ScanCooldownToast from "../Partials/ScanCooldownToast";
import {
    attendanceChoice,
    attendanceItems,
    canSwitchToAmSession,
    canSwitchToPmSession,
    canTimeOut,
    defaultLogAction,
    defaultLogsSession,
    defaultSession,
    employeePayload,
    emptyAM,
    emptyPM,
    fingerprintColor,
    scannerMessages,
    statusConfig,
} from "../utils";

const MANUAL_SCANNER_SELECTION_MS = 15 * 1000;
const EMPLOYEE_CONFIRMATION_DISPLAY_MS = 10 * 1000;
const ATTENDANCE_DATE_CHECK_INTERVAL_MS = 3 * 60 * 60 * 1000;
const TEMPORARY_LOGS_DISPLAY_MS = 5 * 1000;
// While another page has the scanner, how often to check if it is free.
const SCANNER_CHECK_MS = 5 * 1000;
// How long a scan's result message stays before "Place your fingerprint".
// The scanner does not wait for it: the next person can scan as soon as the
// last finger is lifted.
const RESULT_DISPLAY_MS = 3 * 1000;

const attendanceDateKey = (date) => {
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Manila",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(date);
    const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));

    return `${values.year}-${values.month}-${values.day}`;
};

const useAttendanceController = ({
    attendances,
    attendanceAccess = {},
    attendanceFilters = {},
    attendanceRules = {},
    fingerprintServiceUrl,
}) => {
    // Every time of day the page uses comes from the server (see utils.js).
    const rules = attendanceRules;
    const defaultActionAt = (date, session) =>
        defaultLogAction(date, session, rules);

    // Follow the server's clock, not the PC's: the page may run on a PC
    // whose clock is off. Set from the time the page was rendered.
    const clockOffsetRef = useRef(null);

    if (clockOffsetRef.current === null) {
        clockOffsetRef.current = attendanceRules.serverTime
            ? attendanceRules.serverTime - Date.now()
            : 0;
    }

    const serverNow = () => new Date(Date.now() + clockOffsetRef.current);
    const initialNow = serverNow();
    const initialUrlParams = new URLSearchParams(window.location.search);
    const requestedScannerSession = initialUrlParams
        .get("session")
        ?.toUpperCase();
    const initialScannerSession = ["AM", "PM"].includes(
        requestedScannerSession,
    )
        ? requestedScannerSession
        : defaultSession(initialNow, rules);
    const initialTab = attendanceFilters.session === "PM" ? "PM" : "AM";
    const requestedInitialAction = initialUrlParams.get("action");
    const initialScannerAction = ["time-in", "time-out"].includes(
        requestedInitialAction,
    )
        ? requestedInitialAction
        : defaultActionAt(initialNow, initialScannerSession);
    const [time, setTime] = useState(initialNow);
    const [employee, setEmployee] = useState(null);
    const [employeeConfirmationKey, setEmployeeConfirmationKey] = useState(0);
    const [scanMessage, setScanMessage] = useState(scannerMessages.placeFinger);
    const [scanStatus, setScanStatus] = useState("idle");
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
    // The page using the scanner when it is not this one, as the fingerprint
    // service describes it ({ label, where, since, summary }); null when the
    // scanner is here.
    const [scannerOwner, setScannerOwnerState] = useState(null);
    const scannerOwnerRef = useRef(null);
    const scannerCheckTimerRef = useRef(null);
    const logActionRef = useRef(initialScannerAction);
    const logSessionRef = useRef(initialScannerSession);
    const scannerEnabledRef = useRef(false);
    // Set while a scan's result message is on screen (see showScanResult).
    const resultTimerRef = useRef(null);
    // True while a prompt waits for its answer; scanning is paused then.
    const promptOpenRef = useRef(false);
    const reconnectTimerRef = useRef(null);
    const manualSelectionTimerRef = useRef(null);
    // The scan log id of the scan whose prompt is open, if any.
    const promptScanIdRef = useRef(null);
    const employeeClearTimerRef = useRef(null);
    const sessionRefreshStartedRef = useRef(false);
    const automaticLogsSessionRef = useRef(null);
    const logsResetTimerRef = useRef(null);
    const attendanceDateRef = useRef(attendanceDateKey(initialNow));
    const attendanceRefreshInFlightRef = useRef(false);
    const access = attendanceAccess || {};
    const canUseScanner = true;
    const stationId = access.station?.id;
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

        if (params.has("search") && params.has("employee_id")) {
            params.delete("employee_id");
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

        params.delete("employee_id");

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

    const showLogsForSession = useCallback((session) => {
        if (session !== "AM" && session !== "PM") return;

        filtersRef.current = {
            ...filtersRef.current,
            session,
        };
        setActiveTab(session);

        const params = new URLSearchParams(window.location.search);
        params.set("logs", session.toLowerCase());
        window.history.replaceState(
            window.history.state,
            "",
            `${window.location.pathname}?${params.toString()}`,
        );
    }, []);

    const showTemporaryLogsForSession = useCallback(
        (session) => {
            clearTimeout(logsResetTimerRef.current);
            showLogsForSession(session);

            logsResetTimerRef.current = setTimeout(() => {
                logsResetTimerRef.current = null;
                const configuredSession = defaultLogsSession(serverNow(), rules);
                automaticLogsSessionRef.current = configuredSession;
                showLogsForSession(configuredSession);
            }, TEMPORARY_LOGS_DISPLAY_MS);
        },
        [showLogsForSession],
    );

    useEffect(() => {
        const syncClock = () => {
            const now = serverNow();
            const nextSession = defaultSession(now, rules);

            setTime(now);

            if (!canSwitchToAmSession(now, rules) && logSession === "AM") {
                setManualLogMode(false);
                setLogSession("PM");
                setLogAction(defaultActionAt(now, "PM"));
                logSessionRef.current = "PM";
                logActionRef.current = defaultActionAt(now, "PM");
            } else if (!manualLogMode) {
                setLogSession(nextSession);
                setLogAction(defaultActionAt(now, nextSession));
                logSessionRef.current = nextSession;
                logActionRef.current = defaultActionAt(now, nextSession);
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

    const refreshAttendanceForDateChange = useCallback(() => {
        const currentDate = attendanceDateKey(serverNow());

        if (
            attendanceDateRef.current === currentDate ||
            attendanceRefreshInFlightRef.current
        ) {
            return;
        }

        attendanceRefreshInFlightRef.current = true;
        router.reload({
            only: ["attendances"],
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                attendanceDateRef.current = currentDate;
            },
            onFinish: () => {
                attendanceRefreshInFlightRef.current = false;
            },
        });
    }, []);

    useEffect(() => {
        const checkDateChange = () => refreshAttendanceForDateChange();
        const timer = setInterval(
            checkDateChange,
            ATTENDANCE_DATE_CHECK_INTERVAL_MS,
        );

        document.addEventListener("visibilitychange", checkDateChange);

        return () => {
            clearInterval(timer);
            document.removeEventListener("visibilitychange", checkDateChange);
        };
    }, [refreshAttendanceForDateChange]);

    const refreshExpiredSession = useCallback((error) => {
        const status = error.response?.status;

        if (status !== 401 && status !== 419) return false;

        if (!sessionRefreshStartedRef.current) {
            sessionRefreshStartedRef.current = true;
            window.location.reload();
        }

        return true;
    }, []);

    useEffect(() => {
        const now = serverNow();
        const requestedSession =
            attendanceFilters.session || defaultSession(now, rules);
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
        const nextLogsSession = defaultLogsSession(time, rules);

        if (automaticLogsSessionRef.current !== nextLogsSession) {
            automaticLogsSessionRef.current = nextLogsSession;

            if (!logsResetTimerRef.current) {
                showLogsForSession(nextLogsSession);
            }
        }
    }, [showLogsForSession, time]);

    useEffect(() => {
        scannerEnabledRef.current = canUseScanner;

        if (!canUseScanner) {
            closeFingerprintStream();
            return;
        }

        // Opening the page moves the scanner here.
        startAttendanceFingerprintScan({ claim: true });
        return () => {
            closeFingerprintStream();
            releaseScanner(fingerprintServiceUrl);
            clearTimeout(resultTimerRef.current);
            clearTimeout(reconnectTimerRef.current);
            clearTimeout(scannerCheckTimerRef.current);
            clearTimeout(manualSelectionTimerRef.current);
            clearTimeout(employeeClearTimerRef.current);
            clearTimeout(logsResetTimerRef.current);
        };
    }, [canUseScanner, stationId]);

    // Closing or reloading the tab gives the scanner back at once (otherwise
    // the service keeps it for this page for a minute).
    useEffect(() => {
        const release = () => releaseScanner(fingerprintServiceUrl);

        window.addEventListener("pagehide", release);
        return () => window.removeEventListener("pagehide", release);
    }, [fingerprintServiceUrl]);

    const updateAttendance = (data, timeStr) => {
        const session = data.session;
        const scannedEmployee = employeePayload(data.employee);

        clearTimeout(employeeClearTimerRef.current);
        setEmployee(scannedEmployee);
        setEmployeeConfirmationKey((current) => current + 1);
        employeeClearTimerRef.current = setTimeout(() => {
            setEmployee(null);
            employeeClearTimerRef.current = null;
        }, EMPLOYEE_CONFIRMATION_DISPLAY_MS);
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

    const setScannerFeedback = (status, message) => {
        setScanStatus(status);
        setScanMessage(message);
    };

    const resetScannerState = () => {
        setScannerFeedback("scanning", scannerMessages.placeFinger);
    };

    const clearScanResult = () => {
        clearTimeout(resultTimerRef.current);
        resultTimerRef.current = null;
    };

    // Show a scan's result for a moment, then go back to "Place your
    // fingerprint". The scanner stays ready the whole time.
    const showScanResult = (status, message) => {
        clearScanResult();
        setScannerFeedback(status, message);
        resultTimerRef.current = setTimeout(() => {
            resultTimerRef.current = null;
            resetScannerState();
        }, RESULT_DISPLAY_MS);
    };

    // The scanner connection stays open from one person to the next; it is
    // closed only for a prompt (or when lost). Reopen it if it is closed,
    // except while a prompt waits for its answer.
    const ensureScannerRunning = () => {
        if (eventSourceRef.current || promptOpenRef.current) return;

        startAttendanceFingerprintScan({ keepFeedback: true });
    };

    const applyAttendanceResult = (data) => {
        if (!data || Object.keys(data).length === 0) return;

        if (data.prompt) {
            // Pause scanning until this person answers: the answer belongs
            // to their scan.
            promptOpenRef.current = true;
            clearScanResult();
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
            toast.custom(
                () =>
                    React.createElement(ScanCooldownToast, {
                        employee: data.employee,
                        recordedAction: data.last_recorded_action,
                        recordedAt: data.last_recorded_at,
                        remainingMinutes: data.remaining_minutes,
                    }),
                {
                    duration: 3000,
                    position: "top-center",
                    style: {
                        width: "min(500px, calc(100vw - 2rem))",
                    },
                },
            );
            clearScanResult();
            resetScannerState();
            ensureScannerRunning();
            return;
        }

        if (data.already_recorded && data.employee) {
            showScanResult("error", data.message);
            toast.custom(
                () =>
                    React.createElement(AlreadyRecordedToast, {
                        employee: data.employee,
                        recordedAction: data.recorded_action,
                        recordedAt: data.recorded_at,
                    }),
                {
                    duration: 3000,
                    position: "top-center",
                    style: {
                        width: "min(500px, calc(100vw - 2rem))",
                    },
                },
            );
            ensureScannerRunning();
            return;
        }

        if (data.success && data.employee && data.session && data.action) {
            const timeStr = data.time || serverNow().toTimeString().split(" ")[0];
            updateAttendance(data, timeStr);
            showTemporaryLogsForSession(data.session);
            showScanResult("success", data.message);
            ensureScannerRunning();
            return;
        }

        if (data.message) {
            showScanResult("error", data.message);
            ensureScannerRunning();
        }
    };

    // scanId: the fingerprint service's scan log row (with the match score);
    // the server adds what this scan recorded to it.
    const recordAttendanceScan = async (employeeId, scanId = null) => {
        if (!employeeId) return;

        // The scanner stays open: the next person can scan while this saves.
        clearScanResult();
        setScannerFeedback("processing", scannerMessages.recording);

        try {
            const response = await window.axios.post(route("attendance.scan"), {
                employee_id: employeeId,
                choice: attendanceChoice(
                    logSessionRef.current,
                    logActionRef.current,
                ),
                scan_id: scanId,
            }, {
                timeout: 15000,
            });

            // The prompt's answer completes this scan's log row.
            if (response.data?.prompt) {
                promptScanIdRef.current = scanId;
            }

            applyAttendanceResult(response.data);

            // A prompt is still part of this scan; reset once it is answered
            // or ignored instead.
            if (!response.data?.prompt) {
                resetManualSelection();
            }
        } catch (error) {
            if (refreshExpiredSession(error)) return;

            const message =
                error.response?.data?.message ||
                "Unable to record attendance.";

            showScanResult("error", message);
            ensureScannerRunning();
        }
    };

    const setScannerOwner = (owner) => {
        scannerOwnerRef.current = owner;
        setScannerOwnerState(owner);
    };

    const scheduleScannerCheck = () => {
        clearTimeout(scannerCheckTimerRef.current);
        scannerCheckTimerRef.current = setTimeout(
            checkScannerAvailability,
            SCANNER_CHECK_MS,
        );
    };

    // Another page has the scanner: show who, and come back on our own once
    // it is free (e.g. the registration finished).
    const checkScannerAvailability = async () => {
        if (!scannerEnabledRef.current || !scannerOwnerRef.current) return;

        try {
            const status = await fetchScannerStatus(fingerprintServiceUrl);

            if (!scannerOwnerRef.current) return;

            if (status.free) {
                startAttendanceFingerprintScan({ resume: true });
                return;
            }

            if (status.owner) setScannerOwner(status.owner);
        } catch {
            // Service not reachable; keep checking.
        }

        scheduleScannerCheck();
    };

    const showScannerUsedElsewhere = (data) => {
        closeFingerprintStream();
        clearTimeout(reconnectTimerRef.current);
        setScannerOwner(data.owner || { summary: data.message });
        scheduleScannerCheck();
    };

    const takeScannerHere = () => {
        clearTimeout(scannerCheckTimerRef.current);
        startAttendanceFingerprintScan({ claim: true });
    };

    const showScannerMovedHere = (data) => {
        toast.custom(
            () =>
                React.createElement(AttendanceToast, {
                    detail: "That page stopped scanning.",
                    icon: React.createElement(ArrowLeftRight, {
                        className: "h-4 w-4",
                    }),
                    message: data.message,
                    title: "Scanner is now on this page",
                    tone: "info",
                }),
            { duration: 5000, position: "top-center" },
        );
    };

    const handleResponseData = (data) => {
        if (!data || Object.keys(data).length === 0) return;

        if (scannerUsedElsewhere(data)) {
            showScannerUsedElsewhere(data);
            return;
        }

        if (scannerMovedHere(data)) {
            showScannerMovedHere(data);
            return;
        }

        if (data.status === "ready") {
            clearTimeout(scannerCheckTimerRef.current);
            setScannerOwner(null);
        }

        if (data.status) {
            if (data.status === "error") {
                clearScanResult();
                setScannerFeedback("error", data.message);
                return;
            }

            // "Scanner ready" and the like do not replace a result still on
            // screen.
            if (!resultTimerRef.current) {
                setScannerFeedback(
                    data.status === "processing" ? "processing" : "scanning",
                    data.message || scannerMessages.placeFinger,
                );
            }
            return;
        }

        if (data.success && data.employee?.id && !data.session) {
            recordAttendanceScan(data.employee.id, data.scan_id ?? null);
            return;
        }

        // e.g. "Fingerprint not recognized.": shown, and the person can try
        // again right away.
        applyAttendanceResult(data);
    };

    // claim: a person opened the page or pressed "Use scanner here", so the
    // scanner moves here. resume: the availability check found it free.
    // Every other call is an automatic restart (after a prompt or a lost
    // connection), which does nothing while another page has the scanner.
    // keepFeedback: leave the result on screen (e.g. after a prompt answer).
    const startAttendanceFingerprintScan = ({
        claim = false,
        resume = false,
        keepFeedback = false,
    } = {}) => {
        if (!scannerEnabledRef.current) return;
        if (scannerOwnerRef.current && !claim && !resume) return;

        closeFingerprintStream();

        if (!keepFeedback) {
            clearScanResult();
            resetScannerState();
        }

        const eventSource = new EventSource(
            scannerUrl(fingerprintServiceUrl, "/bioAttendanceScan", {
                station_id: stationId,
                claim,
            }),
        );
        eventSourceRef.current = eventSource;

        eventSource.onopen = () => {
            if (eventSourceRef.current !== eventSource) return;

            if (!resultTimerRef.current) {
                setScannerFeedback("scanning", scannerMessages.connected);
            }
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

            // Lost the connection while waiting for the scanner: keep
            // checking for it instead of reconnecting.
            if (scannerOwnerRef.current) {
                scheduleScannerCheck();
                return;
            }

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
        showTemporaryLogsForSession(session);
    };

    // A manual Time In/Out pick is for one person's scan. Once that scan is
    // finished (recorded, prompt answered or prompt ignored), go back to the
    // clock default so the next person does not inherit it.
    const resetManualSelection = () => {
        clearTimeout(manualSelectionTimerRef.current);
        manualSelectionTimerRef.current = null;

        const now = serverNow();
        const session = defaultSession(now, rules);
        const action = defaultActionAt(now, session);

        logSessionRef.current = session;
        logActionRef.current = action;
        setLogSession(session);
        setLogAction(action);
        setManualLogMode(false);
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

        if (nextSession === "AM" && !canSwitchToAmSession(time, rules)) {
            return false;
        }

        if (
            nextSession === "PM" &&
            !canSwitchToPmSession(time, rules)
        ) {
            return false;
        }

        enableManualLogMode();
        setLogSession(nextSession);
        const nextAction = defaultActionAt(time, nextSession);
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
        if (
            action === "time-out" &&
            !canTimeOut(serverNow(), logSessionRef.current, rules)
        ) {
            return false;
        }

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

        return true;
    };

    const handlePromptChoice = async (choice) => {
        const promptData = amPromptData || pmPromptData;

        if (!promptData?.employee?.id) return;

        promptOpenRef.current = false;
        setShowAMPromptModal(false);
        setShowPMPromptModal(false);
        resetManualSelection();
        setScannerFeedback("processing", `Recording ${choice}...`);

        // The answer completes the same scan's log row.
        const scanId = promptScanIdRef.current;
        promptScanIdRef.current = null;

        try {
            const response = await window.axios.post(route("attendance.choice"), {
                employee_id: promptData.employee.id,
                choice,
                scan_id: scanId,
            });

            applyAttendanceResult(response.data);
        } catch (error) {
            if (refreshExpiredSession(error)) return;

            const message =
                error.response?.data?.message ||
                "Failed to send choice to server.";

            showScanResult("error", message);
            ensureScannerRunning();
        }
    };

    const handlePromptTimeout = () => {
        promptOpenRef.current = false;
        promptScanIdRef.current = null;
        setShowAMPromptModal(false);
        setShowPMPromptModal(false);
        setAMPromptData(null);
        setPMPromptData(null);
        resetManualSelection();
        resetScannerState();
        startAttendanceFingerprintScan();
    };

    // While another page has the scanner, that is the status shown,
    // whatever this page was last doing.
    const displayStatus = scannerOwner ? "elsewhere" : scanStatus;
    const currentStatus = statusConfig[displayStatus] || statusConfig.idle;
    const StatusIcon = currentStatus.icon;
    const selectedChoice = attendanceChoice(logSession, logAction);
    const timeOutLocked = !canTimeOut(time, logSession, rules);
    const timeOutOpensLabel = rules.timeOutOpensAt?.[logSession]?.label ?? "";
    const pmSessionLocked =
        logSession === "AM" && !canSwitchToPmSession(time, rules);
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

    const applyAttendanceSearch = () => {
        if (filterLoading) return;

        setShowSuggestions(false);
        updateAttendanceQuery({
            search,
            employeeId: filtersRef.current.employeeId,
        });
    };

    const clearAttendanceSearch = () => {
        if (filterLoading) return;

        setSearch("");
        setShowSuggestions(false);
        updateAttendanceQuery({ search: "", employeeId: null });
    };

    return {
        activeTab,
        applyAttendanceSearch,
        amPromptData,
        currentStatus,
        dailyAttendance,
        employee,
        employeeConfirmationKey,
        employeeName,
        filterLoading,
        fingerprintColor: fingerprintColor(displayStatus),
        formattedDate,
        clearAttendanceSearch,
        handleLogActionChange,
        handleLogSessionToggle,
        handlePromptChoice,
        handlePromptTimeout,
        handleSearchChange,
        handleSessionChange,
        hasOpenSuggestions,
        logAction,
        logSession,
        pmPromptData,
        pmSessionLocked,
        amSessionClosesAt: rules.amSessionClosesAt?.label ?? "",
        pmSessionOpensAt: rules.pmSessionOpensAt?.label ?? "",
        scanMessage,
        scannerOwner,
        scanStatus: displayStatus,
        search,
        searchBoxRef,
        selectSuggestion,
        selectedChoice,
        setShowSuggestions,
        showAMPromptModal,
        showPMPromptModal,
        StatusIcon,
        suggestionMatches,
        suggestionsLoading,
        takeScannerHere,
        time,
        timeOutLocked,
        timeOutOpensAt: timeOutOpensLabel,
        totalAttendanceRecords,
    };
};

export default useAttendanceController;
