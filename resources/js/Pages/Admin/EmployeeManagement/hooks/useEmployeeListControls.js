import { useMemo } from "react";
import { buildPaginationItems } from "@/Components/PaginationMain";
import useEmployeeSearchSuggestions from "./useEmployeeSearchSuggestions";
import { sortAlphabetically } from "@/lib/utils";

export const formatWorkSchedule = (schedule) =>
    schedule?.name ||
    [schedule?.time_in, schedule?.time_out].filter(Boolean).join(" - ");

const useEmployeeListControls = ({
    applyFilters,
    offices,
    pagination,
    searchInput,
    setSearchInput,
}) => {
    const {
        searchBoxRef,
        setShowSuggestions,
        showSuggestions,
        suggestionMatches,
        suggestionsLoading,
    } = useEmployeeSearchSuggestions({
        enabled: Boolean(searchInput?.trim()),
        query: searchInput,
    });
    const officeItems = useMemo(
        () => [
            { id: "all", name: "All Offices" },
            ...sortAlphabetically(offices, "name"),
        ],
        [offices],
    );
    const currentPage = pagination?.current_page || 1;
    const totalPages = pagination?.last_page || 1;
    const pageNumbers = useMemo(
        () => buildPaginationItems(currentPage, totalPages),
        [currentPage, totalPages],
    );

    const handlePageChange = (page) => {
        if (page < 1 || page > totalPages) return;
        applyFilters({ pageValue: page });
    };

    const selectSuggestion = (emp, applySearch) => {
        setSearchInput(emp.label);
        applySearch(`${emp.id} ${emp.label}`);
        setShowSuggestions(false);
    };

    return {
        currentPage,
        handlePageChange,
        officeItems,
        pageNumbers,
        searchBoxRef,
        selectSuggestion,
        setShowSuggestions,
        showSuggestions,
        suggestionMatches,
        suggestionsLoading,
        totalPages,
    };
};

export default useEmployeeListControls;
