import { useMemo, useRef } from "react";
import { useReactToPrint } from "react-to-print";

import documentTemplatePageStyle from "@/Components/Reports/documentTemplatePageStyle";
import useToastResponse from "@/hooks/useToastResponse";
import useTardinessConversionFilters from "./useTardinessConversionFilters";
import useTardinessConversionSuggestions from "./useTardinessConversionSuggestions";
import {
    getSortedOffices,
} from "../utils";

const useTardinessConversionManagement = ({
    filteredSummaryPayload = [],
    monthList,
    office,
    officeOptions,
    records,
    search,
    selectedFirstMonth,
    selectedSecondMonth,
}) => {
    useToastResponse();

    const printRef = useRef();
    const printSummary = useReactToPrint({
        contentRef: printRef,
        documentTitle: "Tardiness_Conversion",
        pageStyle: documentTemplatePageStyle,
    });
    const offices = useMemo(
        () => getSortedOffices(officeOptions),
        [officeOptions],
    );
    const filters = useTardinessConversionFilters({
        filteredSummaryPayload,
        monthList,
        office,
        offices,
        records,
        search,
        selectedFirstMonth,
        selectedSecondMonth,
    });
    const suggestions = useTardinessConversionSuggestions({
        searchInput: filters.searchInput,
        selectedFirstMonth: filters.selectedFirstMonth,
        selectedSecondMonth: filters.selectedSecondMonth,
        selectedOffice: filters.selectedOffice,
    });

    const handleSuggestionSelect = (suggestion) => {
        if (filters.isLoading) return;

        const nextValue = suggestion.search || suggestion.label || "";

        filters.setSearchInput(nextValue);
        suggestions.setShowSuggestions(false);
        filters.applySearch(nextValue);
    };

    const handlePrint = () => {
        printSummary();
    };

    return {
        ...filters,
        handlePrint,
        handleSuggestionSelect,
        offices,
        printRef,
        searchBoxRef: suggestions.searchBoxRef,
        setShowSuggestions: suggestions.setShowSuggestions,
        showSuggestions: suggestions.showSuggestions,
        suggestionMatches: suggestions.suggestionMatches,
        suggestionsLoading: suggestions.suggestionsLoading,
    };
};

export default useTardinessConversionManagement;
