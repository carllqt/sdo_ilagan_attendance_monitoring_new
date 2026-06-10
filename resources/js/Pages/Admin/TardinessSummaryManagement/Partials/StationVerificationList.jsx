import React from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { CustomDropdownCheckboxObject } from "@/components/dropdown-menu-main";
import EmployeeAvatar from "@/Components/EmployeeAvatar";
import PaginationMain from "@/Components/PaginationMain";
import { Skeleton } from "@/components/ui/skeleton";

const StationVerificationList = ({
    currentPage,
    employees = [],
    handlePageChange,
    isLoading = false,
    monthList = [],
    onStationChange,
    pageNumbers = [],
    paginationFrom = 0,
    paginationTo = 0,
    selectedStationId,
    selectedYear,
    stations = [],
    totalRecords = 0,
    totalPages,
}) => {
    const stationItems = stations.map((station) => ({
        ...station,
        division: station.code ? { name: station.code } : null,
    }));
    const selectedStation =
        stationItems.find(
            (station) => Number(station.id) === Number(selectedStationId),
        ) || stationItems[0];
    const skeletonRows = Math.max(5, Math.min(Number(totalRecords || 10), 10));

    return (
        <div className="rounded-xl">
            <div className="mb-4 flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <h2 className="text-lg font-bold text-slate-900">
                        School Tardiness Summary Verification
                    </h2>
                    <p className="text-sm text-gray-500">
                        Employees included in the selected school
                    </p>
                </div>

                <CustomDropdownCheckboxObject
                    label="Select Station"
                    items={stationItems}
                    selected={selectedStationId}
                    buttonLabel={selectedStation?.name || "Select Station"}
                    onChange={onStationChange}
                    buttonVariant="outline"
                    className="h-10 w-[320px] border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                />
            </div>

            <div className="overflow-x-auto rounded-lg border">
                <Table className="w-full min-w-[1180px] table-fixed">
                    <TableHeader>
                        <TableRow className="bg-blue-900 hover:bg-blue-800">
                            <TableHead className="px-16 text-left text-white">
                                Employee Name
                            </TableHead>
                            {monthList.map((month) => (
                                <TableHead
                                    key={month}
                                    className="w-[86px] text-center text-white"
                                >
                                    {month.slice(0, 3)}
                                </TableHead>
                            ))}
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
                                        key={`station-verification-skeleton-${index}`}
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
                        ) : employees.length > 0 ? (
                            employees.map((data, index) => {
                                const employee = data.employee || {};

                                return (
                                    <TableRow
                                        key={employee.id || index}
                                        className="h-[64px] transition hover:bg-blue-50"
                                    >
                                        <TableCell className="p-3">
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
                                                        {employee.station
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

                                            return (
                                                <TableCell
                                                    key={month}
                                                    className="p-3 text-center text-sm text-gray-700"
                                                >
                                                    <span
                                                        className={
                                                            val > 0
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
                                    className="p-5 text-center text-gray-500"
                                >
                                    No employees found for this station.
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

export default StationVerificationList;
