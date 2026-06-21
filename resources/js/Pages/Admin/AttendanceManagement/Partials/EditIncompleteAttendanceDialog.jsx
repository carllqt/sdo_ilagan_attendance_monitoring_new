import React, { useEffect, useMemo, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogDescription,
    DialogClose,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogAction,
    AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import FloatingInput from "@/components/floating-input";
import { router } from "@inertiajs/react";
import { toast } from "sonner";
import { getEmployeeName } from "@/lib/utils";
import { CalendarClock, Clock3, Save } from "lucide-react";

const timeFields = [
    { key: "amTimeIn", label: "AM Time In" },
    { key: "amTimeOut", label: "AM Time Out" },
    { key: "pmTimeIn", label: "PM Time In" },
    { key: "pmTimeOut", label: "PM Time Out" },
];

const timeHours = Array.from({ length: 12 }, (_, index) =>
    String(index + 1).padStart(2, "0"),
);
const timeMinutes = Array.from({ length: 60 }, (_, index) =>
    String(index).padStart(2, "0"),
);
const timePeriods = ["AM", "PM"];

const parseTimeValue = (value = "08:00") => {
    const [hourValue = "08", minuteValue = "00"] = value.split(":");
    const hour24 = Number(hourValue);
    const period = hour24 >= 12 ? "PM" : "AM";
    const hour12 = hour24 % 12 || 12;

    return {
        hour: String(hour12).padStart(2, "0"),
        minute: String(Number(minuteValue) || 0).padStart(2, "0"),
        period,
    };
};

const toTimeValue = ({ hour, minute, period }) => {
    let hour24 = Number(hour);

    if (period === "AM" && hour24 === 12) {
        hour24 = 0;
    }

    if (period === "PM" && hour24 !== 12) {
        hour24 += 12;
    }

    return `${String(hour24).padStart(2, "0")}:${minute}`;
};

const formatTimeDisplay = (value) => {
    const time = parseTimeValue(value);

    return `${time.hour}:${time.minute} ${time.period}`;
};

const parseManualTimeInput = (value) => {
    const match = String(value)
        .trim()
        .match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);

    if (!match) return null;

    const [, hourValue, minuteValue, periodValue] = match;
    const hour = Number(hourValue);
    const minute = Number(minuteValue);

    if (minute < 0 || minute > 59) return null;

    if (periodValue) {
        if (hour < 1 || hour > 12) return null;

        return toTimeValue({
            hour: String(hour).padStart(2, "0"),
            minute: String(minute).padStart(2, "0"),
            period: periodValue.toUpperCase(),
        });
    }

    if (hour < 0 || hour > 23) return null;

    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
};

const getTimeDrafts = ({ amTimeIn, amTimeOut, pmTimeIn, pmTimeOut }) => ({
    amTimeIn: formatTimeDisplay(amTimeIn),
    amTimeOut: formatTimeDisplay(amTimeOut),
    pmTimeIn: formatTimeDisplay(pmTimeIn),
    pmTimeOut: formatTimeDisplay(pmTimeOut),
});

const TimePickerPopup = ({ value, onChange }) => {
    const selected = parseTimeValue(value);

    const selectPart = (part, nextValue) => {
        onChange(
            toTimeValue({
                ...selected,
                [part]: nextValue,
            }),
        );
    };

    const renderButton = (part, option) => {
        const isSelected = selected[part] === option;

        return (
            <button
                key={option}
                type="button"
                className={`h-8 w-full rounded-md text-sm font-semibold transition ${
                    isSelected
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                }`}
                onClick={() => selectPart(part, option)}
            >
                {option}
            </button>
        );
    };

    return (
        <div className="absolute right-0 top-full z-50 mt-2 w-52 rounded-xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-300/50">
            <div className="grid grid-cols-[1fr_1fr_0.8fr] gap-1">
                <div className="max-h-56 space-y-1 overflow-y-auto pr-1">
                    {timeHours.map((hour) => renderButton("hour", hour))}
                </div>
                <div className="max-h-56 space-y-1 overflow-y-auto pr-1">
                    {timeMinutes.map((minute) =>
                        renderButton("minute", minute),
                    )}
                </div>
                <div className="space-y-1">
                    {timePeriods.map((period) =>
                        renderButton("period", period),
                    )}
                </div>
            </div>
        </div>
    );
};

