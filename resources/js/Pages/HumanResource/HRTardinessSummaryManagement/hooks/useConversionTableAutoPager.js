import { useEffect, useState } from "react";

import { CONVERSION_SLIDE_INTERVAL_MS } from "../utils";

const useConversionTableAutoPager = (pageCount) => {
    const [pageIndex, setPageIndex] = useState(0);

    useEffect(() => {
        setPageIndex(0);
    }, [pageCount]);

    useEffect(() => {
        if (pageCount <= 1) {
            return undefined;
        }

        const interval = window.setInterval(() => {
            setPageIndex((currentPage) => (currentPage + 1) % pageCount);
        }, CONVERSION_SLIDE_INTERVAL_MS);

        return () => window.clearInterval(interval);
    }, [pageCount]);

    return pageIndex;
};

export default useConversionTableAutoPager;
