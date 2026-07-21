import React from "react";
import BrandSubtitle from "@/Components/BrandSubtitle";

const AttendanceHeader = ({
    currentStatus,
    formattedDate,
    scanStatus,
    StatusIcon,
    time,
}) => (
    <header className="flex shrink-0 flex-col gap-4 rounded-[1.35rem] border border-white/25 bg-[linear-gradient(135deg,rgba(255,255,255,0.10),rgba(120,119,255,0.15))] px-5 py-3 shadow-[0_0_28px_rgba(167,139,250,0.18),0_22px_70px_rgba(2,6,47,0.38),inset_0_1px_0_rgba(255,255,255,0.22)] ring-1 ring-violet-200/10 backdrop-blur-[2px] lg:flex-row lg:items-center lg:justify-between">
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
                        scanStatus === "processing" ? "animate-spin" : ""
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
);

export default AttendanceHeader;
