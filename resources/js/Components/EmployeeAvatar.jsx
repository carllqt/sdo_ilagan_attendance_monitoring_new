import React from "react";
import { User } from "lucide-react";

const profileImageUrl = (profileImage) => {
    if (!profileImage) return null;

    const filename = profileImage.replace(/^employee-profile-images[\\/]/, "");

    return `/employee-profile-images/${encodeURIComponent(filename)}`;
};

const EmployeeAvatar = ({ employee, name, className = "h-9 w-9" }) => {
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
                    <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-blue-500 via-sky-400 to-blue-300" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.45),transparent_55%)]" />
                    <User className="relative z-10 h-4 w-4 text-white/90" />
                </>
            )}
        </div>
    );
};

export default EmployeeAvatar;
