import React from "react";

import ApplicationLogo from "@/Components/ApplicationLogo";
import BrandSubtitle from "@/Components/BrandSubtitle";

const GlowingClockIcon = () => (
    <svg
        className="h-10 w-10 drop-shadow-[0_0_8px_rgba(34,211,238,0.9)]"
        viewBox="0 0 28 28"
        fill="none"
        aria-hidden="true"
    >
        <circle
            cx="14"
            cy="14"
            r="9.2"
            stroke="url(#clockRing)"
            strokeLinecap="round"
            strokeWidth="2.6"
            strokeDasharray="3.6 2.8"
        />
        <path
            d="M14 8.7V14L17.7 16.2"
            stroke="#DFFBFF"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.1"
        />
        <path
            d="M7.8 4.9L5.6 7.1M20.2 4.9L22.4 7.1"
            stroke="#67E8F9"
            strokeLinecap="round"
            strokeWidth="2"
        />
        <circle cx="14" cy="14" r="1.3" fill="#DFFBFF" />
        <defs>
            <linearGradient
                id="clockRing"
                x1="5"
                x2="23"
                y1="5"
                y2="23"
                gradientUnits="userSpaceOnUse"
            >
                <stop stopColor="#7DD3FC" />
                <stop offset="0.52" stopColor="#22D3EE" />
                <stop offset="1" stopColor="#A78BFA" />
            </linearGradient>
        </defs>
    </svg>
);

const Header = ({ time }) => {
    const today = time.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

    const dayName = time.toLocaleDateString("en-US", {
        weekday: "long",
    });

    const clock = time.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
    });

    return (
        <header className="relative z-10 px-8 pb-8 pt-6 text-white">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white shadow-xl shadow-blue-950/30 ring-2 ring-white/55">
                        <ApplicationLogo className="h-14 w-auto" />
                    </div>
                    <div>
                        <div className="text-2xl font-black leading-tight drop-shadow-sm">
                            Project T.A.L.A
                        </div>
                        <div className="max-w-2xl text-[10px] font-bold uppercase tracking-wide text-blue-50">
                            <BrandSubtitle />
                        </div>
                    </div>
                </div>

                <div className="mt-4 rounded-xl border border-white/25 bg-[linear-gradient(135deg,rgba(42,75,205,0.58),rgba(102,82,218,0.68)_48%,rgba(49,30,139,0.62))] px-5 py-3 text-right shadow-[0_0_28px_rgba(96,165,250,0.30),0_14px_36px_rgba(2,6,47,0.32),inset_0_1px_0_rgba(255,255,255,0.32)] ring-1 ring-violet-200/20 backdrop-blur-md lg:mt-0">
                    <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center text-cyan-200">
                            <GlowingClockIcon />
                        </span>
                        <div className="text-right">
                            <p className="text-lg font-black leading-tight tracking-wide text-white drop-shadow-sm">
                                {clock}
                            </p>
                            <p className="mt-0.5 text-xs font-bold text-blue-50">
                                {today} &bull; {dayName}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
