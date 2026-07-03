import React, { useEffect, useMemo, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import EmployeeAvatar from "@/Components/EmployeeAvatar";
import PaginationMain from "@/Components/PaginationMain";
import { Skeleton } from "@/components/ui/skeleton";

export const AttendanceTable = ({
    dailyAttendance,
    session,
    search,
    pagination,
    onPageChange,
    isLoading = false,
}) => {
    const [currentPage, setCurrentPage] = useState(1);
    const hasServerPagination = Boolean(pagination?.current_page);
    const pageSize = Number(pagination?.per_page || pagination?.limit || 6);
    const itemsPerPage =
        Number.isFinite(pageSize) && pageSize > 0 ? pageSize : 6;

    const formatTime12Hour = (timeStr) => {
        if (!timeStr) return "-";

        const [hours = 0, minutes = 0, seconds = 0] = String(timeStr)
            .split(":")
            .map(Number);
        const ampm = hours >= 12 ? "PM" : "AM";
        const hours12 = hours % 12 || 12;

        return `${hours12}:${String(minutes).padStart(2, "0")}:${String(
            seconds,
        ).padStart(2, "0")} ${ampm}`;
    };

    const sortedAttendance = useMemo(() => {
        const query = String(search || "").toLowerCase();

        return [...dailyAttendance]
            .filter((attendance) =>
                [
                    attendance.employee?.first_name,
                    attendance.employee?.middle_name,
                    attendance.employee?.last_name,
                    attendance.employee?.office?.name,
                    attendance.employee?.office,
                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase()
                    .includes(query),
            )
            .sort((a, b) => {
                const getLatestTime = (record) => {
                    const log = session === "AM" ? record.am : record.pm;

                    return (
                        log?.[`${session.toLowerCase()}_time_out`] ??
                        log?.[`${session.toLowerCase()}_time_in`] ??
                        "00:00:00"
                    );
                };

                return (
                    new Date(`1970-01-01T${getLatestTime(b)}`) -
                    new Date(`1970-01-01T${getLatestTime(a)}`)
                );
            });
    }, [dailyAttendance, search, session]);

    const totalPages = Math.max(
        Math.ceil(sortedAttendance.length / itemsPerPage),
        1,
    );
    const paginatedAttendance = hasServerPagination
        ? sortedAttendance.slice(0, itemsPerPage)
        : sortedAttendance.slice(
              (currentPage - 1) * itemsPerPage,
              currentPage * itemsPerPage,
          );
    const paginationData = hasServerPagination
        ? pagination
        : {
              current_page: currentPage,
              last_page: totalPages,
              from: sortedAttendance.length
                  ? (currentPage - 1) * itemsPerPage + 1
                  : 0,
              to: Math.min(currentPage * itemsPerPage, sortedAttendance.length),
              total: sortedAttendance.length,
          };

    useEffect(() => {
        if (!hasServerPagination) {
            setCurrentPage(1);
        }
    }, [search, dailyAttendance, session, hasServerPagination]);

    const skeletonRows = Array.from({ length: itemsPerPage });

    return (
        <div className="flex h-full min-h-0 flex-col">
            <div className="min-h-0 flex-1 overflow-hidden rounded-xl border border-white/25 bg-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur">
                <div className="h-full overflow-y-auto">
                    <Table className="w-full table-fixed">
                        <TableHeader>
                            <TableRow className="border-white/20 bg-white/15 hover:bg-white/20">
                                <TableHead className="w-[44%] px-4 text-left text-white">
                                    Employee
                                </TableHead>
                                <TableHead className="w-[28%] text-center text-white">
                                    Time In
                                </TableHead>
                                <TableHead className="w-[28%] text-center text-white">
                                    Time Out
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <>
                                    {skeletonRows.map((_, index) => (
                                        <TableRow
                                            key={`attendance-skeleton-${index}`}
                                            className="h-[64px] border-white/10"
                                        >
                                            <TableCell className="px-4 py-3">
                                                <div className="flex min-w-0 items-center gap-3">
                                                    <Skeleton className="h-10 w-10 shrink-0 rounded-full bg-white/25" />
                                                    <div className="min-w-0 flex-1 space-y-2">
                                                        <Skeleton className="h-4 w-3/4 bg-white/25" />
                                                        <Skeleton className="h-3 w-1/2 bg-white/20" />
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-3 py-3">
                                                <Skeleton className="mx-auto h-4 w-24 bg-white/25" />
                                            </TableCell>
                                            <TableCell className="px-3 py-3">
                                                <Skeleton className="mx-auto h-4 w-24 bg-white/25" />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </>
                            ) : paginatedAttendance.length > 0 ? (
                                <>
                                    {paginatedAttendance.map((attendance) => {
                                        const record =
                                            session === "AM"
                                                ? attendance.am
                                                : attendance.pm;
                                        const latestTime =
                                            record?.[
                                                `${session.toLowerCase()}_time_out`
                                            ] ??
                                            record?.[
                                                `${session.toLowerCase()}_time_in`
                                            ] ??
                                            "0";
                                        const rowKey = `${attendance.id}-${latestTime}`;
                                        const employeeName = [
                                            attendance.employee?.first_name,
                                            attendance.employee?.middle_name,
                                            attendance.employee?.last_name,
                                        ]
                                            .filter(Boolean)
                                            .join(" ");

                                        return (
                                            <TableRow
                                                key={rowKey}
                                                className="h-[64px] border-white/10 transition hover:bg-white/10"
                                            >
                                                <TableCell className="px-4 py-3">
                                                    <div className="flex min-w-0 items-center gap-3">
                                                        <EmployeeAvatar
                                                            employee={
                                                                attendance.employee
                                                            }
                                                            name={employeeName}
                                                            className="h-10 w-10"
                                                        />
                                                        <div className="min-w-0">
                                                            <div className="truncate font-bold text-white">
                                                                {employeeName ||
                                                                    "-"}
                                                            </div>
                                                            <div className="truncate text-xs font-semibold text-blue-100">
                                                                {attendance.employee
                                                                    ?.office
                                                                    ?.name ||
                                                                    attendance
                                                                        .employee
                                                                        ?.office ||
                                                                    "-"}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-3 py-3 text-center font-bold text-white">
                                                    {formatTime12Hour(
                                                        record?.[
                                                            `${session.toLowerCase()}_time_in`
                                                        ],
                                                    )}
                                                </TableCell>
                                                <TableCell className="px-3 py-3 text-center font-bold text-white">
                                                    {formatTime12Hour(
                                                        record?.[
                                                            `${session.toLowerCase()}_time_out`
                                                        ],
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </>
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={3}
                                        className="py-10 text-center text-sm font-semibold text-blue-100"
                                    >
                                        No records yet
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <PaginationMain
                className="mt-4"
                pagination={paginationData}
                entryLabel="logs"
                disabled={isLoading}
                variant="glass"
                onPageChange={hasServerPagination ? onPageChange : setCurrentPage}
            />
        </div>
    );
};
