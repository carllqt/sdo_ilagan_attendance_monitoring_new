import { useMemo } from "react";

import {
    getConvertionPageCount,
    getVisibleConvertionRows,
    hasHiddenConvertionRows,
} from "../utils";
import useConvertionEditModal from "./useConvertionEditModal";
import useConvertionTableAutoPager from "./useConvertionTableAutoPager";
import useConvertionTableRows from "./useConvertionTableRows";

const useConvertionTable = ({
    conversionHours = [],
    conversionMinutes = [],
    editConvertionModal = null,
}) => {
    const { hourItems, minuteItems } = useConvertionTableRows({
        conversionHours,
        conversionMinutes,
    });
    const hourPages = useMemo(
        () => getConvertionPageCount(hourItems),
        [hourItems],
    );
    const minutePages = useMemo(
        () => getConvertionPageCount(minuteItems),
        [minuteItems],
    );
    const hoursPage = useConvertionTableAutoPager(hourPages);
    const minutesPage = useConvertionTableAutoPager(minutePages);
    const editModal = useConvertionEditModal(editConvertionModal);

    const hourTable = useMemo(
        () => ({
            allItems: hourItems,
            hasMoreRows: hasHiddenConvertionRows(hourItems),
            visibleItems: getVisibleConvertionRows(hourItems, hoursPage),
        }),
        [hourItems, hoursPage],
    );
    const minuteTable = useMemo(
        () => ({
            allItems: minuteItems,
            hasMoreRows: hasHiddenConvertionRows(minuteItems),
            visibleItems: getVisibleConvertionRows(minuteItems, minutesPage),
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

export default useConvertionTable;
