import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { sortAlphabetically } from "@/lib/utils";

const useStationAdminSuggestions = ({ searchTerm }) => {
    const [suggestionMatches, setSuggestionMatches] = useState([]);
    const [suggestionsLoading, setSuggestionsLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const suggestionRequestRef = useRef(0);
    const searchBoxRef = useRef(null);

    useEffect(() => {
        const query = searchTerm.trim();

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
                .get(route("stations.suggestions"), {
                    params: { search: query },
                })
                .then((response) => {
                    if (suggestionRequestRef.current !== requestId) return;

                    setSuggestionMatches(
                        sortAlphabetically(response.data || [], "name").map(
                            (station) => ({
                                id: `${station.source || "station"}:${
                                    station.record_id || station.id
                                }`,
                                label: station.name,
                                meta: station.code
                                    ? `${station.code}`
                                    : "No code",
                                search: station.name,
                            }),
                        ),
                    );
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

        return () => {
            clearTimeout(timeout);
        };
    }, [searchTerm]);

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

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return {
        searchBoxRef,
        setShowSuggestions,
        showSuggestions,
        suggestionMatches,
        suggestionsLoading,
    };
};

export default useStationAdminSuggestions;
