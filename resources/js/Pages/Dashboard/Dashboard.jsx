import React, { useEffect, useState, useRef } from "react";
import { usePage } from "@inertiajs/react";

import Header from "./Partials/Header";
import MainContent from "./Partials/MainContent";
import RightPanels from "./Partials/RightPanel";

// =========================
// SAFE NORMALIZER
// =========================
const normalizeEmployee = (emp) => {
    if (!emp) return null;

    const fullName =
        typeof emp.name === "string"
            ? emp.name
            : typeof emp.full_name === "string"
              ? emp.full_name
              : [emp.first_name, emp.middle_name, emp.last_name]
                    .filter(Boolean)
                    .join(" ")
                    .replace(/\s+/g, " ")
                    .trim();

    return {
        employee_id: emp.id ?? emp.employee_id,
        name: fullName || `Employee #${emp.id || "Unknown"}`,
        station: emp.station?.name || "No Station",
    };
};

export default function Dashboard() {
    const { stations = [], attendances = [], employees = [], leaves = [] } = usePage().props;
    const stationList = ["All Stations", ...stations.map((s) => s.name)];
    console.log("EMPLOYEES FROM BACKEND:", employees);
    const [selectedStation, setSelectedStation] = useState("All Stations");
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");

    const [employeeSearch, setEmployeeSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const [slipPage, setSlipPage] = useState(1);
    const [travelPage, setTravelPage] = useState(1);

    const dropdownRef = useRef(null);
    const eventSourceRef = useRef(null);

    // =========================
    // CLOSE DROPDOWN
    // =========================
    useEffect(() => {
        function handleClickOutside(e) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target)
            ) {
                setOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const [users, setUsers] = useState([]);

    useEffect(() => {
        if (!employees || employees.length === 0) return;

        const grouped = new Map();

        // STEP 1: create ALL employees FIRST (important for absents)
        employees.forEach((emp) => {
        const id = emp.id;

        const fullName = [
            emp.first_name,
            emp.middle_name,
            emp.last_name,
        ]
            .filter(Boolean)
            .join(" ")
            .replace(/\s+/g, " ")
            .trim();

        // 🔥 FIND LEAVE FOR THIS EMPLOYEE
        const leave = leaves?.find((l) => l.employee_id === id);

        grouped.set(id, {
            id,
            employee_id: id,
            name: fullName || "Unknown",
            station: emp.station?.name || "No Station",

            am_in: "",
            am_out: "",
            pm_in: "",
            pm_out: "",

            // 🔥 THIS IS THE MISSING PIECE
            leave_type: leave?.leave_type || null,
        });
    });

        // STEP 2: merge attendance on top
        attendances.forEach((item) => {
            const emp = item.employee;
            if (!emp) return;

            const id = emp.id;

            const existing = grouped.get(id);

            if (!existing) return;

            grouped.set(id, {
                ...existing,
                am_in: item.am?.am_time_in ?? existing.am_in,
                am_out: item.am?.am_time_out ?? existing.am_out,
                pm_in: item.pm?.pm_time_in ?? existing.pm_in,
                pm_out: item.pm?.pm_time_out ?? existing.pm_out,
            });
        });

        setUsers([...grouped.values()]);
    }, [attendances, employees]);

    useEffect(() => {
        const eventSource = new EventSource("http://127.0.0.1:5000/bioLogin");
        eventSourceRef.current = eventSource;

        eventSource.onmessage = (event) => {
            try {
                const dataStr = event.data.startsWith("data:")
                    ? event.data.slice(5)
                    : event.data;

                const data = JSON.parse(dataStr);

                if (!data.success || !data.employee) return;

                const now = new Date();
                const timeStr = now.toTimeString().split(" ")[0];

                const emp = data.employee;
                const id = emp.id;

                const fullName = [
                    emp.first_name,
                    emp.middle_name,
                    emp.last_name,
                ]
                    .filter(Boolean)
                    .join(" ")
                    .replace(/\s+/g, " ")
                    .trim();

                setUsers((prev) => {
                    const updated = [...prev];

                    const index = updated.findIndex(
                        (u) => u.employee_id === id,
                    );

                    if (index !== -1) {
                        // UPDATE EXISTING USER
                        const user = { ...updated[index] };

                        if (data.session === "AM") {
                            if (data.action === "time-in") user.am_in = timeStr;
                            if (data.action === "time-out")
                                user.am_out = timeStr;
                        } else {
                            if (data.action === "time-in") user.pm_in = timeStr;
                            if (data.action === "time-out")
                                user.pm_out = timeStr;
                        }

                        updated[index] = user;
                    } else {
                        // ADD NEW USER
                        updated.push({
                            id: id,
                            employee_id: id,
                            name: fullName,
                            station: emp.station?.name || "No Station",
                            am_in:
                                data.session === "AM" &&
                                data.action === "time-in"
                                    ? timeStr
                                    : "",
                            am_out:
                                data.session === "AM" &&
                                data.action === "time-out"
                                    ? timeStr
                                    : "",
                            pm_in:
                                data.session === "PM" &&
                                data.action === "time-in"
                                    ? timeStr
                                    : "",
                            pm_out:
                                data.session === "PM" &&
                                data.action === "time-out"
                                    ? timeStr
                                    : "",
                        });
                    }

                    return updated;
                });
            } catch (err) {
                console.error("Dashboard SSE error:", err);
            }
        };

        eventSource.onerror = () => {
            console.error("SSE connection lost. Reconnecting...");
            eventSource.close();
            setTimeout(() => {
                eventSourceRef.current = null;
            }, 3000);
        };

        return () => {
            eventSource.close();
        };
    }, []);
    
    const syncLeave = (employeeId, leaveType) => {
        setUsers((prev) =>
            prev.map((u) =>
                u.employee_id === employeeId
                    ? { ...u, leave_type: leaveType }
                    : u
            )
        );
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Header
                {...{
                    selectedStation,
                    setSelectedStation,
                    open,
                    setOpen,
                    search,
                    setSearch,
                    dropdownRef,
                    stationList,
                    users,
                }}
            />

            <div className="p-6 grid lg:grid-cols-4 gap-4">
                <MainContent
                    {...{
                        users,
                        employees,
                        selectedStation,
                        employeeSearch,
                        setEmployeeSearch,
                        currentPage,
                        setCurrentPage,
                        syncLeave,
                    }}
                />

                <RightPanels
                    {...{
                        users,
                        employees,
                        selectedStation,
                        slipPage,
                        setSlipPage,
                        travelPage,
                        setTravelPage,
                    }}
                />
            </div>
        </div>
    );
}
