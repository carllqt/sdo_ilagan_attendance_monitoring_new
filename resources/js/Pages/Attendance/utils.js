import {
    AlertTriangle,
    CheckCircle2,
    Loader2,
    Wifi,
    WifiOff,
} from "lucide-react";

export const defaultFingerprintServiceUrl = `http://${window.location.hostname}:5000`;

export const emptyAM = { am_time_in: null, am_time_out: null };
export const emptyPM = { pm_time_in: null, pm_time_out: null };

export const statusConfig = {
    idle: {
        label: "Ready",
        icon: Wifi,
        badgeClass: "border-slate-200 bg-slate-50 text-slate-600",
        panelClass: "ring-1 ring-white/10",
    },
    scanning: {
        label: "Scanning",
        icon: Wifi,
        badgeClass: "border-blue-200 bg-blue-50 text-blue-700",
        panelClass: "ring-1 ring-cyan-200/25",
    },
    processing: {
        label: "Processing",
        icon: Loader2,
        badgeClass: "border-amber-200 bg-amber-50 text-amber-700",
        panelClass: "ring-1 ring-amber-200/25",
    },
    success: {
        label: "Recorded",
        icon: CheckCircle2,
        badgeClass: "border-emerald-200 bg-emerald-50 text-emerald-700",
        panelClass: "ring-1 ring-emerald-200/25",
    },
    error: {
        label: "Attention",
        icon: WifiOff,
        badgeClass: "border-red-200 bg-red-50 text-red-700",
        panelClass: "ring-1 ring-red-200/25",
    },
    prompt: {
        label: "Choose Log",
        icon: AlertTriangle,
        badgeClass: "border-amber-200 bg-amber-50 text-amber-700",
        panelClass: "ring-1 ring-amber-200/25",
    },
};

export const employeePayload = (employee) => ({
    id: employee.id,
    first_name: employee.first_name,
    middle_name: employee.middle_name,
    last_name: employee.last_name,
    profile_img: employee.profile_img,
    position: employee.position,
    office: employee.office,
    station_id: employee.station_id,
});

export const attendanceItems = (records) =>
    Array.isArray(records) ? records : records?.data || [];

export const defaultSession = (date = new Date()) =>
    date.getHours() < 12 ? "AM" : "PM";

export const defaultLogAction = (date, session = defaultSession(date)) => {
    const hour = date.getHours();

    if (session === "AM") {
        return hour >= 10 ? "time-out" : "time-in";
    }

    return hour >= 15 ? "time-out" : "time-in";
};

export const attendanceChoice = (session, action) =>
    `${session} Time-${action === "time-in" ? "In" : "Out"}`;

export const fingerprintColor = (scanStatus) => {
    switch (scanStatus) {
        case "scanning":
            return "text-blue-500";
        case "processing":
            return "text-amber-500";
        case "success":
            return "text-emerald-500";
        case "error":
            return "text-red-500";
        default:
            return "text-slate-400";
    }
};
