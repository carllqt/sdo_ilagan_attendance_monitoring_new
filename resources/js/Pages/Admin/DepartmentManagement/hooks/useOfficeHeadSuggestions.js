import { useEffect, useRef, useState } from "react";
import axios from "axios";

const useOfficeHeadSuggestions = ({ searchInput }) => {
    const [suggestions, setSuggestions] = useState([]);
    const [suggestionsLoading, setSuggestionsLoading] = useState(false);
    const requestRef = useRef(0);

    useEffect(() => {
        const query = searchInput.trim();

        if (!query) {
            setSuggestions([]);
            setSuggestionsLoading(false);
            return;
        }

        setSuggestionsLoading(true);
        const requestId = requestRef.current + 1;
        requestRef.current = requestId;

        const timeout = setTimeout(() => {
            axios
                .get(route("department.office-heads.suggestions"), {
                    params: { search: query },
                })
                .then((response) => {
                    if (requestRef.current !== requestId) return;

                    setSuggestions(response.data || []);
                })
                .catch(() => {
                    if (requestRef.current !== requestId) return;

                    setSuggestions([]);
                })
                .finally(() => {
                    if (requestRef.current !== requestId) return;

                    setSuggestionsLoading(false);
                });
        }, 250);

        return () => clearTimeout(timeout);
    }, [searchInput]);

    return {
        suggestions,
        suggestionsLoading,
    };
};

export default useOfficeHeadSuggestions;
