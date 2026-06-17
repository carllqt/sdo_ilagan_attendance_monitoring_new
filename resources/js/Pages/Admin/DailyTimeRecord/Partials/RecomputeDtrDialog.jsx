import React, { useEffect, useState } from "react";
import { Check, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const monthStartDate = (month, year) =>
    `${year}-${String(month).padStart(2, "0")}-01`;

const monthEndDate = (month, year) => {
    const lastDay = new Date(Number(year), Number(month), 0);
    const formattedMonth = String(lastDay.getMonth() + 1).padStart(2, "0");
    const formattedDay = String(lastDay.getDate()).padStart(2, "0");

    return `${lastDay.getFullYear()}-${formattedMonth}-${formattedDay}`;
};

const RecomputeDtrDialog = ({
    employee,
    onClose,
    onSubmit,
    selectedMonth,
    selectedYear,
}) => {
    const [mode, setMode] = useState("month");
    const [from, setFrom] = useState(monthStartDate(selectedMonth, selectedYear));
    const to = monthEndDate(selectedMonth, selectedYear);
    const isOpen = Boolean(employee);

    useEffect(() => {
        if (!isOpen) return;

        setMode("month");
        setFrom(monthStartDate(selectedMonth, selectedYear));
    }, [isOpen, selectedMonth, selectedYear]);

    const selectMonth = () => {
        setMode("month");
        setFrom(monthStartDate(selectedMonth, selectedYear));
    };

    const submit = () => {
        onSubmit?.({ from, to });
    };

    const choiceClass = (isSelected) =>
        `rounded-xl border px-4 py-3 text-left transition ${
            isSelected
                ? "border-blue-500 bg-blue-50 text-blue-900"
                : "border-slate-200 bg-white text-slate-700 hover:bg-blue-50"
        }`;

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(nextOpen) => {
                if (!nextOpen) onClose?.();
            }}
        >
            <DialogContent className="max-w-md overflow-hidden rounded-2xl p-0">
                <div className="bg-blue-700 px-5 py-4 text-white">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-white">
                            <RotateCcw className="h-5 w-5" />
                            Recompute DTR
                        </DialogTitle>
                        <DialogDescription className="text-blue-100">
                            Choose what records to recompute for{" "}
                            {employee?.full_name || "this employee"}.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="grid gap-3 px-5 pb-5 pt-4">
                    <div className="grid gap-2">
                        <button
                            type="button"
                            className={choiceClass(mode === "month")}
                            onClick={selectMonth}
                        >
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <div className="text-sm font-semibold">
                                        Selected Month
                                    </div>
                                    <div className="text-xs text-slate-500">
                                        Recompute the full selected month.
                                    </div>
                                </div>
                                {mode === "month" ? (
                                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600">
                                        <Check className="h-3 w-3 text-white" />
                                    </span>
                                ) : null}
                            </div>
                        </button>

                        <button
                            type="button"
                            className={choiceClass(mode === "custom")}
                            onClick={() => setMode("custom")}
                        >
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <div className="text-sm font-semibold">
                                        Custom From
                                    </div>
                                    <div className="text-xs text-slate-500">
                                        Choose the start date manually.
                                    </div>
                                </div>
                                {mode === "custom" ? (
                                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600">
                                        <Check className="h-3 w-3 text-white" />
                                    </span>
                                ) : null}
                            </div>
                        </button>
                    </div>

                    {mode === "custom" ? (
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                From
                            </label>
                            <Input
                                type="date"
                                value={from}
                                max={to}
                                onChange={(event) => setFrom(event.target.value)}
                            />
                        </div>
                    ) : null}

                    <div className="text-xs text-slate-500">
                        Records from {from} to {to} will be recomputed.
                    </div>
                </div>

                <DialogFooter className="px-5 pb-5">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        className="bg-blue-700 text-white hover:bg-blue-800"
                        disabled={!from || to < from}
                        onClick={submit}
                    >
                        Recompute
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default RecomputeDtrDialog;

