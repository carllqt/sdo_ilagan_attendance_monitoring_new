import React, { useState } from "react";
import { Head, Link } from "@inertiajs/react";
import {
    Activity,
    ArrowUpRight,
    BellRing,
    CheckCircle2,
    Loader2,
    RadioTower,
} from "lucide-react";
import { toast } from "sonner";

import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

const formatTime = (time) => {
    if (!time) return "-";

    const [hours = 0, minutes = 0] = String(time).split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);

    return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
    });
};

const EmployeeTestButton = ({ employee, isSubmitted, loadingId, onTrigger }) => {
    const isLoading = Number(loadingId) === Number(employee.id);

    return (
        <button
            type="button"
            disabled={Boolean(loadingId)}
            onClick={() => onTrigger(employee)}
            className={`flex min-h-[104px] flex-col items-start justify-between rounded-lg border p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 ${
                isSubmitted
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-slate-200 bg-white hover:border-blue-200"
            }`}
        >
            <div className="min-w-0">
                <div className="flex min-w-0 items-center gap-2">
                    <div className="truncate text-sm font-black text-slate-900">
                        {employee.name}
                    </div>
                    {isSubmitted ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                    ) : null}
                </div>
                <div className="mt-1 truncate text-xs font-semibold text-slate-500">
                    {employee.position || "Employee"}
                </div>
            </div>

            <span
                className={`mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-black ${
                    isSubmitted
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-blue-50 text-blue-700"
                }`}
            >
                {isLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : isSubmitted ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                    <Activity className="h-3.5 w-3.5" />
                )}
                {isLoading ? "Sending" : isSubmitted ? "Submitted" : "Trigger"}
            </span>
        </button>
    );
};

const LiveTest = ({
    station = null,
    targetEmployee = null,
    targetEmployees = [],
}) => {
    const employees = targetEmployees.length
        ? targetEmployees
        : targetEmployee
          ? [targetEmployee]
          : [];
    const [loadingId, setLoadingId] = useState(null);
    const [result, setResult] = useState(null);
    const [submittedIds, setSubmittedIds] = useState([]);
    const [allRunning, setAllRunning] = useState(false);
    const monitoringHref = route("attendance-monitoring", {
        ...(station?.code ? { station_code: station.code } : {}),
        ...(station?.name ? { station_name: station.name } : {}),
    });

    const handleResult = (
        nextResult,
        fallbackEmployee = null,
        showToast = true,
    ) => {
        setResult(nextResult);

        if (Array.isArray(nextResult.results)) {
            if (showToast) {
                toast.success(`${nextResult.count || 0} live test updates sent.`);
            }
            return;
        }

        if (showToast) {
            toast.success(
                `${nextResult.action || "Attendance"} test sent for ${
                    nextResult.employee?.name ||
                    fallbackEmployee?.name ||
                    "Employee"
                }.`,
            );
        }
    };

    const submitEmployeeTrigger = async (employee, showToast = true) => {
        const response = await window.axios.post(
            route("attendance-monitoring.live-test.trigger"),
            {
                employee_id: employee.id,
            },
        );
        const nextResult = response.data || {};

        handleResult(nextResult, employee, showToast);
        setSubmittedIds((current) => [
            ...new Set([...current, Number(employee.id)]),
        ]);

        return nextResult;
    };

    const triggerLiveUpdate = (employee) => {
        if (!employee?.id || loadingId || allRunning) return;

        setLoadingId(employee.id);

        submitEmployeeTrigger(employee)
            .catch((error) => {
                const message =
                    error.response?.data?.message ||
                    "Unable to trigger live attendance test.";

                toast.error(message);
            })
            .finally(() => setLoadingId(null));
    };

    const triggerAllLiveUpdates = async () => {
        if (!employees.length || loadingId || allRunning) return;

        const results = [];

        setAllRunning(true);
        setResult(null);
        setSubmittedIds([]);

        for (const employee of employees) {
            setLoadingId(employee.id);

            try {
                const nextResult = await submitEmployeeTrigger(employee, false);
                results.push(nextResult);
            } catch (error) {
                const message =
                    error.response?.data?.message ||
                    `Unable to trigger ${employee.name || "employee"}.`;

                toast.error(message);
            }
        }

        const batchResult = {
            ok: true,
            count: results.length,
            results,
        };

        setLoadingId(null);
        setAllRunning(false);
        handleResult(batchResult);
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-3">
                    <BellRing className="h-5 w-5 text-blue-600" />
                    <span>Attendance Monitoring Live Test</span>
                </div>
            }
        >
            <Head title="Attendance Monitoring Live Test" />

            <div className="mx-auto flex max-w-5xl flex-col gap-5">
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wide text-blue-600">
                                Live broadcast tester
                            </p>
                            <h1 className="mt-2 text-2xl font-black text-slate-900">
                                Trigger monitoring toast
                            </h1>
                            <p className="mt-2 max-w-xl text-sm font-medium text-slate-500">
                                Open Attendance Monitoring in another tab, then
                                click employees below to insert or update
                                today's attendance and broadcast it live.
                            </p>
                        </div>

                        <Link
                            href={monitoringHref}
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                        >
                            Open Monitoring
                            <ArrowUpRight className="h-4 w-4" />
                        </Link>
                    </div>

                    <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
                        <div className="text-xs font-bold uppercase text-slate-400">
                            Station
                        </div>
                        <div className="mt-2 text-lg font-black text-slate-900">
                            {station?.name || "Selected station"}
                        </div>
                        <div className="mt-1 text-sm font-semibold text-slate-500">
                            Showing up to {employees.length} active employees
                            for live testing.
                        </div>
                    </div>

                    <button
                        type="button"
                        disabled={
                            !employees.length || Boolean(loadingId) || allRunning
                        }
                        onClick={triggerAllLiveUpdates}
                        className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-black shadow-lg transition disabled:cursor-not-allowed disabled:shadow-none md:w-auto ${
                            employees.length &&
                            submittedIds.length >= employees.length
                                ? "bg-emerald-600 text-white shadow-emerald-100 hover:bg-emerald-700 disabled:bg-emerald-300"
                                : "bg-slate-900 text-white shadow-slate-200 hover:bg-slate-800 disabled:bg-slate-300"
                        }`}
                    >
                        {allRunning ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : employees.length &&
                          submittedIds.length >= employees.length ? (
                            <CheckCircle2 className="h-4 w-4" />
                        ) : (
                            <RadioTower className="h-4 w-4" />
                        )}
                        {allRunning
                            ? `Triggering ${submittedIds.length}/${employees.length}...`
                            : employees.length &&
                                submittedIds.length >= employees.length
                              ? "All Submitted"
                            : `Trigger All ${employees.length}`}
                    </button>
                </div>

                {employees.length > 0 ? (
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {employees.map((employee) => (
                            <EmployeeTestButton
                                key={employee.id}
                                employee={employee}
                                isSubmitted={submittedIds.includes(
                                    Number(employee.id),
                                )}
                                loadingId={loadingId}
                                onTrigger={triggerLiveUpdate}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-700">
                        No active employees found for this station.
                    </div>
                )}

                {result ? (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900">
                        <div className="text-sm font-black">
                            Last test sent
                        </div>
                        <div className="mt-2 text-sm font-semibold">
                            {Array.isArray(result.results)
                                ? `${result.count || 0} employees updated`
                                : `${result.employee?.name || "Employee"} - ${
                                      result.action
                                  } - ${formatTime(result.time)}`}
                        </div>
                    </div>
                ) : null}
            </div>
        </AuthenticatedLayout>
    );
};

export default LiveTest;
