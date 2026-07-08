import DocumentRequestButtons from "./DocumentRequestButtons";

const LoginHeroPanel = ({ onOpenDocumentRequest }) => (
    <div className="relative hidden min-h-[590px] overflow-hidden border-r border-white/20 bg-[linear-gradient(135deg,rgba(8,17,86,0.42),rgba(48,47,161,0.24))] px-10 py-14 text-center text-white shadow-[0_0_22px_rgba(167,139,250,0.14),0_18px_48px_rgba(2,6,47,0.24),inset_0_1px_0_rgba(255,255,255,0.13)] ring-1 ring-violet-200/10 backdrop-blur-[2px] lg:flex lg:flex-col lg:items-center lg:justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_0%,rgba(255,255,255,0.08),transparent_31%),radial-gradient(circle_at_86%_94%,rgba(167,139,250,0.12),transparent_38%)]" />
        <div className="absolute -left-10 top-0 h-44 w-2/3 rounded-full bg-white/[0.05] blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(140deg,rgba(2,7,48,0.52),rgba(12,17,94,0.38)_45%,rgba(57,24,136,0.32))]" />
        <svg
            className="pointer-events-none absolute left-0 top-0 h-64 w-80 text-white/20"
            viewBox="0 0 320 256"
            fill="none"
            aria-hidden="true"
        >
            <defs>
                <pattern
                    id="leftPanelDots"
                    width="13"
                    height="13"
                    patternUnits="userSpaceOnUse"
                >
                    <circle
                        cx="2"
                        cy="2"
                        r="1.35"
                        fill="rgba(255,255,255,0.22)"
                    />
                </pattern>
                <clipPath id="leftDotTriangle">
                    <path d="M34 38H250L34 195Z" />
                </clipPath>
            </defs>
            <rect
                x="28"
                y="34"
                width="230"
                height="170"
                fill="url(#leftPanelDots)"
                clipPath="url(#leftDotTriangle)"
            />
        </svg>
        <div className="relative z-10 flex -translate-y-6 flex-col items-center">
            <img
                src="/img/olddepedlogo.png"
                alt="DepEd Logo"
                className="mb-10 w-64 object-contain drop-shadow-[0_12px_22px_rgba(5,10,70,0.2)]"
            />

            <h1 className="text-4xl font-black tracking-tight">Project TALA</h1>
            <p className="mt-5 max-w-sm text-lg font-medium leading-relaxed text-white/95">
                Time and Attendance Logging System with Automated Tardiness
                Computation
            </p>
            <div className="mt-8 h-1 w-36 rounded-full bg-[linear-gradient(90deg,transparent,#4de8ff,#f472ff,transparent)] shadow-[0_0_22px_rgba(216,180,254,0.85)]" />

            <DocumentRequestButtons
                onOpenDocumentRequest={onOpenDocumentRequest}
                containerClassName="mt-9 grid w-full max-w-sm grid-cols-2 gap-3"
                buttonClassName="flex h-11 items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 text-sm font-bold text-white shadow-[0_8px_20px_rgba(5,10,70,0.16)] backdrop-blur-md transition hover:bg-white/15"
                iconClassName="h-4 w-4"
            />
        </div>
    </div>
);

export default LoginHeroPanel;
