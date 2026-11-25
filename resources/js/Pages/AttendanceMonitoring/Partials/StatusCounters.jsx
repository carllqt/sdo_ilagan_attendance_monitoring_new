import React from "react";

// Same colors as the status badges on the employee cards.
const COLORS = {
    "on-time": "bg-emerald-500",
    "on-grace": "bg-yellow-300",
    late: "bg-orange-500",
    "half-day": "bg-violet-500",
    "no-time-in": "bg-slate-400",
    "on-travel": "bg-sky-500",
    absent: "bg-rose-500",
};

const Counter = ({ active, color, count, label, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-left transition focus:outline-none focus:ring-2 focus:ring-sky-300/70 ${
            active
                ? "border-white/70 bg-white text-[#070d3f] shadow-lg shadow-blue-950/30"
                : "border-white/15 bg-white/5 text-white hover:border-white/40 hover:bg-white/10"
        }`}
    >
        {color ? (
            <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${color}`} />
        ) : null}
        <span className="text-lg font-black leading-none">{count}</span>
        <span
            className={`text-[11px] font-bold uppercase ${
                active ? "text-slate-600" : "text-blue-100"
            }`}
        >
            {label}
        </span>
    </button>
);

// How many of the station's employees have each status. Clicking a counter
// lists only those employees; clicking it again (or All) lists everyone.
const StatusCounters = ({ counts = [], selectedStatus = "", onSelect }) => {
    const total = counts.reduce((sum, item) => sum + Number(item.count || 0), 0);

    return (
        <div className="mb-5 flex flex-wrap gap-2">
            <Counter
                active={!selectedStatus}
                count={total}
                label="All"
                onClick={() => onSelect("")}
            />
            {counts.map((item) => (
                <Counter
                    key={item.key}
                    active={selectedStatus === item.key}
                    color={COLORS[item.key]}
                    count={item.count}
                    label={item.label}
                    onClick={() =>
                        onSelect(selectedStatus === item.key ? "" : item.key)
                    }
                />
            ))}
        </div>
    );
};

export default StatusCounters;
