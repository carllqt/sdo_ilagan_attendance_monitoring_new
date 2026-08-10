import React from "react";
import EmployeeAvatar from "@/Components/EmployeeAvatar";
import AttendanceToast from "./AttendanceToast";

const ScanCooldownToast = ({
    employee,
    recordedAction,
    recordedAt,
    remainingMinutes,
}) => {
    const name =
        `${employee?.first_name || ""} ${employee?.last_name || ""}`.trim() ||
        "Employee";

    const formattedRecordedAt = recordedAt
        ? new Date(`1970-01-01T${recordedAt}`).toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit",
          })
        : null;

    return (
        <AttendanceToast
            detail={`${recordedAction || "Last scan"}${formattedRecordedAt ? `: ${formattedRecordedAt}` : ""} · Try again in ${remainingMinutes} minute${remainingMinutes === 1 ? "" : "s"}`}
            icon={
                <EmployeeAvatar
                    employee={employee}
                    name={name}
                    className="h-14 w-14 border-2 border-amber-200/60"
                />
            }
            largeIcon
            message={name}
            title="Already scanned"
            tone="warning"
        />
    );
};

export default ScanCooldownToast;
