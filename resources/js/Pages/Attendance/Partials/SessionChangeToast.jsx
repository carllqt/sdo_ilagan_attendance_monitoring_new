import React from "react";
import { BellRing } from "lucide-react";

const SessionChangeToast = ({ session }) => (
    <div className="monitor-live-toast relative flex min-w-[270px] max-w-[330px] items-center gap-2.5 overflow-hidden rounded-xl border border-sky-300/25 bg-gradient-to-br from-[#02062f]/95 via-[#08145a]/95 to-[#0f2f72]/95 px-3.5 py-3 text-white shadow-2xl shadow-blue-950/35 backdrop-blur">
        <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-300/80 to-transparent" />
        <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-emerald-300/25 bg-emerald-400/15 text-emerald-200 shadow-inner">
            <span className="absolute inset-0 rounded-full bg-emerald-300/25 animate-ping" />
            <BellRing className="relative h-4 w-4 animate-bell-ring" />
        </span>
        <div className="min-w-0 pr-2">
            <p className="text-xs font-black uppercase text-sky-100">
                Session changed
            </p>
            <p className="truncate text-sm font-semibold text-white">
                Scanner switched to {session} Session
            </p>
            <p className="text-[11px] font-bold uppercase text-emerald-200">
                Next scan follows this session
            </p>
        </div>
    </div>
);

export default SessionChangeToast;
