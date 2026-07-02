export const DotStar = ({
    className = "",
    style = {},
    animationName = "tala-star",
}) => (
    <span
        className={`absolute rounded-full ${className}`}
        style={{
            animation: `${animationName} 4s ease-in-out infinite`,
            ...style,
        }}
    />
);

export const WhiteStar = ({
    className = "",
    style = {},
    animationName = "tala-star",
}) => (
    <svg
        className={`absolute overflow-visible text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.62)] ${className}`}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        style={{
            animation: `${animationName} 4.8s ease-in-out infinite`,
            ...style,
        }}
    >
        <path
            d="M12 1.25L14.7 9.3L22.75 12L14.7 14.7L12 22.75L9.3 14.7L1.25 12L9.3 9.3L12 1.25Z"
            fill="currentColor"
        />
        <path
            d="M12 7.5L13.05 10.95L16.5 12L13.05 13.05L12 16.5L10.95 13.05L7.5 12L10.95 10.95L12 7.5Z"
            fill="rgba(219,234,254,0.92)"
        />
    </svg>
);

export const YellowStar = ({
    className = "",
    style = {},
    animationName = "tala-star",
}) => (
    <svg
        className={`absolute overflow-visible text-amber-300 drop-shadow-[0_0_10px_rgba(251,191,36,0.95)] ${className}`}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        style={{
            animation: `${animationName} 3.8s ease-in-out infinite`,
            ...style,
        }}
    >
        <path
            d="M12 1.5L13.85 9.65L22.5 12L13.85 14.35L12 22.5L10.15 14.35L1.5 12L10.15 9.65L12 1.5Z"
            fill="currentColor"
        />
        <path
            d="M12 6.5L12.85 11.15L17.5 12L12.85 12.85L12 17.5L11.15 12.85L6.5 12L11.15 11.15L12 6.5Z"
            fill="#fff7c2"
        />
    </svg>
);
