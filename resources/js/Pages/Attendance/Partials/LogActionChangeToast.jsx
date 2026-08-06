import React from "react";
import { LogIn, LogOut } from "lucide-react";
import AttendanceToast from "./AttendanceToast";

const LogActionChangeToast = ({ action, session }) => {
    const isTimeIn = action === "time-in";
    const ActionIcon = isTimeIn ? LogIn : LogOut;
    const actionLabel = isTimeIn ? "Time In" : "Time Out";

    return (
        <AttendanceToast
            detail={`Next scan records ${session} ${actionLabel}`}
            icon={<ActionIcon className="h-4 w-4" />}
            message={`Scanner switched to ${actionLabel}`}
            title="Scanner action changed"
            tone="success"
        />
    );
};

export default LogActionChangeToast;
