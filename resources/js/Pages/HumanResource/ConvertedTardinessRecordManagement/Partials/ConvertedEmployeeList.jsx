import React from "react";
import EmployeeAvatar from "@/Components/EmployeeAvatar";
import PaginationMain from "@/Components/PaginationMain";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { getEmployeeName } from "@/lib/utils";
import useConvertedEmployeeList from "../hooks/useConvertedEmployeeList";
import {
    batchLabel,
    formatTardiness,
    months,
    normalizedMonthRange,
} from "../utils";

const monthCells = (record) => {
    const cells = [];
    const recordsByStartMonth = (record.records || []).reduce(
        (groups, batchRecord) => {
            const { start } = normalizedMonthRange(batchRecord);

            return {
                ...groups,
                [start]: [...(groups[start] || []), batchRecord],
            };
        },
        {},
    );

    for (let month = 1; month <= 12; month += 1) {
        const startingRecords = recordsByStartMonth[month] || [];

        if (startingRecords.length === 0) {
            cells.push(
                <TableCell
                    key={`${record.id}-${month}`}
                    className="bg-white p-3 text-center text-gray-400 transition group-hover:bg-blue-50"
                >
                    -
                </TableCell>,
            );
            continue;
        }

        const end = Math.max(
            ...startingRecords.map(
                (batchRecord) => normalizedMonthRange(batchRecord).end,
            ),
        );
        const totalTardy = startingRecords.reduce(
            (total, batchRecord) =>
                total + Number(batchRecord.total_tardy || 0),
            0,
        );
        const title = startingRecords
            .map(
                (batchRecord) =>
                    `${batchLabel(batchRecord)} - ${batchRecord.month}`,
            )
            .join("\n");
        const batchLabels = startingRecords
            .map((batchRecord) => batchLabel(batchRecord))
            .filter(Boolean);

        cells.push(
            <TableCell
                key={`${record.id}-${month}`}
                colSpan={end - month + 1}
                className="bg-white p-2 text-center font-semibold text-gray-800 transition group-hover:bg-blue-50"
                title={title || undefined}
            >
                <div className="flex min-h-12 flex-col items-center justify-center gap-1">
                    {batchLabels.length > 0 ? (
                        <div className="flex max-w-full flex-wrap items-center justify-center gap-1">
                            {batchLabels.map((label) => (
                                <span
                                    key={`${record.id}-${month}-${label}`}
                                    className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-bold leading-none text-blue-700"
                                >
                                    {label}
                                </span>
                            ))}
                        </div>
                    ) : null}
                    <span>{formatTardiness(totalTardy)}</span>
                </div>
            </TableCell>,
        );

        month = end;
    }

    return cells;
};

const ConvertedEmployeeList = ({ records = {} }) => {
    const { handlePageChange, isLoading, recordItems, skeletonRows } =
        useConvertedEmployeeList({ records });

    return (
        <div className="rounded-2xl border border-blue-100 bg-white p-4 shadow-[0_12px_32px_rgba(15,23,42,0.08)]">
            <div className="rounded-xl">
                <div className="mb-4 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                        <h2 className="text-l font-bold">
                            Converted Tardiness Records
                        </h2>
                        <p className="text-sm text-gray-500">
                            Employee converted tardiness records by month
                        </p>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto rounded-lg border">
                <Table className="w-full min-w-[1320px] table-fixed">
                    <TableHeader>
                        <TableRow className="bg-blue-900 hover:bg-blue-800">
                            <TableHead className="w-[24%] px-16 text-left text-white">
                                Employee Name
                            </TableHead>
                            {months.map((month) => (
                                <TableHead
                                    key={month}
                                    className="w-[6.33%] text-center text-white"
                                >
                                    {month.slice(0, 3)}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: skeletonRows }).map(
                                (_, index) => (
                                    <TableRow
                                        key={`converted-tardiness-skeleton-${index}`}
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

                                        {months.map((month) => (
                                            <TableCell
                                                key={`converted-tardiness-skeleton-${index}-${month}`}
                                                className="p-3"
                                            >
                                                <div className="flex flex-col items-center gap-2">
                                                    <Skeleton className="h-4 w-12 rounded-full" />
                                                    <Skeleton className="h-4 w-10" />
                                                </div>
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ),
                            )
                        ) : recordItems.length > 0 ? (
                            recordItems.map((record) => {
                                const employee = record.employee || {};
                                const employeeName =
                                    getEmployeeName(employee) || "-";

                                return (
                                    <TableRow
                                        key={record.id}
                                        className="group h-[64px] bg-white transition hover:bg-blue-50"
                                    >
                                        <TableCell className="bg-white p-3 transition group-hover:bg-blue-50">
                                            <div className="flex min-w-0 gap-3">
                                                <EmployeeAvatar
                                                    employee={employee}
                                                    name={employeeName}
                                                />

                                                <div className="min-w-0">
                                                    <span className="block max-w-[300px] truncate font-medium text-gray-800">
                                                        {employeeName}
                                                    </span>
                                                    <span className="block max-w-[300px] truncate text-xs text-gray-500">
                                                        {employee.office
                                                            ?.name || "-"}
                                                    </span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        {monthCells(record)}
                                    </TableRow>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan="13"
                                    className="p-5 text-center text-gray-500"
                                >
                                    No Converted Tardiness Records Found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <PaginationMain
                currentPage={records?.current_page || 1}
                onPageChange={handlePageChange}
                pagination={records}
                totalPages={records?.last_page || 1}
            />
        </div>
    );
};

export default ConvertedEmployeeList;
