import React, { useEffect, useState } from "react";
import { router } from "@inertiajs/react";
import {
    CalendarDays,
    CheckCircle2,
    Hash,
    MapPin,
    Trash2,
    User,
    UserCheck,
} from "lucide-react";
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
import { formatDate } from "../util";

const ApproveTravelOrderDialog = ({ onClose, onApproved, request }) => {
    const open = Boolean(request);
    const [processing, setProcessing] = useState(false);
    const hasEmployeeMatch = Boolean(
        request?.has_employee_match && request?.matched_employee_id,
    );

    useEffect(() => {
        if (!open) {
            setProcessing(false);
            return;
        }

        setProcessing(false);
    }, [open]);

    const handleApprove = (event) => {
        event.preventDefault();

        if (!request?.id || !hasEmployeeMatch || processing) return;

        setProcessing(true);
        router.post(
            route("travel-locator-management.travel-orders.approve", request.id),
            {},
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

    const handleDelete = () => {
        if (!request?.id || processing) return;

        setProcessing(true);
        router.delete(
            route("travel-locator-management.travel-orders.delete", request.id),
            {
                only: ["travel_order_requests", "travel_filters"],
                preserveScroll: true,
                onSuccess: () => {
                    toast.success("Travel order request deleted!");
                    onApproved?.();
                    onClose();
                },
                onError: () =>
                    toast.error("Failed to delete travel order request."),
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
                            Validate the requested employee before approving this travel order.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <form onSubmit={handleApprove} className="space-y-4 px-5 pb-5 pt-4">
                    <div className="grid grid-cols-1 gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 sm:grid-cols-2">
                        <div className="min-w-0">
                            <div className="flex items-center gap-1 text-xs font-semibold uppercase text-slate-500">
                                <Hash className="h-3.5 w-3.5" />
                                Employee Number
                            </div>
                            <div className="truncate font-medium text-slate-900">
                                {request?.employee_id || "-"}
                            </div>
                        </div>
                        <div className="min-w-0">
                            <div className="text-xs font-semibold uppercase text-slate-500">
                                First Name
                            </div>
                            <div className="truncate font-medium text-slate-900">
                                {request?.first_name || "-"}
                            </div>
                        </div>
                        <div className="min-w-0">
                            <div className="text-xs font-semibold uppercase text-slate-500">
                                Middle Name
                            </div>
                            <div className="truncate font-medium text-slate-900">
                                {request?.middle_name || "-"}
                            </div>
                        </div>
                        <div className="min-w-0">
                            <div className="text-xs font-semibold uppercase text-slate-500">
                                Last Name
                            </div>
                            <div className="truncate font-medium text-slate-900">
                                {request?.last_name || "-"}
                            </div>
                        </div>
                        <div className="min-w-0 sm:col-span-2">
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

                    <div
                        className={`rounded-xl border p-4 ${
                            hasEmployeeMatch
                                ? "border-emerald-200 bg-emerald-50"
                                : "border-red-200 bg-red-50"
                        }`}
                    >
                        <div className="flex items-start gap-3">
                            <div
                                className={`mt-0.5 rounded-full p-2 ${
                                    hasEmployeeMatch
                                        ? "bg-emerald-100 text-emerald-700"
                                        : "bg-red-100 text-red-700"
                                }`}
                            >
                                {hasEmployeeMatch ? (
                                    <CheckCircle2 className="h-4 w-4" />
                                ) : (
                                    <User className="h-4 w-4" />
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p
                                    className={`text-sm font-bold ${
                                        hasEmployeeMatch
                                            ? "text-emerald-800"
                                            : "text-red-800"
                                    }`}
                                >
                                    {hasEmployeeMatch
                                        ? "Employee matched"
                                        : "No matching employee found"}
                                </p>
                                <p
                                    className={`mt-1 text-sm ${
                                        hasEmployeeMatch
                                            ? "text-emerald-700"
                                            : "text-red-700"
                                    }`}
                                >
                                    {hasEmployeeMatch
                                        ? "The request employee number, first name, middle name, and last name match an active employee record."
                                        : "The request employee number, first name, middle name, and last name do not match any active employee in the employee table."}
                                </p>
                                {hasEmployeeMatch ? (
                                    <div className="mt-3 rounded-lg border border-emerald-200 bg-white/80 px-3 py-2 text-sm text-emerald-900">
                                        <div className="font-semibold">
                                            {request?.matched_employee_name ||
                                                "-"}
                                        </div>
                                        <div className="text-xs font-medium uppercase text-emerald-700">
                                            Employee No.{" "}
                                            {request?.matched_employee_id || "-"}
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        </div>
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
                            type={hasEmployeeMatch ? "submit" : "button"}
                            onClick={hasEmployeeMatch ? undefined : handleDelete}
                            className={
                                hasEmployeeMatch
                                    ? "bg-blue-600 text-white hover:bg-blue-700"
                                    : "bg-red-600 text-white hover:bg-red-700"
                            }
                            disabled={processing}
                        >
                            {hasEmployeeMatch ? (
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                            ) : (
                                <Trash2 className="mr-2 h-4 w-4" />
                            )}
                            {processing
                                ? hasEmployeeMatch
                                    ? "Approving..."
                                    : "Deleting..."
                                : hasEmployeeMatch
                                  ? "Approve"
                                  : "Delete"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default ApproveTravelOrderDialog;
