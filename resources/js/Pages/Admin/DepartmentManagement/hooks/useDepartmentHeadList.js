import { getEmployeeName } from "@/lib/utils";
import useDepartmentModalActions from "./useDepartmentModalActions";
import useOfficeHeadRows from "./useOfficeHeadRows";
import useOfficeHeadSuggestions from "./useOfficeHeadSuggestions";

const useDepartmentHeadList = ({
    officeHeadLimit,
    officeHeadRows,
    officeSearch,
    offices,
}) => {
    const rowControls = useOfficeHeadRows({
        officeHeadLimit,
        officeHeadRows,
        officeSearch,
    });
    const { suggestions, suggestionsLoading } = useOfficeHeadSuggestions({
        searchInput: rowControls.searchInput,
    });
    const modalActions = useDepartmentModalActions();

    return {
        ...rowControls,
        ...modalActions,
        getEmployeeName,
        suggestions,
        suggestionsLoading,
    };
};

export default useDepartmentHeadList;

