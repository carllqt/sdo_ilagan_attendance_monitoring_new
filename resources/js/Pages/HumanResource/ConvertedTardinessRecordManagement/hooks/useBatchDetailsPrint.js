import { useMemo, useRef } from "react";
import { useReactToPrint } from "react-to-print";

import documentTemplatePageStyle from "@/Components/Reports/documentTemplatePageStyle";
import { getEmployeeName } from "@/lib/utils";
import { toBatchReportRecords } from "../utils";

const useBatchDetailsPrint = (batch) => {
    const printRef = useRef(null);
    const printBatch = useReactToPrint({
        contentRef: printRef,
        documentTitle: "Converted_Tardiness_Records",
        pageStyle: documentTemplatePageStyle,
    });
    const reportRecords = useMemo(
        () => toBatchReportRecords(batch, getEmployeeName),
        [batch],
    );

    const handlePrint = () => {
        if (!printRef.current || reportRecords.length === 0) {
            return;
        }

        printBatch();
    };

    return {
        handlePrint,
        printRef,
        reportRecords,
    };
};

export default useBatchDetailsPrint;
