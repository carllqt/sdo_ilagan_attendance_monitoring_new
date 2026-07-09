import InputError from "@/Components/InputError";
import { Button } from "@/Components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/Components/ui/dialog";
import {
    CustomDropdownCheckbox,
    CustomDropdownCheckboxObject,
} from "@/components/dropdown-menu-main";
import { extensionNameOptions } from "@/Pages/Admin/EmployeeManagement/utils";
import {
    Briefcase,
    Building2,
    CalendarDays,
    ClipboardPlus,
    FileText,
    Hash,
    Loader2,
    ShieldCheck,
    User,
    Users,
    Wallet,
    MapPin,
    Mail,
} from "lucide-react";
import { useEffect, useState } from "react";

import { RequestDropdownField, RequestTextField } from "./RequestFields";

const DocumentRequestDialog = ({
    requestModalType,
    requestLabel,
    RequestTypeIcon,
    isLocatorSlip,
    stationItems,
    selectedStation,
    documentRequestForm,
}) => {
    const { data, setData, processing, errors, close, submit } =
        documentRequestForm;
    const [progressValue, setProgressValue] = useState(0);

    useEffect(() => {
        if (!processing) {
            setProgressValue(0);
            return;
        }

        setProgressValue(12);

        const timer = window.setInterval(() => {
            setProgressValue((current) => {
                if (current >= 92) {
                    return current;
                }

                const nextStep = current < 42 ? 9 : current < 72 ? 6 : 3;

                return Math.min(current + nextStep, 92);
            });
        }, 260);

        return () => window.clearInterval(timer);
    }, [processing]);

    return (
        <Dialog
            open={Boolean(requestModalType)}
            onOpenChange={(open) => {
                if (!open && !processing) {
                    close();
                }
            }}
        >
            <DialogContent className="max-h-[92vh] w-[calc(100%-1rem)] max-w-4xl overflow-y-auto border-0 p-0 shadow-2xl">
                <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-white">
                    <div className="absolute inset-x-0 top-0 h-24 bg-blue-700" />

                    <div className="relative px-5 py-4 sm:px-6 sm:py-5">
                        <DialogHeader className="mb-10 text-white">
                            <div className="flex items-start gap-4">
                                <div className="flex h-11 w-11 items-center justify-center rounded-3xl bg-white/15 backdrop-blur">
                                    <RequestTypeIcon className="h-6 w-6" />
                                </div>
                                <div>
                                    <DialogTitle className="text-xl font-black text-white">
                                        {requestLabel.title}
                                    </DialogTitle>
                                    <DialogDescription className="max-w-2xl text-sm text-blue-100">
                                        {requestLabel.description}
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>

                        <form onSubmit={submit} className="space-y-5">
                            {processing && (
                                <div className="overflow-hidden rounded-2xl border border-blue-200 bg-blue-50 shadow-sm">
                                    <div className="flex items-center gap-3 px-4 py-3 text-blue-900">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-sm">
                                            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-bold">
                                                Sending request email...
                                            </p>
                                            <p className="text-xs text-blue-700">
                                                Please wait while we submit your{" "}
                                                {requestLabel.title.toLowerCase()}{" "}
                                                and notify the approver.
                                            </p>
                                        </div>
                                        <div className="text-sm font-bold text-blue-700">
                                            {progressValue}%
                                        </div>
                                    </div>
                                    <div className="h-2 w-full bg-blue-100">
                                        <div
                                            className="h-full rounded-r-full bg-[linear-gradient(90deg,#2563eb,#38bdf8)] transition-[width] duration-300 ease-out"
                                            style={{
                                                width: `${progressValue}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                                <div className="mb-4 flex items-center justify-between gap-4">
                                    <div>
                                        <h3 className="text-base font-semibold text-slate-800">
                                            Requester Details
                                        </h3>
                                        <p className="text-sm text-slate-500">
                                            Tell us who is filing this request
                                            and which station should receive it.
                                        </p>
                                    </div>
                                    <div className="hidden items-center gap-2 rounded-2xl bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 sm:inline-flex">
                                        <ShieldCheck className="h-4 w-4" />
                                        Public Request
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <RequestTextField
                                        id="request_employee_id"
                                        label="Employee ID"
                                        icon={Hash}
                                        value={data.employee_id}
                                        error={errors.employee_id}
                                        disabled={processing}
                                        onChange={(value) =>
                                            setData(
                                                "employee_id",
                                                String(value).replace(
                                                    /[^0-9]/g,
                                                    "",
                                                ),
                                            )
                                        }
                                    />
                                    <RequestTextField
                                        id="request_email"
                                        label="Email Address"
                                        type="email"
                                        icon={Mail}
                                        value={data.email}
                                        error={errors.email}
                                        disabled={processing}
                                        onChange={(value) =>
                                            setData("email", value)
                                        }
                                    />
                                    <RequestTextField
                                        id="request_first_name"
                                        label="First Name"
                                        icon={User}
                                        value={data.first_name}
                                        error={errors.first_name}
                                        disabled={processing}
                                        onChange={(value) =>
                                            setData("first_name", value)
                                        }
                                    />
                                    <RequestTextField
                                        id="request_middle_name"
                                        label="Middle Name"
                                        icon={User}
                                        value={data.middle_name}
                                        error={errors.middle_name}
                                        disabled={processing}
                                        onChange={(value) =>
                                            setData("middle_name", value)
                                        }
                                    />
                                    <RequestTextField
                                        id="request_last_name"
                                        label="Last Name"
                                        icon={User}
                                        value={data.last_name}
                                        error={errors.last_name}
                                        disabled={processing}
                                        onChange={(value) =>
                                            setData("last_name", value)
                                        }
                                    />
                                    <RequestDropdownField
                                        label="Extension Name"
                                        icon={User}
                                        value={data.extension_name || "None"}
                                        error={errors.extension_name}
                                        disabled={processing}
                                    >
                                        <CustomDropdownCheckbox
                                            label="Select Extension"
                                            items={extensionNameOptions}
                                            selected={
                                                data.extension_name || "None"
                                            }
                                            onChange={(value) =>
                                                setData(
                                                    "extension_name",
                                                    value === "None"
                                                        ? ""
                                                        : value,
                                                )
                                            }
                                            buttonVariant="white"
                                            iconOnly
                                            disabled={processing}
                                        />
                                    </RequestDropdownField>
                                    <RequestTextField
                                        id="request_position"
                                        label="Position / Designation"
                                        icon={Briefcase}
                                        value={data.position}
                                        error={errors.position}
                                        disabled={processing}
                                        onChange={(value) =>
                                            setData("position", value)
                                        }
                                    />
                                    <RequestDropdownField
                                        label="Permanent Station"
                                        icon={Building2}
                                        error={errors.station_id}
                                        value={selectedStation?.name || ""}
                                        disabled={processing}
                                    >
                                        <CustomDropdownCheckboxObject
                                            label="Select Station"
                                            items={stationItems}
                                            selected={data.station_id}
                                            buttonLabel={
                                                selectedStation?.name ||
                                                "Select Station"
                                            }
                                            onChange={(stationId) =>
                                                setData("station_id", stationId)
                                            }
                                            buttonVariant="white"
                                            iconOnly
                                            disabled={processing}
                                        />
                                    </RequestDropdownField>
                                </div>
                            </div>

                            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                                <div className="mb-4 flex items-center gap-3">
                                    <div className="rounded-2xl bg-blue-100 p-2 text-blue-700">
                                        <ClipboardPlus className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-semibold text-slate-800">
                                            {isLocatorSlip
                                                ? "Travel Details"
                                                : "Travel Order Details"}
                                        </h3>
                                        <p className="text-sm text-slate-500">
                                            {isLocatorSlip
                                                ? "Add the destination, schedule, and travel type for this slip."
                                                : "Complete the official travel details before submitting the request."}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <RequestTextField
                                        id="request_purpose_of_travel"
                                        label="Purpose of Travel"
                                        icon={FileText}
                                        value={data.purpose_of_travel}
                                        error={errors.purpose_of_travel}
                                        disabled={processing}
                                        onChange={(value) =>
                                            setData("purpose_of_travel", value)
                                        }
                                    />

                                    {isLocatorSlip ? (
                                        <>
                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                <RequestTextField
                                                    id="request_destination"
                                                    label="Destination"
                                                    icon={MapPin}
                                                    value={data.destination}
                                                    error={errors.destination}
                                                    disabled={processing}
                                                    onChange={(value) =>
                                                        setData(
                                                            "destination",
                                                            value,
                                                        )
                                                    }
                                                />
                                                <RequestTextField
                                                    id="request_travel_datetime"
                                                    label="Date and Time"
                                                    type="datetime-local"
                                                    icon={CalendarDays}
                                                    value={data.travel_datetime}
                                                    error={
                                                        errors.travel_datetime
                                                    }
                                                    disabled={processing}
                                                    onChange={(value) =>
                                                        setData(
                                                            "travel_datetime",
                                                            value,
                                                        )
                                                    }
                                                />
                                            </div>

                                            <div>
                                                <p className="text-sm font-bold text-slate-800">
                                                    Travel Type
                                                </p>
                                                <div className="mt-2 grid gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:grid-cols-2">
                                                    <label
                                                        className={`flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm ${
                                                            processing
                                                                ? "cursor-not-allowed opacity-60"
                                                                : "cursor-pointer"
                                                        }`}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name="travel_type"
                                                            value="official_business"
                                                            disabled={
                                                                processing
                                                            }
                                                            checked={
                                                                data.travel_type ===
                                                                "official_business"
                                                            }
                                                            onChange={(e) =>
                                                                setData(
                                                                    "travel_type",
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                        />
                                                        Official Business
                                                    </label>
                                                    <label
                                                        className={`flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm ${
                                                            processing
                                                                ? "cursor-not-allowed opacity-60"
                                                                : "cursor-pointer"
                                                        }`}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name="travel_type"
                                                            value="official_time"
                                                            disabled={
                                                                processing
                                                            }
                                                            checked={
                                                                data.travel_type ===
                                                                "official_time"
                                                            }
                                                            onChange={(e) =>
                                                                setData(
                                                                    "travel_type",
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                        />
                                                        Official Time
                                                    </label>
                                                </div>
                                                <InputError
                                                    message={errors.travel_type}
                                                    className="mt-2"
                                                />
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                <RequestTextField
                                                    id="request_destination"
                                                    label="Destination"
                                                    icon={MapPin}
                                                    value={data.destination}
                                                    error={errors.destination}
                                                    disabled={processing}
                                                    onChange={(value) =>
                                                        setData(
                                                            "destination",
                                                            value,
                                                        )
                                                    }
                                                />
                                                <RequestTextField
                                                    id="request_host_of_activity"
                                                    label="Host of Activity"
                                                    icon={Users}
                                                    value={
                                                        data.host_of_activity
                                                    }
                                                    error={
                                                        errors.host_of_activity
                                                    }
                                                    disabled={processing}
                                                    onChange={(value) =>
                                                        setData(
                                                            "host_of_activity",
                                                            value,
                                                        )
                                                    }
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                <RequestTextField
                                                    id="request_inclusive_dates"
                                                    label="Inclusive Dates"
                                                    type="date"
                                                    icon={CalendarDays}
                                                    value={data.inclusive_dates}
                                                    error={
                                                        errors.inclusive_dates
                                                    }
                                                    disabled={processing}
                                                    onChange={(value) =>
                                                        setData(
                                                            "inclusive_dates",
                                                            value,
                                                        )
                                                    }
                                                />
                                                <RequestTextField
                                                    id="request_fund_source"
                                                    label="Fund Source"
                                                    icon={Wallet}
                                                    value={data.fund_source}
                                                    error={errors.fund_source}
                                                    disabled={processing}
                                                    onChange={(value) =>
                                                        setData(
                                                            "fund_source",
                                                            value,
                                                        )
                                                    }
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            <DialogFooter className="gap-2 border-t border-slate-200 pt-4 sm:space-x-0">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={close}
                                    disabled={processing}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="blue"
                                    disabled={processing}
                                    className="bg-[linear-gradient(135deg,#075fff,#3024df)] font-black"
                                >
                                    {processing ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Sending Email...
                                        </>
                                    ) : (
                                        "Submit Request"
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default DocumentRequestDialog;
