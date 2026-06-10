import React from "react";
import { Head, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
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
import { getEmployeeName } from "@/lib/utils";

const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

const formatTardiness = (value) => {
    if (value === null || value === undefined || value === "") {
        return "-";
    }

    const numberValue = Number(value);

    if (Number.isNaN(numberValue)) {
        return value;
    }

    return numberValue.toFixed(2);
};

const normalizedMonthRange = (record) => {
    const start = Number(record.start_month) || 1;
    const end = Number(record.end_month) || start;

    return {
        start: Math.min(Math.max(start, 1), 12),
        end: Math.min(Math.max(end, start), 12),
    };
};

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
                    className="p-3 text-center text-gray-400"
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
            (total, batchRecord) => total + Number(batchRecord.total_tardy || 0),
            0,
        );
        const title = startingRecords
            .map((batchRecord) => `${batchRecord.batch_code} - ${batchRecord.month}`)
            .join("\n");

        cells.push(
            <TableCell
                key={`${record.id}-${month}`}
                colSpan={end - month + 1}
                className="p-3 text-center font-semibold text-gray-800"
                title={title || undefined}
            >
                {formatTardiness(totalTardy)}
            </TableCell>,
        );

        month = end;
    }

    return cells;
};

const batchSummary = (record) => {
    const batches = record.records || [];

    if (batches.length === 0) {
        return {
            label: "-",
            detail: "-",
            title: "",
        };
    }

    return {
        label:
            batches.length === 1
                ? batches[0].batch_code
                : `${batches.length} batches`,
        detail:
            batches.length === 1
                ? batches[0].month
                : batches.map((batch) => batch.month).join(", "),
        title: batches
            .map((batch) => `${batch.batch_code} - ${batch.month}`)
            .join("\n"),
    };
};

const ConvertedTardinessRecordManagement = ({ records = {} }) => {
    const recordItems = records?.data || [];
    const handlePageChange = (page) => {
        router.get(
            route("converted-tardiness-record"),
            {
                page,
                limit: records?.per_page || 10,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    return (
        <AuthenticatedLayout header="Converted Tardiness Record Management">
            <Head title="Converted Tardiness Record Management" />

            <main className="flex-1 p-3">
                <div className="rounded-2xl p-4 mt-4 border border-blue-100 shadow-lg">
                    <div className="rounded-xl">
                        <div className="flex items-center justify-between mb-4 gap-4">
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

                    <div className="overflow-x-auto border rounded-lg">
                        <Table className="w-full min-w-[1500px] table-fixed">
                            <TableHeader>
                                <TableRow className="bg-blue-900 hover:bg-blue-800">
                                    <TableHead className="text-white text-left px-16 w-[22%]">
                                        Employee Name
                                    </TableHead>
                                    <TableHead className="text-white text-left w-[14%]">
                                        Batches
                                    </TableHead>
                                    {months.map((month) => (
                                        <TableHead
                                            key={month}
                                            className="text-white text-center w-[5.25%]"
                                        >
                                            {month.slice(0, 3)}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {recordItems.length > 0 ? (
                                    recordItems.map((record) => {
                                        const employee = record.employee || {};
                                        const employeeName =
                                            getEmployeeName(employee) || "-";
                                        const batches = batchSummary(record);

                                        return (
                                            <TableRow
                                                key={record.id}
                                                className="h-[64px] hover:bg-blue-50 transition"
                                            >
                                                <TableCell className="p-3">
                                                    <div className="flex gap-3 min-w-0">
                                                        <EmployeeAvatar
                                                            employee={employee}
                                                            name={employeeName}
                                                        />

                                                        <div className="min-w-0">
                                                            <span className="block max-w-[300px] truncate font-medium text-gray-800">
                                                                {employeeName}
                                                            </span>
                                                            <span className="block max-w-[300px] truncate text-xs text-gray-500">
                                                                {employee.office?.name ||
                                                                    "-"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="p-3">
                                                    <div
                                                        className="min-w-0"
                                                        title={batches.title}
                                                    >
                                                        <span className="block truncate font-medium text-gray-800">
                                                            {batches.label}
                                                        </span>
                                                        <span className="block truncate text-xs text-gray-500">
                                                            {batches.detail}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                {monthCells(record)}
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan="14"
                                            className="text-center p-5 text-gray-500"
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
            </main>
        </AuthenticatedLayout>
    );
};

export default ConvertedTardinessRecordManagement;
