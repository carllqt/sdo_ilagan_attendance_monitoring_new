import React from "react";
import { CheckCircle2, Clock3, Plane, XCircle } from "lucide-react";

import EmployeeAvatar from "@/Components/EmployeeAvatar";
import { Skeleton } from "@/components/ui/skeleton";
import { formatTime } from "../utils";

const EmployeeCard = ({ row }) => {
    const status = row.status || "Absent";
    const isPresent = status === "Present";
    const isLate = status === "Late";
    const isAbsent = status === "Absent";
    const isOnTravel = row.isOnTravel || status === "ON TRAVEL";

    return (
        <div className="rounded-xl border border-white/80 bg-white p-4 shadow-lg shadow-blue-950/10 transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-950/20">
            <div className="flex items-start gap-4">
                <EmployeeAvatar employee={row} className="h-16 w-16" />
                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-black text-[#070d3f]">
                        {row.name}
                    </p>
                    <p className="mt-1 truncate text-[11px] font-bold uppercase text-slate-500">
                        {row.position}
                    </p>
                    <p className="truncate text-xs font-semibold text-slate-500">
                        {row.station}
                    </p>
                </div>
                <span
                    className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-black shadow-sm ${
                        isOnTravel
                            ? "bg-sky-500 text-white shadow-sky-200"
                            : isPresent
                            ? "bg-emerald-500 text-white shadow-emerald-200"
                            : isLate
                              ? "bg-amber-400 text-[#070d3f] shadow-amber-200"
                              : isAbsent
                                ? "bg-rose-500 text-white shadow-rose-200"
                                : "bg-slate-500 text-white shadow-slate-200"
                    }`}
                >
                    {isOnTravel && <Plane className="h-3.5 w-3.5" />}
                    {isPresent && <CheckCircle2 className="h-3.5 w-3.5" />}
                    {isLate && <Clock3 className="h-3.5 w-3.5" />}
                    {isAbsent && <XCircle className="h-3.5 w-3.5" />}
                    {status}
                </span>
            </div>

            <div className="mt-5 grid grid-cols-4 gap-2 text-center">
                {[
                    ["AM In", row.am_in],
                    ["AM Out", row.am_out],
                    ["PM In", row.pm_in],
                    ["PM Out", row.pm_out],
                ].map(([label, time]) => (
                    <div key={label}>
                        <p className="truncate text-xs font-black text-[#070d3f]">
                            {formatTime(time)}
                        </p>
                        <p className="text-xs font-semibold text-slate-400">
                            {label}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

const EmployeeCardSkeleton = () => (
    <div className="rounded-xl border border-white/70 bg-white/90 p-4 shadow-lg shadow-blue-950/10">
        <div className="flex items-start gap-4">
            <Skeleton className="h-16 w-16 shrink-0 rounded-full bg-[#0b1b5f]/25" />
            <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-4/5 bg-[#0b1b5f]/25" />
                <Skeleton className="h-3 w-3/5 bg-[#0b1b5f]/20" />
                <Skeleton className="h-3 w-1/2 bg-[#0b1b5f]/20" />
            </div>
            <Skeleton className="h-6 w-16 shrink-0 rounded-full bg-[#0b1b5f]/25" />
        </div>

        <div className="mt-5 grid grid-cols-4 gap-2">
            {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="space-y-2">
                    <Skeleton className="mx-auto h-3 w-12 bg-[#0b1b5f]/25" />
                    <Skeleton className="mx-auto h-3 w-10 bg-[#0b1b5f]/20" />
                </div>
            ))}
        </div>
    </div>
);

export const EmployeeCardSkeletonGrid = ({ count = 16 }) => (
    <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        {Array.from({ length: count }).map((_, index) => (
            <EmployeeCardSkeleton key={index} />
        ))}
    </div>
);

export const EmployeeCardGrid = ({ page, pageMotion, rows }) => (
    <div
        key={`${page}-${pageMotion}`}
        className={`grid gap-4 md:grid-cols-2 2xl:grid-cols-4 ${
            pageMotion === "previous"
                ? "monitor-page-swipe-previous"
                : "monitor-page-swipe-next"
        }`}
    >
        {rows.map((row) => (
            <EmployeeCard key={row.employee_id} row={row} />
        ))}
    </div>
);
