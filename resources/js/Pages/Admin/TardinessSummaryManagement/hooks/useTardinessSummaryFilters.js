import { useState } from "react";
import { router } from "@inertiajs/react";
import {
    allOfficesLabel,
    buildTardinessSummaryQuery,
    isAllOfficeValue,
} from "../utils";

const useTardinessSummaryFilters = ({
    currentPage,
    currentYear,
    isSchoolAdmin,
    office,
    offices,
    resolveVerificationStationName,
    search,
    verificationCurrentPage,
    year,
}) => {
    const [selectedOffice, setSelectedOffice] = useState(
        offices.find((item) => item.name === office)?.id || "all",
    );
    const [selectedYear, setSelectedYear] = useState(year || currentYear);
    const [searchInput, setSearchInput] = useState(search);
    const [summaryLoading, setSummaryLoading] = useState(false);
    const [verificationLoading, setVerificationLoading] = useState(false);

    const currentQuery = ({
        officeValue = selectedOffice,
        pageValue = currentPage,
        searchValue = searchInput,
        verificationPageValue = verificationCurrentPage,
        verificationStationValue = resolveVerificationStationName(),
        yearValue = selectedYear,
    } = {}) => {
        const matchedOffice = isAllOfficeValue(officeValue)
            ? { name: allOfficesLabel }
            : offices.find(
                  (item) => String(item.id) === String(officeValue),
              );

        return buildTardinessSummaryQuery({
            isSchoolAdmin,
            officeValue: matchedOffice?.name,
            pageValue,
            searchValue,
            verificationPageValue,
            verificationStationValue,
            yearValue,
        });
    };

    const reloadTardinessSummary = (query, only, options = {}) => {
        router.get(route("tardiness-summary"), query, {
            only,
            preserveState: true,
            preserveScroll: true,
            replace: true,
            ...options,
        });
    };

    const applyFilters = ({
        officeValue = selectedOffice,
        includePrint = false,
        pageValue = 1,
        searchValue = searchInput,
        yearValue = selectedYear,
    } = {}) => {
        if (summaryLoading) return;

        const only = ["summary", "office", "search", "year"];
        const yearChanged = String(yearValue) !== String(selectedYear);

        if (includePrint) {
            only.push("printSummary");
        }

        if (!isSchoolAdmin && yearChanged) {
            only.push("stationVerification", "verificationStationId");
        }

        const shouldLoadVerification =
            only.includes("stationVerification") ||
            only.includes("verificationStationId");

        reloadTardinessSummary(
            currentQuery({
                officeValue,
                pageValue,
                searchValue,
                yearValue,
            }),
            only,
            {
                onStart: () => {
                    setSummaryLoading(true);
                    if (shouldLoadVerification) {
                        setVerificationLoading(true);
                    }
                },
                onFinish: () => {
                    setSummaryLoading(false);
                    if (shouldLoadVerification) {
                        setVerificationLoading(false);
                    }
                },
            },
        );
    };

    const applySearch = (value) => {
        applyFilters({ searchValue: value });
    };

    const applyVerificationFilters = ({ pageValue = 1, stationValue } = {}) => {
        if (verificationLoading) return;

        const stationName = resolveVerificationStationName(stationValue);

        reloadTardinessSummary(
            currentQuery({
                pageValue: currentPage,
                verificationPageValue: pageValue,
                verificationStationValue: stationName,
            }),
            ["stationVerification", "verificationStationId"],
            {
                onStart: () => setVerificationLoading(true),
                onFinish: () => setVerificationLoading(false),
            },
        );
    };

    const loadPrintSummary = (options = {}) => {
        if (summaryLoading) return;

        reloadTardinessSummary(currentQuery(), ["printSummary"], options);
    };

    return {
        applyFilters,
        applySearch,
        applyVerificationFilters,
        loadPrintSummary,
        searchInput,
        selectedOffice,
        selectedYear,
        summaryLoading,
        verificationLoading,
        setSearchInput,
        setSelectedOffice,
        setSelectedYear,
    };
};

export default useTardinessSummaryFilters;
