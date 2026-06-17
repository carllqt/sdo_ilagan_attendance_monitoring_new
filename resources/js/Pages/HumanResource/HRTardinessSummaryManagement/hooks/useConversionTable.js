import { useMemo } from "react";

import {
    getConversionPageCount,
    getVisibleConversionRows,
    hasHiddenConversionRows,
} from "../utils";
import useConversionEditModal from "./useConversionEditModal";
import useConversionTableAutoPager from "./useConversionTableAutoPager";
import useConversionTableRows from "./useConversionTableRows";

const useConversionTable = ({
    conversionHours = [],
    conversionMinutes = [],
    editConversionModal = null,
}) => {
    const { hourItems, minuteItems } = useConversionTableRows({
        conversionHours,
        conversionMinutes,
    });
    const hourPages = useMemo(
        () => getConversionPageCount(hourItems),
        [hourItems],
    );
    const minutePages = useMemo(
        () => getConversionPageCount(minuteItems),
        [minuteItems],
    );
    const hoursPage = useConversionTableAutoPager(hourPages);
    const minutesPage = useConversionTableAutoPager(minutePages);
    const editModal = useConversionEditModal(editConversionModal);

    const hourTable = useMemo(
        () => ({
            allItems: hourItems,
            hasMoreRows: hasHiddenConversionRows(hourItems),
            visibleItems: getVisibleConversionRows(hourItems, hoursPage),
        }),
        [hourItems, hoursPage],
    );
    const minuteTable = useMemo(
        () => ({
            allItems: minuteItems,
            hasMoreRows: hasHiddenConversionRows(minuteItems),
            visibleItems: getVisibleConversionRows(minuteItems, minutesPage),
        }),
        [minuteItems, minutesPage],
    );

    return {
        editModal,
        hourTable,
        hoursPage,
        minuteTable,
        minutesPage,
    };
};

export default useConversionTable;
