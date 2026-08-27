import { useEffect, useRef, useState } from "react";
import { router } from "@inertiajs/react";
import { toast } from "sonner";
import {
    clampAvailableFingers,
    fingerprintMessages,
    formatFingerprintRegistrationParam,
} from "../utils";
import { getEmployeeName } from "@/lib/utils";

const useFingerprintPanel = ({
    filteredEmployees,
    fingerprintServiceUrl,
    isSchoolAdmin = false,
    selectedFingerprintEmployeeProp,
    testFingerprintModal,
}) => {
    const registrationToastId = "fingerprint-registration";
    const [selectedEmployee, setSelectedEmployee] = useState(
        selectedFingerprintEmployeeProp?.id || "",
    );
    const [selectedFingerprintEmployee, setSelectedFingerprintEmployee] =
        useState(selectedFingerprintEmployeeProp);
    const [scanStatus, setScanStatus] = useState("idle");
    const [scanMessage, setScanMessage] = useState("");
    const [scanFeedbackKey, setScanFeedbackKey] = useState(0);
    const [scanning, setScanning] = useState(false);
    const registerSourceRef = useRef(null);
    const registrationInProgressRef = useRef(false);
    const registrationSuccessMessageRef = useRef("");
    const [testOpen, setTestOpen] = useState(Boolean(testFingerprintModal));
    const testOpenRef = useRef(Boolean(testFingerprintModal));
    const [testMessage, setTestMessage] = useState(
        fingerprintMessages.testWaiting,
    );
    const [testStatus, setTestStatus] = useState("idle");
    const testSourceRef = useRef(null);
    const testResetTimerRef = useRef(null);
    const testReconnectTimerRef = useRef(null);
    const [fingerprintEmployeeLoading, setFingerprintEmployeeLoading] =
        useState(false);

    useEffect(() => {
        setSelectedEmployee(selectedFingerprintEmployeeProp?.id || "");
        setSelectedFingerprintEmployee(selectedFingerprintEmployeeProp);
    }, [selectedFingerprintEmployeeProp]);

    useEffect(() => {
        const nextOpen = Boolean(testFingerprintModal);
        setTestOpen(nextOpen);
        testOpenRef.current = nextOpen;
    }, [testFingerprintModal]);

    const findCurrentEmployee = (empId) =>
        String(selectedFingerprintEmployee?.id) === String(empId)
            ? selectedFingerprintEmployee
            : filteredEmployees.find((emp) => String(emp.id) === String(empId));

    const isRegistered = (id) => {
        const emp = findCurrentEmployee(id);

        return emp ? Number(emp.available_fingers ?? 3) < 3 : false;
    };

    const availableFingers = (empId) => {
        const emp = findCurrentEmployee(empId);

        return clampAvailableFingers(emp?.available_fingers);
    };

    const stopRegisterSource = (source = registerSourceRef.current) => {
        if (source) {
            source.close();
        }

        if (!source || registerSourceRef.current === source) {
            registerSourceRef.current = null;
        }
    };

    const stopTestSource = (source = testSourceRef.current) => {
        source?.close();

        if (!source || testSourceRef.current === source) {
            testSourceRef.current = null;
        }
    };

    const clearTestTimers = () => {
        clearTimeout(testResetTimerRef.current);
        clearTimeout(testReconnectTimerRef.current);
    };

    const setRegistrationFeedback = (status, message) => {
        setScanStatus(status);
        setScanMessage(message);
    };

    const showRegistrationErrorToast = (message) => {
        toast.dismiss(registrationToastId);

        window.requestAnimationFrame(() => {
            toast.error(message);
        });
    };

    const setTestFeedback = (status, message) => {
        setTestStatus(status);
        setTestMessage(message);
    };

    const resetTestFeedback = () => {
        setTestFeedback("scanning", fingerprintMessages.testPlaceFinger);
    };

    const scheduleTestReset = () => {
        clearTimeout(testResetTimerRef.current);
        testResetTimerRef.current = setTimeout(resetTestFeedback, 3000);
    };

    const clearFingerprintEmployee = ({ onSuccess, onError } = {}) => {
        let querySucceeded = false;

        setFingerprintEmployeeLoading(true);
        setSelectedEmployee("");
        setSelectedFingerprintEmployee(null);

        const params = new URLSearchParams(window.location.search);
        params.delete("fingerprint_employee_id");
        params.delete("fingerprint_registration");

        router.get(route("employee-management"), Object.fromEntries(params), {
            preserveState: false,
            preserveScroll: true,
            replace: true,
            onSuccess: () => {
                querySucceeded = true;
            },
            onError,
            onFinish: () => {
                setFingerprintEmployeeLoading(false);

                if (querySucceeded) {
                    window.requestAnimationFrame(() => onSuccess?.());
                }
            },
        });
    };

    useEffect(() => {
        return () => {
            stopRegisterSource();
            stopTestSource();
            clearTestTimers();
        };
    }, []);

    const cancelScan = () => {
        stopRegisterSource();
        registrationInProgressRef.current = false;
        toast.dismiss(registrationToastId);
        setScanning(false);
        setRegistrationFeedback("idle", fingerprintMessages.cancelled);
    };

    const registerFingerprint = () => {
        if (
            !selectedEmployee ||
            registerSourceRef.current ||
            registrationInProgressRef.current
        ) {
            return;
        }

        stopRegisterSource();
        registrationInProgressRef.current = true;
        setScanning(true);
        setRegistrationFeedback(
            "scanning",
            fingerprintMessages.registrationStarting,
        );
        toast.loading(fingerprintMessages.registrationStarting, {
            id: registrationToastId,
        });

        const source = new EventSource(
            `${fingerprintServiceUrl}/bioRegisterSSE/${selectedEmployee}`,
        );
        registerSourceRef.current = source;

        source.onmessage = (event) => {
            if (registerSourceRef.current !== source) return;

            try {
                const data = JSON.parse(event.data);
                if (!data || Object.keys(data).length === 0) return;

                setScanFeedbackKey((value) => value + 1);

                if (data.success === null) {
                    setRegistrationFeedback("scanning", data.message);
                    toast.loading(data.message, { id: registrationToastId });
                } else if (data.success === true) {
                    setRegistrationFeedback("success", data.message);
                    registrationSuccessMessageRef.current = data.message;
                    setScanning(false);
                    stopRegisterSource(source);
                    toast.loading("Updating fingerprint registration...", {
                        id: registrationToastId,
                    });

                    setSelectedFingerprintEmployee((current) =>
                        String(current?.id) === String(selectedEmployee)
                            ? {
                                  ...current,
                                  available_fingers: Math.max(
                                      Number(current.available_fingers ?? 3) -
                                          1,
                                      0,
                                  ),
                              }
                            : current,
                    );

                    clearFingerprintEmployee({
                        onSuccess: () => {
                            toast.success(
                                registrationSuccessMessageRef.current ||
                                    "Fingerprint registered successfully.",
                                { id: registrationToastId },
                            );
                            registrationInProgressRef.current = false;
                        },
                        onError: () => {
                            showRegistrationErrorToast(
                                "Fingerprint registered, but the employee list could not be updated.",
                            );
                            registrationInProgressRef.current = false;
                        },
                    });
                } else if (data.success === false) {
                    setRegistrationFeedback("error", data.message);
                    showRegistrationErrorToast(data.message);
                    registrationInProgressRef.current = false;
                    setScanning(false);
                    stopRegisterSource(source);
                }
            } catch (err) {
                console.error("Failed to parse SSE data:", err);
                setScanFeedbackKey((value) => value + 1);
                setRegistrationFeedback(
                    "error",
                    fingerprintMessages.unexpectedError,
                );
                showRegistrationErrorToast(
                    fingerprintMessages.unexpectedError,
                );
                registrationInProgressRef.current = false;
                setScanning(false);
                stopRegisterSource(source);
            }
        };

        source.onerror = (err) => {
            if (registerSourceRef.current !== source) return;

            console.error("SSE connection error:", err);
            setScanFeedbackKey((value) => value + 1);
            setRegistrationFeedback(
                "error",
                fingerprintMessages.serviceUnavailable,
            );
            showRegistrationErrorToast(
                fingerprintMessages.serviceUnavailable,
            );
            registrationInProgressRef.current = false;
            setScanning(false);
            stopRegisterSource(source);
        };
    };

    const startTestFingerprint = () => {
        clearTestTimers();
        stopTestSource();
        resetTestFeedback();

        const source = new EventSource(`${fingerprintServiceUrl}/bioAttendanceScan`);
        testSourceRef.current = source;

        source.onmessage = (event) => {
            if (testSourceRef.current !== source) return;

            try {
                const data = JSON.parse(event.data);

                if (!data || Object.keys(data).length === 0) return;

                if (data.status) {
                    setTestFeedback(
                        data.status === "error" ? "error" : "scanning",
                        data.message || fingerprintMessages.testPlaceFinger,
                    );
                    return;
                }

                if (data.success && data.employee) {
                    const { office, position, station } = data.employee;
                    const locationName = isSchoolAdmin
                        ? station?.name || "No station"
                        : office?.name || "-";

                    setTestFeedback(
                        "success",
                        `Match: ${getEmployeeName(data.employee)} (${locationName} - ${position})`,
                    );

                    scheduleTestReset();
                } else if (data.message) {
                    setTestFeedback("error", data.message);
                    scheduleTestReset();
                }
            } catch (err) {
                console.error("SSE parse error:", err);
                setTestFeedback("error", fingerprintMessages.testError);
            }
        };

        source.onerror = (err) => {
            if (testSourceRef.current !== source) return;

            console.error("SSE error:", err);
            setTestFeedback("error", fingerprintMessages.testDisconnected);
            stopTestSource(source);

            clearTimeout(testReconnectTimerRef.current);
            testReconnectTimerRef.current = setTimeout(() => {
                if (testOpenRef.current) startTestFingerprint();
            }, 3000);
        };
    };

    const selectFingerprintEmployee = (employee) => {
        setFingerprintEmployeeLoading(true);
        setSelectedEmployee(employee.id);
        setSelectedFingerprintEmployee(employee);

        const params = new URLSearchParams(window.location.search);
        params.delete("fingerprint_employee_id");
        params.set(
            "fingerprint_registration",
            formatFingerprintRegistrationParam(employee),
        );

        router.get(route("employee-management"), Object.fromEntries(params), {
            preserveState: false,
            preserveScroll: true,
            replace: true,
            onFinish: () => setFingerprintEmployeeLoading(false),
        });
    };

    const handleTestFingerprintOpenChange = (nextOpen) => {
        setTestOpen(nextOpen);
        testOpenRef.current = nextOpen;

        if (!nextOpen) {
            clearTestTimers();
            stopTestSource();
        }

        const params = new URLSearchParams(window.location.search);

        if (nextOpen) {
            params.set("modal", "test-fingerprint");
            params.delete("employee_id");
        } else if (params.get("modal") === "test-fingerprint") {
            params.delete("modal");
        }

        router.get(route("employee-management"), Object.fromEntries(params), {
            only: ["testFingerprintModal"],
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    return {
        availableFingers,
        cancelScan,
        clearFingerprintEmployee,
        handleTestFingerprintOpenChange,
        fingerprintEmployeeLoading,
        isRegistered,
        registerFingerprint,
        scanFeedbackKey,
        scanMessage,
        scanStatus,
        scanning,
        selectedEmployee,
        selectedFingerprintEmployee,
        selectFingerprintEmployee,
        setSelectedEmployee,
        setSelectedFingerprintEmployee,
        startTestFingerprint,
        testMessage,
        testOpen,
        testStatus,
    };
};

export default useFingerprintPanel;
