import React from "react";
import { toast } from "sonner";
import {
    BriefcaseBusiness,
    Building2,
    Fingerprint,
    LogIn,
    LogOut,
    Sun,
    UserRound,
} from "lucide-react";
import EmployeeAvatar from "@/Components/EmployeeAvatar";
import SessionChangeToast from "./SessionChangeToast";

const ScannerPanel = ({
    currentStatus,
    employee,
    employeeName,
    fingerprintColor,
    handleLogActionChange,
    handleLogSessionToggle,
    logAction,
    logSession,
    retryCountdown,
    scanMessage,
    selectedChoice,
    successCountdown,
}) => {
    const nextSession = logSession === "AM" ? "PM" : "AM";

    const showSessionToast = () => {
        toast.custom(() => <SessionChangeToast session={nextSession} />, {
            duration: 3000,
        });
        handleLogSessionToggle();
    };

    return (
        <section className="relative flex min-h-[36rem] flex-col overflow-hidden rounded-[1.35rem] border border-blue-400/25 bg-[#071158] p-5 shadow-[0_18px_56px_rgba(2,6,47,0.30)] xl:h-full xl:min-h-0">
            <div className="relative z-10 flex min-h-0 flex-1 flex-col">
                <div className="mb-4 flex items-center justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-black text-white">
                            Time In / Time Out
                        </h2>
                        <p className="text-sm font-semibold text-blue-100">
                            Scan fingerprint to record attendance.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={showSessionToast}
                        className="rounded-full border border-blue-300/30 bg-blue-950/55 px-3 py-1 text-sm font-bold text-white shadow-sm transition hover:border-emerald-300/70 hover:text-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-300/60"
                        aria-label={`Switch to ${nextSession} session`}
                    >
                        {logSession} Session
                    </button>
                </div>

                <div className="flex min-h-0 flex-1 flex-col gap-4">
                    <div
                        className={`relative grid min-h-0 flex-1 basis-1/2 overflow-hidden rounded-2xl border border-violet-400/70 bg-[radial-gradient(circle_at_50%_20%,rgba(80,70,255,0.42),transparent_30%),linear-gradient(135deg,rgba(14,21,139,0.92),rgba(4,10,78,0.96))] px-5 py-4 shadow-[0_0_28px_rgba(79,70,229,0.26)] md:grid-cols-2 ${currentStatus.panelClass}`}
                    >
                        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_62%,rgba(56,189,248,0.16)_0_1px,transparent_1px),radial-gradient(circle_at_82%_36%,rgba(167,139,250,0.18)_0_1px,transparent_1px)] bg-[length:14px_14px]" />
                        <div className="pointer-events-none absolute left-5 top-5 h-6 w-6 rounded-tl-xl border-l-2 border-t-2 border-violet-400/80" />
                        <div className="pointer-events-none absolute right-5 top-5 h-6 w-6 rounded-tr-xl border-r-2 border-t-2 border-violet-400/80" />
                        <div className="pointer-events-none absolute bottom-5 left-5 h-6 w-6 rounded-bl-xl border-b-2 border-l-2 border-violet-400/80" />
                        <div className="pointer-events-none absolute bottom-5 right-5 h-6 w-6 rounded-br-xl border-b-2 border-r-2 border-violet-400/80" />

                        <div className="relative flex min-h-0 flex-col items-center justify-center px-4 py-4 text-center">
                            <div className="relative flex h-28 w-28 items-center justify-center rounded-full border border-blue-400/30 bg-blue-950/45 2xl:h-32 2xl:w-32">
                                <div className="absolute inset-2 rounded-full border border-blue-400/25" />
                                <Fingerprint
                                    className={`relative h-16 w-16 2xl:h-20 2xl:w-20 ${fingerprintColor}`}
                                />
                            </div>
                            <div className="relative mt-3 min-h-[3.5rem]">
                                <div className="text-base font-bold text-white drop-shadow-sm">
                                    {scanMessage}
                                </div>
                                <div className="mt-1 text-sm font-semibold text-blue-100">
                                    {retryCountdown !== null
                                        ? `Retrying in ${retryCountdown} seconds`
                                        : successCountdown !== null
                                          ? `Resetting in ${successCountdown} seconds`
                                          : "Keep the finger steady until confirmation."}
                                </div>
                            </div>
                        </div>

                        <div className="relative flex min-h-0 flex-col justify-center border-t border-violet-400/35 px-4 py-4 md:border-l md:border-t-0 md:pl-7">
                            <button
                                type="button"
                                onClick={showSessionToast}
                                className="inline-flex w-fit items-center gap-2 rounded-full text-sm font-black uppercase text-emerald-200 transition hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-300/60"
                                aria-label={`Switch to ${nextSession} session`}
                            >
                                <Sun className="h-4 w-4" />
                                {logSession} Session
                            </button>

                            <div className="mt-4 grid gap-3">
                                {[
                                    {
                                        action: "time-in",
                                        label: "Time In",
                                        Icon: LogIn,
                                    },
                                    {
                                        action: "time-out",
                                        label: "Time Out",
                                        Icon: LogOut,
                                    },
                                ].map(({ action, label, Icon }) => {
                                    const selected = logAction === action;

                                    return (
                                        <button
                                            key={action}
                                            type="button"
                                            onClick={() =>
                                                handleLogActionChange(action)
                                            }
                                            className={`flex min-h-[3.9rem] items-center gap-4 rounded-xl border px-4 text-left text-sm font-black uppercase transition focus:outline-none focus:ring-2 focus:ring-emerald-300/70 2xl:min-h-[4.4rem] ${
                                                selected
                                                    ? "border-emerald-400 bg-emerald-500/10 text-white shadow-[0_0_22px_rgba(16,185,129,0.18)]"
                                                    : "border-emerald-400/45 bg-blue-950/25 text-blue-100 hover:border-emerald-300 hover:bg-emerald-500/10 hover:text-white"
                                            }`}
                                        >
                                            <span
                                                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border ${
                                                    selected
                                                        ? "border-emerald-300 bg-emerald-500/30 text-emerald-100"
                                                        : "border-emerald-400/50 bg-emerald-500/15 text-emerald-200"
                                                }`}
                                            >
                                                <Icon className="h-5 w-5" />
                                            </span>
                                            <span>{label}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            <p className="mt-3 text-xs font-semibold text-blue-100">
                                Next scan records{" "}
                                <span className="font-black text-emerald-200">
                                    {selectedChoice}
                                </span>
                                .
                            </p>
                        </div>
                    </div>

                    <div className="grid min-h-0 flex-1 basis-1/2 overflow-hidden rounded-2xl border border-blue-300/35 bg-[#080f5c] text-white shadow-[0_16px_34px_rgba(2,6,47,0.24)] md:grid-cols-[38%_1fr]">
                        <div className="relative flex min-h-0 items-center justify-center bg-[#080f5c] p-5">
                            <EmployeeAvatar
                                employee={employee}
                                name={employeeName}
                                className="relative h-40 w-40 border border-blue-300/55 bg-[#06115d] 2xl:h-48 2xl:w-48"
                                fallbackClassName="bg-[#06115d]"
                                glowClassName="bg-transparent"
                                iconClassName="text-blue-300"
                                fallbackAnimationClassName=""
                            />
                        </div>

                        <div className="flex min-w-0 flex-col justify-center p-5">
                            <EmployeeInfoRow
                                icon={UserRound}
                                label="Name"
                                value={
                                    employeeName ||
                                    "Name will appear after scan"
                                }
                            />
                            <EmployeeInfoRow
                                className="mt-3"
                                icon={Building2}
                                label="Office"
                                value={
                                    employee?.office?.name ||
                                    employee?.office ||
                                    "Office will appear after scan"
                                }
                            />
                            <EmployeeInfoRow
                                className="mt-3"
                                icon={BriefcaseBusiness}
                                label="Position"
                                value={
                                    employee?.position ||
                                    "Position will appear after scan"
                                }
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

const EmployeeInfoRow = ({ className = "", icon: Icon, label, value }) => (
    <div
        className={`flex items-center gap-3 rounded-2xl border border-blue-300/25 bg-[#080f5c] px-4 py-2.5 2xl:py-3 ${className}`}
    >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-950/55 text-blue-100 ring-1 ring-blue-200/20">
            <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
            <div className="text-[11px] font-black uppercase tracking-[0.14em] text-blue-100">
                {label}
            </div>
            <div className="mt-0.5 min-h-5 truncate text-sm font-bold text-white">
                {value}
            </div>
        </div>
    </div>
);

export default ScannerPanel;
