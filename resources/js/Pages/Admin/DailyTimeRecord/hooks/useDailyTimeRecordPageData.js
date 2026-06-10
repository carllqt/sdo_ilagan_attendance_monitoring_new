import { useMemo } from "react";
import { extractTimeRecordEmployees, resolveCurrentDateParts } from "../utils";
import {
    sortAlphabetically,
    sortEmployeesAlphabetically,
} from "@/lib/utils";

const useDailyTimeRecordPageData = ({ month, offices, timeRecord, year }) => {
    const { currentMonth, currentYear } = resolveCurrentDateParts({
        month,
        year,
    });
    const employees = useMemo(
        () =>
            sortEmployeesAlphabetically(
                extractTimeRecordEmployees(timeRecord),
            ),
        [timeRecord],
    );
    const sortedOffices = useMemo(
        () => sortAlphabetically(offices, "name"),
        [offices],
    );

    return {
        currentMonth,
        currentYear,
        employees,
        sortedOffices,
    };
};

export default useDailyTimeRecordPageData;
