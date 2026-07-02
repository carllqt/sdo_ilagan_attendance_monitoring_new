import { getEmployeeName } from "@/lib/utils";
import useStationAdminModalActions from "./useStationAdminModalActions";
import useStationAdminRows from "./useStationAdminRows";
import useStationAdminSuggestions from "./useStationAdminSuggestions";

const useStationAdminList = ({
    adminLimit,
    highlightedStationId,
    highlightRequestKey,
    search,
    stationRows,
}) => {
    const rowControls = useStationAdminRows({
        adminLimit,
        highlightedStationId,
        highlightRequestKey,
        search,
        stationRows,
    });
    const suggestionControls = useStationAdminSuggestions({
        searchTerm: rowControls.searchTerm,
    });
    const modalActions = useStationAdminModalActions();

    const selectSuggestion = (suggestion) => {
        if (rowControls.isLoading) return;

        const nextValue = suggestion.search || suggestion.label || "";
        rowControls.setSearchTerm(nextValue);
        suggestionControls.setShowSuggestions(false);
        rowControls.submitSearch(nextValue);
    };

    return {
        ...rowControls,
        ...suggestionControls,
        ...modalActions,
        getEmployeeName,
        selectSuggestion,
    };
};

export default useStationAdminList;

