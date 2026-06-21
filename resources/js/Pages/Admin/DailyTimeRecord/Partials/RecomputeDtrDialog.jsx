import React, { useEffect, useState } from "react";
import {
    CalendarDays,
    Check,
    ChevronLeft,
    ChevronRight,
    RotateCcw,
} from "lucide-react";
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
import { cn } from "@/lib/utils";

const monthStartDate = (month, year) =>
    `${year}-${String(month).padStart(2, "0")}-01`;

const monthEndDate = (month, year) => {
    const lastDay = new Date(Number(year), Number(month), 0);
    const formattedMonth = String(lastDay.getMonth() + 1).padStart(2, "0");
    const formattedDay = String(lastDay.getDate()).padStart(2, "0");

    return `${lastDay.getFullYear()}-${formattedMonth}-${formattedDay}`;
};

const monthFormatter = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
});

const formatInputDate = (value) => {
    const [year, month, day] = String(value).split("-");

    return `${month}/${day}/${year}`;
};

const dateValue = (date) => {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${date.getFullYear()}-${month}-${day}`;
};

const parseDateValue = (value) => {
    const [year, month, day] = String(value).split("-").map(Number);

    return new Date(year, month - 1, day);
};

const sameDay = (first, second) =>
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate();

const buildCalendarDays = (viewDate) => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const gridStart = new Date(year, month, 1 - firstDay.getDay());

    return Array.from({ length: 42 }, (_, index) => {
        const day = new Date(gridStart);
        day.setDate(gridStart.getDate() + index);

        return day;
    });
};

const CalendarPopup = ({ value, max, onChange }) => {
    const selectedDate = parseDateValue(value);
    const maxDate = parseDateValue(max);
    const [viewDate, setViewDate] = useState(selectedDate);
    const calendarDays = buildCalendarDays(viewDate);

    useEffect(() => {
        setViewDate(parseDateValue(value));
    }, [value]);

    const moveMonth = (amount) => {
        setViewDate(
            (current) =>
                new Date(current.getFullYear(), current.getMonth() + amount, 1),
        );
    };

    const nextMonth = new Date(
        viewDate.getFullYear(),
        viewDate.getMonth() + 1,
        1,
    );
    const canMoveNext = nextMonth <= new Date(
        maxDate.getFullYear(),
        maxDate.getMonth(),
        1,
    );

    return (
        <div className="absolute right-0 top-full z-50 mt-2 w-[320px] rounded-2xl border border-slate-200 bg-white px-4 pb-4 pt-3 shadow-2xl">
            <div>
                <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="text-lg font-bold text-slate-800">
                        {monthFormatter.format(viewDate)}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-700 transition hover:bg-slate-100"
                            onClick={() => moveMonth(-1)}
                            aria-label="Previous month"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                            type="button"
                            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent"
                            disabled={!canMoveNext}
                            onClick={() => moveMonth(1)}
                            aria-label="Next month"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                <div className="mb-2 grid grid-cols-7 text-center text-xs font-bold text-slate-400">
                    {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
                        <div key={`${day}-${index}`}>{day}</div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-y-1 text-center">
                    {calendarDays.map((day) => {
                        const isCurrentMonth =
                            day.getMonth() === viewDate.getMonth();
                        const isSelected = sameDay(day, selectedDate);
                        const isDisabled = day > maxDate;

                        return (
                            <button
                                type="button"
                                key={dateValue(day)}
                                className={cn(
                                    "mx-auto flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition",
                                    isSelected
                                        ? "bg-orange-100 text-slate-900"
                                        : "text-slate-700 hover:bg-blue-50",
                                    !isCurrentMonth && "text-slate-300",
                                    isDisabled &&
                                        "cursor-not-allowed text-slate-200 hover:bg-transparent",
                                )}
                                disabled={isDisabled}
                                onClick={() => onChange(dateValue(day))}
                            >
                                {day.getDate()}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
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
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const to = monthEndDate(selectedMonth, selectedYear);
    const isOpen = Boolean(employee);

    useEffect(() => {
        if (!isOpen) return;

        setMode("month");
        setFrom(monthStartDate(selectedMonth, selectedYear));
        setIsDatePickerOpen(false);
    }, [isOpen, selectedMonth, selectedYear]);

    const selectMonth = () => {
        setMode("month");
        setFrom(monthStartDate(selectedMonth, selectedYear));
        setIsDatePickerOpen(false);
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
            <DialogContent className="max-w-md overflow-visible rounded-2xl p-0">
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
                            <div className="relative">
                                <Input
                                    readOnly
                                    value={formatInputDate(from)}
                                    className="pr-11"
                                />
                                <button
                                    type="button"
                                    className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
                                    onClick={() =>
                                        setIsDatePickerOpen((open) => !open)
                                    }
                                    aria-label="Open date picker"
                                >
                                    <CalendarDays className="h-4 w-4" />
                                </button>
                                {isDatePickerOpen ? (
                                    <CalendarPopup
                                        value={from}
                                        max={to}
                                        onChange={(value) => {
                                            setFrom(value);
                                            setIsDatePickerOpen(false);
                                        }}
                                    />
                                ) : null}
                            </div>
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

