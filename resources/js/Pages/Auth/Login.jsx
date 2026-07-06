import InputError from "@/Components/InputError";
import { Button } from "@/Components/ui/button";
import { Checkbox } from "@/Components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/Components/ui/dialog";
import TextInput from "@/Components/TextInput";
import { CustomDropdownCheckboxObject } from "@/components/dropdown-menu-main";
import { Head, Link, useForm } from "@inertiajs/react";
import ApplicationLogo from "@/Components/ApplicationLogo";
import TalaBackground from "@/Components/TalaBackground";
import {
    Briefcase,
    CalendarDays,
    Eye,
    EyeOff,
    FileText,
    Lock,
    LogIn,
    Mail,
    MapPin,
    Plane,
    User,
    Users,
    Wallet,
} from "lucide-react";
import { useState } from "react";

const defaultDocumentRequestData = {
    request_type: "locator_slip",
    employee_name: "",
    email: "",
    position: "",
    station_id: "",
    purpose_of_travel: "",
    destination: "",
    travel_datetime: "",
    travel_type: "",
    host_of_activity: "",
    inclusive_dates: "",
    fund_source: "",
};

const requestLabels = {
    locator_slip: {
        title: "Locator Slip",
        description: "Fill out the details for your locator slip request.",
    },
    travel_order: {
        title: "Travel Order",
        description: "Fill out the details for your travel order request.",
    },
};

