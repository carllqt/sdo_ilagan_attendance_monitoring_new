import React from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const TardinessComputingState = ({ animationData = null }) => (
    <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 bg-slate-50 px-6 py-10 text-center">
        {animationData ? (
            <DotLottieReact
                data={animationData}
                autoplay
                loop
                className="h-100 w-100"
            />
        ) : (
            <div className="h-100 w-100" />
        )}
        <div className="max-w-sm">
            <div className="text-base font-semibold text-slate-900">
                Tardiness records are currently computing
            </div>
            <div className="mt-1 text-sm text-slate-500">
                This table will refresh automatically when the data is ready.
            </div>
        </div>
    </div>
);

export default TardinessComputingState;
