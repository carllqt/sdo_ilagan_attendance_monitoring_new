import { useMemo } from "react";
import { sortAlphabetically } from "@/lib/utils";

const attendanceEmployeeSortName = (attendance) =>
    [
        attendance.employee?.first_name,
        attendance.employee?.middle_name,
        attendance.employee?.last_name,
        attendance.employee?.id,
    ]
        .filter(Boolean)
        .join(" ");

const useAttendanceManagementData = ({
    incompleteAttendances = {},
    offices = [],
    years = [],
}) => {
    const sortedIncompleteAttendances = useMemo(
        () => ({
            ...incompleteAttendances,
            data: sortAlphabetically(
                incompleteAttendances.data || [],
                attendanceEmployeeSortName,
            ),
        }),
        [incompleteAttendances],
    );

    const sortedOffices = useMemo(
        () => sortAlphabetically(offices, "name"),
        [offices],
    );

    const yearOptions = useMemo(() => years.map(String), [years]);

    return {
        sortedIncompleteAttendances,
        sortedOffices,
        yearOptions,
    };
};

export default useAttendanceManagementData;
