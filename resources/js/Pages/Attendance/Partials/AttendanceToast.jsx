import React from "react";

const toneClasses = {
    info: "border-sky-300/25 bg-sky-400/15 text-sky-200",
    success: "border-emerald-300/25 bg-emerald-400/15 text-emerald-200",
    warning: "border-amber-300/30 bg-amber-400/15 text-amber-200",
    error: "border-rose-300/30 bg-rose-400/15 text-rose-200",
};

export const AttendanceCountdown = ({
    seconds,
    className = "absolute right-4 top-4",
}) => {
    return (
        <div
            className={`${className} flex h-9 w-9 items-center justify-center rounded-full bg-slate-950/35 shadow-inner ring-1 ring-amber-200/25`}
        >
            <style>{`
                @keyframes attendance-toast-countdown {
                    from { stroke-dashoffset: 0; }
                    to { stroke-dashoffset: -100; }
                }
            `}</style>
            <svg
                aria-hidden="true"
                className="absolute inset-0 h-full w-full"
                viewBox="0 0 48 48"
            >
                <circle
                    cx="24"
                    cy="24"
                    fill="none"
                    r="20"
                    stroke="rgba(255,255,255,0.18)"
                    strokeWidth="4"
                />
                <circle
                    cx="24"
                    cy="24"
                    fill="none"
                    pathLength="100"
                    r="20"
                    stroke="rgb(253 230 138)"
                    strokeDasharray="100"
                    strokeLinecap="round"
                    strokeWidth="4"
                    transform="rotate(-90 24 24)"
                    style={{
                        animation: `attendance-toast-countdown ${seconds}s linear forwards`,
                    }}
                />
            </svg>
        </div>
    );
};

const AttendanceToast = ({
    countdownSeconds = null,
    detail,
    icon,
    large = false,
    largeIcon = false,
    message,
    title,
    tone = "info",
}) => (
    <div
        className={`monitor-live-toast relative flex items-center overflow-hidden border border-sky-300/25 bg-gradient-to-br from-[#02062f]/95 via-[#08145a]/95 to-[#0f2f72]/95 text-white shadow-2xl shadow-blue-950/35 backdrop-blur ${large ? "w-full max-w-[500px] gap-5 rounded-2xl px-6 py-5" : "min-w-[270px] max-w-[390px] gap-3 rounded-xl px-3.5 py-3"}`}
    >
        <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-300/80 to-transparent" />
        {countdownSeconds && (
            <AttendanceCountdown seconds={countdownSeconds} />
        )}
        <span
            className={`relative flex shrink-0 items-center justify-center rounded-full border shadow-inner ${large ? "h-[88px] w-[88px]" : largeIcon ? "h-14 w-14" : "h-10 w-10"} ${toneClasses[tone]}`}
        >
            {icon}
        </span>
        <div className={`min-w-0 ${countdownSeconds ? "pr-12" : "pr-1"}`}>
            <p
                className={`${large ? "text-sm" : "text-xs"} font-black uppercase text-sky-100`}
            >
                {title}
            </p>
            <p
                className={`truncate font-semibold text-white ${large ? "text-xl" : "text-sm"}`}
            >
                {message}
            </p>
            {detail && (
                <p
                    className={`${large ? "mt-1.5 text-base" : "text-[11px] uppercase"} font-bold ${toneClasses[tone].split(" ").pop()}`}
                >
                    {detail}
                </p>
            )}
        </div>
    </div>
);

export default AttendanceToast;
