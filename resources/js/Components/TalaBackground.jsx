import { DotStar, WhiteStar, YellowStar } from "@/Components/TalaStars";
import { Meteors } from "@/components/ui/meteors";

const TalaBackground = () => (
    <>
        <style>{`
            @keyframes tala-bg-drift {
                0%, 100% { transform: translate3d(0, 0, 0); }
                50% { transform: translate3d(16px, -14px, 0); }
            }

            @keyframes tala-moon {
                0%, 100% { transform: translateY(0) scale(1); }
                50% { transform: translateY(-10px) scale(1.03); }
            }

            @keyframes tala-star {
                0%, 100% { opacity: 0.35; transform: scale(0.85); }
                50% { opacity: 0.95; transform: scale(1.15); }
            }

            @keyframes tala-side-glow {
                0%, 100% { transform: translateY(0) scale(1); opacity: 0.42; }
                50% { transform: translateY(-18px) scale(1.04); opacity: 0.62; }
            }

            @keyframes tala-leaf-sway {
                0%, 100% { transform: rotate(-2deg) translateY(0); }
                50% { transform: rotate(4deg) translateY(-10px); }
            }

            @keyframes tala-asteroid {
                0%, 100% {
                    transform: translate3d(0, 0, 0) rotate(0deg);
                }
                50% {
                    transform: translate3d(-18px, 14px, 0) rotate(13deg);
                }
            }
        `}</style>
        <div className="pointer-events-none absolute inset-0 overflow-hidden bg-[radial-gradient(circle_at_18%_4%,rgba(12,31,108,0.58),transparent_32%),radial-gradient(circle_at_70%_10%,rgba(26,38,138,0.34),transparent_20%),radial-gradient(circle_at_96%_58%,rgba(37,30,111,0.26),transparent_36%),radial-gradient(circle_at_38%_95%,rgba(16,36,118,0.22),transparent_36%),linear-gradient(135deg,#00021b_0%,#030936_48%,#070229_100%)]">
            <div
                className="absolute inset-0 opacity-[0.18]"
                style={{
                    backgroundImage:
                        "radial-gradient(circle, rgba(125,211,252,0.48) 0 0.8px, transparent 1.8px), radial-gradient(circle, rgba(147,197,253,0.34) 0 0.7px, transparent 1.6px)",
                    backgroundPosition: "64px 10px, 18px 22px",
                    backgroundSize: "188px 142px, 132px 104px",
                }}
            />
            <div
                className="absolute inset-0 opacity-[0.18]"
                style={{
                    backgroundImage:
                        "radial-gradient(circle at 18% 76%, rgba(251,191,36,0.9) 0 1px, transparent 2.2px), radial-gradient(circle at 83% 9%, rgba(255,255,255,0.9) 0 0.9px, transparent 2px), radial-gradient(circle at 5% 31%, rgba(125,211,252,0.9) 0 1px, transparent 2.2px), radial-gradient(circle at 96% 73%, rgba(244,114,182,0.8) 0 1px, transparent 2.1px)",
                }}
            />
            <div
                className="absolute right-[16%] top-0 h-36 w-72 opacity-25"
                style={{
                    backgroundImage:
                        "radial-gradient(circle, rgba(244,114,182,0.9) 1.3px, transparent 1.3px)",
                    backgroundSize: "15px 15px",
                    animation: "tala-bg-drift 12s ease-in-out infinite",
                }}
            />
            <div className="absolute -left-28 top-24 h-80 w-80 rounded-full bg-blue-700/10 blur-3xl" />
            <div className="absolute -right-24 top-20 h-96 w-96 rounded-full bg-blue-900/16 blur-3xl" />
            <svg
                className="absolute left-[64%] top-1 h-32 w-44 overflow-visible drop-shadow-[0_0_26px_rgba(67,56,202,0.36)]"
                viewBox="0 0 176 128"
                fill="none"
                aria-hidden="true"
                style={{ animation: "tala-moon 8s ease-in-out infinite" }}
            >
                <defs>
                    <radialGradient id="talaPurplePlanet" cx="36%" cy="28%" r="72%">
                        <stop offset="0%" stopColor="#6d5cff" />
                        <stop offset="42%" stopColor="#3328b4" />
                        <stop offset="100%" stopColor="#0b0b55" />
                    </radialGradient>
                </defs>
                <circle cx="84" cy="56" r="48" fill="url(#talaPurplePlanet)" />
                <circle cx="65" cy="36" r="7" fill="#0b0947" opacity="0.28" />
                <circle cx="86" cy="27" r="4" fill="#0b0947" opacity="0.26" />
                <circle cx="103" cy="43" r="8" fill="#0b0947" opacity="0.22" />
                <circle cx="55" cy="59" r="5" fill="#0b0947" opacity="0.23" />
                <circle cx="92" cy="75" r="10" fill="#08073d" opacity="0.20" />
                <circle cx="112" cy="72" r="4" fill="#756cff" opacity="0.18" />
            </svg>

            <YellowStar className="left-[5%] top-[12%] h-3.5 w-3.5" style={{ animationDuration: "3.6s" }} />
            <YellowStar className="left-[17%] top-[7%] h-3 w-3 text-amber-200" style={{ animationDuration: "4.3s" }} />
            <YellowStar className="left-[33%] top-[15%] h-4 w-4" style={{ animationDuration: "3.9s" }} />
            <YellowStar className="left-[55%] top-[9%] h-3.5 w-3.5 text-amber-200" style={{ animationDuration: "4.8s" }} />
            <YellowStar className="right-[20%] top-[7%] h-4 w-4" style={{ animationDuration: "3.2s" }} />
            <YellowStar className="right-[7%] top-[17%] h-3 w-3 text-amber-200" style={{ animationDuration: "4.1s" }} />
            <YellowStar className="left-[10%] top-[41%] h-5 w-5" style={{ animationDuration: "3.7s" }} />
            <YellowStar className="right-[14%] top-[36%] h-3.5 w-3.5 text-amber-200" style={{ animationDuration: "5.1s" }} />

            <WhiteStar className="left-[25%] top-[10%] h-3 w-3" style={{ animationDuration: "4.4s" }} />
            <WhiteStar className="left-[44%] top-[6%] h-2.5 w-2.5 opacity-75" style={{ animationDuration: "5.2s" }} />
            <WhiteStar className="left-[68%] top-[14%] h-3.5 w-3.5 opacity-85" style={{ animationDuration: "4.9s" }} />
            <WhiteStar className="right-[11%] top-[25%] h-3 w-3 opacity-80" style={{ animationDuration: "5s" }} />
            <WhiteStar className="right-[36%] top-[5%] h-2.5 w-2.5 opacity-70" style={{ animationDuration: "5.4s" }} />
            <WhiteStar className="left-[48%] top-[33%] h-3 w-3 opacity-80" style={{ animationDuration: "4.6s" }} />

            <DotStar className="left-[2%] top-[20%] h-1 w-1 bg-cyan-100/80 shadow-[0_0_7px_rgba(165,243,252,0.45)]" style={{ animationDuration: "3.8s" }} />
            <DotStar className="left-[29%] top-[23%] h-0.5 w-0.5 bg-blue-100/75 shadow-[0_0_6px_rgba(219,234,254,0.4)]" style={{ animationDuration: "4.8s" }} />
            <DotStar className="left-[53%] top-[21%] h-1 w-1 bg-cyan-200/75 shadow-[0_0_7px_rgba(125,211,252,0.42)]" style={{ animationDuration: "3.6s" }} />
            <DotStar className="right-[17%] top-[16%] h-0.5 w-0.5 bg-cyan-200/80 shadow-[0_0_7px_rgba(125,211,252,0.55)]" style={{ animationDuration: "4.2s" }} />
            <DotStar className="right-[4%] top-[45%] h-1 w-1 bg-blue-100/70 shadow-[0_0_6px_rgba(219,234,254,0.4)]" style={{ animationDuration: "5.1s" }} />
            <DotStar className="left-[38%] top-[54%] h-0.5 w-0.5 bg-cyan-100/70 shadow-[0_0_6px_rgba(165,243,252,0.4)]" style={{ animationDuration: "4.5s" }} />

            <Meteors number={9} className="opacity-60" />

            <svg
                className="absolute left-[73%] top-[29%] h-7 w-7 text-indigo-200/24 drop-shadow-[0_0_12px_rgba(129,140,248,0.3)]"
                viewBox="0 0 48 48"
                fill="none"
                aria-hidden="true"
                style={{ animation: "tala-asteroid 10s ease-in-out infinite" }}
            >
                <path
                    d="M18 5L34 8L43 22L36 37L21 43L8 35L4 20L10 10Z"
                    fill="currentColor"
                />
                <circle cx="18" cy="18" r="4" fill="rgba(255,255,255,0.18)" />
                <circle cx="31" cy="27" r="3" fill="rgba(255,255,255,0.14)" />
            </svg>
            <svg
                className="absolute left-[13%] top-[58%] h-5 w-5 text-violet-200/18 drop-shadow-[0_0_10px_rgba(196,181,253,0.24)]"
                viewBox="0 0 48 48"
                fill="none"
                aria-hidden="true"
                style={{
                    animation: "tala-asteroid 12s ease-in-out infinite reverse",
                    animationDelay: "1.5s",
                }}
            >
                <path
                    d="M20 6L36 11L42 27L31 42L14 38L5 25L9 12Z"
                    fill="currentColor"
                />
                <circle cx="20" cy="20" r="3.5" fill="rgba(255,255,255,0.16)" />
                <circle cx="29" cy="31" r="2.5" fill="rgba(255,255,255,0.12)" />
            </svg>

        </div>
    </>
);

export default TalaBackground;
