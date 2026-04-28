import React, { useEffect, useState, useMemo, useRef } from "react";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

import { MapPin, LogIn, LogOut, Clock, X } from "lucide-react";

// =========================
// SAFE STRING HANDLER
// =========================
const safeString = (val) => {
    if (typeof val === "string") return val;
    if (typeof val === "object") return val?.name || JSON.stringify(val);
    return String(val || "");
};

// =========================
// HIGHLIGHT SEARCH
// =========================
function highlight(text = "", search = "") {
    const safeText = safeString(text);
    const safeSearch = String(search || "");

    if (!safeSearch) return safeText;

    const parts = safeText.split(new RegExp(`(${safeSearch})`, "gi"));

    return parts.map((part, i) =>
        part.toLowerCase() === safeSearch.toLowerCase() ? (
            <span key={i} className="bg-yellow-200 text-black px-1 rounded">
                {part}
            </span>
        ) : (
            part
        ),
    );
}

// =========================
// DEBOUNCE
// =========================
function useDebounce(value, delay = 300) {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);

    return debounced;
}

const isOnLeave = (user) => {
    return ["SL", "OB", "VL"].includes(user?.leave_type);
};

export default function MainContent({
    users = [],
    employees = [],
    selectedStation,
    employeeSearch = "",
    setEmployeeSearch,
    currentPage,
    setCurrentPage,
}) {
    const debouncedSearch = useDebounce(employeeSearch);
    const usersPerPage = 20;

    const [selectedUser, setSelectedUser] = useState(null);

    const [recentScans, setRecentScans] = useState({});
    const prevUsersRef = useRef([]);

    useEffect(() => {
        const prevUsers = prevUsersRef.current;
        const newScans = {};

        users.forEach((current) => {
            const prev = prevUsers.find(
                (p) => p.employee_id === current.employee_id,
            );

            const isNewScan =
                (!prev?.am_in && current.am_in) ||
                (!prev?.pm_in && current.pm_in);

            if (isNewScan) {
                newScans[current.employee_id] = true;

                setTimeout(() => {
                    setRecentScans((prev) => {
                        const copy = { ...prev };
                        delete copy[current.employee_id];
                        return copy;
                    });
                }, 3000);
            }
        });

        if (Object.keys(newScans).length > 0) {
            setRecentScans((prev) => ({ ...prev, ...newScans }));
        }

        prevUsersRef.current = users;
    }, [users]);
    // =========================
    // MERGE EMPLOYEES + ATTENDANCE
    // =========================
    const mergedUsers = useMemo(() => {
        return employees.map((emp) => {
            const attendance = users.find((a) => a.employee_id === emp.id);
            console.log("USER CHECK:", attendance);
            const fullName =
                emp.full_name ||
                `${emp.first_name ?? ""} ${emp.last_name ?? ""}`.trim();

            return {
                ...emp,
                employee_id: emp.id,
                name: fullName,
                station: emp.station?.name || "No Station",

                am_in: attendance?.am_in || "",
                am_out: attendance?.am_out || "",
                pm_in: attendance?.pm_in || "",
                pm_out: attendance?.pm_out || "",
                with_slip: attendance?.with_slip || false,
                leave_type: attendance?.leave_type || null,
            };
        });
    }, [employees, users]);

    // =========================
    // FILTER LOGIC
    // =========================
    const filteredUsers = useMemo(() => {
        return mergedUsers
            .filter((u) => u && u.name)
            .filter((u) => {
                if (selectedStation === "All Stations") return true;
                return safeString(u?.station) === selectedStation;
            })
            .filter((u) => {
                const term = debouncedSearch.toLowerCase();

                return (
                    safeString(u?.name).toLowerCase().includes(term) ||
                    safeString(u?.station).toLowerCase().includes(term)
                );
            });
    }, [mergedUsers, selectedStation, debouncedSearch]);

    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    const paginatedUsers = filteredUsers.slice(
        (currentPage - 1) * usersPerPage,
        currentPage * usersPerPage,
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearch, selectedStation]);

    const getAttendanceStatus = (user) => {
        const hasAMIn = Boolean(user.am_in);
        const hasAMOut = Boolean(user.am_out);
        const hasPMIn = Boolean(user.pm_in);
        const hasPMOut = Boolean(user.pm_out);

        const hasSlip = ["SL", "OB", "VL"].includes(user.leave_type);

        if (hasSlip) return { status: "With Slip", isPresent: false };

        // PM priority
        if (hasPMOut) return { status: "Absent", isPresent: false };
        if (hasPMIn) return { status: "Present", isPresent: true };

        // AM fallback
        if (hasAMOut) return { status: "Absent", isPresent: false };
        if (hasAMIn) return { status: "Present", isPresent: true };

        return { status: "Absent", isPresent: false };
    };

    return (
        <div className="lg:col-span-3 bg-white rounded-2xl shadow p-6">
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                {/* LEGEND */}
                <div className="flex flex-wrap gap-4 text-xs text-gray-600">
                    <span className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        Present
                    </span>
                    <span className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                        Absent
                    </span>
                    <span className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                        With Slip
                    </span>
                </div>

                {/* SEARCH */}
                <div className="relative w-full sm:w-64">
                    <input
                        type="text"
                        placeholder="Search employee or station..."
                        value={employeeSearch}
                        onChange={(e) => setEmployeeSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-full border bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-300"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2">
                        🔍
                    </span>
                </div>
            </div>

            {/* GRID */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {paginatedUsers.map((user) => {
                    const name = safeString(user?.name);
                    const station = safeString(user?.station);

                    const { status, isPresent } = getAttendanceStatus(user);

                    const hasSlip = ["SL", "OB", "VL"].includes(
                        user.leave_type,
                    );

                    const statusColor = hasSlip
                        ? "before:bg-yellow-400 text-yellow-500"
                        : isPresent
                          ? "before:bg-green-500 text-green-600"
                          : "before:bg-red-500 text-red-500";

                    return (
                        <div
                            key={user.employee_id}
                            onClick={() => setSelectedUser(user)}
                            className={`relative cursor-pointer border rounded-xl p-5 hover:shadow-lg hover:-translate-y-1 transition-all
                            ${statusColor}
                            before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:rounded-l-xl
                            ${recentScans[user.employee_id] ? "live-highlight" : ""}
                            ${isOnLeave(user) ? "bg-yellow-100 border-yellow-400" : "bg-white"}
                            `}
                        >
                            {/* AVATAR */}
                            <div className="w-11 h-11 mx-auto mb-3 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
                                {name.charAt(0) || "?"}
                            </div>

                            {/* NAME */}
                            <p className="text-xs font-semibold text-center truncate">
                                {highlight(name, debouncedSearch)}
                            </p>

                            {/* STATION */}
                            <p className="text-[10px] text-gray-500 flex items-center justify-center gap-1 truncate">
                                <MapPin size={10} />
                                {highlight(station, debouncedSearch)}
                            </p>

                            {/* STATUS */}
                            <p
                                className={`text-[11px] text-center mt-2 font-medium flex items-center justify-center gap-1 ${
                                    hasSlip
                                        ? "text-yellow-500"
                                        : isPresent
                                          ? "text-green-600"
                                          : "text-red-500"
                                }`}
                            >
                                {isPresent ? (
                                    <LogIn size={12} />
                                ) : (
                                    <LogOut size={12} />
                                )}
                                {status}
                            </p>
                        </div>
                    );
                })}
            </div>

            {/* PAGINATION */}
            <div className="mt-6 flex justify-center">
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (currentPage > 1)
                                        setCurrentPage(currentPage - 1);
                                }}
                            />
                        </PaginationItem>

                        {Array.from(
                            { length: totalPages },
                            (_, i) => i + 1,
                        ).map((page) => (
                            <PaginationItem key={page}>
                                <PaginationLink
                                    href="#"
                                    isActive={currentPage === page}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setCurrentPage(page);
                                    }}
                                >
                                    {page}
                                </PaginationLink>
                            </PaginationItem>
                        ))}

                        <PaginationItem>
                            <PaginationNext
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (currentPage < totalPages)
                                        setCurrentPage(currentPage + 1);
                                }}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>

            {/* MODAL */}
            {selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white w-[90%] max-w-md rounded-2xl shadow-xl p-6 relative animate-fadeIn">
                        <button
                            onClick={() => setSelectedUser(null)}
                            className="absolute top-3 right-3 text-gray-400 hover:text-black"
                        >
                            <X size={18} />
                        </button>

                        {/* HEADER */}
                        <div className="text-center mb-4">
                            <div className="w-14 h-14 mx-auto rounded-full bg-gray-200 flex items-center justify-center text-lg font-semibold">
                                {safeString(selectedUser.name).charAt(0)}
                            </div>

                            <h2 className="mt-2 text-sm font-semibold">
                                {safeString(selectedUser.name)}
                            </h2>

                            <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                                <MapPin size={12} />
                                {safeString(selectedUser.station)}
                            </p>
                        </div>

                        {/* STATUS */}
                        <div className="text-center mb-4">
                            {(() => {
                                const { status, isPresent } =
                                    getAttendanceStatus(selectedUser);

                                let color = isPresent
                                    ? "text-green-600"
                                    : "text-red-500";
                                if (status === "With Slip")
                                    color = "text-yellow-500";

                                return (
                                    <span
                                        className={`text-xs font-semibold px-3 py-1 rounded-full bg-gray-100 ${color}`}
                                    >
                                        {status}
                                    </span>
                                );
                            })()}
                        </div>

                        {/* ATTENDANCE */}
                        <div className="grid grid-cols-2 gap-3 text-xs mt-4">
                            <div className="bg-gray-50 p-3 rounded-lg flex items-center gap-2">
                                <LogIn size={14} className="text-green-600" />
                                <div>
                                    <p className="text-gray-400">AM IN</p>
                                    <p className="font-medium text-green-600">
                                        {selectedUser.am_in || "—"}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-3 rounded-lg flex items-center gap-2">
                                <LogOut size={14} className="text-red-500" />
                                <div>
                                    <p className="text-gray-400">AM OUT</p>
                                    <p className="font-medium text-red-500">
                                        {selectedUser.am_out || "—"}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-3 rounded-lg flex items-center gap-2">
                                <Clock size={14} className="text-blue-600" />
                                <div>
                                    <p className="text-gray-400">PM IN</p>
                                    <p className="font-medium text-blue-600">
                                        {selectedUser.pm_in || "—"}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-3 rounded-lg flex items-center gap-2">
                                <Clock size={14} className="text-purple-500" />
                                <div>
                                    <p className="text-gray-400">PM OUT</p>
                                    <p className="font-medium text-purple-500">
                                        {selectedUser.pm_out || "—"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
