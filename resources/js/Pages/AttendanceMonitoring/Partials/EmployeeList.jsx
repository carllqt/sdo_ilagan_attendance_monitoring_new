import React from "react";
import {
    Building2,
    CheckCircle2,
    Clock3,
    Loader2,
    ListChecks,
    Plane,
    Search,
    Trophy,
    XCircle,
    X,
} from "lucide-react";
import FloatingInput from "@/components/floating-input";
import EmployeeAvatar from "@/Components/EmployeeAvatar";
import PaginationMain from "@/Components/PaginationMain";
import SchoolList from "./SchoolList";
import useSearchSuggestions from "../hooks/useSearchSuggestions";

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

const formatDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
};

const formatTravelDate = (item = {}) => {
    const startDate = formatDate(item.start_date);
    const endDate = formatDate(item.end_date);

    if (!startDate && !endDate) return "Today";
    if (startDate === endDate || !endDate) return startDate;

    return `${startDate} - ${endDate}`;
};

const EmployeeCard = ({ row }) => {
    const status = row.status || "Absent";
    const isPresent = status === "Present";
    const isLate = status === "Late";
    const isAbsent = status === "Absent";

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
                        isPresent
                            ? "bg-emerald-500 text-white shadow-emerald-200"
                            : isLate
                              ? "bg-amber-400 text-[#070d3f] shadow-amber-200"
                              : isAbsent
                                ? "bg-rose-500 text-white shadow-rose-200"
                                : "bg-slate-500 text-white shadow-slate-200"
                    }`}
                >
                    {isPresent && <CheckCircle2 className="h-3.5 w-3.5" />}
                    {isLate && <Clock3 className="h-3.5 w-3.5" />}
                    {isAbsent && <XCircle className="h-3.5 w-3.5" />}
                    {status}
                </span>
            </div>

            <div className="mt-5">
                <div className="grid grid-cols-4 gap-2 text-center">
                    <div>
                        <p className="truncate text-xs font-black text-[#070d3f]">
                            {formatTime(row.am_in)}
                        </p>
                        <p className="text-xs font-semibold text-slate-400">
                            AM In
                        </p>
                    </div>
                    <div>
                        <p className="truncate text-xs font-black text-[#070d3f]">
                            {formatTime(row.am_out)}
                        </p>
                        <p className="text-xs font-semibold text-slate-400">
                            AM Out
                        </p>
                    </div>
                    <div>
                        <p className="truncate text-xs font-black text-[#070d3f]">
                            {formatTime(row.pm_in)}
                        </p>
                        <p className="text-xs font-semibold text-slate-400">
                            PM In
                        </p>
                    </div>
                    <div>
                        <p className="truncate text-xs font-black text-[#070d3f]">
                            {formatTime(row.pm_out)}
                        </p>
                        <p className="text-xs font-semibold text-slate-400">
                            PM Out
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const personName = (item = {}) =>
    item.full_name ||
    [item.first_name, item.middle_name, item.last_name]
        .filter(Boolean)
        .join(" ");

const RecentLogsPanel = ({ items = [] }) => (
    <aside className="rounded-2xl border border-white/18 bg-white/[0.045] p-4 text-white shadow-[0_16px_44px_rgba(2,6,47,0.26),inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:bg-white/[0.07] hover:shadow-2xl hover:shadow-blue-950/35">
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
            {items.length > 0 ? (
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
                                {formatTime(item.time)}
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

const RankingPanel = ({ items = [] }) => (
    <aside className="rounded-2xl border border-white/18 bg-white/[0.045] p-4 text-white shadow-[0_16px_44px_rgba(2,6,47,0.26),inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:bg-white/[0.07] hover:shadow-2xl hover:shadow-blue-950/35">
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
            {items.length > 0 ? (
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

const TravelPanel = ({ items = [] }) => (
    <aside className="rounded-2xl border border-white/18 bg-white/[0.045] p-4 text-white shadow-[0_16px_44px_rgba(2,6,47,0.26),inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:bg-white/[0.07] hover:shadow-2xl hover:shadow-blue-950/35">
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
            <span className="flex h-6 min-w-6 items-center justify-center rounded-full border border-white/30 bg-white/20 px-2 text-xs font-black text-white">
                {items.length}
            </span>
        </div>

        <div className="space-y-2 border-t border-white/20 pt-3">
            {items.length > 0 ? (
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

const EmployeeList = ({
    employees,
    goToPage,
    rows,
    search,
    selectedStation,
    selectedStationCode,
    selectedStationName,
    selectStation,
    setSearch,
    setStationSearch,
    submitSearch,
    stationSearch,
    stations,
    recentLogs = [],
    topFirstTimeIns = [],
    travelOrders = [],
}) => {
    const {
        searchBoxRef,
        showSuggestions,
        setShowSuggestions,
        suggestionMatches,
        setSuggestionMatches,
        suggestionsLoading,
    } = useSearchSuggestions({
        query: search,
        routeName: "attendance-monitoring.employees.suggestions",
        params: {
            station_code: selectedStationCode,
            station_name: selectedStationName,
        },
    });
    const page = employees?.current_page || 1;
    const pageCount = employees?.last_page || 1;
    const total = employees?.total || 0;
    const startIndex = employees?.from || 0;
    const endIndex = employees?.to || 0;

    const selectSuggestion = (suggestion) => {
        const nextValue = suggestion.name || "";

        setSearch(nextValue);
        setShowSuggestions(false);
        submitSearch(nextValue);
    };

    const clearSearch = () => {
        setSearch("");
        setSuggestionMatches([]);
        setShowSuggestions(false);
        submitSearch("");
    };

    return (
        <section className="relative z-10 mx-auto w-full max-w-[1840px] px-8 pb-7">
            <div className="relative overflow-hidden rounded-[1.6rem] border border-white/25 bg-[linear-gradient(135deg,rgba(255,255,255,0.09),rgba(120,119,255,0.15))] p-5 shadow-[0_0_28px_rgba(167,139,250,0.20),0_24px_80px_rgba(2,6,47,0.42),inset_0_1px_0_rgba(255,255,255,0.22)] ring-1 ring-violet-200/10 backdrop-blur-[2px]">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_0%,rgba(255,255,255,0.12),transparent_31%),radial-gradient(circle_at_86%_94%,rgba(167,139,250,0.16),transparent_38%)]" />
                <div className="pointer-events-none absolute -left-10 top-0 h-44 w-2/3 rounded-full bg-white/[0.05] blur-3xl" />
                <div className="pointer-events-none absolute bottom-[-5rem] left-24 h-56 w-3/4 rounded-full bg-violet-300/[0.08] blur-3xl" />
                <div className="pointer-events-none absolute -right-12 top-12 h-72 w-52 rounded-full bg-blue-300/[0.06] blur-3xl" />

                <div className="relative z-10">
                    <SchoolList
                        selectedStation={selectedStation}
                        selectStation={selectStation}
                        setStationSearch={setStationSearch}
                        stationSearch={stationSearch}
                        stations={stations}
                    />

                    <div className="grid w-full gap-5 xl:grid-cols-[minmax(0,1fr)_25%]">
                        <div className="rounded-2xl border border-white/25 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(120,119,255,0.12))] p-5 shadow-[0_0_22px_rgba(167,139,250,0.16),0_18px_48px_rgba(2,6,47,0.20),inset_0_1px_0_rgba(255,255,255,0.15)] ring-1 ring-violet-200/10 backdrop-blur-[2px]">
                            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-violet-500 text-white shadow-lg shadow-blue-950/20 ring-1 ring-white/30">
                                        <Building2 className="h-6 w-6" />
                                    </div>
                                    <h2 className="text-xl font-black text-white">
                                        {selectedStationName}
                                    </h2>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div
                                        ref={searchBoxRef}
                                        className="relative w-[340px] shrink-0"
                                    >
                                        <form
                                            onSubmit={(event) => {
                                                event.preventDefault();
                                                submitSearch(search);
                                                setShowSuggestions(false);
                                            }}
                                            className="relative"
                                        >
                                            <FloatingInput
                                                label="Employee Name"
                                                icon={Search}
                                                name="attendance_employee_search"
                                                value={search}
                                                variant="glass"
                                                onChange={(event) => {
                                                    setSearch(
                                                        event.target.value,
                                                    );
                                                    setShowSuggestions(true);
                                                }}
                                                onKeyDown={(event) => {
                                                    if (event.key === "Enter") {
                                                        event.preventDefault();
                                                        submitSearch(search);
                                                        setShowSuggestions(
                                                            false,
                                                        );
                                                    }
                                                }}
                                            />
                                            {search ? (
                                                <button
                                                    type="button"
                                                    onClick={clearSearch}
                                                    className="absolute right-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-[#141b6d] hover:text-white"
                                                    aria-label="Clear employee search"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            ) : null}
                                        </form>

                                        {showSuggestions && search.trim() ? (
                                            <div className="absolute right-0 top-full z-50 mt-2 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl">
                                                <div className="border-b bg-[#f4f6ff] px-3 py-2 text-xs font-semibold uppercase text-[#141b6d]">
                                                    Results for "{search.trim()}
                                                    "
                                                </div>

                                                <div className="max-h-72 overflow-y-auto">
                                                    {suggestionsLoading ? (
                                                        <div className="flex items-center gap-3 px-3 py-4 text-sm text-slate-500">
                                                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#eef1ff] text-[#141b6d]">
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            </span>
                                                            <div>
                                                                <div className="font-medium text-slate-700">
                                                                    Searching
                                                                    employees...
                                                                </div>
                                                                <div className="text-xs text-slate-400">
                                                                    Checking
                                                                    names and ID
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : suggestionMatches.length >
                                                      0 ? (
                                                        suggestionMatches.map(
                                                            (suggestion) => (
                                                                <button
                                                                    key={
                                                                        suggestion.id
                                                                    }
                                                                    type="button"
                                                                    onMouseDown={() =>
                                                                        selectSuggestion(
                                                                            suggestion,
                                                                        )
                                                                    }
                                                                    className="flex w-full items-start justify-between gap-3 px-3 py-2 text-left text-sm transition hover:bg-[#f4f6ff]"
                                                                >
                                                                    <div className="min-w-0">
                                                                        <div className="truncate font-medium text-slate-800">
                                                                            {
                                                                                suggestion.name
                                                                            }
                                                                        </div>
                                                                        <div className="truncate text-xs text-slate-500">
                                                                            {suggestion.position ||
                                                                                "Employee"}
                                                                        </div>
                                                                    </div>

                                                                    <span className="shrink-0 rounded-full bg-[#eef1ff] px-2 py-1 text-[11px] font-semibold text-[#141b6d]">
                                                                        Search
                                                                    </span>
                                                                </button>
                                                            ),
                                                        )
                                                    ) : (
                                                        <div className="px-3 py-4 text-sm text-slate-500">
                                                            No employee matches
                                                            found.
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
                                {rows.map((row) => (
                                    <EmployeeCard
                                        key={row.employee_id}
                                        row={row}
                                    />
                                ))}
                            </div>

                            {rows.length === 0 && (
                                <div className="py-16 text-center text-sm font-semibold text-slate-500">
                                    No attendance records found.
                                </div>
                            )}

                            <PaginationMain
                                className="mt-7"
                                currentPage={page}
                                from={total === 0 ? 0 : startIndex}
                                onPageChange={goToPage}
                                showEntryLabel={false}
                                to={endIndex}
                                total={total}
                                totalPages={pageCount}
                                variant="glass"
                            />
                        </div>

                        <div className="space-y-3">
                            <RecentLogsPanel items={recentLogs} />
                            <RankingPanel items={topFirstTimeIns} />
                            <TravelPanel items={travelOrders} />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default EmployeeList;
