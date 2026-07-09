import { CheckCircle2, Mail } from "lucide-react";

const DocumentRequestSuccessToast = ({ message }) => (
    <div className="relative flex min-w-[270px] max-w-[330px] items-center gap-2.5 overflow-hidden rounded-xl border border-sky-300/25 bg-gradient-to-br from-[#02062f]/95 via-[#08145a]/95 to-[#0f2f72]/95 px-3.5 py-3 text-white shadow-2xl shadow-blue-950/35 backdrop-blur">
        <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-300/80 to-transparent" />
        <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-emerald-300/25 bg-emerald-400/15 text-emerald-200 shadow-inner">
            <span className="absolute inset-0 rounded-full bg-emerald-300/25 animate-ping" />
            <CheckCircle2 className="relative h-4 w-4" />
        </span>
        <div className="min-w-0 pr-2">
            <p className="text-xs font-black uppercase text-sky-100">
                Request submitted
            </p>
            <p className="truncate text-sm font-semibold text-white">
                Email notification sent
            </p>
            <p className="flex items-center gap-1 text-[11px] font-bold uppercase text-emerald-200">
                <Mail className="h-3.5 w-3.5" />
                <span className="truncate">{message}</span>
            </p>
        </div>
    </div>
);

export default DocumentRequestSuccessToast;
