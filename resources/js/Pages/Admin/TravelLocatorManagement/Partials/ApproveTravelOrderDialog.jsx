import React, { useEffect, useState } from "react";
import { router } from "@inertiajs/react";
import { CalendarDays, CheckCircle2, MapPin, Search, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import FloatingInput from "@/components/floating-input";
import { SuggestionSkeletonList } from "@/Components/Skeletons";
import useEmployeeSearchSuggestions from "../../EmployeeManagement/hooks/useEmployeeSearchSuggestions";
import { formatDate } from "../util";

const ApproveTravelOrderDialog = ({ onClose, onApproved, request }) => {
    const open = Boolean(request);
    const [employeeSearch, setEmployeeSearch] = useState("");
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [processing, setProcessing] = useState(false);
    const {
        searchBoxRef,
        setShowSuggestions,
        showSuggestions,
        suggestionMatches,
        suggestionsLoading,
    } = useEmployeeSearchSuggestions({
        enabled: open && Boolean(employeeSearch.trim()) && !selectedEmployee,
        query: employeeSearch,
    });

    useEffect(() => {
        if (!open) {
            setEmployeeSearch("");
            setSelectedEmployee(null);
            setProcessing(false);
            setShowSuggestions(false);
            return;
        }

        setEmployeeSearch(request?.employee_name || "");
        setSelectedEmployee(null);
        setProcessing(false);
        setShowSuggestions(Boolean(request?.employee_name));
    }, [open, request, setShowSuggestions]);

    const selectEmployee = (employee) => {
        setSelectedEmployee(employee);
        setEmployeeSearch(employee.label || "");
        setShowSuggestions(false);
    };

    const handleEmployeeSearchChange = (event) => {
        setEmployeeSearch(event.target.value);
        setSelectedEmployee(null);
        setShowSuggestions(true);
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        if (!request?.id || !selectedEmployee || processing) return;

        setProcessing(true);
        router.post(
            route("travel-locator-management.travel-orders.approve", request.id),
            { employee_id: selectedEmployee.id },
            {
                only: ["travel_order_requests", "travel_filters"],
                preserveScroll: true,
                onSuccess: () => {
                    toast.success("Travel order approved!");
                    onApproved?.();
                    onClose();
                },
                onError: () => toast.error("Failed to approve travel order."),
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
                            <UserCheck className="h-5 w-5" />
                            Assign Travel Order
                        </DialogTitle>
                        <DialogDescription className="text-blue-100">
                            Select the employee to approve this travel order.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 px-5 pb-5 pt-4">
                    <div className="grid grid-cols-1 gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 sm:grid-cols-2">
                        <div className="min-w-0">
                            <div className="text-xs font-semibold uppercase text-slate-500">
                                Request Name
                            </div>
                            <div className="truncate font-medium text-slate-900">
                                {request?.employee_name || "-"}
                            </div>
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-1 text-xs font-semibold uppercase text-slate-500">
                                <CalendarDays className="h-3.5 w-3.5" />
                                Travel Date
                            </div>
                            <div className="truncate font-medium text-slate-900">
                                {formatDate(request?.inclusive_dates)}
                            </div>
                        </div>
                        <div className="min-w-0 sm:col-span-2">
                            <div className="flex items-center gap-1 text-xs font-semibold uppercase text-slate-500">
                                <MapPin className="h-3.5 w-3.5" />
                                Destination
                            </div>
                            <div className="truncate font-medium text-slate-900">
                                {request?.destination || "-"}
                            </div>
                        </div>
                    </div>

                    <div ref={searchBoxRef} className="relative">
                        <FloatingInput
                            label="Employee Name"
                            icon={Search}
                            name="approve_travel_order_employee"
                            value={employeeSearch}
                            disabled={processing}
                            onChange={handleEmployeeSearchChange}
                            onFocus={() => setShowSuggestions(true)}
                        />

                        {showSuggestions && employeeSearch.trim() && !processing ? (
                            <div className="absolute right-0 top-full z-50 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
                                <div className="border-b bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Employees matching "{employeeSearch.trim()}"
                                </div>

                                <div className="max-h-72 overflow-y-auto">
                                    {suggestionsLoading ? (
                                        <SuggestionSkeletonList />
                                    ) : suggestionMatches.length > 0 ? (
                                        suggestionMatches.map((employee) => (
                                            <button
                                                key={employee.id}
                                                type="button"
                                                onMouseDown={() => selectEmployee(employee)}
                                                className="flex w-full items-start justify-between gap-3 px-3 py-2 text-left text-sm transition hover:bg-blue-50"
                                            >
                                                <div className="min-w-0">
                                                    <div className="truncate font-medium text-slate-800">
                                                        {employee.label}
                                                    </div>
                                                    <div className="truncate text-xs text-slate-500">
                                                        {employee.meta || "-"}
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
                            disabled={!selectedEmployee || processing}
                        >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            {processing ? "Approving..." : "Approve"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default ApproveTravelOrderDialog;
