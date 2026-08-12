import React from "react";
import EmployeeAvatar from "@/Components/EmployeeAvatar";
import AttendanceToast from "./AttendanceToast";

const AlreadyRecordedToast = ({ employee, recordedAction, recordedAt }) => {
    const name =
        `${employee?.first_name || ""} ${employee?.last_name || ""}`.trim() ||
        "Employee";
    const formattedRecordedAt = recordedAt
        ? new Date(`1970-01-01T${recordedAt}`).toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit",
          })
        : "Time unavailable";

    return (
        <AttendanceToast
            countdownSeconds={3}
            detail={`Recorded at ${formattedRecordedAt}`}
            icon={
                <EmployeeAvatar
                    employee={employee}
                    name={name}
                    className="h-[88px] w-[88px] border-2 border-amber-200/60"
                />
            }
            large
            largeIcon
            message={name}
            title={`${recordedAction || "Attendance"} already recorded`}
            tone="warning"
        />
    );
};

export default AlreadyRecordedToast;
