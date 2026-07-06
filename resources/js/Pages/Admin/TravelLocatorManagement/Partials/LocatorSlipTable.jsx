import React from "react";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import RequestTableSection from "./RequestTableSection";
import { formatDateTime, humanize, statusClassName } from "../util";

const columns = [
    "Employee",
    "Email",
    "Position",
    "Station",
    "Destination",
    "Travel Date",
    "Type",
    "Status",
    "Submitted",
];

const LocatorSlipTable = ({
    filters,
    isLoading,
    onFilterChange,
    records,
    stations,
}) => (
    <RequestTableSection
        title="Locator Slip Logs"
        searchPlaceholder="Employee Name"
        records={records}
        filters={filters}
        isLoading={isLoading}
        onFilterChange={onFilterChange}
        stations={stations}
        type="locator_slip"
        columns={columns}
        renderRow={(request) => (
            <TableRow key={request.id} className="h-[64px] hover:bg-blue-50">
                <TableCell className="px-3 font-medium">
                    {request.employee_name || "-"}
                </TableCell>
                <TableCell className="px-3">{request.email || "-"}</TableCell>
                <TableCell className="px-3">
                    {request.position || "-"}
                </TableCell>
                <TableCell className="px-3">
                    {request.station?.name || request.permanent_station || "-"}
                </TableCell>
                <TableCell className="px-3">
                    {request.destination || "-"}
                </TableCell>
                <TableCell className="px-3">
                    {formatDateTime(request.travel_datetime)}
                </TableCell>
                <TableCell className="px-3">
                    {humanize(request.travel_type)}
                </TableCell>
                <TableCell className="px-3">
                    <Badge
                        variant="outline"
                        className={statusClassName(request.status)}
                    >
                        {humanize(request.status)}
                    </Badge>
                </TableCell>
                <TableCell className="px-3">
                    {formatDateTime(request.created_at)}
                </TableCell>
            </TableRow>
        )}
    />
);

export default LocatorSlipTable;
