import React from "react";
import { Clock3 } from "lucide-react";
import EmployeeAvatar from "@/Components/EmployeeAvatar";

const ScanCooldownToast = ({ employee, remainingMinutes }) => {
    const name =
        `${employee?.first_name || ""} ${employee?.last_name || ""}`.trim() ||
        "Employee";

    return (
        <div className="flex w-[min(92vw,390px)] items-center gap-4 rounded-2xl border border-amber-300/40 bg-gradient-to-br from-[#071158]/98 to-[#111b69]/98 p-4 text-white shadow-[0_24px_70px_rgba(2,6,47,0.55)] ring-1 ring-white/10 backdrop-blur-xl">
            <EmployeeAvatar
                employee={employee}
                name={name}
                className="h-20 w-20 border-2 border-amber-200/60 shadow-lg"
            />
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-amber-200">
                    <Clock3 className="h-4 w-4" />
                    <p className="text-xs font-black uppercase tracking-wider">
                        Please wait
                    </p>
                </div>
                <p className="mt-1 truncate text-base font-black">{name}</p>
                <p className="mt-1 text-sm font-semibold leading-snug text-blue-100">
                    Already scanned. Try again in about{" "}
                    <span className="font-black text-amber-200">
                        {remainingMinutes} minute
                        {remainingMinutes === 1 ? "" : "s"}
                    </span>
                    .
                </p>
            </div>
        </div>
    );
};

export default ScanCooldownToast;
