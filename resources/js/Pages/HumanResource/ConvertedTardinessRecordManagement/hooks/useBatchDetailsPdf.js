import { useMemo, useRef } from "react";
import { useReactToPrint } from "react-to-print";

import { getEmployeeName } from "@/lib/utils";
import { toBatchReportRecords } from "../utils";

const useBatchDetailsPdf = (batch) => {
    const pdfRef = useRef(null);
    const printBatch = useReactToPrint({
        contentRef: pdfRef,
        documentTitle: "Converted_Tardiness_Records",
        pageStyle: "@page { size: letter portrait; margin: 0.5in; }",
    });
    const reportRecords = useMemo(
        () => toBatchReportRecords(batch, getEmployeeName),
        [batch],
    );

    const handlePrintPDF = () => {
        if (!pdfRef.current || reportRecords.length === 0) {
            return;
        }

        printBatch();
    };

    return {
        handlePrintPDF,
        pdfRef,
        reportRecords,
    };
};

export default useBatchDetailsPdf;
