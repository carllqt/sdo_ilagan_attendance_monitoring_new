import React from "react";

const toneClasses = {
    info: "border-sky-300/25 bg-sky-400/15 text-sky-200",
    success: "border-emerald-300/25 bg-emerald-400/15 text-emerald-200",
    warning: "border-amber-300/30 bg-amber-400/15 text-amber-200",
    error: "border-rose-300/30 bg-rose-400/15 text-rose-200",
};

const AttendanceToast = ({ detail, icon, message, title, tone = "info" }) => (
    <div className="monitor-live-toast relative flex min-w-[270px] max-w-[360px] items-center gap-3 overflow-hidden rounded-xl border border-sky-300/25 bg-gradient-to-br from-[#02062f]/95 via-[#08145a]/95 to-[#0f2f72]/95 px-3.5 py-3 text-white shadow-2xl shadow-blue-950/35 backdrop-blur">
        <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-300/80 to-transparent" />
        <span
            className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border shadow-inner ${toneClasses[tone]}`}
        >
            {icon}
        </span>
        <div className="min-w-0 pr-1">
            <p className="text-xs font-black uppercase text-sky-100">
                {title}
            </p>
            <p className="truncate text-sm font-semibold text-white">
                {message}
            </p>
            {detail && (
                <p className={`text-[11px] font-bold uppercase ${toneClasses[tone].split(" ").pop()}`}>
                    {detail}
                </p>
            )}
        </div>
    </div>
);

export default AttendanceToast;
