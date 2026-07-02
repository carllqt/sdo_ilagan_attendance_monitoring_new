import React from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Building2, CheckCircle2, Trash2 } from "lucide-react";
import ConfirmPasswordDialog from "@/Components/ConfirmPasswordDialog";
import PaginationMain from "@/Components/PaginationMain";
import { Skeleton } from "@/components/ui/skeleton";
import AddDivisionHeadForm from "./AddDivisionHeadForm";
import EmployeeAvatar from "@/Components/EmployeeAvatar";
import useDivisionHeadList from "../hooks/useDivisionHeadList";

const DivisionHeadList = ({
    divisions = [],
    divisionHeadRows = {},
    divisionHeadLimit,
    assignDivisionHeadModal = null,
    deleteDivisionHeadModal = null,
}) => {
    const {
        closeDepartmentModal,
        currentPage,
        endIndex,
        getEmployeeName,
        isLoading,
        openDepartmentModal,
        paginatedRows,
        handlePageChange,
        startIndex,
        totalEntries,
        totalPages,
    } = useDivisionHeadList({
        divisionHeadRows,
        divisionHeadLimit,
    });
    const skeletonRows = 3;

    return (
        <div className="rounded-xl">
            <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-l font-bold">Division Head</h2>
                    <p className="text-sm text-gray-500">
                        Manage division head assignments
                    </p>
                </div>
            </div>

            <AddDivisionHeadForm
                open={!!assignDivisionHeadModal}
                setOpen={(nextOpen) => {
                    if (!nextOpen) closeDepartmentModal();
                }}
                divisions={divisions}
                preselectedDivision={
                    assignDivisionHeadModal?.division_id || null
                }
            />

            <div className="overflow-x-auto rounded-lg border">
                <Table className="w-full table-fixed">
                    <TableHeader>
                        <TableRow className="bg-blue-900 hover:bg-blue-800">
                            <TableHead className="w-[25%] px-10 text-white">
                                Employee Name
                            </TableHead>
                            <TableHead className="w-[20%] p-3 text-white">
                                Position
                            </TableHead>
                            <TableHead className="w-[25%] p-3 text-white">
                                Division
                            </TableHead>
                            <TableHead className="w-[10%] p-3 text-white">
                                Status
                            </TableHead>
                            <TableHead className="w-[10%] p-3 text-white">
                                Date Assigned
                            </TableHead>
                            <TableHead className="w-[15%] p-3 text-center text-white">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: skeletonRows }).map(
                                (_, index) => (
                                    <TableRow
                                        key={`division-head-skeleton-${index}`}
                                        className="h-[64px]"
                                    >
                                        <TableCell className="p-3">
                                            <div className="flex min-w-0 items-center gap-3">
                                                <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
                                                <div className="min-w-0 flex-1 space-y-2">
                                                    <Skeleton className="h-4 w-44 max-w-full" />
                                                    <Skeleton className="h-3 w-36 max-w-full" />
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="p-3">
                                            <Skeleton className="h-4 w-40 max-w-full" />
                                        </TableCell>
                                        <TableCell className="p-3">
                                            <div className="flex min-w-0 items-start gap-2">
                                                <Skeleton className="h-7 w-7 shrink-0 rounded-full" />
                                                <div className="min-w-0 flex-1 space-y-2">
                                                    <Skeleton className="h-4 w-20 max-w-full" />
                                                    <Skeleton className="h-3 w-40 max-w-full" />
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="p-3">
                                            <Skeleton className="h-6 w-24 rounded-full" />
                                        </TableCell>
                                        <TableCell className="p-3">
                                            <Skeleton className="h-4 w-24" />
                                        </TableCell>
                                        <TableCell className="p-3">
                                            <div className="flex justify-center">
                                                <Skeleton className="h-8 w-8 rounded-full" />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ),
                            )
                        ) : paginatedRows.length > 0 ? (
                            <>
                                {paginatedRows.map((row) => {
                                const emp = row.head?.employee;

                                return (
                                    <TableRow
                                        key={row.division.id}
                                        className={`h-[64px] transition ${
                                            !row.head
                                                  ? "bg-gray-100 hover:bg-gray-200"
                                                  : "bg-white hover:bg-blue-50"
                                        }`}
                                    >
                                        <TableCell className="p-3">
                                            <div className="flex items-center gap-3">
                                                <EmployeeAvatar
                                                    employee={emp}
                                                />

                                                <div className="min-w-0">
                                                    <div className="truncate font-medium">
                                                        {emp
                                                            ? getEmployeeName(
                                                                  emp,
                                                              )
                                                            : "No Head Assigned"}
                                                    </div>
                                                    {emp && (
                                                        <div className="truncate text-xs text-gray-500">
                                                            {emp.email || ""}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>

                                        <TableCell className="min-w-0 p-3 text-gray-700">
                                            <span
                                                className="block max-w-full truncate"
                                                title={emp?.position || "-"}
                                            >
                                                {emp?.position || "-"}
                                            </span>
                                        </TableCell>
                                        <TableCell className="p-3">
                                            <div className="flex items-start gap-2 min-w-0">
                                                <div className="w-7 h-7 min-w-[28px] flex items-center justify-center rounded-full bg-gray-300">
                                                    <Building2 className="w-4 h-4 text-blue-600" />
                                                </div>

                                                <div className="min-w-0">
                                                    <div className="truncate font-medium">
                                                        {row.division.code}
                                                    </div>

                                                    <div className="truncate text-xs text-gray-500">
                                                        {row.division.name}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>

                                        <TableCell className="p-3">
                                            {row.head ? (
                                                <span className="inline-flex min-w-[90px] items-center justify-center gap-2 rounded-full bg-green-200 px-2 py-1 text-xs font-semibold text-green-800">
                                                    <CheckCircle2 size={14} />
                                                    Assigned
                                                </span>
                                            ) : (
                                                <span className="inline-flex min-w-[90px] items-center justify-center gap-2 rounded-full bg-red-200 px-2 py-1 text-xs font-semibold text-red-800">
                                                    <CheckCircle2 size={14} />
                                                    Missing
                                                </span>
                                            )}
                                        </TableCell>

                                        <TableCell className="p-3 truncate">
                                            {row.head
                                                ? new Date(
                                                      row.head.created_at,
                                                  ).toLocaleDateString(
                                                      "en-US",
                                                      {
                                                          year: "numeric",
                                                          month: "short",
                                                          day: "numeric",
                                                      },
                                                  )
                                                : "-"}
                                        </TableCell>

                                        <TableCell className="p-3 text-center">
                                            {row.head ? (
                                                <Button
                                                    size="icon"
                                                    disabled={isLoading}
                                                    onClick={() =>
                                                        openDepartmentModal(
                                                            "delete-division-head",
                                                            {
                                                                head_id:
                                                                    row.head.id,
                                                            },
                                                        )
                                                    }
                                                    className="rounded-full bg-red-100 text-red-600 hover:bg-red-500 hover:text-white"
                                                    title="Delete Division Head"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    disabled={isLoading}
                                                    className="min-w-[60px] border border-blue-600 bg-white text-blue-600 hover:bg-blue-600 hover:text-white"
                                                    onClick={() => {
                                                        openDepartmentModal(
                                                            "assign-division-head",
                                                            {
                                                                division_name:
                                                                    row.division
                                                                        .name,
                                                            },
                                                        );
                                                    }}
                                                    title="Assign Division Head"
                                                >
                                                    Assign
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                                })}
                            </>
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan="6"
                                    className="p-5 text-center text-gray-500"
                                >
                                    No Divisions Found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <PaginationMain
                currentPage={currentPage}
                from={startIndex}
                onPageChange={handlePageChange}
                to={endIndex}
                total={totalEntries}
                totalPages={totalPages}
                disabled={isLoading}
            />

            <ConfirmPasswordDialog
                trigger={null}
                title="Delete Division Head"
                description="You are about to permanently remove this division head assignment."
                itemLabel="Division Head"
                itemName={getEmployeeName(deleteDivisionHeadModal?.employee)}
                action={
                    deleteDivisionHeadModal?.id
                        ? route(
                              "divisionhead.destroy",
                              deleteDivisionHeadModal.id,
                          )
                        : ""
                }
                method="delete"
                open={!!deleteDivisionHeadModal}
                onOpenChange={(nextOpen) => {
                    if (!nextOpen) closeDepartmentModal();
                }}
            />
        </div>
    );
};

export default DivisionHeadList;
