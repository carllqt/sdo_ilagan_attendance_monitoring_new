import { useEffect, useMemo, useState } from "react";
import { router } from "@inertiajs/react";

import {
    buildTardinessConversionQuery,
    buildSummaryPayload,
    getCurrentMonthLabel,
    getDefaultFirstMonth,
    getDefaultSecondMonth,
    getMonthRangeLabel,
    getNextEndMonth,
    getSecondMonthList,
} from "../utils";

const useTardinessConversionFilters = ({
    filteredSummaryPayload = [],
    monthList = [],
    office = "all",
    records = {},
    search = "",
    selectedFirstMonth: selectedFirstMonthProp,
    selectedSecondMonth: selectedSecondMonthProp,
}) => {
    const currentMonth = getCurrentMonthLabel();
    const [recordsLoading, setRecordsLoading] = useState(false);
    const [selectedFirstMonth, setSelectedFirstMonth] = useState(
        selectedFirstMonthProp || getDefaultFirstMonth(monthList, currentMonth),
    );
    const [selectedSecondMonth, setSelectedSecondMonth] = useState(
        selectedSecondMonthProp ||
            getDefaultSecondMonth(monthList, currentMonth),
    );
    const [selectedOffice, setSelectedOffice] = useState(office || "all");
    const [searchInput, setSearchInput] = useState(search || "");
    const groupedByEmployee = records?.data || [];

    useEffect(() => {
        setSelectedFirstMonth(
            selectedFirstMonthProp ||
                getDefaultFirstMonth(monthList, currentMonth),
        );
    }, [currentMonth, monthList, selectedFirstMonthProp]);

    useEffect(() => {
        setSelectedSecondMonth(
            selectedSecondMonthProp ||
                getDefaultSecondMonth(monthList, currentMonth),
        );
    }, [currentMonth, monthList, selectedSecondMonthProp]);

    useEffect(() => {
        setSelectedOffice(office || "all");
    }, [office]);

    useEffect(() => {
        setSearchInput(search || "");
    }, [search]);

    const monthRangeLabel = useMemo(
        () => getMonthRangeLabel(selectedFirstMonth, selectedSecondMonth),
        [selectedFirstMonth, selectedSecondMonth],
    );

    const secondMonthList = useMemo(
        () => getSecondMonthList(monthList, selectedFirstMonth),
        [monthList, selectedFirstMonth],
    );

    const summaryPayload = useMemo(
        () =>
            filteredSummaryPayload.length > 0
                ? filteredSummaryPayload
                : buildSummaryPayload(groupedByEmployee),
        [filteredSummaryPayload, groupedByEmployee],
    );

    const applyFilters = ({
        startMonthValue = selectedFirstMonth,
        endMonthValue = selectedSecondMonth,
        officeValue = selectedOffice,
        pageValue = 1,
        limitValue = records?.per_page || 10,
        searchValue = searchInput,
    } = {}) => {
        router.get(
            route("tardiness-conversion"),
            buildTardinessConversionQuery({
                endMonthValue,
                limitValue,
                officeValue,
                pageValue,
                searchValue,
                startMonthValue,
            }),
            {
                only: [
                    "records",
                    "summaryPayload",
                    "printRecords",
                    "monthList",
                    "office",
                    "search",
                    "selectedFirstMonth",
                    "selectedSecondMonth",
                ],
                onStart: () => setRecordsLoading(true),
                onFinish: () => setRecordsLoading(false),
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const handleOfficeChange = (value) => {
        setSelectedOffice(value);
        applyFilters({
            officeValue: value,
            startMonthValue: null,
            endMonthValue: null,
        });
    };

    const handleFirstMonthChange = (value) => {
        const nextEndMonth = getNextEndMonth(selectedSecondMonth, value);

        setSelectedFirstMonth(value);
        setSelectedSecondMonth(nextEndMonth);
        applyFilters({
            startMonthValue: value,
            endMonthValue: nextEndMonth,
        });
    };

    const handleSecondMonthChange = (value) => {
        setSelectedSecondMonth(value);
        applyFilters({ endMonthValue: value });
    };

    const applySearch = (value) => {
        applyFilters({ searchValue: value });
    };

    const handlePageChange = (page) => applyFilters({ pageValue: page });

    return {
        applySearch,
        groupedByEmployee,
        handleFirstMonthChange,
        handleOfficeChange,
        handlePageChange,
        handleSecondMonthChange,
        isLoading: recordsLoading,
        monthRangeLabel,
        searchInput,
        secondMonthList,
        selectedFirstMonth,
        selectedOffice,
        selectedSecondMonth,
        setSearchInput,
        summaryPayload,
    };
};

export default useTardinessConversionFilters;