const Login = ({ status, canResetPassword, flash = {}, stations = [] }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [requestModalType, setRequestModalType] = useState(null);
    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
        remember: false,
    });
    const {
        data: requestData,
        setData: setRequestData,
        post: postRequest,
        processing: requestProcessing,
        errors: requestErrors,
        reset: resetRequest,
        clearErrors: clearRequestErrors,
    } = useForm(defaultDocumentRequestData);

    const submit = (e) => {
        e.preventDefault();
        post(route("login"), {
            onFinish: () => reset("password"),
        });
    };

    const openDocumentRequest = (type) => {
        clearRequestErrors();
        setRequestData({
            ...defaultDocumentRequestData,
            request_type: type,
            station_id: stations[0]?.id || "",
        });
        setRequestModalType(type);
    };

    const closeDocumentRequest = () => {
        setRequestModalType(null);
        resetRequest();
        clearRequestErrors();
    };

    const submitDocumentRequest = (e) => {
        e.preventDefault();

        postRequest("/document-requests", {
            preserveScroll: true,
            onSuccess: closeDocumentRequest,
        });
    };

    const requestLabel =
        requestLabels[requestModalType] || requestLabels.locator_slip;
    const isLocatorSlip = requestModalType === "locator_slip";
    const stationItems = stations.map((station) => ({
        ...station,
        division: station.code ? { name: station.code } : null,
    }));
    const selectedStation = stationItems.find(
        (station) => Number(station.id) === Number(requestData.station_id),
    );

    return (
        <>
            <Head title="Log in" />

            <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#02062f] px-3 py-5 text-slate-900 sm:px-4 sm:py-8">
                <TalaBackground />

                <div className="relative z-10 grid w-full max-w-[390px] overflow-hidden rounded-[1.45rem] border border-white/20 bg-[linear-gradient(135deg,rgba(7,15,76,0.34),rgba(58,55,170,0.20))] shadow-[0_0_28px_rgba(167,139,250,0.18),0_24px_80px_rgba(2,6,47,0.48),inset_0_1px_0_rgba(255,255,255,0.18)] ring-1 ring-violet-200/10 backdrop-blur-[2px] sm:rounded-[1.7rem] lg:max-w-[1040px] lg:grid-cols-2">
                    <div className="relative hidden min-h-[590px] overflow-hidden border-r border-white/20 bg-[linear-gradient(135deg,rgba(8,17,86,0.42),rgba(48,47,161,0.24))] px-10 py-14 text-center text-white shadow-[0_0_22px_rgba(167,139,250,0.14),0_18px_48px_rgba(2,6,47,0.24),inset_0_1px_0_rgba(255,255,255,0.13)] ring-1 ring-violet-200/10 backdrop-blur-[2px] lg:flex lg:flex-col lg:items-center lg:justify-center">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_0%,rgba(255,255,255,0.08),transparent_31%),radial-gradient(circle_at_86%_94%,rgba(167,139,250,0.12),transparent_38%)]" />
                        <div className="absolute -left-10 top-0 h-44 w-2/3 rounded-full bg-white/[0.05] blur-3xl" />
                        <div className="absolute inset-0 bg-[linear-gradient(140deg,rgba(2,7,48,0.52),rgba(12,17,94,0.38)_45%,rgba(57,24,136,0.32))]" />
                        <svg
                            className="pointer-events-none absolute left-0 top-0 h-64 w-80 text-white/20"
                            viewBox="0 0 320 256"
                            fill="none"
                            aria-hidden="true"
                        >
                            <defs>
                                <pattern
                                    id="leftPanelDots"
                                    width="13"
                                    height="13"
                                    patternUnits="userSpaceOnUse"
                                >
                                    <circle
                                        cx="2"
                                        cy="2"
                                        r="1.35"
                                        fill="rgba(255,255,255,0.22)"
                                    />
                                </pattern>
                                <clipPath id="leftDotTriangle">
                                    <path d="M34 38H250L34 195Z" />
                                </clipPath>
                            </defs>
                            <rect
                                x="28"
                                y="34"
                                width="230"
                                height="170"
                                fill="url(#leftPanelDots)"
                                clipPath="url(#leftDotTriangle)"
                            />
                        </svg>
                        <div className="relative z-10 flex -translate-y-6 flex-col items-center">
                            <img
                                src="/img/olddepedlogo.png"
                                alt="DepEd Logo"
                                className="mb-10 w-64 object-contain drop-shadow-[0_12px_22px_rgba(5,10,70,0.2)]"
                            />

                            <h1 className="text-4xl font-black tracking-tight">
                                Project TALA
                            </h1>
                            <p className="mt-5 max-w-sm text-lg font-medium leading-relaxed text-white/95">
                                Time and Attendance Logging System with
                                Automated Tardiness Computation
                            </p>
                            <div className="mt-8 h-1 w-36 rounded-full bg-[linear-gradient(90deg,transparent,#4de8ff,#f472ff,transparent)] shadow-[0_0_22px_rgba(216,180,254,0.85)]" />

                            <div className="mt-9 grid w-full max-w-sm grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() =>
                                        openDocumentRequest("locator_slip")
                                    }
                                    className="flex h-11 items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 text-sm font-bold text-white shadow-[0_8px_20px_rgba(5,10,70,0.16)] backdrop-blur-md transition hover:bg-white/15"
                                >
                                    <FileText className="h-4 w-4" />
                                    Locator Slip
                                </button>
                                <button
                                    type="button"
                                    onClick={() =>
                                        openDocumentRequest("travel_order")
                                    }
                                    className="flex h-11 items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 text-sm font-bold text-white shadow-[0_8px_20px_rgba(5,10,70,0.16)] backdrop-blur-md transition hover:bg-white/15"
                                >
                                    <Plane className="h-4 w-4" />
                                    Travel Order
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="relative flex min-h-0 flex-col items-center justify-center bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(247,249,255,0.92))] p-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.86)] backdrop-blur-md lg:min-h-[590px] lg:px-14 lg:py-12">
                        <svg
                            className="pointer-events-none absolute right-6 top-7 hidden h-28 w-32 text-indigo-300/35 sm:block"
                            viewBox="0 0 128 112"
                            fill="none"
                            aria-hidden="true"
                        >
                            <defs>
                                <pattern
                                    id="rightPanelDots"
                                    width="13"
                                    height="13"
                                    patternUnits="userSpaceOnUse"
                                >
                                    <circle
                                        cx="2"
                                        cy="2"
                                        r="1.35"
                                        fill="rgba(99,102,241,0.34)"
                                    />
                                </pattern>
                                <clipPath id="rightDotTriangle">
                                    <path d="M30 0H128V92Z" />
                                </clipPath>
                            </defs>
                            <rect
                                width="128"
                                height="112"
                                fill="url(#rightPanelDots)"
                                clipPath="url(#rightDotTriangle)"
                            />
                        </svg>

                        <div className="relative z-10 w-full max-w-[390px]">
                            <div className="relative overflow-hidden border-b border-white/20 bg-[linear-gradient(140deg,#020730_0%,#0c115e_48%,#391888_100%)] p-5 text-center text-white shadow-[0_0_22px_rgba(167,139,250,0.14),inset_0_1px_0_rgba(255,255,255,0.13)] ring-1 ring-violet-200/10 lg:hidden">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_0%,rgba(255,255,255,0.10),transparent_31%),radial-gradient(circle_at_86%_94%,rgba(167,139,250,0.14),transparent_38%)]" />
                                <div className="absolute -left-8 top-0 h-32 w-2/3 rounded-full bg-white/[0.06] blur-3xl" />
                                <img
                                    src="/img/olddepedlogo.png"
                                    alt="DepEd Logo"
                                    className="relative z-10 mx-auto mb-4 w-36 object-contain drop-shadow-[0_10px_18px_rgba(5,10,70,0.22)]"
                                />
                                <h1 className="relative z-10 text-2xl font-black tracking-tight">
                                    Project TALA
                                </h1>
                                <p className="relative z-10 mx-auto mt-2 max-w-xs text-sm font-medium leading-relaxed text-white/90">
                                    Time and Attendance Logging System with
                                    Automated Tardiness Computation
                                </p>
                                <div className="relative z-10 mx-auto mt-4 h-1 w-28 rounded-full bg-[linear-gradient(90deg,transparent,#4de8ff,#f472ff,transparent)] shadow-[0_0_18px_rgba(216,180,254,0.78)]" />
                                <div className="relative z-10 mt-5 grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            openDocumentRequest("locator_slip")
                                        }
                                        className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-white/25 bg-white/10 px-2 text-xs font-bold text-white backdrop-blur-md transition hover:bg-white/15"
                                    >
                                        <FileText className="h-3.5 w-3.5" />
                                        Locator Slip
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            openDocumentRequest("travel_order")
                                        }
                                        className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-white/25 bg-white/10 px-2 text-xs font-bold text-white backdrop-blur-md transition hover:bg-white/15"
                                    >
                                        <Plane className="h-3.5 w-3.5" />
                                        Travel Order
                                    </button>
                                </div>
                            </div>

                            <div className="bg-transparent px-4 py-6 sm:px-6 lg:p-0">
                            <div className="mb-6 text-center sm:mb-8">
                                <ApplicationLogo className="mx-auto h-16 w-auto object-contain sm:h-20" />
                                <h2 className="mt-4 text-xl font-black text-slate-900 sm:mt-6 sm:text-2xl">
                                    Welcome Back! {"\uD83D\uDC4B"}
                                </h2>
                                <p className="mt-2 text-sm font-medium text-slate-500">
                                    Sign in to continue to your account
                                </p>
                            </div>

                            {status && (
                                <div className="mb-5 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-center text-sm font-medium text-emerald-700">
                                    {status}
                                </div>
                            )}
                            {flash.success && (
                                <div className="mb-5 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-center text-sm font-medium text-emerald-700">
                                    {flash.success}
                                </div>
                            )}
                            {flash.error && (
                                <div className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-700">
                                    {flash.error}
                                </div>
                            )}

                            <form onSubmit={submit} className="space-y-4 sm:space-y-5">
                                <div>
                                    <label
                                        htmlFor="email"
                                        className="text-sm font-bold text-slate-800"
                                    >
                                        Email Address
                                    </label>
                                    <div className="relative mt-2">
                                        <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                                        <TextInput
                                            id="email"
                                            type="text"
                                            name="email"
                                            value={data.email}
                                            className="block h-11 w-full rounded-lg border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm font-medium text-slate-700 shadow-sm placeholder:text-slate-400 focus:border-[#1f55ff] focus:ring-4 focus:ring-blue-100 sm:h-12 sm:pl-12"
                                            placeholder="Enter your email"
                                            autoComplete="username"
                                            isFocused={true}
                                            onChange={(e) =>
                                                setData("email", e.target.value)
                                            }
                                        />
                                    </div>
                                    <InputError
                                        message={errors.email}
                                        className="mt-2"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="password"
                                        className="text-sm font-bold text-slate-800"
                                    >
                                        Password
                                    </label>
                                    <div className="relative mt-2">
                                        <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                                        <TextInput
                                            id="password"
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            name="password"
                                            value={data.password}
                                            className="block h-11 w-full rounded-lg border border-slate-300 bg-white py-3 pl-11 pr-12 text-sm font-medium text-slate-700 shadow-sm placeholder:text-slate-400 focus:border-[#1f55ff] focus:ring-4 focus:ring-blue-100 sm:h-12 sm:pl-12"
                                            placeholder="Enter your password"
                                            autoComplete="current-password"
                                            onChange={(e) =>
                                                setData(
                                                    "password",
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPassword(
                                                    (value) => !value,
                                                )
                                            }
                                            className="absolute right-4 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                                            aria-label={
                                                showPassword
                                                    ? "Hide password"
                                                    : "Show password"
                                            }
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                    <InputError
                                        message={errors.password}
                                        className="mt-2"
                                    />
                                </div>

                                <label
                                    htmlFor="remember"
                                    className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-700"
                                >
                                    <Checkbox
                                        id="remember"
                                        name="remember"
                                        checked={data.remember}
                                        onCheckedChange={(checked) =>
                                            setData(
                                                "remember",
                                                checked === true,
                                            )
                                        }
                                    />
                                    <span>Remember me</span>
                                    {canResetPassword && (
                                        <Link
                                            href={route("password.request")}
                                            className="ml-auto text-sm font-bold text-[#1f55ff] transition hover:text-[#2c20d9]"
                                        >
                                            Forgot password?
                                        </Link>
                                    )}
                                </label>

                                <Button
                                    variant="blue"
                                    disabled={processing}
                                    className="h-11 w-full rounded-lg bg-[linear-gradient(135deg,#075fff,#3024df)] text-sm font-black shadow-[0_12px_24px_rgba(37,99,235,0.28)] transition hover:translate-y-[-1px] hover:shadow-[0_16px_28px_rgba(37,99,235,0.34)] sm:h-12"
                                >
                                    <LogIn className="mr-2 h-4 w-4" />
                                    Sign In
                                </Button>
                            </form>

                            <div className="mt-6 text-center text-[11px] font-medium leading-relaxed text-slate-400 sm:mt-8 sm:text-xs">
                                &copy; 2025 Isabela State University &mdash;
                                Ilagan Campus
                                <br />
                                All Rights Reserved
                                <br />
                                Developed by Reycarl Medico
                            </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Dialog
                open={Boolean(requestModalType)}
                onOpenChange={(open) => {
                    if (!open) {
                        closeDocumentRequest();
                    }
                }}
            >
                <DialogContent className="max-h-[92vh] w-[calc(100%-1.5rem)] max-w-2xl overflow-y-auto rounded-2xl border-0 bg-white p-5 shadow-2xl sm:p-6">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black text-slate-900">
                            {requestLabel.title}
                        </DialogTitle>
                        <DialogDescription>
                            {requestLabel.description}
                        </DialogDescription>
                    </DialogHeader>

                    <form
                        onSubmit={submitDocumentRequest}
                        className="mt-2 space-y-4"
                    >
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <RequestTextField
                                id="request_employee_name"
                                label="Name"
                                icon={User}
                                value={requestData.employee_name}
                                error={requestErrors.employee_name}
                                onChange={(value) =>
                                    setRequestData("employee_name", value)
                                }
                            />
                            <RequestTextField
                                id="request_email"
                                label="Email Address"
                                type="email"
                                icon={Mail}
                                value={requestData.email}
                                error={requestErrors.email}
                                onChange={(value) =>
                                    setRequestData("email", value)
                                }
                            />
                            <RequestTextField
                                id="request_position"
                                label="Position / Designation"
                                icon={Briefcase}
                                value={requestData.position}
                                error={requestErrors.position}
                                onChange={(value) =>
                                    setRequestData("position", value)
                                }
                            />
                            <div>
                                <label
                                    htmlFor="request_station_id"
                                    className="text-sm font-bold text-slate-800"
                                >
                                    Permanent Station
                                </label>
                                <CustomDropdownCheckboxObject
                                    label="Select Station"
                                    items={stationItems}
                                    selected={requestData.station_id}
                                    buttonLabel={
                                        selectedStation?.name ||
                                        "Select Station"
                                    }
                                    onChange={(stationId) =>
                                        setRequestData("station_id", stationId)
                                    }
                                    buttonVariant="outline"
                                    className="mt-2 h-11 w-full border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                                />
                                <InputError
                                    message={requestErrors.station_id}
                                    className="mt-2"
                                />
                            </div>
                        </div>

                        <RequestTextField
                            id="request_purpose_of_travel"
                            label="Purpose of Travel"
                            icon={FileText}
                            value={requestData.purpose_of_travel}
                            error={requestErrors.purpose_of_travel}
                            onChange={(value) =>
                                setRequestData("purpose_of_travel", value)
                            }
                        />

                        <RequestTextField
                            id="request_destination"
                            label="Destination"
                            icon={MapPin}
                            value={requestData.destination}
                            error={requestErrors.destination}
                            onChange={(value) =>
                                setRequestData("destination", value)
                            }
                        />

                        {isLocatorSlip ? (
                            <>
                                <RequestTextField
                                    id="request_travel_datetime"
                                    label="Date and Time"
                                    type="datetime-local"
                                    icon={CalendarDays}
                                    value={requestData.travel_datetime}
                                    error={requestErrors.travel_datetime}
                                    onChange={(value) =>
                                        setRequestData(
                                            "travel_datetime",
                                            value,
                                        )
                                    }
                                />

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
                                                    requestData.travel_type ===
                                                    "official_business"
                                                }
                                                onChange={(e) =>
                                                    setRequestData(
                                                        "travel_type",
                                                        e.target.value,
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
                                                    requestData.travel_type ===
                                                    "official_time"
                                                }
                                                onChange={(e) =>
                                                    setRequestData(
                                                        "travel_type",
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                            Official Time
                                        </label>
                                    </div>
                                    <InputError
                                        message={requestErrors.travel_type}
                                        className="mt-2"
                                    />
                                </div>
                            </>
                        ) : (
                            <>
                                <RequestTextField
                                    id="request_host_of_activity"
                                    label="Host of Activity"
                                    icon={Users}
                                    value={requestData.host_of_activity}
                                    error={requestErrors.host_of_activity}
                                    onChange={(value) =>
                                        setRequestData(
                                            "host_of_activity",
                                            value,
                                        )
                                    }
                                />
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <RequestTextField
                                        id="request_inclusive_dates"
                                        label="Inclusive Dates"
                                        type="date"
                                        icon={CalendarDays}
                                        value={requestData.inclusive_dates}
                                        error={requestErrors.inclusive_dates}
                                        onChange={(value) =>
                                            setRequestData(
                                                "inclusive_dates",
                                                value,
                                            )
                                        }
                                    />
                                    <RequestTextField
                                        id="request_fund_source"
                                        label="Fund Source"
                                        icon={Wallet}
                                        value={requestData.fund_source}
                                        error={requestErrors.fund_source}
                                        onChange={(value) =>
                                            setRequestData(
                                                "fund_source",
                                                value,
                                            )
                                        }
                                    />
                                </div>
                            </>
                        )}

                        <DialogFooter className="gap-2 pt-2 sm:space-x-0">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={closeDocumentRequest}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="blue"
                                disabled={requestProcessing}
                                className="bg-[linear-gradient(135deg,#075fff,#3024df)] font-black"
                            >
                                {requestProcessing
                                    ? "Submitting..."
                                    : "Submit Request"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
};

const RequestTextField = ({
    id,
    label,
    icon: Icon,
    type = "text",
    value,
    error,
    onChange,
}) => (
    <div>
        <label htmlFor={id} className="text-sm font-bold text-slate-800">
            {label}
        </label>
        <div className="relative mt-2">
            <Icon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <TextInput
                id={id}
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="block h-11 w-full rounded-lg border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm font-medium text-slate-700 shadow-sm placeholder:text-slate-400 focus:border-[#1f55ff] focus:ring-4 focus:ring-blue-100"
            />
        </div>
        <InputError message={error} className="mt-2" />
    </div>
);

export default Login;
