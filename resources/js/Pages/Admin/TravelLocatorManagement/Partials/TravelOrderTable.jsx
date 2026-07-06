import React from "react";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import RequestTableSection from "./RequestTableSection";
import {
    formatDate,
    formatDateTime,
    humanize,
    statusClassName,
} from "../util";

const columns = [
    "Employee",
    "Email",
    "Position",
    "Station",
    "Destination",
    "Host",
    "Inclusive Date",
    "Fund Source",
    "Status",
    "Submitted",
];

const TravelOrderTable = ({
    filters,
    isLoading,
    onFilterChange,
    records,
    stations,
}) => (
    <RequestTableSection
        title="Travel Order Requests"
        searchPlaceholder="Search travel requests"
        records={records}
        filters={filters}
        isLoading={isLoading}
        onFilterChange={onFilterChange}
        stations={stations}
        type="travel_order"
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
                    {request.host_of_activity || "-"}
                </TableCell>
                <TableCell className="px-3">
                    {formatDate(request.inclusive_dates)}
                </TableCell>
                <TableCell className="px-3">
                    {request.fund_source || "-"}
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

export default TravelOrderTable;
