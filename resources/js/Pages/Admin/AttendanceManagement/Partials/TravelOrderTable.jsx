import React, { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import localeData from "dayjs/plugin/localeData";
import EmployeeAvatar from "@/Components/EmployeeAvatar";
import PaginationMain from "@/Components/PaginationMain";
import { getEmployeeName } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import FloatingInput from "@/components/floating-input";
import {
    CustomDropdownCheckbox,
    CustomDropdownCheckboxObject,
} from "@/components/dropdown-menu-main";
import { Plane, Plus, Search } from "lucide-react";
import { SuggestionSkeletonList } from "@/Components/Skeletons";
import useEmployeeSearchSuggestions from "../../EmployeeManagement/hooks/useEmployeeSearchSuggestions";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

dayjs.extend(localeData);

const TravelOrderTable = ({
    records = {},
    filters = {},
    offices = [],
    years = [],
    onAddTravelOrder,
    onFilterChange,
    isLoading = false,
}) => {
    const items = records.data || [];
    const [searchInput, setSearchInput] = useState(filters.search || "");
    const months = useMemo(() => dayjs.months(), []);
    const selectedYear = filters.year || dayjs().format("YYYY");
    const selectedMonth = filters.month || dayjs().format("MMMM");
    const selectedDay = String(filters.day || dayjs().format("DD")).padStart(
        2,
        "0",
    );
    const monthIndex = months.indexOf(selectedMonth);
    const daysInMonth = (year, month) => {
        const index = months.indexOf(month);

        if (index < 0) {
            return 31;
        }

        return dayjs(`${year}-${index + 1}-01`, "YYYY-M-DD").daysInMonth();
    };
    const validDayFor = (year, month, day) =>
        Math.min(Number(day), daysInMonth(year, month));
    const days = useMemo(() => {
        if (monthIndex < 0) {
            return [];
        }

        const totalDays = dayjs(
            `${selectedYear}-${monthIndex + 1}-01`,
            "YYYY-M-DD",
        ).daysInMonth();

        return Array.from({ length: totalDays }, (_, index) =>
            String(index + 1).padStart(2, "0"),
        );
    }, [monthIndex, selectedYear]);
    const officeItems = [{ id: "all", name: "All Offices" }, ...offices];
    const selectedOffice =
        officeItems.find(
            (office) =>
                String(office.id) === String(filters.office) ||
                office.name === filters.office,
        ) || officeItems[0];
    const officeButtonLabel = selectedOffice.name;
    const {
        searchBoxRef,
        setShowSuggestions,
        showSuggestions,
        suggestionMatches,
        suggestionsLoading,
    } = useEmployeeSearchSuggestions({
        enabled: !isLoading && Boolean(searchInput.trim()),
        query: searchInput,
    });

    useEffect(() => {
        setSearchInput(filters.search || "");
    }, [filters.search]);

    const applySearch = (value = searchInput) => {
        if (isLoading) return;

        onFilterChange({
            search: String(value || "").trim(),
            page: 1,
        });
        setShowSuggestions(false);
    };

    const selectSuggestion = (employee) => {
        if (isLoading) return;

        setSearchInput(employee.label);
        applySearch(`${employee.id} ${employee.label}`);
    };

    return (
        <div className="mt-6 rounded-2xl border border-blue-100 p-4 shadow-lg">
            <div className="mb-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <Plane className="h-5 w-5 text-blue-700" />
                        <h2 className="text-l font-bold">Travel Orders</h2>
                    </div>
                    <p className="text-sm text-gray-500">
                        Employees with travel orders on the selected date
                    </p>
                </div>

                <div className="flex items-start gap-4">
                    <div ref={searchBoxRef} className="relative w-[300px] shrink-0">
                        <FloatingInput
                            label="Employee Name"
                            icon={Search}
                            name="travel_order_search"
                            value={searchInput}
                            disabled={isLoading}
                            onChange={(event) => {
                                setSearchInput(event.target.value);
                                setShowSuggestions(true);
                            }}
                            onFocus={() => setShowSuggestions(true)}
                            onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                    event.preventDefault();
                                    applySearch();
                                }
                            }}
                        />

                        {showSuggestions && searchInput.trim() ? (
                            <div className="absolute right-0 top-full z-50 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
                                <div className="border-b bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Results for "{searchInput.trim()}"
                                </div>

                                <div className="max-h-72 overflow-y-auto">
                                    {suggestionsLoading ? (
                                        <SuggestionSkeletonList />
                                    ) : suggestionMatches.length > 0 ? (
                                        suggestionMatches.map((employee) => (
                                            <button
                                                key={employee.id}
                                                type="button"
                                                onMouseDown={() =>
                                                    selectSuggestion(employee)
                                                }
                                                className="flex w-full items-start justify-between gap-3 px-3 py-2 text-left text-sm transition hover:bg-blue-50"
                                            >
                                                <div className="min-w-0">
                                                    <div className="truncate font-medium text-slate-800">
                                                        {employee.label}
                                                    </div>
                                                    <div className="truncate text-xs text-slate-500">
                                                        {employee.meta}
                                                    </div>
                                                </div>

                                                <span className="shrink-0 rounded-full bg-blue-100 px-2 py-1 text-[11px] font-semibold text-blue-700">
                                                    Search
                                                </span>
                                            </button>
                                        ))
                                    ) : (
                                        <div className="px-3 py-4 text-sm text-slate-500">
                                            No employee matches found.
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : null}
                    </div>

                    <CustomDropdownCheckbox
                        label="Select Day"
                        items={days}
                        selected={selectedDay}
                        disabled={isLoading}
                        onChange={(day) =>
                            onFilterChange({
                                day: Number(day),
                                page: 1,
                            })
                        }
                        buttonVariant="outline"
                        className="h-10 w-[76px] min-w-0 border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                    />
                    <CustomDropdownCheckbox
                        label="Select Month"
                        items={months}
                        selected={selectedMonth}
                        disabled={isLoading}
                        onChange={(month) =>
                            onFilterChange({
                                month,
                                day: validDayFor(
                                    selectedYear,
                                    month,
                                    selectedDay,
                                ),
                                page: 1,
                            })
                        }
                        buttonVariant="outline"
                        className="h-10 w-[145px] min-w-0 truncate border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                    />
                    <CustomDropdownCheckbox
                        label="Select Year"
                        items={years}
                        selected={selectedYear}
                        disabled={isLoading}
                        onChange={(year) =>
                            onFilterChange({
                                year,
                                day: validDayFor(
                                    year,
                                    selectedMonth,
                                    selectedDay,
                                ),
                                page: 1,
                            })
                        }
                        buttonVariant="outline"
                        className="h-10 w-[100px] min-w-0 border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                    />
                    <CustomDropdownCheckboxObject
                        label="Select Office"
                        items={officeItems}
                        selected={selectedOffice.id}
                        buttonLabel={officeButtonLabel}
                        disabled={isLoading}
                        onChange={(officeId) =>
                            onFilterChange({
                                office:
                                    officeItems.find(
                                        (office) =>
                                            String(office.id) ===
                                            String(officeId),
                                    )?.name || "all",
                                page: 1,
                            })
                        }
                        buttonVariant="outline"
                        className="h-10 w-[180px] shrink-0 border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                    />
                    <Button
                        type="button"
                        className="h-10 shrink-0 gap-2 bg-blue-700 text-white hover:bg-blue-800"
                        disabled={isLoading}
                        onClick={onAddTravelOrder}
                    >
                        <Plus className="h-4 w-4" />
                        Add Travel Order
                    </Button>
                </div>
            </div>

            <div className="overflow-x-auto rounded-lg border">
                <Table className="w-full table-fixed">
                    <TableHeader>
                        <TableRow className="bg-blue-900 hover:bg-blue-800">
                            <TableHead className="w-[34%] px-16 text-left text-white">
                                Employee Name
                            </TableHead>
                            <TableHead className="w-[18%] text-white">
                                Start Date
                            </TableHead>
                            <TableHead className="w-[18%] text-white">
                                End Date
                            </TableHead>
                            <TableHead className="w-[20%] text-white">
                                Duration
                            </TableHead>
                            <TableHead className="w-[10%] text-center text-white">
                                Status
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.length > 0 ? (
                            <>
                                {items.map((travelOrder) => {
                                const employee = travelOrder.employee || {};
                                const employeeName = getEmployeeName(employee);
                                const startDate = dayjs(travelOrder.start_date);
                                const endDate = dayjs(travelOrder.end_date);
                                const duration =
                                    endDate.diff(startDate, "day") + 1;

                                return (
                                    <TableRow
                                        key={travelOrder.id}
                                        className="h-[64px] transition hover:bg-blue-50"
                                    >
                                        <TableCell className="p-3">
                                            <div className="flex min-w-0 gap-3">
                                                <EmployeeAvatar
                                                    employee={employee}
                                                    name={employeeName}
                                                />

                                                <div className="flex min-w-0 flex-col justify-center">
                                                    <span className="max-w-[280px] truncate font-medium">
                                                        {employeeName}
                                                    </span>
                                                    <span className="block max-w-[280px] truncate text-xs text-gray-500">
                                                        {employee.office
                                                            ?.name || "-"}
                                                    </span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="p-3">
                                            {startDate.format("DD MMMM YYYY")}
                                        </TableCell>
                                        <TableCell className="p-3">
                                            {endDate.format("DD MMMM YYYY")}
                                        </TableCell>
                                        <TableCell className="p-3">
                                            {duration}{" "}
                                            {duration === 1 ? "day" : "days"}
                                        </TableCell>
                                        <TableCell className="p-3 text-center">
                                            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                                                Active
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                );
                                })}
                            </>
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={5}
                                    className="p-5 text-center text-gray-500"
                                >
                                    No travel orders found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <PaginationMain
                pagination={records}
                entryLabel="travel orders"
                disabled={isLoading}
                onPageChange={(page) => onFilterChange({ page })}
            />
        </div>
    );
};

export default TravelOrderTable;
