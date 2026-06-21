import React, { useEffect, useState } from "react";
import { router } from "@inertiajs/react";
import { CalendarDays, Plane, Save, Search } from "lucide-react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import FloatingInput from "@/components/floating-input";
import { SuggestionSkeletonList } from "@/Components/Skeletons";
import useEmployeeSearchSuggestions from "../../EmployeeManagement/hooks/useEmployeeSearchSuggestions";

const today = () => new Date().toISOString().slice(0, 10);

const AddTravelOrderDialog = ({ open, onClose, onSaved }) => {
    const [employeeSearch, setEmployeeSearch] = useState("");
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [startDate, setStartDate] = useState(today());
    const [endDate, setEndDate] = useState(today());
    const [processing, setProcessing] = useState(false);
    const {
        searchBoxRef,
        setShowSuggestions,
        showSuggestions,
        suggestionMatches,
        suggestionsLoading,
    } = useEmployeeSearchSuggestions({
        enabled: Boolean(employeeSearch.trim()) && !selectedEmployee,
        query: employeeSearch,
    });

    useEffect(() => {
        if (!open) {
            setEmployeeSearch("");
            setSelectedEmployee(null);
            setStartDate(today());
            setEndDate(today());
            setProcessing(false);
            setShowSuggestions(false);
        }
    }, [open, setShowSuggestions]);

    const selectEmployee = (employee) => {
        setSelectedEmployee(employee);
        setEmployeeSearch(employee.label);
        setShowSuggestions(false);
    };

    const handleEmployeeSearchChange = (event) => {
        setEmployeeSearch(event.target.value);
        setSelectedEmployee(null);
        setShowSuggestions(true);
    };

    const canSubmit =
        selectedEmployee && startDate && endDate && endDate >= startDate;

    const handleSubmit = (event) => {
        event.preventDefault();

        if (!canSubmit || processing) return;

        setProcessing(true);
        router.post(
            "/attendance-management/travel-orders",
            {
                employee_id: selectedEmployee.id,
                start_date: startDate,
                end_date: endDate,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success("Travel order added!");
                    onSaved?.();
                    onClose();
                },
                onError: () => toast.error("Failed to add travel order"),
                onFinish: () => setProcessing(false),
            },
        );
    };

    return (
        <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
            <DialogContent className="max-w-xl overflow-visible rounded-2xl p-0">
                <div className="bg-blue-700 px-5 py-4 text-white">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-white">
                            <Plane className="h-5 w-5" />
                            Add Travel Order
                        </DialogTitle>
                        <DialogDescription className="text-blue-100">
                            Select an employee and the covered travel dates.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 px-5 pb-5 pt-4">
                    <div ref={searchBoxRef} className="relative">
                        <FloatingInput
                            label="Employee Name"
                            icon={Search}
                            name="travel_order_employee"
                            value={employeeSearch}
                            onChange={handleEmployeeSearchChange}
                            onFocus={() => setShowSuggestions(true)}
                        />

                        {showSuggestions && employeeSearch.trim() ? (
                            <div className="absolute right-0 top-full z-50 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
                                <div className="border-b bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Results for "{employeeSearch.trim()}"
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
                                                    selectEmployee(employee)
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
                                                    Select
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

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <FloatingInput
                            label="Start Date"
                            icon={CalendarDays}
                            name="travel_order_start_date"
                            type="date"
                            value={startDate}
                            onChange={(event) => {
                                setStartDate(event.target.value);

                                if (endDate < event.target.value) {
                                    setEndDate(event.target.value);
                                }
                            }}
                        />
                        <FloatingInput
                            label="End Date"
                            icon={CalendarDays}
                            name="travel_order_end_date"
                            type="date"
                            value={endDate}
                            onChange={(event) => setEndDate(event.target.value)}
                        />
                    </div>

                    {endDate && startDate && endDate < startDate ? (
                        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                            End date must be the same as or later than start date.
                        </div>
                    ) : null}

                    <DialogFooter className="gap-2 pt-1">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={processing}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-blue-600 text-white hover:bg-blue-700"
                            disabled={!canSubmit || processing}
                        >
                            <Save className="mr-2 h-4 w-4" />
                            {processing ? "Saving..." : "Save Travel Order"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AddTravelOrderDialog;