const EditIncompleteAttendanceDialog = ({
    attendance,
    setAttendance,
    editOpen,
    setEditOpen,
}) => {
    const employeeName = useMemo(
        () => getEmployeeName(attendance?.employee) || "Employee",
        [attendance?.employee],
    );

    const [amTimeIn, setAmTimeIn] = useState(
        attendance?.am?.am_time_in || "08:00",
    );
    const [amTimeOut, setAmTimeOut] = useState(
        attendance?.am?.am_time_out || "12:00",
    );
    const [pmTimeIn, setPmTimeIn] = useState(
        attendance?.pm?.pm_time_in || "13:00",
    );
    const [pmTimeOut, setPmTimeOut] = useState(
        attendance?.pm?.pm_time_out || "17:00",
    );
    const [timeDrafts, setTimeDrafts] = useState(() =>
        getTimeDrafts({
            amTimeIn: attendance?.am?.am_time_in || "08:00",
            amTimeOut: attendance?.am?.am_time_out || "12:00",
            pmTimeIn: attendance?.pm?.pm_time_in || "13:00",
            pmTimeOut: attendance?.pm?.pm_time_out || "17:00",
        }),
    );
    const [openTimeField, setOpenTimeField] = useState(null);

    useEffect(() => {
        const nextTimes = {
            amTimeIn: attendance?.am?.am_time_in || "08:00",
            amTimeOut: attendance?.am?.am_time_out || "12:00",
            pmTimeIn: attendance?.pm?.pm_time_in || "13:00",
            pmTimeOut: attendance?.pm?.pm_time_out || "17:00",
        };

        setAmTimeIn(nextTimes.amTimeIn);
        setAmTimeOut(nextTimes.amTimeOut);
        setPmTimeIn(nextTimes.pmTimeIn);
        setPmTimeOut(nextTimes.pmTimeOut);
        setTimeDrafts(getTimeDrafts(nextTimes));
        setOpenTimeField(null);
    }, [attendance]);

    if (!attendance) {
        return null;
    }

    // Determine if there's any input to update
    const isDisabled =
        (!amTimeIn || attendance.am?.am_time_in) &&
        (!amTimeOut || attendance.am?.am_time_out) &&
        (!pmTimeIn || attendance.pm?.pm_time_in) &&
        (!pmTimeOut || attendance.pm?.pm_time_out);

    const handleOpenChange = (nextOpen) => {
        if (!nextOpen) {
            setOpenTimeField(null);
        }

        setEditOpen(nextOpen);
    };

    const closeDialog = () => {
        setOpenTimeField(null);
        setEditOpen(false);
    };

    const fieldValues = {
        amTimeIn,
        amTimeOut,
        pmTimeIn,
        pmTimeOut,
    };

    const fieldSetters = {
        amTimeIn: setAmTimeIn,
        amTimeOut: setAmTimeOut,
        pmTimeIn: setPmTimeIn,
        pmTimeOut: setPmTimeOut,
    };

    const fieldDisabled = {
        amTimeIn: !!attendance.am?.am_time_in,
        amTimeOut: !!attendance.am?.am_time_out,
        pmTimeIn: !!attendance.pm?.pm_time_in,
        pmTimeOut: !!attendance.pm?.pm_time_out,
    };

    const toggleTimePicker = (fieldKey) => {
        if (fieldDisabled[fieldKey]) return;

        setOpenTimeField((currentField) =>
            currentField === fieldKey ? null : fieldKey,
        );
    };

    const handleManualTimeChange = (fieldKey, value) => {
        setOpenTimeField(null);
        setTimeDrafts((currentDrafts) => ({
            ...currentDrafts,
            [fieldKey]: value,
        }));

        const parsedTime = parseManualTimeInput(value);

        if (parsedTime) {
            fieldSetters[fieldKey](parsedTime);
        }
    };

    const handleManualTimeBlur = (fieldKey) => {
        const parsedTime = parseManualTimeInput(timeDrafts[fieldKey]);
        const nextValue = parsedTime || fieldValues[fieldKey];

        if (parsedTime) {
            fieldSetters[fieldKey](parsedTime);
        }

        setTimeDrafts((currentDrafts) => ({
            ...currentDrafts,
            [fieldKey]: formatTimeDisplay(nextValue),
        }));
    };

    const handlePickerTimeChange = (fieldKey, value) => {
        fieldSetters[fieldKey](value);
        setTimeDrafts((currentDrafts) => ({
            ...currentDrafts,
            [fieldKey]: formatTimeDisplay(value),
        }));
    };

    const handleSubmit = () => {
        const payload = {};

        if (attendance.id) {
            // Updating existing attendance
            if (!attendance.am?.am_time_in && amTimeIn)
                payload.am_time_in = amTimeIn;
            if (!attendance.am?.am_time_out && amTimeOut)
                payload.am_time_out = amTimeOut;
            if (!attendance.pm?.pm_time_in && pmTimeIn)
                payload.pm_time_in = pmTimeIn;
            if (!attendance.pm?.pm_time_out && pmTimeOut)
                payload.pm_time_out = pmTimeOut;

            router.post(
                route("attendance-management.update", attendance.id),
                payload,
                {
                    onSuccess: () => {
                        toast.success("Attendance updated!");
                        setAttendance(null);
                        closeDialog();
                    },
                    onError: () => toast.error("Failed to update attendance"),
                },
            );
        } else {
            payload.employee_id = attendance.employee_id;
            payload.date = attendance.date;
            payload.am_time_in = amTimeIn;
            payload.am_time_out = amTimeOut;
            payload.pm_time_in = pmTimeIn;
            payload.pm_time_out = pmTimeOut;

            router.post(route("attendance-management.create"), payload, {
                onSuccess: () => {
                    toast.success("Attendance created!");
                    setAttendance(null);
                    closeDialog();
                },
                onError: () => toast.error("Failed to create attendance"),
            });
        }
    };

    return (
        <Dialog open={editOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-xl overflow-visible rounded-2xl p-0">
                <div className="bg-blue-700 px-5 py-4 text-white">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-white">
                            <CalendarClock className="h-5 w-5" />
                            Edit Attendance
                        </DialogTitle>
                        <DialogDescription className="text-blue-100">
                            Update missing attendance times for {employeeName}{" "}
                            on {attendance.date}.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <form className="space-y-4 px-5 pb-5 pt-1">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <div>
                                <h3 className="text-sm font-semibold text-slate-800">
                                    Time Logs
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Fill in the missing attendance entries.
                                </p>
                            </div>
                            <div className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                                {attendance.id ? "Update" : "Create"}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {timeFields.map((field) => (
                                <div
                                    key={field.key}
                                    className={`rounded-2xl border p-3 transition ${
                                        fieldDisabled[field.key]
                                            ? "border-slate-200 bg-slate-50/80 hover:border-slate-300"
                                            : "border-red-200 bg-red-50/80 hover:border-red-300"
                                    }`}
                                >
                                    <div className="mb-3 flex items-center justify-end gap-2">
                                        <span
                                            className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                                                fieldDisabled[field.key]
                                                    ? "bg-slate-100 text-slate-500"
                                                    : "bg-red-100 text-red-700 ring-1 ring-red-200"
                                            }`}
                                        >
                                            {fieldDisabled[field.key]
                                                ? "Locked"
                                                : "Missing"}
                                        </span>
                                    </div>

                                    <div className="relative">
                                        <FloatingInput
                                            type="text"
                                            label={field.label}
                                            name={field.key}
                                            value={
                                                timeDrafts[field.key] ??
                                                formatTimeDisplay(
                                                    fieldValues[field.key],
                                                )
                                            }
                                            onChange={(event) =>
                                                handleManualTimeChange(
                                                    field.key,
                                                    event.target.value,
                                                )
                                            }
                                            onBlur={() =>
                                                handleManualTimeBlur(field.key)
                                            }
                                            disabled={fieldDisabled[field.key]}
                                            inputClassName="pr-9 disabled:!text-slate-700 disabled:!opacity-100"
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-slate-400"
                                            disabled={fieldDisabled[field.key]}
                                            onClick={() =>
                                                toggleTimePicker(field.key)
                                            }
                                            aria-label={`Open ${field.label} picker`}
                                        >
                                            <Clock3 className="h-4 w-4" />
                                        </button>
                                        {openTimeField === field.key && (
                                            <TimePickerPopup
                                                value={fieldValues[field.key]}
                                                onChange={(nextValue) =>
                                                    handlePickerTimeChange(
                                                        field.key,
                                                        nextValue,
                                                    )
                                                }
                                            />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <DialogFooter className="gap-2 pt-1">
                        <DialogClose asChild>
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </DialogClose>

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    type="button"
                                    className="bg-blue-600 text-white hover:bg-blue-700"
                                    disabled={isDisabled}
                                >
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Changes
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="rounded-2xl">
                                <AlertDialogHeader>
                                    <AlertDialogTitle>
                                        Confirm Attendance Update
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Are you sure you want to save these
                                        changes for {employeeName}? Tardiness
                                        will be recalculated after saving.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>
                                        Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleSubmit}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        Confirm
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default EditIncompleteAttendanceDialog;
