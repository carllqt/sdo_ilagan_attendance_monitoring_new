import React from "react";
import { router } from "@inertiajs/react";
import { CalendarClock, CalendarDays, Eye, Hash, Users } from "lucide-react";
import EmployeeAvatar from "@/Components/EmployeeAvatar";
import PaginationMain from "@/Components/PaginationMain";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { getEmployeeName } from "@/lib/utils";

const formatDateTime = (value) => {
    if (!value) {
        return "-";
    }

    return new Intl.DateTimeFormat("en-PH", {
        month: "short",
        day: "2-digit",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    }).format(new Date(value));
};

const formatNumber = (value) => {
    if (value === null || value === undefined || value === "") {
        return "-";
    }

    const numberValue = Number(value);

    return Number.isNaN(numberValue) ? value : numberValue.toFixed(2);
};

const BatchDetailsDialog = ({ batch }) => (
    <Dialog>
        <DialogTrigger asChild>
            <Button
                variant="outline"
                size="sm"
                className="h-8 border-blue-200 bg-white px-2.5 text-blue-700 hover:bg-blue-50"
            >
                <Eye className="h-4 w-4" />
                View details
            </Button>
        </DialogTrigger>

        <DialogContent className="max-w-5xl">
            <DialogHeader>
                <DialogTitle>Batch {batch.id}</DialogTitle>
                <DialogDescription>
                    {batch.month_range} converted on{" "}
                    {formatDateTime(batch.converted_at)}
                </DialogDescription>
            </DialogHeader>

            <div className="max-h-[65vh] overflow-auto rounded-lg border">
                <Table className="min-w-[900px]">
                    <TableHeader>
                        <TableRow className="bg-blue-900 hover:bg-blue-800">
                            <TableHead className="w-[34%] text-white">
                                Employee
                            </TableHead>
                            <TableHead className="text-center text-white">
                                Total Tardiness
                            </TableHead>
                            <TableHead className="text-center text-white">
                                Equiv Day in Hours
                            </TableHead>
                            <TableHead className="text-center text-white">
                                Equiv Day in Minutes
                            </TableHead>
                            <TableHead className="text-center text-white">
                                Total
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {batch.employees?.length > 0 ? (
                            batch.employees.map((record) => {
                                const employee = record.employee || {};
                                const employeeName =
                                    getEmployeeName(employee) || "-";

                                return (
                                    <TableRow key={record.id}>
                                        <TableCell>
                                            <div className="flex min-w-0 gap-3">
                                                <EmployeeAvatar
                                                    employee={employee}
                                                    name={employeeName}
                                                />

                                                <div className="min-w-0">
                                                    <span className="block max-w-[260px] truncate font-medium text-gray-800">
                                                        {employeeName}
                                                    </span>
                                                    <span className="block max-w-[260px] truncate text-xs text-gray-500">
                                                        {employee.office
                                                            ?.name || "-"}
                                                    </span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center font-medium">
                                            {formatNumber(record.total_tardy)}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {formatNumber(record.total_hours)}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {formatNumber(record.total_minutes)}
                                        </TableCell>
                                        <TableCell className="text-center font-semibold">
                                            {formatNumber(
                                                record.total_equivalent,
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan="5"
                                    className="p-5 text-center text-gray-500"
                                >
                                    No employees found on this batch
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </DialogContent>
    </Dialog>
);

const BatchConvertedHistory = ({ batches = {}, records = {} }) => {
    const batchItems = batches?.data || [];

    const handlePageChange = (page) => {
        const query = new URLSearchParams(window.location.search);

        query.set("batch_page", page);
        query.set("batch_limit", batches?.per_page || 5);

        router.get(
            route("converted-tardiness-record"),
            Object.fromEntries(query),
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    return (
        <div className="rounded-2xl border border-blue-100 bg-white p-4 shadow-[0_12px_32px_rgba(15,23,42,0.08)]">
            <div className="mb-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                    <h2 className="text-l font-bold">
                        Batch Converted History
                    </h2>
                    <p className="text-sm text-gray-500">
                        Converted batch history with date, time, and month
                        range
                    </p>
                </div>
            </div>

            <div className="overflow-x-auto rounded-lg border">
                <Table className="min-w-[760px]">
                    <TableHeader>
                        <TableRow className="bg-blue-900 hover:bg-blue-800">
                            <TableHead className="text-white">Batch</TableHead>
                            <TableHead className="text-white">
                                Converted Time
                            </TableHead>
                            <TableHead className="text-white">
                                Month Range
                            </TableHead>
                            <TableHead className="text-center text-white">
                                Employees
                            </TableHead>
                            <TableHead className="text-center text-white">
                                Action
                            </TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {batchItems.length > 0 ? (
                            batchItems.map((batch) => (
                                <TableRow
                                    key={batch.id}
                                    className="transition hover:bg-blue-50"
                                >
                                    <TableCell>
                                        <div className="inline-flex items-center gap-2 font-bold text-slate-900">
                                            <Hash className="h-4 w-4" />
                                            {batch.id}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="inline-flex items-center gap-2 text-slate-700">
                                            <CalendarClock className="h-4 w-4 text-blue-600" />
                                            {formatDateTime(
                                                batch.converted_at,
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                                            <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                                            <span className="truncate">
                                                {batch.month_range}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                                            <Users className="h-3.5 w-3.5" />
                                            {batch.employee_count || 0}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <BatchDetailsDialog batch={batch} />
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan="5"
                                    className="p-5 text-center text-gray-500"
                                >
                                    No batch converted history found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {Number(batches?.last_page || 1) > 1 ? (
                <PaginationMain
                    currentPage={batches?.current_page || 1}
                    onPageChange={handlePageChange}
                    pagination={batches}
                    totalPages={batches?.last_page || 1}
                />
            ) : null}
        </div>
    );
};

export default BatchConvertedHistory;
