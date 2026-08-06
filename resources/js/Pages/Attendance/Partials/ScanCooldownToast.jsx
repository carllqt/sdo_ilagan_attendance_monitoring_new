import React from "react";
import EmployeeAvatar from "@/Components/EmployeeAvatar";
import AttendanceToast from "./AttendanceToast";

const ScanCooldownToast = ({ employee, remainingMinutes }) => {
    const name =
        `${employee?.first_name || ""} ${employee?.last_name || ""}`.trim() ||
        "Employee";

    return (
        <AttendanceToast
            detail={`Try again in ${remainingMinutes} minute${remainingMinutes === 1 ? "" : "s"}`}
            icon={
                <EmployeeAvatar
                    employee={employee}
                    name={name}
                    className="h-9 w-9 border border-amber-200/60"
                />
            }
            message={name}
            title="Already scanned"
            tone="warning"
        />
    );
};

export default ScanCooldownToast;
