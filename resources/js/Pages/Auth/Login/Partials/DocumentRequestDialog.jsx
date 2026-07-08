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
import { CustomDropdownCheckboxObject } from "@/components/dropdown-menu-main";
import {
    Briefcase,
    Building2,
    CalendarDays,
    ClipboardPlus,
    FileText,
    Hash,
    ShieldCheck,
    User,
    Users,
    Wallet,
    MapPin,
    Mail,
} from "lucide-react";

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

    return (
        <Dialog
            open={Boolean(requestModalType)}
            onOpenChange={(open) => {
                if (!open) {
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
                                        onChange={(value) =>
                                            setData("employee_id", value)
                                        }
                                    />
                                    <RequestTextField
                                        id="request_email"
                                        label="Email Address"
                                        type="email"
                                        icon={Mail}
                                        value={data.email}
                                        error={errors.email}
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
                                        onChange={(value) =>
                                            setData("last_name", value)
                                        }
                                    />
                                    <RequestTextField
                                        id="request_extension_name"
                                        label="Extension Name"
                                        icon={User}
                                        value={data.extension_name}
                                        error={errors.extension_name}
                                        onChange={(value) =>
                                            setData("extension_name", value)
                                        }
                                    />
                                    <RequestTextField
                                        id="request_position"
                                        label="Position / Designation"
                                        icon={Briefcase}
                                        value={data.position}
                                        error={errors.position}
                                        onChange={(value) =>
                                            setData("position", value)
                                        }
                                    />
                                    <RequestDropdownField
                                        label="Permanent Station"
                                        icon={Building2}
                                        error={errors.station_id}
                                        value={selectedStation?.name || ""}
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
                                                    <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm">
                                                        <input
                                                            type="radio"
                                                            name="travel_type"
                                                            value="official_business"
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
                                                    <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm">
                                                        <input
                                                            type="radio"
                                                            name="travel_type"
                                                            value="official_time"
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
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="blue"
                                    disabled={processing}
                                    className="bg-[linear-gradient(135deg,#075fff,#3024df)] font-black"
                                >
                                    {processing
                                        ? "Submitting..."
                                        : "Submit Request"}
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
