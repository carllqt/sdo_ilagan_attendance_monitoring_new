import React from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    CustomDropdownCheckbox,
    CustomDropdownCheckboxObject,
} from "@/components/dropdown-menu-main";
import EmployeeAvatar from "@/Components/EmployeeAvatar";
import { getEmployeeName } from "@/lib/utils";
import { Button } from "@/Components/ui/button";
import PaginationMain from "@/Components/PaginationMain";
import ConfirmPasswordDialog from "@/Components/ConfirmPasswordDialog";
import { Skeleton } from "@/components/ui/skeleton";
import FloatingInput from "@/components/floating-input";
import { SuggestionSkeletonList } from "@/Components/Skeletons";
import { CalendarDays, Search } from "lucide-react";

const EmployeeList = ({
    groupedByEmployee = [],
    monthRangeLabel,
    searchBoxRef,
    searchInput = "",
    setSearchInput,
    applySearch,
    selectSuggestion,
    setShowSuggestions,
    showSuggestions = false,
    suggestionMatches = [],
    suggestionsLoading = false,
    offices = [],
    selectedOffice,
    setSelectedOffice,
    monthList = [],
    selectedFirstMonth,
    setSelectedFirstMonth,
    selectedSecondMonth,
    setSelectedSecondMonth,
    secondMonthList = [],
    onSaveSuccess,
    summaryPayload = [],
    isLoading = false,
    pagination,
    onPageChange,
}) => {
    const officeButtonLabel =
        offices.find((office) => String(office.id) === String(selectedOffice))
            ?.name || "All Offices";
    const skeletonRows = Math.max(
        5,
        Math.min(Number(pagination?.per_page || 10), 10),
    );
    const convertCount =
        Number(pagination?.total || 0) ||
        summaryPayload.length ||
        groupedByEmployee.length;
    const clearSearch = () => {
        if (isLoading) return;

        setSearchInput("");
        setShowSuggestions(false);
        applySearch("");
    };

    return (
        <div className="rounded-2xl border border-blue-100 bg-white p-4 shadow-[0_12px_32px_rgba(15,23,42,0.08)]">
            <div className="mb-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                    <h2 className="text-l font-bold text-slate-900">
                        Employee List
                    </h2>
                    <p className="text-sm text-gray-500">
                        Convert tardiness summary records
                    </p>
                </div>

                <div className="flex items-start gap-4 xl:ml-auto">
                    <div
                        ref={searchBoxRef}
                        className="relative w-[340px] shrink-0"
                    >
                        <FloatingInput
                            label="Employee Name"
                            icon={Search}
                            name="search"
                            value={searchInput}
                            clearable
                            onClear={clearSearch}
                            clearAriaLabel="Clear employee search"
                            onChange={(event) => {
                                if (isLoading) return;

                                setSearchInput(event.target.value);
                                setShowSuggestions(true);
                            }}
                            onFocus={() => {
                                if (!isLoading) setShowSuggestions(true);
                            }}
                            onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                    event.preventDefault();
                                    if (isLoading) return;

                                    applySearch(searchInput);
                                    setShowSuggestions(false);
                                }
                            }}
                            disabled={isLoading}
                        />

                        {showSuggestions && searchInput.trim() && !isLoading ? (
                            <div className="absolute right-0 top-full z-50 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
                                <div className="border-b bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Results for "{searchInput.trim()}"
                                </div>
                                <div className="max-h-72 overflow-y-auto">
                                    {suggestionsLoading ? (
                                        <SuggestionSkeletonList count={2} />
                                    ) : suggestionMatches.length > 0 ? (
                                        suggestionMatches.map((employee) => (
                                            <button
                                                key={employee.id}
                                                type="button"
                                                disabled={isLoading}
                                                onMouseDown={() => {
                                                    if (isLoading) return;

                                                    selectSuggestion(employee);
                                                }}
                                                className="flex w-full items-start justify-between gap-3 px-3 py-2 text-left text-sm transition hover:bg-blue-50 disabled:pointer-events-none disabled:opacity-60"
                                            >
                                                <div className="min-w-0">
                                                    <div className="truncate font-medium text-slate-800">
                                                        {employee.label}
                                                    </div>
                                                    <div className="truncate text-xs text-slate-500">
                                                        {employee.meta}
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

                    <span className="flex h-10 shrink-0 items-center text-sm font-semibold">
                        Date Range:
                    </span>

                    <CustomDropdownCheckbox
                        label="Start Month"
                        items={monthList}
                        selected={selectedFirstMonth}
                        onChange={setSelectedFirstMonth}
                        disabled={isLoading}
                        buttonVariant="outline"
                        className="h-10 w-[130px] min-w-0 truncate border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    />
                    <span className="flex h-10 shrink-0 items-center text-center text-sm font-semibold text-gray-500">
                        -
                    </span>
                    <CustomDropdownCheckbox
                        label="End Month"
                        items={secondMonthList}
                        selected={selectedSecondMonth}
                        onChange={setSelectedSecondMonth}
                        disabled={isLoading}
                        buttonVariant="outline"
                        className="h-10 w-[130px] min-w-0 truncate border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    />
                    <CustomDropdownCheckboxObject
                        label="Office"
                        items={offices}
                        selected={selectedOffice}
                        buttonLabel={officeButtonLabel}
                        onChange={setSelectedOffice}
                        disabled={isLoading}
                        buttonVariant="outline"
                        className="h-10 w-[180px] shrink-0 border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    />
                    <ConfirmPasswordDialog
                        trigger={
                            <Button
                                variant="green"
                                className="relative h-10 shrink-0 bg-emerald-600 shadow-sm hover:bg-emerald-700"
                                disabled={isLoading || convertCount === 0}
                            >
                                Convert & Save
                                {convertCount > 0 ? (
                                    <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full border-2 border-white bg-blue-600 px-1.5 text-xs font-bold leading-none text-white shadow">
                                        {convertCount}
                                    </span>
                                ) : null}
                            </Button>
                        }
                        title="Confirm Summary Save"
                        description="Please confirm your password before saving all tardiness summaries."
                        action={route("tardiness-conversion.store")}
                        method="post"
                        data={{ summaries: summaryPayload }}
                        danger={false}
                        itemLabel="Summary Period"
                        itemName={monthRangeLabel || "Selected month range"}
                        confirmText="Save Summaries"
                        processingText="Saving..."
                        note={`${convertCount} filtered tardiness summaries will be saved immediately after password confirmation.`}
                        onSuccess={onSaveSuccess}
                        onError={() => {}}
                    />
                </div>
            </div>

            <div className="overflow-x-auto rounded-lg border">
                <Table className="w-full min-w-[1180px] table-fixed">
                    <TableHeader>
                        <TableRow className="bg-blue-900 hover:bg-blue-800">
                            <TableHead className="w-[30%] px-16 text-left text-white">
                                Employee Name
                            </TableHead>
                            <TableHead className="w-[15%] text-left text-white">
                                Month
                            </TableHead>
                            <TableHead className="w-[15%] text-center text-white">
                                Total Tardiness
                            </TableHead>
                            <TableHead className="w-[15%] text-center text-white">
                                Equiv Day in Hours
                            </TableHead>
                            <TableHead className="w-[15%] text-center text-white">
                                Equiv Day in Minutes
                            </TableHead>
                            <TableHead className="w-[10%] px-10 text-center text-white">
                                Total
                            </TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: skeletonRows }).map(
                                (_, index) => (
                                    <TableRow
                                        key={`employee-summary-skeleton-${index}`}
                                        className="h-[64px]"
                                    >
                                        <TableCell className="p-3">
                                            <div className="flex min-w-0 items-center gap-3">
                                                <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
                                                <div className="min-w-0 flex-1 space-y-2">
                                                    <Skeleton className="h-4 w-52 max-w-full" />
                                                    <Skeleton className="h-3 w-36 max-w-full" />
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="p-3">
                                            <Skeleton className="h-4 w-28" />
                                        </TableCell>
                                        <TableCell className="p-3">
                                            <Skeleton className="mx-auto h-4 w-16" />
                                        </TableCell>
                                        <TableCell className="p-3">
                                            <Skeleton className="mx-auto h-4 w-16" />
                                        </TableCell>
                                        <TableCell className="p-3">
                                            <Skeleton className="mx-auto h-4 w-16" />
                                        </TableCell>
                                        <TableCell className="p-3">
                                            <Skeleton className="mx-auto h-4 w-14" />
                                        </TableCell>
                                    </TableRow>
                                ),
                            )
                        ) : groupedByEmployee.length > 0 ? (
                            <>
                                {groupedByEmployee.map((record, idx) => {
                                const employeeName = getEmployeeName(record);

                                return (
                                    <TableRow
                                        key={`${record.employee_id || employeeName}-${idx}`}
                                        className="h-[64px] transition hover:bg-blue-50"
                                    >
                                        <TableCell className="p-3">
                                            <div className="flex min-w-0 items-center gap-3">
                                                <EmployeeAvatar
                                                    employee={record}
                                                    name={employeeName}
                                                />
                                                <div className="min-w-0">
                                                    <div className="truncate font-medium">
                                                        {employeeName || "-"}
                                                    </div>
                                                    <div className="truncate text-xs text-gray-500">
                                                        {record.office || "-"}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>

                                        <TableCell className="p-3 text-gray-700">
                                            <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                                                <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                                                <span className="truncate">
                                                    {record.month_label ||
                                                        monthRangeLabel ||
                                                        "-"}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="p-3 text-center text-gray-700">
                                            {Number(
                                                record.total_tardy || 0,
                                            ).toFixed(2)}
                                        </TableCell>
                                        <TableCell className="p-3 text-center text-gray-700">
                                            {Number(
                                                record.equi_hours || 0,
                                            ).toFixed(3)}
                                        </TableCell>
                                        <TableCell className="p-3 text-center text-gray-700">
                                            {Number(
                                                record.equi_mins || 0,
                                            ).toFixed(3)}
                                        </TableCell>
                                        <TableCell className="p-3 text-center">
                                            <span className="font-medium text-gray-900">
                                                {Number(
                                                    record.total_equi || 0,
                                                ).toFixed(3)}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                );
                                })}
                            </>
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan="6"
                                    className="p-5 text-center text-gray-500"
                                >
                                    No tardiness summary records found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <PaginationMain
                currentPage={pagination?.current_page || 1}
                onPageChange={onPageChange}
                pagination={pagination}
                totalPages={pagination?.last_page || 1}
                disabled={isLoading}
            />
        </div>
    );
};

export default EmployeeList;
