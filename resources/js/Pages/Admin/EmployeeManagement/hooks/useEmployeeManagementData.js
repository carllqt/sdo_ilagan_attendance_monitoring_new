import { useMemo } from "react";
import { extractEmployeeRows } from "../utils";
import { sortAlphabetically, sortEmployeesAlphabetically } from "@/lib/utils";

const useEmployeeManagementData = ({
    filteredEmployeesList,
    offices,
    stations,
}) => {
    const filteredEmployees = useMemo(
        () =>
            sortEmployeesAlphabetically(
                extractEmployeeRows(filteredEmployeesList),
            ),
        [filteredEmployeesList],
    );

    const sortedOffices = useMemo(
        () => sortAlphabetically(offices, "name"),
        [offices],
    );

    const sortedStations = useMemo(
        () => sortAlphabetically(stations || [], "name"),
        [stations],
    );

    return {
        filteredEmployees,
        sortedOffices,
        sortedStations,
    };
};

export default useEmployeeManagementData;
