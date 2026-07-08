import React from "react";
import { User } from "lucide-react";

const profileImageUrl = (profileImage) => {
    if (!profileImage) return null;

    const filename = profileImage.replace(/^employee-profile-images[\\/]/, "");

    return `/employee-profile-images/${encodeURIComponent(filename)}`;
};

const EmployeeAvatar = ({
    employee,
    name,
    className = "h-9 w-9",
    fallbackClassName = "bg-gradient-to-br from-blue-500 via-sky-400 to-blue-300",
    glowClassName = "bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.45),transparent_55%)]",
    iconClassName = "text-white/90",
    fallbackAnimationClassName = "animate-pulse",
}) => {
    const avatarUrl = profileImageUrl(employee?.profile_img);

    return (
        <div
            className={`relative flex ${className} shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-300 text-xs font-bold`}
        >
            {avatarUrl ? (
                <img
                    src={avatarUrl}
                    alt={name || "Employee"}
                    className="h-full w-full object-cover object-top"
                />
            ) : (
                <>
                    <div
                        className={`absolute inset-0 ${fallbackAnimationClassName} ${fallbackClassName}`}
                    />
                    <div className={`absolute inset-0 ${glowClassName}`} />
                    <User
                        className={`relative z-10 h-1/2 w-1/2 max-h-16 max-w-16 ${iconClassName}`}
                    />
                </>
            )}
        </div>
    );
};

export default EmployeeAvatar;
