import { useMemo, useRef } from "react";
import html2pdf from "html2pdf.js";

import useToastResponse from "@/hooks/useToastResponse";
import useTardinessConvertionFilters from "./useTardinessConvertionFilters";
import useTardinessConvertionSuggestions from "./useTardinessConvertionSuggestions";
import {
    getSortedOffices,
    getTardinessConvertionFilename,
} from "../utils";

const useTardinessConvertionManagement = ({
    monthList,
    office,
    officeOptions,
    records,
    search,
    selectedFirstMonth,
    selectedSecondMonth,
}) => {
    useToastResponse();

    const pdfRef = useRef();
    const offices = useMemo(
        () => getSortedOffices(officeOptions),
        [officeOptions],
    );
    const filters = useTardinessConvertionFilters({
        monthList,
        office,
        records,
        search,
        selectedFirstMonth,
        selectedSecondMonth,
    });
    const suggestions = useTardinessConvertionSuggestions({
        searchInput: filters.searchInput,
        selectedFirstMonth: filters.selectedFirstMonth,
        selectedSecondMonth: filters.selectedSecondMonth,
        selectedOffice: filters.selectedOffice,
    });

    const handleSuggestionSelect = (suggestion) => {
        const nextValue = suggestion.search || suggestion.label || "";

        filters.setSearchInput(nextValue);
        suggestions.setShowSuggestions(false);
        filters.applySearch(nextValue);
    };

    const handlePrintPDF = () => {
        const element = pdfRef.current;

        html2pdf()
            .set({
                margin: 0.5,
                filename: getTardinessConvertionFilename(
                    filters.monthRangeLabel,
                ),
                image: { type: "jpeg", quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: {
                    unit: "in",
                    format: "letter",
                    orientation: "portrait",
                },
            })
            .from(element)
            .save();
    };

    return {
        ...filters,
        handlePrintPDF,
        handleSuggestionSelect,
        offices,
        pdfRef,
        searchBoxRef: suggestions.searchBoxRef,
        setShowSuggestions: suggestions.setShowSuggestions,
        showSuggestions: suggestions.showSuggestions,
        suggestionMatches: suggestions.suggestionMatches,
        suggestionsLoading: suggestions.suggestionsLoading,
    };
};

export default useTardinessConvertionManagement;
