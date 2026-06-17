import React from "react";
import {
    CustomDropdownCheckbox,
    CustomDropdownCheckboxObject,
} from "@/components/dropdown-menu-main";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { AlertTriangle, SquarePen, Search, Clock3 } from "lucide-react";
import FloatingInput from "@/components/floating-input";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";
import { BadgeCheckIcon, Building2 } from "lucide-react";

import EmployeeAvatar from "@/Components/EmployeeAvatar";
import PaginationMain from "@/Components/PaginationMain";
import { SuggestionSkeletonList } from "@/Components/Skeletons";
import { Skeleton } from "@/components/ui/skeleton";
import useEmployeeListControls, {
    formatWorkSchedule,
} from "../hooks/useEmployeeListControls";
import { getEmployeeName } from "@/lib/utils";

const EmployeeList = ({
    employees = [],
    filteredEmployees = [],
    pagination,
    isLoading = false,
    isRegistered,
    handleEdit,
    searchInput,
    setSearchInput,
    applySearch,
    offices = [],
    isSchoolAdmin = false,
    selectedOffice,
    setSelectedOffice,
    statusOptions,
    statusFilter,
    setStatusFilter,
    applyFilters,
}) => {
    const paginatedEmployees = filteredEmployees;
    const skeletonRows = Math.max(
        5,
        Math.min(Number(pagination?.per_page || 10), 10),
    );
    const {
        currentPage,
        handlePageChange,
        officeItems,
        pageNumbers,
        searchBoxRef,
        selectSuggestion,
        setShowSuggestions,
        showSuggestions,
        suggestionMatches,
        suggestionsLoading,
        totalPages,
    } = useEmployeeListControls({
        applyFilters,
        offices,
        pagination,
        searchInput,
        setSearchInput,
    });

    return (
        <div className="rounded-2xl p-4 mt-4 border border-blue-100 shadow-lg">
            <div className="rounded-xl">
                <div className="flex items-center justify-between mb-4 gap-4">
                    <div className="min-w-0">
                        <h2 className="text-l font-bold">Employee List</h2>
                        <p className="text-sm text-gray-500">
                            Manage employee records
                        </p>
                    </div>

                    {/* RIGHT SIDE */}
                    <div className="flex items-start gap-4 ">
                        <div
                            ref={searchBoxRef}
                            className={`relative w-full ${
                                isSchoolAdmin ? "min-w-[360px]" : ""
                            }`}
                        >
                            <FloatingInput
                                label="Employee Name"
                                icon={Search}
                                name="search"
                                value={searchInput}
                                onChange={(e) => {
                                    setSearchInput(e.target.value);
                                    setShowSuggestions(true);
                                }}
                                onFocus={() => setShowSuggestions(true)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        applySearch(searchInput);
                                        setShowSuggestions(false);
                                    }
                                }}
                            />

                            {showSuggestions && searchInput.trim() ? (
                                <div className="absolute right-0 top-full z-50 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
                                    <div className="border-b bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Results for "{searchInput.trim()}"
                                    </div>

                                    <div className="max-h-72 overflow-y-auto">
                                        {suggestionsLoading ? (
                                            <SuggestionSkeletonList />
                                        ) : suggestionMatches.length > 0 ? (
                                            suggestionMatches.map((emp) => (
                                                <button
                                                    key={emp.id}
                                                    type="button"
                                                    onMouseDown={() =>
                                                        selectSuggestion(
                                                            emp,
                                                            applySearch,
                                                        )
                                                    }
                                                    className="flex w-full items-start justify-between gap-3 px-3 py-2 text-left text-sm transition hover:bg-blue-50"
                                                >
                                                    <div className="min-w-0">
                                                        <div className="truncate font-medium text-slate-800">
                                                            {emp.label}
                                                        </div>
                                                        <div className="truncate text-xs text-slate-500">
                                                            {emp.meta}
                                                        </div>
                                                    </div>

                                                    <span className="shrink-0 rounded-full bg-blue-100 px-2 py-1 text-[11px] font-semibold text-blue-700">
                                                        Search
                                                    </span>
                                                </button>
                                            ))
                                        ) : (
                                            <div className="px-3 py-4 text-sm text-slate-500">
                                                No employee matches found.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : null}
                        </div>

                        <CustomDropdownCheckbox
                            label="Select Status"
                            items={statusOptions}
                            selected={statusFilter}
                            onChange={(val) => {
                                setStatusFilter(val);
                                applyFilters({ statusValue: val });
                            }}
                            buttonVariant="outline"
                            className="h-10 w-32 border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                        />

                        {!isSchoolAdmin && (
                            <CustomDropdownCheckboxObject
                                label="Select Office"
                                items={officeItems}
                                selected={selectedOffice}
                                buttonLabel={
                                    offices.find(
                                        (office) =>
                                            Number(office.id) ===
                                            Number(selectedOffice),
                                    )?.name || "All Offices"
                                }
                                onChange={(val) => {
                                    const nextOffice =
                                        val === "all" ? "all" : Number(val);

                                    setSelectedOffice(nextOffice);
                                    applyFilters({ officeValue: nextOffice });
                                }}
                                buttonVariant="outline"
                                className="h-10 w-[360px] border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                            />
                        )}
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto border rounded-lg">
                <Table className="w-full table-fixed">
                    <TableHeader>
                        <TableRow className="bg-blue-900 hover:bg-blue-800">
                            <TableHead className="text-white text-left px-16 w-[25%]">
                                Employee Name
                            </TableHead>
                            <TableHead className="text-white text-left w-[20%]">
                                Position
                            </TableHead>
                            <TableHead className="text-white text-left w-[25%]">
                                {isSchoolAdmin ? "School" : "Section / Unit"}
                            </TableHead>
                            <TableHead className="text-white text-left w-[15%]">
                                Work Schedule
                            </TableHead>
                            <TableHead className="text-white text-left px-10 w-[10%]">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: skeletonRows }).map(
                                (_, index) => (
                                    <TableRow
                                        key={`employee-management-skeleton-${index}`}
                                        className="h-[64px]"
                                    >
                                        <TableCell className="p-3">
                                            <div className="flex min-w-0 gap-3">
                                                <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
                                                <div className="flex min-w-0 flex-1 items-center gap-2">
                                                    <Skeleton className="h-4 w-48 max-w-full" />
                                                    <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
                                                </div>
                                            </div>
                                        </TableCell>

                                        <TableCell className="p-3">
                                            <Skeleton className="h-4 w-40 max-w-full" />
                                        </TableCell>

                                        <TableCell className="p-3">
                                            <div className="flex min-w-0 items-center gap-2">
                                                <Skeleton className="h-7 w-7 shrink-0 rounded-full" />
                                                <div className="min-w-0 flex-1 space-y-2">
                                                    <Skeleton className="h-4 w-44 max-w-full" />
                                                    <Skeleton className="h-3 w-36 max-w-full" />
                                                </div>
                                            </div>
                                        </TableCell>

                                        <TableCell className="p-3">
                                            <div className="flex min-w-0 items-center gap-2">
                                                <Skeleton className="h-5 w-5 shrink-0 rounded-full" />
                                                <div className="min-w-0 flex-1 space-y-2">
                                                    <Skeleton className="h-4 w-32 max-w-full" />
                                                    <Skeleton className="h-3 w-28 max-w-full" />
                                                </div>
                                            </div>
                                        </TableCell>

                                        <TableCell className="p-3">
                                            <div className="flex justify-center">
                                                <Skeleton className="h-8 w-[90px] rounded-md" />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ),
                            )
                        ) : paginatedEmployees.length > 0 ? (
                            paginatedEmployees.map((emp) => {
                                const hasWorkSchedule = Boolean(
                                    emp.work_schedule,
                                );

                                return (
                                    <TableRow
                                        key={emp.id}
                                        className="h-[64px] hover:bg-blue-50 transition"
                                    >
                                        <TableCell className="p-3">
                                            <div className="flex gap-3 min-w-0">
                                                {/* Avatar */}
                                                <EmployeeAvatar
                                                    employee={emp}
                                                    name={getEmployeeName(emp)}
                                                />

                                                {/* Name + badge */}
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <span className="font-medium truncate max-w-[230px]">
                                                        {getEmployeeName(emp)}
                                                    </span>

                                                    <HoverCard openDelay={150}>
                                                        <HoverCardTrigger
                                                            asChild
                                                        >
                                                            <div className="cursor-pointer min-w-[28px] flex justify-center">
                                                                {isRegistered(
                                                                    emp.id,
                                                                ) ? (
                                                                    <Badge className="bg-blue-100 text-blue-700 border border-blue-300 flex items-center gap-1">
                                                                        <BadgeCheckIcon className="w-3.5 h-3.5" />
                                                                    </Badge>
                                                                ) : (
                                                                    <span
                                                                        aria-label="Employee is not registered"
                                                                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-amber-300 bg-amber-100 text-amber-700 shadow-[0_0_10px_rgba(245,158,11,0.45)]"
                                                                    >
                                                                        <AlertTriangle className="h-4 w-4 animate-bell-ring" />
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </HoverCardTrigger>

                                                        <HoverCardContent
                                                            side="right"
                                                            align="center"
                                                            className="w-fit rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700 shadow-md"
                                                        >
                                                            {isRegistered(
                                                                emp.id,
                                                            ) ? (
                                                                <span className="font-medium text-blue-600">
                                                                    Employee is
                                                                    registered
                                                                </span>
                                                            ) : (
                                                                <span className="font-medium text-orange-600">
                                                                    Employee is
                                                                    not
                                                                    registered
                                                                </span>
                                                            )}
                                                        </HoverCardContent>
                                                    </HoverCard>
                                                </div>
                                            </div>
                                        </TableCell>

                                        {/* POSITION */}
                                        <TableCell className="p-3 text-gray-700 truncate">
                                            {emp.position || "-"}
                                        </TableCell>

                                        {/* OFFICE / SCHOOL */}
                                        <TableCell className="p-3">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <div className="w-7 h-7 min-w-[28px] flex items-center justify-center rounded-full bg-gray-300">
                                                    <Building2 className="w-4 h-4 text-blue-600" />
                                                </div>

                                                <span className="truncate">
                                                    <span className="block truncate">
                                                        {isSchoolAdmin
                                                            ? emp.station
                                                                  ?.name || "-"
                                                            : emp.office
                                                                  ?.name || "-"}
                                                    </span>
                                                    <span className="block truncate text-xs text-gray-500">
                                                        {isSchoolAdmin
                                                            ? "Station"
                                                            : [
                                                                  emp.office
                                                                      ?.division
                                                                      ?.code,
                                                                  emp.office
                                                                      ?.division
                                                                      ?.name,
                                                              ]
                                                                  .filter(
                                                                      Boolean,
                                                                  )
                                                                  .join(
                                                                      " - ",
                                                                  ) || "-"}
                                                    </span>
                                                </span>
                                            </div>
                                        </TableCell>

                                        {/* WORK SCHEDULE */}
                                        <TableCell className="p-3">
                                            <div className="flex items-center gap-2 min-w-0">
                                                {hasWorkSchedule ? (
                                                    <Clock3 className="h-5 w-5 shrink-0 text-blue-600 mt-0.5" />
                                                ) : null}

                                                <div className="min-w-0">
                                                    {hasWorkSchedule ? (
                                                        <div className="truncate font-medium text-gray-800">
                                                            {emp.work_type ||
                                                                "-"}
                                                        </div>
                                                    ) : (
                                                        <div className="w-fit rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                                                            Missing work
                                                            schedule
                                                        </div>
                                                    )}

                                                    {hasWorkSchedule ? (
                                                        <div className="truncate text-xs text-gray-500">
                                                            {formatWorkSchedule(
                                                                emp.work_schedule,
                                                            ) || "-"}
                                                        </div>
                                                    ) : null}
                                                </div>
                                            </div>
                                        </TableCell>
                                        {/* ACTIONS */}
                                        <TableCell className="p-3 text-center">
                                            <Button
                                                size="sm"
                                                className="min-w-[90px] bg-white text-blue-600 border border-blue-600 hover:bg-blue-600 hover:text-white flex items-center justify-center gap-1"
                                                onClick={() => handleEdit(emp)}
                                                title="Edit Employee"
                                            >
                                                <SquarePen className="h-4 w-4" />
                                                Edit
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan="5"
                                    className="text-center p-5 text-gray-500"
                                >
                                    No Employees Found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <PaginationMain
                currentPage={currentPage}
                onPageChange={handlePageChange}
                pageNumbers={pageNumbers}
                pagination={pagination}
                totalPages={totalPages}
            />
        </div>
    );
};

export default EmployeeList;
