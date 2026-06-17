import { useEffect, useState } from "react";

import { sortByNumber } from "../utils";

const useConversionTableRows = ({
    conversionHours = [],
    conversionMinutes = [],
}) => {
    const [hourItems, setHourItems] = useState([]);
    const [minuteItems, setMinuteItems] = useState([]);

    useEffect(() => {
        setHourItems(sortByNumber(conversionHours, "hours"));
    }, [conversionHours]);

    useEffect(() => {
        setMinuteItems(sortByNumber(conversionMinutes, "minutes"));
    }, [conversionMinutes]);

    return {
        hourItems,
        minuteItems,
    };
};

export default useConversionTableRows;
