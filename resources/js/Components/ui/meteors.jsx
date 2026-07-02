import { useMemo } from "react";

import { cn } from "@/lib/utils";

const tailColors = [
    "rgba(34, 63, 255, 0.88)",
    "rgba(28, 72, 225, 0.76)",
    "rgba(21, 48, 171, 0.68)",
];

export function Meteors({ number = 20, className, meteorClassName }) {
    const meteors = useMemo(
        () =>
            Array.from({ length: number }, (_, index) => ({
                id: index,
                left: 52 + Math.random() * 46,
                top: -12 + Math.random() * 24,
                delay: Math.random() * 8,
                duration: 5.4 + Math.random() * 4.8,
                width: 90 + Math.random() * 130,
                color: tailColors[index % tailColors.length],
            })),
        [number],
    );

    return (
        <div
            className={cn(
                "pointer-events-none absolute inset-0 overflow-hidden",
                className,
            )}
            aria-hidden="true"
        >
            {meteors.map((meteor) => (
                <span
                    key={meteor.id}
                    className={cn(
                        "absolute h-1.5 w-1.5 animate-meteor rounded-full bg-cyan-100 shadow-[0_0_8px_2px_rgba(125,211,252,0.86),0_0_16px_5px_rgba(37,99,235,0.38)]",
                        "before:absolute before:left-1/2 before:top-1/2 before:h-1 before:w-[var(--meteor-tail-width)] before:-translate-y-1/2 before:[clip-path:polygon(0_0,100%_50%,0_100%)] before:bg-[linear-gradient(90deg,rgba(165,243,252,0.82),rgba(59,130,246,0.52),var(--meteor-tail-color),transparent)] before:blur-[0.15px] before:shadow-[0_0_7px_rgba(59,130,246,0.42)] before:content-['']",
                        meteorClassName,
                    )}
                    style={{
                        left: `${meteor.left}%`,
                        top: `${meteor.top}%`,
                        animationDelay: `${meteor.delay}s`,
                        animationDuration: `${meteor.duration}s`,
                        "--meteor-tail-color": meteor.color,
                        "--meteor-tail-width": `${meteor.width}px`,
                    }}
                />
            ))}
        </div>
    );
}
