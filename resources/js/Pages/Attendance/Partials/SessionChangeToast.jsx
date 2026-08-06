import React from "react";
import { BellRing } from "lucide-react";
import AttendanceToast from "./AttendanceToast";

const SessionChangeToast = ({ session }) => (
    <AttendanceToast
        detail="Next scan follows this session"
        icon={<BellRing className="h-4 w-4 animate-bell-ring" />}
        message={`Scanner switched to ${session} Session`}
        title="Session changed"
        tone="success"
    />
);

export default SessionChangeToast;
