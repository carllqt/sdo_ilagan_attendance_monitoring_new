import React from "react";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

const TardyTable = ({ filteredSummary, monthList, selectedYear }) => {
    return (
        <Table>
            <TableCaption>Tardiness Summary by Month</TableCaption>
            <TableHeader>
                <TableRow className="bg-blue-900 hover:bg-blue-800">
                    <TableHead className="text-center">Employee</TableHead>
                    {monthList.map((month, idx) => (
                        <TableHead key={idx} className="text-center">
                            {month}
                        </TableHead>
                    ))}
                    <TableHead className="text-center">Total</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {filteredSummary.map((data, index) => (
                    <TableRow key={index}>
                        <TableCell>{data.employee.full_name}</TableCell>
                        {monthList.map((_, i) => {
                            const val =
                                data.tardyPerMonths[selectedYear]?.[i + 1] || 0;
                            return (
                                <TableCell key={i} className="text-center">
                                    {val > 0 ? val.toFixed(2) : "0"}
                                </TableCell>
                            );
                        })}
                        <TableCell className="text-center">
                            {data.tardyPerYear[selectedYear]?.toFixed(2) || "0"}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

export default TardyTable;
