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

const travelOrderEmployeeSortName = (travelOrder) =>
    [
        travelOrder.employee?.first_name,
        travelOrder.employee?.middle_name,
        travelOrder.employee?.last_name,
        travelOrder.employee?.id,
    ]
        .filter(Boolean)
        .join(" ");

const useAttendanceManagementData = ({
    employeeTravelOrders = {},
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

    const sortedEmployeeTravelOrders = useMemo(
        () => ({
            ...employeeTravelOrders,
            data: sortAlphabetically(
                employeeTravelOrders.data || [],
                travelOrderEmployeeSortName,
            ),
        }),
        [employeeTravelOrders],
    );

    const sortedOffices = useMemo(
        () => sortAlphabetically(offices, "name"),
        [offices],
    );

    const yearOptions = useMemo(() => years.map(String), [years]);

    return {
        sortedEmployeeTravelOrders,
        sortedIncompleteAttendances,
        sortedOffices,
        yearOptions,
    };
};

export default useAttendanceManagementData;
