import { useEffect, useRef, useState } from "react";
import axios from "axios";

const useConvertedEmployeeSuggestions = ({ searchInput, selectedYear }) => {
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestionMatches, setSuggestionMatches] = useState([]);
    const [suggestionsLoading, setSuggestionsLoading] = useState(false);
    const searchBoxRef = useRef(null);
    const suggestionRequestRef = useRef(0);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                searchBoxRef.current &&
                !searchBoxRef.current.contains(event.target)
            ) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (!showSuggestions) {
            setSuggestionMatches([]);
            setSuggestionsLoading(false);
            return;
        }

        const query = searchInput.trim();

        if (!query) {
            setSuggestionMatches([]);
            setSuggestionsLoading(false);
            return;
        }

        setSuggestionsLoading(true);
        const requestId = suggestionRequestRef.current + 1;
        suggestionRequestRef.current = requestId;

        const timeout = setTimeout(() => {
            axios
                .get(route("converted-tardiness-record.suggestions"), {
                    params: {
                        search: query,
                        year: selectedYear,
                    },
                })
                .then((response) => {
                    if (suggestionRequestRef.current !== requestId) return;
                    setSuggestionMatches(response.data || []);
                })
                .catch(() => {
                    if (suggestionRequestRef.current !== requestId) return;
                    setSuggestionMatches([]);
                })
                .finally(() => {
                    if (suggestionRequestRef.current !== requestId) return;
                    setSuggestionsLoading(false);
                });
        }, 250);

        return () => clearTimeout(timeout);
    }, [searchInput, selectedYear, showSuggestions]);

    return {
        searchBoxRef,
        setShowSuggestions,
        showSuggestions,
        suggestionMatches,
        suggestionsLoading,
    };
};

export default useConvertedEmployeeSuggestions;
