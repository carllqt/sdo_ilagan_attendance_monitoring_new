import React from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/Components/ui/button";
import {
    CustomDropdownCheckbox,
    CustomDropdownCheckboxObject,
} from "@/components/dropdown-menu-main";
import EmployeeAvatar from "@/Components/EmployeeAvatar";
import PaginationMain from "@/Components/PaginationMain";
import FloatingInput from "@/components/floating-input";
import { SuggestionSkeletonList } from "@/Components/Skeletons";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, Search } from "lucide-react";

const EmployeeList = ({
    filteredSummary,
    monthList,
    selectedYear,
    setSelectedYear,
    selectedMonth,
    setSelectedMonth,
    searchBoxRef,
    searchInput,
    setSearchInput,
    applySearch,
    selectSuggestion,
    setShowSuggestions,
    showSuggestions,
    suggestionMatches,
    suggestionsLoading,
    isLoading = false,
    years,
    offices = [],
    selectedOffice,
    setSelectedOffice,
    applyFilters,
    onDownloadPDF,
    currentPage,
    handlePageChange,
    pageNumbers,
    paginationFrom = 0,
    paginationTo = 0,
    totalPages,
    totalRecords = 0,
}) => {
    const monthOptions = ["Whole Year", ...monthList];
    const officeButtonLabel =
        offices.find((office) => Number(office.id) === Number(selectedOffice))
            ?.name || "All Offices";
    const skeletonRows = Math.max(5, Math.min(Number(totalRecords || 10), 10));

    return (
        <div className="rounded-xl">
            <div className="mb-4 flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <h2 className="text-lg font-bold text-slate-900">
                        Employee Records
                    </h2>
                    <p className="text-sm text-gray-500">
                        Monthly converted tardiness by employee
                    </p>
                </div>

                <div className="grid w-full grid-cols-1 items-center gap-4 xl:ml-auto xl:w-auto xl:grid-cols-[350px_130px_130px_150px_150px]">
                    <div ref={searchBoxRef} className="relative w-full">
                        <FloatingInput
                            label="Employee Name"
                            icon={Search}
                            name="search"
                            value={searchInput}
                            onChange={(event) => {
                                setSearchInput(event.target.value);
                                setShowSuggestions(true);
                            }}
                            onFocus={() => setShowSuggestions(true)}
                            onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                    event.preventDefault();
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
                                        <SuggestionSkeletonList count={2} />
                                    ) : suggestionMatches.length > 0 ? (
                                        suggestionMatches.map((employee) => (
                                            <button
                                                key={employee.id}
                                                type="button"
                                                onMouseDown={() =>
                                                    selectSuggestion(employee)
                                                }
                                                className="flex w-full items-start justify-between gap-3 px-3 py-2 text-left text-sm transition hover:bg-blue-50"
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

                    <CustomDropdownCheckbox
                        label="Select Month"
                        items={monthOptions}
                        selected={selectedMonth}
                        onChange={setSelectedMonth}
                        buttonVariant="outline"
                        className="h-10 border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                    />
                    <CustomDropdownCheckbox
                        label="Select Year"
                        items={years}
                        selected={selectedYear}
                        onChange={(nextYear) => {
                            setSelectedYear(nextYear);
                            applyFilters({ yearValue: nextYear });
                        }}
                        buttonVariant="outline"
                        className="h-10 border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                    />
                    <CustomDropdownCheckboxObject
                        label="Select Office"
                        items={offices}
                        selected={selectedOffice}
                        buttonLabel={officeButtonLabel}
                        onChange={(nextOffice) => {
                            const officeValue =
                                nextOffice === "all"
                                    ? "all"
                                    : Number(nextOffice);

                            setSelectedOffice(officeValue);
                            applyFilters({ officeValue });
                        }}
                        buttonVariant="outline"
                        className="h-10 border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                    />
                    <Button
                        type="button"
                        onClick={onDownloadPDF}
                        className="h-10 gap-2 whitespace-nowrap bg-blue-700 text-white hover:bg-blue-800"
                    >
                        <Download className="h-4 w-4" />
                        Print Summary
                    </Button>
                </div>
            </div>

            <div className="overflow-x-auto rounded-lg border">
                <Table className="w-full min-w-[1180px] table-fixed">
                    <TableHeader>
                        <TableRow className="bg-blue-900 hover:bg-blue-800">
                            <TableHead className="text-white text-left px-16">
                                Employee Name
                            </TableHead>
                            {monthList.map((month) => {
                                const isSelectedMonth = selectedMonth === month;

                                return (
                                    <TableHead
                                        key={month}
                                        className={`w-[86px] text-center text-white ${
                                            isSelectedMonth
                                                ? "border-b border-blue-800 bg-blue-800 text-white"
                                                : ""
                                        }`}
                                    >
                                        {month.slice(0, 3)}
                                    </TableHead>
                                );
                            })}
                            <TableHead className="w-[100px] text-center text-white">
                                Total
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: skeletonRows }).map(
                                (_, index) => (
                                    <TableRow
                                        key={`tardiness-summary-skeleton-${index}`}
                                        className="h-[64px]"
                                    >
                                        <TableCell className="bg-white p-3">
                                            <div className="flex min-w-0 items-center gap-3">
                                                <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
                                                <div className="min-w-0 flex-1 space-y-2">
                                                    <Skeleton className="h-4 w-52 max-w-full" />
                                                    <Skeleton className="h-3 w-36 max-w-full" />
                                                </div>
                                            </div>
                                        </TableCell>

                                        {monthList.map((month) => (
                                            <TableCell
                                                key={`skeleton-${month}`}
                                                className="p-3"
                                            >
                                                <Skeleton className="mx-auto h-4 w-10" />
                                            </TableCell>
                                        ))}

                                        <TableCell className="p-3">
                                            <Skeleton className="mx-auto h-4 w-14" />
                                        </TableCell>
                                    </TableRow>
                                ),
                            )
                        ) : filteredSummary.length > 0 ? (
                            filteredSummary.map((data, index) => {
                                const employee = data.employee || {};

                                return (
                                    <TableRow
                                        key={employee.id || index}
                                        className="group h-[64px] transition hover:bg-blue-50"
                                    >
                                        <TableCell className="bg-white p-3 transition group-hover:bg-blue-50">
                                            <div className="flex min-w-0 items-center gap-3">
                                                <EmployeeAvatar
                                                    employee={employee}
                                                    name={employee.full_name}
                                                    className="h-9 w-9"
                                                />

                                                <div className="min-w-0">
                                                    <div className="truncate font-medium">
                                                        {employee.full_name ||
                                                            "-"}
                                                    </div>
                                                    <div className="truncate text-xs text-gray-500">
                                                        {employee.office
                                                            ?.name || "-"}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>

                                        {monthList.map((month, i) => {
                                            const val = Number(
                                                data.tardyPerMonths[
                                                    selectedYear
                                                ]?.[i + 1] || 0,
                                            );
                                            const isSelectedMonth =
                                                selectedMonth === month;

                                            return (
                                                <TableCell
                                                    key={month}
                                                    className={`p-3 text-center text-sm text-gray-700 transition ${
                                                        isSelectedMonth
                                                            ? "border-b border-blue-800 bg-blue-800 text-white group-hover:bg-blue-800"
                                                            : ""
                                                    }`}
                                                >
                                                    <span
                                                        className={
                                                            isSelectedMonth
                                                                ? "font-bold text-white"
                                                                : val > 0
                                                                  ? "font-medium text-gray-800"
                                                                  : "text-gray-400"
                                                        }
                                                    >
                                                        {val > 0
                                                            ? val.toFixed(2)
                                                            : "0"}
                                                    </span>
                                                </TableCell>
                                            );
                                        })}

                                        <TableCell className="p-3 text-center">
                                            <span className="text-sm font-semibold text-gray-900">
                                                {Number(
                                                    data.tardyPerYear[
                                                        selectedYear
                                                    ] || 0,
                                                ).toFixed(2)}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={14}
                                    className="py-8 text-center text-gray-500"
                                >
                                    No tardiness summary records found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <PaginationMain
                currentPage={currentPage}
                from={paginationFrom}
                onPageChange={handlePageChange}
                pageNumbers={pageNumbers}
                to={paginationTo}
                total={totalRecords}
                totalPages={totalPages}
            />
        </div>
    );
};

export default EmployeeList;
