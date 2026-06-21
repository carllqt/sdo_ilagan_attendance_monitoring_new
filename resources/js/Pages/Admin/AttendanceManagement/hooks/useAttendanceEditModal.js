import { useEffect, useState } from "react";
import { router } from "@inertiajs/react";
import { getEmployeeName } from "@/lib/utils";

const useAttendanceEditModal = (editAttendanceModal) => {
    const [editAttendance, setEditAttendance] = useState(editAttendanceModal);

    useEffect(() => {
        setEditAttendance(editAttendanceModal);
    }, [editAttendanceModal]);

    const handleEdit = (attendance) => {
        const params = new URLSearchParams(window.location.search);

        params.set("modal", "edit");
        params.set("attendance_id", attendance.id);
        params.set("name", getEmployeeName(attendance.employee));

        router.get(
            route("attendance-management"),
            Object.fromEntries(params),
            {
                only: ["editAttendanceModal"],
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const closeEditAttendanceModal = () => {
        const params = new URLSearchParams(window.location.search);

        params.delete("modal");
        params.delete("attendance_id");
        params.delete("name");

        router.get(
            route("attendance-management"),
            Object.fromEntries(params),
            {
                only: ["editAttendanceModal"],
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    return {
        closeEditAttendanceModal,
        editAttendance,
        handleEdit,
        setEditAttendance,
    };
};

export default useAttendanceEditModal;
