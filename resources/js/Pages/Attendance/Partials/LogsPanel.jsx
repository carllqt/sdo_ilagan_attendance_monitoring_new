import React from "react";
import { Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FloatingInput from "@/components/floating-input";
import EmployeeAvatar from "@/Components/EmployeeAvatar";
import { AttendanceTable } from "./AttendanceTable";
import AttendanceSuggestionSkeletonList from "./AttendanceSuggestionSkeletonList";

const LogsPanel = ({
    activeTab,
    dailyAttendance,
    filterLoading,
    handleSearchChange,
    handleSessionChange,
    hasOpenSuggestions,
    search,
    searchBoxRef,
    selectSuggestion,
    setShowSuggestions,
    suggestionMatches,
    suggestionsLoading,
    totalAttendanceRecords,
}) => (
    <section className="relative flex min-h-[36rem] flex-col overflow-hidden rounded-[1.35rem] border border-blue-400/25 bg-[#071158] p-5 shadow-[0_18px_56px_rgba(2,6,47,0.30)] xl:h-full xl:min-h-0">
        <div className="relative z-10 flex min-h-0 flex-1 flex-col">
            <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-lg font-black text-white">
                        Today&apos;s Logs
                    </h2>
                    <p className="text-sm font-semibold text-blue-100">
                        Latest biometric entries for the day.
                    </p>
                </div>
                <div className="rounded-full border border-blue-300/30 bg-blue-950/55 px-3 py-1 text-sm font-bold text-white shadow-sm">
                    {totalAttendanceRecords} records
                </div>
            </div>

            <div className="relative mb-4" ref={searchBoxRef}>
                <FloatingInput
                    label="Employee Name"
                    icon={Search}
                    name="attendance_search"
                    value={search}
                    variant="glass"
                    disabled={filterLoading}
                    onChange={handleSearchChange}
                    onFocus={() => setShowSuggestions(true)}
                    onKeyDown={(event) => {
                        if (event.key === "Enter") {
                            event.preventDefault();
                            setShowSuggestions(true);
                        }
                    }}
                />

                {hasOpenSuggestions ? (
                    <div className="absolute right-0 top-full z-50 mt-2 w-full overflow-hidden rounded-xl border border-cyan-200/45 bg-[#071158] shadow-[0_24px_70px_rgba(2,6,47,0.65)] ring-1 ring-white/10">
                        <div className="border-b border-blue-300/20 bg-blue-950/55 px-3 py-2 text-xs font-bold uppercase tracking-wide text-blue-100">
                            Results for "{search.trim()}"
                        </div>

                        <div>
                            {suggestionsLoading ? (
                                <AttendanceSuggestionSkeletonList />
                            ) : suggestionMatches.length > 0 ? (
                                suggestionMatches.map((employee) => (
                                    <button
                                        key={employee.id}
                                        type="button"
                                        onMouseDown={() =>
                                            selectSuggestion(employee)
                                        }
                                        className="flex w-full items-start justify-between gap-3 px-3 py-2 text-left text-sm text-white transition hover:bg-blue-900/60"
                                    >
                                        <div className="flex min-w-0 items-center gap-3">
                                            <EmployeeAvatar
                                                employee={employee}
                                                name={employee.label}
                                                className="h-9 w-9"
                                            />
                                            <div className="min-w-0">
                                                <div className="truncate font-medium text-white">
                                                    {employee.label}
                                                </div>
                                                <div className="truncate text-xs text-blue-100">
                                                    {employee.meta ||
                                                        "Employee"}
                                                </div>
                                            </div>
                                        </div>

                                        <span className="shrink-0 rounded-full bg-blue-800/70 px-2 py-1 text-[11px] font-bold text-blue-50">
                                            Search
                                        </span>
                                    </button>
                                ))
                            ) : (
                                <div className="px-3 py-4 text-sm text-blue-100">
                                    No employee matches found.
                                </div>
                            )}
                        </div>
                    </div>
                ) : null}
            </div>

            <div
                className={`min-h-0 flex-1 transition duration-200 ${
                    hasOpenSuggestions
                        ? "pointer-events-none blur-[2px] opacity-45"
                        : ""
                }`}
            >
                <Tabs
                    value={activeTab}
                    onValueChange={handleSessionChange}
                    className="flex h-full min-h-0 flex-col"
                >
                    <TabsList className="mb-4 grid w-full grid-cols-2 rounded-xl border border-blue-300/25 bg-blue-950/45 p-1">
                        <TabsTrigger
                            value="AM"
                            className="rounded-lg text-white/80 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                        >
                            AM Logs
                        </TabsTrigger>
                        <TabsTrigger
                            value="PM"
                            className="rounded-lg text-white/80 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                        >
                            PM Logs
                        </TabsTrigger>
                    </TabsList>

                    {["AM", "PM"].map((session) => (
                        <TabsContent
                            key={session}
                            value={session}
                            className="min-h-0 flex-1"
                        >
                            <AttendanceTable
                                dailyAttendance={dailyAttendance}
                                session={session}
                                isLoading={filterLoading}
                            />
                        </TabsContent>
                    ))}
                </Tabs>
            </div>
        </div>
    </section>
);

export default LogsPanel;
