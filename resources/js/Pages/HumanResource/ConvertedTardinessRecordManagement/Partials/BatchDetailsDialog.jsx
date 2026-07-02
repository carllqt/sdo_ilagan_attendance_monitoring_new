import React from "react";
import { Hash, Printer } from "lucide-react";

import EmployeeAvatar from "@/Components/EmployeeAvatar";
import { Button } from "@/components/ui/button";
import HrSummaryofTardinessReport from "@/Pages/DocumentsFormats/HrSummaryofTardinessReport";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
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
import { formatDateTime, formatNumber } from "../utils";
import useBatchDetailsPdf from "../hooks/useBatchDetailsPdf";

const BatchDetailsDialog = ({ batch, onClose }) => {
    const { handlePrintPDF, pdfRef, reportRecords } =
        useBatchDetailsPdf(batch);

    return (
        <Dialog open={!!batch} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-5xl overflow-hidden rounded-2xl p-0">
                <div className="bg-blue-900 px-5 py-4 text-white">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-white">
                            <Hash className="h-5 w-5" />
                            Batch {batch?.id}
                        </DialogTitle>
                        <DialogDescription className="text-blue-100">
                            {batch?.month_range} converted on{" "}
                            {formatDateTime(batch?.converted_at)}
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="mx-5 mb-5 mt-1 max-h-[65vh] overflow-auto rounded-lg border">
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
                            {batch?.employees?.length > 0 ? (
                                <>
                                    {batch.employees.map((record) => {
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
                                                {formatNumber(
                                                    record.total_tardy,
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {formatNumber(
                                                    record.total_hours,
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {formatNumber(
                                                    record.total_minutes,
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center font-semibold">
                                                {formatNumber(
                                                    record.total_equivalent,
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                    })}
                                </>
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

                <div className="flex justify-end px-5 pb-5">
                    <Button
                        type="button"
                        className="h-9 gap-2 bg-blue-900 text-white hover:bg-blue-800"
                        disabled={reportRecords.length === 0}
                        onClick={handlePrintPDF}
                    >
                        <Printer className="h-4 w-4" />
                        Print PDF
                    </Button>
                </div>

                <div className="pointer-events-none fixed -left-[9999px] top-0 w-[8.5in] bg-white">
                    <HrSummaryofTardinessReport
                        ref={pdfRef}
                        groupedByEmployee={reportRecords}
                        monthRangeLabel={batch?.month_range || ""}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default BatchDetailsDialog;
