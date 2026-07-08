import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { UserCheck } from "lucide-react";
import RequestTableSection from "./RequestTableSection";
import ApproveTravelOrderDialog from "./ApproveTravelOrderDialog";
import {
    formatDate,
    formatDateTime,
    humanize,
    statusClassName,
} from "../util";

const columns = [
    "Employee",
    "Destination",
    "Host",
    "Inclusive Date",
    "Fund Source",
    "Status",
    "Submitted",
    "Action",
];

const TravelOrderTable = ({
    filters,
    isLoading,
    onFilterChange,
    records,
}) => {
    const [approveRequest, setApproveRequest] = useState(null);

    return (
        <>
            <RequestTableSection
                title="Travel Order Requests"
                searchPlaceholder="Search travel requests"
                records={records}
                filters={filters}
                isLoading={isLoading}
                onFilterChange={onFilterChange}
                type="travel_order"
                columns={columns}
                renderRow={(request) => {
                    const isApproved = request.status === "approved";

                    return (
                        <TableRow
                            key={request.id}
                            className="h-[64px] hover:bg-blue-50"
                        >
                            <TableCell className="px-3 font-medium">
                                {request.employee_name || "-"}
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
                            <TableCell className="px-3">
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    disabled={isLoading || isApproved}
                                    onClick={() => setApproveRequest(request)}
                                    className="border-blue-200 text-blue-700 hover:bg-blue-50"
                                >
                                    <UserCheck className="h-4 w-4" />
                                    {isApproved ? "Approved" : "Assign"}
                                </Button>
                            </TableCell>
                        </TableRow>
                    );
                }}
            />

            <ApproveTravelOrderDialog
                request={approveRequest}
                onClose={() => setApproveRequest(null)}
                onApproved={() => setApproveRequest(null)}
            />
        </>
    );
};

export default TravelOrderTable;
