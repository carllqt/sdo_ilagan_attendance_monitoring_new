import { useMemo } from "react";
import { sortAlphabetically } from "@/lib/utils";
import {
    allOfficesLabel,
    extractSummaryRows,
    getCurrentYear,
    getPaginationMeta,
    getVerificationStationName,
} from "../utils";

const useTardinessSummaryPageData = ({
    officeOptions,
    stationVerification,
    summary,
    verificationStationId,
    verificationStations,
    yearOptions,
}) => {
    const currentYear = getCurrentYear();
    const offices = useMemo(
        () =>
            [
                { id: "all", name: allOfficesLabel },
                ...sortAlphabetically(officeOptions, "name"),
            ],
        [officeOptions],
    );
    const years = useMemo(
        () => (yearOptions.length ? yearOptions.map(String) : [currentYear]),
        [currentYear, yearOptions],
    );
    const summaryPagination = useMemo(
        () => getPaginationMeta(summary),
        [summary],
    );
    const verificationPagination = useMemo(
        () => getPaginationMeta(stationVerification),
        [stationVerification],
    );
    const resolveVerificationStationName = (
        stationId = verificationStationId,
    ) =>
        getVerificationStationName({
            stationId,
            stations: verificationStations,
        });

    return {
        currentYear,
        filteredSummary: extractSummaryRows(summary),
        offices,
        resolveVerificationStationName,
        summaryPagination,
        verificationPagination,
        years,
    };
};

export default useTardinessSummaryPageData;
