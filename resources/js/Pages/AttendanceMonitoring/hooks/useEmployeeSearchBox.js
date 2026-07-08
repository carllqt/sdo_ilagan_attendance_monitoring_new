import useSearchSuggestions from "./useSearchSuggestions";

export default function useEmployeeSearchBox({
    search,
    selectedStationCode,
    selectedStationName,
    setSearch,
    submitSearch,
}) {
    const suggestions = useSearchSuggestions({
        query: search,
        routeName: "attendance-monitoring.employees.suggestions",
        params: {
            station_code: selectedStationCode,
            station_name: selectedStationName,
        },
    });

    const selectSuggestion = (suggestion) => {
        const nextValue = suggestion.name || "";

        setSearch(nextValue);
        suggestions.setShowSuggestions(false);
        submitSearch(nextValue);
    };

    const clearSearch = () => {
        setSearch("");
        suggestions.setSuggestionMatches([]);
        suggestions.setShowSuggestions(false);
        submitSearch("");
    };

    const submitCurrentSearch = (event) => {
        event.preventDefault();
        submitSearch(search);
        suggestions.setShowSuggestions(false);
    };

    const changeSearch = (event) => {
        setSearch(event.target.value);
        suggestions.setShowSuggestions(true);
    };

    const submitOnEnter = (event) => {
        if (event.key !== "Enter") return;

        event.preventDefault();
        submitSearch(search);
        suggestions.setShowSuggestions(false);
    };

    return {
        ...suggestions,
        changeSearch,
        clearSearch,
        selectSuggestion,
        submitCurrentSearch,
        submitOnEnter,
    };
}
