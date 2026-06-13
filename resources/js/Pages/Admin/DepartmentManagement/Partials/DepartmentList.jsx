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
import { Building2, SquarePen, Trash2 } from "lucide-react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import ConfirmPasswordDialog from "@/Components/ConfirmPasswordDialog";
import PaginationMain from "@/Components/PaginationMain";
import { Skeleton } from "@/components/ui/skeleton";
import AddDivisionModal from "./AddDivisionModal";
import AddOfficeModal from "./AddOfficeModal";
import EditOfficeModal from "./EditOfficeModal";
import EditDivisionModal from "./EditDivisionModal";
import useDepartmentList from "../hooks/useDepartmentList";

ChartJS.register(ArcElement, Tooltip, Legend);

const DepartmentList = ({
    divisions = [],
    divisionList = {},
    offices = [],
    officeList = {},
    office_heads = [],
    officeLimit,
    divisionPage: initialDivisionPage,
    divisionLimit,
    addDivisionModal = false,
    addOfficeModal = false,
    editDivisionModal = null,
    editOfficeModal = null,
    deleteOfficeModal = null,
}) => {
    const {
        assignedCount,
        blueBlackPalette,
        chartData,
        chartOptions,
        chartReady,
        closeDepartmentModal,
        coverage,
        divisionAnalytics,
        divisionChartOptions,
        divisionLoading,
        divisionPage,
        divisionPaginationItems,
        divisionRows,
        divisionSummary,
        handleDivisionPageChange,
        handleOfficePageChange,
        missingOffices,
        officeLoading,
        officePaginationItems,
        officePage,
        officeRows,
        openDepartmentModal,
        sortedOffices,
        totalDivisionPages,
        totalOfficePages,
    } = useDepartmentList({
        divisionLimit,
        divisionList,
        initialDivisionPage,
        officeLimit,
        officeList,
        offices,
        office_heads,
    });
    const officeSkeletonRows = Math.max(5, Math.min(Number(officeLimit || 5), 10));
    const divisionSkeletonRows = 3;

    return (
        <div className="grid gap-5 xl:grid-cols-2">
            <div className="flex min-h-[400px] flex-col rounded-xl p-4 border-2 shadow-lg">
                <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                        <h2 className="text-l font-bold">Section / Unit</h2>
                        <p className="text-sm text-gray-500">
                            Manage offices under each division
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-2">
                        <Button
                            onClick={() => openDepartmentModal("add-office")}
                            className="bg-blue-600 text-white hover:bg-blue-700"
                        >
                            + Add Office
                        </Button>
                    </div>
                </div>

                <AddDivisionModal
                    open={addDivisionModal}
                    setOpen={(nextOpen) => {
                        if (!nextOpen) closeDepartmentModal();
                    }}
                />

                <AddOfficeModal
                    open={addOfficeModal}
                    setOpen={(nextOpen) => {
                        if (!nextOpen) closeDepartmentModal();
                    }}
                    divisions={divisions}
                />

                <EditOfficeModal
                    open={!!editOfficeModal}
                    setOpen={(nextOpen) => {
                        if (!nextOpen) closeDepartmentModal();
                    }}
                    office={editOfficeModal}
                    divisions={divisions}
                />

                <EditDivisionModal
                    open={!!editDivisionModal}
                    setOpen={(nextOpen) => {
                        if (!nextOpen) closeDepartmentModal();
                    }}
                    division={editDivisionModal}
                />

                <div className="overflow-x-auto border rounded-lg">
                    <Table className="w-full table-fixed">
                        <TableHeader>
                            <TableRow className="bg-blue-900 hover:bg-blue-800">
                                <TableHead className="text-white text-left pl-7 pr-3 w-[40%]">
                                    Office
                                </TableHead>
                                <TableHead className="text-white text-left pl-7 pr-3 w-[35%]">
                                    Division
                                </TableHead>
                                <TableHead className="text-white p-3 w-[20%] text-center">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {officeLoading ? (
                                Array.from({ length: officeSkeletonRows }).map(
                                    (_, index) => (
                                        <TableRow
                                            key={`office-list-skeleton-${index}`}
                                            className="h-[56px]"
                                        >
                                            <TableCell className="p-3">
                                                <div className="flex min-w-0 items-center gap-2">
                                                    <Skeleton className="h-7 w-7 shrink-0 rounded-full" />
                                                    <Skeleton className="h-4 w-48 max-w-full" />
                                                </div>
                                            </TableCell>
                                            <TableCell className="p-3">
                                                <div className="space-y-2">
                                                    <Skeleton className="h-4 w-24 max-w-full" />
                                                    <Skeleton className="h-3 w-40 max-w-full" />
                                                </div>
                                            </TableCell>
                                            <TableCell className="p-3">
                                                <div className="flex justify-center gap-2">
                                                    <Skeleton className="h-8 w-8 rounded-full" />
                                                    <Skeleton className="h-8 w-8 rounded-full" />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ),
                                )
                            ) : officeRows.length > 0 ? (
                                officeRows.map((office) => {
                                    return (
                                        <TableRow key={office.id}>
                                            <TableCell className="p-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-300">
                                                        <Building2 className="w-4 h-4 text-blue-600" />
                                                    </div>
                                                    <span className="truncate font-medium">
                                                        {office.name}
                                                    </span>
                                                </div>
                                            </TableCell>

                                            <TableCell className="p-3 text-sm text-gray-600">
                                                <div className="truncate font-medium text-gray-800">
                                                    {office.division?.code}
                                                </div>
                                                <div className="truncate text-xs text-gray-500">
                                                    {office.division?.name}
                                                </div>
                                            </TableCell>

                                            <TableCell className="p-3 text-center">
                                                <div className="flex justify-center gap-2">
                                                    <Button
                                                        onClick={() =>
                                                            openDepartmentModal(
                                                                "edit-office",
                                                                {
                                                                    office_id:
                                                                        office.id,
                                                                },
                                                            )
                                                        }
                                                        className="h-8 w-8 rounded-full bg-blue-600 text-white hover:bg-blue-800"
                                                        size="icon"
                                                        title="Edit Office"
                                                    >
                                                        <SquarePen className="h-4 w-4" />
                                                    </Button>

                                                    <Button
                                                        onClick={() =>
                                                            openDepartmentModal(
                                                                "delete-office",
                                                                {
                                                                    office_id:
                                                                        office.id,
                                                                },
                                                            )
                                                        }
                                                        className="h-8 w-8 rounded-full bg-red-100 text-red-600 hover:bg-red-600 hover:text-white"
                                                        size="icon"
                                                        title="Delete Office"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan="3"
                                        className="p-5 text-center text-gray-500"
                                    >
                                        No Offices Found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <PaginationMain
                    className="mt-auto pt-4"
                    currentPage={officePage}
                    from={officeList?.from || 0}
                    onPageChange={handleOfficePageChange}
                    pageNumbers={officePaginationItems}
                    to={officeList?.to || 0}
                    total={officeList?.total || 0}
                    totalPages={totalOfficePages}
                />
            </div>

            <ConfirmPasswordDialog
                trigger={null}
                title="Delete Office"
                description="Please confirm your password before deleting this office."
                itemLabel="Office"
                itemName={deleteOfficeModal?.name || ""}
                note="Employees assigned to this office will become unassigned after deletion."
                action={
                    deleteOfficeModal?.id
                        ? route("office.destroy", deleteOfficeModal.id)
                        : ""
                }
                method="delete"
                confirmText="Delete Office"
                processingText="Deleting..."
                open={!!deleteOfficeModal}
                onOpenChange={(nextOpen) => {
                    if (!nextOpen) closeDepartmentModal();
                }}
            />

            <div className="flex flex-col gap-5">
                <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 px-5 py-3 shadow-sm">
                        <div className="mb-2 text-base font-bold text-gray-800">
                            Office Head Coverage
                        </div>

                        <div className="flex items-center gap-8">
                            <div className="relative h-[7.3rem] w-[7.3rem] shrink-0">
                                <Doughnut
                                    data={
                                        chartReady
                                            ? chartData
                                            : {
                                                  ...chartData,
                                                  datasets: [
                                                      {
                                                          ...chartData
                                                              .datasets[0],
                                                          data: [0, 0],
                                                      },
                                                  ],
                                              }
                                    }
                                    options={chartOptions}
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-md font-semibold text-gray-900">
                                        {coverage}%
                                    </span>
                                </div>
                            </div>

                            <div className="min-w-0 space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="h-3 w-3 bg-blue-700" />
                                    <span className="text-gray-700">
                                        Assigned
                                    </span>
                                    <span className="font-semibold text-gray-800">
                                        ({assignedCount})
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="h-3 w-3 bg-gray-300" />
                                    <span className="text-gray-700">
                                        Missing
                                    </span>
                                    <span className="font-semibold text-gray-800">
                                        ({missingOffices.length})
                                    </span>
                                </div>

                                <p className="pt-1 text-xs text-gray-600">
                                    {assignedCount} of {sortedOffices.length}{" "}
                                    offices covered
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 to-cyan-100 px-5 py-3 shadow-sm">
                        <div className="mb-2 text-base font-bold text-gray-800">
                            Offices per Division
                        </div>

                        <div className="flex items-center gap-8">
                            <div className="relative h-[7.3rem] w-[7.3rem] shrink-0">
                                <Doughnut
                                    data={
                                        chartReady
                                            ? divisionAnalytics
                                            : {
                                                  ...divisionAnalytics,
                                                  datasets: [
                                                      {
                                                          ...divisionAnalytics
                                                              .datasets[0],
                                                          data: divisionAnalytics.datasets[0].data.map(
                                                              () => 0,
                                                          ),
                                                      },
                                                  ],
                                              }
                                    }
                                    options={divisionChartOptions}
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-md font-semibold text-gray-900">
                                        {sortedOffices.length}
                                    </span>
                                </div>
                            </div>

                            <div className="min-w-0 space-y-2 text-sm">
                                {Object.entries(divisionSummary)
                                    .slice(0, 3)
                                    .map(([division, count], index) => (
                                        <div
                                            key={division}
                                            className="flex items-center gap-2"
                                        >
                                            <span
                                                className="h-3 w-3"
                                                style={{
                                                    backgroundColor:
                                                        blueBlackPalette[
                                                            index %
                                                                blueBlackPalette.length
                                                        ],
                                                }}
                                            />
                                            <span className="truncate text-gray-700">
                                                {division}
                                            </span>
                                            <span className="font-semibold text-gray-800">
                                                ({count})
                                            </span>
                                        </div>
                                    ))}

                                <p className="pt-1 text-xs text-gray-600">
                                    {Object.keys(divisionSummary).length}{" "}
                                    divisions total
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex min-h-[370px] flex-col rounded-xl p-4 border-2 shadow-lg">
                    <div className="mb-4 flex items-center justify-between gap-3">
                        <div>
                            <h2 className="text-l font-bold">Division List</h2>
                            <p className="text-sm text-gray-500">
                                Manage division records
                            </p>
                        </div>

                        <Button
                            onClick={() => openDepartmentModal("add-division")}
                            className="bg-blue-600 text-white hover:bg-blue-700"
                        >
                            + Add Division
                        </Button>
                    </div>

                    <div className="overflow-x-auto border rounded-lg">
                        <Table className="w-full table-fixed">
                            <TableHeader>
                                <TableRow className="bg-blue-900 hover:bg-blue-800">
                                    <TableHead className="text-white text-left pl-7 pr-3 w-[60%]">
                                        Division
                                    </TableHead>
                                    <TableHead className="text-white p-3 w-[40%] text-center">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {divisionLoading ? (
                                    Array.from({
                                        length: divisionSkeletonRows,
                                    }).map((_, index) => (
                                        <TableRow
                                            key={`division-list-skeleton-${index}`}
                                            className="h-[56px]"
                                        >
                                            <TableCell className="p-3">
                                                <div className="flex min-w-0 items-center gap-2">
                                                    <Skeleton className="h-7 w-7 shrink-0 rounded-full" />
                                                    <Skeleton className="h-4 w-52 max-w-full" />
                                                </div>
                                            </TableCell>
                                            <TableCell className="p-3">
                                                <div className="flex justify-center gap-2">
                                                    <Skeleton className="h-8 w-8 rounded-full" />
                                                    <Skeleton className="h-8 w-8 rounded-full" />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : divisionRows.length > 0 ? (
                                    divisionRows.map((division) => (
                                        <TableRow key={division.id}>
                                            <TableCell className="p-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-300">
                                                        <Building2 className="w-4 h-4 text-blue-600" />
                                                    </div>
                                                    <div className="min-w-0 truncate font-medium">
                                                        <span>
                                                            {division.name}
                                                        </span>
                                                        {division.code ? (
                                                            <span className="text-xs font-normal text-gray-500">
                                                                {" "}
                                                                ({division.code}
                                                                )
                                                            </span>
                                                        ) : null}
                                                    </div>
                                                </div>
                                            </TableCell>

                                            <TableCell className="p-3 text-center">
                                                <div className="flex justify-center gap-2">
                                                    <Button
                                                        onClick={() =>
                                                            openDepartmentModal(
                                                                "edit-division",
                                                                {
                                                                    division_id:
                                                                        division.id,
                                                                },
                                                            )
                                                        }
                                                        className="h-8 w-8 rounded-full bg-blue-600 text-white hover:bg-blue-800"
                                                        size="icon"
                                                        title="Edit Division"
                                                    >
                                                        <SquarePen className="h-4 w-4" />
                                                    </Button>

                                                    <ConfirmPasswordDialog
                                                        title="Delete Division"
                                                        description="Please confirm your password before deleting this division."
                                                        itemLabel="Division"
                                                        itemName={
                                                            division.name || ""
                                                        }
                                                        note="Offices under this division may be affected after deletion."
                                                        action={route(
                                                            "department.destroy",
                                                            division.id,
                                                        )}
                                                        method="delete"
                                                        confirmText="Delete Division"
                                                        processingText="Deleting..."
                                                        trigger={
                                                            <Button
                                                                className="h-8 w-8 rounded-full bg-red-100 text-red-600 hover:bg-red-600 hover:text-white"
                                                                size="icon"
                                                                title="Delete Division"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        }
                                                    />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan="2"
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
                        className="mt-auto pt-4"
                        currentPage={divisionPage}
                        from={divisionList?.from || 0}
                        onPageChange={handleDivisionPageChange}
                        pageNumbers={divisionPaginationItems}
                        to={divisionList?.to || 0}
                        total={divisionList?.total || 0}
                        totalPages={totalDivisionPages}
                    />
                </div>
            </div>
        </div>
    );
};

export default DepartmentList;
