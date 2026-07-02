import React from "react";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Trash2, LandPlot, CheckCircle2, XCircle } from "lucide-react";
import ConfirmPasswordDialog from "@/Components/ConfirmPasswordDialog";
import PaginationMain from "@/Components/PaginationMain";
import AssignStationAdminModal from "./AssignStationAdminModal";
import FloatingInput from "@/components/floating-input";
import { Search } from "lucide-react";
import EmployeeAvatar from "@/Components/EmployeeAvatar";
import { SuggestionSkeletonList } from "@/Components/Skeletons";
import { Skeleton } from "@/components/ui/skeleton";
import useStationAdminList from "../hooks/useStationAdminList";
import { getStationHighlightKey } from "../utils";

const StationAdminList = ({
    stationRows = {},
    search = "",
    adminLimit = 10,
    assignStationModal = null,
    removeStationAdminModal = null,
    highlightedStationId = null,
    highlightRequestKey = 0,
}) => {
    const {
        activePage,
        animatedStationId,
        closeAssignModal,
        closeRemoveAdminModal,
        endIndex,
        getEmployeeName,
        handlePageChange,
        isLoading,
        openAssignModal,
        openRemoveAdminModal,
        pageNumbers,
        paginatedRows,
        searchBoxRef,
        searchTerm,
        selectSuggestion,
        setSearchTerm,
        setShowSuggestions,
        showSuggestions,
        startIndex,
        submitSearch,
        suggestionMatches,
        suggestionsLoading,
        totalEntries,
        totalPages,
    } = useStationAdminList({
        adminLimit,
        highlightedStationId,
        highlightRequestKey,
        search,
        stationRows,
    });
    const skeletonRows = Math.max(5, Math.min(Number(adminLimit || 10), 10));

    return (
        <div className="rounded-xl">
            <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                    <h2 className="text-l font-bold">
                        Station Administrator List
                    </h2>
                    <p className="text-sm text-gray-500">
                        Manage station assignments
                    </p>
                </div>

                <div ref={searchBoxRef} className="relative w-[340px] shrink-0">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            if (isLoading) return;
                            submitSearch(searchTerm);
                            setShowSuggestions(false);
                        }}
                        className="space-y-2"
                    >
                        <FloatingInput
                            label="Search Station"
                            icon={Search}
                            name="station-admin-search"
                            value={searchTerm}
                            onChange={(e) => {
                                if (isLoading) return;

                                setSearchTerm(e.target.value);
                                setShowSuggestions(true);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    if (isLoading) return;
                                    submitSearch(searchTerm);
                                    setShowSuggestions(false);
                                }
                            }}
                            disabled={isLoading}
                        />
                    </form>

                    {showSuggestions && searchTerm.trim() && !isLoading ? (
                        <div className="absolute right-0 top-full z-50 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
                            <div className="border-b bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Results for "{searchTerm.trim()}"
                            </div>

                            <div className="max-h-72 overflow-y-auto">
                                {suggestionsLoading ? (
                                    <SuggestionSkeletonList />
                                ) : suggestionMatches.length > 0 ? (
                                    suggestionMatches.map((suggestion) => (
                                        <button
                                            key={suggestion.id}
                                            type="button"
                                            disabled={isLoading}
                                            onMouseDown={() => {
                                                if (isLoading) return;
                                                selectSuggestion(suggestion);
                                            }}
                                            className="flex w-full items-start justify-between gap-3 px-3 py-2 text-left text-sm transition hover:bg-blue-50 disabled:pointer-events-none disabled:opacity-60"
                                        >
                                            <div className="min-w-0">
                                                <div className="truncate font-medium text-slate-800">
                                                    {suggestion.label}
                                                </div>
                                                <div className="truncate text-xs text-slate-500">
                                                    {suggestion.meta}
                                                </div>
                                            </div>

                                            <span className="shrink-0 rounded-full bg-blue-100 px-2 py-1 text-[11px] font-semibold text-blue-700">
                                                Search
                                            </span>
                                        </button>
                                    ))
                                ) : (
                                    <div className="px-3 py-4 text-sm text-slate-500">
                                        No station matches found.
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>

            <div className="overflow-x-auto border rounded-lg">
                <Table className="w-full table-fixed">
                    <TableHeader>
                        <TableRow className="bg-blue-900 hover:bg-blue-800">
                            <TableHead className="text-white text-left px-10 w-[20%]">
                                Employee Name
                            </TableHead>
                            <TableHead className="text-white p-3 w-[15%]">
                                Code
                            </TableHead>
                            <TableHead className="text-white p-3 w-[25%]">
                                Station
                            </TableHead>
                            <TableHead className="text-white p-3 w-[10%]">
                                Status
                            </TableHead>
                            <TableHead className="text-white p-3 w-[10%]">
                                Date Assigned
                            </TableHead>
                            <TableHead className="text-white text-center p-3 w-[10%]">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: skeletonRows }).map(
                                (_, index) => (
                                    <TableRow
                                        key={`station-admin-skeleton-${index}`}
                                        className="h-[64px]"
                                    >
                                        <TableCell className="p-3">
                                            <div className="flex min-w-0 items-center gap-3">
                                                <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
                                                <div className="min-w-0 flex-1 space-y-2">
                                                    <Skeleton className="h-4 w-44 max-w-full" />
                                                    <Skeleton className="h-3 w-32 max-w-full" />
                                                    <Skeleton className="h-3 w-40 max-w-full" />
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="p-3">
                                            <Skeleton className="h-4 w-16" />
                                        </TableCell>
                                        <TableCell className="p-3">
                                            <div className="flex min-w-0 items-center gap-2">
                                                <Skeleton className="h-7 w-7 shrink-0 rounded-full" />
                                                <Skeleton className="h-4 w-48 max-w-full" />
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
                                {paginatedRows.map(({ station, admin }) => {
                                const emp = admin?.employee;
                                const isHighlighted =
                                    String(getStationHighlightKey(station)) ===
                                    String(animatedStationId);

                                return (
                                    <TableRow
                                        key={station.id}
                                        className={`h-[64px] transition ${
                                            isHighlighted
                                                ? "bg-amber-50 ring-1 ring-inset ring-amber-300 hover:bg-amber-100"
                                                : !admin
                                                  ? "bg-gray-100 hover:bg-gray-200"
                                                  : "bg-white hover:bg-blue-50"
                                        }`}
                                    >
                                        <TableCell className="p-3">
                                            <div className="flex items-center gap-3">
                                                <EmployeeAvatar
                                                    employee={emp}
                                                    name={getEmployeeName(emp)}
                                                    className="h-8 w-8"
                                                />

                                                <div className="min-w-0">
                                                    <div className="font-medium truncate">
                                                        {emp
                                                            ? getEmployeeName(emp)
                                                            : "No Admin Assigned"}
                                                    </div>
                                                    {emp && (
                                                        <div className="text-xs text-gray-600 truncate">
                                                            {emp.position ||
                                                                "-"}
                                                        </div>
                                                    )}

                                                    {emp && (
                                                        <div className="text-xs text-gray-500 truncate">
                                                            {emp?.user?.email ||
                                                                ""}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>

                                        <TableCell className="p-3 font-medium">
                                            {station.code || "-"}
                                        </TableCell>

                                        <TableCell className="p-3">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <div className="w-7 h-7 min-w-[28px] flex items-center justify-center rounded-full bg-gray-300">
                                                    <LandPlot className="w-4 h-4 text-blue-600" />
                                                </div>
                                                <span className="truncate">
                                                    {station.name}
                                                </span>
                                            </div>
                                        </TableCell>

                                        <TableCell className="p-3">
                                            {admin ? (
                                                <span className="px-2 py-1 text-xs font-semibold bg-green-200 text-green-800 rounded-full inline-flex items-center gap-2">
                                                    <CheckCircle2 size={14} />
                                                    Assigned
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 text-xs font-semibold bg-red-200 text-red-800 rounded-full inline-flex items-center gap-2">
                                                    <XCircle size={14} />
                                                    Missing
                                                </span>
                                            )}
                                        </TableCell>

                                        <TableCell className="p-3">
                                            {emp?.user?.created_at
                                                ? new Date(
                                                      emp.user.created_at,
                                                  ).toLocaleDateString(
                                                      "en-PH",
                                                      {
                                                          year: "numeric",
                                                          month: "short",
                                                          day: "numeric",
                                                      },
                                                  )
                                                : "-"}
                                        </TableCell>

                                        <TableCell className="p-3 text-center">
                                            {admin ? (
                                                <Button
                                                    size="icon"
                                                    disabled={isLoading}
                                                    onClick={() =>
                                                        openRemoveAdminModal(
                                                            admin,
                                                        )
                                                    }
                                                    className="bg-red-100 text-red-600 hover:bg-red-500 hover:text-white rounded-full"
                                                    title="Remove Station Admin"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    disabled={isLoading}
                                                    className={`bg-white text-blue-600 border border-blue-600 hover:bg-blue-600 hover:text-white ${
                                                        isHighlighted
                                                            ? "animate-bounce bg-blue-600 font-semibold text-white shadow-lg shadow-blue-200"
                                                            : ""
                                                    }`}
                                                    onClick={() =>
                                                        openAssignModal(station)
                                                    }
                                                    title="Assign Station Admin"
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
                                    className="text-center p-5 text-gray-500"
                                >
                                    No Stations Found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <PaginationMain
                currentPage={activePage}
                from={startIndex}
                onPageChange={handlePageChange}
                pageNumbers={pageNumbers}
                to={endIndex}
                total={totalEntries}
                totalPages={totalPages}
                disabled={isLoading}
            />

            <AssignStationAdminModal
                open={!!assignStationModal}
                setOpen={closeAssignModal}
                stations={[]}
                stationData={assignStationModal}
            />

            <ConfirmPasswordDialog
                trigger={null}
                action={
                    removeStationAdminModal?.id
                        ? route(
                              "stationadmin.destroy",
                              removeStationAdminModal.id,
                          )
                        : ""
                }
                title="Remove Station Admin"
                description="Remove assigned admin from this station."
                itemLabel="Station Admin"
                itemName={getEmployeeName(removeStationAdminModal?.employee)}
                method="delete"
                open={!!removeStationAdminModal}
                onOpenChange={(nextOpen) => {
                    if (!nextOpen) closeRemoveAdminModal();
                }}
            />
        </div>
    );
};

export default StationAdminList;

