import React from "react";
import { ListChecks, Plane, Trophy } from "lucide-react";

import EmployeeAvatar from "@/Components/EmployeeAvatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
    formatTime,
    formatTimeWithSeconds,
    formatTravelDate,
    personName,
} from "../utils";

const SidePanelSkeletonItems = ({ count = 4, showRank = false }) => (
    <>
        {Array.from({ length: count }).map((_, index) => (
            <div
                key={index}
                className="flex items-center gap-2.5 rounded-lg bg-white/90 p-2 shadow-sm"
            >
                {showRank ? (
                    <Skeleton className="h-4 w-4 shrink-0 bg-[#0b1b5f]/25" />
                ) : null}
                <Skeleton className="h-8 w-8 shrink-0 rounded-full bg-[#0b1b5f]/25" />
                <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-3 w-3/4 bg-[#0b1b5f]/25" />
                    <Skeleton className="h-3 w-1/2 bg-[#0b1b5f]/20" />
                </div>
                <div className="shrink-0 space-y-2">
                    <Skeleton className="h-3 w-12 bg-[#0b1b5f]/25" />
                    <Skeleton className="h-3 w-10 bg-[#0b1b5f]/20" />
                </div>
            </div>
        ))}
    </>
);

const RecentLogsPanel = ({ isLoading = false, items = [] }) => (
    <aside className="rounded-2xl border border-white/15 bg-[#071158]/70 p-4 text-white shadow-[0_16px_44px_rgba(2,6,47,0.26)] transition duration-300 hover:-translate-y-1 hover:bg-[#09166a]/80 hover:shadow-2xl hover:shadow-blue-950/35">
        <div className="mb-2 flex items-start gap-2.5">
            <ListChecks className="h-5 w-5 shrink-0 text-cyan-200" />
            <div>
                <h3 className="text-sm font-black text-white">
                    Recent Attendance Logs
                </h3>
                <p className="text-[11px] font-semibold text-blue-100">
                    Latest employee time entries
                </p>
            </div>
        </div>

        <div className="space-y-1 border-t border-white/20 pt-2">
            {isLoading ? (
                <SidePanelSkeletonItems count={4} />
            ) : items.length > 0 ? (
                items.map((item) => (
                    <div
                        key={item.id}
                        className="flex items-center gap-2.5 rounded-lg bg-white/95 p-2 shadow-sm"
                    >
                        <EmployeeAvatar employee={item} className="h-8 w-8" />
                        <div className="min-w-0 flex-1">
                            <div className="truncate text-xs font-black text-[#070d3f]">
                                {personName(item) || "Employee"}
                            </div>
                            <div className="truncate text-[11px] font-bold uppercase text-slate-500">
                                {item.position || "Employee"}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-[11px] font-black text-blue-700">
                                {item.label}
                            </div>
                            <div className="text-xs font-black text-[#070d3f]">
                                {formatTimeWithSeconds(item.time)}
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <div className="rounded-lg bg-white/90 py-3 text-center text-xs font-semibold text-slate-500">
                    No attendance logs yet.
                </div>
            )}
        </div>
    </aside>
);

const RankingPanel = ({ isLoading = false, items = [] }) => (
    <aside className="rounded-2xl border border-white/15 bg-[#071158]/70 p-4 text-white shadow-[0_16px_44px_rgba(2,6,47,0.26)] transition duration-300 hover:-translate-y-1 hover:bg-[#09166a]/80 hover:shadow-2xl hover:shadow-blue-950/35">
        <div className="mb-2 flex items-start gap-2.5">
            <Trophy className="h-5 w-5 shrink-0 text-amber-200" />
            <div>
                <h3 className="text-sm font-black text-white">
                    Earliest Time-In Records
                </h3>
                <p className="text-[11px] font-semibold text-blue-100">
                    First recorded morning entries today
                </p>
            </div>
        </div>

        <div className="space-y-1 border-t border-white/20 pt-2">
            {isLoading ? (
                <SidePanelSkeletonItems count={4} showRank />
            ) : items.length > 0 ? (
                items.map((item, index) => {
                    const rankClass =
                        index === 0
                            ? "border-l-4 border-l-amber-300 shadow-amber-300/25"
                            : index === 1
                              ? "border-l-4 border-l-slate-300 shadow-slate-300/25"
                              : index === 2
                                ? "border-l-4 border-l-orange-400 shadow-orange-300/25"
                                : "border-l-4 border-l-white/70";

                    return (
                        <div
                            key={item.id}
                            className={`flex items-center gap-2.5 rounded-lg bg-white/95 p-2 shadow-sm ${rankClass}`}
                        >
                            <span className="w-4 shrink-0 text-xs font-black text-[#070d3f]">
                                {index + 1}
                            </span>
                            <EmployeeAvatar
                                employee={item}
                                className="h-8 w-8"
                            />
                            <div className="min-w-0 flex-1">
                                <div className="truncate text-xs font-black text-[#070d3f]">
                                    {personName(item) || "Employee"}
                                </div>
                                <div className="truncate text-[11px] font-bold uppercase text-slate-500">
                                    {item.position || "Employee"}
                                </div>
                            </div>
                            <span className="rounded-full border border-emerald-200 bg-emerald-100 px-2.5 py-1 text-[11px] font-black text-emerald-700">
                                {formatTime(item.am_in)}
                            </span>
                        </div>
                    );
                })
            ) : (
                <div className="rounded-lg bg-white/90 py-3 text-center text-xs font-semibold text-slate-500">
                    No time-ins yet.
                </div>
            )}
        </div>
    </aside>
);

const TravelPanel = ({ isLoading = false, items = [] }) => (
    <aside className="rounded-2xl border border-white/15 bg-[#071158]/70 p-4 text-white shadow-[0_16px_44px_rgba(2,6,47,0.26)] transition duration-300 hover:-translate-y-1 hover:bg-[#09166a]/80 hover:shadow-2xl hover:shadow-blue-950/35">
        <div className="mb-2 flex items-start justify-between gap-2.5">
            <div className="flex min-w-0 items-start gap-2.5">
                <Plane className="h-5 w-5 shrink-0 text-cyan-200" />
                <div className="min-w-0">
                    <h3 className="text-sm font-black text-white">On Travel</h3>
                    <p className="text-[11px] font-semibold text-blue-100">
                        Official travel today
                    </p>
                </div>
            </div>
            {isLoading ? (
                <Skeleton className="h-6 w-8 rounded-full bg-[#0b1b5f]/25" />
            ) : (
                <span className="flex h-6 min-w-6 items-center justify-center rounded-full border border-white/30 bg-white/20 px-2 text-xs font-black text-white">
                    {items.length}
                </span>
            )}
        </div>

        <div className="space-y-2 border-t border-white/20 pt-3">
            {isLoading ? (
                <SidePanelSkeletonItems count={3} />
            ) : items.length > 0 ? (
                items.map((item) => {
                    const employee = item.employee || {};

                    return (
                        <div
                            key={item.id}
                            className="flex items-center gap-2.5 rounded-lg bg-white/95 p-2 shadow-sm"
                        >
                            <EmployeeAvatar
                                employee={employee}
                                className="h-8 w-8"
                            />
                            <div className="min-w-0 flex-1">
                                <div className="truncate text-xs font-black text-[#070d3f]">
                                    {personName(employee) || "Employee"}
                                </div>
                                <div className="truncate text-[11px] font-bold uppercase text-slate-500">
                                    {employee.position || "Employee"}
                                </div>
                            </div>
                            <div className="shrink-0 text-right text-[11px] font-black text-blue-700">
                                {formatTravelDate(item)}
                            </div>
                        </div>
                    );
                })
            ) : (
                <div className="rounded-lg bg-white/90 py-3 text-center text-xs font-semibold text-slate-500">
                    No employees on travel.
                </div>
            )}
        </div>
    </aside>
);

const SidePanels = ({
    isStationFiltering,
    recentLogs,
    topFirstTimeIns,
    travelOrders,
}) => (
    <div className="space-y-3">
        <RecentLogsPanel isLoading={isStationFiltering} items={recentLogs} />
        <RankingPanel isLoading={isStationFiltering} items={topFirstTimeIns} />
        <TravelPanel isLoading={isStationFiltering} items={travelOrders} />
    </div>
);

export default SidePanels;
