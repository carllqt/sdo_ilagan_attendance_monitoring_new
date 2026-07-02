import React, { useEffect, useMemo, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import PaginationMain from "@/Components/PaginationMain";

export const AttendanceTable = ({
    dailyAttendance,
    session,
    search,
    pagination,
    onPageChange,
    isLoading = false,
}) => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;
    const hasServerPagination = Boolean(pagination?.current_page);

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
        ? sortedAttendance
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

    return (
        <div className="flex h-full min-h-0 flex-col">
            <div className="min-h-0 flex-1 overflow-hidden rounded-xl border border-slate-200">
                <div className="h-full overflow-y-auto">
                    <Table className="w-full table-fixed">
                        <TableHeader>
                            <TableRow className="bg-blue-900 hover:bg-blue-800">
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
                            {paginatedAttendance.length > 0 ? (
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
                                                className="h-[58px] transition hover:bg-blue-50"
                                            >
                                                <TableCell className="px-4 py-3">
                                                    <div className="min-w-0">
                                                        <div className="truncate font-medium text-slate-900">
                                                            {employeeName ||
                                                                "-"}
                                                        </div>
                                                        <div className="truncate text-xs text-slate-500">
                                                            {attendance.employee
                                                                ?.office
                                                                ?.name ||
                                                                attendance
                                                                    .employee
                                                                    ?.office ||
                                                                "-"}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-3 py-3 text-center font-medium text-slate-700">
                                                    {formatTime12Hour(
                                                        record?.[
                                                            `${session.toLowerCase()}_time_in`
                                                        ],
                                                    )}
                                                </TableCell>
                                                <TableCell className="px-3 py-3 text-center font-medium text-slate-700">
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
                                        className="py-10 text-center text-sm text-slate-500"
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
                onPageChange={hasServerPagination ? onPageChange : setCurrentPage}
            />
        </div>
    );
};
