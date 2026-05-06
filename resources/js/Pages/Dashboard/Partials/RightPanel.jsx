import React from "react";
import EmployeeAvatar from "@/Components/EmployeeAvatar";

export default function RightPanels({
    users,
    employees,
    selectedStation,
    slipPage = 1,
    setSlipPage,
    travelPage = 1,
    setTravelPage,
    sidePerPage = 5, // ✅ default fix
}) {
    // =========================
    // MERGE EMPLOYEES + ATTENDANCE
    // =========================
    const normalizedUsers = employees.map((emp) => {
        const attendance = users.find((u) => u.employee_id === emp.id);

        const fullName =
            emp.full_name ||
            [emp.first_name, emp.middle_name, emp.last_name]
                .filter(Boolean)
                .join(" ")
                .trim();

        return {
            employee_id: emp.id,
            name: fullName || `Employee #${emp.id}`,
            station: emp.station?.name || "No Station",
            profile_img: emp.profile_img || attendance?.profile_img || null,

            leave_type: attendance?.leave_type || null,

            withSlip: ["SL", "OB"].includes(attendance?.leave_type),
            onTravel: attendance?.leave_type === "VL",
        };
    });

    // =========================
    // FILTER
    // =========================
    const filteredUsers =
        selectedStation === "All Stations"
            ? normalizedUsers
            : normalizedUsers.filter((u) => u.station === selectedStation);

    const withSlipUsers = filteredUsers.filter((u) => u.withSlip);
    const onTravelUsers = filteredUsers.filter((u) => u.onTravel);

    // =========================
    // SAFE PAGINATION
    // =========================
    const safeSlipPage = slipPage || 1;
    const safeTravelPage = travelPage || 1;

    const paginatedSlipUsers = withSlipUsers.slice(
        (safeSlipPage - 1) * sidePerPage,
        safeSlipPage * sidePerPage,
    );

    const paginatedTravelUsers = onTravelUsers.slice(
        (safeTravelPage - 1) * sidePerPage,
        safeTravelPage * sidePerPage,
    );

    return (
        <div className="flex flex-col gap-4">
            {/* ========================= */}
            {/* WITH SLIP */}
            {/* ========================= */}
            <div className="bg-white rounded-2xl shadow p-4 flex flex-col justify-between">
                <h2 className="flex justify-between items-center text-sm font-semibold mb-3">
                    🟡 WITH SLIP
                    <span className="bg-yellow-400 text-black text-xs px-2 py-0.5 rounded-full">
                        {withSlipUsers.length}
                    </span>
                </h2>

                <div className="space-y-2">
                    {paginatedSlipUsers.length === 0 ? (
                        <p className="text-xs text-gray-400 text-center">
                            No employees
                        </p>
                    ) : (
                        paginatedSlipUsers.map((user) => (
                            <div
                                key={user.employee_id}
                                className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg text-xs border-l-4 border-yellow-400"
                            >
                                <div className="flex min-w-0 items-center gap-2">
                                    <EmployeeAvatar
                                        employee={user}
                                        name={user.name}
                                        className="h-6 w-6"
                                    />
                                    <span className="truncate">
                                        {user.name}
                                    </span>
                                </div>

                                <span className="text-[10px] text-gray-400 truncate">
                                    {user.station}
                                </span>
                            </div>
                        ))
                    )}
                </div>

                {Math.ceil(withSlipUsers.length / sidePerPage) > 1 && (
                    <div className="flex justify-between items-center mt-3 text-xs">
                        <button
                            onClick={() =>
                                setSlipPage((p) => Math.max((p || 1) - 1, 1))
                            }
                            className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                        >
                            Prev
                        </button>

                        <span className="text-gray-500">
                            {safeSlipPage} /{" "}
                            {Math.ceil(withSlipUsers.length / sidePerPage)}
                        </span>

                        <button
                            onClick={() =>
                                setSlipPage((p) =>
                                    Math.min(
                                        (p || 1) + 1,
                                        Math.ceil(
                                            withSlipUsers.length / sidePerPage,
                                        ),
                                    ),
                                )
                            }
                            className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

            {/* ========================= */}
            {/* ON TRAVEL */}
            {/* ========================= */}
            <div className="bg-white rounded-2xl shadow p-4 flex flex-col justify-between">
                <h2 className="flex justify-between items-center text-sm font-semibold mb-3">
                    🟣 ON TRAVEL
                    <span className="bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full">
                        {onTravelUsers.length}
                    </span>
                </h2>

                <div className="space-y-2">
                    {paginatedTravelUsers.length === 0 ? (
                        <p className="text-xs text-gray-400 text-center">
                            No employees
                        </p>
                    ) : (
                        paginatedTravelUsers.map((user) => (
                            <div
                                key={user.employee_id}
                                className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg text-xs border-l-4 border-purple-500"
                            >
                                <div className="flex min-w-0 items-center gap-2">
                                    <EmployeeAvatar
                                        employee={user}
                                        name={user.name}
                                        className="h-6 w-6"
                                    />
                                    <span className="truncate">
                                        {user.name}
                                    </span>
                                </div>

                                <span className="text-[10px] text-gray-400 truncate">
                                    {user.station}
                                </span>
                            </div>
                        ))
                    )}
                </div>

                {Math.ceil(onTravelUsers.length / sidePerPage) > 1 && (
                    <div className="flex justify-between items-center mt-3 text-xs">
                        <button
                            onClick={() =>
                                setTravelPage((p) => Math.max((p || 1) - 1, 1))
                            }
                            className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                        >
                            Prev
                        </button>

                        <span className="text-gray-500">
                            {safeTravelPage} /{" "}
                            {Math.ceil(onTravelUsers.length / sidePerPage)}
                        </span>

                        <button
                            onClick={() =>
                                setTravelPage((p) =>
                                    Math.min(
                                        (p || 1) + 1,
                                        Math.ceil(
                                            onTravelUsers.length / sidePerPage,
                                        ),
                                    ),
                                )
                            }
                            className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
