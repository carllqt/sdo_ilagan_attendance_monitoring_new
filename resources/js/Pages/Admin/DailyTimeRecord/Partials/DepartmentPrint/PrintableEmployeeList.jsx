import React from "react";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { Button } from "@/Components/ui/button";
import EmployeeAvatar from "@/Components/EmployeeAvatar";
import { PrintableEmployeeSkeletonList } from "@/Components/Skeletons";
import { employeeDepartment, formatMonth } from "./utils";
import { getEmployeeName } from "@/lib/utils";

const PrintableEmployeeList = ({
    departmentsLoading,
    employeesLoading,
    employeePage,
    employeePageNumbers,
    employeePagination,
    employees,
    selectedEmployeeSignatory,
    selectedMonth,
    selectedYear,
    totalEmployeePages,
    onChangePage,
    onOpenSignatoryPopover,
}) => (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex min-w-0 items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
            <div className="min-w-0">
                <div className="text-sm font-semibold text-slate-800">
                    Employees to Print
                </div>
                <div className="text-xs text-slate-500">
                    Showing {employeePagination.from || 0} to{" "}
                    {employeePagination.to || 0} of{" "}
                    {employeePagination.total || 0}
                </div>
            </div>
            <span className="shrink-0 rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
                {formatMonth(selectedMonth)} {selectedYear}
            </span>
        </div>

        <div className="flex h-[17.3rem] flex-col">
            <div className="min-h-0 flex-1 divide-y overflow-y-auto">
                {departmentsLoading || employeesLoading ? (
                    <PrintableEmployeeSkeletonList />
                ) : employees.length ? (
                    employees.map((employee) => {
                        const employeeName = getEmployeeName(employee) || "-";
                        const signatory = selectedEmployeeSignatory(employee);

                        return (
                            <div
                                key={employee.id}
                                className="flex min-w-0 items-center justify-between gap-3 px-3 py-2.5 text-sm"
                            >
                                <div className="flex min-w-0 flex-1 items-center gap-3 overflow-hidden">
                                    <EmployeeAvatar
                                        employee={employee}
                                        name={employeeName}
                                        className="h-9 w-9 shrink-0"
                                    />
                                    <div className="min-w-0 flex-1 overflow-hidden">
                                        <div className="truncate font-medium text-slate-800">
                                            {employeeName}
                                        </div>
                                        <div className="truncate text-xs text-slate-500">
                                            {employeeDepartment(employee)} -{" "}
                                            {employee.position || "-"}
                                        </div>
                                        <div
                                            className={`truncate text-xs ${
                                                signatory?.missing
                                                    ? "text-orange-600"
                                                    : "text-blue-600"
                                            }`}
                                        >
                                            Signatory:{" "}
                                            {signatory?.name || "Loading..."}
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-7 w-[116px] shrink-0 rounded-full border-blue-200 px-2 text-xs text-blue-700 hover:bg-blue-50"
                                    onClick={(event) =>
                                        onOpenSignatoryPopover(event, employee)
                                    }
                                >
                                    Change Signatory
                                </Button>
                            </div>
                        );
                    })
                ) : (
                    <div className="py-6 text-center text-sm text-slate-500">
                        No employees selected.
                    </div>
                )}
            </div>

            <div className="flex h-12 shrink-0 items-center justify-end px-3">
                {totalEmployeePages > 1 ? (
                    <Pagination>
                        <PaginationPrevious
                            className="h-7 px-2 text-xs"
                            onClick={() => onChangePage(employeePage - 1)}
                        />
                        <PaginationContent>
                            {employeePageNumbers.map((page) => (
                                <PaginationItem key={page}>
                                    {typeof page === "number" ? (
                                        <PaginationLink
                                            className="h-7 w-7 text-xs"
                                            isActive={employeePage === page}
                                            onClick={() => onChangePage(page)}
                                        >
                                            {page}
                                        </PaginationLink>
                                    ) : (
                                        <span className="flex h-7 w-7 items-center justify-center text-xs font-medium text-slate-400">
                                            ...
                                        </span>
                                    )}
                                </PaginationItem>
                            ))}
                        </PaginationContent>
                        <PaginationNext
                            className="h-7 px-2 text-xs"
                            onClick={() => onChangePage(employeePage + 1)}
                        />
                    </Pagination>
                ) : null}
            </div>
        </div>
    </div>
);

export default PrintableEmployeeList;

