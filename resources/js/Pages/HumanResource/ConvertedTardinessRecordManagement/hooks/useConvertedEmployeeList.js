import { useEffect, useState } from "react";
import { router } from "@inertiajs/react";
import { buildConvertedTardinessQuery } from "../utils";

const useConvertedEmployeeList = ({
    records = {},
    search = "",
    year,
    years = [],
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [searchInput, setSearchInput] = useState(search || "");
    const [selectedYear, setSelectedYear] = useState(year || years[0] || "");
    const recordItems = records?.data || [];
    const skeletonRows = Math.max(
        5,
        Math.min(Number(records?.per_page || 10), 10),
    );
    const yearOptions = (years.length > 0 ? years : [year])
        .filter(Boolean)
        .map(String);

    useEffect(() => {
        setSearchInput(search || "");
    }, [search]);

    useEffect(() => {
        setSelectedYear(year || years[0] || "");
    }, [year, years]);

    const applyFilters = ({
        page = 1,
        limit = records?.per_page || 10,
        searchValue = searchInput,
        yearValue = selectedYear,
    } = {}) => {
        router.get(
            route("converted-tardiness-record"),
            buildConvertedTardinessQuery({
                batch_id: null,
                batch_page: 1,
                limit,
                page,
                search: searchValue,
                year: yearValue,
            }),
            {
                only: [
                    "records",
                    "batchHistory",
                    "search",
                    "year",
                    "years",
                    "selectedBatch",
                ],
                preserveState: true,
                preserveScroll: true,
                replace: true,
                onStart: () => setIsLoading(true),
                onFinish: () => setIsLoading(false),
            },
        );
    };
    const handlePageChange = (page) => applyFilters({ page });

    const applySearch = () => applyFilters({ page: 1 });

    const handleYearChange = (nextYear) => {
        setSelectedYear(nextYear);
        applyFilters({ page: 1, yearValue: nextYear });
    };

    const selectSuggestion = (suggestion) => {
        const nextSearch = suggestion?.search || suggestion?.label || "";

        setSearchInput(nextSearch);
        applyFilters({ page: 1, searchValue: nextSearch });
    };

    return {
        applySearch,
        handlePageChange,
        handleYearChange,
        isLoading,
        recordItems,
        skeletonRows,
        searchInput,
        selectedYear,
        selectSuggestion,
        setSearchInput,
        yearOptions,
    };
};

export default useConvertedEmployeeList;
