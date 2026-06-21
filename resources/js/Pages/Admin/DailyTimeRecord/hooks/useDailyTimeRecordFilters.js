import { useEffect, useState } from "react";
import { router } from "@inertiajs/react";
import { formatSearchDisplay } from "../utils";

const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

const monthQueryValue = (month) =>
    monthNames[Number(month) - 1] || monthNames[new Date().getMonth()];

const useDailyTimeRecordFilters = ({
    currentMonth,
    currentYear,
    limit,
    office,
    offices,
    search,
}) => {
    const [searchInput, setSearchInput] = useState(
        formatSearchDisplay(search),
    );
    const [selectedOffice, setSelectedOffice] = useState(office || "all");
    const [selectedMonth, setSelectedMonth] = useState(Number(currentMonth));
    const [selectedYear, setSelectedYear] = useState(String(currentYear));
    const [recordsLoading, setRecordsLoading] = useState(false);

    useEffect(() => {
        setSearchInput(formatSearchDisplay(search));
        const matchedOffice = offices.find((item) => item.name === office);

        setSelectedOffice(
            office === "all" ? "all" : matchedOffice?.id || "all",
        );
        setSelectedMonth(Number(currentMonth));
        setSelectedYear(String(currentYear));
    }, [search, office, offices, currentMonth, currentYear]);

    const applyFilters = ({
        searchValue = searchInput,
        officeValue = selectedOffice,
        monthValue = selectedMonth,
        yearValue = selectedYear,
        pageValue,
        limitValue = limit,
    } = {}) => {
        const query = {
            limit: limitValue,
            month: monthQueryValue(monthValue),
            year: yearValue,
        };

        if (searchValue && searchValue.trim()) {
            query.search = searchValue.trim();
        }

        const matchedOffice = offices.find(
            (item) => Number(item.id) === Number(officeValue),
        );

        if (matchedOffice) {
            query.office = matchedOffice.name;
        }

        if (pageValue && pageValue > 1) {
            query.page = pageValue;
        }

        router.get(route("daily-time-record"), query, {
            only: [
                "time_record",
                "tardiness_status",
                "search",
                "office",
                "month",
                "year",
                "limit",
            ],
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onStart: () => setRecordsLoading(true),
            onFinish: () => setRecordsLoading(false),
        });
    };

    return {
        applyFilters,
        recordsLoading,
        searchInput,
        selectedMonth,
        selectedOffice,
        selectedYear,
        setSearchInput,
        setSelectedMonth,
        setSelectedOffice,
        setSelectedYear,
    };
};

export default useDailyTimeRecordFilters;

